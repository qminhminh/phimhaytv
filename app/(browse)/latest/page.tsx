import { Suspense } from 'react';
import { Metadata } from 'next';
import { getLatestMovies } from '@/lib/api';
import CardViewMovie from '@/components/shared/CardViewMovie';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

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

  const latestMoviesData = await getLatestMovies({ 
    page, 
    limit: 24
  });

  const items = latestMoviesData.data.items || [];
  const totalPages = latestMoviesData.data.params?.pagination?.totalPages || 1;
  
  const imageDomain = ''; // API mới trả về full URL, không cần domain

  return (
    <main className="min-h-screen bg-[#121212] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-2">Phim Mới Cập Nhật</h1>
        <p className="text-gray-400 mb-6">Những bộ phim mới nhất từ khắp nơi trên thế giới, được cập nhật liên tục.</p>

        <Suspense fallback={<MovieListSkeleton />}>
          <CardViewMovie items={items as any} imageDomain={imageDomain} />
        </Suspense>
        
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              baseUrl="/latest" 
            />
          </div>
        )}
      </div>
    </main>
  );
}

function MovieListSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 18 }).map((_, index) => (
        <div key={index} className="bg-neutral-900 rounded-lg overflow-hidden">
          <Skeleton className="aspect-[2/3] w-full" />
          <div className="p-3">
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
} 