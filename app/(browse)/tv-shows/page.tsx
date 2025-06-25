import { Suspense } from 'react';
import { getMoviesList, getCountries, getCategories } from '@/lib/api';
import CardViewMovie from '@/components/shared/CardViewMovie';
import { Pagination } from '@/components/ui/pagination';
import { Metadata } from 'next';
import FilterBrowse from '@/components/shared/FilterBrowse';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Phim Bộ | TV Shows - PhimHayTV',
  description: 'Xem phim bộ, TV Shows mới nhất, chất lượng cao và cập nhật liên tục tại PhimHayTV',
};

interface TVShowsPageProps {
  searchParams: {
    page?: string;
    sort_field?: 'modified.time' | '_id' | 'year';
    sort_type?: 'desc' | 'asc';
    sort_lang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
    country?: string;
    year?: string;
    category?: string;
  };
}

export default async function TVShowsPage({ searchParams }: TVShowsPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const { category, country, year, sort_field, sort_type, sort_lang } = searchParams;

  const [tvShowsData, categoriesData, countriesData] = await Promise.all([
    getMoviesList('tv-shows', {
      page,
      category,
      country,
      year,
      sort_field: sort_field || 'modified.time',
      sort_type: sort_type || 'desc',
      sort_lang,
      limit: 24
    }),
    getCategories(),
    getCountries()
  ]);
  
  const countries = countriesData.items || [];
  const categories = categoriesData.items || [];
  
  const movies = tvShowsData.data.items || [];
  const totalPages = tvShowsData.data.params.pagination.totalPages || 1;
  const imageDomain = tvShowsData.data.APP_DOMAIN_CDN_IMAGE;
  
  const createPaginationUrl = () => {
    const params = new URLSearchParams(searchParams as any);
    params.delete('page');
    return `/tv-shows?${params.toString()}`;
  };
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  return (
    <main className="min-h-screen bg-[#121212] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#EAEAEA] mb-6">Phim Bộ / TV Shows</h1>
        
        <FilterBrowse
          baseUrl="/tv-shows"
          sortField={sort_field || 'modified.time'}
          sortType={sort_type || 'desc'}
          sortLang={sort_lang}
          country={country}
          category={category}
          year={year ? parseInt(year) : undefined}
          countries={countries}
          categories={categories}
          years={years}
        />
        
        <Suspense fallback={<TVSeriesListSkeleton />}>
          <CardViewMovie items={movies as any} imageDomain={imageDomain} />
        </Suspense>
        
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              baseUrl={createPaginationUrl()} 
            />
          </div>
        )}
      </div>
    </main>
  );
}

function TVSeriesListSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, index) => (
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