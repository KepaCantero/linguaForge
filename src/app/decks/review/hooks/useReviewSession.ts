import { useEffect, useMemo, useState } from 'react';
import { useSRSStore } from '@/store/useSRSStore';
import { generateClozeExerciseFromWord } from '@/services/wordExerciseGenerator';
import type { Phrase } from '@/types';
import type { ContentSourceType, SRSCard } from '@/types/srs';
import type { MemoryBankCard, SessionMetrics } from '@/components/exercises/MemoryBank/MemoryBankSession';
import { convertToMemoryBankCards, filterCardsForReview } from './reviewHelpers';
import { useReviewHandlers } from './useReviewHandlers';

export type ReviewMode = 'classic' | 'memory-bank';

export interface ReviewSessionData {
  cardsToReview: SRSCard[];
  currentCard: SRSCard | undefined;
  currentExercise: Phrase | null;
  exerciseType: 'cloze' | 'detection';
  sessionComplete: boolean;
  sessionStats: { correct: number; incorrect: number };
  memoryBankCards: MemoryBankCard[];
  reviewMode: ReviewMode;
}

export interface ReviewSessionActions {
  setReviewMode: (mode: ReviewMode) => void;
  handleExerciseComplete: (correct: boolean) => void;
  handleMemoryBankComplete: (metrics: SessionMetrics) => void;
  handleMemoryBankCardReview: (cardId: string, isCorrect: boolean) => void;
}

export function useReviewSession(
  sourceType: string | null,
  sourceId: string | null,
  filterParam: string | null
): [ReviewSessionData, ReviewSessionActions] {
  const { getCardsBySource, getStudySession, reviewCard } = useSRSStore();

  const [reviewMode, setReviewMode] = useState<ReviewMode>('classic');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState<Phrase | null>(null);
  const [exerciseType, setExerciseType] = useState<'cloze' | 'detection'>('cloze');
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  const cardsToReview = useMemo(() => {
    if (sourceType && sourceId) {
      const cards = getCardsBySource(sourceType as ContentSourceType, sourceId);
      return filterCardsForReview(cards, sourceType, sourceId, filterParam);
    }
    return filterCardsForReview(getStudySession(), sourceType, sourceId, filterParam);
  }, [sourceType, sourceId, filterParam, getCardsBySource, getStudySession]);

  const currentCard = cardsToReview[currentCardIndex];

  useEffect(() => {
    if (!currentCard) {
      setSessionComplete(true);
      return;
    }

    const exercise = generateClozeExerciseFromWord(currentCard);
    setCurrentExercise(exercise);
    setExerciseType('cloze');
  }, [currentCard]);

  const memoryBankCards = useMemo(() =>
    convertToMemoryBankCards(cardsToReview),
    [cardsToReview]
  );

  const handlers = useReviewHandlers({
    currentCard,
    currentCardIndex,
    cardsToReviewLength: cardsToReview.length,
    reviewCard,
    setCurrentCardIndex,
    setSessionComplete,
    setSessionStats,
    cardsToReview,
  });

  const data: ReviewSessionData = {
    cardsToReview,
    currentCard,
    currentExercise,
    exerciseType,
    sessionComplete,
    sessionStats,
    memoryBankCards,
    reviewMode,
  };

  const actions: ReviewSessionActions = {
    setReviewMode,
    ...handlers,
  };

  return [data, actions];
}
