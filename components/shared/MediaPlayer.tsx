'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Hls from 'hls.js';
import Artplayer from 'artplayer';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MediaPlayerProps {
  embedUrl?: string;
  m3u8Url?: string;
  title?: string;
  poster?: string;
  videoUrl?: string;
  movieId?: string;
  episodeSlug?: string;
  movieSlug?: string;
  nextEpisodeSlug?: string;
  previousEpisodeSlug?: string;
}

export default function MediaPlayer({ embedUrl, m3u8Url, title, poster, videoUrl, movieId, episodeSlug, movieSlug, nextEpisodeSlug, previousEpisodeSlug }: MediaPlayerProps) {
  const router = useRouter();
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [m3u8LoadFailed, setM3u8LoadFailed] = useState(false);
  const [isM3u8Loading, setIsM3u8Loading] = useState(false);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<Artplayer | null>(null);
  const lastSaveTimestampRef = useRef(0);
  const m3u8TimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const progressKey = `movie-progress-${movieId}-${episodeSlug}`;

  // Logic quyết định sử dụng iframe hay video player
  const useIframe = !m3u8Url || m3u8LoadFailed ? !!embedUrl : false;

  const retryM3u8 = useCallback(() => {
    if (m3u8Url) {
      console.log('Retrying M3U8 load...');
      setM3u8LoadFailed(false);
      setIsM3u8Loading(true);
    }
  }, [m3u8Url]);

  const saveProgress = useCallback((currentTime: number, duration: number) => {
    if (movieId && episodeSlug && !useIframe) {
      if (duration > 0 && currentTime / duration > 0.98) {
        try {
          localStorage.removeItem(progressKey);
        } catch (error) {
           console.error("Failed to remove progress from localStorage", error);
        }
      } else if (currentTime > 5) {
        try {
          const progress = {
              currentTime: currentTime,
              timestamp: Date.now(),
          };
          localStorage.setItem(progressKey, JSON.stringify(progress));
          localStorage.setItem(`movie-latest-episode-${movieId}`, episodeSlug);
          lastSaveTimestampRef.current = Date.now();
        } catch (error) {
          console.error("Failed to save progress to localStorage", error);
        }
      }
    }
  }, [movieId, episodeSlug, useIframe, progressKey]);

  useEffect(() => {
    if (useIframe || !movieId || !episodeSlug) {
        setShowResumeDialog(false);
        return;
    };

    let isMounted = true;

    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`movie-progress-${movieId}-`) && key !== progressKey) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
        console.error("Cleanup failed", e);
    }

    try {
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
            const { currentTime: savedTime } = JSON.parse(savedProgress);
            if (isMounted && savedTime > 5) {
                setResumeTime(savedTime);
                setShowResumeDialog(true);
            } else {
                setShowResumeDialog(false);
            }
        } else {
            setShowResumeDialog(false);
        }
    } catch (error) {
        console.error("Failed to read progress from localStorage", error);
        setShowResumeDialog(false);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && artRef.current) {
        saveProgress(artRef.current.currentTime, artRef.current.duration);
      }
    };
    const handleBeforeUnload = () => {
      if (artRef.current) saveProgress(artRef.current.currentTime, artRef.current.duration);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (artRef.current) {
          saveProgress(artRef.current.currentTime, artRef.current.duration);
      }
    };
  }, [progressKey, useIframe, movieId, episodeSlug, saveProgress]);

  const playNextEpisode = useCallback(() => {
    if (movieSlug && nextEpisodeSlug) {
        router.push(`/watch/${movieSlug}/${nextEpisodeSlug}`);
    }
  }, [movieSlug, nextEpisodeSlug, router]);

  const playPreviousEpisode = useCallback(() => {
    if (movieSlug && previousEpisodeSlug) {
        router.push(`/watch/${movieSlug}/${previousEpisodeSlug}`);
    }
  }, [movieSlug, previousEpisodeSlug, router]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleResume = () => {
    if (artRef.current) {
        artRef.current.currentTime = resumeTime;
        artRef.current.play();
    }
    setShowResumeDialog(false);
  };

  const handleDismissResume = () => {
      if (movieId && episodeSlug) {
          localStorage.removeItem(progressKey);
      }
      setShowResumeDialog(false);
  };

  useEffect(() => {
    if (useIframe || (!m3u8Url && !videoUrl) || !playerContainerRef.current) return;

    let hls: Hls | null = null;
    setIsM3u8Loading(true);

    const playM3u8 = (video: HTMLVideoElement, url: string, art: Artplayer) => {
      if (Hls.isSupported()) {
        if (hls) hls.destroy();
        
        // Optimized HLS configuration
        hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetry: 3,
          fragLoadingTimeOut: 10000,
          fragLoadingMaxRetry: 6,
          startLevel: -1,
        });
        
        if (m3u8TimeoutRef.current) clearTimeout(m3u8TimeoutRef.current);
        
        m3u8TimeoutRef.current = setTimeout(() => {
          console.warn('M3U8 load timeout after 15 seconds, falling back to embed');
          setM3u8LoadFailed(true);
          setIsM3u8Loading(false);
        }, 15000);

        hls.loadSource(url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (m3u8TimeoutRef.current) clearTimeout(m3u8TimeoutRef.current);
          setIsM3u8Loading(false);
          setM3u8LoadFailed(false);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('Fatal network error, trying to recover...');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('Fatal media error, trying to recover...');
                hls?.recoverMediaError();
                break;
              default:
                console.error('Unrecoverable HLS error:', data);
                if (m3u8TimeoutRef.current) clearTimeout(m3u8TimeoutRef.current);
                setM3u8LoadFailed(true);
                setIsM3u8Loading(false);
                hls?.destroy();
                break;
            }
          }
        });

        art.on('destroy', () => {
            if (hls) hls.destroy();
            if (m3u8TimeoutRef.current) clearTimeout(m3u8TimeoutRef.current);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        
        if (m3u8TimeoutRef.current) clearTimeout(m3u8TimeoutRef.current);
        m3u8TimeoutRef.current = setTimeout(() => {
          setM3u8LoadFailed(true);
          setIsM3u8Loading(false);
        }, 15000);

        const handleCanPlay = () => {
          if (m3u8TimeoutRef.current) clearTimeout(m3u8TimeoutRef.current);
          setIsM3u8Loading(false);
          setM3u8LoadFailed(false);
        };
        video.addEventListener('canplay', handleCanPlay, { once: true });
        
        video.addEventListener('error', () => {
           if (m3u8TimeoutRef.current) clearTimeout(m3u8TimeoutRef.current);
           setM3u8LoadFailed(true);
           setIsM3u8Loading(false);
        }, { once: true });
      }
    };

    const controls = [];
    if (previousEpisodeSlug) {
        controls.push({
            position: 'right',
            html: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-step-back"><line x1="18" x2="18" y1="20" y2="4"/><polygon points="14,20 4,12 14,4"/></svg>',
            tooltip: 'Tập trước',
            index: 10,
            click: playPreviousEpisode,
        });
    }
    if (nextEpisodeSlug) {
        controls.push({
            position: 'right',
            html: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-step-forward"><line x1="6" x2="6" y1="4" y2="20"/><polygon points="10,4 20,12 10,20"/></svg>',
            tooltip: 'Tập tiếp theo',
            index: 20,
            click: playNextEpisode,
        });
    }

    const art = new Artplayer({
      container: playerContainerRef.current,
      url: m3u8Url || videoUrl || '',
      type: m3u8Url ? 'm3u8' : 'mp4',
      customType: {
        m3u8: playM3u8,
      },
      poster: poster || '',
      volume: 1,
      isLive: false,
      muted: false,
      autoplay: false,
      pip: true,
      autoSize: true,
      autoMini: true,
      playbackRate: true,
      setting: true,
      hotkey: true,
      autoPlayback: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: true,
      theme: '#FFD700',
      controls: controls,
      icons: {
          loading: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="animate-spin"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      },
    });

    art.on('video:timeupdate', () => {
        const now = Date.now();
        if (now - lastSaveTimestampRef.current > 15000) {
            saveProgress(art.currentTime, art.duration);
        }
    });

    art.on('video:ended', () => {
        playNextEpisode();
    });

    art.on('pause', () => {
       saveProgress(art.currentTime, art.duration);
    });

    artRef.current = art;

    return () => {
      art.destroy(false);
      artRef.current = null;
    };
  }, [useIframe, m3u8Url, videoUrl, poster, title, nextEpisodeSlug, previousEpisodeSlug, playNextEpisode, playPreviousEpisode, saveProgress]);

  return (
    <div className="relative w-full bg-[#121212] rounded-lg overflow-hidden shadow-2xl shadow-primary/20 focus:outline-none">
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700 text-white w-11/12 max-w-md flex flex-col items-center">
            <AlertDialogHeader className="w-full text-center">
                <AlertDialogTitle className="text-center">Tiếp tục xem?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400 text-center">
                    Bạn đã xem đến {formatTime(resumeTime)}. Bạn có muốn xem tiếp không?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row w-full justify-center gap-4 mt-4 sm:justify-center px-4">
                <AlertDialogCancel className="mt-0 sm:mt-0 px-6 bg-zinc-800 hover:bg-zinc-700 hover:text-white border-zinc-600 w-1/2 rounded-full" onClick={handleDismissResume}>Coi từ đầu</AlertDialogCancel>
                <AlertDialogAction className="bg-primary hover:bg-primary/90 text-black font-semibold w-1/2 rounded-full" onClick={handleResume}>Xem tiếp</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className={`relative ${useIframe ? 'aspect-[4/3] sm:aspect-video' : 'w-full aspect-[4/3] sm:aspect-video'}`}>
        {useIframe ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            allowFullScreen
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
          />
        ) : (
          <div ref={playerContainerRef} className="w-full h-full artplayer-app absolute inset-0 text-left"></div>
        )}

        {/* Loading Indicator cho M3U8 */}
        {isM3u8Loading && !useIframe && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-white text-sm">Đang tải video M3U8...</p>
          </div>
        )}

        {/* Fallback Notification */}
        {m3u8LoadFailed && embedUrl && (
          <div className="absolute top-4 left-4 right-4 bg-yellow-600/90 text-white p-3 rounded-lg text-sm flex items-center justify-between z-50">
            <span>⚠️ Không thể tải video M3U8, đã chuyển sang nguồn embed</span>
            <button 
              onClick={retryM3u8}
              className="ml-3 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
            >
              Thử lại M3U8
            </button>
          </div>
        )}
      </div>
    </div>
  );
}