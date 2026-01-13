'use client';

import { motion } from 'framer-motion';
import type { RewardCalculation } from '@/services/postCognitiveRewards';
import type { ExerciseType, LessonMode } from '@/hooks/useExerciseFlow';
import type {
  ConversationalEcho,
  DialogueIntonation,
  JanusComposer,
  Phrase,
} from '@/types';

export interface RewardsData {
  rewards: RewardCalculation;
  feedback: unknown;
}

interface ExerciseHeaderProps {
  _nodeId: string;
  _subtopicId: string | null;
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
  onModeChange: (mode: LessonMode) => void;
  onBack: () => void;
  onStartWarmup?: () => void;
  load: {
    total: number;
    status: 'low' | 'optimal' | 'high' | 'overload';
  };
  focusModeActive: boolean;
  setFocusModeActive: (active: boolean) => void;
  setShowSessionSummary: (show: boolean) => void;
}

// ============================================
// HELPER FUNCTIONS - Reduce component complexity
// ============================================

/**
 * Get color configuration for cognitive load status
 */
function getLoadStatusColors(status: 'low' | 'optimal' | 'high' | 'overload') {
  const colorMap = {
    overload: { bg: 'bg-semantic-error', text: 'text-semantic-error', barBg: 'bg-semantic-error' },
    high: { bg: 'bg-amber-500', text: 'text-amber-500', barBg: 'bg-amber-500' },
    optimal: { bg: 'bg-accent-500', text: 'text-accent-500', barBg: 'bg-accent-500' },
    low: { bg: 'bg-sky-500', text: 'text-sky-500', barBg: 'bg-sky-500' },
  };
  return colorMap[status];
}

export function ExerciseHeader({
  _nodeId,
  _subtopicId,
  selectedExerciseType,
  exerciseIndices,
  exerciseData,
  mode,
  onModeChange,
  onBack,
  onStartWarmup,
  load,
  focusModeActive,
  setFocusModeActive,
  setShowSessionSummary
}: ExerciseHeaderProps) {
  const loadTotal = load.total || 0;
  const loadStatus = load.status || 'optimal';
  const loadColors = getLoadStatusColors(loadStatus);

  const handleModeToggle = () => {
    const newMode: LessonMode = mode === 'academia' ? 'desafio' : 'academia';
    onModeChange(newMode);
  };

  return (
    <>
      {/* Exercise controls bar - sin header duplicado */}
      <div className="relative z-10 mb-4">
        <div className="relative overflow-hidden rounded-2xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/20 shadow-calm-lg">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-accent-500/10 via-sky-500/10 to-amber-500/10"
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <div className="relative px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              {/* Left: Back button + Exercise info */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={onBack}
                  className="p-2 rounded-lg bg-calm-bg-tertiary/30 border border-calm-warm-100/10 text-calm-text-muted hover:text-calm-text-primary hover:bg-calm-bg-tertiary/50 transition-all"
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title="Volver"
                >
                  <span className="text-lg">←</span>
                </motion.button>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-calm-text-primary text-sm">Ejercicio</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      mode === 'academia'
                        ? 'bg-accent-500/20 border-accent-500/30 text-accent-500'
                        : 'bg-sky-500/20 border-sky-500/30 text-calm-text-secondary'
                    }`}>
                      {mode === 'academia' ? '📚 Academia' : '⚡ Desafío'}
                    </span>
                  </div>
                  {selectedExerciseType && exerciseData && (
                    <div className="text-xs text-calm-text-muted mt-0.5">
                      Ejercicio {exerciseIndices[selectedExerciseType] + 1} de {exerciseData[selectedExerciseType]?.length || 0}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Action buttons */}
              <div className="flex items-center gap-2">
                {/* Warmup button */}
                {onStartWarmup && (
                  <motion.button
                    onClick={onStartWarmup}
                    className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Calentamiento Mental"
                  >
                    <span className="text-lg">🔥</span>
                  </motion.button>
                )}

                {/* Mode Toggle button */}
                <motion.button
                  onClick={handleModeToggle}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    mode === 'academia'
                      ? 'bg-accent-500/20 border-accent-500/30 text-accent-400'
                      : 'bg-sky-500/20 border-sky-500/30 text-sky-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={mode === 'academia' ? 'Cambiar a Desafío' : 'Cambiar a Academia'}
                >
                  <span className="text-lg">{mode === 'academia' ? '📚' : '⚡'}</span>
                </motion.button>

                {/* Focus Mode button */}
                <motion.button
                  onClick={() => setFocusModeActive(!focusModeActive)}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    focusModeActive
                      ? 'bg-accent-500 border-accent-500 text-calm-text-primary shadow-calm-md'
                      : 'bg-calm-bg-tertiary/30 border-calm-warm-100/10 text-calm-text-muted hover:text-calm-text-primary hover:bg-calm-bg-tertiary/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={focusModeActive ? 'Salir de Focus Mode' : 'Entrar en Focus Mode'}
                >
                  <span className="text-lg">🎯</span>
                </motion.button>

                {/* Session Summary button */}
                <motion.button
                  onClick={() => setShowSessionSummary(true)}
                  className="p-2.5 rounded-2xl bg-calm-bg-tertiary/30 border border-calm-warm-100/10 text-calm-text-muted hover:text-calm-text-primary hover:bg-calm-bg-tertiary/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Ver resumen de sesión"
                >
                  <span className="text-lg">📊</span>
                </motion.button>
              </div>
            </div>

            {/* Cognitive load indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-calm-text-muted font-medium">Carga cognitiva:</span>
              <div className="flex-1 h-2 bg-calm-bg-tertiary/50 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className={`h-full rounded-full ${loadColors.barBg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${loadTotal}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <motion.span
                className={`font-bold ${loadColors.text}`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {Math.round(loadTotal)}%
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
