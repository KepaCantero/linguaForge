import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SRSCard,
  SRSStats,
  ReviewResponse,
  CreateSRSCardInput,
  ContentSource,
  SRS_CONFIG,
} from '@/types/srs';
import {
  applyReview,
  getCardsForReview,
  getNewCards,
  getStudySession,
  calculateRetentionRate,
  calculateAverageEaseFactor,
  createCard,
  isDueForReview,
} from '@/lib/srsAdapter';

// ============================================================
// TYPES
// ============================================================

interface SRSStore {
  cards: SRSCard[];
  reviewedToday: string[];
  lastReviewDate: string | null;

  addCard: (input: CreateSRSCardInput) => SRSCard;
  addCards: (inputs: CreateSRSCardInput[]) => SRSCard[];
  removeCard: (cardId: string) => void;
  updateCard: (cardId: string, updates: Partial<SRSCard>) => void;

  reviewCard: (cardId: string, response: ReviewResponse, timeSpentMs?: number) => SRSCard | null;

  getCard: (cardId: string) => SRSCard | undefined;
  getDueCards: (limit?: number) => SRSCard[];
  getNewCardsToStudy: (limit?: number) => SRSCard[];
  getStudySession: () => SRSCard[];
  getStats: () => SRSStats;
  getCardsBySource: (sourceType: ContentSource['type'], sourceId?: string) => SRSCard[];
  getCardsByTag: (tag: string) => SRSCard[];

  isPhraseSaved: (phrase: string) => boolean;
  getCardByPhrase: (phrase: string) => SRSCard | undefined;
  getTodayReviewCount: () => number;
  resetDailyStats: () => void;

  resetSRS: () => void;
}

// ============================================================
// CONSTANTS
// ============================================================

const initialState = {
  cards: [] as SRSCard[],
  reviewedToday: [] as string[],
  lastReviewDate: null as string | null,
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function isSameDay(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr === getTodayDateString();
}

function normalizePhrase(phrase: string): string {
  return phrase.toLowerCase().trim();
}

function buildCardOptions(input: CreateSRSCardInput) {
  return {
    ...(input.audioUrl !== undefined && { audioUrl: input.audioUrl }),
    languageCode: input.languageCode,
    levelCode: input.levelCode,
    ...(input.tags !== undefined && { tags: input.tags }),
    ...(input.notes !== undefined && { notes: input.notes }),
  };
}

function createSRSCard(input: CreateSRSCardInput): SRSCard {
  return createCard(input.phrase, input.translation, input.source, buildCardOptions(input));
}

function updateCardList(cards: SRSCard[], cardId: string, updates: Partial<SRSCard>): SRSCard[] {
  return cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c));
}

function getTodayReviews(reviewedToday: string[], lastReviewDate: string | null): string[] {
  return isSameDay(lastReviewDate) ? reviewedToday : [];
}

function countCardsByStatus(cards: SRSCard[]): {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  graduatedCards: number;
} {
  return {
    totalCards: cards.length,
    newCards: cards.filter((c) => c.status === 'new').length,
    learningCards: cards.filter((c) => c.status === 'learning').length,
    reviewCards: cards.filter((c) => c.status === 'review').length,
    graduatedCards: cards.filter((c) => c.status === 'graduated').length,
  };
}

function countTodayResults(cards: SRSCard[], todayReviewIds: string[]): { correct: number; incorrect: number } {
  const today = getTodayDateString();
  let correct = 0;
  let incorrect = 0;

  for (const cardId of todayReviewIds) {
    const card = cards.find((c) => c.id === cardId);
    if (card && card.reviewHistory.length > 0) {
      const lastReview = card.reviewHistory[card.reviewHistory.length - 1];
      if (lastReview.date.split('T')[0] === today) {
        if (lastReview.response === 'again') {
          incorrect++;
        } else {
          correct++;
        }
      }
    }
  }

  return { correct, incorrect };
}

function calculateStreakDays(cards: SRSCard[], lastReviewDate: string | null): number {
  if (!lastReviewDate) return 0;

  const today = new Date();
  const lastDate = new Date(lastReviewDate);
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return 0;

  const reviewDates = new Set<string>();
  for (const card of cards) {
    for (const review of card.reviewHistory) {
      reviewDates.add(review.date.split('T')[0]);
    }
  }

  const sortedDates = Array.from(reviewDates).sort((a, b) => a.localeCompare(b)).reverse();
  let streakDays = 0;
  let expectedDate = getTodayDateString();

  for (const date of sortedDates) {
    if (date === expectedDate) {
      streakDays++;
      const d = new Date(expectedDate);
      d.setDate(d.getDate() - 1);
      expectedDate = d.toISOString().split('T')[0];
    } else if (date < expectedDate) {
      break;
    }
  }

  return streakDays;
}

