'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Hls from 'hls.js';
import Artplayer from 'artplayer';
import { FastForward, StepBack, StepForward } from 'lucide-react';
import { renderToString } from 'react-dom/server';

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
  const [m3u8LoadFailed, setM3u8LoadFailed] = useState(false);
  const [isM3u8Loading, setIsM3u8Loading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(16/9);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<Artplayer | null>(null);
  const m3u8TimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Logic quyết định sử dụng iframe hay video player
  const useIframe = !m3u8Url || m3u8LoadFailed ? !!embedUrl : false;

  const retryM3u8 = useCallback(() => {
    if (m3u8Url) {
      console.log('Retrying M3U8 load...');
      setM3u8LoadFailed(false);
      setIsM3u8Loading(true);
    }
  }, [m3u8Url]);



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

    const isMobile = Artplayer.utils.isMobile;

    const controls: any[] = [
      {
        position: 'left',
        html: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11h-.85v-3.26l-1.01.31v-.69l1.77-.63h.09V16zm4.28-1.76c0 .32-.03.6-.1.82s-.17.42-.29.57-.28.26-.45.33-.37.1-.59.1-.41-.03-.59-.1-.33-.18-.46-.33-.23-.34-.3-.57-.11-.5-.11-.82v-.74c0-.32.03-.6.1-.82s.17-.42.29-.57.28-.26.45-.33.37-.1.59-.1.41.03.59.1.33.18.46.33.23.34.3.57.11.5.11.82v.74zm-.85-.86c0-.19-.01-.35-.04-.48s-.07-.23-.12-.31-.11-.14-.19-.17-.16-.05-.25-.05-.18.02-.25.05-.14.09-.19.17-.09.18-.12.31-.04.29-.04.48v.97c0 .19.01.35.04.48s.07.24.12.32.11.14.19.17.16.05.25.05.18-.02.25-.05.14-.09.19-.17.09-.19.11-.32.04-.29.04-.48v-.97z"/></svg>',
        tooltip: 'Tua lại 10s',
        index: 5, // Left of Play (Play is 10)
        click: () => {
          if (artRef.current) {
            artRef.current.seek = artRef.current.currentTime - 10;
          }
        },
      },
      {
        position: 'left',
        html: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#1f1f1f"><g><rect fill="none" height="24" width="24"/><rect fill="none" height="24" width="24"/><rect fill="none" height="24" width="24"/></g><g><g/><g><path d="M18,13c0,3.31-2.69,6-6,6s-6-2.69-6-6s2.69-6,6-6v4l5-5l-5-5v4c-4.42,0-8,3.58-8,8c0,4.42,3.58,8,8,8s8-3.58,8-8H18z"/><polygon points="10.9,16 10.9,11.73 10.81,11.73 9.04,12.36 9.04,13.05 10.05,12.74 10.05,16"/><path d="M14.32,11.78c-0.18-0.07-0.37-0.1-0.59-0.1s-0.41,0.03-0.59,0.1s-0.33,0.18-0.45,0.33s-0.23,0.34-0.29,0.57 s-0.1,0.5-0.1,0.82v0.74c0,0.32,0.04,0.6,0.11,0.82s0.17,0.42,0.3,0.57s0.28,0.26,0.46,0.33s0.37,0.1,0.59,0.1s0.41-0.03,0.59-0.1 s0.33-0.18,0.45-0.33s0.22-0.34,0.29-0.57s0.1-0.5,0.1-0.82V13.5c0-0.32-0.04-0.6-0.11-0.82s-0.17-0.42-0.3-0.57 S14.49,11.85,14.32,11.78z M14.33,14.35c0,0.19-0.01,0.35-0.04,0.48s-0.06,0.24-0.11,0.32s-0.11,0.14-0.19,0.17 s-0.16,0.05-0.25,0.05s-0.18-0.02-0.25-0.05s-0.14-0.09-0.19-0.17s-0.09-0.19-0.12-0.32s-0.04-0.29-0.04-0.48v-0.97 c0-0.19,0.01-0.35,0.04-0.48s0.06-0.23,0.12-0.31s0.11-0.14,0.19-0.17s0.16-0.05,0.25-0.05s0.18,0.02,0.25,0.05 s0.14,0.09,0.19,0.17s0.09,0.18,0.12,0.31s0.04,0.29,0.04,0.48V14.35z"/></g></g></svg>',
        tooltip: 'Tua tới 10s',
        index: 15, // Right of Play (Play is 10)
        click: () => {
          if (artRef.current) {
            artRef.current.seek = artRef.current.currentTime + 10;
          }
        },
      },
      {
        position: 'left',
        html: renderToString(<FastForward size={20} /> as any),
        tooltip: 'Tua tới 80s',
        disable: isMobile,
        index: 25, // Right of Volume (Volume is 20)
        click: () => {
          if (artRef.current) {
            artRef.current.currentTime += 80;
          }
        },
      }
    ];
    if (previousEpisodeSlug) {
        controls.push({
            position: 'right',
            html: renderToString(<StepBack size={20} /> as any),
            tooltip: 'Tập trước',
            index: 10,
            click: playPreviousEpisode,
        });
    }
    if (nextEpisodeSlug) {
        controls.push({
            position: 'right',
            html: renderToString(<StepForward size={20} /> as any),
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
      pip: !isMobile,
      autoMini: !isMobile,
      screenshot: !isMobile,
      lock: true,
      fastForward: true,
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

    art.on('ready', () => {
        try {
            const historyList: any[] = (art.storage.get('watch_history') as any[]) || [];
            const newHistory = historyList.filter(
                (item: any) => item.movieSlug !== movieSlug 
            );
            
            newHistory.unshift({
                movieSlug,
                episodeSlug,
                title,
                poster,
                url: m3u8Url || videoUrl || '',
                timestamp: Date.now(),
                duration: art.duration || 0,
            });

            if (newHistory.length > 50) newHistory.pop();
            art.storage.set('watch_history', newHistory);
        } catch (e) {
            console.error('Failed to save watch history');
        }
    });

    art.on('video:loadedmetadata', () => {
         if (art.video.videoWidth && art.video.videoHeight) {
             setAspectRatio(art.video.videoWidth / art.video.videoHeight);
         }

         try {
            const historyList: any[] = (art.storage.get('watch_history') as any[]) || [];
            if (historyList.length > 0 && historyList[0].movieSlug === movieSlug) {
                historyList[0].duration = art.duration;
                art.storage.set('watch_history', historyList);
            }
         } catch(e){}
    });

    art.on('video:ended', () => {
        playNextEpisode();
    });

    artRef.current = art;

    return () => {
      art.destroy(false);
      artRef.current = null;
    };
  }, [useIframe, m3u8Url, videoUrl, poster, title, nextEpisodeSlug, previousEpisodeSlug, playNextEpisode, playPreviousEpisode, episodeSlug, movieSlug]);

  return (
    <div className="relative w-full bg-[#121212] rounded-lg overflow-hidden shadow-2xl shadow-primary/20 focus:outline-none">
      <div className={`relative ${useIframe ? 'aspect-video' : 'w-full'}`}>
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
          <div ref={playerContainerRef} style={{ aspectRatio: `${aspectRatio}` }} className="w-full artplayer-app text-left z-[1]"></div>
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