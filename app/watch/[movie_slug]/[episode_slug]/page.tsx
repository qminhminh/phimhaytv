import { getMovieBySlug, getLatestMovies, Episode, EpisodeServerData } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import MediaPlayer from '@/components/shared/MediaPlayer';
import { RefreshButton } from '@/components/shared/RefreshButton';

type WatchPageProps = {
    params: Promise<{
        movie_slug: string;
        episode_slug: string;
    }>;
    searchParams: Promise<{
        server?: string;
    }>;
};

export async function generateMetadata({ params, searchParams }: WatchPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { movie_slug, episode_slug } = resolvedParams;
    const data = await getMovieBySlug(movie_slug);
    
    if (!data || !data.movie) {
        return {
            title: 'Không tìm thấy phim | PhimHayTV',
        };
    }

    const { movie, episodes } = data;
    const currentEpisodeData = findEpisode(episodes, episode_slug, resolvedSearchParams.server);
    const episodeName = currentEpisodeData ? currentEpisodeData.episode.name : 'Tập mới nhất';

    return {
        title: `Xem ${movie.name} - ${episodeName} | PhimHayTV`,
        description: `Xem phim ${movie.name} (${movie.origin_name}) - ${episodeName} full HD, vietsub, thuyết minh miễn phí tại PhimHayTV.`,
        openGraph: {
            title: `Xem ${movie.name} - ${episodeName}`,
            description: `Xem phim ${movie.name} - ${episodeName} full HD, vietsub, thuyết minh miễn phí.`,
            images: [movie.poster_url || movie.thumb_url],
            type: 'video.episode',
        },
    };
}

const findEpisode = (episodes: Episode[], episode_slug: string, server_name_query?: string): { episode: EpisodeServerData, serverName: string } | null => {
    // Ưu tiên tìm kiếm trong server được chỉ định qua query param
    if (server_name_query) {
        const targetServer = episodes.find(s => s.server_name === server_name_query);
        if (targetServer) {
            const found = targetServer.server_data.find(ep => ep.slug === episode_slug);
            if (found) {
                return { episode: found, serverName: targetServer.server_name };
            }
        }
    }

    // Fallback: tìm ở bất kỳ server nào (hành vi cũ)
    for (const server of episodes) {
        const found = server.server_data.find(ep => ep.slug === episode_slug);
        if (found) {
            return { episode: found, serverName: server.server_name };
        }
    }
    return null;
}

