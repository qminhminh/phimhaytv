import { getLatestMovies, getSingleMovies, getTVSeries, getVietSubMovies, getThuyetMinhMovies, getLongTiengMovies } from '@/lib/api';
import HeroSection from '@/components/shared/HeroSection';
import CardViewMovie from '@/components/shared/CardViewMovie';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PhimHayTV - Xem Phim Mới, Phim HD Online Miễn Phí',
  description: 'PhimHayTV là website xem phim online miễn phí, cập nhật các bộ phim mới, phim hot, phim chiếu rạp nhanh nhất với chất lượng HD, vietsub, thuyết minh.',
  openGraph: {
    title: 'PhimHayTV - Xem Phim Mới, Phim HD Online Miễn Phí',
    description: 'Xem phim online miễn phí, cập nhật phim mới, phim hot, phim chiếu rạp nhanh nhất.',
    images: ['/og-image.jpg'], // Bạn nên tạo một ảnh đại diện cho website và đặt trong thư mục public
    type: 'website',
  },
};

export default async function Home() {
  // Lấy dữ liệu phim tuần tự
  const latestMovies = await getLatestMovies();
  const singleMovies = await getSingleMovies({ limit: 12 });
  const seriesMovies = await getTVSeries({ limit: 12 });
  const tvShows = await getTVSeries({ limit: 12, filterType: ['tvshows'] });
  const vietsubMovies = await getVietSubMovies({ limit: 12 });
  const thuyetMinhMovies = await getThuyetMinhMovies({ limit: 12 });
  const longTiengMovies = await getLongTiengMovies({ limit: 12 });

  // Tách phim cho Hero Section và danh sách phim mới
  const featuredMovies = latestMovies.items.slice(0, 5);
  const newMovies = latestMovies.items.slice(5, 17);

  const imageDomain = singleMovies.data.APP_DOMAIN_CDN_IMAGE;

  return (
    <main className="min-h-screen bg-[#121212]">
      <h1 className="sr-only">PhimHayTV - Xem Phim Online, Phim Mới, Phim HD</h1>
      <HeroSection movies={featuredMovies} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#EAEAEA]">Phim Mới Cập Nhật</h2>
          <Link href="/latest" className="flex items-center text-sm text-primary hover:underline">
            Xem tất cả
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <CardViewMovie items={newMovies as any} imageDomain={imageDomain} />
        
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-bold text-[#EAEAEA]">Phim Lẻ Mới</h2>
          <Link href="/phim-le" className="flex items-center text-sm text-primary hover:underline">
            Xem tất cả
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <CardViewMovie items={singleMovies.data.items} imageDomain={imageDomain} />
        
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-bold text-[#EAEAEA]">Phim Bộ Mới</h2>
          <Link href="/phim-bo" className="flex items-center text-sm text-primary hover:underline">
            Xem tất cả
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <CardViewMovie items={seriesMovies.data.items} imageDomain={imageDomain} />

        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-bold text-[#EAEAEA]">TV Shows</h2>
          <Link href="/tv-shows" className="flex items-center text-sm text-primary hover:underline">
            Xem tất cả
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <CardViewMovie items={tvShows.data.items} imageDomain={imageDomain} />

        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-bold text-[#EAEAEA]">Phim Việt Sub</h2>
          <Link href="/vietsub" className="flex items-center text-sm text-primary hover:underline">
            Xem tất cả
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <CardViewMovie items={vietsubMovies.data.items} imageDomain={imageDomain} />

        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-bold text-[#EAEAEA]">Phim Thuyết Minh</h2>
          <Link href="/phim-thuyet-minh" className="flex items-center text-sm text-primary hover:underline">
            Xem tất cả
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <CardViewMovie items={thuyetMinhMovies.data.items} imageDomain={imageDomain} />

        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-bold text-[#EAEAEA]">Phim Lồng Tiếng</h2>
          <Link href="/phim-long-tieng" className="flex items-center text-sm text-primary hover:underline">
            Xem tất cả
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <CardViewMovie items={longTiengMovies.data.items} imageDomain={imageDomain} />
      </div>
    </main>
  );
}