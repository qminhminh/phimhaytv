'use client';

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import MovieCard from '../../../components/shared/MovieCard';

// Sample search results
const allMovies = [
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

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [filteredMovies, setFilteredMovies] = useState(allMovies);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = allMovies;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Genre filter
    if (genreFilter !== 'all') {
      filtered = filtered.filter(movie =>
        movie.genre.toLowerCase().includes(genreFilter.toLowerCase())
      );
    }

    // Year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(movie => {
        const movieYear = parseInt(movie.year);
        switch (yearFilter) {
          case '2020s':
            return movieYear >= 2020;
          case '2010s':
            return movieYear >= 2010 && movieYear < 2020;
          case '2000s':
            return movieYear >= 2000 && movieYear < 2010;
          case '1990s':
            return movieYear >= 1990 && movieYear < 2000;
          default:
            return true;
        }
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(movie => movie.type === typeFilter);
    }

    setFilteredMovies(filtered);
  }, [searchQuery, genreFilter, yearFilter, typeFilter]);

  return (
    <div className="min-h-screen bg-[#121212] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#EAEAEA] mb-6">Search</h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] w-5 h-5" />
            <Input
              type="text"
              placeholder="Search movies, TV shows, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-[#EAEAEA] placeholder-[#A0A0A0] focus:border-[#FFD700] focus:ring-[#FFD700] text-lg py-6"
            />
          </div>
          
          {/* Filter Toggle */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="border-[#2A2A2A] text-[#EAEAEA] hover:bg-[#2A2A2A]"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#1A1A1A] rounded-lg">
              <div>
                <label className="block text-[#EAEAEA] text-sm font-medium mb-2">Genre</label>
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-[#EAEAEA]">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                    <SelectItem value="all">All Genres</SelectItem>
                    <SelectItem value="action">Action</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                    <SelectItem value="thriller">Thriller</SelectItem>
                    <SelectItem value="drama">Drama</SelectItem>
                    <SelectItem value="horror">Horror</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-[#EAEAEA] text-sm font-medium mb-2">Release Year</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-[#EAEAEA]">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2020s">2020s</SelectItem>
                    <SelectItem value="2010s">2010s</SelectItem>
                    <SelectItem value="2000s">2000s</SelectItem>
                    <SelectItem value="1990s">1990s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-[#EAEAEA] text-sm font-medium mb-2">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-[#EAEAEA]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="movie">Movies</SelectItem>
                    <SelectItem value="tv">TV Shows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        
        {/* Results */}
        <div className="mb-4">
          <p className="text-[#A0A0A0]">
            {filteredMovies.length} result{filteredMovies.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>
        
        {/* Results Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} {...movie} />
          ))}
        </div>
        
        {/* No Results */}
        {filteredMovies.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-[#EAEAEA] mb-2">No results found</h3>
            <p className="text-[#A0A0A0]">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}