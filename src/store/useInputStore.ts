import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InputStats, InputEvent, LanguageCode, LevelCode } from '@/types';

// ============================================================
// TYPES
// ============================================================

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
  addMinutesListened: (minutes: number, lang: LanguageCode, level: LevelCode) => void;
  addMinutesRead: (minutes: number, lang: LanguageCode, level: LevelCode) => void;
  addRecentContent: (contentId: string) => void;

  // Marcar contenido como visto/leído/escuchado
  markVideoAsWatched: (videoId: string, durationSeconds: number, lang: LanguageCode, level: LevelCode) => void;
  markAudioAsListened: (audioId: string, durationSeconds: number, wordsHeard: number, lang: LanguageCode, level: LevelCode) => void;
  markTextAsRead: (textId: string, wordsRead: number, lang: LanguageCode, level: LevelCode) => void;
}

// ============================================================
// CONSTANTS
// ============================================================

const defaultStats: InputStats = {
  wordsRead: 0,
  wordsHeard: 0,
  wordsSpoken: 0,
  minutesListened: 0,
  minutesRead: 0,
};

const WORDS_PER_MINUTE_READ = 200;
const MAX_RECENT_CONTENT = 10;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function createStatsKey(language: string, level: string): string {
  return `${language}-${level}`;
}

function createInputEvent(
  type: InputEvent['type'],
  contentId: string,
  durationSeconds: number,
  wordsCounted: number = 0
): InputEvent {
  return {
    id: `${type}-${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    type,
    contentId,
    wordsCounted,
    durationSeconds,
    understood: true,
  };
}

function updateStatsField(
  stats: Record<string, InputStats>,
  key: string,
  field: keyof InputStats,
  value: number
): Record<string, InputStats> {
  const current = stats[key] || { ...defaultStats };
  return {
    ...stats,
    [key]: {
      ...current,
      [field]: (current[field] as number) + value,
    },
  };
}

// ============================================================
// STORE
// ============================================================

export const useInputStore = create<InputStore>()(
  persist(
    (set, get) => ({
      stats: {},
      events: [],
      recentContentIds: [],

      incrementWords: (key, type, count) => {
        const fieldMap = { read: 'wordsRead', heard: 'wordsHeard', spoken: 'wordsSpoken' } as const;
        set((state) => ({
          stats: updateStatsField(state.stats, key, fieldMap[type], count),
        }));
      },

      incrementMinutes: (key, type, minutes) => {
        const fieldMap = { listened: 'minutesListened', read: 'minutesRead' } as const;
        set((state) => ({
          stats: updateStatsField(state.stats, key, fieldMap[type], minutes),
        }));
      },

      addEvent: (event) => {
        set((state) => ({ events: [...state.events, event] }));
      },

      getStats: (lang, level) => {
        const key = createStatsKey(lang, level);
        return get().stats[key] || { ...defaultStats };
      },

      resetStats: () => set({ stats: {}, events: [], recentContentIds: [] }),

      addWordsRead: (lang, level, count) => {
        get().incrementWords(createStatsKey(lang, level), 'read', count);
      },

      addWordsHeard: (lang, level, count) => {
        get().incrementWords(createStatsKey(lang, level), 'heard', count);
      },

      addWordsSpoken: (lang, level, count) => {
        get().incrementWords(createStatsKey(lang, level), 'spoken', count);
      },

      addMinutesListened: (minutes, lang, level) => {
        const key = createStatsKey(lang, level);
        get().incrementMinutes(key, 'listened', minutes);
        get().addEvent(createInputEvent('audio', '', minutes * 60));
      },

      addMinutesRead: (minutes, lang, level) => {
        const key = createStatsKey(lang, level);
        get().incrementMinutes(key, 'read', minutes);
        get().addEvent(createInputEvent('text', '', minutes * 60));
      },

      addRecentContent: (contentId) => {
        set((state) => ({
          recentContentIds: [contentId, ...state.recentContentIds.filter((id) => id !== contentId)].slice(
            0,
            MAX_RECENT_CONTENT
          ),
        }));
      },

      markVideoAsWatched: (videoId, durationSeconds, lang, level) => {
        const key = createStatsKey(lang, level);
        const minutes = durationSeconds / 60;
        get().incrementMinutes(key, 'listened', minutes);
        get().addEvent(createInputEvent('video', videoId, durationSeconds));
        get().addRecentContent(videoId);
      },

      markAudioAsListened: (audioId, durationSeconds, wordsHeard, lang, level) => {
        const key = createStatsKey(lang, level);
        const minutes = durationSeconds / 60;
        get().incrementMinutes(key, 'listened', minutes);
        get().incrementWords(key, 'heard', wordsHeard);
        get().addEvent(createInputEvent('audio', audioId, durationSeconds, wordsHeard));
        get().addRecentContent(audioId);
      },

      markTextAsRead: (textId, wordsRead, lang, level) => {
        const key = createStatsKey(lang, level);
        const minutes = wordsRead / WORDS_PER_MINUTE_READ;
        get().incrementWords(key, 'read', wordsRead);
        get().incrementMinutes(key, 'read', minutes);
        get().addEvent(createInputEvent('text', textId, minutes * 60, wordsRead));
        get().addRecentContent(textId);
      },
    }),
    {
      name: 'french-app-input',
    }
  )
);

export { createStatsKey };
