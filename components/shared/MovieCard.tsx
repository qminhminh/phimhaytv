'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Plus, Info } from 'lucide-react';
import { Movie } from '@/lib/api';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Xác định loại phim (phim lẻ hay phim bộ)
  const isMovie = movie.type === 'single';
  const detailUrl = isMovie ? `/movies/${movie.slug}` : `/tv-shows/${movie.slug}`;

  return (
    <div 
      className="relative group cursor-pointer card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={detailUrl}>
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
          <Image
            src={movie.thumb_url}
            alt={movie.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
          />
          
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-12 h-12 text-[#FFD700]" fill="currentColor" />
            </div>
          </div>
        </div>
      </Link>
      
      {/* Info Panel (appears on hover) */}
      <div className={`absolute bottom-0 left-0 right-0 bg-[#1A1A1A] p-4 rounded-b-lg transition-all duration-300 ${
        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <h3 className="text-[#EAEAEA] font-semibold mb-1 truncate">{movie.name}</h3>
        <div className="flex items-center justify-between text-sm text-[#A0A0A0] mb-2">
          <span>{movie.year}</span>
          <span className="px-2 py-1 bg-[#FFD700] text-[#121212] text-xs font-bold rounded">
            {movie.quality}
          </span>
        </div>
        <p className="text-xs text-[#A0A0A0] mb-3">
          {movie.category?.slice(0, 2).join(', ')}
          {movie.episode_current && ` • Tập ${movie.episode_current}`}
        </p>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Link href={detailUrl} className="flex-1">
            <button className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#121212] py-2 px-3 rounded text-sm font-medium flex items-center justify-center">
              <Play className="w-4 h-4 mr-1" fill="currentColor" />
              Xem
            </button>
          </Link>
          <button className="p-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#EAEAEA] rounded">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#EAEAEA] rounded">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}