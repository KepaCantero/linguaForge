import { useMemo } from 'react';
import { useInputStore } from '@/store/useInputStore';
import { useProgressStore } from '@/store/useProgressStore';

export interface InputHubStats {
  videoViews: number;
  videoHours: string;
  audioCount: number;
  audioHours: string;
  textCount: number;
  wordsRead: number;
}

export function useInputHubStats(): InputHubStats {
  const { activeLanguage, activeLevel } = useProgressStore();
  const inputStore = useInputStore();

  const statsKey = `${activeLanguage}-${activeLevel}`;
  const statsData = inputStore.stats[statsKey];

  const stats = useMemo(() => {
    if (!statsData) {
      return {
        wordsRead: 0,
        wordsHeard: 0,
        wordsSpoken: 0,
        minutesListened: 0,
        minutesRead: 0,
      };
    }
    return statsData;
  }, [statsData]);

  const videoHours = useMemo(() => {
    const videoEvents = inputStore.events.filter((e) => e.type === 'video');
    const totalSeconds = videoEvents.reduce((acc, e) => acc + (e.durationSeconds || 0), 0);
    return (totalSeconds / 3600).toFixed(2);
  }, [inputStore.events]);

  const audioHours = useMemo(() => {
    return (stats.minutesListened / 60).toFixed(2);
  }, [stats.minutesListened]);

  const wordsRead = useMemo(() => {
    return stats.wordsRead;
  }, [stats.wordsRead]);

  const videoViews = useMemo(() => {
    return inputStore.events.filter((e) => e.type === 'video').length;
  }, [inputStore.events]);

  const audioCount = useMemo(() => {
    return inputStore.events.filter((e) => e.type === 'audio').length;
  }, [inputStore.events]);

  const textCount = useMemo(() => {
    return inputStore.events.filter((e) => e.type === 'text').length;
  }, [inputStore.events]);

  return {
    videoViews,
    videoHours,
    audioCount,
    audioHours,
    textCount,
    wordsRead,
  };
}
