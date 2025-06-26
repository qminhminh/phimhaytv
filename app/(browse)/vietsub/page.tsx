import { Suspense } from 'react';
import { Metadata } from 'next';
import { getMoviesList, getCategories, getCountries } from '@/lib/api';
import CardViewMovie from '@/components/shared/CardViewMovie';
import FilterBrowse from '@/components/shared/FilterBrowse';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Phim Vietsub | Phim Hay TV',
  description: 'Danh sách phim Vietsub mới nhất, phim Vietsub hay nhất, cập nhật liên tục tại Phim Hay TV',
};

interface VietSubPageProps {
  searchParams: {
    page?: string;
    category?: string;
    country?: string;
    year?: string;
    sort_field?: 'modified.time' | '_id' | 'year';
    sort_type?: 'desc' | 'asc';
    sort_lang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
  };
}

export default async function VietSubPage({ searchParams }: VietSubPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const { category, country, year, sort_field, sort_type, sort_lang } = searchParams;

  const [vietsubData, categories, countries] = await Promise.all([
    getMoviesList('phim-vietsub', {
      page,
      category,
      country,
      year,
      sort_field: sort_field || 'modified.time',
      sort_type: sort_type || 'desc',
      sort_lang: sort_lang,
      limit: 24,
    }),
    getCategories(),
    getCountries()
  ]);
  
  const items = vietsubData.data.items;
  const pagination = vietsubData.data.params.pagination;
  const totalPages = pagination.totalPages;
  const imageDomain = vietsubData.data.APP_DOMAIN_CDN_IMAGE;
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  const createPaginationBaseUrl = () => {
    const params = new URLSearchParams(searchParams as any);
    params.delete('page');
    return `/vietsub?${params.toString()}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{vietsubData.data.titlePage}</h1>
        <p className="text-gray-400 mt-2">{vietsubData.data.seoOnPage.descriptionHead}</p>
      </div>
      
      <FilterBrowse
        baseUrl="/vietsub"
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
      
      <Suspense fallback={<MovieListSkeleton />}>
        <CardViewMovie items={items as any} imageDomain={imageDomain} />
      </Suspense>
      
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