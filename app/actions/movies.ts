'use server'

import { 
    getLatestMovies, 
    getMoviesList, 
    getMoviesByCategory, 
    getMoviesByCountry, 
    getMoviesByYear,
    searchMovies,
    getMovieDetail,
    getEnhancedMovieData
} from '@/lib/api'

// Bridge for client components to access server-only API functions
export async function fetchLatestMovies(options: any) {
    return await getLatestMovies(options);
}

export async function fetchMoviesList(type: any, options: any) {
    return await getMoviesList(type, options);
}

export async function fetchMoviesByCategory(slug: string, options: any) {
    return await getMoviesByCategory(slug, options);
}

export async function fetchMoviesByCountry(slug: string, options: any) {
    return await getMoviesByCountry(slug, options);
}

export async function fetchMoviesByYear(year: number, options: any) {
    return await getMoviesByYear(year, options);
}

export async function fetchSearchMovies(keyword: string, options: any) {
    return await searchMovies(keyword, options);
}

export async function fetchMovieDetail(slug: string) {
    return await getMovieDetail(slug);
}

export async function fetchEnhancedMovieData(slug: string) {
    return await getEnhancedMovieData(slug);
}