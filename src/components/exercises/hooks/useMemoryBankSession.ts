'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useHaptic } from '@/lib/haptic';
import { useSoundEngine } from '@/lib/soundEngine';
import type { MemoryBankCard, SessionMetrics } from '../MemoryBank/types';

/**
 * Hook específico para Memory Bank Session
 * Maneja el estado de la sesión, respuestas y métricas
 */
export function useMemoryBankSession(
  cards: MemoryBankCard[],
  onComplete: (metrics: SessionMetrics) => void,
  onCardReview?: (cardId: string, isCorrect: boolean) => void
) {
  // Estado
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCards, setSessionCards] = useState<MemoryBankCard[]>([]);
  const [responses, setResponses] = useState<{ cardId: string; isCorrect: boolean; responseTime: number }[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [cardStartTime, setCardStartTime] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Hooks externos
  const haptic = useHaptic();
  const sound = useSoundEngine();

  // Inicializar sesión
  useEffect(() => {
    if (cards.length > 0 && !isInitialized) {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setSessionCards(shuffled);
      setSessionStartTime(Date.now());
      setCardStartTime(Date.now());
      setIsInitialized(true);
      sound.initialize();
    }
  }, [cards, isInitialized, sound]);

  // Tarjeta actual
  const currentCard = sessionCards[currentIndex];

  // Helpers para calcular métricas
  const calculateAccuracy = useCallback((cardsReviewed: number, correctAnswers: number): number => {
    return cardsReviewed > 0 ? (correctAnswers / cardsReviewed) * 100 : 0;
  }, []);

  const calculateAverageResponseTime = useCallback((responseList: { responseTime: number }[], cardsReviewed: number): number => {
    if (cardsReviewed === 0) return 0;
    const totalResponseTime = responseList.reduce((sum, r) => sum + r.responseTime, 0);
    return totalResponseTime / cardsReviewed;
  }, []);

  // Métricas calculadas
  const metrics = useMemo((): SessionMetrics => {
    const totalCards = sessionCards.length;
    const cardsReviewed = responses.length;
    const correctAnswers = responses.filter(r => r.isCorrect).length;
    const incorrectAnswers = cardsReviewed - correctAnswers;
    const averageResponseTime = calculateAverageResponseTime(responses, cardsReviewed);
    const sessionDuration = (Date.now() - sessionStartTime) / 1000;
    const accuracy = calculateAccuracy(cardsReviewed, correctAnswers);

    return {
      totalCards,
      cardsReviewed,
      correctAnswers,
      incorrectAnswers,
      averageResponseTime,
      sessionDuration,
      accuracy,
    };
  }, [sessionCards.length, responses, sessionStartTime, calculateAverageResponseTime, calculateAccuracy]);

  // Progreso
  const progress = sessionCards.length > 0
    ? ((currentIndex) / sessionCards.length) * 100
    : 0;

  // Manejar respuesta
  const handleResponse = useCallback((isCorrect: boolean) => {
    if (!currentCard || isComplete) return;

    const responseTime = Date.now() - cardStartTime;

    setResponses(prev => [
      ...prev,
      { cardId: currentCard.id, isCorrect, responseTime },
    ]);

    onCardReview?.(currentCard.id, isCorrect);

    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCardStartTime(Date.now());
    } else {
      setIsComplete(true);
      haptic.milestone();
      sound.playCelebration();
    }
  }, [currentCard, currentIndex, sessionCards.length, cardStartTime, isComplete, haptic, sound, onCardReview]);

  const handleSwipeRight = useCallback(() => {
    handleResponse(true);
  }, [handleResponse]);

  const handleSwipeLeft = useCallback(() => {
    handleResponse(false);
  }, [handleResponse]);

  const handleComplete = useCallback(() => {
    onComplete(metrics);
  }, [onComplete, metrics]);

  return {
    // Estado
    currentIndex,
    currentCard,
    sessionCards,
    isInitialized,
    isComplete,
    progress,
    metrics,

    // Handlers
    handleResponse,
    handleSwipeRight,
    handleSwipeLeft,
    handleComplete,
  };
}
