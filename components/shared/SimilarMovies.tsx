import { getMoviesList, TVSeriesResponse } from "@/lib/api";
import CardViewMovie from "./CardViewMovie";

type Filter = 
    | { type: 'category'; slug: string; name: string }
    | { type: 'country'; slug: string; name: string };

type SimilarMoviesProps = {
    filter: Filter;
    movieType: 'single' | 'series' | string;
    currentMovieSlug: string;
};

const typeMap: { [key: string]: 'phim-le' | 'phim-bo' | 'tv-shows' | 'hoat-hinh' | 'phim-vietsub' | 'phim-thuyet-minh' | 'phim-long-tieng' } = {
    single: 'phim-le',
    series: 'phim-bo',
    tv_shows: 'tv-shows',
    hoat_hinh: 'hoat-hinh',
    phim_vietsub: 'phim-vietsub',
    phim_thuyet_minh: 'phim-thuyet-minh',
    phim_long_tieng: 'phim-long-tieng',
};

export async function SimilarMovies({ filter, movieType, currentMovieSlug }: SimilarMoviesProps) {
    const typeList = typeMap[movieType] || 'phim-le';
    
    let response: TVSeriesResponse | null = null;

    try {
        if (filter.type === 'category') {
            response = await getMoviesList(typeList, {
                category: filter.slug,
                limit: 7, // Lấy 7 để phòng trường hợp có phim hiện tại
            });
        } else if (filter.type === 'country') {
            response = await getMoviesList(typeList, {
                country: filter.slug,
                limit: 7, 
            });
        }
    } catch (error) {
        console.error(`Error fetching similar movies for ${filter.type} ${filter.slug}:`, error);
        return null; // Không hiển thị gì nếu có lỗi
    }

    if (!response?.data?.items || response.data.items.length === 0) {
        return null;
    }

    const imageDomain = response.data.APP_DOMAIN_CDN_IMAGE;
    
    const similarMovies = response.data.items
        .filter(movie => movie.slug !== currentMovieSlug)
        .slice(0, 6); // Hiển thị tối đa 6 phim

    if (similarMovies.length === 0) {
        return null;
    }

    const title = filter.type === 'category' 
        ? `Phim Cùng Thể Loại: ${filter.name}`
        : `Phim Cùng Quốc Gia: ${filter.name}`;

    return (
        <div className="mt-12">
            <h3 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4 text-primary">
                {title}
            </h3>
            <CardViewMovie items={similarMovies} imageDomain={imageDomain} />
        </div>
    );
} 
