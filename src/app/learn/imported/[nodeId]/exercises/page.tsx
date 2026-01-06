'use client';

import { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { ClozeExercise } from '@/components/exercises/ClozeExercise';
import { VariationsExercise } from '@/components/exercises/VariationsExercise';
import { ConversationalEchoExercise } from '@/components/exercises/ConversationalEchoExercise';
import { DialogueIntonationExercise } from '@/components/exercises/DialogueIntonationExercise';
import { JanusComposerExercise } from '@/components/exercises/JanusComposerExercise';
import { RhythmSequenceWarmup } from '@/components/warmups/RhythmSequenceWarmup';
import { VisualMatchWarmup } from '@/components/warmups/VisualMatchWarmup';
import { FocusMode } from '@/components/focus/FocusMode';
import { PostCognitiveRewards } from '@/components/gamification/PostCognitiveRewards';
import { SessionSummary } from '@/components/session/SessionSummary';
import { useCognitiveLoad, useCognitiveLoadStore } from '@/store/useCognitiveLoadStore';
import { getSessionFeedback } from '@/services/postCognitiveRewards';
import {
  generateClozeExercises,
  generateVariationsExercises,
  generateConversationalEchoExercises,
  generateDialogueIntonationExercises,
  generateJanusComposerExercises,
} from '@/services/generateExercisesFromPhrases';
import type { Phrase, ConversationalEcho, DialogueIntonation, JanusComposer } from '@/types';
import type { RhythmSequenceConfig, VisualMatchConfig } from '@/schemas/warmup';

type LessonMode = 'academia' | 'desafio';
type ExerciseType = 'cloze' | 'variations' | 'conversationalEcho' | 'dialogueIntonation' | 'janusComposer' | null;
type PagePhase = 'warmup-choice' | 'warmup-exercise' | 'exercise-menu' | 'doing-exercise';
type WarmupType = 'rhythm' | 'visual' | null;

// Configs simples para warmups
const RHYTHM_CONFIG: RhythmSequenceConfig = {
  sequences: [
    {
      pattern: ['tap', 'tap', 'tap'],
      duration: 2000,
      bpm: 80,
    },
    {
      pattern: ['tap', 'hold', 'tap'],
      duration: 3000,
      bpm: 80,
    },
    {
      pattern: ['swipe', 'tap', 'swipe'],
      duration: 2500,
      bpm: 80,
    },
  ],
  visualStyle: 'geometric',
  soundEnabled: true,
};

const VISUAL_CONFIG: VisualMatchConfig = {
  images: [
    {
      url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=🐱',
      category: 'animales',
      blurLevel: 5,
      correctAnswer: 'chat',
    },
    {
      url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=🍎',
      category: 'comida',
      blurLevel: 5,
      correctAnswer: 'pomme',
    },
    {
      url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=📚',
      category: 'objetos',
      blurLevel: 5,
      correctAnswer: 'livre',
    },
    {
      url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=🏠',
      category: 'lugares',
      blurLevel: 5,
      correctAnswer: 'maison',
    },
    {
      url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=🚗',
      category: 'transporte',
      blurLevel: 5,
      correctAnswer: 'voiture',
    },
  ],
  focusSpeed: 500,
  recognitionThreshold: 0.5,
  speedIncrease: 1.1,
};

function ExercisesPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nodeId = params.nodeId as string;
  const subtopicId = searchParams.get('subtopic');
  const mode = (searchParams.get('mode') || 'academia') as LessonMode;

  const { nodes } = useImportedNodesStore();
  const node = nodes.find((n) => n.id === nodeId);
  const subtopic = node?.subtopics.find((s) => s.id === subtopicId);

  // Control de fase: warmup opcional → menú → ejercicios
  const [pagePhase, setPagePhase] = useState<PagePhase>('exercise-menu');
  const [selectedWarmup, setSelectedWarmup] = useState<WarmupType>(null);
  const [focusModeActive, setFocusModeActive] = useState(false);

  // Post-cognitive rewards
  const [showRewards, setShowRewards] = useState(false);
  const [rewardData, setRewardData] = useState<ReturnType<typeof getSessionFeedback> | null>(null);

  // Session summary
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionStartTime] = useState<number>(Date.now());
  const [sessionLoadHistory, setSessionLoadHistory] = useState<number[]>([]);
  const [sessionPeakLoad, setSessionPeakLoad] = useState(0);
  const [focusModeStartTime, setFocusModeStartTime] = useState<number | null>(null);

  // CLT: Obtener estado de carga cognitiva
  const { load, status: loadStatus } = useCognitiveLoad();
  const { updateGermaneLoad } = useCognitiveLoadStore();
  const showCognitiveLoad = true; // Siempre mostrar carga cognitiva

  // Generar todos los tipos de ejercicios
  const exerciseData = useMemo(() => {
    if (!subtopic || !subtopic.phrases || subtopic.phrases.length === 0) {
      return null;
    }

    const phrases = subtopic.phrases.filter(p => p && p.trim().length > 0);

    if (phrases.length === 0) {
      return null;
    }

    const data = {
      cloze: generateClozeExercises(phrases),
      variations: generateVariationsExercises(phrases),
      conversationalEcho: generateConversationalEchoExercises(phrases),
      dialogueIntonation: generateDialogueIntonationExercises(phrases),
      janusComposer: generateJanusComposerExercises(phrases),
    };

    // Log para depuración
    console.log('[Exercises Page] Generated exercises:', {
      phrasesCount: phrases.length,
      cloze: data.cloze.length,
      variations: data.variations.length,
      conversationalEcho: data.conversationalEcho.length,
      dialogueIntonation: data.dialogueIntonation.length,
      janusComposer: data.janusComposer.length,
    });

    return data;
  }, [subtopic]);

  // Track load history and peak load
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionLoadHistory(prev => {
        const newHistory = [...prev, load.total];
        // Keep only last 100 data points
        return newHistory.slice(-100);
      });
      setSessionPeakLoad(prev => Math.max(prev, load.total));
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [load.total]);

  // Track focus mode duration
  useEffect(() => {
    if (focusModeActive && !focusModeStartTime) {
      setFocusModeStartTime(Date.now());
    } else if (!focusModeActive && focusModeStartTime) {
      setFocusModeStartTime(null);
    }
  }, [focusModeActive, focusModeStartTime]);

  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseType>(null);
  const [exerciseIndices, setExerciseIndices] = useState({
    cloze: 0,
    variations: 0,
    conversationalEcho: 0,
    dialogueIntonation: 0,
    janusComposer: 0,
  });
  const handleSelectExercise = useCallback((type: ExerciseType) => {
    setSelectedExerciseType(type);
    setPagePhase('doing-exercise');
  }, []);

  const handleSelectWarmup = useCallback((warmup: WarmupType) => {
    setSelectedWarmup(warmup);
    setPagePhase('warmup-exercise');
  }, []);

  const handleWarmupComplete = useCallback((score: number) => {
    console.log('[Warmup] Completado con score:', score);
    setPagePhase('exercise-menu');
  }, []);

  const handleSkipWarmup = useCallback(() => {
    setPagePhase('exercise-menu');
  }, []);

  const handleExerciseComplete = useCallback(() => {
    if (!selectedExerciseType || !exerciseData) return;

    // CLT: Actualizar carga germana al completar ejercicio
    updateGermaneLoad(5, 'exercise_completed');

    // Calcular recompensas post-cognitivas
    const performanceMetrics = {
      accuracy: 1.0, // 100% correct
      averageResponseTime: 30000,
      exercisesCompleted: exerciseIndices[selectedExerciseType] + 1,
      consecutiveCorrect: 1,
      cognitiveLoad: load,
      sessionDuration: 60, // 1 minuto en segundos
      focusModeUsed: focusModeActive,
    };

    const { rewards, feedback: sessionFeedback } = getSessionFeedback(performanceMetrics, false);

    setRewardData({ rewards, feedback: sessionFeedback });
    setShowRewards(true);

    // En modo desafío, avanzar automáticamente después de las recompensas
    if (mode === 'desafio') {
      const currentIndex = exerciseIndices[selectedExerciseType];
      const exercises = exerciseData[selectedExerciseType];

      if (exercises && currentIndex < exercises.length - 1) {
        // Avanzar después de cerrar recompensas
        setTimeout(() => {
          setExerciseIndices((prev) => ({
            ...prev,
            [selectedExerciseType]: prev[selectedExerciseType] + 1,
          }));
          setSelectedExerciseType(null);
        }, 3000);
      } else {
        // Completar este tipo de ejercicio, pasar al siguiente o terminar
        setTimeout(() => {
          setSelectedExerciseType(null);
        }, 3000);
      }
    } else {
      // En modo academia, volver al menú después de las recompensas
      setTimeout(() => {
        setSelectedExerciseType(null);
      }, 3000);
    }
  }, [selectedExerciseType, exerciseIndices, exerciseData, mode, load, updateGermaneLoad, focusModeActive]);

  const handleBack = useCallback(() => {
    if (selectedExerciseType && mode === 'academia') {
      setSelectedExerciseType(null);
    } else {
      router.push(`/learn/imported/${nodeId}/practice?subtopic=${subtopicId}`);
    }
  }, [selectedExerciseType, mode, router, nodeId, subtopicId]);


  if (!node || !subtopic || !exerciseData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">404</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Subtema no encontrado</p>
          <Link
            href={`/learn/imported/${nodeId}`}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Volver al nodo
          </Link>
        </div>
      </div>
    );
  }

  // Pantalla de warmup opcional
  if (pagePhase === 'warmup-choice') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => router.push(`/learn/imported/${nodeId}/practice?subtopic=${subtopicId}`)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <span className="text-xl">←</span>
            </button>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                {subtopic.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Calentamiento mental (opcional)
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 pt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¿Quieres calentar tu cerebro?
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Prepara tu mente con un ejercicio rápido antes de comenzar
            </p>
          </div>

          <div className="space-y-4">
            {/* Ritmo y Memoria */}
            <motion.button
              onClick={() => handleSelectWarmup('rhythm')}
              className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-left border-2 border-transparent hover:border-indigo-500 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🎵</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ritmo y Memoria</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Repite secuencias rítmicas
                  </p>
                </div>
              </div>
              <div className="pl-12 text-sm text-gray-500 dark:text-gray-400">
                ⏱️ 1-2 minutos • 🧠 Mejora atención auditiva
              </div>
            </motion.button>

            {/* Asociación Visual */}
            <motion.button
              onClick={() => handleSelectWarmup('visual')}
              className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-left border-2 border-transparent hover:border-indigo-500 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Asociación Visual</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Encuentra las parejas
                  </p>
                </div>
              </div>
              <div className="pl-12 text-sm text-gray-500 dark:text-gray-400">
                ⏱️ 1-2 minutos • 👁️ Activa visión espacial
              </div>
            </motion.button>

            {/* Saltar warmup */}
            <motion.button
              onClick={handleSkipWarmup}
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 text-center border-2 border-transparent hover:border-gray-400 dark:hover:border-gray-600 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">▶️</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Saltar al menú de ejercicios
                </span>
              </div>
            </motion.button>
          </div>
        </main>
      </div>
    );
  }

  // Ejecutar warmup seleccionado
  if (pagePhase === 'warmup-exercise' && selectedWarmup) {
    if (selectedWarmup === 'rhythm') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
              <button
                onClick={handleSkipWarmup}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <span className="text-xl">✕</span>
              </button>
              <div className="flex-1">
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  Ritmo y Memoria
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Calentamiento mental
                </p>
              </div>
            </div>
          </header>

          <main className="max-w-lg mx-auto px-4 pt-6">
            <RhythmSequenceWarmup
              config={RHYTHM_CONFIG}
              onComplete={handleWarmupComplete}
              onSkip={handleSkipWarmup}
            />
          </main>
        </div>
      );
    }

    if (selectedWarmup === 'visual') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
              <button
                onClick={handleSkipWarmup}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <span className="text-xl">✕</span>
              </button>
              <div className="flex-1">
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  Asociación Visual
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Calentamiento mental
                </p>
              </div>
            </div>
          </header>

          <main className="max-w-lg mx-auto px-4 pt-6">
            <VisualMatchWarmup
              config={VISUAL_CONFIG}
              onComplete={handleWarmupComplete}
              onSkip={handleSkipWarmup}
            />
          </main>
        </div>
      );
    }
  }

  // Menú de ejercicios (modo academia o inicio)
  if (!selectedExerciseType && pagePhase === 'exercise-menu') {
    const totalExercises =
      (exerciseData.cloze?.length || 0) +
      (exerciseData.variations?.length || 0) +
      (exerciseData.conversationalEcho?.length || 0) +
      (exerciseData.dialogueIntonation?.length || 0) +
      (exerciseData.janusComposer?.length || 0);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => router.push(`/learn/imported/${nodeId}/practice?subtopic=${subtopicId}`)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <span className="text-xl">←</span>
            </button>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                {subtopic.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {totalExercises} ejercicios disponibles
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 pt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Menú de Ejercicios
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {mode === 'academia'
                ? 'Elige el ejercicio que quieres practicar'
                : 'Completa todos los ejercicios en orden'}
            </p>
          </div>

          <div className="space-y-3">
            {/* Cloze Exercises */}
            {exerciseData.cloze && exerciseData.cloze.length > 0 && (
              <motion.button
                onClick={() => handleSelectExercise('cloze')}
                className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 text-left border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✏️</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Cloze</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {exerciseData.cloze.length} ejercicios
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </motion.button>
            )}

            {/* Variations Exercises */}
            {exerciseData.variations && exerciseData.variations.length > 0 && (
              <motion.button
                onClick={() => handleSelectExercise('variations')}
                className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 text-left border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Variations</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {exerciseData.variations.length} ejercicios
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </motion.button>
            )}

            {/* Conversational Echo */}
            {exerciseData.conversationalEcho && exerciseData.conversationalEcho.length > 0 && (
              <motion.button
                onClick={() => handleSelectExercise('conversationalEcho')}
                className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 text-left border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💬</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Echo Conversacional</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {exerciseData.conversationalEcho.length} ejercicios
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </motion.button>
            )}

            {/* Dialogue Intonation */}
            {exerciseData.dialogueIntonation && exerciseData.dialogueIntonation.length > 0 && (
              <motion.button
                onClick={() => handleSelectExercise('dialogueIntonation')}
                className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 text-left border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎤</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Entonación de Diálogo</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {exerciseData.dialogueIntonation.length} ejercicios
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </motion.button>
            )}

            {/* Janus Composer */}
            {exerciseData.janusComposer && exerciseData.janusComposer.length > 0 && (
              <motion.button
                onClick={() => handleSelectExercise('janusComposer')}
                className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 text-left border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧩</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Matriz Janus</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {exerciseData.janusComposer.length} ejercicios
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </motion.button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Renderizar ejercicio seleccionado
  if (!selectedExerciseType) {
    return null;
  }

  const currentIndex = exerciseIndices[selectedExerciseType];
  const exercises = exerciseData[selectedExerciseType];
  const currentExercise = exercises?.[currentIndex];

  // Debug: Log para ver qué está pasando
  console.log('[Exercises Page] Rendering exercise:', {
    selectedExerciseType,
    currentIndex,
    exercisesCount: exercises?.length || 0,
    currentExercise,
    exerciseDataKeys: exerciseData ? Object.keys(exerciseData) : null,
  });

  if (!currentExercise) {
    console.error('[Exercises Page] No current exercise found!', {
      selectedExerciseType,
      currentIndex,
      exercises,
      exerciseData,
    });
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No hay ejercicios disponibles para este tipo.
          </p>
          <button
            onClick={() => setSelectedExerciseType(null)}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  const renderExercise = () => {
    switch (selectedExerciseType) {
      case 'cloze':
        return (
          <ClozeExercise
            phrase={currentExercise as Phrase}
            onComplete={handleExerciseComplete}
          />
        );
      case 'variations':
        return (
          <VariationsExercise
            phrase={currentExercise as Phrase}
            onComplete={() => handleExerciseComplete()}
          />
        );
      case 'conversationalEcho':
        return (
          <ConversationalEchoExercise
            exercise={currentExercise as ConversationalEcho}
            onComplete={() => handleExerciseComplete()}
            {...(mode === 'academia' && { onSkip: () => setSelectedExerciseType(null) })}
            showHints={mode === 'academia'}
          />
        );
      case 'dialogueIntonation':
        return (
          <DialogueIntonationExercise
            exercise={currentExercise as DialogueIntonation}
            onComplete={() => handleExerciseComplete()}
            {...(mode === 'academia' && { onSkip: () => setSelectedExerciseType(null) })}
          />
        );
      case 'janusComposer':
        return (
          <JanusComposerExercise
            exercise={currentExercise as JanusComposer}
            onComplete={() => handleExerciseComplete()}
            {...(mode === 'academia' && { onSkip: () => setSelectedExerciseType(null) })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FocusMode
      isActive={focusModeActive}
      onToggle={setFocusModeActive}
      config={{
        showTimer: true,
        allowBreak: mode === 'academia',
        autoHideCursor: true,
        dimBackground: true,
      }}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <span className="text-xl">←</span>
            </button>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                {subtopic.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  mode === 'academia'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                }`}>
                  {mode === 'academia' ? '📚 Academia' : '⚡ Desafío'}
                </span>
                {exercises && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {currentIndex + 1}/{exercises.length}
                  </span>
                )}
              </div>
            </div>
            {/* Botón FocusMode */}
            <button
              onClick={() => setFocusModeActive(!focusModeActive)}
              className={`p-2 rounded-lg transition-all ${
                focusModeActive
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={focusModeActive ? 'Salir de Focus Mode' : 'Entrar en Focus Mode'}
            >
              <span className="text-xl">🎯</span>
            </button>
            {/* Botón SessionSummary */}
            <button
              onClick={() => setShowSessionSummary(true)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              title="Ver resumen de sesión"
            >
              <span className="text-xl">📊</span>
            </button>
          </div>
          {/* Indicador de carga cognitiva */}
          {showCognitiveLoad && (
            <div className="max-w-lg mx-auto px-4 pb-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 dark:text-gray-400">Carga cognitiva:</span>
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      loadStatus === 'overload'
                        ? 'bg-red-500'
                        : loadStatus === 'high'
                        ? 'bg-yellow-500'
                        : loadStatus === 'optimal'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${load.total}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className={`font-medium ${
                  loadStatus === 'overload'
                    ? 'text-red-500'
                    : loadStatus === 'high'
                    ? 'text-yellow-500'
                    : loadStatus === 'optimal'
                    ? 'text-green-500'
                    : 'text-blue-500'
                }`}>
                  {Math.round(load.total)}%
                </span>
              </div>
            </div>
          )}
        </header>

        <main className="max-w-lg mx-auto px-4 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedExerciseType}-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderExercise()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Post-cognitive rewards */}
      {showRewards && rewardData && (
        <PostCognitiveRewards
          rewards={rewardData.rewards}
          feedback={rewardData.feedback}
          onClose={() => setShowRewards(false)}
          onContinue={() => {
            setShowRewards(false);
            // Continuar con el siguiente flujo según el modo
          }}
          showDetails={true}
        />
      )}

      {/* Session summary */}
      {showSessionSummary && (
        <SessionSummary
          session={{
            startTime: sessionStartTime,
            exercisesCompleted: Object.values(exerciseIndices).reduce((a, b) => Math.max(a, b), 0) + 1,
            correctAnswers: 0,
            totalAttempts: 0,
            averageResponseTime: 30000, // 30s default
            peakLoad: sessionPeakLoad,
            loadHistory: sessionLoadHistory,
          }}
          cognitiveLoad={load}
          focusModeUsed={focusModeActive}
          focusDuration={focusModeStartTime ? (Date.now() - focusModeStartTime) / 1000 : undefined}
          onClose={() => setShowSessionSummary(false)}
        />
      )}
    </FocusMode>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
        </div>
      }
    >
      <ExercisesPageContent />
    </Suspense>
  );
}
