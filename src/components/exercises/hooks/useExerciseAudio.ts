'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTTS } from '@/services/ttsService';

// ============================================
// TYPES
// ============================================

export interface AudioPlaybackOptions {
  autoPlay?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface AudioPlaybackReturn {
  isPlaying: boolean;
  isAvailable: boolean;
  play: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

export interface SilenceDetectionOptions {
  silenceTimeout: number; // Seconds
  onSilenceTimeout: () => void;
  onActivity?: () => void;
}

// ============================================
// HOOKS
// ============================================

/**
 * Shared hook for managing audio playback (TTS) in exercises.
 * Provides consistent audio playback interface across all exercise types.
 *
 * @example
 * ```ts
 * const { isPlaying, play, stop } = useExerciseAudio({
 *   onPlayStart: () => console.log('Started playing'),
 *   onPlayEnd: () => console.log('Finished playing'),
 * });
 *
 * // Play audio
 * play('Bonjour, comment allez-vous?');
 * ```
 */
export function useExerciseAudio(options: AudioPlaybackOptions = {}): AudioPlaybackReturn {
  const { autoPlay = false, onPlayStart, onPlayEnd, onError } = options;
  const { speak, isSpeaking, isAvailable } = useTTS();

  const [isPlaying, setIsPlaying] = useState(false);

  // Play text using TTS
  const play = useCallback((text: string) => {
    if (!isAvailable) {
      onError?.(new Error('TTS not available'));
      return;
    }

    setIsPlaying(true);
    onPlayStart?.();

    speak(text);

    // Wait for speech to complete (polling approach)
    const checkSpeaking = setInterval(() => {
      if (!isSpeaking) {
        clearInterval(checkSpeaking);
        setIsPlaying(false);
        onPlayEnd?.();
      }
    }, 200);

    // Fallback timeout (5 seconds max)
    const fallbackTimeout = setTimeout(() => {
      clearInterval(checkSpeaking);
      setIsPlaying(false);
      onPlayEnd?.();
    }, 5000);

    // Cleanup both timers
    return () => {
      clearInterval(checkSpeaking);
      clearTimeout(fallbackTimeout);
    };
  }, [isAvailable, isSpeaking, speak, onPlayStart, onPlayEnd, onError]);

  // Stop playback
  const stop = useCallback(() => {
    setIsPlaying(false);
    // Note: TTS service doesn't have a stop method, so we just update state
    onPlayEnd?.();
  }, [onPlayEnd]);

  // Pause (not supported by basic TTS, but included for interface consistency)
  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Resume playback
  const resume = useCallback(() => {
    setIsPlaying(true);
  }, []);

  return {
    isPlaying: isPlaying || isSpeaking,
    isAvailable,
    play,
    stop,
    pause,
    resume,
  };
}

/**
 * Hook for managing silence detection in conversation exercises.
 * Automatically triggers callback after period of user inactivity.
 *
 * @example
 * ```ts
 * const { start, stop, reset, timeUntilTimeout } = useSilenceDetection({
 *   silenceTimeout: 3,
 *   onSilenceTimeout: () => console.log('User inactive for 3 seconds'),
 * });
 * ```
 */
export function useSilenceDetection(options: SilenceDetectionOptions) {
  const { silenceTimeout, onSilenceTimeout, onActivity } = options;

  const [timeUntilTimeout, setTimeUntilTimeout] = useState(silenceTimeout);
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Start silence detection
  const start = useCallback(() => {
    setIsActive(true);
    setTimeUntilTimeout(silenceTimeout);

    timeoutRef.current = setInterval(() => {
      setTimeUntilTimeout(prev => {
        if (prev <= 0.1) {
          onSilenceTimeout();
          stop();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  }, [silenceTimeout, onSilenceTimeout]);

  // Stop silence detection
  const stop = useCallback(() => {
    setIsActive(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Reset timer (called when user activity is detected)
  const reset = useCallback(() => {
    stop();
    start();
    onActivity?.();
  }, [stop, start, onActivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    timeUntilTimeout,
    isActive,
    start,
    stop,
    reset,
  };
}

/**
 * Hook for managing audio element playback (for recorded audio files).
 * Unlike useExerciseAudio which uses TTS, this plays actual audio files.
 *
 * @example
 * ```ts
 * const { progress, isPlaying, play, pause } = useAudioElement('/audio/phrase.mp3');
 *
 * // Play audio
 * play();
 *
 * // Get progress percentage
 * console.log(`${progress.toFixed(0)}% played`);
 * ```
 */
export function useAudioElement(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio(src);
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audio.src = '';
    };
  }, [src]);

  // Play audio
  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('Failed to play audio:', error);
      });
    }
  }, []);

  // Pause audio
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Stop audio
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, []);

  // Set playback position
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  return {
    isPlaying,
    progress,
    currentTime,
    duration,
    play,
    pause,
    stop,
    seek,
  };
}

/**
 * Hook for managing playback state for multiple audio elements.
 * Useful for exercises with multiple phrases/dialogue turns.
 *
 * @example
 * ```ts
 * const audioUrls = ['/audio/1.mp3', '/audio/2.mp3', '/audio/3.mp3'];
 * const { currentIndex, playAll, playNext, isPlaying } = useAudioSequence(audioUrls);
 * ```
 */
export function useAudioSequence(audioUrls: string[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentUrl = audioUrls[currentIndex];
  const audio = useAudioElement(currentUrl);

  // Play all audio files in sequence
  const playAll = useCallback(async () => {
    setIsPlaying(true);
    setCurrentIndex(0);

    for (let i = 0; i < audioUrls.length; i++) {
      setCurrentIndex(i);
      // Play current audio
      // Note: This is a simplified implementation
      // In practice, you'd need to wait for each audio to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsPlaying(false);
  }, [audioUrls]);

  // Play next audio in sequence
  const playNext = useCallback(() => {
    if (currentIndex < audioUrls.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, audioUrls.length]);

  // Play previous audio in sequence
  const playPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  return {
    currentIndex,
    currentUrl,
    playAll,
    playNext,
    playPrevious,
    ...audio,
  };
}
