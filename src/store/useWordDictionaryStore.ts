import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WordInfo, WordDictionaryStore } from '@/types/wordDictionary';
import { normalizeWord } from '@/services/wordExtractor';

const initialState = {
  words: {} as Record<string, WordInfo>,
};

export const useWordDictionaryStore = create<WordDictionaryStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addWord: (word, type, cardId) => {
        const normalized = normalizeWord(word);
        const now = new Date().toISOString();
        
        const existing = get().words[normalized];
        
        if (existing) {
          // Actualizar palabra existente
          set((state) => ({
            words: {
              ...state.words,
              [normalized]: {
                ...existing,
                lastSeen: now,
                timesSeen: existing.timesSeen + 1,
                cardId: cardId || existing.cardId,
                isStudied: cardId ? true : existing.isStudied,
              },
            },
          }));
        } else {
          // Nueva palabra
          set((state) => ({
            words: {
              ...state.words,
              [normalized]: {
                word: normalized,
                wordOriginal: word,
                type,
                cardId,
                firstSeen: now,
                lastSeen: now,
                timesSeen: 1,
                isStudied: !!cardId,
                isMastered: false,
                languageCode: 'fr',
                levelCode: 'A1',
              },
            },
          }));
        }
      },

      markAsStudied: (word, cardId) => {
        const normalized = normalizeWord(word);
        const existing = get().words[normalized];
        
        if (existing) {
          set((state) => ({
            words: {
              ...state.words,
              [normalized]: {
                ...existing,
                isStudied: true,
                cardId,
              },
            },
          }));
        }
      },

      markAsMastered: (word) => {
        const normalized = normalizeWord(word);
        const existing = get().words[normalized];
        
        if (existing) {
          set((state) => ({
            words: {
              ...state.words,
              [normalized]: {
                ...existing,
                isMastered: true,
              },
            },
          }));
        }
      },

      updateWordSeen: (word) => {
        const normalized = normalizeWord(word);
        const existing = get().words[normalized];
        
        if (existing) {
          set((state) => ({
            words: {
              ...state.words,
              [normalized]: {
                ...existing,
                lastSeen: new Date().toISOString(),
                timesSeen: existing.timesSeen + 1,
              },
            },
          }));
        }
      },

      isWordStudied: (word) => {
        const normalized = normalizeWord(word);
        const wordInfo = get().words[normalized];
        return wordInfo?.isStudied || false;
      },

      isWordMastered: (word) => {
        const normalized = normalizeWord(word);
        const wordInfo = get().words[normalized];
        return wordInfo?.isMastered || false;
      },

      getWordInfo: (word) => {
        const normalized = normalizeWord(word);
        return get().words[normalized];
      },

      getStudiedWords: () => {
        return Object.values(get().words).filter(w => w.isStudied);
      },

      getNewWords: (words) => {
        const state = get();
        return words.filter(word => {
          const normalized = normalizeWord(word);
          const wordInfo = state.words[normalized];
          return !wordInfo || !wordInfo.isStudied;
        });
      },

      resetDictionary: () => {
        set(initialState);
      },
    }),
    {
      name: 'word-dictionary-storage',
    }
  )
);

