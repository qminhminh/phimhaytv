import { Metadata } from 'next';
import { getCategories, getCountries } from '@/lib/api';
import FilterBrowse from '@/components/shared/FilterBrowse';
import FilteredMoviesList from '@/components/movies/FilteredMoviesList';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { fetchMoviesList } from '@/app/actions/movies';

export const metadata: Metadata = {
  title: 'Phim Bộ | TV Shows - PhimHayTV',
  description: 'Xem phim bộ, TV Shows mới nhất, chất lượng cao và cập nhật liên tục tại PhimHayTV',
};

interface TVShowsPageProps {
  searchParams: Promise<{
    page?: string;
    sort_field?: 'modified.time' | '_id' | 'year';
    sort_type?: 'desc' | 'asc';
    sort_lang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
    country?: string;
    year?: string;
    category?: string;
  }>;
}

export default async function TVShowsPage({ searchParams }: TVShowsPageProps) {
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
    fetchMoviesList('tv-shows', moviesOptions),
    getCategories(),
    getCountries()
  ]);
  
  const queryClient = new QueryClient();
  queryClient.setQueryData(['movies-list', 'tv-shows', moviesOptions], moviesData);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  return (
    <main className="min-h-screen bg-[#121212] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#EAEAEA] mb-2">{moviesData.data.titlePage}</h1>
            <p className="text-gray-400">{moviesData.data.seoOnPage.descriptionHead}</p>
        </div>
        
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
        
        <HydrationBoundary state={dehydrate(queryClient)}>
            <FilteredMoviesList 
                type="tv-shows"
                baseUrl="/tv-shows"
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
    </main>
  );
}