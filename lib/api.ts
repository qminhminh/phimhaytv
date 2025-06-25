import axios from 'axios';

const BASE_URL = 'https://phimapi.com';

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

export interface CategoryResponse {
  status: boolean;
  items: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface CountryResponse {
  status: boolean;
  items: {
    id: string;
    name: string;
    slug: string;
  }[];
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
): Promise<TVSeriesResponse> => { // Tận dụng lại TVSeriesResponse vì cấu trúc có vẻ tương đồng
  try {
    const response = await axios.get(`${BASE_URL}/v1/api/danh-sach/${type_list}`, {
      params: {
        page: options.page || 1,
        sort_field: options.sort_field || 'modified.time',
        sort_type: options.sort_type || 'desc',
        sort_lang: options.sort_lang,
        category: options.category,
        country: options.country,
        year: options.year,
        limit: options.limit || 24,
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Axios error fetching movie list for type "${type_list}":`, {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    } else {
      console.error(`An unexpected error occurred while fetching movie list for type "${type_list}":`, error);
    }
    throw error;
  }
};

// Phim mới cập nhật
export const getLatestMovies = async (
  options: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    sortField?: 'modified.time' | 'year';
    sortType?: 'desc' | 'asc';
    limit?: number;
  } = {}
) => {
  const { page = 1, filterCategory, filterCountry, filterYear, sortField = 'modified.time', sortType = 'desc', limit = 24 } = options;

  // Nếu có bộ lọc, sử dụng API tìm kiếm
  if (filterCategory || filterCountry || filterYear || sortField !== 'modified.time') {
    return searchMovies(undefined, { 
      page, 
      category: filterCategory?.join(','),
      country: filterCountry?.join(','),
      year: filterYear?.join(','),
      sort_field: sortField,
      sort_type: sortType,
      limit,
    });
  }

  // Nếu không có bộ lọc, sử dụng API mặc định
  try {
    const response = await axios.get<MovieResponse>(`${BASE_URL}/danh-sach/phim-moi-cap-nhat-v3`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching latest movies:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    } else {
      console.error('An unexpected error occurred while fetching latest movies:', error);
    }
    throw error;
  }
};

// Thông tin Phim & Danh sách tập phim
export const getMovieDetail = async (slug: string) => {
  try {
    const response = await axios.get<MovieDetailResponse>(`${BASE_URL}/v1/api/phim/${slug}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Axios error fetching movie detail for slug "${slug}":`, {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    } else {
      console.error(`An unexpected error occurred while fetching movie detail for slug "${slug}":`, error);
    }
    return null; // Trả về null để không gây crash
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
    try {
      const response = await axios.get<SearchApiResponse>(`${BASE_URL}/v1/api/tim-kiem`, {
        params: {
          keyword: keyword || '',
          page: options.page || 1,
          sort_field: options.sort_field,
          sort_type: options.sort_type,
          sort_lang: options.sort_lang,
          category: options.category,
          country: options.country,
          year: options.year,
          limit: options.limit || 20,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Axios error searching movies with keyword "${keyword}":`, {
          message: error.message,
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          responseStatus: error.response?.status,
          responseData: error.response?.data,
        });
      } else {
        console.error(`An unexpected error occurred while searching movies with keyword "${keyword}":`, error);
      }
      throw error;
    }
  };

// Lấy danh sách thể loại phim
export const getCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/api/the-loai`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching categories:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    } else {
      console.error('An unexpected error occurred while fetching categories:', error);
    }
    return [];
  }
};

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
  try {
    const response = await axios.get<MovieResponse>(`${BASE_URL}/v1/api/the-loai/${categorySlug}`, {
      params: {
        page: options?.page || 1,
        sort_field: options?.sortField || 'modified.time',
        sort_type: options?.sortType || 'desc',
        sort_lang: options?.sortLang,
        country: options?.country,
        year: options?.year,
        limit: options?.limit || 24
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Axios error fetching movies by category "${categorySlug}":`, {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    } else {
      console.error(`An unexpected error occurred while fetching movies for category "${categorySlug}":`, error);
    }
    throw error;
  }
};

