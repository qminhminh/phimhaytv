import { Suspense } from 'react';
import { Metadata } from 'next';
import { getTVSeries, getCategories, getCountries } from '@/lib/api';
import PhimBoList from '@/components/shared/PhimBoList';
import FilterBrowse from '@/components/shared/FilterBrowse';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Phim Bộ | Phim Hay TV',
  description: 'Danh sách phim bộ mới nhất, phim bộ hay nhất, phim bộ cập nhật liên tục tại Phim Hay TV',
};

interface PhimBoPageProps {
  searchParams: {
    page?: string;
    category?: string;
    country?: string;
    year?: string;
    sort_field?: string;
    sort_type?: string;
    sort_lang?: string;
  };
}

export default async function PhimBoPage({ searchParams }: PhimBoPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const category = searchParams.category;
  const country = searchParams.country;
  const year = searchParams.year;
  const sortField = (searchParams.sort_field as 'modified.time' | '_id' | 'year') || 'modified.time';
  const sortType = (searchParams.sort_type as 'desc' | 'asc') || 'desc';
  const sortLang = (searchParams.sort_lang as 'vietsub' | 'thuyet-minh' | 'long-tieng') || undefined;
  
  // Lấy danh sách phim bộ từ API
  const tvSeriesData = await getTVSeries({
    page,
    filterCategory: category ? [category] : [""],
    filterCountry: country ? [country] : [""],
    filterYear: year ? [year] : [""],
    sortField,
    sortType,
    limit: 24
    // Note: The API for phim-bo does not seem to support sort_lang, so it's not passed here.
  });
  
  // Lấy danh sách thể loại
  const categoriesData = await getCategories();
  const categories = categoriesData.items || [];
  
  // Lấy danh sách quốc gia
  const countriesData = await getCountries();
  const countries = countriesData.items || [];
  
  // Lấy thông tin từ API
  const items = tvSeriesData.data.items;
  const pagination = tvSeriesData.data.params.pagination;
  const totalPages = pagination.totalPages;
  const imageDomain = tvSeriesData.data.APP_DOMAIN_CDN_IMAGE;
  
  // Danh sách năm để lọc
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  // Tạo URL cho phân trang
  const createPaginationBaseUrl = () => {
    const url = new URL('/phim-bo', 'https://phimhaytv.com');
    
    if (category) url.searchParams.set('category', category);
    if (country) url.searchParams.set('country', country);
    if (year) url.searchParams.set('year', year);
    if (sortField) url.searchParams.set('sort_field', sortField);
    if (sortType) url.searchParams.set('sort_type', sortType);
    if (sortLang) url.searchParams.set('sort_lang', sortLang);
    
    return url.pathname + url.search;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{tvSeriesData.data.titlePage}</h1>
        <p className="text-gray-400 mt-2">{tvSeriesData.data.seoOnPage.descriptionHead}</p>
      </div>
      
      {/* Bộ lọc */}
      <FilterBrowse
        baseUrl="/phim-bo"
        sortField={sortField}
        sortType={sortType}
        sortLang={sortLang}
        country={country}
        category={category}
        year={year ? parseInt(year) : undefined}
        countries={countries}
        categories={categories}
        years={years}
      />
      
      {/* Danh sách phim */}
      <Suspense fallback={<TVSeriesListSkeleton />}>
        <PhimBoList items={items} imageDomain={imageDomain} />
      </Suspense>
      
      {/* Phân trang */}
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