'use client';

import { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import {
  generateClozeExercises,
  generateVariationsExercises,
  generateConversationalEchoExercises,
  generateDialogueIntonationExercises,
  generateJanusComposerExercises,
} from '@/services/generateExercisesFromPhrases';
import type {
  Phrase,
  ConversationalEcho,
  DialogueIntonation,
  JanusComposer,
} from '@/types';
import { ExerciseRenderer } from './components/ExerciseRenderer';
import { ExerciseHeader } from './components/ExerciseHeader';

export type LessonMode = 'academia' | 'desafio';
export type ExerciseType = 'cloze' | 'variations' | 'conversationalEcho' | 'dialogueIntonation' | 'janusComposer' | null;

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

  const node = nodes.find((n) => n.id === nodeId);
  const subtopic = useMemo(() =>
    node?.subtopics.find((s) => s.id === subtopicId),
    [node, subtopicId]
  );

  // Mode state (can be changed from within exercises)
  const [currentMode, setCurrentMode] = useState<LessonMode>(mode);

  // Update current mode when URL param changes
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const handleModeChange = useCallback((newMode: LessonMode) => {
    setCurrentMode(newMode);
  }, []);

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

  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseType>(null);
  const [exerciseIndices, setExerciseIndices] = useState({
    cloze: 0,
    variations: 0,
    conversationalEcho: 0,
    dialogueIntonation: 0,
    janusComposer: 0,
  });
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [, setShowSessionSummary] = useState(false);
  const [focusModeStartTime, setFocusModeStartTime] = useState<number | null>(null);

  // Track focus mode duration
  useEffect(() => {
    if (focusModeActive && !focusModeStartTime) {
      setFocusModeStartTime(Date.now());
    } else if (!focusModeActive && focusModeStartTime) {
      setFocusModeStartTime(null);
    }
  }, [focusModeActive, focusModeStartTime]);

  const handleSelectExercise = useCallback((type: ExerciseType) => {
    setSelectedExerciseType(type);
  }, []);

  const handleExerciseComplete = useCallback(() => {
    if (!selectedExerciseType || !exerciseData) return;

    // En modo desafío, avanzar automáticamente
    if (currentMode === 'desafio') {
      const currentIndex = exerciseIndices[selectedExerciseType];
      const exercises = exerciseData[selectedExerciseType];

      if (exercises && currentIndex < exercises.length - 1) {
        setTimeout(() => {
          setExerciseIndices((prev) => ({
            ...prev,
            [selectedExerciseType]: prev[selectedExerciseType] + 1,
          }));
        }, 500);
      } else {
        setTimeout(() => {
          setSelectedExerciseType(null);
        }, 500);
      }
    } else {
      // En modo academia, volver al menú
      setTimeout(() => {
        setSelectedExerciseType(null);
      }, 500);
    }
  }, [selectedExerciseType, exerciseIndices, exerciseData, currentMode]);

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
      <div className="min-h-screen bg-lf-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-lf-primary border-t-transparent" />
      </div>
    );
  }

  if (!node || !subtopic || !exerciseData) {
    return (
      <div className="min-h-screen bg-lf-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">404</div>
          <p className="text-lf-muted mb-4">Subtema no encontrado</p>
          <button
            onClick={() => router.push(`/learn/imported/${nodeId}`)}
            className="text-lf-primary hover:text-lf-primary/80"
          >
            Volver al nodo
          </button>
        </div>
      </div>
    );
  }

  // Render exercise header and content when exercise is selected
  if (selectedExerciseType) {
    return (
      <div className={focusModeActive ? 'fixed inset-0 cursor-none' : ''}>
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
            onBack={handleBack}
            onStartWarmup={() => {}}
            load={{ total: 50, status: 'optimal' }}
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

  // Exercise Menu - AAA Design (inline, no separate component)
  const exercises = [
    {
      type: 'cloze' as ExerciseType,
      icon: '✏️',
      title: 'Cloze',
      description: 'Completa las frases con la palabra correcta',
      count: exerciseData.cloze?.length || 0,
    },
    {
      type: 'variations' as ExerciseType,
      icon: '🔄',
      title: 'Variaciones',
      description: 'Aprende diferentes formas de decir lo mismo',
      count: exerciseData.variations?.length || 0,
    },
    {
      type: 'conversationalEcho' as ExerciseType,
      icon: '💬',
      title: 'Echo Conversacional',
      description: 'Responde en contexto conversacional',
      count: exerciseData.conversationalEcho?.length || 0,
    },
    {
      type: 'dialogueIntonation' as ExerciseType,
      icon: '🎤',
      title: 'Entonación de Diálogo',
      description: 'Practica el ritmo y entonación',
      count: exerciseData.dialogueIntonation?.length || 0,
    },
    {
      type: 'janusComposer' as ExerciseType,
      icon: '🧩',
      title: 'Matriz Janus',
      description: 'Construye frases combinando columnas',
      count: exerciseData.janusComposer?.length || 0,
    },
  ].filter(ex => ex.count > 0);

  const totalExercises = exercises.reduce((sum, ex) => sum + ex.count, 0);

  return (
    <div className="min-h-screen bg-lf-dark pb-20">
      {/* Header */}
      <header className="bg-glass-surface dark:bg-lf-soft/50 border-b border-lf-muted/20 backdrop-blur-aaa sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push(`/learn/imported/${nodeId}`)}
            className="flex items-center justify-center w-10 h-10 rounded-full text-lf-muted hover:text-white transition-colors"
          >
            <span className="text-xl">←</span>
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-white line-clamp-1">
              {subtopic.title}
            </h1>
            <p className="text-xs text-lf-muted/70">
              {totalExercises} ejercicios disponibles
            </p>
          </div>
        </div>
      </header>

      {/* Exercise Menu - AAA inline design */}
      <main className="max-w-lg mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            Ejercicios
          </h2>
          <p className="text-lf-muted">
            Elige el tipo de ejercicio que quieres practicar
          </p>
        </motion.div>

        <div className="space-y-4">
          {/* Exercise items - AAA list design */}
          {exercises.map((exercise, index) => (
            <motion.button
              key={exercise.type}
              onClick={() => handleSelectExercise(exercise.type)}
              className="relative w-full overflow-hidden group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-lf-primary/20 via-lf-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              />

              {/* Content */}
              <div className="relative flex items-center justify-between p-4 border-b border-lf-muted/20 hover:border-lf-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  {/* Icon with animated background */}
                  <div className="relative">
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-lf-primary/20"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    >
                      {exercise.icon}
                    </motion.div>
                  </div>

                  {/* Title and info */}
                  <div className="text-left">
                    <h3 className="font-semibold text-white">
                      {exercise.title}
                    </h3>
                    <p className="text-sm text-lf-muted/70">
                      {exercise.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-lf-primary bg-lf-primary/10 px-2 py-0.5 rounded-md">
                        {exercise.count} ejercicio{exercise.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <motion.span
                  className="text-lf-muted/50 text-xl group-hover:text-lf-primary group-hover:translate-x-1 transition-all"
                  animate={{
                    x: [0, 4, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.1,
                  }}
                >
                  →
                </motion.span>
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-lf-dark flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-lf-primary border-t-transparent" />
        </div>
      }
    >
      <ExercisesPageContent />
    </Suspense>
  );
}
