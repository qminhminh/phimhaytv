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

// Phim mới cập nhật
export const getLatestMovies = async (page: number = 1) => {
  try {
    const response = await axios.get<MovieResponse>(`${BASE_URL}/danh-sach/phim-moi-cap-nhat-v3`, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy phim mới cập nhật:', error);
    throw error;
  }
};

// Thông tin Phim & Danh sách tập phim
export const getMovieDetail = async (slug: string) => {
  try {
    const response = await axios.get<MovieDetailResponse>(`${BASE_URL}/phim/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin phim:', error);
    throw error;
  }
};

// Tìm kiếm phim
export const searchMovies = async (
  keyword: string,
  options?: {
    page?: number;
    sortField?: 'modified.time' | '_id' | 'year';
    sortType?: 'desc' | 'asc';
    sortLang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
    category?: string;
    country?: string;
    year?: number;
    limit?: number;
  }
) => {
  try {
    const response = await axios.get<MovieResponse>(`${BASE_URL}/v1/api/tim-kiem`, {
      params: {
        keyword,
        page: options?.page || 1,
        sort_field: options?.sortField || 'modified.time',
        sort_type: options?.sortType || 'desc',
        sort_lang: options?.sortLang,
        category: options?.category,
        country: options?.country,
        year: options?.year,
        limit: options?.limit || 24
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tìm kiếm phim:', error);
    throw error;
  }
};

// Lấy danh sách thể loại phim
export const getCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/the-loai`);
    // Map lại _id thành id
    const items = response.data.map((item: any) => ({
      id: item._id,
      name: item.name,
      slug: item.slug,
    }));
    return { status: true, items };
  } catch (error) {
    console.error('Lỗi khi lấy thể loại phim:', error);
    throw error;
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
    console.error('Lỗi khi lấy phim theo thể loại:', error);
    throw error;
  }
};

// Lấy danh sách quốc gia
export const getCountries = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/quoc-gia`);
    const items = response.data.map((item: any) => ({
      id: item._id,
      name: item.name,
      slug: item.slug,
    }));
    return { status: true, items };
  } catch (error) {
    console.error('Lỗi khi lấy danh sách quốc gia:', error);
    throw error;
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
    console.error('Lỗi khi lấy phim theo quốc gia:', error);
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
    const response = await axios.get<MovieResponse>(`${BASE_URL}/v1/api/nam/${year}`, {
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
    console.error('Lỗi khi lấy phim theo năm:', error);
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
    const response = await axios.get<TVSeriesResponse>(`${BASE_URL}/v1/api/danh-sach/phim-bo`, {
      params: {
        page: options?.page || 1,
        "filter[category]": options?.filterCategory,
        "filter[country]": options?.filterCountry,
        "filter[year]": options?.filterYear,
        "filter[type]": options?.filterType,
        sort_field: options?.sortField,
        sort_type: options?.sortType,
        limit: options?.limit || 24
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phim bộ:', error);
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
        limit: options?.limit || 24
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phim lẻ:', error);
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
        limit: options?.limit || 24
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phim hoạt hình:', error);
    throw error;
  }
};

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
    const response = await axios.get<TVSeriesResponse>(`${BASE_URL}/v1/api/danh-sach/phim-vietsub`, {
      params: {
        page: options?.page || 1,
        "filter[category]": options?.filterCategory,
        "filter[country]": options?.filterCountry,
        "filter[year]": options?.filterYear,
        "filter[type]": options?.filterType,
        sort_field: options?.sortField,
        sort_type: options?.sortType,
        limit: options?.limit || 24
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phim Vietsub:', error);
    throw error;
  }
};

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
    const response = await axios.get<TVSeriesResponse>(`${BASE_URL}/v1/api/danh-sach/phim-thuyet-minh`, {
      params: {
        page: options?.page || 1,
        "filter[category]": options?.filterCategory,
        "filter[country]": options?.filterCountry,
        "filter[year]": options?.filterYear,
        "filter[type]": options?.filterType,
        sort_field: options?.sortField,
        sort_type: options?.sortType,
        limit: options?.limit || 24
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phim Thuyết Minh:', error);
    throw error;
  }
};

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
    const response = await axios.get<TVSeriesResponse>(`${BASE_URL}/v1/api/danh-sach/phim-long-tieng`, {
      params: {
        page: options?.page || 1,
        "filter[category]": options?.filterCategory,
        "filter[country]": options?.filterCountry,
        "filter[year]": options?.filterYear,
        "filter[type]": options?.filterType,
        sort_field: options?.sortField,
        sort_type: options?.sortType,
        limit: options?.limit || 24
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phim Lồng Tiếng:', error);
    throw error;
  }
}; 