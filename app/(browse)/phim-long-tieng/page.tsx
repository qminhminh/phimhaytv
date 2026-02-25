import { Metadata } from 'next';
import { getCategories, getCountries } from '@/lib/api';
import FilterBrowse from '@/components/shared/FilterBrowse';
import FilteredMoviesList from '@/components/movies/FilteredMoviesList';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { fetchMoviesList } from '@/app/actions/movies';

export const metadata: Metadata = {
  title: 'Phim Lồng Tiếng | Phim Hay TV',
  description: 'Danh sách phim Lồng Tiếng mới nhất, phim Lồng Tiếng hay nhất, cập nhật liên tục tại Phim Hay TV',
};

interface LongTiengPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    country?: string;
    year?: string;
    sort_field?: 'modified.time' | '_id' | 'year';
    sort_type?: 'desc' | 'asc';
    sort_lang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
  }>;
}

export default async function LongTiengPage({ searchParams }: LongTiengPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  const { category, country, year, sort_field, sort_type, sort_lang } = resolvedSearchParams;
  
  const moviesOptions = {
      page,
      category,
      country,
      year: year ? parseInt(year) : undefined,
      sort_field: sort_field || 'modified.time',
      sort_type: sort_type || 'desc',
      sort_lang: sort_lang,
      limit: 24,
  };

  const [moviesData, categories, countries] = await Promise.all([
    fetchMoviesList('phim-long-tieng', moviesOptions),
    getCategories(),
    getCountries()
  ]);
  
  const queryClient = new QueryClient();
  queryClient.setQueryData(['movies-list', 'phim-long-tieng', moviesOptions], moviesData);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{moviesData.data.titlePage}</h1>
        <p className="text-gray-400 mt-2">{moviesData.data.seoOnPage.descriptionHead}</p>
      </div>
      
      <FilterBrowse
        baseUrl="/phim-long-tieng"
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
      
      <HydrationBoundary state={dehydrate(queryClient)}>
        <FilteredMoviesList 
            type="phim-long-tieng"
            baseUrl="/phim-long-tieng"
            page={page}
            category={category}
            country={country}
            year={year}
            sortField={sort_field}
            sortType={sort_type}
            sortLang={sort_lang}
        />
      </HydrationBoundary>
    </div>
  );
}