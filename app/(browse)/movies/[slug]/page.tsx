import { getMovieBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, Film, Calendar, Clock, Tv, Star } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type MovieDetailPageProps = {
    params: {
        slug: string;
    };
};

export async function generateMetadata({ params }: MovieDetailPageProps): Promise<Metadata> {
    const data = await getMovieBySlug(params.slug);

    if (!data || !data.movie) {
        return {
            title: 'Không tìm thấy phim | PhimHayTV',
        };
    }

    const { movie } = data;

    return {
        title: `${movie.name} (${movie.year}) | PhimHayTV`,
        description: movie.content,
        openGraph: {
            title: `${movie.name} (${movie.year})`,
            description: movie.content,
            images: [movie.poster_url || movie.thumb_url],
            type: 'video.movie',
        },
    };
}

const formatServerName = (name: string) => {
    return name.replace(/^#/, '').trim();
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
    return (
        <Suspense fallback={<MovieDetailSkeleton />}>
            <MovieDetailContent slug={params.slug} />
        </Suspense>
    );
}

async function MovieDetailContent({ slug }: { slug: string }) {
    const data = await getMovieBySlug(slug);

    if (!data || !data.movie) {
        notFound();
    }

    const { movie, episodes } = data;
    const posterUrl = movie.poster_url;
    const firstEpisode = episodes?.[0]?.server_data?.[0];

    return (
        <div className="relative text-white min-h-screen">
            {/* Background Image */}
            
            <div className="absolute top-0 left-0 w-full h-[60vh] -z-10">
                <Image
                    src={posterUrl}
                    alt={movie.name}
                    fill
                    className="object-cover opacity-20 blur-sm"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 py-8 relative">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-16">
                    {/* Left Column: Poster */}
                    <div className="md:col-span-1 lg:col-span-1">
                        <Image
                            src={posterUrl}
                            alt={movie.name}
                            width={500}
                            height={750}
                            className="rounded-lg object-cover shadow-2xl w-full"
                            priority
                        />
                    </div>

                    {/* Right Column: Details */}
                    <div className="md:col-span-2 lg:col-span-3 space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{movie.name}</h1>
                        <h2 className="text-xl text-gray-300 font-light">{movie.origin_name}</h2>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 pt-2">
                            {firstEpisode && (
                                <Link href={`/watch/${movie.slug}/${firstEpisode.slug}`} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/20">
                                    <PlayCircle size={24} />
                                    <span>Xem Ngay</span>
                                </Link>
                            )}
                            {movie.trailer_url && (
                                <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                                    <Film size={24} />
                                    <span>Xem Trailer</span>
                                </a>
                            )}
                        </div>
                        
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {movie.category.map((c) => (
                                <Link href={`/movies/category/${c.slug}`} key={c.slug} className="px-3 py-1 bg-gray-800/70 text-gray-300 text-sm rounded-full hover:bg-primary hover:text-white transition">
                                    {c.name}
                                </Link>
                            ))}
                        </div>

                        {/* Synopsis */}
                        <div className="prose prose-invert max-w-none text-gray-300 pt-2" dangerouslySetInnerHTML={{ __html: movie.content }}></div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-sm">
                            <div className="flex items-center gap-2"><Calendar size={16} className="text-primary"/> <strong>Năm:</strong> {movie.year}</div>
                            <div className="flex items-center gap-2"><Clock size={16} className="text-primary"/> <strong>Thời lượng:</strong> {movie.time}</div>
                            <div className="flex items-center gap-2"><Tv size={16} className="text-primary"/> <strong>Tình trạng:</strong> {movie.episode_current}</div>
                            <div className="flex items-center gap-2"><Star size={16} className="text-primary"/> <strong>Chất lượng:</strong> {movie.quality} - {movie.lang}</div>
                            <div className="col-span-full"><strong>Quốc gia:</strong> {movie.country.map((c) => c.name).join(', ')}</div>
                            <div className="col-span-full"><strong>Đạo diễn:</strong> {movie.director.join(', ')}</div>
                            <div className="col-span-full"><strong>Diễn viên:</strong> {movie.actor.join(', ')}</div>
                        </div>
                    </div>
                </div>

                {/* Episodes Section */}
                <div className="mt-12">
                    <h3 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4 text-primary">Danh Sách Tập</h3>
                    {episodes.map((episode) => (
                        <div key={episode.server_name} className="mb-8">
                            <h4 className="text-xl font-semibold mb-4 p-3 bg-gray-800/50 rounded-t-lg">{formatServerName(episode.server_name)}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 p-4 bg-background/50 backdrop-blur-sm rounded-b-lg">
                                {episode.server_data.map((data) => (
                                    <Link 
                                        key={`${episode.server_name}-${data.slug}`}
                                        href={`/watch/${movie.slug}/${data.slug}?server=${encodeURIComponent(episode.server_name)}`}
                                        className="text-center bg-gray-700 hover:bg-primary text-white font-medium py-2 px-3 rounded-md transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        {data.name}
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

function MovieDetailSkeleton() {
    return (
        <div className="relative text-white min-h-screen">
            <div className="absolute top-0 left-0 w-full h-[60vh] -z-10">
                <Skeleton className="w-full h-full opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 py-8 relative">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-16">
                    {/* Left Column: Poster Skeleton */}
                    <div className="md:col-span-1 lg:col-span-1">
                        <Skeleton className="rounded-lg w-full aspect-[2/3]" />
                    </div>

                    {/* Right Column: Details Skeleton */}
                    <div className="md:col-span-2 lg:col-span-3 space-y-6">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        
                        <div className="flex flex-wrap gap-4 pt-2">
                            <Skeleton className="h-12 w-32 rounded-full" />
                            <Skeleton className="h-12 w-32 rounded-full" />
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Skeleton className="h-8 w-20 rounded-full" />
                            <Skeleton className="h-8 w-24 rounded-full" />
                            <Skeleton className="h-8 w-16 rounded-full" />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-sm">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-40" />
                        </div>
                    </div>
                </div>

                {/* Episodes Section Skeleton */}
                <div className="mt-12">
                    <Skeleton className="h-10 w-64 mb-6" />
                    <div className="mb-8">
                        <Skeleton className="h-12 w-full rounded-t-lg" />
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 p-4 bg-background/50 backdrop-blur-sm rounded-b-lg">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full rounded-md" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 