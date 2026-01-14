'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================
// TYPES
// ============================================

export interface ExerciseTimerOptions {
  duration?: number; // Duration in seconds (for countdown)
  interval?: number; // Update interval in ms
  autoStart?: boolean;
  onComplete?: () => void;
  onTick?: (timeRemaining: number) => void;
}

export interface ExerciseTimerReturn {
  timeRemaining: number;
  timeElapsed: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  progress: number; // 0-100
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

// ============================================
// HOOK
// ============================================

/**
 * Shared hook for managing exercise timers (countdown, stopwatch, or both).
 * Supports countdown timers, elapsed time tracking, pause/resume, and completion callbacks.
 *
 * @example
 * ```ts
 * // Countdown timer
 * const { timeRemaining, start, pause } = useExerciseTimer({
 *   duration: 30,
 *   autoStart: true,
 *   onComplete: () => console.log('Time is up!'),
 * });
 *
 * // Stopwatch (elapsed time only)
 * const { timeElapsed, isRunning } = useExerciseTimer({
 *   autoStart: true,
 * });
 * ```
 */
export function useExerciseTimer(
  options: ExerciseTimerOptions = {}
): ExerciseTimerReturn {
  const {
    duration = 0,
    interval = 100,
    autoStart = false,
    onComplete,
    onTick,
  } = options;

  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);

  // Calculate progress percentage (for countdown timers)
  const progress = useCallback(() => {
    if (duration === 0) return 0;
    return (timeRemaining / duration) * 100;
  }, [duration, timeRemaining]);

  // Start the timer
  const start = useCallback(() => {
    if (isRunning || isComplete) return;

    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
  }, [isRunning, isComplete]);

  // Pause the timer
  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;

    setIsPaused(true);
    setIsRunning(false);
    pausedTimeRef.current += Date.now() - startTimeRef.current;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isRunning, isPaused]);

  // Resume the timer
  const resume = useCallback(() => {
    if (!isPaused || isRunning) return;

    setIsPaused(false);
    setIsRunning(true);
    startTimeRef.current = Date.now();
  }, [isPaused, isRunning]);

  // Stop the timer completely
  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset the timer
  const reset = useCallback(() => {
    stop();
    setTimeRemaining(duration);
    setTimeElapsed(0);
    setIsComplete(false);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
  }, [duration, stop]);

  // Timer tick logic
  useEffect(() => {
    if (!isRunning || isComplete) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;

      setTimeElapsed(elapsed / 1000);

      // Countdown timer logic
      if (duration > 0) {
        const newTimeRemaining = Math.max(0, duration - elapsed / 1000);
        setTimeRemaining(newTimeRemaining);

        onTick?.(newTimeRemaining);

        if (newTimeRemaining <= 0) {
          setIsComplete(true);
          setIsRunning(false);
          onComplete?.();
          stop();
        }
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isComplete, duration, interval, onTick, onComplete, stop]);

  // Auto-start on mount
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  return {
    timeRemaining,
    timeElapsed,
    isRunning,
    isPaused,
    isComplete,
    progress: progress(),
    start,
    pause,
    resume,
    stop,
    reset,
  };
}

// ============================================
// SPECIALIZED TIMER HOOKS
// ============================================

/**
 * Hook specifically for countdown timers (e.g., challenge mode timers).
 */
export function useCountdownTimer(
  duration: number,
  onComplete?: () => void
): Omit<ExerciseTimerReturn, 'timeElapsed' | 'resume'> & {
  urgency: 'low' | 'medium' | 'critical';
  timeString: string;
} {
  const timer = useExerciseTimer({
    duration,
    onComplete,
  });

  const urgency = useMemo(() => {
    const ratio = timer.timeRemaining / duration;
    if (ratio > 0.5) return 'low';
    if (ratio > 0.2) return 'medium';
    return 'critical';
  }, [timer.timeRemaining, duration]);

  const timeString = useMemo(() => {
    return Math.ceil(timer.timeRemaining).toFixed(1);
  }, [timer.timeRemaining]);

  return {
    ...timer,
    urgency,
    timeString,
  };
}

import { useMemo } from 'react';

/**
 * Hook for tracking elapsed time (stopwatch mode).
 */
export function useStopwatch(autoStart = false) {
  const timer = useExerciseTimer({
    autoStart,
  });

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timer.timeElapsed / 60);
    const seconds = Math.floor(timer.timeElapsed % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timer.timeElapsed]);

  return {
    ...timer,
    formattedTime,
  };
}

/**
 * Hook for silence detection timers (auto-advance after period of inactivity).
 */
export interface SilenceTimerOptions {
  timeout: number; // Seconds of silence before triggering
  onTimeout: () => void;
  onActivity?: () => void; // Called when user activity is detected
}

export function useSilenceTimer({
  timeout,
  onTimeout,
  onActivity,
}: SilenceTimerOptions) {
  const [timeUntilTimeout, setTimeUntilTimeout] = useState(timeout);
  const isActive = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    isActive.current = true;
    setTimeUntilTimeout(timeout);

    timeoutRef.current = setInterval(() => {
      setTimeUntilTimeout(prev => {
        if (prev <= 0.1) {
          onTimeout();
          stop();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  }, [timeout, onTimeout]);

  const stop = useCallback(() => {
    isActive.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

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
    isActive: isActive.current,
    start,
    stop,
    reset,
  };
}
