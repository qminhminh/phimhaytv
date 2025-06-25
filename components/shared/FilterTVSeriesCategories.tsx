'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown } from 'lucide-react';

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

interface FilterTVSeriesCategoriesProps {
  categories: Category[];
  countries: Country[];
  selectedCategory?: string;
  selectedCountry?: string;
  selectedYear?: string;
  years?: number[];
}

const FilterTVSeriesCategories: React.FC<FilterTVSeriesCategoriesProps> = ({
  categories,
  countries,
  selectedCategory,
  selectedCountry,
  selectedYear,
  years = []
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const isPhimBoPage = pathname === '/phim-bo';

  const createUrl = (params: Record<string, string | undefined>) => {
    const url = new URL(pathname, window.location.origin);
    
    // Giữ các tham số hiện tại
    if (selectedCategory) url.searchParams.set('category', selectedCategory);
    if (selectedCountry) url.searchParams.set('country', selectedCountry);
    if (selectedYear) url.searchParams.set('year', selectedYear);
    
    // Cập nhật các tham số mới
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    
    return url.pathname + url.search;
  };

  return (
    <div className="bg-neutral-900 rounded-lg p-4 mb-6">
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="categories">Thể loại</TabsTrigger>
          <TabsTrigger value="countries">Quốc gia</TabsTrigger>
          <TabsTrigger value="years">Năm</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Link href={createUrl({ category: undefined })}>
              <Badge 
                variant={!selectedCategory ? "default" : "outline"} 
                className={!selectedCategory 
                  ? "bg-yellow-500 text-black hover:bg-yellow-600" 
                  : "hover:bg-neutral-800"
                }
              >
                Tất cả
              </Badge>
            </Link>
            
            {categories.map((category) => (
              <Link key={category.id} href={createUrl({ category: category.slug })}>
                <Badge 
                  variant={selectedCategory === category.slug ? "default" : "outline"}
                  className={selectedCategory === category.slug 
                    ? "bg-yellow-500 text-black hover:bg-yellow-600" 
                    : "hover:bg-neutral-800"
                  }
                >
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="countries" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Link href={createUrl({ country: undefined })}>
              <Badge 
                variant={!selectedCountry ? "default" : "outline"} 
                className={!selectedCountry 
                  ? "bg-yellow-500 text-black hover:bg-yellow-600" 
                  : "hover:bg-neutral-800"
                }
              >
                Tất cả
              </Badge>
            </Link>
            
            {countries.map((country) => (
              <Link key={country.id} href={createUrl({ country: country.slug })}>
                <Badge 
                  variant={selectedCountry === country.slug ? "default" : "outline"}
                  className={selectedCountry === country.slug 
                    ? "bg-yellow-500 text-black hover:bg-yellow-600" 
                    : "hover:bg-neutral-800"
                  }
                >
                  {country.name}
                </Badge>
              </Link>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="years" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Link href={createUrl({ year: undefined })}>
              <Badge 
                variant={!selectedYear ? "default" : "outline"} 
                className={!selectedYear 
                  ? "bg-yellow-500 text-black hover:bg-yellow-600" 
                  : "hover:bg-neutral-800"
                }
              >
                Tất cả
              </Badge>
            </Link>
            
            {years.map((year) => (
              <Link key={year} href={createUrl({ year: year.toString() })}>
                <Badge 
                  variant={selectedYear === year.toString() ? "default" : "outline"}
                  className={selectedYear === year.toString() 
                    ? "bg-yellow-500 text-black hover:bg-yellow-600" 
                    : "hover:bg-neutral-800"
                  }
                >
                  {year}
                </Badge>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FilterTVSeriesCategories; 