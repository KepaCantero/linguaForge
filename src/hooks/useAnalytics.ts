/**
 * React Hooks for Analytics
 *
 * Easy integration of analytics tracking into React components
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  initAnalytics,
  trackEvent,
  cleanupAnalytics,
  isAnalyticsEnabled,
  setAnalyticsEnabled,
} from '@/lib/analytics';
import { AnalyticsEvent } from '@/types/analytics';

// ============================================
// MAIN HOOK
// ============================================

/**
 * Initialize analytics in a component
 * Call this once in your root layout or app component
 */
export function useAnalyticsInit(enabled = true) {
  const initialized = useRef(false);

  useEffect(() => {
    if (enabled && !initialized.current) {
      initAnalytics({ enabled });
      initialized.current = true;
    }

    return () => {
      if (initialized.current) {
        cleanupAnalytics();
      }
    };
  }, [enabled]);
}

// ============================================
// TRACKING HOOKS
// ============================================

/**
 * Hook for tracking page views
 * Automatically tracks when pathname changes
 */
export function usePageTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (isAnalyticsEnabled()) {
      trackEvent(AnalyticsEvent.PAGE_VIEW, {
        pathname,
        timestamp: Date.now(),
        sessionId: '', // Will be filled by trackEvent
      });
    }
  }, [pathname]);
}

/**
 * Hook for tracking lesson events
 */
export function useLessonTracking() {
  const startRef = useRef<number>(0);

  const startLesson = (nodeId: string, lessonId: string, lessonType: string) => {
    startRef.current = Date.now();
    trackEvent(AnalyticsEvent.LESSON_START, {
      nodeId,
      lessonId,
      lessonType,
      timestamp: Date.now(),
      sessionId: '', // Will be filled by trackEvent
    });
  };

  const completeLesson = (nodeId: string, lessonId: string, lessonType: string) => {
    const duration = (Date.now() - startRef.current) / 1000;
    trackEvent(AnalyticsEvent.LESSON_COMPLETE, {
      nodeId,
      lessonId,
      lessonType,
      duration,
      timestamp: Date.now(),
      sessionId: '',
    });
    startRef.current = 0;
  };

  return { startLesson, completeLesson };
}

/**
 * Hook for tracking exercise events
 */
export function useExerciseTracking() {
  const startRef = useRef<number>(0);
  const attemptsRef = useRef<number>(0);

  const startExercise = (exerciseType: string) => {
    startRef.current = Date.now();
    attemptsRef.current = 0;
    trackEvent(AnalyticsEvent.EXERCISE_START, {
      exerciseType,
      timestamp: Date.now(),
      sessionId: '',
    });
  };

  const completeExercise = (
    exerciseType: string,
    isCorrect: boolean,
    usedHint?: boolean
  ) => {
    const timeToComplete = Date.now() - startRef.current;
    const attempts = attemptsRef.current + 1;

    trackEvent(AnalyticsEvent.EXERCISE_COMPLETE, {
      exerciseType,
      isCorrect,
      attempts,
      timeToComplete,
      usedHint,
      timestamp: Date.now(),
      sessionId: '',
    });

    startRef.current = 0;
    attemptsRef.current = 0;
  };

  const recordAttempt = () => {
    attemptsRef.current += 1;
  };

  const useHint = (exerciseType: string) => {
    trackEvent(AnalyticsEvent.EXERCISE_HINT, {
      exerciseType,
      timestamp: Date.now(),
      sessionId: '',
    });
  };

  const skipExercise = (exerciseType: string) => {
    trackEvent(AnalyticsEvent.EXERCISE_SKIP, {
      exerciseType,
      timestamp: Date.now(),
      sessionId: '',
    });
    startRef.current = 0;
    attemptsRef.current = 0;
  };

  return { startExercise, completeExercise, recordAttempt, useHint, skipExercise };
}

/**
 * Hook for tracking review sessions
 */
