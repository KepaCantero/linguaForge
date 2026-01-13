'use client';

import { motion } from 'framer-motion';
import type { LessonMode } from '@/hooks/useExerciseFlow';

interface ExercisesHeaderProps {
  subtopicTitle: string;
  nodeId: string;
  currentMode: LessonMode;
  warmupCompleted: boolean;
  onBack: () => void;
  onStartWarmup: () => void;
  onModeChange: (mode: LessonMode) => void;
}

/**
 * Exercises Header Component
 * Displays the header with back button, title, and mode switching controls
 * Reduces complexity of main exercises page component
 */
export function ExercisesHeader({
  subtopicTitle,
  nodeId: _nodeId,
  currentMode,
  warmupCompleted,
  onBack,
  onStartWarmup,
  onModeChange,
}: ExercisesHeaderProps) {
  return (
    <header className="bg-lf-soft/80 border-b border-lf-muted/40 backdrop-blur-aaa sticky top-0 z-10">
      <div className="max-w-lg mx-auto px-4 py-3">
        {/* Top row: Back button + Title */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-full text-lf-muted hover:text-white transition-colors"
          >
            <span className="text-lg">←</span>
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-white line-clamp-1">
              {subtopicTitle}
            </h1>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center gap-2">
          {/* Calentamiento button */}
          <motion.button
            onClick={onStartWarmup}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all
              ${warmupCompleted
                ? 'bg-green-500/30 border-green-500/50 text-green-400'
                : 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={warmupCompleted ? '¡Calentamiento completado!' : 'Iniciar calentamiento mental'}
          >
            <span>{warmupCompleted ? '✅' : '🧠'}</span>
            <span>Calentamiento</span>
          </motion.button>

          {/* Academia button */}
          <motion.button
            onClick={() => onModeChange('academia')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              currentMode === 'academia'
                ? 'bg-green-500/30 border-green-500/50 text-green-400'
                : 'bg-lf-dark/40 border-lf-muted/40 text-lf-muted hover:bg-lf-dark/60 hover:text-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>📚</span>
            <span>Academia</span>
          </motion.button>

          {/* Ejercicios button */}
          <motion.button
            onClick={() => {/* Scroll to exercises or show menu */}}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-lf-primary/30 border border-lf-primary/50 text-lf-primary text-sm font-semibold hover:bg-lf-primary/40 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>✏️</span>
            <span>Ejercicios</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
