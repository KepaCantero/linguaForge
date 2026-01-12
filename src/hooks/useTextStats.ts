import { useMemo } from 'react';
import { useInputStore } from '@/store/useInputStore';
import { useProgressStore } from '@/store/useProgressStore';

export interface TextStats {
  textCount: number;
  wordsRead: number;
  minutesRead: number;
  hoursRead: string;
}

/**
 * Hook to calculate and retrieve text statistics
 * Reduces complexity in text input components by isolating stats logic
 *
 * @returns TextStats object with calculated statistics
 */
export function useTextStats(): TextStats {
  const inputStore = useInputStore();
  const { activeLanguage, activeLevel } = useProgressStore();

  const statsKey = `${activeLanguage}-${activeLevel}`;
  const statsData = inputStore.stats[statsKey];

  const textStats = useMemo((): TextStats => {
    // Filter text events with counted words
    const textEvents = inputStore.events.filter(
      (e) => e.type === 'text' && e.wordsCounted > 0
    );

    // Count unique text IDs
    const uniqueTextIds = new Set(
      textEvents.map((e) => e.contentId).filter(Boolean)
    );
    const textCount = uniqueTextIds.size;

    // Get reading statistics from store
    const wordsRead = statsData?.wordsRead || 0;
    const minutesRead = statsData?.minutesRead || 0;

    return {
      textCount,
      wordsRead,
      minutesRead,
      hoursRead: (minutesRead / 60).toFixed(2),
    };
  }, [inputStore.events, statsData]);

  return textStats;
}
