import { Suspense } from 'react';
import { Metadata } from 'next';
import { getLatestMovies, getCategories, getCountries } from '@/lib/api';
import CardViewMovie from '@/components/shared/CardViewMovie';
import FilterBrowse from '@/components/shared/FilterBrowse';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Movie } from '@/lib/api';

interface LatestMoviesPageProps {
  searchParams: {
    page?: string;
    category?: string;
    country?: string;
    year?: string;
    sort_field?: 'modified.time' | 'year';
    sort_type?: 'desc' | 'asc';
  };
}

export const metadata: Metadata = {
  title: 'Phim Mới Cập Nhật - PhimHayTV',
  description: 'Danh sách phim mới nhất, phim hay nhất, cập nhật liên tục tại PhimHayTV',
};

export default async function LatestMoviesPage({ searchParams }: LatestMoviesPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const category = searchParams.category;
  const country = searchParams.country;
  const year = searchParams.year;
  const sortField = searchParams.sort_field || 'modified.time';
  const sortType = searchParams.sort_type || 'desc';

  const [latestMoviesData, categoriesData, countriesData] = await Promise.all([
    getLatestMovies({ 
      page, 
      filterCategory: category ? [category] : undefined,
      filterCountry: country ? [country] : undefined,
      filterYear: year ? [year] : undefined,
      sortField,
      sortType,
      limit: 24
    }),
    getCategories(),
    getCountries()
  ]);

  const items = latestMoviesData.items;
  const totalPages = ("pagination" in latestMoviesData && latestMoviesData.pagination?.totalPages) || latestMoviesData.params?.pagination?.totalPages || 1;
  
  // Do getLatestMovies trả về full URL, imageDomain có thể để trống
  const imageDomain = ''; 

  const categories = categoriesData.items || [];
  const countries = countriesData.items || [];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const createPaginationBaseUrl = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (country) params.set('country', country);
    if (year) params.set('year', year);
    if (sortField) params.set('sort_field', sortField);
    if (sortType) params.set('sort_type', sortType);
    // Xóa page để baseUrl không chứa tham số trang
    params.delete('page');
    return `/latest?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-[#121212] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-2">Phim Mới Cập Nhật</h1>
        <p className="text-gray-400 mb-6">Những bộ phim mới nhất từ khắp nơi trên thế giới, được cập nhật liên tục.</p>

        <FilterBrowse
          baseUrl="/latest"
          sortField={sortField}
          sortType={sortType}
          country={country}
          category={category}
          year={year ? parseInt(year) : undefined}
          countries={countries}
          categories={categories}
          years={years}
        />

        <Suspense fallback={<MovieListSkeleton />}>
          {/* Ép kiểu items về any để khớp với CardViewMovieProps */}
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