import { useQuery } from '@tanstack/react-query'
import { 
    fetchLatestMovies, 
    fetchMoviesList, 
    fetchMoviesByCategory,
    fetchMoviesByCountry,
    fetchMoviesByYear,
    fetchSearchMovies,
    fetchMovieDetail,
    fetchEnhancedMovieData
} from '@/app/actions/movies'

export function useLatestMovies(options: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['latest-movies', options],
    queryFn: () => fetchLatestMovies(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useMoviesList(type: string, options: any = {}) {
    return useQuery({
        queryKey: ['movies-list', type, options],
        queryFn: () => fetchMoviesList(type, options),
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    })
}

export function useMoviesByCategory(slug: string, options: any = {}) {
    return useQuery({
        queryKey: ['movies-category', slug, options],
        queryFn: () => fetchMoviesByCategory(slug, options),
        enabled: !!slug,
        placeholderData: (previousData) => previousData,
    })
}

export function useMoviesByCountry(slug: string, options: any = {}) {
    return useQuery({
        queryKey: ['movies-country', slug, options],
        queryFn: () => fetchMoviesByCountry(slug, options),
        enabled: !!slug,
        placeholderData: (previousData) => previousData,
    })
}

export function useMoviesByYear(year: number, options: any = {}) {
    return useQuery({
        queryKey: ['movies-year', year, options],
        queryFn: () => fetchMoviesByYear(year, options),
        enabled: !!year,
        placeholderData: (previousData) => previousData,
    })
}

export function useSearchMovies(keyword: string, options: any = {}) {
    return useQuery({
        queryKey: ['search-movies', keyword, options],
        queryFn: () => fetchSearchMovies(keyword, options),
        enabled: !!keyword,
    })
}

export function useMovieDetail(slug: string) {
    return useQuery({
        queryKey: ['movie-detail', slug],
        queryFn: () => fetchMovieDetail(slug),
        enabled: !!slug,
    })
}

export function useEnhancedMovieDetail(slug: string) {
    return useQuery({
        queryKey: ['movie-detail-enhanced', slug],
        queryFn: () => fetchEnhancedMovieData(slug),
        enabled: !!slug,
    })
}