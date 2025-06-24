import { getLatestMovies, getMoviesList } from '@/lib/api';
import HeroSection from '@/components/shared/HeroSection';
import MovieCarousel from '@/components/shared/MovieCarousel';

export default async function Home() {
  const latestMovies = await getLatestMovies();
  const featuredMovies = latestMovies.items.slice(0, 5);
  const newMovies = latestMovies.items.slice(5);
  
  // Lấy danh sách phim lẻ mới nhất
  const singleMovies = await getMoviesList('phim-le', { limit: 12 });
  
  // Lấy danh sách phim bộ mới nhất
  const seriesMovies = await getMoviesList('phim-bo', { limit: 12 });
  
  // Lấy danh sách TV Shows
  const tvShows = await getMoviesList('tv-shows', { limit: 12 });

  return (
    <main className="min-h-screen bg-[#121212]">
      <HeroSection movies={featuredMovies} />
      
      <div className="container mx-auto px-4 py-8">
        <MovieCarousel title="Phim Mới Cập Nhật" movies={newMovies} />
        <MovieCarousel title="Phim Lẻ Mới" movies={singleMovies.items} />
        <MovieCarousel title="Phim Bộ Mới" movies={seriesMovies.items} />
        <MovieCarousel title="TV Shows" movies={tvShows.items} />
      </div>
    </main>
  );
}