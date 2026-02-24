'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, StepBack, StepForward, FastForward, RotateCcw, RotateCw, Settings, PictureInPicture2 } from 'lucide-react';
import Hls from 'hls.js';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isInPiP, setIsInPiP] = useState(false);
  const [m3u8LoadFailed, setM3u8LoadFailed] = useState(false);
  const [isM3u8Loading, setIsM3u8Loading] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastSaveTimestampRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const m3u8TimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const progressKey = `movie-progress-${movieId}-${episodeSlug}`;

  // Logic quyết định sử dụng iframe hay video player
  const useIframe = !m3u8Url || m3u8LoadFailed ? !!embedUrl : false;

  // Function để retry M3U8
  const retryM3u8 = useCallback(() => {
    if (m3u8Url) {
      console.log('Retrying M3U8 load...');
      setM3u8LoadFailed(false);
      setIsM3u8Loading(false);
    }
  }, [m3u8Url]);

  // Effect xử lý M3U8 với timeout fallback
  useEffect(() => {
    // Reset states khi URL thay đổi
    setM3u8LoadFailed(false);
    setIsM3u8Loading(false);
    
    if (m3u8TimeoutRef.current) {
      clearTimeout(m3u8TimeoutRef.current);
      m3u8TimeoutRef.current = null;
    }

    if (m3u8Url && videoRef.current && !m3u8LoadFailed) {
      setIsM3u8Loading(true);
      const video = videoRef.current;
      
      // Timeout 5 giây để fallback sang embed
      m3u8TimeoutRef.current = setTimeout(() => {
        console.warn('M3U8 load timeout after 5 seconds, falling back to embed');
        setM3u8LoadFailed(true);
        setIsM3u8Loading(false);
      }, 5000);

      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        
        hlsRef.current = hls;
        hls.loadSource(m3u8Url);
        hls.attachMedia(video);
        
        // Success callback - M3U8 loaded successfully
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('M3U8 manifest parsed successfully');
          if (m3u8TimeoutRef.current) {
            clearTimeout(m3u8TimeoutRef.current);
            m3u8TimeoutRef.current = null;
          }
          setIsM3u8Loading(false);
        });

        // Error callbacks
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS.js error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Fatal network error encountered, trying to fallback to embed');
                setM3u8LoadFailed(true);
                setIsM3u8Loading(false);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Fatal media error encountered, trying to fallback to embed');
                setM3u8LoadFailed(true);
                setIsM3u8Loading(false);
                break;
              default:
                console.error('Fatal error, trying to fallback to embed');
                setM3u8LoadFailed(true);
                setIsM3u8Loading(false);
                break;
            }
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        video.src = m3u8Url;
        
        const handleCanPlay = () => {
          console.log('Native HLS can play');
          if (m3u8TimeoutRef.current) {
            clearTimeout(m3u8TimeoutRef.current);
            m3u8TimeoutRef.current = null;
          }
          setIsM3u8Loading(false);
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('error', handleError);
        };

        const handleError = () => {
          console.error('Native HLS error, falling back to embed');
          setM3u8LoadFailed(true);
          setIsM3u8Loading(false);
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('error', handleError);
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', handleError);
      }

      return () => {
        if (m3u8TimeoutRef.current) {
          clearTimeout(m3u8TimeoutRef.current);
          m3u8TimeoutRef.current = null;
        }
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }
  }, [m3u8Url, m3u8LoadFailed]);

  // Helper to save progress reliably
  const saveProgress = useCallback(() => {
    if (videoRef.current && movieId && episodeSlug && !useIframe) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      
      // Nếu đã xem hơn 98%, xóa progress
      if (total > 0 && current / total > 0.98) {
        try {
          localStorage.removeItem(progressKey);
        } catch (error) {
           console.error("Failed to remove progress from localStorage", error);
        }
      } else if (current > 5) {
        try {
          const progress = {
              currentTime: current,
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

    // Cleanup old progress for the same movie to save localStorage memory
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
            // Lưu trữ dài hạn không giới hạn thời gian, chỉ hiển thị nếu time > 5s
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

    // Add unmount and visibility change listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveProgress();
      }
    };
    const handleBeforeUnload = () => {
      saveProgress();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveProgress(); // Ensure progress is saved when component unmounts
    };
  }, [progressKey, useIframe, movieId, episodeSlug, saveProgress]);

  useEffect(() => {
    setIsPiPSupported('pictureInPictureEnabled' in document && document.pictureInPictureEnabled);
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    const checkIsIOS = () => {
      const userAgent = window.navigator.userAgent;
      setIsIOS(/iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    };
    
    checkIsMobile();
    checkIsIOS();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  useEffect(() => {
    if (!isPiPSupported || useIframe || !videoRef.current) return;
    const video = videoRef.current;

    const onEnterPiP = () => setIsInPiP(true);
    const onLeavePiP = () => setIsInPiP(false);

    video.addEventListener('enterpictureinpicture', onEnterPiP);
    video.addEventListener('leavepictureinpicture', onLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', onEnterPiP);
      video.removeEventListener('leavepictureinpicture', onLeavePiP);
    };
  }, [isPiPSupported, useIframe]);

  // Effect để xử lý webkit fullscreen events cho iOS
  useEffect(() => {
    if (!isIOS || useIframe || !videoRef.current) return;
    const video = videoRef.current;

    const onEnterFullscreen = () => setIsFullscreen(true);
    const onExitFullscreen = () => setIsFullscreen(false);

    // Thêm event listeners cho webkit fullscreen events
    video.addEventListener('webkitbeginfullscreen', onEnterFullscreen);
    video.addEventListener('webkitendfullscreen', onExitFullscreen);

    return () => {
      video.removeEventListener('webkitbeginfullscreen', onEnterFullscreen);
      video.removeEventListener('webkitendfullscreen', onExitFullscreen);
    };
  }, [isIOS, useIframe]);

  const togglePlay = useCallback(() => {
    if (videoRef.current && !useIframe) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [useIframe]);

  const toggleMute = useCallback(() => {
    if (videoRef.current && !useIframe) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  }, [useIframe]);

  const handleTimeUpdate = () => {
    if (videoRef.current && !useIframe) {
      const currentTime = videoRef.current.currentTime;
      setCurrentTime(currentTime);

      if (movieId && episodeSlug) {
        const now = Date.now();
        // Lưu tiến trình mỗi 15 giây
        if (now - lastSaveTimestampRef.current > 15000) {
            saveProgress();
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && !useIframe) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!useIframe) {
      const newTime = parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!useIframe) {
      const newVolume = parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleResume = () => {
    if (videoRef.current) {
        videoRef.current.currentTime = resumeTime;
        videoRef.current.play();
        setIsPlaying(true);
    }
    setShowResumeDialog(false);
  };

  const handleDismissResume = () => {
      if (movieId && episodeSlug) {
          localStorage.removeItem(progressKey);
      }
      setShowResumeDialog(false);
  };

  const handleRewind10s = () => {
    if (videoRef.current) videoRef.current.currentTime -= 10;
  }

  const handleForward10s = () => {
    if (videoRef.current) videoRef.current.currentTime += 10;
  }

  
  const handleVideoAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (useIframe || !videoRef.current) return;

    if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        
        const oneThirdWidth = rect.width / 3;

        if (clickX < oneThirdWidth) {
            handleRewind10s();
        } else if (clickX > oneThirdWidth * 2) {
            handleForward10s();
        } else {
            togglePlay();
        }
    } else {
        tapTimeoutRef.current = setTimeout(() => {
            setShowControls(prev => !prev);
            tapTimeoutRef.current = null;
        }, 300);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    } else if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [showControls, isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Xử lý cả standard và webkit fullscreen events
      const isInFullscreen = !!(
        document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).mozFullScreenElement || 
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isInFullscreen);
    };

    // Add event listeners cho cả standard và webkit events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const playNextEpisode = () => {
    if (movieSlug && nextEpisodeSlug) {
        router.push(`/watch/${movieSlug}/${nextEpisodeSlug}`);
    }
  };

  const playPreviousEpisode = () => {
    if (movieSlug && previousEpisodeSlug) {
        router.push(`/watch/${movieSlug}/${previousEpisodeSlug}`);
    }
  };

  const handleSkipForward80s = () => {
    if (videoRef.current) {
        videoRef.current.currentTime += 80;
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettingsMenu(false);
    }
  };

  const togglePictureInPicture = async () => {
    if (useIframe || !videoRef.current || !isPiPSupported) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error("Failed to toggle Picture-in-Picture mode:", error);
    }
  };

  const toggleFullscreen = useCallback(async () => {
    try {
      // Kiểm tra nếu đang trong fullscreen mode
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).mozFullScreenElement || 
        (document as any).msFullscreenElement
      );

      if (isCurrentlyFullscreen) {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      } else {
        // Enter fullscreen
        if (useIframe && iframeRef.current) {
          // Xử lý fullscreen cho iframe
          if (iframeRef.current.requestFullscreen) {
            await iframeRef.current.requestFullscreen();
          } else if ((iframeRef.current as any).webkitRequestFullscreen) {
            (iframeRef.current as any).webkitRequestFullscreen();
          } else if ((iframeRef.current as any).mozRequestFullScreen) {
            (iframeRef.current as any).mozRequestFullScreen();
          } else if ((iframeRef.current as any).msRequestFullscreen) {
            (iframeRef.current as any).msRequestFullscreen();
          }
        } else if (isIOS && videoRef.current && !useIframe) {
          // Trên iOS, sử dụng webkitEnterFullscreen cho video element
          if ((videoRef.current as any).webkitEnterFullscreen) {
            (videoRef.current as any).webkitEnterFullscreen();
          } else if ((videoRef.current as any).webkitRequestFullscreen) {
            (videoRef.current as any).webkitRequestFullscreen();
          }
        } else if (playerContainerRef.current) {
          // Desktop browsers - fullscreen container
          if (playerContainerRef.current.requestFullscreen) {
            await playerContainerRef.current.requestFullscreen();
          } else if ((playerContainerRef.current as any).webkitRequestFullscreen) {
            (playerContainerRef.current as any).webkitRequestFullscreen();
          } else if ((playerContainerRef.current as any).mozRequestFullScreen) {
            (playerContainerRef.current as any).mozRequestFullScreen();
          } else if ((playerContainerRef.current as any).msRequestFullscreen) {
            (playerContainerRef.current as any).msRequestFullscreen();
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi chuyển đổi fullscreen:', error);
      
      // Fallback cho iOS nếu phương pháp chính không hoạt động
      if (isIOS && videoRef.current && !useIframe) {
        try {
          if ((videoRef.current as any).webkitEnterFullscreen) {
            (videoRef.current as any).webkitEnterFullscreen();
          }
        } catch (fallbackError) {
          console.error('Lỗi fallback fullscreen trên iOS:', fallbackError);
        }
      }
    }
  }, [useIframe, isIOS]);

  useEffect(() => {
    if (useIframe) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Dừng các hành động mặc định của trình duyệt cho các phím này khi trình phát được focus
      if ([' ', 'ArrowLeft', 'ArrowRight', 'f', 'm'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case ' ':
          togglePlay();
          break;
        case 'ArrowRight':
          if (videoRef.current) videoRef.current.currentTime += 10;
          break;
        case 'ArrowLeft':
          if (videoRef.current) videoRef.current.currentTime -= 10;
          break;
      }
    };
    
    const playerEl = playerContainerRef.current;
    if (playerEl) {
      playerEl.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (playerEl) {
        playerEl.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [useIframe, togglePlay]);

  return (
    <div 
      ref={playerContainerRef} 
      className="relative w-full bg-[#121212] rounded-lg overflow-hidden shadow-2xl shadow-primary/20 focus:outline-none"
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { if (isPlaying) setShowControls(false) }}
    >
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700 text-white w-11/12 max-w-md">
            <AlertDialogHeader>
                <AlertDialogTitle>Tiếp tục xem?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                    Bạn đã xem đến {formatTime(resumeTime)}. Bạn có muốn xem tiếp từ đây không hay muốn coi lại từ đầu?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                <AlertDialogCancel className="mt-0 sm:mt-0" onClick={handleDismissResume}>Coi lại từ đầu</AlertDialogCancel>
                <AlertDialogAction onClick={handleResume}>Xem tiếp</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Video Element */}
      <div 
        className={`relative ${isFullscreen ? 'w-full h-full' : 'aspect-[4/3] sm:aspect-video'}`}
        onClick={handleVideoAreaClick}
      >
        {useIframe ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title}
            className="w-full h-full"
            allowFullScreen
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
          />
        ) : videoUrl || m3u8Url ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            {...(isIOS && { webkitPlaysinline: true })}
            controls={false}
            preload="metadata"
            poster={poster}
            onPlay={() => setIsPlaying(true)}
            onPause={() => {
              setIsPlaying(false);
              saveProgress(); // Luôn lưu khi pause
            }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onVolumeChange={() => {
              if (videoRef.current) {
                setIsMuted(videoRef.current.muted);
                setVolume(videoRef.current.volume);
              }
            }}
            onEnded={playNextEpisode}
            {...(isIOS && {
              onWebkitEnterFullscreen: () => setIsFullscreen(true),
              onWebkitExitFullscreen: () => setIsFullscreen(false)
            })}
          >
            {videoUrl && <source src={videoUrl} type="video/mp4" />}
            {m3u8Url && <source src={m3u8Url} type="application/x-mpegURL" />}
          </video>
        ) : (
          <div
            className="w-full h-full bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: poster ? `url(${poster})` : 'none', backgroundColor: '#000' }}
          >
            <div className="bg-black/50 rounded-full p-4">
              <Play className="w-16 h-16 text-[#FFD700]" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Loading Indicator cho M3U8 */}
        {isM3u8Loading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-white text-sm">Đang tải video M3U8...</p>
          </div>
        )}

        {/* Fallback Notification */}
        {m3u8LoadFailed && embedUrl && (
          <div className="absolute top-4 left-4 right-4 bg-yellow-600/90 text-white p-3 rounded-lg text-sm flex items-center justify-between">
            <span>⚠️ Không thể tải video M3U8, đã chuyển sang nguồn embed</span>
            <button 
              onClick={retryM3u8}
              className="ml-3 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
            >
              Thử lại M3U8
            </button>
          </div>
        )}

        {/* Custom Controls */}
        <div 
          className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top controls could go here if needed */}
          <div></div>
          {/* Bottom controls */}
          <div className="p-2 sm:p-4 bg-gradient-to-t from-black/70 to-transparent">
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full custom-progress"
              style={{ '--progress-percent': `${duration > 0 ? (currentTime / duration) * 100 : 0}%` } as React.CSSProperties}
            />
            <div className="flex items-center justify-between text-white mt-2">
              <div className="flex items-center space-x-1 sm:space-x-4">
                <button onClick={handleRewind10s} className="focus:outline-none p-1 sm:p-2 rounded-full hover:bg-white/10" title="Tua lại 10 giây">
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button onClick={togglePlay} className="focus:outline-none">
                  {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>
                <button onClick={handleForward10s} className="focus:outline-none p-1 sm:p-2 rounded-full hover:bg-white/10" title="Tua tới 10 giây">
                    <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button onClick={handleSkipForward80s} className="focus:outline-none p-1 sm:p-2 rounded-full hover:bg-white/10" title="Bỏ qua 80 giây">
                    <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button onClick={toggleMute} className="focus:outline-none">
                  {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 custom-progress hidden sm:block"
                  style={{ '--progress-percent': `${isMuted ? 0 : volume * 100}%` } as React.CSSProperties}
                />
                <span className="text-xs sm:text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-4">
                {previousEpisodeSlug && (
                    <button onClick={playPreviousEpisode} className="focus:outline-none p-1 sm:p-2 rounded-full hover:bg-white/10" title="Tập trước">
                        <StepBack className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                )}
                {nextEpisodeSlug && (
                    <button onClick={playNextEpisode} className="focus:outline-none p-1 sm:p-2 rounded-full hover:bg-white/10" title="Tập tiếp theo">
                        <StepForward className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                )}
                
                {/* Picture-in-Picture Button */}
                {!useIframe && isPiPSupported && (
                  <button onClick={togglePictureInPicture} className={`focus:outline-none p-1 sm:p-2 rounded-full hover:bg-white/10 ${isInPiP ? 'text-primary' : ''}`} title="Hình trong hình">
                    <PictureInPicture2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}

                {/* Settings Button */}
                {!useIframe && (
                    <div className="relative">
                        <button onClick={() => setShowSettingsMenu(prev => !prev)} className="focus:outline-none p-1 sm:p-2 rounded-full hover:bg-white/10" title="Cài đặt">
                            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        {showSettingsMenu && (
                             <div 
                                className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg p-2 flex flex-col items-start w-32"
                                onMouseLeave={() => setShowSettingsMenu(false)}
                            >
                                <span className="text-xs text-gray-400 px-2 pb-1 w-full text-center">Tốc độ</span>
                                {[0.5, 1, 1.5, 2].map((rate) => (
                                    <button
                                        key={rate}
                                        onClick={() => handlePlaybackRateChange(rate)}
                                        className={`w-full text-left px-2 py-1 rounded text-sm whitespace-nowrap ${playbackRate === rate ? 'bg-primary text-white font-bold' : 'hover:bg-white/20'}`}
                                    >
                                        {rate === 1 ? 'Bình thường' : `${rate}x`}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <button onClick={toggleFullscreen} className="focus:outline-none">
                  <Maximize className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}