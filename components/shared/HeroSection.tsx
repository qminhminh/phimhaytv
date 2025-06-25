'use client';

import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

// Sử dụng một kiểu chung hơn để chấp nhận nhiều loại movie object
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
  [key: string]: any; // Chấp nhận các trường khác
}

interface HeroSectionProps {
  movies: GenericMovie[];
}

export default function HeroSection({ movies }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const movie = movies[currentIndex];

  if (!movie) return null;

  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${movie.poster_url || movie.thumb_url})` }}
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
            
            {/* Meta Information */}
            <div className="flex items-center space-x-4 mb-4 text-[#A0A0A0]">
              {movie.year && <span>{movie.year}</span>}
              {movie.quality && <span className="px-2 py-1 bg-[#FFD700] text-[#121212] text-xs font-bold rounded">{movie.quality}</span>}
              {movie.time && <span>{movie.time}</span>}
            </div>
            
            <p className="text-lg md:text-xl text-[#EAEAEA] mb-8 leading-relaxed text-shadow line-clamp-3">
              {movie.content}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/movies/${movie.slug}`}>
                <Button 
                  className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#121212] font-semibold px-8 py-3 text-lg h-11 rounded-md"
                >
                  <Play className="mr-2 h-5 w-5" fill="currentColor" />
                  Xem Ngay
                </Button>
              </Link>
              
              <Link href={`/movies/${movie.slug}`}>
                <Button 
                  className="border border-[#EAEAEA] text-[#EAEAEA] hover:bg-[#EAEAEA] hover:text-[#121212] px-8 py-3 text-lg h-11 rounded-md"
                >
                  <Info className="mr-2 h-5 w-5" />
                  Thông Tin
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