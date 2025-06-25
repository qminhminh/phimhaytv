import { getLatestMovies } from '@/lib/api';
import { MetadataRoute } from 'next';

const BASE_URL = 'https://phimhaytv.top';
const MOVIES_PER_SITEMAP = 4000; 

export async function generateSitemaps() {
    // API phimhay.tv hiện tại không có endpoint để lấy tổng số phim,
    // nên chúng ta sẽ tạm giả định một con số đủ lớn để phân trang.
    // Giả sử có khoảng 20000 phim, chia thành các sitemap.
    const totalMovies = 20000; 
    const amountOfSitemaps = Math.ceil(totalMovies / MOVIES_PER_SITEMAP);

    const sitemaps = Array.from({ length: amountOfSitemaps }, (_, i) => ({ id: i }));
    
    return sitemaps;
}

async function getMoviesForSitemap(page: number, limit: number): Promise<MetadataRoute.Sitemap> {
    try {
        // Sử dụng hàm getLatestMovies, vì API không có endpoint "tất cả phim" ổn định
        const response = await getLatestMovies({ page, limit });
        if (response?.items) {
            return response.items.map((item: any) => {
                const path = item.type === 'single' ? 'movies' : 'tv-shows';
                return {
                    url: `${BASE_URL}/${path}/${item.slug}`,
                    lastModified: new Date(item.modified.time).toISOString(),
                    changeFrequency: 'weekly',
                    priority: 0.9,
                };
            });
        }
        return [];
    } catch (error) {
        console.error(`Error fetching movies for sitemap page ${page}:`, error);
        return [];
    }
}

// Sitemap cho các trang tĩnh sẽ được xử lý riêng
const staticSitemap: MetadataRoute.Sitemap = [
    '/',
    '/latest',
    '/movies',
    '/phim-le',
    '/phim-bo',
    '/tv-shows',
    '/hoat-hinh',
    '/phim-thuyet-minh',
    '/phim-long-tieng',
    '/vietsub',
    '/search',
    '/auth/login',
    '/auth/register',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.8,
}));

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
    
    // Sitemap cho trang tĩnh sẽ được Next.js tự động tạo tại /sitemap-static.xml
    // nếu chúng ta tạo một file sitemap-static.ts riêng.
    // Tuy nhiên, để đơn giản, ta sẽ trả về các trang phim ở đây.
    // Next.js v14 sẽ merge sitemap này với sitemap tĩnh được định nghĩa trong file khác.
    // Nhưng cách tiếp cận hiện tại là tạo file /sitemap.xml động cho phim.

    // ID từ generateSitemaps là số, nên ta ép kiểu trực tiếp.
    const pageNumber = id + 1; // id là 0-indexed, page của API là 1-indexed
    const movieRoutes = await getMoviesForSitemap(pageNumber, MOVIES_PER_SITEMAP);

    // Ở phiên bản Next.js mới, bạn có thể tạo một file app/static-sitemap.ts riêng.
    // Để giữ cho logic tập trung, ta sẽ kết hợp các trang tĩnh vào sitemap đầu tiên (id=0)
    if (id === 0) {
        return [...staticSitemap, ...movieRoutes];
    }
    
    return movieRoutes;
} 