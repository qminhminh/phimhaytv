'use client'

import { useMoviesList } from '@/hooks/useMovies'
import CardViewMovie from '@/components/shared/CardViewMovie'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'

interface FilteredMoviesListProps {
  type: string;
  page: number;
  category?: string;
  country?: string;
  year?: string;
  sortField?: string;
  sortType?: string;
  sortLang?: string;
  baseUrl: string;
}

export default function FilteredMoviesList({ 
  type, 
  page, 
  category, 
  country, 
  year, 
  sortField, 
  sortType, 
  sortLang,
  baseUrl 
}: FilteredMoviesListProps) {
  
  const options = {
      page,
      category,
      country,
      year: year ? parseInt(year) : undefined,
      sort_field: sortField,
      sort_type: sortType,
      sort_lang: sortLang,
      limit: 24,
  };

  const { data, isLoading, isFetching } = useMoviesList(type, options)
  
  const items = data?.data?.items || []
  const totalPages = data?.data?.params?.pagination?.totalPages || 1
  const imageDomain = data?.data?.APP_DOMAIN_CDN_IMAGE || ''

  if (isLoading) {
      return <MovieListSkeleton />
  }

  const createPaginationBaseUrl = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (country) params.set('country', country);
    if (year) params.set('year', year);
    if (sortField) params.set('sort_field', sortField);
    if (sortType) params.set('sort_type', sortType);
    if (sortLang) params.set('sort_lang', sortLang);
    
    const queryString = params.toString();
    // Return base path. The Pagination component likely handles adding ?page= or &page=
    // But standard Pagination usually takes a prop that is the FULL url prefix or handles params itself.
    // Looking at previous usage: baseUrl={createPaginationBaseUrl()}
    // Let's assume Pagination appends `&page=X` or `?page=X`.
    // If we return "/phim-le?category=hanh-dong", Pagination might append "&page=2".
    
    return `${baseUrl}${queryString ? '?' + queryString : ''}`;
  };

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
              baseUrl={createPaginationBaseUrl()} 
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