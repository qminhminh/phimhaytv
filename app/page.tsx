import { getLatestMovies, getSingleMovies, getTVSeries, getVietSubMovies, getThuyetMinhMovies, getLongTiengMovies } from '@/lib/api';
import HeroSection from '@/components/shared/HeroSection';
import MovieCarousel from '@/components/shared/MovieCarousel';
import CardViewMovie from '@/components/shared/CardViewMovie';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default async function Home() {
  const latestMovies = await getLatestMovies();
  const featuredMovies = latestMovies.items.slice(0, 5);
  const newMovies = latestMovies.items.slice(5, 17);
  
  // Lấy danh sách phim lẻ mới nhất
  const singleMovies = await getSingleMovies({ limit: 12 });
  
  // Lấy danh sách phim bộ mới nhất
  const seriesMovies = await getTVSeries({ limit: 12 });
  
  // Lấy danh sách TV Shows - Giả sử TV Shows dùng chung API với phim bộ
  const tvShows = await getTVSeries({ limit: 12, filterType: ['tvshows'] });

  // Lấy danh sách phim Việt Sub
  const vietsubMovies = await getVietSubMovies({ limit: 12 });

  // Lấy danh sách phim Thuyết Minh
  const thuyetMinhMovies = await getThuyetMinhMovies({ limit: 12 });

  // Lấy danh sách phim Lồng Tiếng
  const longTiengMovies = await getLongTiengMovies({ limit: 12 });

  const imageDomain = singleMovies.data.APP_DOMAIN_CDN_IMAGE;

  return (
    <main className="min-h-screen bg-[#121212]">
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