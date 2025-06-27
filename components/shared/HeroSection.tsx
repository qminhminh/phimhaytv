'use client';

import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (movies.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [movies.length]);

  const movie = movies[currentIndex];

  const getLink = (movieItem: GenericMovie) => {
    if (!movieItem?.type || !movieItem?.slug) return '/';
    switch (movieItem.type) {
      case 'single':
        return `/movies/${movieItem.slug}`;
      case 'series':
      case 'hoathinh':
      case 'tvshows':
        return `/movies/${movieItem.slug}`;
      default:
        return `/movies/${movieItem.slug}`;
    }
  };

  if (!movie) return null;

  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Image */}
      <Image
        alt={movie.name!}
        src={movie.poster_url || movie.thumb_url!}
        fill
        className="object-cover"
        loading="lazy"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-[#EAEAEA] mb-4 text-shadow">
              {movie.name}
            </h1>
            
            {/* Cập nhật Meta Information */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-gray-300">
              {movie.year && <span>{movie.year}</span>}
              {movie.quality && <Badge className="bg-yellow-500 text-black font-medium">{movie.quality}</Badge>}
              {movie.time && <span>{movie.time}</span>}
              {movie.country && movie.country.length > 0 && (
                <span className="font-semibold">
                  {typeof movie.country[0] === 'string' ? movie.country[0] : movie.country[0].name}
                </span>
              )}
            </div>

            {/* Thêm Category Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {movie.category?.slice(0, 3).map((cat) => (
                <Badge key={typeof cat === 'string' ? cat : cat.id} variant="outline" className="text-gray-300 border-gray-600 backdrop-blur-sm bg-black/20">
                  {typeof cat === 'string' ? cat : cat.name}
                </Badge>
              ))}
            </div>
            
            <p className="text-lg md:text-xl text-[#EAEAEA] mb-8 leading-relaxed text-shadow line-clamp-3">
              {movie.content}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={getLink(movie)}>
                <Button 
                  className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#121212] font-semibold px-8 py-3 text-lg h-11 rounded-md"
                >
                  <Play className="mr-2 h-5 w-5" fill="currentColor" />
                  Xem Ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#121212] to-transparent" />
      
      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? 'bg-[#FFD700]' : 'bg-white/50'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}