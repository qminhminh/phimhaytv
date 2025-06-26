'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Bell, User, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const mainNavItems = [
  { title: 'Trang chủ', href: '/' },
  { title: 'Phim mới', href: '/latest' },
  { title: 'Phim lẻ', href: '/phim-le' },
  { title: 'Phim bộ', href: '/phim-bo' },
  { title: 'TV Shows', href: '/tv-shows' },
  { title: 'Hoạt hình', href: '/hoat-hinh' },
];

const subNavItems = [
  { title: 'Việt sub', href: '/vietsub' },
  { title: 'Thuyết minh', href: '/phim-thuyet-minh' },
  { title: 'Lồng tiếng', href: '/phim-long-tieng' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchRef]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
        setIsSearchOpen(false);
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'navbar-solid' : 'navbar-blur'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-[#FFD700]">PhimHayTV</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {mainNavItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href) 
                    ? 'text-[#FFD700]' 
                    : 'text-[#EAEAEA] hover:text-[#FFD700]'
                }`}
              >
                {item.title}
              </Link>
            ))}
            
            {subNavItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href) 
                    ? 'text-[#FFD700]' 
                    : 'text-gray-400 hover:text-[#FFD700]'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors"
              >
                <Search size={20} />
              </button>
              {isSearchOpen && (
                <div className="absolute top-full right-0 mt-2 w-72">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm phim, chương trình..."
                      className="bg-[#1A1A1A] text-[#EAEAEA] pl-4 pr-10 py-2 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-[#FFD700] border border-transparent focus:border-[#FFD700]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white"
                    >
                      <Search size={18} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Notifications */}
            {/* <button className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors">
              <Bell size={20} />
            </button> */}

            {/* Profile */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-[#EAEAEA] hover:text-[#FFD700] transition-colors">
                <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center">
                  <User size={16} className="text-[#121212]" />
                </div>
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link href="/profile" className="block px-4 py-2 text-[#EAEAEA] hover:bg-[#2A2A2A] rounded-t-lg">
                  Profile
                </Link>
                <Link href="/auth/login" className="block px-4 py-2 text-[#EAEAEA] hover:bg-[#2A2A2A] rounded-b-lg">
                  Logout
                </Link>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-[#EAEAEA] hover:text-[#FFD700]"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#1A1A1A] rounded-lg mt-2 p-4">
            {mainNavItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`block py-2 transition-colors ${
                  isActive(item.href) 
                    ? 'text-[#FFD700]' 
                    : 'text-[#EAEAEA] hover:text-[#FFD700]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
            
            {subNavItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`block py-2 transition-colors ${
                  isActive(item.href) 
                    ? 'text-[#FFD700]' 
                    : 'text-gray-400 hover:text-[#FFD700]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}