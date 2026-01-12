import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WordInfo, WordDictionaryStore } from '@/types/wordDictionary';
import { normalizeWord } from '@/services/wordExtractor';

const initialState = {
  words: {} as Record<string, WordInfo>,
};

// Helper functions for store actions
function createNewWordInfo(word: string, normalized: string, type: string, cardId?: string): WordInfo {
  const now = new Date().toISOString();
  const validWordTypes = ['verb', 'noun', 'adverb', 'adjective', 'other'] as const;
  const validatedType = validWordTypes.includes(type as typeof validWordTypes[number])
    ? (type as WordInfo['type'])
    : 'other';

  return {
    word: normalized,
    wordOriginal: word,
    type: validatedType,
    firstSeen: now,
    lastSeen: now,
    timesSeen: 1,
    isStudied: !!cardId,
    isMastered: false,
    languageCode: 'fr',
    levelCode: 'A1',
  };
}

function updateExistingWordInfo(existing: WordInfo, cardId?: string): Partial<WordInfo> {
  return {
    lastSeen: new Date().toISOString(),
    timesSeen: existing.timesSeen + 1,
    cardId: cardId || existing.cardId,
    isStudied: cardId ? true : existing.isStudied,
  };
}

function addWordToStore(
  set: (partial: (state: WordDictionaryStore) => Partial<WordDictionaryStore>) => void,
  get: () => WordDictionaryStore,
  word: string,
  type: string,
  cardId?: string
): void {
  const normalized = normalizeWord(word);
  const existing = get().words[normalized];

  if (existing) {
    set((state) => ({
      words: {
        ...state.words,
        [normalized]: {
          ...existing,
          ...updateExistingWordInfo(existing, cardId),
        },
      },
    }));
  } else {
    set((state) => ({
      words: {
        ...state.words,
        [normalized]: createNewWordInfo(word, normalized, type, cardId),
      },
    }));
  }
}

function markWordAsStudied(
  set: (partial: (state: WordDictionaryStore) => Partial<WordDictionaryStore>) => void,
  get: () => WordDictionaryStore,
  word: string,
  cardId: string
): void {
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
}

function markWordAsMastered(
  set: (partial: (state: WordDictionaryStore) => Partial<WordDictionaryStore>) => void,
  get: () => WordDictionaryStore,
  word: string
): void {
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
}

function updateWordSeenCount(
  set: (partial: (state: WordDictionaryStore) => Partial<WordDictionaryStore>) => void,
  get: () => WordDictionaryStore,
  word: string
): void {
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
}

export const useWordDictionaryStore = create<WordDictionaryStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addWord: (word, type, cardId) => addWordToStore(set, get, word, type, cardId),

      markAsStudied: (word, cardId) => markWordAsStudied(set, get, word, cardId),

      markAsMastered: (word) => markWordAsMastered(set, get, word),

      updateWordSeen: (word) => updateWordSeenCount(set, get, word),

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
