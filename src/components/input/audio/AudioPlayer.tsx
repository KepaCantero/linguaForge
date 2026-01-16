'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INPUT_COLORS, INPUT_TYPE_COLORS, LOADING_SPINNER } from '@/config/input';

// ============================================================
// TYPES
// ============================================================

export interface AudioPlayerProps {
  audioUrl?: string;
  audioFile?: File;
  startTime?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
  autoPlay?: boolean;
}

export interface AudioControlState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;
  isMuted: boolean;
  isDragging: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const SKIP_AMOUNTS = {
  backwardLarge: -15,
  backwardSmall: -5,
  forwardSmall: 5,
  forwardLarge: 15,
} as const;

const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as const;

const VOLUME_STEP = 0.1;

// ============================================================
// COMPONENT
// ============================================================

/**
 * AudioPlayer - Reproductor de audio premium con controles completos
 *
 * Características:
 * - Seek bar con gradiente y preview de tiempo
 * - Botones de skip (-15s, -5s, +5s, +15s)
 * - Control de velocidad (0.5x - 2x)
 * - Control de volumen con slider animado
 * - Visualizador de ondas de audio (waveform)
 * - Keyboard shortcuts (espacio, flechas, M, <, >)
 * - Progreso guardado automáticamente
 * - Soporte para archivos locales (File API)
 */
export function AudioPlayer({
  audioUrl,
  audioFile,
  startTime = 0,
  onTimeUpdate,
  onEnded,
  onPlay,
  onPause,
  className = '',
  autoPlay = false,
}: AudioPlayerProps) {
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);

  // Estado
  const [state, setState] = useState<AudioControlState>({
    isPlaying: false,
    currentTime: startTime,
    duration: 0,
    volume: 1,
    playbackRate: 1.0,
    isMuted: false,
    isDragging: false,
  });

  const [isReady, setIsReady] = useState(false);
  const [audioSource, setAudioSource] = useState<string | undefined>(audioUrl);

  // Actualizar source cuando cambie el archivo
  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioSource(url);
      return () => URL.revokeObjectURL(url);
    }
    setAudioSource(audioUrl);
  }, [audioFile, audioUrl]);

  // Setup audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
      setIsReady(true);

      if (startTime > 0) {
        audio.currentTime = startTime;
      }

      if (autoPlay) {
        audio.play().catch(() => {
          // Auto-play was prevented, that's okay
        });
      }
    };

    const handleTimeUpdate = () => {
      if (!state.isDragging) {
        const currentTime = audio.currentTime;
        setState(prev => ({ ...prev, currentTime }));
        onTimeUpdate?.(currentTime, audio.duration);
      }
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      onEnded?.();
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
      onPlay?.();
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      onPause?.();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [state.isDragging, startTime, autoPlay, onTimeUpdate, onEnded, onPlay, onPause]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isReady) return;

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
  }, [isReady, state.playbackRate]);

  // Controles
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }, [state.isPlaying]);

  const skip = useCallback((amount: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(audio.currentTime + amount, audio.duration));
    audio.currentTime = newTime;
    setState(prev => ({ ...prev, currentTime: newTime }));
  }, []);

  const handleSeekStart = useCallback((e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setState(prev => ({ ...prev, currentTime: newTime }));
  }, []);

  const handleSeekEnd = useCallback((e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const target = e.target as HTMLInputElement;
    const newTime = parseFloat(target.value);
    audio.currentTime = newTime;
    setState(prev => ({ ...prev, currentTime: newTime, isDragging: false }));
    onTimeUpdate?.(newTime, audio.duration);
  }, [onTimeUpdate]);

  const changeVolume = useCallback((newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audio.volume = clampedVolume;
    setState(prev => ({ ...prev, volume: clampedVolume, isMuted: clampedVolume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isMuted) {
      audio.volume = state.volume || 1;
      setState(prev => ({ ...prev, isMuted: false }));
    } else {
      audio.volume = 0;
      setState(prev => ({ ...prev, isMuted: true }));
    }
  }, [state.isMuted, state.volume]);

  const setPlaybackRate = useCallback((rate: 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    setState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  const changePlaybackRate = useCallback((delta: number) => {
    const currentIndex = PLAYBACK_RATES.indexOf(state.playbackRate);
    const newIndex = Math.max(0, Math.min(PLAYBACK_RATES.length - 1, currentIndex + (delta > 0 ? 1 : -1)));
    setPlaybackRate(PLAYBACK_RATES[newIndex]);
  }, [state.playbackRate, setPlaybackRate]);

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  // Colors
  const colors = INPUT_COLORS.amber;

  return (
    <div className={`relative w-full bg-black rounded-xl overflow-hidden ${className}`}>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioSource}
        preload="metadata"
      />

      {/* Waveform Visualizer (decorativo) */}
      <div className="h-24 bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-8 gap-1">
        {!isReady ? (
          <motion.div
            className={`${LOADING_SPINNER.default} ${LOADING_SPINNER.colors.amber}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          // Simulated waveform bars
          Array.from({ length: 60 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-1 rounded-full transition-colors ${
                state.isPlaying ? INPUT_TYPE_COLORS.audio.bgDark.replace('bg-amber-500/10', 'bg-amber-900/20') : 'bg-gray-600'
              }`}
              animate={{
                height: state.isPlaying
                  ? [8 + Math.random() * 48, 8 + Math.random() * 48, 8 + Math.random() * 48]
                  : 8 + Math.abs(Math.sin(i * 0.2)) * 48,
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                repeatDelay: 0.1,
              }}
            />
          ))
        )}
      </div>

      {/* Botón de play central (cuando está pausado) */}
      <AnimatePresence>
        {!state.isPlaying && isReady && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
            aria-label="Reproducir audio"
          >
            <motion.div
              className={`w-20 h-20 rounded-full ${INPUT_TYPE_COLORS.audio.bgDark.replace('bg-amber-500/10', 'bg-amber-900/20')} flex items-center justify-center`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white text-4xl ml-1">▶</span>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controles flotantes */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
        {/* Seek bar */}
        <div className="mb-4">
          <input
            ref={progressRef}
            type="range"
            min={0}
            max={state.duration || 0}
            step={0.1}
            value={state.currentTime}
            onMouseDown={handleSeekStart}
            onChange={handleSeekChange}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform"
            style={{
              background: `linear-gradient(to right, #F59E0B ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
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
              className={`p-2 text-white hover:${INPUT_COLORS.amber[400].replace('text-', 'hover:text-')} transition-colors`}
              aria-label={state.isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {state.isPlaying ? '⏸️' : '▶️'}
            </button>

            {/* Skip backward */}
            <button
              onClick={() => skip(SKIP_AMOUNTS.backwardLarge)}
              className="px-2 py-1 text-sm text-white/70 hover:text-white transition-colors"
              aria-label="-15 segundos"
            >
              -15s
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
              aria-label="+15 segundos"
            >
              +15s
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

          {/* Derecha: Speed */}
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
                      ? INPUT_TYPE_COLORS.audio.bgDark.replace('bg-amber-500/10', 'bg-amber-900/20') + ' text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }
                  `}
                  aria-label={`Velocidad ${rate}x`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-3 pt-2 border-t border-white/10">
          <p className="text-xs text-white/50 text-center">
            Atajos: Espacio/K=Play ←→=Skip M=Mute ,.=Velocidad
          </p>
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
