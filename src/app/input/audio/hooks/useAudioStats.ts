import { useMemo } from "react";
import { useInputStore } from "@/store/useInputStore";
import { useProgressStore } from "@/store/useProgressStore";

export interface AudioStats {
  audioCount: number;
  totalHours: string;
  minutesListened: number;
  wordsHeard: number;
}

export function useAudioStats(): AudioStats {
  const inputStore = useInputStore();
  const { activeLanguage, activeLevel } = useProgressStore();

  const statsKey = `${activeLanguage}-${activeLevel}`;
  const statsData = inputStore.stats[statsKey];

  return useMemo(() => {
    const audioEvents = inputStore.events.filter(
      (e) => e.type === "audio" && (e.durationSeconds || 0) > 0
    );
    const uniqueAudioIds = new Set(
      audioEvents.map((e) => e.contentId).filter(Boolean)
    );
    const audioCount = uniqueAudioIds.size;
    const minutesListened = statsData?.minutesListened || 0;
    const totalHours = (minutesListened / 60).toFixed(2);
    const wordsHeard = statsData?.wordsHeard || 0;

    return {
      audioCount,
      totalHours,
      minutesListened,
      wordsHeard,
    };
  }, [inputStore.events, statsData]);
}
