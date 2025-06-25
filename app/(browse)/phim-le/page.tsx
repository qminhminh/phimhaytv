import { Suspense } from 'react';
import { Metadata } from 'next';
import { getSingleMovies, getCategories, getCountries } from '@/lib/api';
import PhimBoList from '@/components/shared/CardViewMovie';
import FilterBrowse from '@/components/shared/FilterBrowse';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

interface PhimLePageProps {
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

export async function generateMetadata({ searchParams }: PhimLePageProps): Promise<Metadata> {
    // Gọi API một lần để lấy dữ liệu, bao gồm cả thông tin SEO
    const data = await getSingleMovies({
        page: searchParams.page ? parseInt(searchParams.page) : 1,
        filterCategory: searchParams.category ? [searchParams.category] : undefined,
        filterCountry: searchParams.country ? [searchParams.country] : undefined,
        filterYear: searchParams.year ? [searchParams.year] : undefined,
    });

    const seoData = data?.data?.seoOnPage;

    const title = seoData?.titleHead || 'Phim Lẻ Hay Tuyển Chọn | PhimHayTV';
    const description = seoData?.descriptionHead || 'Tuyển tập phim lẻ, phim mới nhất thuộc nhiều thể loại, quốc gia. Cập nhật liên tục tại PhimHayTV.';
    
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        },
    };
}

export default async function PhimLePage({ searchParams }: PhimLePageProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const category = searchParams.category;
  const country = searchParams.country;
  const year = searchParams.year;
  const sortField = (searchParams.sort_field as 'modified.time' | '_id' | 'year') || 'modified.time';
  const sortType = (searchParams.sort_type as 'desc' | 'asc') || 'desc';
  const sortLang = (searchParams.sort_lang as 'vietsub' | 'thuyet-minh' | 'long-tieng') || undefined;
  
  const singleMoviesData = await getSingleMovies({
    page,
    filterCategory: category ? [category] : undefined,
    filterCountry: country ? [country] : undefined,
    filterYear: year ? [year] : undefined,
    sortField,
    sortType,
    limit: 24,
  });
  
  const categoriesData = await getCategories();
  const categories = categoriesData.items || [];
  
  const countriesData = await getCountries();
  const countries = countriesData.items || [];
  
  const items = singleMoviesData.data.items;
  const pagination = singleMoviesData.data.params.pagination;
  const totalPages = pagination.totalPages;
  const imageDomain = singleMoviesData.data.APP_DOMAIN_CDN_IMAGE;
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  const createPaginationBaseUrl = () => {
    const url = new URL('/phim-le', 'https://phimhaytv.com');
    
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
        <h1 className="text-3xl font-bold text-white">{singleMoviesData.data.titlePage}</h1>
        <p className="text-gray-400 mt-2">{singleMoviesData.data.seoOnPage.descriptionHead}</p>
      </div>
      
      <FilterBrowse
        baseUrl="/phim-le"
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
      
      <Suspense fallback={<MovieListSkeleton />}>
        <PhimBoList items={items as any} imageDomain={imageDomain} />
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