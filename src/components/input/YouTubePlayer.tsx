'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { YTPlayer, YTPlayerEvent } from '@/types/youtube';
import { YTPlayerState } from '@/types/youtube';

interface YouTubePlayerProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

// Singleton para cargar YouTube API solo una vez
let youtubeAPILoading = false;
const youtubeAPIReadyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    if (youtubeAPILoading) {
      youtubeAPIReadyCallbacks.push(() => resolve());
      return;
    }

    youtubeAPILoading = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.defer = true;
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      youtubeAPILoading = false;
      resolve();
      // Ejecutar todos los callbacks pendientes
      youtubeAPIReadyCallbacks.forEach((cb) => cb());
      youtubeAPIReadyCallbacks.length = 0;
    };
  });
}

export function YouTubePlayer({
  videoId,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnd,
}: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoizar callbacks para evitar re-renders
  const handleTimeUpdate = useCallback(
    (current: number, duration: number) => {
      onTimeUpdate?.(current, duration);
    },
    [onTimeUpdate]
  );

  const handlePlay = useCallback(() => {
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    onPause?.();
  }, [onPause]);

  const handleEnd = useCallback(() => {
    onEnd?.();
  }, [onEnd]);

  // Cargar YouTube API solo una vez
  useEffect(() => {
    loadYouTubeAPI().then(() => {
      setIsReady(true);
    });
  }, []);

  // Inicializar player cuando la API está lista
  useEffect(() => {
    if (!isReady || !playerRef.current || !videoId) return;

    // Limpiar player anterior si existe
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy();
      } catch {
        // Ignorar errores
      }
      playerInstanceRef.current = null;
    }

    // Limpiar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      if (!window.YT) {
      return;
    }

    const player = new window.YT.Player(playerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: () => {
            // Iniciar tracking de tiempo solo cuando el player está listo
            intervalRef.current = setInterval(() => {
              if (playerInstanceRef.current) {
                try {
                  const currentTime = playerInstanceRef.current.getCurrentTime();
                  const duration = playerInstanceRef.current.getDuration();
                  if (currentTime > 0 && duration > 0) {
                    handleTimeUpdate(currentTime, duration);
                  }
                } catch {
                  // Ignorar errores si el player no está disponible
                }
              }
            }, 1000);
          },
          onStateChange: (event: YTPlayerEvent) => {
            if (event.data === YTPlayerState.PLAYING) {
              handlePlay();
            } else if (event.data === YTPlayerState.PAUSED) {
              handlePause();
            } else if (event.data === YTPlayerState.ENDED) {
              handleEnd();
            }
          },
        },
      });

      playerInstanceRef.current = player;
    } catch {
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch {
          // Ignorar errores al destruir
        }
        playerInstanceRef.current = null;
      }
    };
  }, [isReady, videoId, handleTimeUpdate, handlePlay, handlePause, handleEnd]);

  if (!videoId) {
    return null;
  }

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div ref={playerRef} className="w-full h-full" />
    </div>
  );
}

