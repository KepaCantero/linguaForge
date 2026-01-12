import { useCallback } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useWordDictionaryStore } from '@/store/useWordDictionaryStore';
import type { ReviewResponse, SRSCard } from '@/types/srs';
import type { SessionMetrics } from '@/components/exercises/MemoryBank/MemoryBankSession';

function getReviewResponseForCorrect(): ReviewResponse {
  return 'good';
}

function getReviewResponseForIncorrect(): ReviewResponse {
  return 'again';
}

function calculateXPForCorrect(): number {
  return 10;
}

function calculateXPForIncorrect(): number {
  return 5;
}

export interface ReviewHandlersProps {
  currentCard: SRSCard | undefined;
  currentCardIndex: number;
  cardsToReviewLength: number;
  reviewCard: (cardId: string, response: ReviewResponse) => SRSCard | null;
  setCurrentCardIndex: React.Dispatch<React.SetStateAction<number>>;
  setSessionComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setSessionStats: React.Dispatch<React.SetStateAction<{ correct: number; incorrect: number }>>;
  cardsToReview: SRSCard[];
}

export function useReviewHandlers({
  currentCard,
  currentCardIndex,
  cardsToReviewLength,
  reviewCard,
  setCurrentCardIndex,
  setSessionComplete,
  setSessionStats,
  cardsToReview,
}: ReviewHandlersProps) {
  const { addXP } = useGamificationStore();
  const { markAsMastered } = useWordDictionaryStore();

  const handleExerciseComplete = useCallback((correct: boolean) => {
    if (!currentCard) return;

    const response = correct ? getReviewResponseForCorrect() : getReviewResponseForIncorrect();
    const updatedCard = reviewCard(currentCard.id, response);

    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    addXP(correct ? calculateXPForCorrect() : calculateXPForIncorrect());

    if (updatedCard?.status === 'graduated') {
      markAsMastered(currentCard.phrase);
    }

    setTimeout(() => {
      if (currentCardIndex < cardsToReviewLength - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setSessionComplete(true);
      }
    }, 1500);
  }, [currentCard, currentCardIndex, cardsToReviewLength, reviewCard, addXP, markAsMastered, setCurrentCardIndex, setSessionComplete, setSessionStats]);

  const handleMemoryBankComplete = useCallback((metrics: SessionMetrics) => {
    setSessionStats({
      correct: metrics.correctAnswers,
      incorrect: metrics.incorrectAnswers,
    });

    const baseXP = metrics.cardsReviewed * 10;
    const bonusXP = Math.floor(metrics.accuracy * baseXP * 0.5);
    addXP(baseXP + bonusXP);

    setSessionComplete(true);
  }, [addXP, setSessionStats, setSessionComplete]);

  const handleMemoryBankCardReview = useCallback((cardId: string, isCorrect: boolean) => {
    const card = cardsToReview.find(c => c.id === cardId);
    if (card) {
      const response = isCorrect ? getReviewResponseForCorrect() : getReviewResponseForIncorrect();
      const updatedCard = reviewCard(card.id, response);

      if (updatedCard?.status === 'graduated') {
        markAsMastered(card.phrase);
      }
    }
  }, [cardsToReview, reviewCard, markAsMastered]);

  return {
    handleExerciseComplete,
    handleMemoryBankComplete,
    handleMemoryBankCardReview,
  };
}
