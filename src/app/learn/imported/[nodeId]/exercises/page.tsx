'use client';

import { useState, useMemo, Suspense, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { ClozeExercise } from '@/components/exercises/ClozeExercise';
import { VariationsExercise } from '@/components/exercises/VariationsExercise';
import { ConversationalEchoExercise } from '@/components/exercises/ConversationalEchoExercise';
import { DialogueIntonationExercise } from '@/components/exercises/DialogueIntonationExercise';
import { JanusComposerExercise } from '@/components/exercises/JanusComposerExercise';
import {
  generateClozeExercises,
  generateVariationsExercises,
  generateConversationalEchoExercises,
  generateDialogueIntonationExercises,
  generateJanusComposerExercises,
} from '@/services/generateExercisesFromPhrases';
import type { Phrase, ConversationalEcho, DialogueIntonation, JanusComposer } from '@/types';

type LessonMode = 'academia' | 'desafio';
type ExerciseType = 'cloze' | 'variations' | 'conversationalEcho' | 'dialogueIntonation' | 'janusComposer' | null;

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
  }, []);

  const handleExerciseComplete = useCallback(() => {
    if (!selectedExerciseType || !exerciseData) return;

    // En modo desafío, avanzar automáticamente
    if (mode === 'desafio') {
      const currentIndex = exerciseIndices[selectedExerciseType];
      const exercises = exerciseData[selectedExerciseType];

      if (exercises && currentIndex < exercises.length - 1) {
        setExerciseIndices((prev) => ({
          ...prev,
          [selectedExerciseType]: prev[selectedExerciseType] + 1,
        }));
      } else {
        // Completar este tipo de ejercicio, pasar al siguiente o terminar
        setSelectedExerciseType(null);
      }
    } else {
      // En modo academia, volver al menú
      setSelectedExerciseType(null);
    }
  }, [selectedExerciseType, exerciseIndices, exerciseData, mode]);

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

  // Menú de ejercicios (modo academia o inicio)
  if (!selectedExerciseType) {
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
  const currentIndex = exerciseIndices[selectedExerciseType];
  const exercises = exerciseData[selectedExerciseType];
  const currentExercise = exercises?.[currentIndex];

  if (!currentExercise) {
    return null;
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
            onSkip={mode === 'academia' ? () => setSelectedExerciseType(null) : undefined}
            showHints={mode === 'academia'}
          />
        );
      case 'dialogueIntonation':
        return (
          <DialogueIntonationExercise
            exercise={currentExercise as DialogueIntonation}
            onComplete={() => handleExerciseComplete()}
            onSkip={mode === 'academia' ? () => setSelectedExerciseType(null) : undefined}
          />
        );
      case 'janusComposer':
        return (
          <JanusComposerExercise
            exercise={currentExercise as JanusComposer}
            onComplete={() => handleExerciseComplete()}
            onSkip={mode === 'academia' ? () => setSelectedExerciseType(null) : undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
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
        </div>
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
