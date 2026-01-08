'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { LessonMode, ExerciseType } from '../page';
import type { Phrase, ConversationalEcho, DialogueIntonation, JanusComposer } from '@/types';

// Los tipos son en realidad arrays de objetos específicos de cada ejercicio
type ClozeData = Phrase[];
type EchoData = ConversationalEcho[];
type IntonationData = DialogueIntonation[];
type JanusData = JanusComposer[];
type VariationsData = Phrase[];

interface ExerciseMenuProps {
  nodeId: string;
  subtopicId: string | null;
  mode: LessonMode;
  exerciseData: {
    cloze: ClozeData;
    variations: VariationsData;
    conversationalEcho: EchoData;
    dialogueIntonation: IntonationData;
    janusComposer: JanusData;
  };
  onSelectExercise: (type: ExerciseType) => void;
}

export function ExerciseMenu({
  nodeId,
  subtopicId,
  mode,
  exerciseData,
  onSelectExercise
}: ExerciseMenuProps) {
  const router = useRouter();

  const totalExercises =
    (exerciseData.cloze?.length || 0) +
    (exerciseData.variations?.length || 0) +
    (exerciseData.conversationalEcho?.length || 0) +
    (exerciseData.dialogueIntonation?.length || 0) +
    (exerciseData.janusComposer?.length || 0);

  const exercises = [
    {
      type: 'cloze',
      icon: '✏️',
      title: 'Cloze',
      description: 'Rellena los espacios vacíos',
      length: exerciseData.cloze?.length || 0
    },
    {
      type: 'variations',
      icon: '🔄',
      title: 'Variations',
      description: 'Encuentra las variaciones correctas',
      length: exerciseData.variations?.length || 0
    },
    {
      type: 'conversationalEcho',
      icon: '💬',
      title: 'Echo Conversacional',
      description: 'Repete y responde en conversaciones',
      length: exerciseData.conversationalEcho?.length || 0
    },
    {
      type: 'dialogueIntonation',
      icon: '🎤',
      title: 'Entonación de Diálogo',
      description: 'Practica la entonación en diálogos',
      length: exerciseData.dialogueIntonation?.length || 0
    },
    {
      type: 'janusComposer',
      icon: '🧩',
      title: 'Matriz Janus',
      description: 'Combina palabras en estructuras',
      length: exerciseData.janusComposer?.length || 0
    }
  ].filter(ex => ex.length > 0);

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
              {exercises[0]?.title} {/* Placeholder, debería venir de props */}
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
          {exercises.map((exercise) => (
            <motion.button
              key={exercise.type}
              onClick={() => onSelectExercise(exercise.type as ExerciseType)}
              className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 text-left border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{exercise.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{exercise.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {exercise.length} ejercicios
                    </p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}