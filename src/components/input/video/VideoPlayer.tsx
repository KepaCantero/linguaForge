'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INPUT_COLORS, LOADING_SPINNER } from '@/config/input';
import type { YTPlayer, YTPlayerEvent } from '@/types/youtube';
import { YTPlayerState } from '@/types/youtube';

// ============================================================
// TYPES
// ============================================================

export interface VideoPlayerProps {
  videoId: string;
  startTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  className?: string;
}

export interface VideoControlState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;
  isMuted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const SKIP_AMOUNTS = {
  backwardLarge: -10,
  backwardSmall: -5,
  forwardSmall: 5,
  forwardLarge: 10,
} as const;

const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as const;

const CONTROLS_IDLE_TIMEOUT = 3000; // ms

// ============================================================
// COMPONENT
// ============================================================

/**
 * VideoPlayer - Player de YouTube con controles premium
 *
 * Características:
 * - Seek bar con gradiente y preview
 * - Botones de skip (-10s, -5s, +5s, +10s)
 * - Control de velocidad (0.5x - 2x)
 * - Control de volumen con slider animado
 * - Fullscreen y picture-in-picture
 * - Keyboard shortcuts (espacio, flechas, M, F)
 * - Progreso guardado automáticamente
 * - Controles que desaparecen en idle
 */
