'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  getEmbedUrl,
  getThumbnailUrl,
  formatTime,
  calculateTotalWatchTime,
} from '@/services/youtubeService';
import { useInputStore } from '@/store/useInputStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { XP_RULES } from '@/lib/constants';

// ============================================
// TIPOS
// ============================================

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onReady?: (duration: number) => void;
  autoplay?: boolean;
  startTime?: number;
  className?: string;
}

interface WatchedSegment {
  start: number;
  end: number;
}

// ============================================
// TIPOS GLOBALES YOUTUBE
// ============================================

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

// ============================================
// COMPONENTE
// ============================================

export function YouTubePlayer({
  videoId,
  title,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnd,
  onReady,
  autoplay = false,
  startTime = 0,
  className = '',
}: YouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const segmentStartRef = useRef<number>(0);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedSegments, setWatchedSegments] = useState<WatchedSegment[]>([]);
  const [totalWatched, setTotalWatched] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const { addMinutesListened } = useInputStore();
  const { addXP } = useGamificationStore();

  // Cargar YouTube IFrame API
  useEffect(() => {
    if (window.YT) {
      initPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoId]);

  const initPlayer = useCallback(() => {
    if (!containerRef.current) return;

    const playerId = `youtube-player-${videoId}`;

    // Crear div para el player si no existe
    let playerDiv = document.getElementById(playerId);
    if (!playerDiv) {
      playerDiv = document.createElement('div');
      playerDiv.id = playerId;
      containerRef.current.appendChild(playerDiv);
    }

    playerRef.current = new window.YT.Player(playerId, {
      videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        start: startTime,
        rel: 0,
        modestbranding: 1,
        cc_load_policy: 1,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: handlePlayerReady,
        onStateChange: handleStateChange,
        onError: handleError,
      },
    });
  }, [videoId, autoplay, startTime]);

  const handlePlayerReady = useCallback((event: { target: YTPlayer }) => {
    const player = event.target;
    const videoDuration = player.getDuration();

    setDuration(videoDuration);
    setIsReady(true);
    onReady?.(videoDuration);
  }, [onReady]);

  const handleStateChange = useCallback((event: { data: number; target: YTPlayer }) => {
    const player = event.target;

    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);
        segmentStartRef.current = player.getCurrentTime();
        startTimeTracking();
        onPlay?.();
        break;

      case window.YT.PlayerState.PAUSED:
        setIsPlaying(false);
        recordWatchedSegment(player.getCurrentTime());
        stopTimeTracking();
        onPause?.();
        break;

      case window.YT.PlayerState.ENDED:
        setIsPlaying(false);
        recordWatchedSegment(duration);
        stopTimeTracking();
        handleVideoEnd();
        onEnd?.();
        break;
    }
  }, [duration, onPlay, onPause, onEnd]);

  const handleError = useCallback((event: { data: number }) => {
    console.error('YouTube player error:', event.data);
  }, []);

  const startTimeTracking = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        onTimeUpdate?.(time);
      }
    }, 500); // Actualizar cada 500ms
  }, [onTimeUpdate]);

  const stopTimeTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const recordWatchedSegment = useCallback((endTime: number) => {
    const startTime = segmentStartRef.current;
    if (endTime > startTime) {
      const newSegment = { start: startTime, end: endTime };
      setWatchedSegments((prev) => {
        const updated = [...prev, newSegment];
        const newTotal = calculateTotalWatchTime(updated);
        setTotalWatched(newTotal);

        // Calcular XP ganado (1 XP por cada 10 segundos)
        const prevTotal = calculateTotalWatchTime(prev);
        const newSeconds = newTotal - prevTotal;
        if (newSeconds >= 10) {
          const xpToAdd = Math.floor(newSeconds / 10);
          addXP(xpToAdd);
          setXpEarned((e) => e + xpToAdd);
        }

        return updated;
      });
    }
  }, [addXP]);

  const handleVideoEnd = useCallback(() => {
    // Registrar minutos escuchados
    const minutesWatched = totalWatched / 60;
    addMinutesListened(minutesWatched, 'fr', 'A1');

    // XP bonus por completar video
    addXP(XP_RULES.inputVideoComplete);
    setXpEarned((e) => e + XP_RULES.inputVideoComplete);
  }, [totalWatched, addMinutesListened, addXP]);

  // Controles expuestos
  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  }, []);

  // Progreso visual
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const watchedProgress = duration > 0 ? (totalWatched / duration) * 100 : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Contenedor del player */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden"
      >
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <img
                src={getThumbnailUrl(videoId, 'high')}
                alt={title || 'Video thumbnail'}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controles e info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3">
        {/* Título */}
        {title && (
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h3>
        )}

        {/* Barra de progreso */}
        <div className="space-y-1">
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            {/* Progreso visto (único) */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-emerald-500/50 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${watchedProgress}%` }}
              transition={{ duration: 0.3 }}
            />
            {/* Posición actual */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Tiempo */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Estadísticas de la sesión */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-300">
              ⏱️ Visto: {formatTime(totalWatched)}
            </span>
            {watchedProgress > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">
                {Math.round(watchedProgress)}% completado
              </span>
            )}
          </div>

          {xpEarned > 0 && (
            <motion.span
              className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-medium"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              +{xpEarned} XP
            </motion.span>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => seekTo(Math.max(0, currentTime - 10))}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Retroceder 10s"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          <button
            onClick={isPlaying ? pause : play}
            className="p-4 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => seekTo(Math.min(duration, currentTime + 10))}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Avanzar 10s"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default YouTubePlayer;
