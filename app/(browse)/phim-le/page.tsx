import { Suspense } from 'react';
import { Metadata } from 'next';
import { getMoviesList, getCategories, getCountries, thinMovieData } from '@/lib/api';
import FilterBrowse from '@/components/shared/FilterBrowse';
import FilteredMoviesList from '@/components/movies/FilteredMoviesList';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { fetchMoviesList } from '@/app/actions/movies';

interface PhimLePageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    country?: string;
    year?: string;
    sort_field?: string;
    sort_type?: string;
    sort_lang?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PhimLePageProps): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const data = await getMoviesList('phim-le', {
        page: resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1,
        category: resolvedSearchParams.category,
        country: resolvedSearchParams.country,
        year: resolvedSearchParams.year,
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
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  const category = resolvedSearchParams.category;
  const country = resolvedSearchParams.country;
  const year = resolvedSearchParams.year;
  const sortField = (resolvedSearchParams.sort_field as 'modified.time' | '_id' | 'year') || 'modified.time';
  const sortType = (resolvedSearchParams.sort_type as 'desc' | 'asc') || 'desc';
  const sortLang = (resolvedSearchParams.sort_lang as 'vietsub' | 'thuyet-minh' | 'long-tieng') || undefined;
  
  const moviesOptions = {
      page,
      category,
      country,
      year: year ? parseInt(year) : undefined,
      sort_field: sortField,
      sort_type: sortType,
      sort_lang: sortLang,
      limit: 24,
  };

  const [moviesData, categories, countries] = await Promise.all([
    fetchMoviesList('phim-le', moviesOptions),
    getCategories(),
    getCountries(),
  ]);
  
  const queryClient = new QueryClient();
  const thinnedMoviesData = {
    ...moviesData,
    data: {
      ...moviesData.data,
      items: thinMovieData(moviesData.data.items)
    }
  };
  queryClient.setQueryData(['movies-list', 'phim-le', moviesOptions], thinnedMoviesData);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{moviesData.data.titlePage}</h1>
        <p className="text-gray-400 mt-2">{moviesData.data.seoOnPage.descriptionHead}</p>
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
      
      <HydrationBoundary state={dehydrate(queryClient)}>
        <FilteredMoviesList 
            type="phim-le"
            baseUrl="/phim-le"
            page={page}
            category={category}
            country={country}
            year={year}
            sortField={sortField}
            sortType={sortType}
            sortLang={sortLang}
        />
      </HydrationBoundary>
    </div>
  );
}