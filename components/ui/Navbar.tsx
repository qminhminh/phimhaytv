'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'navbar-solid' : 'navbar-blur'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-[#FFD700]">CineVerse</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors">
              Home
            </Link>
            <Link href="/latest" className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors">
              Phim Mới
            </Link>
            <Link href="/movies" className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors">
              Movies
            </Link>
            <Link href="/tv-shows" className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors">
              TV Shows
            </Link>
            <Link href="/my-list" className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors">
              My List
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search movies, shows..."
                    className="bg-[#1A1A1A] text-[#EAEAEA] px-4 py-2 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-2 text-[#A0A0A0] hover:text-[#EAEAEA]"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors"
                >
                  <Search size={20} />
                </button>
              )}
            </div>

            {/* Notifications */}
            <button className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors">
              <Bell size={20} />
            </button>

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
                <Link href="/settings" className="block px-4 py-2 text-[#EAEAEA] hover:bg-[#2A2A2A]">
                  Settings
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
            <Link href="/" className="block py-2 text-[#EAEAEA] hover:text-[#FFD700]">
              Home
            </Link>
            <Link href="/latest" className="block py-2 text-[#EAEAEA] hover:text-[#FFD700]">
              Phim Mới
            </Link>
            <Link href="/movies" className="block py-2 text-[#EAEAEA] hover:text-[#FFD700]">
              Movies
            </Link>
            <Link href="/tv-shows" className="block py-2 text-[#EAEAEA] hover:text-[#FFD700]">
              TV Shows
            </Link>
            <Link href="/my-list" className="block py-2 text-[#EAEAEA] hover:text-[#FFD700]">
              My List
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}