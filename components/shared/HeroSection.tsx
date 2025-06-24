'use client';

import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  title: string;
  description: string;
  backgroundImage: string;
  year?: string;
  rating?: string;
  duration?: string;
}

export default function HeroSection({
  title,
  description,
  backgroundImage,
  year,
  rating,
  duration
}: HeroSectionProps) {
  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-[#EAEAEA] mb-4 text-shadow">
              {title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex items-center space-x-4 mb-4 text-[#A0A0A0]">
              {year && <span>{year}</span>}
              {rating && <span className="px-2 py-1 bg-[#FFD700] text-[#121212] text-xs font-bold rounded">{rating}</span>}
              {duration && <span>{duration}</span>}
            </div>
            
            <p className="text-lg md:text-xl text-[#EAEAEA] mb-8 leading-relaxed text-shadow">
              {description}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#121212] font-semibold px-8 py-3 text-lg h-11 rounded-md"
              >
                <Play className="mr-2 h-5 w-5" fill="currentColor" />
                Play Now
              </Button>
              
              <Button 
                className="border border-[#EAEAEA] text-[#EAEAEA] hover:bg-[#EAEAEA] hover:text-[#121212] px-8 py-3 text-lg h-11 rounded-md"
              >
                <Info className="mr-2 h-5 w-5" />
                More Info
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#121212] to-transparent" />
    </div>
  );
}