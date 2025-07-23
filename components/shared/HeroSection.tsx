'use client';

import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Định nghĩa interface cho Category và Country
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Country {
  id: string;
  name: string;
  slug: string;
}

// Cập nhật GenericMovie để bao gồm category và country
interface GenericMovie {
  _id: string;
  poster_url?: string;
  thumb_url?: string;
  name?: string;
  year?: number;
  quality?: string;
  time?: string;
  content?: string;
  slug?: string;
  type?: string;
  category?: (Category | string)[];
  country?: (Country | string)[];
  [key: string]: any;
}

interface HeroSectionProps {
  movies: GenericMovie[];
}

export default function HeroSection({ movies }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  // Preload images
  useEffect(() => {
    setImagesLoaded(new Array(movies.length).fill(false));
  }, [movies.length]);

  // Auto-play timer with pause functionality
  useEffect(() => {
    if (movies.length > 1 && !isPaused) {
      timerRef.current = setInterval(() => {
        goToNext();
      }, 6000); // Increased to 6 seconds for better UX

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [movies.length, isPaused, currentIndex]);

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const goToPrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + movies.length) % movies.length);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const movie = movies[currentIndex];

  const getLink = (movieItem: GenericMovie) => {
    if (!movieItem?.type || !movieItem?.slug) return '/';
    switch (movieItem.type) {
      case 'single':
        return `/movies/${movieItem.slug}`;
      case 'series':
        return `/movies/${movieItem.slug}`;
      case 'hoathinh':
        return `/movies/${movieItem.slug}`;
      case 'tvshows':
        return `/movies/${movieItem.slug}`;
      default:
        return `/movies/${movieItem.slug}`;
    }
  };

  if (!movie) return null;

  return (
    <div 
      className="relative h-[70vh] md:h-[80vh] overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Images with Crossfade Animation */}
      <div className="absolute inset-0">
        {movies.map((movieItem, index) => (
          <div
            key={movieItem._id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              alt={movieItem.name || 'Movie poster'}
              src={movieItem.poster_url || movieItem.thumb_url || ''}
              fill
              className="object-cover scale-105 group-hover:scale-100 transition-transform duration-[10s] ease-out"
              loading={index === 0 ? "eager" : "lazy"}
              priority={index === 0}
              onLoad={() => handleImageLoad(index)}
            />
            {/* Parallax overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent opacity-90" />
          </div>
        ))}
      </div>
      
      {/* Enhanced Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
      
      {/* Content with Slide Animation */}
      <div className="relative z-10 flex items-center h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div 
            className={`max-w-2xl transform transition-all duration-1000 ease-out ${
              isAnimating ? 'translate-x-8 opacity-0' : 'translate-x-0 opacity-100'
            }`}
            key={currentIndex} // Force re-render for animation
          >
            {/* Title with Type Animation Effect */}
            <h1 className="text-4xl md:text-6xl font-bold text-[#EAEAEA] mb-4 text-shadow-lg leading-tight animate-fade-in-up">
              {movie.name}
            </h1>
            
            {/* Meta Information with Stagger Animation */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-gray-300 animate-fade-in-up animation-delay-200">
              {movie.year && (
                <span className="px-2 py-1 bg-white/10 rounded backdrop-blur-sm">{movie.year}</span>
              )}
              {movie.quality && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium shadow-lg transform hover:scale-105 transition-transform">
                  {movie.quality}
                </Badge>
              )}
              {movie.time && (
                <span className="px-2 py-1 bg-white/10 rounded backdrop-blur-sm">{movie.time}</span>
              )}
              {movie.country && movie.country.length > 0 && (
                <span className="font-semibold px-2 py-1 bg-blue-500/20 rounded backdrop-blur-sm">
                  {typeof movie.country[0] === 'string' ? movie.country[0] : movie.country[0].name}
                </span>
              )}
            </div>

            {/* Category Badges with Animation */}
            <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in-up animation-delay-400">
              {movie.category?.slice(0, 3).map((cat, index) => (
                <Badge 
                  key={typeof cat === 'string' ? cat : cat.id} 
                  variant="outline" 
                  className="text-gray-300 border-gray-500 backdrop-blur-sm bg-black/30 hover:bg-white/20 transition-colors duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {typeof cat === 'string' ? cat : cat.name}
                </Badge>
              ))}
            </div>
            
            {/* Description with Fade Animation */}
            <p className="text-lg md:text-xl text-[#EAEAEA] mb-8 leading-relaxed text-shadow line-clamp-3 animate-fade-in-up animation-delay-600">
              {movie.content}
            </p>
            
            {/* Action Buttons with Hover Effects */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-800">
              <Link href={getLink(movie)}>
                <Button 
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] text-[#121212] font-semibold px-8 py-3 text-lg h-12 rounded-lg shadow-lg transform hover:scale-105 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Play className="mr-2 h-5 w-5 relative z-10" fill="currentColor" />
                  <span className="relative z-10">Xem Ngay</span>
                </Button>
              </Link>
              
              <Link href={getLink(movie)}>
                <Button 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-3 text-lg h-12 rounded-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Info className="mr-2 h-5 w-5" />
                  Thông tin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        disabled={isAnimating}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 disabled:opacity-50"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={goToNext}
        disabled={isAnimating}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 disabled:opacity-50"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Bottom Fade with Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent" />
      
      {/* Enhanced Pagination Dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-3 z-20">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isAnimating}
            className={`relative transition-all duration-300 ${
              index === currentIndex 
                ? 'w-8 h-3 bg-[#FFD700] rounded-full' 
                : 'w-3 h-3 bg-white/50 hover:bg-white/70 rounded-full hover:scale-110'
            }`}
            aria-label={`Slide ${index + 1}`}
          >
            {index === currentIndex && (
              <div className="absolute inset-0 bg-[#FFD700] rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div 
          className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] transition-all duration-75 ease-linear"
          style={{
            width: isPaused ? '100%' : '0%',
            animation: isPaused ? 'none' : `progress 6000ms linear infinite`,
          }}
        />
      </div>
    </div>
  );
}