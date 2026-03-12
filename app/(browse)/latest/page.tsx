import { Metadata } from 'next';
import LatestMoviesList from '@/components/movies/LatestMoviesList';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { fetchLatestMovies } from '@/app/actions/movies';
import { thinMovieData } from '@/lib/api';

interface LatestMoviesPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Phim Mới Cập Nhật - PhimHayTV',
  description: 'Danh sách phim mới nhất, phim hay nhất, cập nhật liên tục tại PhimHayTV',
};

export default async function LatestMoviesPage({ searchParams }: LatestMoviesPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;

  const queryClient = new QueryClient();
  
  const moviesData = await fetchLatestMovies({ page, limit: 24 });
  const thinnedMoviesData = {
    ...moviesData,
    data: {
      ...moviesData.data,
      items: thinMovieData(moviesData.data.items)
    }
  };
  
  await queryClient.prefetchQuery({
    queryKey: ['latest-movies', { page, limit: 24 }],
    queryFn: () => Promise.resolve(thinnedMoviesData),
  });

  return (
    <main className="min-h-screen bg-[#121212] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-2">Phim Mới Cập Nhật</h1>
        <p className="text-gray-400 mb-6">Những bộ phim mới nhất từ khắp nơi trên thế giới, được cập nhật liên tục.</p>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <LatestMoviesList page={page} />
        </HydrationBoundary>
      </div>
    </main>
  );
}