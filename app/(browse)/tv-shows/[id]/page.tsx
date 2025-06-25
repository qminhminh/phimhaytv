import { getMovieDetail, getMoviesList } from '@/lib/api';
import { Metadata } from 'next';
import Image from 'next/image';
import { Play, Calendar, Clock, Star, Tag, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaPlayer from '@/components/shared/MediaPlayer';

interface TVShowDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: TVShowDetailPageProps): Promise<Metadata> {
  const seriesData = await getMovieDetail(params.id);
  const series = seriesData.item;

  return {
    title: `${series.name} (${series.year}) | PhimHayTV`,
    description: series.content,
    openGraph: {
      images: [series.poster_url || series.thumb_url],
    },
  };
}

// Hàm này cần thiết cho cấu hình output: export
export async function generateStaticParams() {
  try {
    // Lấy danh sách phim bộ/TV Shows để tạo các trang tĩnh
    const tvShows = await getMoviesList('tv-shows', { limit: 20 });
    const series = await getMoviesList('phim-bo', { limit: 20 });
    
    // Kết hợp cả hai danh sách
    const allShows = [...(tvShows?.data?.items || []), ...(series?.data?.items || [])];
    
    // Trả về mảng các tham số cho trang
    return allShows.map((show) => ({
      id: show.slug,
    }));
  } catch (error) {
    console.error('Lỗi khi tạo trang tĩnh cho phim bộ/TV Shows:', error);
    // Trả về một mảng với ít nhất một giá trị mặc định để tránh lỗi
    return [{ id: 'default-tvshow' }];
  }
}

export default async function TVShowDetailPage({ params }: TVShowDetailPageProps) {
  const seriesData = await getMovieDetail(params.id);
  const series = seriesData.item;
  
  // Lấy tập đầu tiên nếu có
  const firstServer = series.episodes[0];
  const firstEpisode = firstServer?.server_data[0];

  return (
    <div className="min-h-screen bg-[#121212] pt-16">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${series.poster_url || series.thumb_url})` }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-full md:w-80">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl">
              <Image
                src={series.thumb_url}
                alt={series.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          {/* Details */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-[#EAEAEA] mb-2">
              {series.name}
            </h1>
            <h2 className="text-xl text-[#A0A0A0] mb-4">
              {series.origin_name} {series.year && `(${series.year})`}
            </h2>
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6 text-[#A0A0A0]">
              {series.quality && (
                <span className="px-2 py-1 bg-[#FFD700] text-[#121212] text-xs font-bold rounded">
                  {series.quality}
                </span>
              )}
              {series.lang && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  <span>{series.lang}</span>
                </div>
              )}
              {series.year && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{series.year}</span>
                </div>
              )}
              {series.time && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{series.time}</span>
                </div>
              )}
              {series.episode_current && (
                <div className="flex items-center">
                  <span>{series.episode_current}/{series.episode_total || '?'} tập</span>
                </div>
              )}
            </div>
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {series.category?.map((cat, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-[#2A2A2A] text-[#EAEAEA] rounded-full text-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
            
            {/* Description */}
            <p className="text-[#EAEAEA] mb-8 leading-relaxed">
              {series.content}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {firstEpisode && (
                <Button 
                  className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#121212] font-semibold px-8 py-3 text-lg h-11 rounded-md"
                >
                  <Play className="mr-2 h-5 w-5" fill="currentColor" />
                  Xem Ngay
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Player Section */}
        {firstEpisode && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-[#EAEAEA] mb-6">
              Tập phim
            </h2>
            <MediaPlayer 
              embedUrl={firstEpisode.link_embed} 
              m3u8Url={firstEpisode.link_m3u8}
            />
          </div>
        )}
        
        {/* Episodes Section */}
        {series.episodes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-[#EAEAEA] mb-6">Danh sách tập phim</h2>
            
            {/* Server Selection */}
            <div className="mb-6">
              {series.episodes.map((server, index) => (
                <div key={index} className="mb-6">
                  <h3 className="text-lg font-semibold text-[#EAEAEA] mb-4">
                    {server.server_name}
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {server.server_data.map((episode, episodeIndex) => (
                      <Button
                        key={episodeIndex}
                        variant="outline"
                        className="border-[#2A2A2A] hover:bg-[#2A2A2A] text-[#EAEAEA]"
                      >
                        {episode.name}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}