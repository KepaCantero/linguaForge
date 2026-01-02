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
  addMinutesListened: (minutes: number, lang: LanguageCode, level: LevelCode) => void;
  addMinutesRead: (minutes: number, lang: LanguageCode, level: LevelCode) => void;
  addRecentContent: (contentId: string) => void;
  
  // Marcar contenido como visto/leído/escuchado
  markVideoAsWatched: (videoId: string, durationSeconds: number, lang: LanguageCode, level: LevelCode) => void;
  markAudioAsListened: (audioId: string, durationSeconds: number, wordsHeard: number, lang: LanguageCode, level: LevelCode) => void;
  markTextAsRead: (textId: string, wordsRead: number, lang: LanguageCode, level: LevelCode) => void;
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

      addMinutesListened: (minutes, lang, level) => {
        const key = createStatsKey(lang, level);
        get().incrementMinutes(key, 'listened', minutes);
        
        // Agregar evento para tracking diario
        const event: InputEvent = {
          id: `event-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          type: 'audio',
          contentId: '',
          wordsCounted: 0,
          durationSeconds: minutes * 60,
          understood: true,
        };
        get().addEvent(event);
      },

      addMinutesRead: (minutes, lang, level) => {
        const key = createStatsKey(lang, level);
        get().incrementMinutes(key, 'read', minutes);
        
        // Agregar evento para tracking diario
        const event: InputEvent = {
          id: `event-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          type: 'text',
          contentId: '',
          wordsCounted: 0,
          durationSeconds: minutes * 60,
          understood: true,
        };
        get().addEvent(event);
      },

      addRecentContent: (contentId) => {
        set((state) => {
          // Keep only the last 10 content IDs
          const newRecent = [contentId, ...state.recentContentIds.filter(id => id !== contentId)].slice(0, 10);
          return { recentContentIds: newRecent };
        });
      },

      markVideoAsWatched: (videoId, durationSeconds, lang, level) => {
        const key = createStatsKey(lang, level);
        const minutes = durationSeconds / 60;
        
        // Incrementar minutos (aunque no hay campo específico para video, usamos minutesListened)
        get().incrementMinutes(key, 'listened', minutes);
        
        // Agregar evento
        const event: InputEvent = {
          id: `video-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          type: 'video',
          contentId: videoId,
          wordsCounted: 0,
          durationSeconds,
          understood: true,
        };
        get().addEvent(event);
        get().addRecentContent(videoId);
      },

      markAudioAsListened: (audioId, durationSeconds, wordsHeard, lang, level) => {
        const key = createStatsKey(lang, level);
        const minutes = durationSeconds / 60;
        
        // Incrementar minutos y palabras escuchadas
        get().incrementMinutes(key, 'listened', minutes);
        get().incrementWords(key, 'heard', wordsHeard);
        
        // Agregar evento
        const event: InputEvent = {
          id: `audio-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          type: 'audio',
          contentId: audioId,
          wordsCounted: wordsHeard,
          durationSeconds,
          understood: true,
        };
        get().addEvent(event);
        get().addRecentContent(audioId);
      },

      markTextAsRead: (textId, wordsRead, lang, level) => {
        const key = createStatsKey(lang, level);
        // Estimar minutos basado en palabras (promedio 200 palabras/minuto)
        const minutes = wordsRead / 200;
        
        // Incrementar palabras leídas y minutos
        get().incrementWords(key, 'read', wordsRead);
        get().incrementMinutes(key, 'read', minutes);
        
        // Agregar evento
        const event: InputEvent = {
          id: `text-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          type: 'text',
          contentId: textId,
          wordsCounted: wordsRead,
          durationSeconds: minutes * 60,
          understood: true,
        };
        get().addEvent(event);
        get().addRecentContent(textId);
      },
    }),
    {
      name: 'french-app-input',
    }
  )
);

export { createStatsKey };