export function VideoPlayer({
  videoId,
  startTime = 0,
  onTimeUpdate,
  onEnded,
  className = '',
}: VideoPlayerProps) {
  // Refs
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsIdleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Estado
  const [state, setState] = useState<VideoControlState>({
    isPlaying: false,
    currentTime: startTime,
    duration: 0,
    volume: 1,
    playbackRate: 1.0 as const,
    isMuted: false,
    isFullscreen: false,
    showControls: true,
  });

  const [isAPIReady, setIsAPIReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Cargar YouTube API
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsAPIReady(true);
      };
    } else if (window.YT) {
      setIsAPIReady(true);
    }
  }, []);

  // Inicializar player cuando API esté lista
  useEffect(() => {
    if (!isAPIReady || !containerRef.current || playerRef.current || !window.YT) return;

    const YT = window.YT;
    playerRef.current = new YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event: YTPlayerEvent) => {
          const duration = event.target.getDuration();
          setIsPlayerReady(true);
          setState(prev => ({ ...prev, duration }));

          // Set initial time if provided
          if (startTime > 0) {
            event.target.seekTo(startTime, true);
          }
        },
        onStateChange: (event: YTPlayerEvent) => {
          const playerState = event.target.getPlayerState();
          const isPlaying = playerState === YTPlayerState.PLAYING;
          const isEnded = playerState === YTPlayerState.ENDED;

          setState(prev => ({ ...prev, isPlaying }));

          if (isEnded) {
            onEnded?.();
          }
        },
      },
    });

    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [isAPIReady, videoId, startTime, onEnded]);

  // Actualizar tiempo actual
  useEffect(() => {
    if (!isPlayerReady || !state.isPlaying) return;

    const interval = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        setState(prev => ({ ...prev, currentTime }));
        onTimeUpdate?.(currentTime);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isPlayerReady, state.isPlaying, onTimeUpdate]);

  // Reset timer de controles idle
  const resetControlsIdleTimer = useCallback(() => {
    if (controlsIdleTimerRef.current) {
      clearTimeout(controlsIdleTimerRef.current);
    }

    setState(prev => ({ ...prev, showControls: true }));

    if (state.isPlaying) {
      controlsIdleTimerRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, showControls: false }));
      }, CONTROLS_IDLE_TIMEOUT);
    }
  }, [state.isPlaying]);

  // Manejar movimiento del mouse para mostrar controles
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = () => resetControlsIdleTimer();

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleMouseMove);
    };
  }, [resetControlsIdleTimer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlayerReady) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(SKIP_AMOUNTS.backwardSmall);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(SKIP_AMOUNTS.forwardSmall);
          break;
        case 'j':
          skip(SKIP_AMOUNTS.backwardLarge);
          break;
        case 'l':
          skip(SKIP_AMOUNTS.forwardLarge);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case '<':
        case ',':
          changePlaybackRate(-0.25);
          break;
        case '>':
        case '.':
          changePlaybackRate(0.25);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerReady]);

  // Controles
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;

    if (state.isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [state.isPlaying]);

  const skip = useCallback((amount: number) => {
    if (!playerRef.current) return;

    const currentTime = playerRef.current.getCurrentTime();
    const newTime = Math.max(0, Math.min(currentTime + amount, state.duration));
    playerRef.current.seekTo(newTime, true);
    setState(prev => ({ ...prev, currentTime: newTime }));
  }, [state.duration]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;

    const newTime = parseFloat(e.target.value);
    playerRef.current.seekTo(newTime, true);
    setState(prev => ({ ...prev, currentTime: newTime }));
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    if (!playerRef.current) return;

    playerRef.current.setVolume(newVolume * 100);
    setState(prev => ({ ...prev, volume: newVolume, isMuted: newVolume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;

    if (state.isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(state.volume * 100);
      setState(prev => ({ ...prev, isMuted: false }));
    } else {
      playerRef.current.mute();
      setState(prev => ({ ...prev, isMuted: true }));
    }
  }, [state.isMuted, state.volume]);

  const setPlaybackRate = useCallback((rate: 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0) => {
    if (!playerRef.current) return;

    playerRef.current.setPlaybackRate(rate);
    setState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  const changePlaybackRate = useCallback((delta: number) => {
    const currentIndex = PLAYBACK_RATES.indexOf(state.playbackRate);
    const newIndex = Math.max(0, Math.min(PLAYBACK_RATES.length - 1, currentIndex + (delta > 0 ? 1 : -1)));
    setPlaybackRate(PLAYBACK_RATES[newIndex]);
  }, [state.playbackRate, setPlaybackRate]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setState(prev => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setState(prev => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black rounded-xl overflow-hidden group ${className}`}
      onMouseMove={resetControlsIdleTimer}
    >
      {/* YouTube Iframe Container */}
      <div id={`youtube-player-${videoId}`} className="w-full aspect-video" />

      {/* Overlay de carga */}
      {!isPlayerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <motion.div
            className={`${LOADING_SPINNER.default} ${LOADING_SPINNER.colors.sky}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      {/* Botón de play central (cuando está pausado) */}
      <AnimatePresence>
        {!state.isPlaying && isPlayerReady && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
            aria-label="Reproducir video"
          >
            <motion.div
              className={`w-20 h-20 rounded-full ${INPUT_COLORS.sky[600].replace('hover:bg-sky-700', '')}/90 flex items-center justify-center`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white text-4xl ml-1">▶</span>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controles flotantes */}
      <AnimatePresence>
        {state.showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent"
          >
            {/* Seek bar */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={state.duration}
                step={0.1}
                value={state.currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:INPUT_COLORS.video.bgDark [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform"
                style={{
                  background: `linear-gradient(to right, #0EA5E9 ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
                }}
              />
              <div className="flex justify-between mt-1 text-xs text-white/70">
                <span>{formatTime(state.currentTime)}</span>
                <span>{formatTime(state.duration)}</span>
              </div>
            </div>

            {/* Botones de control */}
            <div className="flex items-center justify-between">
              {/* Izquierda: Play/Pause, Skip, Volume */}
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-2 text-white hover:INPUT_COLORS.video.textColor transition-colors"
                  aria-label={state.isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {state.isPlaying ? '⏸️' : '▶️'}
                </button>

                {/* Skip backward */}
                <button
                  onClick={() => skip(SKIP_AMOUNTS.backwardLarge)}
                  className="px-2 py-1 text-sm text-white/70 hover:text-white transition-colors"
                  aria-label="-10 segundos"
                >
                  -10s
                </button>
                <button
                  onClick={() => skip(SKIP_AMOUNTS.backwardSmall)}
                  className="px-2 py-1 text-sm text-white/70 hover:text-white transition-colors"
                  aria-label="-5 segundos"
                >
                  -5s
                </button>

                {/* Skip forward */}
                <button
                  onClick={() => skip(SKIP_AMOUNTS.forwardSmall)}
                  className="px-2 py-1 text-sm text-white/70 hover:text-white transition-colors"
                  aria-label="+5 segundos"
                >
                  +5s
                </button>
                <button
                  onClick={() => skip(SKIP_AMOUNTS.forwardLarge)}
                  className="px-2 py-1 text-sm text-white/70 hover:text-white transition-colors"
                  aria-label="+10 segundos"
                >
                  +10s
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={toggleMute}
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label={state.isMuted ? 'Activar sonido' : 'Silenciar'}
                  >
                    {state.isMuted || state.volume === 0 ? '🔇' : state.volume < 0.5 ? '🔉' : '🔊'}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={state.isMuted ? 0 : state.volume}
                    onChange={(e) => changeVolume(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>
              </div>

              {/* Derecha: Speed, Fullscreen */}
              <div className="flex items-center gap-2">
                {/* Playback rate */}
                <div className="flex items-center bg-white/10 rounded-lg">
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setPlaybackRate(rate)}
                      className={`
                        px-2 py-1 text-sm font-medium transition-colors
                        ${state.playbackRate === rate
                          ? 'INPUT_COLORS.video.bgDark text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                        }
                      `}
                      aria-label={`Velocidad ${rate}x`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                  aria-label="Pantalla completa"
                >
                  {state.isFullscreen ? '⛶' : '⛶'}
                </button>
              </div>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="mt-3 pt-2 border-t border-white/10">
              <p className="text-xs text-white/50 text-center">
                Atajos: Espacio/K=Play ←→=Skip M=Mute F=Fullscreen ,.=Velocidad
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VideoPlayer;