const formatServerName = (name: string) => {
    return name.replace(/^#/, '').trim();
}

async function getValidatedEmbedUrl(url: string, timeout = 4000): Promise<string> {
    if (!url || !url.startsWith('http')) {
        return '';
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method: 'GET', // Use GET for better compatibility
            redirect: 'follow',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            },
        });
        
        clearTimeout(timeoutId);

        const finalUrl = response.url;
        const xFrameOptions = response.headers.get('x-frame-options');

        if (finalUrl.includes('google.com')) {
            console.warn(`Redirect to Google detected for: ${url}`);
            return '';
        }

        if (xFrameOptions && (xFrameOptions.toLowerCase() === 'deny' || xFrameOptions.toLowerCase() === 'sameorigin')) {
            console.warn(`URL ${finalUrl} cannot be embedded due to X-Frame-Options: ${xFrameOptions}`);
            return '';
        }

        return finalUrl;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            console.error(`Embed URL check for ${url} timed out.`);
        } else {
            console.error(`Failed to validate embed URL for ${url}:`, error);
        }
        return '';
    }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { movie_slug, episode_slug } = resolvedParams;
    const { server: serverQuery } = resolvedSearchParams;

    const data = await getMovieBySlug(movie_slug);

    if (!data || !data.movie) {
        notFound();
    }

    const { movie, episodes } = data;
    const currentEpisodeData = findEpisode(episodes, episode_slug, serverQuery);

    if (!currentEpisodeData) {
        notFound();
    }

    const { episode: currentEpisode, serverName } = currentEpisodeData;
    
    // Ưu tiên M3U8, fallback về embed
    const m3u8Url = currentEpisode.link_m3u8;
    const embedUrl = await getValidatedEmbedUrl(currentEpisode.link_embed);

    // Find next episode slug
    const serverGroup = episodes.find(group => group.server_name === serverName);
    const currentEpisodeIndex = serverGroup ? serverGroup.server_data.findIndex(ep => ep.slug === currentEpisode.slug) : -1;
    const nextEpisodeSlug = serverGroup && currentEpisodeIndex !== -1 && currentEpisodeIndex < serverGroup.server_data.length - 1
        ? serverGroup.server_data[currentEpisodeIndex + 1].slug
        : null;
    const previousEpisodeSlug = serverGroup && currentEpisodeIndex > 0
        ? serverGroup.server_data[currentEpisodeIndex - 1].slug
        : null;

    // Quyết định nguồn phát - Đảm bảo có ít nhất 1 nguồn khả dụng
    const hasM3U8 = !!m3u8Url;
    const hasValidEmbed = !!embedUrl;
    const isSourceInvalid = !hasM3U8 && !hasValidEmbed;

    return (
        <div className="bg-background text-white min-h-screen">
            <div className="container mx-auto px-2 sm:px-4 py-6">
                {/* Video Player */}
                <div className="w-full mb-6">
                    {isSourceInvalid ? (
                        <div className="text-center p-4 aspect-video bg-black flex flex-col items-center justify-center rounded-lg">
                            <div>
                                <h3 className="text-2xl font-bold text-primary">Tập phim chưa có hoặc link đã hỏng</h3>
                                <p className="text-gray-400 mt-2">Nội dung cho tập này hiện không khả dụng. Vui lòng thử lại sau.</p>
                            </div>
                        </div>
                    ) : (
                        <MediaPlayer
                            key={`${movie._id}-${currentEpisode.slug}`}
                            movieId={movie._id}
                            episodeSlug={currentEpisode.slug}
                            movieSlug={movie.slug}
                            nextEpisodeSlug={nextEpisodeSlug || undefined}
                            previousEpisodeSlug={previousEpisodeSlug || undefined}
                            m3u8Url={hasM3U8 ? m3u8Url : undefined}
                            embedUrl={hasValidEmbed ? embedUrl : undefined}
                            title={`${movie.name} - ${currentEpisode.name}`}
                            poster={movie.poster_url || movie.thumb_url}
                        />
                    )}
                </div>

                {/* Movie and Episode Info */}
                <div className="mb-8 p-4 bg-gray-900/50 rounded-lg">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary">{`${movie.name} - ${currentEpisode.name}`}</h1>
                    <h2 className="text-lg sm:text-xl text-gray-300 mt-1">{movie.origin_name}</h2>
                    <p className="text-gray-400 text-sm mt-2">{`(Server: ${formatServerName(serverName)})`}</p>
                    
                    <Link href={`/movies/${movie.slug}`} className="text-sm text-primary hover:underline mt-4 inline-block">
                        &larr; Quay lại trang thông tin phim
                    </Link>
                    <div className="mt-4 flex items-center gap-2">
                        <p className="text-sm text-gray-400">Không tải được phim? Hãy thử:</p>
                        <RefreshButton />
                    </div>
                </div>

                {/* Episodes List */}
                <div>
                    <h3 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Danh Sách Tập</h3>
                    {episodes.map((episodeGroup) => (
                        <div key={episodeGroup.server_name} className="mb-6">
                            <h4 className="text-lg font-semibold mb-3 p-3 bg-gray-800/70 rounded-t-lg">{formatServerName(episodeGroup.server_name)}</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-12 gap-2 p-3 bg-background/50 backdrop-blur-sm rounded-b-lg">
                                {episodeGroup.server_data.map((ep) => (
                                    <Link
                                        key={`${episodeGroup.server_name}-${ep.slug}`}
                                        href={`/watch/${movie_slug}/${ep.slug}?server=${encodeURIComponent(episodeGroup.server_name)}`}
                                        className={`text-center text-sm font-medium py-2 px-2 rounded-md transition-all duration-200 ${
                                            ep.slug === episode_slug && episodeGroup.server_name === serverName
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