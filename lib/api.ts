import 'server-only';
import { cache } from 'react';
import { redis } from '@/lib/redis';

const BASE_URL = 'https://phimapi.com';
const DEFAULT_REVALIDATE_TIME = 21600; // 6 giờ

// Helper function to check if response is successful
const isResponseSuccess = (status: string | boolean | undefined): boolean => {
  if (typeof status === 'boolean') return status === true;
  if (typeof status === 'string') return status === 'success' || status === 'true';
  return false;
};

// Helper function to generate redis cache keys
const generateCacheKey = (path: string, params: Record<string, any> = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '') // Skip empty/null/undefined params
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `movies:${path}${sortedParams ? `?${sortedParams}` : ''}`;
};

async function fetcher<T>(
  path: string,
  params: Record<string, any> = {},
  options: { revalidate?: number } = {}
): Promise<T> {
  const { revalidate = DEFAULT_REVALIDATE_TIME } = options; // Cache for 1 hour by default

  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v.toString()));
      } else {
        url.searchParams.set(key, value.toString());
      }
    }
  });

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Error fetching ${url.toString()}: ${res.status} ${res.statusText}`, { errorBody });
      throw new Error(`API request failed with status ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Network or other error fetching ${url.toString()}:`, error);
    throw error;
  }
}

export interface Movie {
  _id: string;
  name: string;
  origin_name: string;
  slug: string;
  thumb_url: string;
  poster_url: string;
  year: number;
  category: string[];
  country: string[];
  type: string;
  status: string;
  sub_docquyen: boolean;
  chieurap: boolean;
  trailer_url: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  content: string;
  modified: {
    time: string;
  };
}

export interface MovieDetail extends Movie {
  episodes: {
    server_name: string;
    server_data: {
      name: string;
      slug: string;
      filename: string;
      link_embed: string;
      link_m3u8: string;
    }[];
  }[];
}

export interface MovieResponse {
  status: boolean;
  items: Movie[];
  params?: {
    pagination: {
      totalItems: number;
      totalItemsPerPage: number;
      currentPage: number;
      totalPages: number;
    };
  };
  pagination?: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
    updateToday?: number;
  };
}

export interface MovieDetailResponse {
  status: boolean;
  item: MovieDetail;
}

export interface MovieListApiResponse {
  status: string;
  msg: string;
  data: {
    items: Movie[];
    params: {
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        totalPages: number;
      };
    };
    // ... các trường khác nếu cần
  };
}

export interface TVSeriesResponse {
  status: string;
  msg: string;
  data: {
    seoOnPage: {
      og_type: string;
      titleHead: string;
      descriptionHead: string;
      og_image: string[];
      og_url: string;
    };
    breadCrumb: {
      name: string;
      slug: string;
      isCurrent: boolean;
      position: number;
    }[];
    titlePage: string;
    items: {
      tmdb: {
        type: string | null;
        id: string | null;
        season: number | null;
        vote_average: number | null;
        vote_count: number | null;
      };
      imdb: {
        id: string | null;
      };
      created: {
        time: string;
      };
      modified: {
        time: string;
      };
      _id: string;
      name: string;
      slug: string;
      origin_name: string;
      type: string;
      poster_url: string;
      thumb_url: string;
      sub_docquyen: boolean;
      chieurap: boolean;
      time: string;
      episode_current: string;
      quality: string;
      lang: string;
      year: number;
      category: {
        id: string;
        name: string;
        slug: string;
      }[];
      country: {
        id: string;
        name: string;
        slug: string;
      }[];
    }[];
    params: {
      type_slug: string;
      filterCategory: string[];
      filterCountry: string[];
      filterYear: string[];
      filterType: string[];
      sortField: string;
      sortType: string;
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        totalPages: number;
      };
    };
    type_list: string;
    APP_DOMAIN_FRONTEND: string;
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export interface SearchApiResponse {
    status: string;
    msg: string;
    data: {
      seoOnPage: {
        og_type: string;
        titleHead: string;
        descriptionHead: string;
        og_image: any[]; // Hoặc một kiểu cụ thể hơn nếu bạn biết
        og_url: string;
      };
      breadCrumb: {
        name: string;
        isCurrent: boolean;
        position: number;
      }[];
      titlePage: string;
      items: Movie[];
      params: {
        type_slug: string;
        keyword: string;
        filterCategory: string[];
        filterCountry: string[];
        filterYear: string[];
        filterType: string[];
        sortField: string;
        sortType: string;
        pagination: {
          totalItems: number;
          totalItemsPerPage: number;
          currentPage: number;
          totalPages: number;
        };
      };
      type_list: string;
      APP_DOMAIN_FRONTEND: string;
      APP_DOMAIN_CDN_IMAGE: string;
    };
  }

// Helper function to thin out movie data to save bandwidth
export const thinMovieData = (movies: any[]) => {
  if (!Array.isArray(movies)) return [];
  return movies.map(m => ({
    _id: m._id,
    name: m.name,
    slug: m.slug,
    origin_name: m.origin_name,
    poster_url: m.poster_url,
    thumb_url: m.thumb_url,
    year: m.year,
    quality: m.quality,
    lang: m.lang,
    time: m.time,
    episode_current: m.episode_current,
    category: m.category,
    tmdb: m.tmdb
  }));
};

// Hàm mới để lấy danh sách phim theo type_list và các bộ lọc
export const getMoviesList = async (
  type_list: 'phim-bo' | 'phim-le' | 'tv-shows' | 'hoat-hinh' | 'phim-vietsub' | 'phim-thuyet-minh' | 'phim-long-tieng',
  options: {
    page?: number;
    sort_field?: 'modified.time' | '_id' | 'year';
    sort_type?: 'desc' | 'asc';
    sort_lang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
    category?: string;
    country?: string;
    year?: number | string;
    limit?: number;
  } = {}
): Promise<TVSeriesResponse> => {
  const { page = 1, limit = 24, ...rest } = options;
  const params = {
    page,
    limit,
    ...rest,
  };
  
  const cacheKey = generateCacheKey(`/danh-sach/${type_list}`, params);
  
  try {
    const cachedData = await redis.get<TVSeriesResponse>(cacheKey);
    if (cachedData) {
      // console.log(`[Redis Cache Hit] ${cacheKey}`);
      return cachedData;
    }
  } catch (error) {
    console.error(`[Redis Cache Error] GET ${cacheKey}:`, error);
  }

  const response = await fetcher<TVSeriesResponse>(`/v1/api/danh-sach/${type_list}`, params);

  if (response && isResponseSuccess(response.status)) {
    try {
      await redis.set(cacheKey, response, { ex: DEFAULT_REVALIDATE_TIME });
      // console.log(`[Redis Cache Set] ${cacheKey}`);
    } catch (error) {
      console.error(`[Redis Cache Error] SET ${cacheKey}:`, error);
    }
  }

  return response;
};

// Phim mới cập nhật
export const getLatestMovies = async (
  options: {
    page?: number;
    limit?: number;
  } = {}
): Promise<TVSeriesResponse> => {
  const params = {
    page: options.page || 1,
    limit: options.limit || 10,
  };

  const cacheKey = generateCacheKey('/danh-sach/phim-moi-cap-nhat-v3', params);

  try {
    const cachedData = await redis.get<TVSeriesResponse>(cacheKey);
    if (cachedData) {
      // console.log(`[Redis Cache Hit] ${cacheKey}`);
      return cachedData;
    }
  } catch (error) {
    console.error(`[Redis Cache Error] GET ${cacheKey}:`, error);
  }

  interface LatestMoviesApiResponse {
    status: boolean;
    items: TVSeriesResponse['data']['items'];
    pagination: TVSeriesResponse['data']['params']['pagination'];
  }
  
  const response = await fetcher<LatestMoviesApiResponse>('/danh-sach/phim-moi-cap-nhat-v3', params);

  // Adapt the response to match TVSeriesResponse structure that the app expects
  const result = {
    status: String(response.status),
    msg: '',
    data: {
      items: response.items,
      params: {
        pagination: response.pagination,
      },
      // Mock other fields to satisfy the TVSeriesResponse type
      seoOnPage: {
        og_type: 'website',
        titleHead: 'Phim Mới Cập Nhật',
        descriptionHead: 'Danh sách phim mới cập nhật.',
        og_image: [],
        og_url: '',
      },
      breadCrumb: [],
      titlePage: 'Phim Mới Cập Nhật',
      type_list: 'latest',
      APP_DOMAIN_FRONTEND: '',
      APP_DOMAIN_CDN_IMAGE: 'https://phimimg.com',
    },
  } as unknown as TVSeriesResponse;

  if (response && response.status === true) {
    try {
      await redis.set(cacheKey, result, { ex: DEFAULT_REVALIDATE_TIME });
      // console.log(`[Redis Cache Set] ${cacheKey}`);
    } catch (error) {
      console.error(`[Redis Cache Error] SET ${cacheKey}:`, error);
    }
  }

  return result;
};

// Thông tin Phim & Danh sách tập phim
export const getMovieDetail = async (slug: string) => {
  try {
    const res = await fetch(`${BASE_URL}/v1/api/phim/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      // Don't throw for client-side expected errors like 404.
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(`Network error fetching movie detail for slug "${slug}":`, error);
    return null; // Return null on network errors as well to prevent crash
  }
};