export function useReviewTracking() {
  const startRef = useRef<number>(0);
  const correctRef = useRef<number>(0);
  const difficultRef = useRef<number>(0);

  const startReview = () => {
    startRef.current = Date.now();
    correctRef.current = 0;
    difficultRef.current = 0;
    trackEvent(AnalyticsEvent.REVIEW_START, {
      timestamp: Date.now(),
      sessionId: '',
    });
  };

  const recordCard = (rating: number) => {
    // Rating: 1=Again, 2=Hard, 3=Good, 4=Easy
    trackEvent(AnalyticsEvent.REVIEW_CARD, {
      rating,
      timestamp: Date.now(),
      sessionId: '',
    });

    if (rating >= 3) {
      correctRef.current += 1;
    }
    if (rating === 2) {
      difficultRef.current += 1;
    }
  };

  const completeReview = (cardCount: number) => {
    const duration = (Date.now() - startRef.current) / 1000;

    trackEvent(AnalyticsEvent.REVIEW_COMPLETE, {
      cardCount,
      correctCount: correctRef.current,
      difficultCount: difficultRef.current,
      duration,
      timestamp: Date.now(),
      sessionId: '',
    });

    startRef.current = 0;
  };

  return { startReview, recordCard, completeReview };
}

/**
 * Hook for tracking progression events
 */
export function useProgressTracking() {
  const trackLevelUp = (level: number, xpGained: number) => {
    trackEvent(AnalyticsEvent.LEVEL_UP, {
      level,
      xpGained,
      timestamp: Date.now(),
      sessionId: '',
    });
  };

  const trackStreakMilestone = (streak: number) => {
    trackEvent(AnalyticsEvent.STREAK_MILESTONE, {
      streak,
      timestamp: Date.now(),
      sessionId: '',
    });
  };

  const trackAchievementUnlock = (achievementId: string) => {
    trackEvent(AnalyticsEvent.ACHIEVEMENT_UNLOCK, {
      achievementId,
      timestamp: Date.now(),
      sessionId: '',
    });
  };

  return { trackLevelUp, trackStreakMilestone, trackAchievementUnlock };
}

/**
 * Hook for tracking engagement events
 */
export function useEngagementTracking() {
  const trackNodeUnlock = (nodeId: string) => {
    trackEvent(AnalyticsEvent.NODE_UNLOCK, {
      nodeId,
      timestamp: Date.now(),
      sessionId: '',
    });
  };

  const trackThemeChange = (theme: string) => {
    trackEvent(AnalyticsEvent.THEME_CHANGE, {
      theme,
      timestamp: Date.now(),
      sessionId: '',
    });
  };

  const trackSoundToggle = (enabled: boolean) => {
    trackEvent(AnalyticsEvent.SOUND_TOGGLE, {
      enabled,
      timestamp: Date.now(),
      sessionId: '',
    });
  };

  return { trackNodeUnlock, trackThemeChange, trackSoundToggle };
}

/**
 * Hook for tracking import events
 */
export function useImportTracking() {
  const startImport = () => {
    trackEvent(AnalyticsEvent.IMPORT_START, {
      timestamp: Date.now(),
      sessionId: '',
    });
  };

  const completeImport = () => {
    trackEvent(AnalyticsEvent.IMPORT_COMPLETE, {
      timestamp: Date.now(),
      sessionId: '',
    });
  };

  const trackError = (errorType: string, errorMessage: string, context?: string) => {
    trackEvent(AnalyticsEvent.IMPORT_ERROR, {
      errorType,
      errorMessage,
      context,
      timestamp: Date.now(),
      sessionId: '',
    });
  };

  return { startImport, completeImport, trackError };
}

/**
 * Hook for analytics settings
 */
export function useAnalyticsSettings() {
  const toggleAnalytics = (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
  };

  return {
    isEnabled: isAnalyticsEnabled(),
    toggleAnalytics,
  };
}
