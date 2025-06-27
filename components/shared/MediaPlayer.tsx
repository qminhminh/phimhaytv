'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, ArrowRightFromLine } from 'lucide-react';
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
}

export default function MediaPlayer({ embedUrl, m3u8Url, title, poster, videoUrl, movieId, episodeSlug, movieSlug, nextEpisodeSlug }: MediaPlayerProps) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastSaveTimestampRef = useRef(0);

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

  const togglePlay = () => {
    if (videoRef.current && !useIframe) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current && !useIframe) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !useIframe) {
      const currentTime = videoRef.current.currentTime;
      setCurrentTime(currentTime);

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

  const playNextEpisode = () => {
    if (movieSlug && nextEpisodeSlug) {
        router.push(`/watch/${movieSlug}/${nextEpisodeSlug}`);
    }
  };

  const toggleFullscreen = () => {
    if (useIframe && iframeRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        iframeRef.current.requestFullscreen();
      }
    } else if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="relative w-full bg-[#121212] rounded-lg overflow-hidden shadow-2xl shadow-primary/20">
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
      <div className="relative aspect-video">
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
            className="w-full h-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            poster={poster}
            controls={false} // Luôn dùng controls tùy chỉnh
            onClick={togglePlay}
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

        {/* Play/Pause Overlay - chỉ hiển thị khi không dùng iframe */}
        {!useIframe && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            {!isPlaying && (
              <div className="bg-black/50 rounded-full p-4">
                <Play className="w-16 h-16 text-[#FFD700]" fill="currentColor" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls - chỉ hiển thị khi không dùng iframe */}
      {!useIframe && (
        <div className="bg-[#1A1A1A] p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-[#A0A0A0] mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)}
                className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlay}
                className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#121212] p-3 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" fill="currentColor" />}
              </button>

              <button
                onClick={() => videoRef.current && (videoRef.current.currentTime += 10)}
                className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              {nextEpisodeSlug && (
                <button
                    onClick={playNextEpisode}
                    className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors"
                    title="Tập tiếp theo"
                >
                    <ArrowRightFromLine className="w-6 h-6" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-[#EAEAEA] hover:text-[#FFD700] transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}