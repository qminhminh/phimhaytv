'use client';

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Star, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface TMDB {
  type?: string | null;
  id?: string | null;
  season?: number | null;
  vote_average?: number | null;
  vote_count?: number | null;
}

// Tạo một kiểu chung cho các item phim
interface GenericMovieItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  category: (Category | string)[];
  country: (Country | string)[];
  episode_current?: string; // Tùy chọn
  quality: string;
  lang: string;
  tmdb?: TMDB; // Tùy chọn
  time: string;
  type?: string;
}

interface CardViewMovieProps {
  items: GenericMovieItem[];
  imageDomain: string;
}

const CardViewMovie: React.FC<CardViewMovieProps> = ({ items, imageDomain }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const getLink = (item: GenericMovieItem) => {
    return `/movies/${item.slug}`;
  };

  const getImageUrl = (item: GenericMovieItem) => {
    const fallbackDomain = 'https://phimimg.com';
    const imageUrl = item.poster_url || item.thumb_url;
    if (!imageUrl) return ''; // Trả về chuỗi rỗng nếu không có URL
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${imageDomain || fallbackDomain}/${imageUrl}`;
  };

  const handleClick = () => {
    setIsLoading(true);
  };

  return (
    <>
      <Dialog open={isLoading} onOpenChange={setIsLoading}>
        <DialogContent className="sm:max-w-[425px] bg-neutral-950 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải phim...
            </DialogTitle>
            <DialogDescription>
              Vui lòng đợi trong giây lát. Hệ thống đang chuẩn bị phim cho bạn.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link
            href={getLink(item)}
            key={item._id}
            prefetch={true}
            onClick={handleClick}
            className="group block bg-neutral-900 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative aspect-[2/3] overflow-hidden">
              <Image
                src={getImageUrl(item)}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-yellow-500/90 rounded-full p-3">
                  <Play className="h-8 w-8 text-black" fill="currentColor" />
                </div>
              </div>
              
              {/* Quality badge */}
              <div className="absolute top-2 right-2">
                <Badge className="bg-yellow-500 text-black font-medium">{item.quality}</Badge>
              </div>
            </div>
            
            <div className="p-3">
              <h3 className="font-semibold text-white line-clamp-1 group-hover:text-yellow-500 transition-colors">{item.name}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.origin_name}</p>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">{item.year}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
                
                {item.tmdb && item.tmdb.vote_average ? (
                  <div className="flex items-center text-xs">
                    <Star className="h-3 w-3 text-yellow-500 mr-0.5" fill="currentColor" />
                    <span className="text-yellow-500 font-medium">{item.tmdb.vote_average.toFixed(1)}</span>
                  </div>
                ) : null}
              </div>
              
              {item.episode_current && (
                <div className="mt-2">
                  <p className="text-xs text-gray-300 font-medium">
                    {item.episode_current}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-1 mt-2">
                {item.category?.slice(0, 2).map((cat) => {
                  if (typeof cat === 'string') {
                    return (
                      <Badge key={cat} variant="outline" className="text-[10px] py-0 border-gray-700 text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500/50 transition-colors">
                        {cat}
                      </Badge>
                    )
                  }
                  return (
                    <Link href={`/movies/category/${cat.slug}`} key={cat.id}>
                      <Badge variant="outline" className="text-[10px] py-0 border-gray-700 text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500/50 transition-colors">
                        {cat.name}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default CardViewMovie; 