// Lấy danh sách quốc gia
export const getCountries = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/api/quoc-gia`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching countries:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    } else {
      console.error('An unexpected error occurred while fetching countries:', error);
    }
    return [];
  }
};

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
  try {
    const response = await axios.get<MovieResponse>(`${BASE_URL}/v1/api/quoc-gia/${countrySlug}`, {
      params: {
        page: options?.page || 1,
        sort_field: options?.sortField || 'modified.time',
        sort_type: options?.sortType || 'desc',
        sort_lang: options?.sortLang,
        category: options?.category,
        year: options?.year,
        limit: options?.limit || 24
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Axios error fetching movies by country "${countrySlug}":`, {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    } else {
      console.error(`An unexpected error occurred while fetching movies for country "${countrySlug}":`, error);
    }
    throw error;
  }
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
  try {
    const response = await axios.get<MovieResponse>(`${BASE_URL}/v1/api/nam-phat-hanh/${year}`, {
      params: {
        page: options?.page || 1,
        sort_field: options?.sortField || 'modified.time',
        sort_type: options?.sortType || 'desc',
        sort_lang: options?.sortLang,
        category: options?.category,
        country: options?.country,
        limit: options?.limit || 24
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Axios error fetching movies by year "${year}":`, {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    } else {
      console.error(`An unexpected error occurred while fetching movies for year "${year}":`, error);
    }
    throw error;
  }
};

// Lấy danh sách phim bộ
export const getTVSeries = async (
  options?: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    filterType?: string[];
    sortField?: string;
    sortType?: string;
    limit?: number;
  }
): Promise<TVSeriesResponse> => {
  try {
    const response = await axios.get<TVSeriesResponse>(`${BASE_URL}/v1/api/danh-sach/tv-shows`, {
      params: {
        page: options?.page || 1,
        "filter[category]": options?.filterCategory,
        "filter[country]": options?.filterCountry,
        "filter[year]": options?.filterYear,
        "filter[type]": options?.filterType,
        sort_field: options?.sortField,
        sort_type: options?.sortType,
        limit: options?.limit || 20
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching TV series:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    } else {
      console.error('An unexpected error occurred while fetching TV series:', error);
    }
    throw error;
  }
};

export const getSingleMovies = async (
  options?: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    filterType?: string[];
    sortField?: string;
    sortType?: string;
    limit?: number;
  }
): Promise<TVSeriesResponse> => {
  try {
    const response = await axios.get<TVSeriesResponse>(`${BASE_URL}/v1/api/danh-sach/phim-le`, {
      params: {
        page: options?.page || 1,
        "filter[category]": options?.filterCategory,
        "filter[country]": options?.filterCountry,
        "filter[year]": options?.filterYear,
        "filter[type]": options?.filterType,
        sort_field: options?.sortField,
        sort_type: options?.sortType,
        limit: options?.limit || 20
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching single movies:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    } else {
      console.error('An unexpected error occurred while fetching single movies:', error);
    }
    throw error;
  }
};

export const getCartoons = async (
  options?: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    filterType?: string[];
    sortField?: string;
    sortType?: string;
    limit?: number;
  }
): Promise<TVSeriesResponse> => {
  try {
    const response = await axios.get<TVSeriesResponse>(`${BASE_URL}/v1/api/danh-sach/hoat-hinh`, {
      params: {
        page: options?.page || 1,
        "filter[category]": options?.filterCategory,
        "filter[country]": options?.filterCountry,
        "filter[year]": options?.filterYear,
        "filter[type]": options?.filterType,
        sort_field: options?.sortField,
        sort_type: options?.sortType,
        limit: options?.limit || 20
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching cartoons:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    } else {
      console.error('An unexpected error occurred while fetching cartoons:', error);
    }
    throw error;
  }
};

// Lấy danh sách phim Vietsub
export const getVietSubMovies = async (
  options?: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    filterType?: string[];
    sortField?: string;
    sortType?: string;
    limit?: number;
  }
): Promise<TVSeriesResponse> => {
  try {
    // There might not be a direct endpoint, so we can use the general list with a language filter
    return await getMoviesList('phim-vietsub', options);
  } catch (error) {
    console.error('Error fetching VietSub movies:', error);
    throw error;
  }
};

// Lấy danh sách phim Thuyết Minh
export const getThuyetMinhMovies = async (
  options?: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    filterType?: string[];
    sortField?: string;
    sortType?: string;
    limit?: number;
  }
): Promise<TVSeriesResponse> => {
  try {
    return await getMoviesList('phim-thuyet-minh', options);
  } catch (error) {
    console.error('Error fetching Thuyet Minh movies:', error);
    throw error;
  }
};

// Lấy danh sách phim Lồng Tiếng
export const getLongTiengMovies = async (
  options?: {
    page?: number;
    filterCategory?: string[];
    filterCountry?: string[];
    filterYear?: string[];
    filterType?: string[];
    sortField?: string;
    sortType?: string;
    limit?: number;
  }
): Promise<TVSeriesResponse> => {
  try {
    return await getMoviesList('phim-long-tieng', options);
  } catch (error) {
    console.error('Error fetching Long Tieng movies:', error);
    throw error;
  }
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

export const getMovieBySlug = async (slug: string): Promise<MovieDetailData | null> => {
    try {
        const response = await axios.get<MovieDetailData>(`${BASE_URL}/phim/${slug}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Axios error fetching movie by slug "${slug}":`, {
                message: error.message,
                url: error.config?.url,
                method: error.config?.method,
                responseStatus: error.response?.status,
                responseData: error.response?.data,
            });
        } else {
            console.error(`An unexpected error occurred while fetching movie by slug "${slug}":`, error);
        }
        return null;
    }
}; 