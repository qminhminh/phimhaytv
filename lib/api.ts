import 'server-only';

const BASE_URL = 'https://phimapi.com';
const DEFAULT_REVALIDATE_TIME = 3600; // 1 giờ

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
  const { page = 1, limit = 24, ...rest } = options;
  const params = {
    page,
    limit,
    ...rest,
  };
  return await fetcher<TVSeriesResponse>(`/v1/api/danh-sach/${type_list}`, params);
};

// Phim mới cập nhật
export const getLatestMovies = async (
  options: {
    page?: number;
    limit?: number;
  } = {}
): Promise<TVSeriesResponse> => {
  const params = {
    page: options.page,
    limit: options.limit,
  };

  interface LatestMoviesApiResponse {
    status: boolean;
    items: TVSeriesResponse['data']['items'];
    pagination: TVSeriesResponse['data']['params']['pagination'];
  }
  
  const response = await fetcher<LatestMoviesApiResponse>('/danh-sach/phim-moi-cap-nhat-v3', params);

  // Adapt the response to match TVSeriesResponse structure that the app expects
  return {
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

// Lấy danh sách thể loại phim
export const getCategories = async () => {
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
    const params = {
        page: options?.page || 1,
        sort_field: options?.sortField || 'modified.time',
        sort_type: options?.sortType || 'desc',
        sort_lang: options?.sortLang,
        country: options?.country,
        year: options?.year,
        limit: options?.limit || 24
    };
    return fetcher<MovieResponse>(`/v1/api/the-loai/${categorySlug}`, params);
};

// Lấy danh sách quốc gia
export const getCountries = async () => {
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
    const params = {
        page: options?.page || 1,
        sort_field: options?.sortField || 'modified.time',
        sort_type: options?.sortType || 'desc',
        sort_lang: options?.sortLang,
        category: options?.category,
        year: options?.year,
        limit: options?.limit || 24
    };
    return fetcher<MovieResponse>(`/v1/api/quoc-gia/${countrySlug}`, params);
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
    return fetcher<MovieResponse>(`/v1/api/nam-phat-hanh/${year}`, params);
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

export const getMovieBySlug = async (slug: string): Promise<MovieDetailData | null> => {
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
};

// ===== THÊM CÁC INTERFACE VÀ FUNCTION MỚI ĐỂ TẠO GIÁ TRỊ ĐỘC ĐÁO =====

// Interface cho đánh giá người dùng
export interface UserRating {
    id: string;
    movieSlug: string;
    userId: string;
    userName: string;
    rating: number; // 1-10
    review?: string;
    createdAt: string;
    likes: number;
    isVerified: boolean;
}

// Interface cho bình luận
export interface UserComment {
    id: string;
    movieSlug: string;
    episodeSlug?: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: string;
    likes: number;
    replies: UserComment[];
    parentId?: string;
    isSpoiler: boolean;
}

// Interface cho thống kê phim độc đáo
export interface MovieStats {
    movieSlug: string;
    totalViews: number;
    totalRatings: number;
    averageRating: number;
    completionRate: number; // % người xem hết phim
    popularEpisodes: string[]; // tập được xem nhiều nhất
    viewsByCountry: Record<string, number>;
    watchTimeDistribution: {
        mobile: number;
        desktop: number;
        tablet: number;
    };
    peakViewingHours: number[]; // giờ xem nhiều nhất
}

// Interface cho nội dung biên tập
export interface EditorialContent {
    movieSlug: string;
    title: string;
    subtitle?: string;
    content: string;
    author: string;
    authorBio?: string;
    publishedAt: string;
    tags: string[];
    readingTime: number; // phút
    relatedMovies: string[];
    isFeatured: boolean;
}

// Interface cho gợi ý thông minh
export interface SmartRecommendation {
    movieSlug: string;
    recommendedMovies: {
        slug: string;
        reason: string; // "Vì bạn thích thể loại hành động", "Diễn viên giống nhau"
        similarity: number; // 0-1
        priority: number; // 1-10
    }[];
    personalizedReason?: string;
}

// Interface cho thông tin phân tích
export interface MovieAnalysis {
    movieSlug: string;
    plotSummary: string; // tóm tắt không spoil
    strengths: string[];
    weaknesses: string[];
    bestFor: string[]; // "fan hành động", "người mới bắt đầu"
    contentWarnings: string[];
    culturalContext?: string;
    trivia: string[];
    behindTheScenes?: string[];
}

// Interface mở rộng cho movie data với thông tin độc đáo
export interface EnhancedMovieDetail extends DetailedMovie {
    userStats: MovieStats;
    editorialContent?: EditorialContent;
    analysis: MovieAnalysis;
    userRatings: UserRating[];
    featuredReviews: UserRating[];
    smartRecommendations: SmartRecommendation;
    uniqueDescription: string; // mô tả do biên tập viên viết
    watchGuide?: {
        bestViewingOrder?: string[];
        skipableEpisodes?: string[];
        mustWatchEpisodes: string[];
        viewingTips: string[];
    };
}

// Function để lấy enhanced movie data
export const getEnhancedMovieData = async (slug: string): Promise<EnhancedMovieDetail | null> => {
    // Trong thực tế, đây sẽ là các API call riêng biệt
    // Hiện tại tạo mock data để demo
    const baseData = await getMovieBySlug(slug);
    if (!baseData?.movie) return null;

    // Smart mock data dựa trên metadata thực từ API
    const enhancedData: EnhancedMovieDetail = {
        ...baseData.movie,
        userStats: generateStableStats(slug),
        analysis: {
            movieSlug: slug,
            plotSummary: generateUniquePlotSummary(baseData.movie),
            strengths: generateMovieStrengths(baseData.movie),
            weaknesses: generateMovieWeaknesses(baseData.movie),
            bestFor: generateBestForAudience(baseData.movie),
            contentWarnings: generateContentWarnings(baseData.movie),
            culturalContext: generateCulturalContext(baseData.movie),
            trivia: generateTrivia(baseData.movie),
            behindTheScenes: generateBehindTheScenes(baseData.movie),
        },
        userRatings: generateMockUserRatings(slug, generateStableStats(slug).totalRatings),
        featuredReviews: generateMockFeaturedReviews(slug, baseData.movie),
        smartRecommendations: {
            movieSlug: slug,
            recommendedMovies: [], // Sẽ được tính toán dựa trên AI
        },
        uniqueDescription: generateUniqueDescription(baseData.movie),
        watchGuide: generateWatchGuide(baseData.movie),
    };

    return enhancedData;
};

// Helper functions để tạo nội dung độc đáo dựa trên metadata thực
function generateUniquePlotSummary(movie: DetailedMovie): string {
    const category = movie.category[0]?.name || 'phim';
    const country = movie.country[0]?.name || 'quốc tế';
    const mainActors = movie.actor.slice(0, 2).join(', ');
    
    // Template dựa trên thể loại
    const templates = {
        'Hành Động': `${movie.name} là một tác phẩm hành động đầy kịch tính từ ${country}. Với sự tham gia của ${mainActors}, phim mang đến những cảnh quay mãn nhãn và cốt truyện căng thẳng. Đây là lựa chọn hoàn hảo cho những ai yêu thích thể loại hành động hiện đại.`,
        'Tình Cảm': `${movie.name} kể về một câu chuyện tình yêu cảm động từ ${country}. Với diễn xuất tự nhiên của ${mainActors}, bộ phim khám phá những cung bậc cảm xúc sâu lắng và ý nghĩa của tình yêu chân thật.`,
        'Kinh Dị': `${movie.name} mang đến trải nghiệm kinh dị đầy ám ảnh từ ${country}. Sự kết hợp giữa câu chuyện ly kỳ và diễn xuất ấn tượng của ${mainActors} tạo nên một tác phẩm không thể bỏ qua cho fan thể loại kinh dị.`,
        'Hài': `${movie.name} là bộ phim hài hước tươi mới từ ${country}. Với những tình huống dí dỏm và diễn xuất hài hước của ${mainActors}, phim mang đến tiếng cười sảng khoái cho khán giả.`
    };
    
    const template = templates[category as keyof typeof templates] || 
        `${movie.name} mang đến một câu chuyện ${category.toLowerCase()} độc đáo từ ${country}. Với sự tham gia của ${mainActors}, bộ phim khám phá những chủ đề sâu sắc và mang tính nhân văn cao.`;
    
    return template;
}

function generateMovieStrengths(movie: DetailedMovie): string[] {
    const strengths = [];
    
    // Dựa trên năm sản xuất
    if (movie.year >= 2022) strengths.push("Công nghệ quay phim hiện đại");
    else if (movie.year >= 2018) strengths.push("Chất lượng hình ảnh sắc nét");
    else if (movie.year >= 2015) strengths.push("Kỹ thuật quay phim ổn định");
    
    // Dựa trên thể loại
    const categories = movie.category.map(c => c.name);
    if (categories.some(c => c.includes('Hành Động'))) {
        strengths.push("Cảnh hành động mãn nhãn", "Biên đạo võ thuật chuyên nghiệp");
    }
    if (categories.some(c => c.includes('Tình Cảm'))) {
        strengths.push("Cảm xúc sâu lắng", "Diễn xuất tự nhiên và chân thật");
    }
    if (categories.some(c => c.includes('Hài'))) {
        strengths.push("Tình huống hài hước độc đáo", "Diễn xuất hài tự nhiên");
    }
    if (categories.some(c => c.includes('Kinh Dị'))) {
        strengths.push("Hiệu ứng đặc biệt ấn tượng", "Không khí kinh dị được xây dựng tốt");
    }
    if (categories.some(c => c.includes('Khoa Học Viễn Tưởng'))) {
        strengths.push("Concept khoa học viễn tưởng độc đáo", "Visual effects chất lượng cao");
    }
    
    // Dựa trên quốc gia
    const countries = movie.country.map(c => c.name);
    if (countries.includes('Hàn Quốc')) {
        strengths.push("Phong cách điện ảnh Hàn Quốc đặc trưng", "Cốt truyện tinh tế");
    }
    if (countries.includes('Nhật Bản')) {
        strengths.push("Văn hóa Nhật Bản đậm đặc", "Chi tiết được chăm chút tỉ mỉ");
    }
    if (countries.includes('Thái Lan')) {
        strengths.push("Phong cách điện ảnh Thái Lan tươi mới");
    }
    if (countries.includes('Trung Quốc')) {
        strengths.push("Quy mô sản xuất lớn", "Bối cảnh hoành tráng");
    }
    if (countries.includes('Mỹ')) {
        strengths.push("Ngân sách sản xuất khủng", "Kỹ xảo điện ảnh hàng đầu");
    }
    
    // Dựa trên ngôn ngữ/phụ đề
    if (movie.lang.includes('Vietsub')) {
        strengths.push("Phụ đề tiếng Việt chất lượng cao");
    }
    if (movie.lang.includes('Thuyết minh')) {
        strengths.push("Lồng tiếng Việt chuyên nghiệp");
    }
    
    // Thêm một số điểm mạnh chung
    strengths.push("Cốt truyện hấp dẫn", "Diễn xuất ấn tượng", "Âm nhạc phim hay");
    
    return Array.from(new Set(strengths)).slice(0, 6); // Loại bỏ trùng lặp và lấy 6 điểm
}

function generateMovieWeaknesses(movie: DetailedMovie): string[] {
    const weaknesses = [];
    
    // Dựa trên năm sản xuất
    if (movie.year < 2010) {
        weaknesses.push("Chất lượng hình ảnh có thể lỗi thời");
    } else if (movie.year < 2015) {
        weaknesses.push("Một số hiệu ứng có thể chưa hiện đại");
    }
    
    // Dựa trên thời lượng
    if (movie.time && movie.time.includes('min')) {
        const duration = parseInt(movie.time);
        if (duration > 180) {
            weaknesses.push("Thời lượng khá dài, cần thời gian xem");
        } else if (duration < 80) {
            weaknesses.push("Thời lượng ngắn, có thể chưa phát triển đủ cốt truyện");
        }
    }
    
    // Dựa trên thể loại
    const categories = movie.category.map(c => c.name);
    if (categories.some(c => c.includes('Kinh Dị'))) {
        weaknesses.push("Không phù hợp với người nhạy cảm");
    }
    if (categories.some(c => c.includes('Hành Động'))) {
        weaknesses.push("Một số cảnh bạo lực có thể không phù hợp trẻ nhỏ");
    }
    
    // Thêm một số điểm yếu chung nhẹ nhàng
    if (weaknesses.length < 2) {
        weaknesses.push("Một số cảnh có thể hơi chậm");
        weaknesses.push("Cần tập trung cao để theo dõi cốt truyện");
    }
    
    return weaknesses.slice(0, 3); // Tối đa 3 điểm yếu
}

function generateBestForAudience(movie: DetailedMovie): string[] {
    const audience = [];
    
    // Dựa trên thể loại
    const categories = movie.category.map(c => c.name);
    categories.forEach(category => {
        audience.push(`Fan thể loại ${category}`);
    });
    
    // Dựa trên quốc gia
    const countries = movie.country.map(c => c.name);
    countries.forEach(country => {
        audience.push(`Người yêu phim ${country}`);
    });
    
    // Dựa trên năm sản xuất
    if (movie.year >= 2020) {
        audience.push("Người thích phim mới và hiện đại");
    } else if (movie.year >= 2010) {
        audience.push("Fan phim thập niên 2010s");
    } else {
        audience.push("Người yêu phim kinh điển");
    }
    
    // Thêm một số đối tượng chung
    audience.push("Người xem giải trí cuối tuần");
    audience.push("Những ai muốn thư giãn sau ngày làm việc");
    
    return Array.from(new Set(audience)).slice(0, 5); // Loại bỏ trùng lặp và lấy 5 nhóm đối tượng
}

function generateContentWarnings(movie: DetailedMovie): string[] {
    const warnings = [];
    
    // Dựa trên thể loại
    const categories = movie.category.map(c => c.name);
    
    if (categories.some(c => c.includes('Kinh Dị'))) {
        warnings.push("Có cảnh kinh dị, không phù hợp trẻ dưới 16 tuổi");
        warnings.push("Có thể gây ác mộng cho người nhạy cảm");
    }
    
    if (categories.some(c => c.includes('Hành Động'))) {
        warnings.push("Có cảnh bạo lực và đánh nhau");
    }
    
    if (categories.some(c => c.includes('Chiến Tranh'))) {
        warnings.push("Có cảnh chiến tranh máu me");
        warnings.push("Nội dung nặng về tâm lý");
    }
    
    if (categories.some(c => c.includes('Tình Cảm')) && movie.year >= 2018) {
        warnings.push("Có thể có cảnh thân mật nhẹ");
    }
    
    if (categories.some(c => c.includes('Hài'))) {
        warnings.push("Một số tình huống hài có thể không phù hợp mọi lứa tuổi");
    }
    
    // Cảnh báo chung dựa trên năm sản xuất
    if (movie.year < 2000) {
        warnings.push("Phim cũ, chất lượng hình ảnh có thể không rõ nét");
    }
    
    return warnings;
}

function generateCulturalContext(movie: DetailedMovie): string | undefined {
    const countries = movie.country.map(c => c.name);
    const categories = movie.category.map(c => c.name);
    
    if (countries.includes('Hàn Quốc')) {
        if (categories.some(c => c.includes('Tình Cảm'))) {
            return "Phim phản ánh văn hóa tình yêu đặc trưng của Hàn Quốc, với những giá trị gia đình và tình cảm sâu sắc. Khán giả sẽ được trải nghiệm phong cách sống hiện đại nhưng vẫn giữ được truyền thống Á Đông.";
        } else if (categories.some(c => c.includes('Hành Động'))) {
            return "Tác phẩm thể hiện tinh thần kiên cường và văn hóa võ thuật của Hàn Quốc, kết hợp giữa kỹ thuật đại và triết lý phương Đông.";
        }
        return "Phim mang đậm bản sắc văn hóa Hàn Quốc hiện đại, phản ánh xã hội và lối sống của người dân xứ kim chi.";
    }
    
    if (countries.includes('Nhật Bản')) {
        return "Tác phẩm thể hiện văn hóa Nhật Bản tinh tế với triết lý sống đặc trưng, từ tinh thần bushido đến vẻ đẹp của thiên nhiên và con người.";
    }
    
    if (countries.includes('Thái Lan')) {
        return "Phim phản ánh văn hóa Thái Lan tươi vui và phong phú, với những truyền thống Phật giáo và lối sống nhiệt đới đặc trưng.";
    }
    
    if (countries.includes('Trung Quốc')) {
        if (categories.some(c => c.includes('Cổ Trang'))) {
            return "Tác phẩm tái hiện vẻ đẹp của văn hóa Trung Hoa cổ đại, từ triết lý Khổng Mạnh đến nghệ thuật võ thuật truyền thống.";
        }
        return "Phim thể hiện sự phát triển mạnh mẽ của xã hội Trung Quốc hiện đại, kết hợp giữa truyền thống và đổi mới.";
    }
    
    if (countries.includes('Mỹ')) {
        return "Tác phẩm mang đậm văn hóa phương Tây với tinh thần tự do, cá nhân chủ nghĩa và những giá trị dân chủ đặc trưng của Mỹ.";
    }
    
    return undefined;
}

function generateTrivia(movie: DetailedMovie): string[] {
    const trivia = [];
    
    // Thông tin cơ bản
    trivia.push(`Phim được sản xuất vào năm ${movie.year}`);
    trivia.push(`Thuộc thể loại ${movie.category.map(c => c.name).join(', ')}`);
    
    if (movie.director.length > 0) {
        trivia.push(`Đạo diễn: ${movie.director.join(', ')}`);
    }
    
    if (movie.actor.length > 0) {
        trivia.push(`Diễn viên chính: ${movie.actor.slice(0, 3).join(', ')}`);
    }
    
    // Thông tin dựa trên metadata
    if (movie.quality) {
        trivia.push(`Chất lượng video: ${movie.quality}`);
    }
    
    if (movie.lang) {
        trivia.push(`Ngôn ngữ: ${movie.lang}`);
    }
    
    // Thông tin thú vị dựa trên thể loại
    const categories = movie.category.map(c => c.name);
    if (categories.includes('Hành Động') && movie.year >= 2015) {
        trivia.push("Các cảnh hành động được quay thật không sử dụng diễn viên đóng thế");
    }
    
    if (categories.includes('Kinh Dị')) {
        trivia.push("Nhiều cảnh quay được thực hiện vào ban đêm để tăng hiệu ứng kinh dị");
    }
    
    if (movie.country.some(c => c.name === 'Hàn Quốc') && movie.year >= 2019) {
        trivia.push("Phim góp phần làm nên Hallyu Wave - làn sóng văn hóa Hàn Quốc");
    }
    
    return trivia.slice(0, 6);
}

function generateBehindTheScenes(movie: DetailedMovie): string[] {
    const behind = [];
    
    // Thông tin chung dựa trên thể loại
    const categories = movie.category.map(c => c.name);
    
    if (categories.some(c => c.includes('Hành Động'))) {
        behind.push("Diễn viên đã trải qua quá trình tập luyện võ thuật chuyên sâu");
        behind.push("Nhiều cảnh quay nguy hiểm được thực hiện với biện pháp an toàn cao");
    }
    
    if (categories.some(c => c.includes('Tình Cảm'))) {
        behind.push("Các diễn viên đã dành thời gian để xây dựng chemistry tự nhiên");
        behind.push("Nhiều cảnh quay được thực hiện tại địa điểm có ý nghĩa đặc biệt");
    }
    
    if (categories.some(c => c.includes('Kinh Dị'))) {
        behind.push("Đoàn làm phim đã nghiên cứu kỹ lưỡng tâm lý học để tạo hiệu ứng kinh dị");
        behind.push("Nhiều hiệu ứng âm thanh được ghi âm trực tiếp tại trường quay");
    }
    
    // Thông tin dựa trên quốc gia sản xuất
    if (movie.country.some(c => c.name === 'Hàn Quốc')) {
        behind.push("Đoàn phim Hàn Quốc nổi tiếng với sự tỉ mỉ trong từng chi tiết");
    }
    
    if (movie.country.some(c => c.name === 'Nhật Bản')) {
        behind.push("Quy trình sản xuất tuân theo tiêu chuẩn nghiêm ngặt của điện ảnh Nhật");
    }
    
    // Thông tin dựa trên năm sản xuất
    if (movie.year >= 2020) {
        behind.push("Quá trình quay phim phải tuân thủ các biện pháp an toàn COVID-19");
    }
    
    if (movie.year >= 2018) {
        behind.push("Sử dụng công nghệ quay phim 4K và kỹ thuật hậu kỳ hiện đại");
    }
    
    // Thông tin chung
    behind.push("Đoàn phim đã cố gắng tái hiện chân thực nhất bối cảnh và tình huống");
    behind.push("Quá trình casting kéo dài nhiều tháng để tìm diễn viên phù hợp");
    
    return behind.slice(0, 4);
}

function generateUniqueDescription(movie: DetailedMovie): string {
    const category = movie.category[0]?.name || 'điện ảnh';
    const country = movie.country[0]?.name || 'quốc tế';
    
    return `Khám phá sâu sắc về ${movie.name} - một kiệt tác ${category.toLowerCase()} đặc sắc từ ${country}. Đội ngũ chuyên gia phân tích của PhimHayTV mang đến góc nhìn độc đáo và đánh giá toàn diện về tác phẩm này. Từ nghệ thuật điện ảnh, diễn xuất, đến những thông điệp ẩn giấu, chúng tôi giúp bạn hiểu rõ hơn về giá trị nghệ thuật và ý nghĩa nhân văn mà bộ phim muốn truyền tải. Đây không chỉ là nơi xem phim mà còn là không gian để thưởng thức và tìm hiểu điện ảnh một cách sâu sắc nhất.`;
}

function generateWatchGuide(movie: DetailedMovie): any {
    const categories = movie.category.map(c => c.name);
    const guide: any = {
        viewingTips: [],
        mustWatchEpisodes: [],
        skipableEpisodes: []
    };
    
    // Tips chung dựa trên thể loại
    if (categories.some(c => c.includes('Kinh Dị'))) {
        guide.viewingTips.push("Nên xem trong phòng tối để tăng hiệu ứng kinh dị");
        guide.viewingTips.push("Chuẩn bị tinh thần cho những cảnh đột ngột");
    } else if (categories.some(c => c.includes('Tình Cảm'))) {
        guide.viewingTips.push("Thích hợp xem cùng người thân yêu");
        guide.viewingTips.push("Chuẩn bị khăn giấy cho những cảnh cảm động");
    } else if (categories.some(c => c.includes('Hành Động'))) {
        guide.viewingTips.push("Nên xem với âm lượng vừa phải để tận hưởng hiệu ứng âm thanh");
        guide.viewingTips.push("Tập trung cao để không bỏ lỡ các cảnh hành động nhanh");
    }
    
    // Tips chung cho chất lượng
    if (movie.quality && movie.quality.includes('HD')) {
        guide.viewingTips.push("Nên xem ở chất lượng HD để có trải nghiệm tốt nhất");
    }
    
    guide.viewingTips.push("Nên xem trong môi trường yên tĩnh để tập trung");
    guide.viewingTips.push("Tắt thông báo điện thoại để không bị làm phiền");
    
    // Hướng dẫn cho series
    if (movie.type === 'series') {
        guide.mustWatchEpisodes = ["Tập 1 - Giới thiệu nhân vật", "Tập cuối - Kết thúc câu chuyện"];
        guide.viewingTips.push("Nên xem liên tục để hiểu rõ mạch truyện");
        guide.viewingTips.push("Chú ý đến các chi tiết nhỏ ở tập đầu, có thể là manh mối quan trọng");
        
        if (categories.some(c => c.includes('Trinh Thám'))) {
            guide.viewingTips.push("Ghi chú lại các manh mối để dự đoán kết thúc");
        }
    }
    
    return guide;
}

// Tạo consistent random data dựa trên movie slug
function generateStableStats(slug: string): MovieStats {
    // Tạo seed từ slug để có kết quả consistent
    const seed = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
        const x = Math.sin(seed) * 10000;
        return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };
    
    const totalViews = random(15000, 150000);
    const totalRatings = Math.floor(totalViews * random(5, 15) / 100); // 5-15% người xem đánh giá
    
    return {
        movieSlug: slug,
        totalViews,
        totalRatings,
        averageRating: random(70, 95) / 10, // 7.0-9.5
        completionRate: random(75, 95), // 75-95%
        popularEpisodes: [],
        viewsByCountry: {
            'Việt Nam': Math.floor(totalViews * random(60, 80) / 100),
            'Thái Lan': Math.floor(totalViews * random(10, 20) / 100),
            'Malaysia': Math.floor(totalViews * random(5, 10) / 100),
            'Singapore': Math.floor(totalViews * random(3, 7) / 100),
        },
        watchTimeDistribution: {
            mobile: random(45, 65),
            desktop: random(25, 40),
            tablet: random(10, 20),
        },
        peakViewingHours: [19, 20, 21, 22], // 7-10 PM
    };
}

// Tạo mock user ratings dựa trên movie metadata
function generateMockUserRatings(slug: string, totalRatings: number): UserRating[] {
    const ratings: UserRating[] = [];
    const seed = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Tạo random consistent
    let randomSeed = seed;
    const seededRandom = () => {
        randomSeed = (randomSeed * 9301 + 49297) % 233280;
        return randomSeed / 233280;
    };
    
    const userNames = [
        'MovieLover123', 'CinemaFan', 'PhimHayVN', 'KDramaAddict', 'ActionHero',
        'RomanceFan', 'HorrorExpert', 'ComedyKing', 'ThrillerJunkie', 'FamilyTime',
        'WeekendViewer', 'FilmCritic', 'CasualWatcher', 'SeriesMarathoner', 'NightOwl'
    ];
    
    const sampleReviews = [
        'Phim hay, diễn xuất tốt, cốt truyện hấp dẫn!',
        'Chất lượng hình ảnh đẹp, âm nhạc phù hợp.',
        'Đáng xem, giải trí tốt cho cuối tuần.',
        'Diễn viên chính rất ấn tượng, phim đáng tiền.',
        'Cảm động, nhiều bài học ý nghĩa.',
        'Hấp dẫn từ đầu đến cuối, không thể rời mắt.',
        'Phim hay nhưng hơi dài, cần kiên nhẫn.',
        'Tuyệt vời! Một trong những phim hay nhất năm.',
    ];
    
    // Tạo khoảng 10-20 ratings để demo
    const numRatings = Math.min(Math.floor(seededRandom() * 10) + 10, 20);
    
    for (let i = 0; i < numRatings; i++) {
        const rating: UserRating = {
            id: `rating_${slug}_${i}`,
            movieSlug: slug,
            userId: `user_${Math.floor(seededRandom() * 1000)}`,
            userName: userNames[Math.floor(seededRandom() * userNames.length)],
            rating: Math.floor(seededRandom() * 4) + 7, // 7-10 điểm
            review: seededRandom() > 0.3 ? sampleReviews[Math.floor(seededRandom() * sampleReviews.length)] : undefined,
            createdAt: new Date(Date.now() - Math.floor(seededRandom() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            likes: Math.floor(seededRandom() * 50),
            isVerified: seededRandom() > 0.7
        };
        ratings.push(rating);
    }
    
    return ratings;
}

// Tạo featured reviews dựa trên movie
function generateMockFeaturedReviews(slug: string, movie: DetailedMovie): UserRating[] {
    const seed = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let randomSeed = seed;
    const seededRandom = () => {
        randomSeed = (randomSeed * 9301 + 49297) % 233280;
        return randomSeed / 233280;
    };
    
    const categories = movie.category.map(c => c.name);
    const country = movie.country[0]?.name || 'quốc tế';
    
    // Reviews templates dựa trên thể loại
    let reviewTemplates: string[] = [];
    
    if (categories.some(c => c.includes('Hành Động'))) {
        reviewTemplates = [
            `Một tác phẩm hành động đỉnh cao từ ${country}! Các cảnh quay mãn nhãn, hiệu ứng đặc biệt tuyệt vời. Diễn xuất của ${movie.actor.slice(0, 2).join(' và ')} rất thuyết phục. Đáng xem!`,
            `Phim hành động hay với nhịp độ nhanh, không có thời gian chán. Cốt truyện logic, personajes được phát triển tốt. Recommend cho fan thể loại action.`,
        ];
    } else if (categories.some(c => c.includes('Tình Cảm'))) {
        reviewTemplates = [
            `Một câu chuyện tình yêu cảm động và chân thật. Diễn xuất của ${movie.actor.slice(0, 2).join(' và ')} rất tự nhiên và có chemistry. Phim khiến mình khóc nhiều lần. Tuyệt vời!`,
            `Romance đẹp với message ý nghĩa về tình yêu và cuộc sống. Cinematography đẹp, âm nhạc phù hợp. Đáng xem cho những ai yêu thích thể loại romance.`,
        ];
    } else if (categories.some(c => c.includes('Kinh Dị'))) {
        reviewTemplates = [
            `Phim kinh dị chất lượng với atmosphere rất tốt. Không rely quá nhiều vào jump scare mà tập trung vào psychological horror. Diễn xuất convincing, plot twist bất ngờ.`,
            `Scary và ám ảnh! Production value cao, sound design tuyệt vời. Không recommend cho người yếu tim nhưng rất đáng xem cho fan horror.`,
        ];
    } else {
        reviewTemplates = [
            `Phim hay với content quality cao từ ${country}. Diễn xuất tốt, cốt truyện hấp dẫn, production value ổn. Worth watching!`,
            `Một tác phẩm đáng xem với many layers of meaning. Character development tốt, pacing hợp lý. Recommend cho mọi người.`,
        ];
    }
    
    const expertNames = ['PhimHayEditor', 'CinemaExpert', 'FilmReviewer', 'MovieCritic'];
    
    const featured: UserRating[] = [];
    const numFeatured = Math.min(Math.floor(seededRandom() * 2) + 2, 3); // 2-3 featured reviews
    
    for (let i = 0; i < numFeatured; i++) {
        const review: UserRating = {
            id: `featured_${slug}_${i}`,
            movieSlug: slug,
            userId: `expert_${i}`,
            userName: expertNames[Math.floor(seededRandom() * expertNames.length)],
            rating: Math.floor(seededRandom() * 2) + 8, // 8-9 điểm cho featured
            review: reviewTemplates[Math.floor(seededRandom() * reviewTemplates.length)],
            createdAt: new Date(Date.now() - Math.floor(seededRandom() * 7) * 24 * 60 * 60 * 1000).toISOString(),
            likes: Math.floor(seededRandom() * 100) + 50, // 50-150 likes
            isVerified: true
        };
        featured.push(review);
    }
    
    return featured;
} 