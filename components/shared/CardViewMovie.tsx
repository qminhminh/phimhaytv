import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  type: string | null;
  id: string | null;
  season: number | null;
  vote_average: number | null;
  vote_count: number | null;
}

interface TVSeriesItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  category: (Category | string)[];
  country: (Country | string)[];
  episode_current: string;
  quality: string;
  lang: string;
  tmdb: TMDB;
  time: string;
}

interface TVSeriesListProps {
  items: TVSeriesItem[];
  imageDomain: string;
}

const TVSeriesList: React.FC<TVSeriesListProps> = ({ items, imageDomain }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <div
          key={item._id}
          className="relative group bg-neutral-900 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <Link href={`/phim-bo/${item.slug}`}>
            <div className="relative aspect-[2/3] overflow-hidden">
              <Image
                src={`${imageDomain}/${item.poster_url || item.thumb_url}`}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority={false}
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
          </Link>
          
          <div className="p-3">
            <Link href={`/phim-bo/${item.slug}`}>
              <h3 className="font-semibold text-white line-clamp-1 hover:text-yellow-500 transition-colors">{item.name}</h3>
            </Link>
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
                  <span className="text-yellow-500 font-medium">{item.tmdb.vote_average}</span>
                </div>
              ) : null}
            </div>
            
            <div className="mt-2">
              <p className="text-xs text-gray-300 font-medium">
                {item.episode_current}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {item.category.slice(0, 2).map((cat) => {
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
        </div>
      ))}
    </div>
  );
};

export default TVSeriesList; 