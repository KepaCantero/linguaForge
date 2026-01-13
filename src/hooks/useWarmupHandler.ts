import { useState, useCallback } from 'react';
import type { MissionType, Difficulty } from '@/schemas/warmup';

export interface WarmupHandlerState {
  showWarmupGate: boolean;
  warmupCompleted: boolean;
  warmupMissionType: MissionType;
  warmupDifficulty: Difficulty;
}

export interface WarmupHandlerActions {
  handleStartWarmup: () => void;
  handleWarmupComplete: (score: number) => void;
  handleWarmupSkip: () => void;
  handleWarmupDone: () => void;
}

const defaultMissionType: MissionType = 'mixed';
const defaultDifficulty: Difficulty = 'low';

/**
 * Custom hook for warmup functionality in exercises
 * Isolates warmup state and handler logic from exercise components
 * Reduces complexity of exercise pages
 */
export function useWarmupHandler(
  exerciseData: { cloze?: unknown[]; variations?: unknown[] } | null,
  _subtopicTitle: string
): WarmupHandlerState & WarmupHandlerActions {
  const [showWarmupGate, setShowWarmupGate] = useState(false);
  const [warmupCompleted, setWarmupCompleted] = useState(false);

  // Determinar tipo de warmup según ejercicios disponibles
  const warmupMissionType: MissionType = (() => {
    if (!exerciseData) return defaultMissionType;
    const hasCloze = (exerciseData.cloze?.length || 0) > 0;
    const hasVariations = (exerciseData.variations?.length || 0) > 0;
    if (hasCloze && !hasVariations) return 'grammar';
    if (!hasCloze && hasVariations) return 'grammar';
    return 'mixed';
  })();

  const warmupDifficulty: Difficulty = defaultDifficulty;

  const handleStartWarmup = useCallback(() => {
    setShowWarmupGate(true);
  }, []);

  const handleWarmupComplete = useCallback((_score: number) => {
    setWarmupCompleted(true);
  }, []);

  const handleWarmupSkip = useCallback(() => {
  }, []);

  const handleWarmupDone = useCallback(() => {
    setShowWarmupGate(false);
  }, []);

  return {
    showWarmupGate,
    warmupCompleted,
    warmupMissionType,
    warmupDifficulty,
    handleStartWarmup,
    handleWarmupComplete,
    handleWarmupSkip,
    handleWarmupDone,
  };
}
