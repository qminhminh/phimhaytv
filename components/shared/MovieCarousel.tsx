'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

// Sử dụng một kiểu chung hơn để chấp nhận nhiều loại movie object
interface GenericMovie {
  _id: string;
  [key: string]: any; // Chấp nhận các trường khác
}

interface MovieCarouselProps {
  title?: string;
  movies?: GenericMovie[];
}

export default function MovieCarousel({ title, movies = [] }: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of one card plus gap
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Nếu không có phim, không hiển thị gì cả
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-8">
      {title && (
        <h2 className="text-2xl font-bold text-[#EAEAEA] mb-4 px-4 sm:px-6 lg:px-8">
          {title}
        </h2>
      )}
      
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#121212]/80 hover:bg-[#121212] text-[#EAEAEA] p-2 rounded-full transition-all duration-200 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#121212]/80 hover:bg-[#121212] text-[#EAEAEA] p-2 rounded-full transition-all duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        {/* Carousel */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto scrollbar-thin gap-4 px-4 sm:px-6 lg:px-8 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div key={movie._id} className="flex-none w-64">
              {/* Truyền movie như một object `any` để MovieCard có thể xử lý */}
              <MovieCard movie={movie as any} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}