// Tìm kiếm phim
export const searchMovies = async (
    keyword?: string,
    options: {
      page?: number;
      sort_field?: 'modified.time' | '_id' | 'year';
      sort_type?: 'desc' | 'asc';
      sort_lang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
      category?: string;
      country?: string;
      year?: number | string;
      limit?: number;
    } = {}
  ): Promise<SearchApiResponse['data']> => {
    const params = {
        keyword,
        page: options.page,
        sort_field: options.sort_field,
        sort_type: options.sort_type,
        category: options.category,
        country: options.country,
        year: options.year,
        limit: options.limit,
    };
    const response = await fetcher<SearchApiResponse>(`/v1/api/tim-kiem`, params);
    return response.data;
  };

// Tìm kiếm gợi ý phim cho autocomplete
export const getSuggestedMovies = async (
  keyword: string
): Promise<{ name: string; slug: string; thumb_url: string; year: number; category: string[] }[]> => {
  if (!keyword.trim() || keyword.length < 2) {
    return [];
  }
  
  try {
    const result = await searchMovies(keyword, { 
      limit: 8, // Chỉ lấy 8 kết quả đầu tiên cho suggestions
      sort_field: 'modified.time',
      sort_type: 'desc'
    });
    
    return result.items.map(movie => ({
      name: movie.name,
      slug: movie.slug,
      thumb_url: movie.thumb_url,
      year: movie.year,
      category: Array.isArray(movie.category) ? movie.category.map(cat => {
        if (typeof cat === 'string') {
          return cat;
        } else if (cat && typeof cat === 'object') {
          return (cat as any).name || (cat as any).id || 'Unknown';
        }
        return 'Unknown';
      }) : []
    }));
  } catch (error) {
    console.error('Error fetching movie suggestions:', error);
    return [];
  }
};

