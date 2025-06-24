import HeroSection from '@/components/shared/HeroSection';
import MovieCarousel from '@/components/shared/MovieCarousel';

// Sample data
const featuredMovie = {
  title: "The Dark Knight",
  description: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
  backgroundImage: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  year: "2008",
  rating: "PG-13",
  duration: "2h 32min"
};

const trendingMovies = [
  {
    id: "1",
    title: "Inception",
    poster: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2010",
    genre: "Sci-Fi, Thriller",
    rating: "PG-13",
    type: "movie" as const
  },
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
    title: "Stranger Things",
    poster: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2016",
    genre: "Drama, Horror",
    rating: "TV-14",
    type: "tv" as const
  },
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
    title: "Avengers: Endgame",
    poster: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2019",
    genre: "Action, Adventure",
    rating: "PG-13",
    type: "movie" as const
  }
];

const actionMovies = [
  {
    id: "7",
    title: "John Wick",
    poster: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2014",
    genre: "Action, Thriller",
    rating: "R",
    type: "movie" as const
  },
  {
    id: "8",
    title: "Mad Max: Fury Road",
    poster: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2015",
    genre: "Action, Adventure",
    rating: "R",
    type: "movie" as const
  },
  {
    id: "9",
    title: "Die Hard",
    poster: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "1988",
    genre: "Action, Thriller",
    rating: "R",
    type: "movie" as const
  },
  {
    id: "10",
    title: "Mission: Impossible",
    poster: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "1996",
    genre: "Action, Adventure",
    rating: "PG-13",
    type: "movie" as const
  },
  {
    id: "11",
    title: "The Bourne Identity",
    poster: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2002",
    genre: "Action, Thriller",
    rating: "PG-13",
    type: "movie" as const
  },
  {
    id: "12",
    title: "Speed",
    poster: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "1994",
    genre: "Action, Thriller",
    rating: "R",
    type: "movie" as const
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212] pt-16">
      <HeroSection {...featuredMovie} />
      
      <div className="mt-8">
        <MovieCarousel title="Trending Now" movies={trendingMovies} />
        <MovieCarousel title="Action & Adventure" movies={actionMovies} />
        <MovieCarousel title="Popular on CineVerse" movies={[...trendingMovies].reverse()} />
        <MovieCarousel title="New Releases" movies={[...actionMovies].reverse()} />
      </div>
    </div>
  );
}