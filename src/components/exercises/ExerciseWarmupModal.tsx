'use client';

import { AnimatePresence } from 'framer-motion';
import { WarmupGate } from '@/components/warmups';
import type { MissionType, Difficulty } from '@/schemas/warmup';

interface ExerciseWarmupModalProps {
  show: boolean;
  lessonId: string | null;
  missionType: MissionType;
  missionTitle: string;
  difficulty: Difficulty;
  onWarmupComplete: (score: number) => void;
  onWarmupSkip: () => void;
  onStartMission: () => void;
}

/**
 * Exercise Warmup Modal Component
 * Wraps WarmupGate with AnimatePresence for smooth transitions
 * Reduces complexity of main exercises page component
 */
export function ExerciseWarmupModal({
  show,
  lessonId,
  missionType,
  missionTitle,
  difficulty,
  onWarmupComplete,
  onWarmupSkip,
  onStartMission,
}: ExerciseWarmupModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <WarmupGate
          lessonId={lessonId || 'exercises'}
          missionType={missionType}
          missionTitle={missionTitle}
          difficulty={difficulty}
          userLevel={1}
          onWarmupComplete={onWarmupComplete}
          onWarmupSkip={onWarmupSkip}
          onStartMission={onStartMission}
          startButtonText="Comenzar Ejercicios"
        />
      )}
    </AnimatePresence>
  );
}
