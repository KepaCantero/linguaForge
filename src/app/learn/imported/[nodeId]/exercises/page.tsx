'use client';

import { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import {
  generateClozeExercises,
  generateVariationsExercises,
  generateConversationalEchoExercises,
  generateDialogueIntonationExercises,
  generateJanusComposerExercises,
} from '@/services/generateExercisesFromPhrases';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCognitiveLoad, useCognitiveLoadStore } from '@/store/useCognitiveLoadStore';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getSessionFeedback } from '@/services/postCognitiveRewards';
import type {
  Phrase,
  ConversationalEcho,
  DialogueIntonation,
  JanusComposer,
} from '@/types';
import { WarmupChoice } from './components/WarmupChoice';
import { ExerciseMenu } from './components/ExerciseMenu';
import { ExerciseRenderer } from './components/ExerciseRenderer';
import { WarmupExercise } from './components/WarmupExercise';
import { ExerciseHeader } from './components/ExerciseHeader';

export type LessonMode = 'academia' | 'desafio';
export type ExerciseType = 'cloze' | 'variations' | 'conversationalEcho' | 'dialogueIntonation' | 'janusComposer' | null;
type PagePhase = 'warmup-choice' | 'warmup-exercise' | 'exercise-menu' | 'doing-exercise';
type WarmupType = 'rhythm' | 'visual' | null;

function ExercisesPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nodeId = params.nodeId as string;
  const subtopicId = searchParams.get('subtopic');
  const mode = (searchParams.get('mode') || 'academia') as LessonMode;

  const { nodes } = useImportedNodesStore();
  const [isLoaded, setIsLoaded] = useState(false);

  // Esperar a que Zustand persist cargue los datos de localStorage
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const node = nodes.find((n) => n.id === nodeId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const subtopic = useMemo(() =>
    node?.subtopics.find((s) => s.id === subtopicId),
    [node, subtopicId]
  );

  // Control de fase: menú → ejercicios (warmup eliminado)
  const [pagePhase, setPagePhase] = useState<PagePhase>('exercise-menu');
  const [selectedWarmup, setSelectedWarmup] = useState<WarmupType>(null);
  const [focusModeActive, setFocusModeActive] = useState(false);

  // Post-cognitive rewards
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showRewards, setShowRewards] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rewardData, setRewardData] = useState<ReturnType<typeof getSessionFeedback> | null>(null);

  // Session summary
  const [, setShowSessionSummary] = useState(false);
  const [focusModeStartTime, setFocusModeStartTime] = useState<number | null>(null);

  // Mode state (can be changed from within exercises)
  const [currentMode, setCurrentMode] = useState<LessonMode>(mode);

  // Update current mode when URL param changes
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const handleModeChange = useCallback((newMode: LessonMode) => {
    setCurrentMode(newMode);
  }, []);

  // CLT: Obtener estado de carga cognitiva
  const { load } = useCognitiveLoad();
  const { updateGermaneLoad } = useCognitiveLoadStore();
  // const showCognitiveLoad = true; // Siempre mostrar carga cognitiva

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

    return data as {
      cloze: Phrase[];
      variations: Phrase[];
      conversationalEcho: ConversationalEcho[];
      dialogueIntonation: DialogueIntonation[];
      janusComposer: JanusComposer[];
    } | null;
  }, [subtopic]);

  // Formatear objeto load para ExerciseHeader
  const headerLoad = useMemo(() => {
    const total = load.total;
    const status = total <= 40 ? 'low' as const : total <= 70 ? 'optimal' as const : total <= 85 ? 'high' as const : 'overload' as const;
    return {
      total,
      status
    };
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
    if (currentMode === 'desafio') {
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
  }, [selectedExerciseType, exerciseIndices, exerciseData, currentMode, load, updateGermaneLoad, focusModeActive]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBack = useCallback(() => {
    if (selectedExerciseType && currentMode === 'academia') {
      setSelectedExerciseType(null);
    } else {
      router.push(`/learn/imported/${nodeId}`);
    }
  }, [selectedExerciseType, currentMode, router, nodeId]);

  // Mostrar loading mientras Zustand hidrata los datos
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!node || !subtopic || !exerciseData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">404</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Subtema no encontrado</p>
          <div className="text-xs text-gray-500 mb-4">
            Debug: hasNode={!!node}, hasSubtopic={!!subtopic}, hasExerciseData={!!exerciseData}
          </div>
          <button
            onClick={() => router.push(`/learn/imported/${nodeId}`)}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Volver al nodo
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de warmup choice
  if (pagePhase === 'warmup-choice') {
    return (
      <WarmupChoice
        subtopicId={subtopicId}
        nodeId={nodeId}
        onSelectWarmup={handleSelectWarmup}
        onSkipWarmup={handleSkipWarmup}
      />
    );
  }

  // Ejecutar warmup seleccionado
  if (pagePhase === 'warmup-exercise' && selectedWarmup) {
    return (
      <WarmupExercise
        selectedWarmup={selectedWarmup}
        onComplete={handleWarmupComplete}
        onSkip={handleSkipWarmup}
      />
    );
  }

  // Menú de ejercicios (modo academia o inicio)
  if (!selectedExerciseType && pagePhase === 'exercise-menu') {
    return (
      <ExerciseMenu
        nodeId={nodeId}
        subtopicId={subtopicId}
        mode={currentMode}
        onModeChange={handleModeChange}
        exerciseData={exerciseData}
        onSelectExercise={handleSelectExercise}
      />
    );
  }

  // Renderizar ejercicio seleccionado
  if (selectedExerciseType) {
    return (
      <div className={focusModeActive ? 'fixed inset-0 cursor-none' : ''}>
        {/* Focus Mode Overlay */}
        {focusModeActive && (
          <div className="fixed inset-0 bg-black/70 pointer-events-none z-40" />
        )}

        <div className={focusModeActive ? 'relative z-50' : ''}>
          <ExerciseHeader
            nodeId={nodeId}
            subtopicId={subtopicId}
            selectedExerciseType={selectedExerciseType}
            exerciseIndices={exerciseIndices}
            exerciseData={exerciseData}
            mode={currentMode}
            onModeChange={handleModeChange}
            onStartWarmup={() => setPagePhase('warmup-choice')}
            load={headerLoad}
            focusModeActive={focusModeActive}
            setFocusModeActive={setFocusModeActive}
            setShowSessionSummary={setShowSessionSummary}
          />
          <ExerciseRenderer
            selectedExerciseType={selectedExerciseType}
            exerciseIndices={exerciseIndices}
            exerciseData={exerciseData}
            mode={currentMode}
            focusModeActive={focusModeActive}
            setFocusModeActive={setFocusModeActive}
            onComplete={handleExerciseComplete}
            onSkip={() => setSelectedExerciseType(null)}
          />
        </div>
      </div>
    );
  }

  return null;
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