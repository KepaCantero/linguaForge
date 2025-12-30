'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ClozeExercise } from '@/components/exercises/ClozeExercise';
import { ShadowingExercise } from '@/components/exercises/ShadowingExercise';
import { VariationsExercise } from '@/components/exercises/VariationsExercise';
import { MiniTaskExercise } from '@/components/exercises/MiniTaskExercise';
import { useProgressStore } from '@/store/useProgressStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { loadWorld } from '@/services/contentLoader';
import { Matrix } from '@/types';
import { XP_RULES } from '@/lib/constants';

interface MatrixPageProps {
  params: { worldId: string; matrixId: string };
}

type ExercisePhase = 'intro' | 'cloze' | 'shadowing' | 'variations' | 'minitask' | 'complete';

export default function MatrixPage({ params }: MatrixPageProps) {
  const { worldId, matrixId } = params;
  const router = useRouter();
  const { activeLanguage, activeLevel, completeMatrix } = useProgressStore();
  const { addXP, addCoins } = useGamificationStore();

  const [, setWorld] = useState<unknown>(null);
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<ExercisePhase>('intro');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await loadWorld(activeLanguage, activeLevel, worldId);
        setWorld(data);
        const foundMatrix = data.matrices.find((m) => m.id === matrixId);
        if (!foundMatrix) {
          setError('Matrix not found');
        } else {
          setMatrix(foundMatrix);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading world');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeLanguage, activeLevel, worldId, matrixId]);

  const currentPhrase = matrix?.phrases[currentPhraseIndex];
  const totalPhrases = matrix?.phrases.length || 0;
  const isPerfect = correctAnswers === totalPhrases;

  const startExercises = useCallback(() => {
    setPhase('cloze');
  }, []);

  const handleClozeComplete = useCallback((correct: boolean) => {
    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
    }
    setPhase('shadowing');
  }, []);

  const handleShadowingComplete = useCallback(() => {
    setPhase('variations');
  }, []);

  const handleVariationsComplete = useCallback(() => {
    // Avanzar a siguiente frase o a minitask
    if (currentPhraseIndex < totalPhrases - 1) {
      setCurrentPhraseIndex((prev) => prev + 1);
      setPhase('cloze');
    } else if (matrix?.miniTask) {
      setPhase('minitask');
    } else {
      // No hay miniTask, completar directamente
      completeMatrix(worldId, matrixId);
      setPhase('complete');
    }
  }, [currentPhraseIndex, totalPhrases, matrix?.miniTask, worldId, matrixId, completeMatrix]);

  const handleMiniTaskComplete = useCallback(
    (success: boolean) => {
      if (success) {
        // Completar matriz
        completeMatrix(worldId, matrixId);

        // Bonus por matriz perfecta
        if (isPerfect) {
          addXP(XP_RULES.perfectMatrix);
          addCoins(25);
        }
      }
      setPhase('complete');
    },
    [worldId, matrixId, completeMatrix, isPerfect, addXP, addCoins]
  );

  const goBack = useCallback(() => {
    router.push(`/world/${worldId}`);
  }, [router, worldId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </div>
    );
  }

  if (error || !matrix) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <span className="text-4xl mb-4">😢</span>
        <p className="text-gray-600 dark:text-gray-400">{error || 'Matrix not found'}</p>
        <button onClick={goBack} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Header con progreso */}
      {phase !== 'intro' && phase !== 'complete' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <button onClick={goBack} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">{matrix.title}</span>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Frase {currentPhraseIndex + 1} de {totalPhrases}
              </div>
            </div>
            <div className="w-6" />
          </div>

          {/* Barra de progreso */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentPhraseIndex + (phase === 'minitask' ? 1 : 0)) / (totalPhrases + 1)) * 100}%`,
              }}
            />
          </div>

          {/* Indicador de fase */}
          <div className="flex justify-center gap-2 mt-3">
            {['cloze', 'shadowing', 'variations'].map((p) => (
              <div
                key={p}
                className={`
                  w-2 h-2 rounded-full
                  ${phase === p
                    ? 'bg-indigo-500'
                    : ['cloze', 'shadowing', 'variations'].indexOf(phase) > ['cloze', 'shadowing', 'variations'].indexOf(p)
                      ? 'bg-emerald-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contenido según fase */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-5xl shadow-lg">
                📚
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{matrix.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">{matrix.description}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Contexto:</p>
              <p className="text-gray-700 dark:text-gray-300">{matrix.context}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">En esta lección:</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <span className="text-gray-700 dark:text-gray-300">{totalPhrases} frases con ejercicios</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎧</span>
                <span className="text-gray-700 dark:text-gray-300">Práctica de shadowing</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <span className="text-gray-700 dark:text-gray-300">1 mini-tarea de producción</span>
              </div>
            </div>

            <button
              onClick={startExercises}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Comenzar lección
            </button>
          </motion.div>
        )}

        {phase === 'cloze' && currentPhrase && (
          <motion.div
            key={`cloze-${currentPhraseIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <ClozeExercise phrase={currentPhrase} onComplete={handleClozeComplete} />
          </motion.div>
        )}

        {phase === 'shadowing' && currentPhrase && (
          <motion.div
            key={`shadowing-${currentPhraseIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <ShadowingExercise phrase={currentPhrase} onComplete={handleShadowingComplete} />
          </motion.div>
        )}

        {phase === 'variations' && currentPhrase && (
          <motion.div
            key={`variations-${currentPhraseIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <VariationsExercise phrase={currentPhrase} onComplete={handleVariationsComplete} />
          </motion.div>
        )}

        {phase === 'minitask' && matrix.miniTask && (
          <motion.div
            key="minitask"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MiniTaskExercise
              miniTask={matrix.miniTask}
              languageCode={activeLanguage}
              levelCode={activeLevel}
              onComplete={handleMiniTaskComplete}
            />
          </motion.div>
        )}

        {phase === 'complete' && (
          <motion.div
            key="complete"
            className="text-center space-y-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-8">
              <span className="text-6xl mb-4 block">{isPerfect ? '🏆' : '🎉'}</span>
              <h2 className="text-white text-2xl font-bold mb-2">
                {isPerfect ? '¡Perfecto!' : '¡Lección completada!'}
              </h2>
              <p className="text-white/80">
                {correctAnswers}/{totalPhrases} respuestas correctas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                <span className="text-2xl mb-1 block">⭐</span>
                <p className="text-2xl font-bold text-yellow-500">{correctAnswers * 10 + (isPerfect ? 50 : 0)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">XP ganado</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                <span className="text-2xl mb-1 block">💰</span>
                <p className="text-2xl font-bold text-amber-500">{20 + (isPerfect ? 25 : 0)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Monedas</p>
              </div>
            </div>

            <button
              onClick={goBack}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg"
            >
              Volver al mapa
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
