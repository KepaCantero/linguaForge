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
} from '@/lib/sm2';

// ============================================
// TIPOS
// ============================================

interface SRSStore {
  // Estado
  cards: SRSCard[];

  // Estadísticas de hoy
  reviewedToday: string[]; // IDs de tarjetas revisadas hoy
  lastReviewDate: string | null;

  // Acciones CRUD
  addCard: (input: CreateSRSCardInput) => SRSCard;
  addCards: (inputs: CreateSRSCardInput[]) => SRSCard[];
  removeCard: (cardId: string) => void;
  updateCard: (cardId: string, updates: Partial<SRSCard>) => void;

  // Acciones de repaso
  reviewCard: (cardId: string, response: ReviewResponse, timeSpentMs?: number) => SRSCard | null;

  // Getters
  getCard: (cardId: string) => SRSCard | undefined;
  getDueCards: (limit?: number) => SRSCard[];
  getNewCardsToStudy: (limit?: number) => SRSCard[];
  getStudySession: () => SRSCard[];
  getStats: () => SRSStats;
  getCardsBySource: (sourceType: ContentSource['type'], sourceId?: string) => SRSCard[];
  getCardsByTag: (tag: string) => SRSCard[];

  // Utilidades
  isPhraseSaved: (phrase: string) => boolean;
  getCardByPhrase: (phrase: string) => SRSCard | undefined;
  getTodayReviewCount: () => number;
  resetDailyStats: () => void;

  // Reset
  resetSRS: () => void;
}

// ============================================
// HELPERS
// ============================================

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function isSameDay(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr === getTodayDateString();
}

// ============================================
// ESTADO INICIAL
// ============================================

const initialState = {
  cards: [] as SRSCard[],
  reviewedToday: [] as string[],
  lastReviewDate: null as string | null,
};

// ============================================
// STORE
// ============================================

export const useSRSStore = create<SRSStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================
      // CRUD
      // ========================================

      addCard: (input) => {
        const newCard = createCard(
          input.phrase,
          input.translation,
          input.source,
          {
            audioUrl: input.audioUrl,
            languageCode: input.languageCode,
            levelCode: input.levelCode,
            tags: input.tags,
            notes: input.notes,
          }
        );

        set((state) => ({
          cards: [...state.cards, newCard],
        }));

        return newCard;
      },

      addCards: (inputs) => {
        const newCards = inputs.map((input) =>
          createCard(
            input.phrase,
            input.translation,
            input.source,
            {
              audioUrl: input.audioUrl,
              languageCode: input.languageCode,
              levelCode: input.levelCode,
              tags: input.tags,
              notes: input.notes,
            }
          )
        );

        set((state) => ({
          cards: [...state.cards, ...newCards],
        }));

        return newCards;
      },

      removeCard: (cardId) => {
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== cardId),
        }));
      },

      updateCard: (cardId, updates) => {
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId ? { ...c, ...updates } : c
          ),
        }));
      },

      // ========================================
      // REPASO
      // ========================================

      reviewCard: (cardId, response, timeSpentMs = 0) => {
        const state = get();
        const card = state.cards.find((c) => c.id === cardId);

        if (!card) return null;

        const updatedCard = applyReview(card, response, timeSpentMs);
        const today = getTodayDateString();

        // Actualizar lista de revisadas hoy si es nuevo día
        let newReviewedToday = state.reviewedToday;
        if (!isSameDay(state.lastReviewDate)) {
          newReviewedToday = [];
        }

        // Añadir a revisadas de hoy si no está ya
        if (!newReviewedToday.includes(cardId)) {
          newReviewedToday = [...newReviewedToday, cardId];
        }

        set({
          cards: state.cards.map((c) =>
            c.id === cardId ? updatedCard : c
          ),
          reviewedToday: newReviewedToday,
          lastReviewDate: today,
        });

        return updatedCard;
      },

      // ========================================
      // GETTERS
      // ========================================

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
        const { cards, reviewedToday, lastReviewDate } = state;

        const totalCards = cards.length;
        const newCards = cards.filter((c) => c.status === 'new').length;
        const learningCards = cards.filter((c) => c.status === 'learning').length;
        const reviewCards = cards.filter((c) => c.status === 'review').length;
        const graduatedCards = cards.filter((c) => c.status === 'graduated').length;

        // Estadísticas de hoy
        const todayReviews = isSameDay(lastReviewDate) ? reviewedToday : [];
        const reviewedTodayCount = todayReviews.length;

        // Contar correctas/incorrectas de hoy
        let correctToday = 0;
        let incorrectToday = 0;

        for (const cardId of todayReviews) {
          const card = cards.find((c) => c.id === cardId);
          if (card && card.reviewHistory.length > 0) {
            const lastReview = card.reviewHistory[card.reviewHistory.length - 1];
            const reviewDate = lastReview.date.split('T')[0];
            if (reviewDate === getTodayDateString()) {
              if (lastReview.response === 'again') {
                incorrectToday++;
              } else {
                correctToday++;
              }
            }
          }
        }

        // Estadísticas generales
        const totalReviews = cards.reduce(
          (sum, c) => sum + c.reviewHistory.length,
          0
        );
        const retentionRate = calculateRetentionRate(cards);
        const averageEaseFactor = calculateAverageEaseFactor(cards);

        // Racha de días
        let streakDays = 0;
        if (lastReviewDate) {
          const today = new Date();
          const lastDate = new Date(lastReviewDate);
          const diffDays = Math.floor(
            (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays <= 1) {
            // Calcular racha hacia atrás
            const reviewDates = new Set<string>();
            for (const card of cards) {
              for (const review of card.reviewHistory) {
                reviewDates.add(review.date.split('T')[0]);
              }
            }

            const sortedDates = Array.from(reviewDates).sort().reverse();
            streakDays = 0;
            let expectedDate = getTodayDateString();

            for (const date of sortedDates) {
              if (date === expectedDate) {
                streakDays++;
                // Calcular día anterior
                const d = new Date(expectedDate);
                d.setDate(d.getDate() - 1);
                expectedDate = d.toISOString().split('T')[0];
              } else if (date < expectedDate) {
                break;
              }
            }
          }
        }

        return {
          totalCards,
          newCards,
          learningCards,
          reviewCards,
          graduatedCards,
          reviewedToday: reviewedTodayCount,
          correctToday,
          incorrectToday,
          averageEaseFactor,
          retentionRate,
          totalReviews,
          streakDays,
          lastReviewDate,
        };
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

      // ========================================
      // UTILIDADES
      // ========================================

      isPhraseSaved: (phrase) => {
        const normalizedPhrase = phrase.toLowerCase().trim();
        return get().cards.some(
          (c) => c.phrase.toLowerCase().trim() === normalizedPhrase
        );
      },

      getCardByPhrase: (phrase) => {
        const normalizedPhrase = phrase.toLowerCase().trim();
        return get().cards.find(
          (c) => c.phrase.toLowerCase().trim() === normalizedPhrase
        );
      },

      getTodayReviewCount: () => {
        const state = get();
        if (!isSameDay(state.lastReviewDate)) {
          return 0;
        }
        return state.reviewedToday.length;
      },

      resetDailyStats: () => {
        const state = get();
        if (!isSameDay(state.lastReviewDate)) {
          set({
            reviewedToday: [],
          });
        }
      },

      resetSRS: () => set(initialState),
    }),
    {
      name: 'french-app-srs',
    }
  )
);

// ============================================
// SELECTORES
// ============================================

export const selectDueCount = (state: SRSStore): number => {
  return state.cards.filter(
    (c) => c.status !== 'new' && isDueForReview(c)
  ).length;
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
