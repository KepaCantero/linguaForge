import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InputStats, InputEvent, LanguageCode, LevelCode } from '@/types';

interface InputStore {
  // Stats por idioma+nivel (key: "fr-A1")
  stats: Record<string, InputStats>;
  events: InputEvent[];
  recentContentIds: string[];

  // Acciones básicas
  incrementWords: (key: string, type: 'read' | 'heard' | 'spoken', count: number) => void;
  incrementMinutes: (key: string, type: 'listened' | 'read', minutes: number) => void;
  addEvent: (event: InputEvent) => void;
  getStats: (lang: LanguageCode, level: LevelCode) => InputStats;
  resetStats: () => void;

  // Acciones de conveniencia
  addWordsRead: (lang: LanguageCode, level: LevelCode, count: number) => void;
  addWordsHeard: (lang: LanguageCode, level: LevelCode, count: number) => void;
  addWordsSpoken: (lang: LanguageCode, level: LevelCode, count: number) => void;
  addRecentContent: (contentId: string) => void;
}

const defaultStats: InputStats = {
  wordsRead: 0,
  wordsHeard: 0,
  wordsSpoken: 0,
  minutesListened: 0,
  minutesRead: 0,
};

// Helper function to create stats key
function createStatsKey(language: string, level: string): string {
  return `${language}-${level}`;
}

export const useInputStore = create<InputStore>()(
  persist(
    (set, get) => ({
      stats: {},
      events: [],
      recentContentIds: [],

      incrementWords: (key, type, count) => {
        set((state) => {
          const current = state.stats[key] || { ...defaultStats };

          const fieldMap = {
            read: 'wordsRead',
            heard: 'wordsHeard',
            spoken: 'wordsSpoken',
          } as const;

          const field = fieldMap[type];

          return {
            stats: {
              ...state.stats,
              [key]: {
                ...current,
                [field]: current[field] + count,
              },
            },
          };
        });
      },

      incrementMinutes: (key, type, minutes) => {
        set((state) => {
          const current = state.stats[key] || { ...defaultStats };

          const fieldMap = {
            listened: 'minutesListened',
            read: 'minutesRead',
          } as const;

          const field = fieldMap[type];

          return {
            stats: {
              ...state.stats,
              [key]: {
                ...current,
                [field]: current[field] + minutes,
              },
            },
          };
        });
      },

      addEvent: (event) => {
        set((state) => ({
          events: [...state.events, event],
        }));
      },

      getStats: (lang, level) => {
        const key = createStatsKey(lang, level);
        return get().stats[key] || { ...defaultStats };
      },

      resetStats: () => set({ stats: {}, events: [], recentContentIds: [] }),

      // Convenience methods
      addWordsRead: (lang, level, count) => {
        const key = createStatsKey(lang, level);
        get().incrementWords(key, 'read', count);
      },

      addWordsHeard: (lang, level, count) => {
        const key = createStatsKey(lang, level);
        get().incrementWords(key, 'heard', count);
      },

      addWordsSpoken: (lang, level, count) => {
        const key = createStatsKey(lang, level);
        get().incrementWords(key, 'spoken', count);
      },

      addRecentContent: (contentId) => {
        set((state) => {
          // Keep only the last 10 content IDs
          const newRecent = [contentId, ...state.recentContentIds.filter(id => id !== contentId)].slice(0, 10);
          return { recentContentIds: newRecent };
        });
      },
    }),
    {
      name: 'french-app-input',
    }
  )
);

export { createStatsKey };
