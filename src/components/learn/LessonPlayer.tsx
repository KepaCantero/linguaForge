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
          <div className="text-center text-gray-500">
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
          {accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}
        </motion.div>

        <motion.h2
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {accuracy >= 80 ? '¡Excelente!' : accuracy >= 50 ? '¡Buen trabajo!' : '¡Sigue practicando!'}
        </motion.h2>

        <motion.p
          className="text-gray-600 dark:text-gray-400 mb-8"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {accuracy}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Precisión</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {correctCount}/{totalExercises}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Correctas</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              +{xpEarned}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">XP</div>
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
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
          >
            Continuar →
          </button>
          <button
            onClick={handleExit}
            className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Volver al nodo
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header con progreso */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleExit}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentIndex + 1} / {totalExercises}
            </span>
            <div className="w-6" /> {/* Spacer */}
          </div>

          {/* Barra de progreso */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
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
