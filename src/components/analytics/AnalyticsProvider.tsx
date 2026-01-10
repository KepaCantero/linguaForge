/**
 * AnalyticsProvider - Initialize analytics at app root
 *
 * Client component that initializes the analytics system
 */

'use client';

import { useEffect, useRef } from 'react';
import { useAnalyticsInit, usePageTracking } from '@/hooks/useAnalytics';
import { useThemeStore } from '@/store/useThemeStore';
import { trackEvent } from '@/lib/analytics';
import { AnalyticsEvent } from '@/types/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Initialize analytics on mount
  useAnalyticsInit(true);

  // Track page views automatically
  usePageTracking();

  // Track theme changes
  const mode = useThemeStore((state) => state.mode);
  const previousThemeRef = useRef(mode);

  useEffect(() => {
    if (previousThemeRef.current !== mode) {
      trackEvent(AnalyticsEvent.THEME_CHANGE, {
        theme: mode,
        timestamp: Date.now(),
        sessionId: '',
      });
      previousThemeRef.current = mode;
    }
  }, [mode]);

  return <>{children}</>;
}
