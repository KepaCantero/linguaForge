'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { RewardCalculation } from '@/services/postCognitiveRewards';
import type { LessonMode, ExerciseType } from '../page';
import type {
  Phrase,
  ConversationalEcho,
  DialogueIntonation,
  JanusComposer
} from '@/types';

export interface RewardsData {
  rewards: RewardCalculation;
  feedback: unknown;
}

interface ExerciseHeaderProps {
  nodeId: string;
  subtopicId: string | null;
  selectedExerciseType: ExerciseType;
  exerciseIndices: Record<string, number>;
  exerciseData: {
    cloze: Phrase[];
    variations: Phrase[];
    conversationalEcho: ConversationalEcho[];
    dialogueIntonation: DialogueIntonation[];
    janusComposer: JanusComposer[];
  };
  mode: LessonMode;
  load: {
    total: number;
    status: 'low' | 'optimal' | 'high' | 'overload';
  };
  focusModeActive: boolean;
  setFocusModeActive: (active: boolean) => void;
  setShowSessionSummary: (show: boolean) => void;
}

export function ExerciseHeader({
  nodeId,
  subtopicId,
  selectedExerciseType,
  exerciseIndices,
  exerciseData,
  mode,
  load,
  focusModeActive,
  setFocusModeActive,
  setShowSessionSummary
}: ExerciseHeaderProps) {
  const router = useRouter();
  const loadTotal = load.total || 0;
  const loadStatus = load.status || 'optimal';

  const handleBack = () => {
    if (selectedExerciseType && mode === 'academia') {
      // En modo academia, volver al menú
      return;
    }
    router.push(`/learn/imported/${nodeId}/practice?subtopic=${subtopicId}`);
  };

  
  return (
    <>
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
              Ejercicio
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                mode === 'academia'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
              }`}>
                {mode === 'academia' ? '📚 Academia' : '⚡ Desafío'}
              </span>
              {selectedExerciseType && exerciseData && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {exerciseIndices[selectedExerciseType] + 1}/
                  {exerciseData[selectedExerciseType]?.length || 0}
                </span>
              )}
            </div>
          </div>
          {/* Botón FocusMode */}
          <motion.button
            onClick={() => setFocusModeActive(!focusModeActive)}
            className={`p-2 rounded-lg transition-all ${
              focusModeActive
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={focusModeActive ? 'Salir de Focus Mode' : 'Entrar en Focus Mode'}
          >
            <span className="text-xl">🎯</span>
          </motion.button>
          {/* Botón SessionSummary */}
          <motion.button
            onClick={() => setShowSessionSummary(true)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Ver resumen de sesión"
          >
            <span className="text-xl">📊</span>
          </motion.button>
        </div>
        {/* Indicador de carga cognitiva */}
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
                animate={{ width: `${loadTotal}%` }}
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
              {Math.round(loadTotal)}%
            </span>
          </div>
        </div>
      </header>

      {/* Post-cognitive rewards */}
      {/* TODO: Implement rewards component */}
      {/* Session summary */}
      {/* TODO: Implement session summary component */}
    </>
  );
}