import { getMoviesList } from '@/lib/api';
import { MetadataRoute } from 'next';

export const revalidate = 86400; // Tái xác thực mỗi ngày (86400 giây)

// interface này chỉ chứa các trường cần thiết cho sitemap để tránh lỗi type
interface SitemapMovieItem {
  _id: string;
  slug: string;
  type: string;
  modified: {
    time: string;
  };
}

// TODO: Thay thế 'https://yourdomain.com' bằng tên miền thực tế của bạn
const BASE_URL = 'https://phimhaytv.top';

const movieTypes = [
  'phim-le',
  'phim-bo',
  'tv-shows',
  'hoat-hinh',
  'phim-vietsub',
  'phim-thuyet-minh',
  'phim-long-tieng',
] as const;

type MovieType = typeof movieTypes[number];

async function getAllMovies(type: MovieType): Promise<SitemapMovieItem[]> {
  const movies: SitemapMovieItem[] = [];
  let currentPage = 1;
  let totalPages = 1;
  let retries = 3;

  do {
    try {
      // Giới hạn 50 mục mỗi trang để không quá tải API
      const response = await getMoviesList(type, { page: currentPage, limit: 50 });
      if (response.data && response.data.items && response.data.items.length > 0) {
        movies.push(...response.data.items);
        totalPages = response.data.params.pagination.totalPages;
        currentPage++;
        retries = 3; // Reset retries on success
      } else {
        break; // Thoát nếu không có mục nào được trả về
      }
    } catch (error) {
      console.error(`Lỗi khi tìm nạp trang ${currentPage} cho loại "${type}":`, error);
      retries--;
      if (retries <= 0) {
          console.error(`Bỏ qua loại "${type}" sau nhiều lần thử lại không thành công.`);
          break;
      }
      // Chờ một chút trước khi thử lại
      await new Promise(res => setTimeout(res, 1000));
    }
  } while (currentPage <= totalPages);

  return movies;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Các tuyến đường tĩnh
  const staticRoutes = [
    '/',
    '/latest',
    '/phim-le',
    '/phim-bo',
    '/tv-shows',
    '/hoat-hinh',
    '/phim-vietsub',
    '/phim-thuyet-minh',
    '/phim-long-tieng',
    '/search',
    '/auth/login',
    '/auth/register',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as 'daily',
    priority: 0.8,
  }));

  // 2. Các tuyến đường động (phim và chương trình TV)
  const allMoviesPromises = movieTypes.map(type => getAllMovies(type));
  const allMoviesArrays = await Promise.all(allMoviesPromises);
  const allItems = allMoviesArrays.flat();

  // Loại bỏ các mục trùng lặp bằng _id
  const uniqueItems = Array.from(new Map(allItems.map(item => [item._id, item])).values());

  const dynamicUrls = uniqueItems.map((item) => {
    const path = item.type === 'series' || item.type === 'tv_series' ? '/tv-shows' : '/movies';
    return {
      url: `${BASE_URL}${path}/${item.slug}`,
      lastModified: new Date(item.modified.time).toISOString(),
      changeFrequency: 'weekly' as 'weekly',
      priority: 1.0,
    };
  });

  return [...staticRoutes, ...dynamicUrls];
} 