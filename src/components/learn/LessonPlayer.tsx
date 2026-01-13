'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ClozeExercise } from '@/components/exercises/ClozeExercise';
import { VocabularyExercise } from '@/components/exercises/VocabularyExercise';
import { VariationsExercise } from '@/components/exercises/VariationsExercise';
import { useNodeProgressStore } from '@/store/useNodeProgressStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import type { Phrase, Vocabulary, Variation } from '@/types';

// Tipos de ejercicios soportados
export type ExerciseType = 'cloze' | 'vocabulary' | 'variations';

export interface LessonExercise {
  id: string;
  type: ExerciseType;
  data: Phrase | Vocabulary | Variation[];
}

export interface Lesson {
  id: string;
  title: string;
  nodeId: string;
  exercises: LessonExercise[];
}

interface LessonPlayerProps {
  lesson: Lesson;
  onComplete: (results: LessonResults) => void;
}

interface LessonResults {
  lessonId: string;
  totalExercises: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  xpEarned: number;
}

// Helper functions for completion message
const ACCURACY_THRESHOLDS = {
  excellent: 80,
  good: 50,
} as const;

function getCompletionEmoji(accuracy: number): string {
  if (accuracy >= ACCURACY_THRESHOLDS.excellent) return '🎉';
  if (accuracy >= ACCURACY_THRESHOLDS.good) return '👍';
  return '💪';
}

function getCompletionMessage(accuracy: number): string {
  if (accuracy >= ACCURACY_THRESHOLDS.excellent) return '¡Excelente!';
  if (accuracy >= ACCURACY_THRESHOLDS.good) return '¡Buen trabajo!';
  return '¡Sigue practicando!';
}

export function LessonPlayer({ lesson, onComplete }: LessonPlayerProps) {
  const router = useRouter();
  const { startLesson, completeExercise, completeLesson } = useNodeProgressStore();
  const { xp } = useGamificationStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startXP, setStartXP] = useState(0);

  const totalExercises = lesson.exercises.length;
  const currentExercise = lesson.exercises[currentIndex];
  const progress = ((currentIndex) / totalExercises) * 100;

  // Iniciar lección al montar
  useEffect(() => {
    startLesson(lesson.nodeId, lesson.id, totalExercises);
    setStartXP(xp);
  }, [lesson.nodeId, lesson.id, totalExercises, startLesson, xp]);

  const handleExerciseComplete = useCallback((correct: boolean) => {
    // Actualizar contadores
    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setIncorrectCount((c) => c + 1);
    }

    // Actualizar progreso en el store
    completeExercise(lesson.nodeId);

    // Pasar al siguiente ejercicio o terminar
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, totalExercises, completeExercise, lesson.nodeId]);

  const handleLessonComplete = useCallback(() => {
    const xpEarned = xp - startXP;
    const results: LessonResults = {
      lessonId: lesson.id,
      totalExercises,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      accuracy: Math.round((correctCount / totalExercises) * 100),
      xpEarned,
    };

    // Marcar lección como completada
    completeLesson(lesson.nodeId, lesson.id);

    onComplete(results);
  }, [
    lesson.id,
    lesson.nodeId,
    totalExercises,
    correctCount,
    incorrectCount,
    xp,
    startXP,
    completeLesson,
    onComplete,
  ]);

  const handleExit = useCallback(() => {
    router.push(`/learn/node/${lesson.nodeId}`);
  }, [router, lesson.nodeId]);

  // Renderizar el ejercicio actual
  const renderExercise = () => {
    if (!currentExercise) return null;

    switch (currentExercise.type) {
      case 'cloze':
        return (
          <ClozeExercise
            phrase={currentExercise.data as Phrase}
            onComplete={handleExerciseComplete}
          />
        );
      case 'vocabulary':
        return (
          <VocabularyExercise
            exercise={currentExercise.data as Vocabulary}
            onComplete={handleExerciseComplete}
          />
        );
      case 'variations':
        return (
          <VariationsExercise
            phrase={currentExercise.data as Phrase}
            onComplete={() => handleExerciseComplete(true)}
          />
        );
      default:
        return (
          <div className="text-center text-calm-text-muted">
            Tipo de ejercicio no soportado: {currentExercise.type}
          </div>
        );
    }
  };

  // Pantalla de completado
  if (isComplete) {
    const accuracy = Math.round((correctCount / totalExercises) * 100);
    const xpEarned = xp - startXP;

    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="text-8xl mb-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
        >
          {getCompletionEmoji(accuracy)}
        </motion.div>

        <motion.h2
          className="text-3xl font-bold text-calm-text-primary dark:text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {getCompletionMessage(accuracy)}
        </motion.h2>

        <motion.p
          className="text-calm-text-secondary dark:text-calm-text-muted mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Lección completada: {lesson.title}
        </motion.p>

        {/* Estadísticas */}
        <motion.div
          className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white dark:bg-calm-bg-elevated rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
              {accuracy}%
            </div>
            <div className="text-xs text-calm-text-muted dark:text-calm-text-muted">Precisión</div>
          </div>
          <div className="bg-white dark:bg-calm-bg-elevated rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
              {correctCount}/{totalExercises}
            </div>
            <div className="text-xs text-calm-text-muted dark:text-calm-text-muted">Correctas</div>
          </div>
          <div className="bg-white dark:bg-calm-bg-elevated rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              +{xpEarned}
            </div>
            <div className="text-xs text-calm-text-muted dark:text-calm-text-muted">XP</div>
          </div>
        </motion.div>

        {/* Botones */}
        <motion.div
          className="flex flex-col gap-3 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={handleLessonComplete}
            className="w-full py-4 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-xl transition-colors"
          >
            Continuar →
          </button>
          <button
            onClick={handleExit}
            className="w-full py-3 bg-calm-bg-secondary dark:bg-calm-bg-elevated text-calm-text-secondary dark:text-calm-text-tertiary font-medium rounded-xl transition-colors hover:bg-calm-bg-tertiary dark:hover:bg-calm-bg-tertiary"
          >
            Volver al nodo
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-calm-bg-primary dark:bg-calm-bg-primary flex flex-col">
      {/* Header con progreso */}
      <header className="bg-white dark:bg-calm-bg-elevated border-b border-calm-warm-100 dark:border-calm-warm-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleExit}
              className="text-calm-text-muted hover:text-calm-text-secondary dark:text-calm-text-muted dark:hover:text-calm-text-tertiary"
            >
              ✕
            </button>
            <span className="text-sm text-calm-text-secondary dark:text-calm-text-muted">
              {currentIndex + 1} / {totalExercises}
            </span>
            <div className="w-6" /> {/* Spacer */}
          </div>

          {/* Barra de progreso */}
          <div className="h-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      {/* Contenido del ejercicio */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise?.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderExercise()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
