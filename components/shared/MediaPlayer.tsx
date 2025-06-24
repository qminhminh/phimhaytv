'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';

interface MediaPlayerProps {
  embedUrl?: string;
  m3u8Url?: string;
  title?: string;
  poster?: string;
  videoUrl?: string;
}

export default function MediaPlayer({ embedUrl, m3u8Url, title, poster, videoUrl }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Nếu có embedUrl, ưu tiên sử dụng iframe
  const useIframe = !!embedUrl;

  const togglePlay = () => {
    if (videoRef.current && !useIframe) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
      setCurrentTime(videoRef.current.currentTime);
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
    <div className="relative w-full max-w-4xl mx-auto bg-[#121212] rounded-lg overflow-hidden">
      {/* Video Element */}
      <div className="relative aspect-video">
        {useIframe ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : videoUrl || m3u8Url ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            poster={poster}
            controls={!!m3u8Url} // Hiển thị controls mặc định nếu sử dụng m3u8
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
        
        {/* Play/Pause Overlay - chỉ hiển thị khi không dùng iframe và không dùng m3u8 */}
        {!useIframe && !m3u8Url && (
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
      
      {/* Controls - chỉ hiển thị khi không dùng iframe và không dùng m3u8 */}
      {!useIframe && !m3u8Url && (
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