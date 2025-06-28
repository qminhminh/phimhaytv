import { getMoviesList } from "@/lib/api";
import CardViewMovie from "./CardViewMovie";

type SimilarMoviesProps = {
    categorySlug: string;
    type: 'single' | 'series' | string;
    currentMovieSlug: string;
};

const typeMap = {
    single: 'phim-le',
    series: 'phim-bo',
};

export async function SimilarMovies({ categorySlug, type, currentMovieSlug }: SimilarMoviesProps) {
    // @ts-ignore
    const typeList = typeMap[type] || 'phim-le';

    const response = await getMoviesList(typeList, {
        category: categorySlug,
        limit: 12, // Lấy 12 phim
    });

    if (!response?.data?.items || response.data.items.length === 0) {
        return null;
    }

    const imageDomain = response.data.APP_DOMAIN_CDN_IMAGE;

    const similarMovies = response.data.items
        .filter(movie => movie.slug !== currentMovieSlug)
        .slice(0, 10); // Hiển thị tối đa 10 phim

    if (similarMovies.length === 0) {
        return null;
    }

    return (
        <div className="mt-12">
            <h3 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4 text-primary">
                Phim Tương Tự
            </h3>
            <CardViewMovie items={similarMovies} imageDomain={imageDomain} />
        </div>
    );
} 
