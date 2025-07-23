'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, Film } from 'lucide-react';
import { useRouter } from 'next/navigation';
// Removed direct import of getSuggestedMovies - now using API route
import Image from 'next/image';

interface SearchSuggestion {
  name: string;
  slug: string;
  thumb_url: string;
  year: number;
  category: string[];
}

interface SearchWithSuggestionsProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  imageDomain?: string;
}

export default function SearchWithSuggestions({ 
  placeholder = "Tìm kiếm phim, chương trình...",
  onSearch,
  className = "",
  imageDomain = "https://phimimg.com"
}: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem('phimhaytv_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save recent searches
  const saveRecentSearch = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('phimhaytv_recent_searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
          if (response.ok) {
            const results = await response.json();
            setSuggestions(results);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsLoading(false);
      }
    }, 300);
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(true);
    debouncedSearch(value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = suggestions.length + (query.trim() ? 0 : recentSearches.length);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (query.trim()) {
            // Suggestions mode
            const suggestion = suggestions[selectedIndex];
            if (suggestion) {
              router.push(`/movies/${suggestion.slug}`);
              setIsOpen(false);
              setQuery('');
            }
          } else {
            // Recent searches mode
            const recentQuery = recentSearches[selectedIndex];
            if (recentQuery) {
              setQuery(recentQuery);
              handleSearch(recentQuery);
            }
          }
        } else {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle search submission - always go to search page for full results
  const handleSearch = (searchQuery: string = query) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    saveRecentSearch(trimmed);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    
    // Always navigate to search page for full results, regardless of onSearch prop
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    
    // Call onSearch callback if provided (for closing dropdowns, etc.)
    if (onSearch) {
      onSearch(trimmed);
    }
  };

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    router.push(`/movies/${suggestion.slug}`);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  // Handle recent search click
  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    handleSearch(recentQuery);
  };

  const showRecentSearches = !query.trim() && recentSearches.length > 0;
  const showSuggestions = query.trim().length >= 2 && suggestions.length > 0;

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="bg-[#1A1A1A] text-[#EAEAEA] pl-4 pr-10 py-2 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-[#FFD700] border border-transparent focus:border-[#FFD700] transition-all"
        />
        <button
          onClick={() => handleSearch()}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white transition-colors"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (showSuggestions || showRecentSearches || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {isLoading && (
            <div className="px-4 py-3 text-[#A0A0A0] text-sm">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#FFD700] border-t-transparent"></div>
                <span>Đang tìm kiếm...</span>
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {showRecentSearches && (
            <>
              <div className="px-4 py-2 text-[#A0A0A0] text-xs uppercase font-semibold border-b border-[#2A2A2A]">
                Tìm kiếm gần đây
              </div>
              {recentSearches.map((recentQuery, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleRecentSearchClick(recentQuery)}
                  className={`w-full px-4 py-3 text-left hover:bg-[#2A2A2A] transition-colors flex items-center space-x-3 ${
                    selectedIndex === index ? 'bg-[#2A2A2A]' : ''
                  }`}
                >
                  <Clock size={16} className="text-[#A0A0A0]" />
                  <span className="text-[#EAEAEA]">{recentQuery}</span>
                </button>
              ))}
            </>
          )}

          {/* Movie Suggestions */}
          {showSuggestions && (
            <>
              {showRecentSearches && <div className="border-t border-[#2A2A2A]"></div>}
              <div className="px-4 py-2 text-[#A0A0A0] text-xs uppercase font-semibold border-b border-[#2A2A2A]">
                Gợi ý phim
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.slug}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-[#2A2A2A] transition-colors flex items-center space-x-3 ${
                    selectedIndex === index ? 'bg-[#2A2A2A]' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-16 relative rounded overflow-hidden bg-[#2A2A2A]">
                    {suggestion.thumb_url ? (
                      <Image
                        src={`${imageDomain}/${suggestion.thumb_url}`}
                        alt={suggestion.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={20} className="text-[#A0A0A0]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#EAEAEA] font-medium truncate">{suggestion.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[#A0A0A0] text-sm">{suggestion.year}</span>
                      {suggestion.category.length > 0 && (
                        <>
                          <span className="text-[#A0A0A0]">•</span>
                          <span className="text-[#A0A0A0] text-sm truncate">
                            {suggestion.category.slice(0, 2).join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* No results */}
          {!isLoading && query.trim().length >= 2 && suggestions.length === 0 && (
            <div className="px-4 py-6 text-center text-[#A0A0A0]">
              <Film size={32} className="mx-auto mb-2 opacity-50" />
                             <p>Không tìm thấy phim nào với từ khóa &quot;{query}&quot;</p>
              <button
                onClick={() => handleSearch()}
                className="mt-2 text-[#FFD700] hover:underline text-sm"
              >
                Tìm kiếm đầy đủ →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 