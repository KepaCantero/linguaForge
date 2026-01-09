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

// ============================================
// HELPER FUNCTIONS - Reduce component complexity
// ============================================

/**
 * Get color configuration for cognitive load status
 */
function getLoadStatusColors(status: 'low' | 'optimal' | 'high' | 'overload') {
  const colorMap = {
    overload: { bg: 'bg-red-500', text: 'text-red-500', barBg: 'bg-red-500' },
    high: { bg: 'bg-yellow-500', text: 'text-yellow-500', barBg: 'bg-yellow-500' },
    optimal: { bg: 'bg-green-500', text: 'text-green-500', barBg: 'bg-green-500' },
    low: { bg: 'bg-blue-500', text: 'text-blue-500', barBg: 'bg-blue-500' },
  };
  return colorMap[status];
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
  const loadColors = getLoadStatusColors(loadStatus);

  const handleBack = () => {
    if (selectedExerciseType && mode === 'academia') {
      // En modo academia, volver al menú (dejar que el componente padre maneje esto)
      router.back();
      return;
    }
    router.push(`/learn/imported/${nodeId}/practice?subtopic=${subtopicId}`);
  };

  return (
    <>
      {/* Exercise controls bar - sin header duplicado */}
      <div className="relative z-10 mb-4">
        <div className="relative overflow-hidden rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 shadow-glass-xl">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-lf-primary/10 via-lf-secondary/10 to-lf-accent/10"
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
                  onClick={handleBack}
                  className="p-2 rounded-lg bg-lf-dark/30 border border-white/10 text-lf-muted hover:text-white hover:bg-lf-dark/50 transition-all"
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title="Volver"
                >
                  <span className="text-lg">←</span>
                </motion.button>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-white text-sm">Ejercicio</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      mode === 'academia'
                        ? 'bg-lf-success/20 border-lf-success/30 text-lf-success'
                        : 'bg-lf-secondary/20 border-lf-secondary/30 text-lf-secondary'
                    }`}>
                      {mode === 'academia' ? '📚 Academia' : '⚡ Desafío'}
                    </span>
                  </div>
                  {selectedExerciseType && exerciseData && (
                    <div className="text-xs text-lf-muted mt-0.5">
                      Ejercicio {exerciseIndices[selectedExerciseType] + 1} de {exerciseData[selectedExerciseType]?.length || 0}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Action buttons */}
              <div className="flex items-center gap-2">
                {/* Focus Mode button */}
                <motion.button
                  onClick={() => setFocusModeActive(!focusModeActive)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    focusModeActive
                      ? 'bg-lf-primary border-lf-primary text-white shadow-glow-accent'
                      : 'bg-lf-dark/30 border-white/10 text-lf-muted hover:text-white hover:bg-lf-dark/50'
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
                  className="p-2.5 rounded-xl bg-lf-dark/30 border border-white/10 text-lf-muted hover:text-white hover:bg-lf-dark/50 transition-all"
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
              <span className="text-lf-muted font-medium">Carga cognitiva:</span>
              <div className="flex-1 h-2 bg-lf-dark/50 rounded-full overflow-hidden shadow-inner">
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
