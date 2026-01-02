'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSRSStore } from '@/store/useSRSStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useWordDictionaryStore } from '@/store/useWordDictionaryStore';
import { ClozeExercise } from '@/components/exercises/ClozeExercise';
import { generateClozeExerciseFromWord } from '@/services/wordExerciseGenerator';
import { ReviewResponse, SRSCard } from '@/types/srs';
import { Phrase } from '@/types';
import Link from 'next/link';

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceType = searchParams.get('sourceType');
  const sourceId = searchParams.get('sourceId');
  const filterParam = searchParams.get('filter'); // 'new' para solo nuevas
  
  const { getCardsBySource, getStudySession, reviewCard } = useSRSStore();
  const { addXP } = useGamificationStore();
  const { markAsMastered } = useWordDictionaryStore();
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState<Phrase | null>(null);
  const [exerciseType, setExerciseType] = useState<'cloze' | 'detection'>('cloze');
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  // Obtener cards para repasar
  const cardsToReview = useMemo(() => {
    if (sourceType && sourceId) {
      // Filtrar por fuente específica
      const cards = getCardsBySource(sourceType as any, sourceId);
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
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
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
              {currentCardIndex + 1} de {cardsToReview.length}
            </p>
          </div>
          <div className="w-8" /> {/* Spacer */}
        </div>
      </header>

      {/* Progreso */}
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
    </div>
  );
}

