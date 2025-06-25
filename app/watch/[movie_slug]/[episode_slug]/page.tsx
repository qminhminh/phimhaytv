import { getMovieBySlug, getLatestMovies, Episode, EpisodeServerData } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateStaticParams() {
    const moviesData = await getLatestMovies({ limit: 20 });
    if (!moviesData || !moviesData.items) {
        return [];
    }

    const params: { movie_slug: string; episode_slug: string }[] = [];

    for (const movie of moviesData.items) {
        try {
            const detailData = await getMovieBySlug(movie.slug);
            if (detailData && detailData.episodes) {
                for (const server of detailData.episodes) {
                    for (const episode of server.server_data) {
                        params.push({
                            movie_slug: movie.slug,
                            episode_slug: episode.slug,
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Could not generate params for movie ${movie.slug}`, error);
        }
    }

    return params;
}


type WatchPageProps = {
    params: {
        movie_slug: string;
        episode_slug: string;
    };
};

const findEpisode = (episodes: Episode[], episode_slug: string): { episode: EpisodeServerData, serverName: string } | null => {
    for (const server of episodes) {
        const found = server.server_data.find(ep => ep.slug === episode_slug);
        if (found) {
            return { episode: found, serverName: server.server_name };
        }
    }
    return null;
}

export default async function WatchPage({ params }: WatchPageProps) {
    const { movie_slug, episode_slug } = params;

    const data = await getMovieBySlug(movie_slug);

    if (!data || !data.movie) {
        notFound();
    }

    const { movie, episodes } = data;
    const currentEpisodeData = findEpisode(episodes, episode_slug);

    if (!currentEpisodeData) {
        notFound();
    }

    const { episode: currentEpisode, serverName } = currentEpisodeData;

    return (
        <div className="bg-background text-white min-h-screen">
            <div className="container mx-auto px-2 sm:px-4 py-6">
                {/* Video Player */}
                <div className="aspect-video w-full mb-6 shadow-2xl shadow-primary/20 rounded-lg overflow-hidden bg-black">
                    <iframe
                        key={currentEpisode.link_embed}
                        src={currentEpisode.link_embed}
                        title={`${movie.name} - ${currentEpisode.name}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                        sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                    ></iframe>
                </div>

                {/* Movie and Episode Info */}
                <div className="mb-8 p-4 bg-gray-900/50 rounded-lg">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary">{movie.name}</h1>
                    <h2 className="text-lg sm:text-xl text-gray-300">{`Đang xem: ${currentEpisode.name}`}</h2>
                    <p className="text-gray-400 text-sm mt-1">{`(Server: ${serverName})`}</p>
                    <Link href={`/movies/${movie.slug}`} className="text-sm text-primary hover:underline mt-4 inline-block">
                        &larr; Quay lại trang thông tin phim
                    </Link>
                </div>

                {/* Episodes List */}
                <div>
                    <h3 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Danh Sách Tập</h3>
                    {episodes.map((episodeGroup) => (
                        <div key={episodeGroup.server_name} className="mb-6">
                            <h4 className="text-lg font-semibold mb-3 p-3 bg-gray-800/70 rounded-t-lg">{episodeGroup.server_name}</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-12 gap-2 p-3 bg-background/50 backdrop-blur-sm rounded-b-lg">
                                {episodeGroup.server_data.map((ep) => (
                                    <Link
                                        key={ep.slug}
                                        href={`/watch/${movie_slug}/${ep.slug}`}
                                        className={`text-center text-sm font-medium py-2 px-2 rounded-md transition-all duration-200 ${
                                            ep.slug === episode_slug
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg scale-105'
                                                : 'bg-gray-700 hover:bg-primary/80 text-white'
                                        }`}
                                    >
                                        {ep.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 