'use client';

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSRSStore } from '@/store/useSRSStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useWordDictionaryStore } from '@/store/useWordDictionaryStore';
import { ClozeExercise } from '@/components/exercises/ClozeExercise';
import { generateClozeExerciseFromWord } from '@/services/wordExerciseGenerator';
import { MemoryBankSession, type MemoryBankCard, type SessionMetrics } from '@/components/exercises/MemoryBank/MemoryBankSession';
import { ReviewResponse, ContentSourceType, type SRSCard } from '@/types/srs';
import { Phrase } from '@/types';
import Link from 'next/link';

type ReviewMode = 'classic' | 'memory-bank';

// Convert SRS cards to Memory Bank format
function convertToMemoryBankCards(srsCards: SRSCard[]): MemoryBankCard[] {
  return srsCards.map(card => {
    // Determine difficulty based on easeFactor (lower = harder)
    // easeFactor typically ranges from 1.3 to 2.5+
    const difficulty: 'easy' | 'medium' | 'hard' =
      card.easeFactor <= 1.8 ? 'hard' :
      card.easeFactor <= 2.2 ? 'medium' : 'easy';

    return {
      id: card.id,
      front: {
        text: card.phrase,
        subtext: card.source.context || undefined,
      },
      back: {
        text: card.translation || card.phrase,
        subtext: card.tags.join(' • '),
      },
      context: 'vocabulary' as const,
      difficulty,
      reviewCount: card.reviewHistory.length,
      lastReviewedAt: card.nextReviewDate || undefined,
    };
  });
}

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const sourceType = searchParams.get('sourceType');
  const sourceId = searchParams.get('sourceId');
  const filterParam = searchParams.get('filter'); // 'new' para solo nuevas
  const modeParam = searchParams.get('mode'); // 'memory-bank' para modo AAA

  const { getCardsBySource, getStudySession, reviewCard } = useSRSStore();
  const { addXP } = useGamificationStore();
  const { markAsMastered } = useWordDictionaryStore();

  const [reviewMode, setReviewMode] = useState<ReviewMode>(
    modeParam === 'memory-bank' ? 'memory-bank' : 'classic'
  );
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState<Phrase | null>(null);
  const [exerciseType, setExerciseType] = useState<'cloze' | 'detection'>('cloze');
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  // Obtener cards para repasar
  const cardsToReview = useMemo(() => {
    if (sourceType && sourceId) {
      // Filtrar por fuente específica
      const cards = getCardsBySource(sourceType as ContentSourceType, sourceId);
      const today = new Date().toISOString().split('T')[0];

      if (filterParam === 'new') {
        return cards.filter(card => card.status === 'new');
      }

      return cards.filter(card =>
        card.status === 'new' ||
        (card.nextReviewDate && card.nextReviewDate <= today)
      );
    } else {
      // Sesión general de estudio
      const session = getStudySession();

      if (filterParam === 'new') {
        return session.filter(card => card.status === 'new');
      }

      return session;
    }
  }, [sourceType, sourceId, filterParam, getCardsBySource, getStudySession]);

  const currentCard = cardsToReview[currentCardIndex];

  // Generar ejercicio cuando cambia la card
  useEffect(() => {
    if (!currentCard) {
      setSessionComplete(true);
      return;
    }

    // Generar ejercicio Cloze para la palabra
    const exercise = generateClozeExerciseFromWord(currentCard);
    setCurrentExercise(exercise);
    setExerciseType('cloze');
  }, [currentCard]);

  // Memory Bank cards
  const memoryBankCards = useMemo(() =>
    convertToMemoryBankCards(cardsToReview),
    [cardsToReview]
  );

  const handleExerciseComplete = useCallback((correct: boolean) => {
    if (!currentCard) return;

    // Determinar respuesta según resultado
    let response: ReviewResponse = 'good';
    if (!correct) {
      response = 'again';
    }

    // Aplicar review
    const updatedCard = reviewCard(currentCard.id, response);

    // Actualizar estadísticas
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    // Dar XP
    addXP(correct ? 10 : 5);

    // Si la card está graduada, marcar palabra como mastered
    if (updatedCard?.status === 'graduated') {
      markAsMastered(currentCard.phrase);
    }

    // Avanzar a la siguiente card después de un breve delay
    setTimeout(() => {
      if (currentCardIndex < cardsToReview.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setSessionComplete(true);
      }
    }, 1500);
  }, [currentCard, currentCardIndex, cardsToReview.length, reviewCard, addXP, markAsMastered]);

  // Memory Bank session complete handler
  const handleMemoryBankComplete = useCallback((metrics: SessionMetrics) => {
    // Update SRS cards based on Memory Bank results
    // This is a simplified version - in production you'd track individual card results
    setSessionStats({
      correct: metrics.correctAnswers,
      incorrect: metrics.incorrectAnswers,
    });

    // Award XP based on accuracy
    const baseXP = metrics.cardsReviewed * 10;
    const bonusXP = Math.floor(metrics.accuracy * baseXP * 0.5);
    addXP(baseXP + bonusXP);

    setSessionComplete(true);
  }, [addXP]);

  // Memory Bank card review handler
  const handleMemoryBankCardReview = useCallback((cardId: string, isCorrect: boolean) => {
    // Find the original SRS card and review it
    const card = cardsToReview.find(c => c.id === cardId);
    if (card) {
      const response: ReviewResponse = isCorrect ? 'good' : 'again';
      const updatedCard = reviewCard(card.id, response);

      if (updatedCard?.status === 'graduated') {
        markAsMastered(card.phrase);
      }
    }
  }, [cardsToReview, reviewCard, markAsMastered]);

  if (sessionComplete || cardsToReview.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ¡Sesión completada!
          </h2>
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Correctas</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {sessionStats.correct}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Incorrectas</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {sessionStats.incorrect}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total repasadas</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {cardsToReview.length}
              </p>
            </div>
          </div>
          <Link
            href="/decks"
            className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Ver todos los decks
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!currentExercise || !currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Cargando ejercicio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={sourceType && sourceId ? `/input/${sourceType}` : '/decks'}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <span className="text-xl">←</span>
            </Link>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Repaso
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {reviewMode === 'memory-bank' ? `${cardsToReview.length} tarjetas` : `${currentCardIndex + 1} de ${cardsToReview.length}`}
              </p>
            </div>
            <div className="w-8" /> {/* Spacer */}
          </div>

          {/* Mode selector */}
          <div className="flex justify-center mt-3 gap-2">
            <button
              onClick={() => setReviewMode('classic')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                reviewMode === 'classic'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Clásico
            </button>
            <button
              onClick={() => setReviewMode('memory-bank')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                reviewMode === 'memory-bank'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>✨</span> Memory Bank
            </button>
          </div>
        </div>
      </header>

      {/* Memory Bank Mode */}
      {reviewMode === 'memory-bank' && (
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <MemoryBankSession
            cards={memoryBankCards}
            context="vocabulary"
            onComplete={handleMemoryBankComplete}
            onCardReview={handleMemoryBankCardReview}
            title="Memory Bank AAA"
            showProgress
          />
        </div>
      )}

      {/* Classic Mode - Progreso */}
      {reviewMode === 'classic' && (
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progreso</span>
            <span>{Math.round(((currentCardIndex + 1) / cardsToReview.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-indigo-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentCardIndex + 1) / cardsToReview.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Información de la card */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {currentCard.phrase}
            </span>
            {currentCard.tags.includes('verb') && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                Verbo
              </span>
            )}
            {currentCard.tags.includes('noun') && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                Sustantivo
              </span>
            )}
            {currentCard.tags.includes('adverb') && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                Adverbio
              </span>
            )}
            {currentCard.tags.includes('adjective') && (
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded">
                Adjetivo
              </span>
            )}
          </div>
          {currentCard.source.context && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {currentCard.source.context}
            </p>
          )}
        </div>

        {/* Ejercicio */}
        <AnimatePresence mode="wait">
          {exerciseType === 'cloze' && currentExercise && (
            <motion.div
              key={`cloze-${currentCard.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ClozeExercise
                phrase={currentExercise}
                onComplete={handleExerciseComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
