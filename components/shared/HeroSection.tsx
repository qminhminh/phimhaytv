'use client';

import { Movie } from '@/lib/api';
import Link from 'next/link';
import { Play, Info } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

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

// Mở rộng interface Movie để bao gồm Category và Country
export interface MovieForHero extends Omit<Movie, 'category' | 'country'> {
  category: { name: string; slug: string }[];
  country: { name: string; slug: string }[];
}

interface HeroSectionProps {
  movies: MovieForHero[];
}

export default function HeroSection({ movies }: HeroSectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (!movies || movies.length === 0) {
    return (
      <div className="w-full h-[80vh] bg-gray-900 flex items-center justify-center text-white">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] md:h-[80vh] text-white">
      <Carousel
        setApi={setApi}
        className="w-full h-full"
        plugins={[plugin.current as any]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="h-full">
          {movies.map((movie) => (
            <CarouselItem key={movie._id} className="h-full">
              <div className="relative w-full h-full">
                {/* Background Image */}
                <Image
                  src={movie.poster_url}
                  alt={movie.name}
                  fill
                  className="object-cover opacity-30"
                  priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-transparent to-transparent"></div>
                
                {/* Content */}
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-start z-10">
                  <div className="max-w-2xl text-left">
                    <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg leading-tight">
                      {movie.name}
                    </h2>
                    <p className="text-lg text-gray-300 mt-4 line-clamp-3">
                      {movie.origin_name}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-gray-400">
                      <span>{movie.year}</span>
                      <span className="border-l border-gray-500 h-4"></span>
                      <span>{movie.episode_current}</span>
                      <span className="border-l border-gray-500 h-4"></span>
                      <span>{movie.country.map(c => c.name).join(', ')}</span>
                      <span className="px-2 py-0.5 border border-gray-500 rounded-md text-xs">{movie.quality}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-wrap gap-4">
                      <Link 
                        href={`/movies/${movie.slug}`} 
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/20"
                      >
                        <Play size={22} />
                        <span>Xem Ngay</span>
                      </Link>
                      <Link 
                        href={`/movies/${movie.slug}`} 
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <Info size={22} />
                        <span>Chi Tiết</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-2">
            {movies.map((_, i) => (
                <button
                    key={i}
                    onClick={() => api?.scrollTo(i)}
                    className={`h-2 transition-all duration-300 rounded-full ${current - 1 === i ? "w-8 bg-primary" : "w-2 bg-gray-500/50"}`}
                />
            ))}
            </div>
        </div>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/50 border-none text-white w-12 h-12" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/50 border-none text-white w-12 h-12" />
      </Carousel>
    </div>
  );
}