function calculateSRSStats(cards: SRSCard[], reviewedToday: string[], lastReviewDate: string | null): SRSStats {
  const todayReviews = getTodayReviews(reviewedToday, lastReviewDate);
  const statusCounts = countCardsByStatus(cards);
  const { correct: correctToday, incorrect: incorrectToday } = countTodayResults(cards, todayReviews);
  const totalReviews = cards.reduce((sum, c) => sum + c.reviewHistory.length, 0);
  const streakDays = calculateStreakDays(cards, lastReviewDate);

  return {
    ...statusCounts,
    reviewedToday: todayReviews.length,
    correctToday,
    incorrectToday,
    averageEaseFactor: calculateAverageEaseFactor(cards),
    retentionRate: calculateRetentionRate(cards),
    totalReviews,
    streakDays,
    lastReviewDate,
  };
}

function updateReviewedToday(reviewedToday: string[], lastReviewDate: string | null, cardId: string): string[] {
  const baseReviewedToday = isSameDay(lastReviewDate) ? reviewedToday : [];
  return baseReviewedToday.includes(cardId) ? baseReviewedToday : [...baseReviewedToday, cardId];
}

// ============================================================
// STORE
// ============================================================

export const useSRSStore = create<SRSStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addCard: (input) => {
        const newCard = createSRSCard(input);
        set((state) => ({ cards: [...state.cards, newCard] }));
        return newCard;
      },

      addCards: (inputs) => {
        const newCards = inputs.map(createSRSCard);
        set((state) => ({ cards: [...state.cards, ...newCards] }));
        return newCards;
      },

      removeCard: (cardId) => {
        set((state) => ({ cards: state.cards.filter((c) => c.id !== cardId) }));
      },

      updateCard: (cardId, updates) => {
        set((state) => ({ cards: updateCardList(state.cards, cardId, updates) }));
      },

      reviewCard: (cardId, response, timeSpentMs = 0) => {
        const state = get();
        const card = state.cards.find((c) => c.id === cardId);
        if (!card) return null;

        const updatedCard = applyReview(card, response, timeSpentMs);
        const newReviewedToday = updateReviewedToday(state.reviewedToday, state.lastReviewDate, cardId);

        set({
          cards: updateCardList(state.cards, cardId, updatedCard),
          reviewedToday: newReviewedToday,
          lastReviewDate: getTodayDateString(),
        });

        return updatedCard;
      },

      getCard: (cardId) => {
        return get().cards.find((c) => c.id === cardId);
      },

      getDueCards: (limit) => {
        const cards = get().cards.filter((c) => c.status !== 'new');
        return getCardsForReview(cards, limit);
      },

      getNewCardsToStudy: (limit) => {
        return getNewCards(get().cards, limit ?? SRS_CONFIG.maxNewCardsPerDay);
      },

      getStudySession: () => {
        return getStudySession(get().cards);
      },

      getStats: () => {
        const state = get();
        return calculateSRSStats(state.cards, state.reviewedToday, state.lastReviewDate);
      },

      getCardsBySource: (sourceType, sourceId) => {
        return get().cards.filter((c) => {
          if (c.source.type !== sourceType) return false;
          if (sourceId && c.source.id !== sourceId) return false;
          return true;
        });
      },

      getCardsByTag: (tag) => {
        return get().cards.filter((c) => c.tags.includes(tag));
      },

      isPhraseSaved: (phrase) => {
        const normalizedPhrase = normalizePhrase(phrase);
        return get().cards.some((c) => normalizePhrase(c.phrase) === normalizedPhrase);
      },

      getCardByPhrase: (phrase) => {
        const normalizedPhrase = normalizePhrase(phrase);
        return get().cards.find((c) => normalizePhrase(c.phrase) === normalizedPhrase);
      },

      getTodayReviewCount: () => {
        const state = get();
        return isSameDay(state.lastReviewDate) ? state.reviewedToday.length : 0;
      },

      resetDailyStats: () => {
        const state = get();
        if (!isSameDay(state.lastReviewDate)) {
          set({ reviewedToday: [] });
        }
      },

      resetSRS: () => set(initialState),
    }),
    {
      name: 'french-app-srs',
    }
  )
);

// ============================================================
// SELECTORS
// ============================================================

export const selectDueCount = (state: SRSStore): number => {
  return state.cards.filter((c) => c.status !== 'new' && isDueForReview(c)).length;
};

export const selectNewCount = (state: SRSStore): number => {
  return state.cards.filter((c) => c.status === 'new').length;
};

export const selectTotalCards = (state: SRSStore): number => {
  return state.cards.length;
};

export const selectHasCardsToReview = (state: SRSStore): boolean => {
  return state.cards.some((c) => {
    if (c.status === 'new') return true;
    return isDueForReview(c);
  });
};
