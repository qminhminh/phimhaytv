'use client';

import { ChevronDown, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FilterBrowseProps {
  baseUrl: string; // Thêm prop này để component có thể tái sử dụng
  sortField: string;
  sortType: string;
  sortLang?: string;
  country?: string;
  category?: string;
  year?: number;
  countries: { id: string; name: string; slug: string }[];
  categories: { id: string; name: string; slug: string }[];
  years: number[];
}

export default function FilterBrowse({
  baseUrl,
  sortField,
  sortType,
  sortLang,
  country,
  category,
  year,
  countries,
  categories,
  years
}: FilterBrowseProps) {
  const router = useRouter();

  // Tạo URL với các tham số lọc
  const createUrl = (params: Record<string, string | undefined>) => {
    const url = new URL(baseUrl, window.location.origin);
    
    // Thêm các tham số hiện tại
    if (sortField) url.searchParams.set('sort_field', sortField);
    if (sortType) url.searchParams.set('sort_type', sortType);
    if (sortLang) url.searchParams.set('sort_lang', sortLang);
    if (country) url.searchParams.set('country', country);
    if (category) url.searchParams.set('category', category);
    if (year) url.searchParams.set('year', year.toString());
    
    // Ghi đè các tham số mới
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    
    return url.pathname + url.search;
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [field, type] = value.split('-');
    router.push(createUrl({ 
      sort_field: field, 
      sort_type: type,
      page: '1'
    }));
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    router.push(createUrl({ 
      sort_lang: value || undefined,
      page: '1'
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    router.push(createUrl({ 
      category: value || undefined,
      page: '1'
    }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    router.push(createUrl({ 
      country: value || undefined,
      page: '1'
    }));
  };

  return (
    <div className="bg-[#1E1E1E] rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-[#FFD700]" />
        <h2 className="text-xl font-semibold text-[#EAEAEA]">Bộ lọc</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sắp xếp theo */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Sắp xếp theo</label>
          <div className="relative">
            <select 
              onChange={handleSortChange}
              value={`${sortField}-${sortType}`}
              className="w-full bg-[#2A2A2A] text-gray-300 rounded-md py-2 px-3 appearance-none"
            >
              <option value="modified.time-desc">Mới cập nhật</option>
              <option value="year-desc">Năm mới nhất</option>
              <option value="year-asc">Năm cũ nhất</option>
              <option value="_id-desc">Mới đăng</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {/* Ngôn ngữ */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Ngôn ngữ</label>
          <div className="relative">
            <select 
              onChange={handleLangChange}
              value={sortLang || ''}
              className="w-full bg-[#2A2A2A] text-gray-300 rounded-md py-2 px-3 appearance-none"
            >
              <option value="">Tất cả</option>
              <option value="vietsub">Vietsub</option>
              <option value="thuyet-minh">Thuyết minh</option>
              <option value="long-tieng">Lồng tiếng</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {/* Thể loại */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Thể loại</label>
          <div className="relative">
            <select 
              onChange={handleCategoryChange}
              value={category || ''}
              className="w-full bg-[#2A2A2A] text-gray-300 rounded-md py-2 px-3 appearance-none"
            >
              <option value="">Tất cả</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {/* Quốc gia */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Quốc gia</label>
          <div className="relative">
            <select 
              onChange={handleCountryChange}
              value={country || ''}
              className="w-full bg-[#2A2A2A] text-gray-300 rounded-md py-2 px-3 appearance-none"
            >
              <option value="">Tất cả</option>
              {countries.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {/* Năm */}
        <div className="space-y-2 lg:col-span-4">
          <label className="text-sm text-gray-400">Năm</label>
          <div className="flex flex-wrap gap-2">
            <Link 
              href={createUrl({ year: undefined, page: '1' })}
              className={`px-3 py-1 text-sm rounded-full ${!year ? 'bg-[#FFD700] text-[#121212]' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'}`}
            >
              Tất cả
            </Link>
            {years.map((y) => (
              <Link 
                key={y}
                href={createUrl({ year: y.toString(), page: '1' })}
                className={`px-3 py-1 text-sm rounded-full ${year === y ? 'bg-[#FFD700] text-[#121212]' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'}`}
              >
                {y}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 