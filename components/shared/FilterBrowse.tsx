'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactCountryFlag from "react-country-flag";

const slugToCountryCode: Record<string, string> = {
  'viet-nam': 'VN',
  'han-quoc': 'KR',
  'trung-quoc': 'CN',
  'nhat-ban': 'JP',
  'thai-lan': 'TH',
  'my': 'US',
  'au-my': 'US',
  'anh': 'GB',
  'phap': 'FR',
  'duc': 'DE',
  'an-do': 'IN',
  'dai-loan': 'TW',
  'hong-kong': 'HK',
  'nga': 'RU',
  'tay-ban-nha': 'ES',
  'y': 'IT',
  'uc': 'AU',
  'canada': 'CA',
  'malaysia': 'MY',
  'indonesia': 'ID',
  'philippines': 'PH',
  'singapore': 'SG',
  'bo-dao-nha': 'PT',
  'thuy-dien': 'SE',
  'na-uy': 'NO',
  'dan-mach': 'DK',
  'ha-lan': 'NL',
  'bi': 'BE',
  'ba-lan': 'PL',
  'tho-nhi-ky': 'TR',
  'mexico': 'MX',
  'brazil': 'BR',
  'argentina': 'AR',
  'nam-phi': 'ZA',
  'lien-xo': 'RU',
  'thuy-si': 'CH',
};

interface FilterBrowseProps {
  baseUrl: string;
  sortField?: string;
  sortType?: string;
  sortLang?: string;
  country?: string;
  category?: string;
  year?: number | string;
  countries: { id: string; name: string; slug: string }[];
  categories: { id: string; name: string; slug: string }[];
  years: number[];
  showLanguage?: boolean;
}

export default function FilterBrowse({
  baseUrl,
  sortField: initialSortField = 'modified.time',
  sortType: initialSortType = 'desc',
  sortLang: initialSortLang,
  country: initialCountry,
  category: initialCategory,
  year: initialYear,
  countries,
  categories,
  years,
  showLanguage = true,
}: FilterBrowseProps) {
  const router = useRouter();
  
  const [sortValue, setSortValue] = useState(`${initialSortField}-${initialSortType}`);
  const [lang, setLang] = useState(initialSortLang || 'all');
  const [cat, setCat] = useState(initialCategory || 'all');
  const [loc, setLoc] = useState(initialCountry || 'all');
  const [selectedYear, setSelectedYear] = useState(initialYear?.toString() || 'all');

  useEffect(() => {
    setSortValue(`${initialSortField}-${initialSortType}`);
    setLang(initialSortLang || 'all');
    setCat(initialCategory || 'all');
    setLoc(initialCountry || 'all');
    setSelectedYear(initialYear?.toString() || 'all');
  }, [initialSortField, initialSortType, initialSortLang, initialCategory, initialCountry, initialYear]);

  const handleFilter = () => {
    const [sort_field, sort_type] = sortValue.split('-');
    
    const params = new URLSearchParams();
    
    params.set('sort_field', sort_field);
    params.set('sort_type', sort_type);

    // Xử lý các trường lọc khác
    // Nếu giá trị là 'all', đặt thành rỗng. Nếu không được chọn (undefined), không thêm vào.
    if (lang !== undefined && lang !== null) {
      params.set('sort_lang', lang === 'all' ? '' : lang);
    }
    if (cat !== undefined && cat !== null) {
      params.set('category', cat === 'all' ? '' : cat);
    }
    if (loc !== undefined && loc !== null) {
      params.set('country', loc === 'all' ? '' : loc);
    }
    if (selectedYear !== undefined && selectedYear !== null) {
      params.set('year', selectedYear === 'all' ? '' : selectedYear);
    }
    
    router.push(`${baseUrl}?${params.toString()}`);
  };

  const handleClear = () => {
    // Manually reset the state to give the user immediate UI feedback
    setSortValue('year-desc');
    setLang('all');
    setCat('all');
    setLoc('all');
    setSelectedYear('all');
    // Then navigate to the clean URL
    router.push(baseUrl);
  };

  const currentFiltersCount = [lang, cat, loc, selectedYear].filter(val => val && val !== 'all').length;

  return (
    <div className="bg-[#1e1e1e] bg-opacity-80 backdrop-blur-sm border border-neutral-700/50 rounded-lg p-4 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-yellow-400" />
        <h2 className="text-xl font-semibold text-white">Bộ lọc phim</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Select value={sortValue} onValueChange={setSortValue}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sắp xếp theo..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modified.time-desc">Mới cập nhật</SelectItem>
            <SelectItem value="year-desc">Năm mới nhất</SelectItem>
            <SelectItem value="year-asc">Năm cũ nhất</SelectItem>
            <SelectItem value="_id-desc">Mới đăng</SelectItem>
          </SelectContent>
        </Select>
        
        {showLanguage && (
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ngôn ngữ..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ngôn ngữ</SelectItem>
              <SelectItem value="vietsub">Vietsub</SelectItem>
              <SelectItem value="thuyet-minh">Thuyết minh</SelectItem>
              <SelectItem value="long-tieng">Lồng tiếng</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Thể loại..." />
          </SelectTrigger>
          <SelectContent>
             <SelectItem value="all">Tất cả thể loại</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={loc} onValueChange={setLoc}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Quốc gia..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <span>Tất cả quốc gia</span>
              </div>
            </SelectItem>
            {countries.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                <div className="flex items-center gap-2">
                  {slugToCountryCode[c.slug] && (
                    <ReactCountryFlag 
                      countryCode={slugToCountryCode[c.slug]} 
                      svg 
                      className="border border-neutral-300 dark:border-neutral-700 rounded-sm shadow-sm"
                      style={{ width: '1.2em', height: '1.2em', objectFit: 'cover' }} 
                    />
                  )}
                  <span>{c.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Năm..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả các năm</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-5 flex flex-col sm:flex-row items-center gap-4">
        <Button onClick={handleFilter} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
          <Filter className="h-4 w-4 mr-2" />
          Lọc phim
        </Button>
        <Button onClick={handleClear} variant="ghost" className="w-full sm:w-auto hover:bg-neutral-700/50" disabled={currentFiltersCount === 0}>
          <X className="h-4 w-4 mr-2" />
          Xóa bộ lọc ({currentFiltersCount})
        </Button>
      </div>
    </div>
  );
} 