// Lấy danh sách thể loại phim
export const getCategories = cache(async () => {
    try {
        const data = await fetcher<{ _id: string; name: string; slug: string }[]>('/the-loai');
        if (Array.isArray(data)) {
            return data.map(item => ({ id: item._id, name: item.name, slug: item.slug }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
});

// Lấy phim theo thể loại
export const getMoviesByCategory = async (
  categorySlug: string,
  options?: {
    page?: number;
    sortField?: 'modified.time' | '_id' | 'year';
    sortType?: 'desc' | 'asc';
    sortLang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
    country?: string;
    year?: number;
    limit?: number;
  }
) => {
    const params = {
        page: options?.page || 1,
        sort_field: options?.sortField || 'modified.time',
        sort_type: options?.sortType || 'desc',
        sort_lang: options?.sortLang,
        country: options?.country,
        year: options?.year,
        limit: options?.limit || 24
    };

    const cacheKey = generateCacheKey(`/the-loai/${categorySlug}`, params);

    try {
      const cachedData = await redis.get<MovieResponse>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    } catch (error) {
      console.error(`[Redis Cache Error] GET ${cacheKey}:`, error);
    }

    const response = await fetcher<MovieResponse>(`/v1/api/the-loai/${categorySlug}`, params);

    if (response && isResponseSuccess(response.status)) {
      try {
        await redis.set(cacheKey, response, { ex: DEFAULT_REVALIDATE_TIME });
      } catch (error) {
        console.error(`[Redis Cache Error] SET ${cacheKey}:`, error);
      }
    }

    return response;
};

// Lấy danh sách quốc gia
export const getCountries = cache(async () => {
    try {
        const data = await fetcher<{ _id: string; name: string; slug: string }[]>('/quoc-gia');
        if (Array.isArray(data)) {
            return data.map(item => ({ id: item._id, name: item.name, slug: item.slug }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching countries:', error);
        return [];
    }
});

// Lấy phim theo quốc gia
export const getMoviesByCountry = async (
  countrySlug: string,
  options?: {
    page?: number;
    sortField?: 'modified.time' | '_id' | 'year';
    sortType?: 'desc' | 'asc';
    sortLang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
    category?: string;
    year?: number;
    limit?: number;
  }
) => {
    const params = {
        page: options?.page || 1,
        sort_field: options?.sortField || 'modified.time',
        sort_type: options?.sortType || 'desc',
        sort_lang: options?.sortLang,
        category: options?.category,
        year: options?.year,
        limit: options?.limit || 24
    };

    const cacheKey = generateCacheKey(`/quoc-gia/${countrySlug}`, params);

    try {
      const cachedData = await redis.get<MovieResponse>(cacheKey);
      if (cachedData) return cachedData;
    } catch (error) {
      console.error(`[Redis Cache Error] GET ${cacheKey}:`, error);
    }

    const response = await fetcher<MovieResponse>(`/v1/api/quoc-gia/${countrySlug}`, params);

    if (response && isResponseSuccess(response.status)) {
      try {
        await redis.set(cacheKey, response, { ex: DEFAULT_REVALIDATE_TIME });
      } catch (error) {
        console.error(`[Redis Cache Error] SET ${cacheKey}:`, error);
      }
    }

    return response;
};

// Lấy phim theo năm
export const getMoviesByYear = async (
  year: number,
  options?: {
    page?: number;
    sortField?: 'modified.time' | '_id' | 'year';
    sortType?: 'desc' | 'asc';
    sortLang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
    category?: string;
    country?: string;
    limit?: number;
  }
) => {
    const params = {
        page: options?.page || 1,
        sort_field: options?.sortField || 'modified.time',
        sort_type: options?.sortType || 'desc',
        sort_lang: options?.sortLang,
        category: options?.category,
        country: options?.country,
        limit: options?.limit || 24
    };

    const cacheKey = generateCacheKey(`/nam-phat-hanh/${year}`, params);

    try {
      const cachedData = await redis.get<MovieResponse>(cacheKey);
      if (cachedData) return cachedData;
    } catch (error) {
      console.error(`[Redis Cache Error] GET ${cacheKey}:`, error);
    }

    const response = await fetcher<MovieResponse>(`/v1/api/nam-phat-hanh/${year}`, params);

    if (response && isResponseSuccess(response.status)) {
      try {
        await redis.set(cacheKey, response, { ex: DEFAULT_REVALIDATE_TIME });
      } catch (error) {
        console.error(`[Redis Cache Error] SET ${cacheKey}:`, error);
      }
    }

    return response;
};

// Lấy danh sách phim bộ
export const getTVSeries = async (
  options?: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    sortField?: 'modified.time' | '_id' | 'year';
    sortType?: 'desc' | 'asc';
    sortLang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
    limit?: number;
  }
): Promise<TVSeriesResponse> => {
  const apiOptions = {
    page: options?.page,
    sort_field: options?.sortField,
    sort_type: options?.sortType,
    sort_lang: options?.sortLang,
    category: options?.filterCategory?.[0],
    country: options?.filterCountry?.[0],
    year: options?.filterYear?.[0],
    limit: options?.limit,
  };
  return getMoviesList('tv-shows', apiOptions);
};

export const getSingleMovies = async (
  options?: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    sortField?: 'modified.time' | '_id' | 'year';
    sortType?: 'desc' | 'asc';
    sortLang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
    limit?: number;
  }
): Promise<TVSeriesResponse> => {
  const apiOptions = {
    page: options?.page,
    sort_field: options?.sortField,
    sort_type: options?.sortType,
    sort_lang: options?.sortLang,
    category: options?.filterCategory?.[0],
    country: options?.filterCountry?.[0],
    year: options?.filterYear?.[0],
    limit: options?.limit,
  };
  return getMoviesList('phim-le', apiOptions);
};

export const getCartoons = async (
  options?: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    sortField?: 'modified.time' | '_id' | 'year';
    sortType?: 'desc' | 'asc';
    sortLang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
    limit?: number;
  }
): Promise<TVSeriesResponse> => {
  const apiOptions = {
    page: options?.page,
    sort_field: options?.sortField,
    sort_type: options?.sortType,
    sort_lang: options?.sortLang,
    category: options?.filterCategory?.[0],
    country: options?.filterCountry?.[0],
    year: options?.filterYear?.[0],
    limit: options?.limit,
  };
  return getMoviesList('hoat-hinh', apiOptions);
};

// Lấy danh sách phim Vietsub
export const getVietSubMovies = async (
  options?: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    sortField?: 'modified.time' | '_id' | 'year';
    sortType?: 'desc' | 'asc';
    limit?: number;
  }
): Promise<TVSeriesResponse> => {
  const apiOptions = {
    page: options?.page,
    sort_field: options?.sortField,
    sort_type: options?.sortType,
    category: options?.filterCategory?.[0],
    country: options?.filterCountry?.[0],
    year: options?.filterYear?.[0],
    limit: options?.limit,
  };
  return getMoviesList('phim-vietsub', apiOptions);
};

// Lấy danh sách phim Thuyết Minh
export const getThuyetMinhMovies = async (
  options?: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    sortField?: 'modified.time' | '_id' | 'year';
    sortType?: 'desc' | 'asc';
    limit?: number;
  }
): Promise<TVSeriesResponse> => {
  const apiOptions = {
    page: options?.page,
    sort_field: options?.sortField,
    sort_type: options?.sortType,
    category: options?.filterCategory?.[0],
    country: options?.filterCountry?.[0],
    year: options?.filterYear?.[0],
    limit: options?.limit,
  };
  return getMoviesList('phim-thuyet-minh', apiOptions);
};

// Lấy danh sách phim Lồng Tiếng
export const getLongTiengMovies = async (
  options?: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    sortField?: 'modified.time' | '_id' | 'year';
    sortType?: 'desc' | 'asc';
    limit?: number;
  }
): Promise<TVSeriesResponse> => {
  const apiOptions = {
    page: options?.page,
    sort_field: options?.sortField,
    sort_type: options?.sortType,
    category: options?.filterCategory?.[0],
    country: options?.filterCountry?.[0],
    year: options?.filterYear?.[0],
    limit: options?.limit,
  };
  return getMoviesList('phim-long-tieng', apiOptions);
};

export interface EpisodeServerData {
    name: string;
    slug: string;
    filename: string;
    link_embed: string;
    link_m3u8: string;
}

export interface Episode {
    server_name: string;
    server_data: EpisodeServerData[];
}

export interface CategoryInfo {
    id: string;
    name: string;
    slug: string;
}

export interface CountryInfo {
    id:string;
    name: string;
    slug: string;
}

export interface DetailedMovie extends Omit<Movie, 'category' | 'country'> {
    actor: string[];
    director: string[];
    category: CategoryInfo[];
    country: CountryInfo[];
}

export interface MovieDetailData {
    status: boolean;
    msg: string;
    movie: DetailedMovie;
    episodes: Episode[];
}

export const getMovieBySlug = cache(async (slug: string): Promise<MovieDetailData | null> => {
    try {
        const url = `${BASE_URL}/phim/${slug}`;
        const res = await fetch(url, {
            next: { revalidate: DEFAULT_REVALIDATE_TIME },
        });
        if (!res.ok) {
            console.error(`Error fetching movie ${slug}: ${res.status} ${res.statusText}`);
            return null;
        }
        return res.json();
    } catch (error) {
        console.error(`Error fetching movie by slug "${slug}":`, error);
        return null;
    }
});
