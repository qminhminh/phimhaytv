import { Suspense } from 'react';
import { getMoviesList, getCountries, getCategories } from '@/lib/api';
import TVSeriesList from '@/components/shared/PhimBoList';
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
    sort_field?: string;
    sort_type?: string;
    sort_lang?: string;
    country?: string;
    year?: string;
    category?: string;
  };
}

export default async function TVShowsPage({ searchParams }: TVShowsPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const sortField = (searchParams.sort_field as 'modified.time' | '_id' | 'year') || 'modified.time';
  const sortType = (searchParams.sort_type as 'desc' | 'asc') || 'desc';
  const sortLang = (searchParams.sort_lang as 'vietsub' | 'thuyet-minh' | 'long-tieng') || undefined;
  const country = searchParams.country;
  const category = searchParams.category;
  const year = searchParams.year ? parseInt(searchParams.year) : undefined;
  
  // Lấy danh sách quốc gia
  const countriesData = await getCountries();
  const countries = countriesData.items || [];
  
  // Lấy danh sách thể loại phim
  const categoriesData = await getCategories();
  const categories = categoriesData.items || [];
  
  // Lấy danh sách phim bộ/TV Shows đúng theo API yêu cầu
  const tvShowsData = await getMoviesList('tv-shows', {
    page,
    sortField,
    sortType,
    sortLang,
    country,
    category: category ? category : undefined,
    year,
    limit: 24
  });
  
  // Đảm bảo lấy đúng danh sách phim và phân trang từ API
  const movies = tvShowsData?.data?.items || [];
  const totalPages = tvShowsData?.data?.params?.pagination?.totalPages || 1;
  const imageDomain = 'https://phimimg.com';
  
  // Tạo URL với các tham số lọc cho phân trang
  const createPaginationUrl = (params: Record<string, string | undefined>) => {
    const url = new URL('/tv-shows', 'https://phimhaytv.com');
    
    // Thêm các tham số hiện tại
    if (searchParams.sort_field) url.searchParams.set('sort_field', searchParams.sort_field);
    if (searchParams.sort_type) url.searchParams.set('sort_type', searchParams.sort_type);
    if (searchParams.sort_lang) url.searchParams.set('sort_lang', searchParams.sort_lang);
    if (searchParams.country) url.searchParams.set('country', searchParams.country);
    if (searchParams.category) url.searchParams.set('category', searchParams.category);
    if (searchParams.year) url.searchParams.set('year', searchParams.year);
    
    // Ghi đè các tham số mới
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    
    return url.pathname + url.search;
  };
  
  // Danh sách các năm để lọc
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  return (
    <main className="min-h-screen bg-[#121212] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#EAEAEA] mb-6">Phim Bộ / TV Shows</h1>
        
        {/* Bộ lọc */}
        <FilterBrowse
          baseUrl="/tv-shows"
          sortField={sortField}
          sortType={sortType}
          sortLang={sortLang}
          country={country}
          category={category}
          year={year}
          countries={countries}
          categories={categories}
          years={years}
        />
        
        {/* Danh sách phim */}
        <Suspense fallback={<TVSeriesListSkeleton />}>
          <TVSeriesList items={movies as any} imageDomain={imageDomain} />
        </Suspense>
        
        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              baseUrl={createPaginationUrl({ page: undefined })} 
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