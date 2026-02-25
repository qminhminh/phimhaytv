'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, PlayCircle, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface WatchHistoryItem {
  movieSlug: string;
  episodeSlug?: string;
  title: string;
  poster: string;
  url: string;
  timestamp: number;
  duration: number;
}

export default function WatchHistoryDropdown() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadHistory();
    
    // Add event listener to update history count if localStorage changes in same window
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'artplayer_settings') {
            loadHistory();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    try {
      const settingsStr = localStorage.getItem('artplayer_settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        if (settings.watch_history && Array.isArray(settings.watch_history)) {
          setHistory(settings.watch_history);
        }
      }
    } catch (e) {
      console.error('Failed to load watch history:', e);
    }
  };

  const clearHistory = () => {
    try {
      const settingsStr = localStorage.getItem('artplayer_settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        settings.watch_history = [];
        localStorage.setItem('artplayer_settings', JSON.stringify(settings));
        setHistory([]);
      }
    } catch (e) {
      console.error('Failed to clear watch history:', e);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        if (hours > 0) return `${hours} giờ trước`;
        const minutes = Math.floor(diff / 60000);
        if (minutes > 0) return `${minutes} phút trước`;
        return 'Vừa xong';
    }
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (!isMounted) return null;

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors focus:outline-none flex items-center justify-center relative"
          aria-label="Lịch sử xem phim"
        >
          <History size={20} />
          {history.length > 0 && (
            <span className="absolute -top-[2px] -right-[2px] w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"></span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 bg-[#1A1A1A] border border-[#2A2A2A] text-[#EAEAEA] p-0 shadow-2xl rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A]">
          <h3 className="font-bold text-sm text-[#FFD700] flex items-center gap-2">
              <History size={16} />
              Lịch sử xem phim
          </h3>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-red-500 hover:text-red-400 flex items-center transition-colors px-2 py-1 rounded-md hover:bg-red-500/10 font-medium"
            >
              <Trash2 size={12} className="mr-1" />
              Xoá tất cả
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#121212]">
          {history.length > 0 ? (
            history.map((item, index) => (
              <DropdownMenuItem
                key={`${item.movieSlug}-${item.timestamp}-${index}`}
                asChild
                className="cursor-pointer focus:bg-[#2A2A2A] p-0 rounded-none border-b border-[#2A2A2A]/50 last:border-0"
              >
                 <Link
                    href={`/watch/${item.movieSlug}${item.episodeSlug ? `/${item.episodeSlug}` : ''}`}
                    className="flex items-start gap-4 px-4 py-3 hover:bg-[#2A2A2A] w-full transition-all duration-200 group relative overflow-hidden"
                 >
                    <div className="relative w-20 h-28 flex-shrink-0 bg-[#2A2A2A] rounded-lg overflow-hidden shadow-md">
                      {item.poster ? (
                        <img
                          src={item.poster}
                          alt={item.title || 'Poster'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 text-center">
                           Không có ảnh
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <PlayCircle size={28} className="text-[#FFD700] drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="flex flex-col flex-grow min-w-0 py-1 h-full justify-between">
                      <div>
                          <h4 className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-[#FFD700] transition-colors" title={item.title}>
                              {item.title}
                          </h4>
                          {item.episodeSlug && (
                              <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] text-[10px] font-semibold rounded-md uppercase tracking-wider">
                                Tập {item.episodeSlug.replace('tap-', '')}
                              </span>
                          )}
                      </div>
                      <div className="mt-auto pt-2 flex items-center justify-between">
                          <p className="text-[11px] text-[#888888] flex items-center gap-1 font-medium">
                              <History size={10} />
                              {formatTime(item.timestamp)}
                          </p>
                      </div>
                    </div>
                 </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center text-[#888888]">
              <div className="w-16 h-16 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-4">
                  <History size={32} className="opacity-50" />
              </div>
              <p className="text-sm font-medium text-[#EAEAEA]">Bạn chưa xem bộ phim nào gần đây.</p>
              <p className="text-xs mt-1.5 opacity-60 max-w-[200px]">Những phim bạn xem sẽ xuất hiện ở đây để dễ dàng theo dõi lại.</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
