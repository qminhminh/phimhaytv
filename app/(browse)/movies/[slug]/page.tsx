import { getMovieBySlug, getEnhancedMovieData } from '@/lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, Film, Calendar, Clock, Tv, Star, BarChart3, MessageCircle, BookOpen } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SimilarMovies } from '@/components/shared/SimilarMovies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyLinkButton } from '@/components/shared/CopyLinkButton';
import { MovieRatings } from '@/components/shared/MovieRatings';
import { MovieAnalysis } from '@/components/shared/MovieAnalysis';
import { MovieStats } from '@/components/shared/MovieStats';

type MovieDetailPageProps = {
    params: {
        slug: string;
    };
};

export async function generateMetadata({ params }: MovieDetailPageProps): Promise<Metadata> {
    const enhancedData = await getEnhancedMovieData(params.slug);

    if (!enhancedData) {
        return {
            title: 'Không tìm thấy phim | PhimHayTV',
        };
    }

    // Tạo title và description độc đáo
    const uniqueTitle = `${enhancedData.name} (${enhancedData.year}) - Phân tích & Đánh giá | PhimHayTV`;
    const uniqueDescription = `${enhancedData.uniqueDescription.substring(0, 120)}... Điểm đánh giá: ${enhancedData.userStats.averageRating}/10 từ ${enhancedData.userStats.totalRatings} người dùng. Xem phim chất lượng HD tại PhimHayTV.`;

    return {
        title: uniqueTitle,
        description: uniqueDescription,
        keywords: [
            enhancedData.name,
            enhancedData.origin_name,
            ...enhancedData.category.map(c => c.name),
            ...enhancedData.country.map(c => c.name),
            'PhimHayTV',
            'phân tích phim',
            'đánh giá phim',
            'xem phim online'
        ].join(', '),
        openGraph: {
            title: uniqueTitle,
            description: uniqueDescription,
            images: [enhancedData.poster_url || enhancedData.thumb_url],
            type: 'video.movie',
            url: `https://phimhaytv.com/movies/${enhancedData.slug}`,
            siteName: 'PhimHayTV',
        },
        twitter: {
            card: 'summary_large_image',
            title: uniqueTitle,
            description: uniqueDescription,
            images: [enhancedData.poster_url || enhancedData.thumb_url],
        },
        other: {
            'rating': enhancedData.userStats.averageRating.toString(),
            'content-language': 'vi',
        }
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
    // Lấy cả dữ liệu gốc và enhanced data
    const [baseData, enhancedData] = await Promise.all([
        getMovieBySlug(slug),
        getEnhancedMovieData(slug)
    ]);

    if (!baseData || !baseData.movie || !enhancedData) {
        notFound();
    }

    const { movie, episodes } = baseData;
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
                        
                        {/* Synopsis */}
                        <div className="prose prose-invert max-w-none text-gray-300 pt-2" dangerouslySetInnerHTML={{ __html: movie.content }}></div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-sm">
                            <div className="flex items-center gap-2"><Calendar size={16} className="text-primary"/> <strong>Năm:</strong> {movie.year}</div>
                            <div className="flex items-center gap-2"><Clock size={16} className="text-primary"/> <strong>Thời lượng:</strong> {movie.time}</div>
                            <div className="flex items-center gap-2"><Tv size={16} className="text-primary"/> <strong>Tình trạng:</strong> {movie.episode_current}</div>
                            <div className="flex items-center gap-2"><Star size={16} className="text-primary"/> <strong>Chất lượng:</strong> {movie.quality} - {movie.lang}</div>
                            <div className="col-span-full"><strong>Quốc gia:</strong> {movie.country.map((c) => c.name).join(', ')}</div>
                            <div className="col-span-full"><strong>Thể loại:</strong> {movie.category.map((c) => c.name).join(', ')}</div>
                            <div className="col-span-full"><strong>Đạo diễn:</strong> {movie.director.join(', ')}</div>
                            <div className="col-span-full"><strong>Diễn viên:</strong> {movie.actor.join(', ')}</div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Content Sections */}
                <div className="mt-12">
                    <Tabs defaultValue="episodes" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 max-w-2xl bg-gray-800/50 rounded-lg p-1">
                            <TabsTrigger value="episodes" className="data-[state=active]:bg-gradient-to-r from-amber-500 to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md text-xs">
                                <PlayCircle className="w-4 h-4 mr-1" />
                                Tập phim
                            </TabsTrigger>
                            <TabsTrigger value="analysis" className="data-[state=active]:bg-gradient-to-r from-amber-500 to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md text-xs">
                                <BookOpen className="w-4 h-4 mr-1" />
                                Phân tích
                            </TabsTrigger>
                            <TabsTrigger value="ratings" className="data-[state=active]:bg-gradient-to-r from-amber-500 to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md text-xs">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Đánh giá
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r from-amber-500 to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md text-xs">
                                <BarChart3 className="w-4 h-4 mr-1" />
                                Thống kê
                            </TabsTrigger>
                            <TabsTrigger value="download" className="data-[state=active]:bg-gradient-to-r from-amber-500 to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md text-xs">
                                <Film className="w-4 h-4 mr-1" />
                                Tải về
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab Episodes */}
                        <TabsContent value="episodes">
                            <div className="mt-6">
                                <h3 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4 text-primary">Danh Sách Tập</h3>
                                {episodes && episodes.length > 0 ? (
                                    <div className="space-y-6">
                                        {episodes.map((episode) => (
                                            <div key={episode.server_name} className="mb-8 mt-4">
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
                                ) : (
                                    <p className="text-gray-400 mt-4">Chưa có tập phim nào được cập nhật.</p>
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab Analysis */}
                        <TabsContent value="analysis">
                            <div className="mt-6">
                                <MovieAnalysis 
                                    analysis={enhancedData.analysis}
                                    editorialContent={enhancedData.editorialContent}
                                    uniqueDescription={enhancedData.uniqueDescription}
                                />
                            </div>
                        </TabsContent>

                        {/* Tab Ratings */}
                        <TabsContent value="ratings">
                            <div className="mt-6">
                                <MovieRatings 
                                    movieSlug={movie.slug}
                                    averageRating={enhancedData.userStats.averageRating}
                                    totalRatings={enhancedData.userStats.totalRatings}
                                    userRatings={enhancedData.userRatings}
                                    featuredReviews={enhancedData.featuredReviews}
                                />
                            </div>
                        </TabsContent>

                        {/* Tab Stats */}
                        <TabsContent value="stats">
                            <div className="mt-6">
                                <MovieStats stats={enhancedData.userStats} />
                            </div>
                        </TabsContent>

                        {/* Tab Download */}
                        <TabsContent value="download">
                            <div className="mt-6">
                                <h3 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4 text-primary">Tải Phim</h3>
                                <div className="mt-4 mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg text-sm text-blue-200 space-y-2">
                                    <p><strong>Lưu ý:</strong> Đây là các liên kết tệp `.m3u8`, không phải tệp video trực tiếp. Bạn cần dùng các phần mềm chuyên dụng như VLC Media Player hoặc công cụ trực tuyến để tải video từ những tệp này.</p>
                                    <p>
                                        Đây là trang công cụ download m3u8 trực tuyến, hãy copy link tập muốn tải và bỏ vào: {' '}
                                        <a href="https://m3u8.dev/" target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-400 hover:text-amber-300 underline">
                                            https://m3u8.dev/
                                        </a>
                                    </p>
                                </div>
                                {episodes && episodes.length > 0 ? (
                                    <div className="space-y-6">
                                        {episodes.map((episode) => (
                                            <div key={`${episode.server_name}-download`} className="mb-8">
                                                <h4 className="text-xl font-semibold mb-4 p-3 bg-gray-800/50 rounded-t-lg">{formatServerName(episode.server_name)}</h4>
                                                <div className="flex flex-col gap-3 p-4 bg-background/50 backdrop-blur-sm rounded-b-lg">
                                                    {episode.server_data.map((data) => (
                                                        <CopyLinkButton
                                                            key={`${episode.server_name}-${data.slug}-download`}
                                                            episodeName={data.name}
                                                            m3u8Link={data.link_m3u8}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 mt-4">Chưa có tập phim nào được cập nhật.</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Similar Movies Section */}
                <Suspense fallback={<SimilarMoviesSkeleton />}>
                    {movie.country.map((country) => (
                        <SimilarMovies
                            key={`country-${country.slug}`}
                            filter={{ type: 'country', ...country }}
                            movieType={movie.type}
                            currentMovieSlug={movie.slug}
                        />
                    ))}
                    {movie.category.map((cat) => (
                        <SimilarMovies
                            key={`category-${cat.slug}`}
                            filter={{ type: 'category', ...cat }}
                            movieType={movie.type}
                            currentMovieSlug={movie.slug}
                        />
                    ))}
                </Suspense>
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

function SimilarMoviesSkeleton() {
    return (
        <div className="mt-12">
            <Skeleton className="h-10 w-64 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                <Skeleton className="w-full aspect-[2/3] rounded-lg" />
            </div>
        </div>
    )
} 