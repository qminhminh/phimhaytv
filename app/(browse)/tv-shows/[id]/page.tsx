import { notFound } from 'next/navigation';
import { Star, Calendar, Clock, Play, Plus, Share2 } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import MediaPlayer from '../../../../components/shared/MediaPlayer';
import MovieCarousel from '../../../../components/shared/MovieCarousel';

// Sample TV show data
const showData: { [key: string]: any } = {
  "4": {
    id: "4",
    title: "Stranger Things",
    year: "2016",
    seasons: 4,
    rating: "TV-14",
    genre: ["Drama", "Horror", "Sci-Fi"],
    creator: "The Duffer Brothers",
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour"],
    synopsis: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    poster: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    backdrop: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
    imdbRating: 8.7,
    releaseDate: "2016-07-15",
    episodes: [
      { id: 1, title: "The Vanishing of Will Byers", duration: "47min", season: 1, episode: 1 },
      { id: 2, title: "The Weirdo on Maple Street", duration: "55min", season: 1, episode: 2 },
      { id: 3, title: "Holly, Jolly", duration: "51min", season: 1, episode: 3 },
      { id: 4, title: "The Body", duration: "50min", season: 1, episode: 4 }
    ]
  }
};

const similarShows = [
  {
    id: "5",
    title: "The Mandalorian",
    poster: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2019",
    genre: "Action, Adventure",
    rating: "TV-PG",
    type: "tv" as const
  },
  {
    id: "6",
    title: "The Witcher",
    poster: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2019",
    genre: "Fantasy, Adventure",
    rating: "TV-MA",
    type: "tv" as const
  },
  {
    id: "7",
    title: "Dark",
    poster: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2017",
    genre: "Drama, Mystery",
    rating: "TV-MA",
    type: "tv" as const
  }
];

export default function TVShowPage({ params }: { params: { id: string } }) {
  const show = showData[params.id];
  
  if (!show) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#121212] pt-16">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${show.backdrop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/80 to-transparent" />
        
        <div className="relative z-10 flex items-center h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Show Poster */}
              <div className="flex justify-center lg:justify-start">
                <img
                  src={show.poster}
                  alt={show.title}
                  className="w-80 h-[480px] object-cover rounded-lg shadow-2xl"
                />
              </div>
              
              {/* Show Info */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl font-bold text-[#EAEAEA] mb-4 text-shadow">
                  {show.title}
                </h1>
                
                {/* Rating and Meta */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-[#FFD700]" fill="currentColor" />
                    <span className="text-[#EAEAEA] font-semibold">{show.imdbRating}</span>
                  </div>
                  <Badge variant="outline" className="border-[#FFD700] text-[#FFD700]">
                    {show.rating}
                  </Badge>
                  <div className="flex items-center gap-1 text-[#A0A0A0]">
                    <Calendar className="w-4 h-4" />
                    <span>{show.year}</span>
                  </div>
                  <div className="text-[#A0A0A0]">
                    {show.seasons} Season{show.seasons > 1 ? 's' : ''}
                  </div>
                </div>
                
                {/* Genres */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                  {show.genre.map((g: string) => (
                    <Badge key={g} variant="secondary" className="bg-[#2A2A2A] text-[#EAEAEA]">
                      {g}
                    </Badge>
                  ))}
                </div>
                
                {/* Synopsis */}
                <p className="text-lg text-[#EAEAEA] mb-8 leading-relaxed max-w-2xl">
                  {show.synopsis}
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#121212] font-semibold px-8">
                    <Play className="mr-2 h-5 w-5" fill="currentColor" />
                    Play Now
                  </Button>
                  <Button size="lg" variant="outline" className="border-[#EAEAEA] text-[#EAEAEA] hover:bg-[#EAEAEA] hover:text-[#121212]">
                    <Plus className="mr-2 h-5 w-5" />
                    Add to List
                  </Button>
                  <Button size="lg" variant="outline" className="border-[#EAEAEA] text-[#EAEAEA] hover:bg-[#EAEAEA] hover:text-[#121212]">
                    <Share2 className="mr-2 h-5 w-5" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Media Player */}
        <div className="mb-16">
          <MediaPlayer 
            title={show.title}
            poster={show.poster}
          />
        </div>
        
        {/* Tabs Section */}
        <Tabs defaultValue="episodes" className="mb-16">
          <TabsList className="grid w-full grid-cols-3 bg-[#1A1A1A]">
            <TabsTrigger value="episodes" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#121212]">
              Episodes
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#121212]">
              Details
            </TabsTrigger>
            <TabsTrigger value="similar" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#121212]">
              More Like This
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="episodes" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#EAEAEA] mb-4">Season 1</h3>
              {show.episodes.map((episode: any) => (
                <div key={episode.id} className="bg-[#1A1A1A] rounded-lg p-4 flex items-center gap-4 hover:bg-[#2A2A2A] transition-colors">
                  <div className="w-16 h-16 bg-[#2A2A2A] rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-[#FFD700]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#EAEAEA] font-semibold">{episode.episode}. {episode.title}</h4>
                    <div className="flex items-center gap-2 text-[#A0A0A0] text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{episode.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[#FFD700] font-semibold mb-2">Creator</h3>
                <p className="text-[#EAEAEA] mb-4">{show.creator}</p>
                
                <h3 className="text-[#FFD700] font-semibold mb-2">Starring</h3>
                <div className="flex flex-wrap gap-2">
                  {show.cast.map((actor: string) => (
                    <span key={actor} className="text-[#EAEAEA] bg-[#2A2A2A] px-3 py-1 rounded-full text-sm">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-[#FFD700] font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {show.genre.map((g: string) => (
                    <Badge key={g} variant="secondary" className="bg-[#2A2A2A] text-[#EAEAEA]">
                      {g}
                    </Badge>
                  ))}
                </div>
                
                <h3 className="text-[#FFD700] font-semibold mb-2">First Aired</h3>
                <p className="text-[#EAEAEA]">{show.releaseDate}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="similar" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarShows.map((show) => (
                <div key={show.id} className="bg-[#1A1A1A] rounded-lg overflow-hidden hover:bg-[#2A2A2A] transition-colors">
                  <img
                    src={show.poster}
                    alt={show.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="p-4">
                    <h4 className="text-[#EAEAEA] font-semibold truncate">{show.title}</h4>
                    <p className="text-[#A0A0A0] text-sm">{show.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}