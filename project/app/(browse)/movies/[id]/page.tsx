import { notFound } from 'next/navigation';
import { Star, Calendar, Clock, Play, Plus, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MediaPlayer from '@/components/shared/MediaPlayer';
import MovieCarousel from '@/components/shared/MovieCarousel';

// Sample movie data
const movieData: { [key: string]: any } = {
  "1": {
    id: "1",
    title: "Inception",
    year: "2010",
    duration: "2h 28min",
    rating: "PG-13",
    genre: ["Sci-Fi", "Thriller", "Action"],
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy", "Ellen Page"],
    synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    backdrop: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
    imdbRating: 8.8,
    releaseDate: "2010-07-16"
  }
};

const similarMovies = [
  {
    id: "2",
    title: "The Matrix",
    poster: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "1999",
    genre: "Action, Sci-Fi",
    rating: "R",
    type: "movie" as const
  },
  {
    id: "3",
    title: "Interstellar",
    poster: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2014",
    genre: "Drama, Sci-Fi",
    rating: "PG-13",
    type: "movie" as const
  },
  {
    id: "4",
    title: "Blade Runner 2049",
    poster: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2017",
    genre: "Sci-Fi, Thriller",
    rating: "R",
    type: "movie" as const
  }
];

export default function MoviePage({ params }: { params: { id: string } }) {
  const movie = movieData[params.id];
  
  if (!movie) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#121212] pt-16">
      {/* Hero Section with Background */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.backdrop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/80 to-transparent" />
        
        <div className="relative z-10 flex items-center h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Movie Poster */}
              <div className="flex justify-center lg:justify-start">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-80 h-[480px] object-cover rounded-lg shadow-2xl"
                />
              </div>
              
              {/* Movie Info */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl font-bold text-[#EAEAEA] mb-4 text-shadow">
                  {movie.title}
                </h1>
                
                {/* Rating and Meta */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-[#FFD700]" fill="currentColor" />
                    <span className="text-[#EAEAEA] font-semibold">{movie.imdbRating}</span>
                  </div>
                  <Badge variant="outline" className="border-[#FFD700] text-[#FFD700]">
                    {movie.rating}
                  </Badge>
                  <div className="flex items-center gap-1 text-[#A0A0A0]">
                    <Calendar className="w-4 h-4" />
                    <span>{movie.year}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#A0A0A0]">
                    <Clock className="w-4 h-4" />
                    <span>{movie.duration}</span>
                  </div>
                </div>
                
                {/* Genres */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                  {movie.genre.map((g: string) => (
                    <Badge key={g} variant="secondary" className="bg-[#2A2A2A] text-[#EAEAEA]">
                      {g}
                    </Badge>
                  ))}
                </div>
                
                {/* Synopsis */}
                <p className="text-lg text-[#EAEAEA] mb-8 leading-relaxed max-w-2xl">
                  {movie.synopsis}
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
            title={movie.title}
            poster={movie.poster}
          />
        </div>
        
        {/* Cast & Crew */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#EAEAEA] mb-6">Cast & Crew</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-[#FFD700] font-semibold mb-2">Director</h3>
              <p className="text-[#EAEAEA]">{movie.director}</p>
            </div>
            <div className="col-span-1 md:col-span-3">
              <h3 className="text-[#FFD700] font-semibold mb-2">Starring</h3>
              <div className="flex flex-wrap gap-2">
                {movie.cast.map((actor: string) => (
                  <span key={actor} className="text-[#EAEAEA] bg-[#2A2A2A] px-3 py-1 rounded-full text-sm">
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar Movies */}
        <MovieCarousel title="More Like This" movies={similarMovies} />
      </div>
    </div>
  );
}