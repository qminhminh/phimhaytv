'use client'

import { useLatestMovies } from '@/hooks/useMovies'
import CardViewMovie from '@/components/shared/CardViewMovie'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'

export default function LatestMoviesList({ page }: { page: number }) {
  const { data, isLoading, isFetching } = useLatestMovies({ page, limit: 24 })
  
  const items = data?.data?.items || []
  const totalPages = data?.data?.params?.pagination?.totalPages || 1
  const imageDomain = '' 

  if (isLoading) {
      return <MovieListSkeleton />
  }

  return (
    <div>
        <div className={isFetching ? 'opacity-70 transition-opacity' : ''}>
            <CardViewMovie items={items as any} imageDomain={imageDomain} />
        </div>
        
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
  )
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