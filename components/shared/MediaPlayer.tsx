'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, StepBack, StepForward, FastForward } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastSaveTimestampRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const progressKey = `movie-progress-${movieId}-${episodeSlug}`;

  // Nếu có embedUrl, ưu tiên sử dụng iframe
  const useIframe = !!embedUrl;

  useEffect(() => {
    if (m3u8Url && videoRef.current) {
        const video = videoRef.current;
        if (Hls.isSupported()) {
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(m3u8Url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                // Autoplay can be handled here if needed
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = m3u8Url;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }
  }, [m3u8Url]);

  useEffect(() => {
    if (useIframe || !movieId || !episodeSlug) {
        setShowResumeDialog(false);
        return;
    };

    let isMounted = true;

    try {
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
            const { currentTime: savedTime, timestamp } = JSON.parse(savedProgress);
            const oneHour = 3600 * 1000;
            // Chỉ hiển thị dialog nếu component vẫn còn mounted
            if (isMounted && Date.now() - timestamp < oneHour && savedTime > 5) {
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

    return () => {
        isMounted = false;
    };
  }, [progressKey, useIframe, movieId, episodeSlug]);

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
      const duration = videoRef.current.duration;
      setCurrentTime(currentTime);

      // Nếu người dùng đã xem hơn 98% thời lượng, hãy xóa tiến trình đã lưu
      // để không hiển thị hộp thoại tiếp tục ở tập sau.
      if (duration > 0 && currentTime / duration > 0.98) {
        try {
          localStorage.removeItem(progressKey);
        } catch (error) {
           console.error("Failed to remove progress from localStorage", error);
        }
        return; // Dừng lại để không lưu lại tiến trình mới
      }
      
      if (movieId && episodeSlug) {
        const now = Date.now();
        // Lưu tiến trình mỗi 15 giây
        if (now - lastSaveTimestampRef.current > 15000) {
            try {
                const progress = {
                    currentTime: currentTime,
                    timestamp: now,
                };
                localStorage.setItem(progressKey, JSON.stringify(progress));
                lastSaveTimestampRef.current = now;
            } catch (error) {
                console.error("Failed to save progress to localStorage", error);
            }
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

  const handleVideoAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (useIframe || !videoRef.current) return;

    if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        
        const oneThirdWidth = rect.width / 3;

        if (clickX < oneThirdWidth) {
            videoRef.current.currentTime -= 10;
        } else if (clickX > oneThirdWidth * 2) {
            videoRef.current.currentTime += 10;
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
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
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

  const toggleFullscreen = useCallback(() => {
    if (useIframe && iframeRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        iframeRef.current.requestFullscreen();
      }
    } else if (playerContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerContainerRef.current.requestFullscreen();
      }
    }
  }, [useIframe]);

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
        <AlertDialogContent className="bg-zinc-900 border-zinc-700 text-white">
            <AlertDialogHeader>
                <AlertDialogTitle>Tiếp tục xem?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                    Bạn đã xem đến {formatTime(resumeTime)}. Bạn có muốn xem tiếp từ đây không?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={handleDismissResume}>Không, bắt đầu lại</AlertDialogCancel>
                <AlertDialogAction onClick={handleResume}>Có, xem tiếp</AlertDialogAction>
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
            poster={poster}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onVolumeChange={() => {
              if (videoRef.current) {
                setIsMuted(videoRef.current.muted);
                setVolume(videoRef.current.volume);
              }
            }}
            onEnded={playNextEpisode}
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
                <button onClick={togglePlay} className="focus:outline-none">
                  {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
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