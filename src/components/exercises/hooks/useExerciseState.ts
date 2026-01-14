'use client';

import { useState, useCallback, useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export interface ExerciseStateOptions {
  initialPhase?: string;
  totalSteps?: number;
}

export interface ExerciseStateReturn<TPhase extends string = string> {
  phase: TPhase;
  setPhase: (phase: TPhase) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  progress: number;
  isComplete: boolean;
  isLastStep: boolean;
  reset: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
}

// ============================================
// HOOK
// ============================================

/**
 * Shared hook for managing exercise state across different exercise types.
 * Handles phase transitions, current step/index tracking, and progress calculation.
 *
 * @example
 * ```ts
 * const { phase, setPhase, currentIndex, progress, goToNext } = useExerciseState({
 *   initialPhase: 'preview',
 *   totalSteps: 5,
 * });
 * ```
 */
export function useExerciseState<TPhase extends string = string>(
  options: ExerciseStateOptions = {}
): ExerciseStateReturn<TPhase> {
  const { initialPhase, totalSteps = 0 } = options;

  const [phase, setPhase] = useState<TPhase>(initialPhase as TPhase);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculate progress percentage
  const progress = useMemo(() => {
    if (totalSteps === 0) return 0;
    return (currentIndex / totalSteps) * 100;
  }, [currentIndex, totalSteps]);

  // Check if exercise is complete
  const isComplete = useMemo(() => {
    return totalSteps > 0 && currentIndex >= totalSteps - 1;
  }, [currentIndex, totalSteps]);

  // Check if current step is the last one
  const isLastStep = useMemo(() => {
    return totalSteps > 0 && currentIndex === totalSteps - 1;
  }, [currentIndex, totalSteps]);

  // Reset to initial state
  const reset = useCallback(() => {
    setPhase(initialPhase as TPhase);
    setCurrentIndex(0);
  }, [initialPhase]);

  // Go to next step
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  // Go to previous step
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  return {
    phase,
    setPhase,
    currentIndex,
    setCurrentIndex,
    progress,
    isComplete,
    isLastStep,
    reset,
    goToNext,
    goToPrevious,
  };
}

// ============================================
// SUB-HOOKS FOR SPECIFIC USE CASES
// ============================================

/**
 * Hook for managing simple phase-based exercises without steps.
 */
export function useExercisePhase<TPhase extends string = string>(
  initialPhase: TPhase
) {
  const [phase, setPhase] = useState<TPhase>(initialPhase);

  return {
    phase,
    setPhase,
    isPhase: useCallback((checkPhase: TPhase) => phase === checkPhase, [phase]),
    reset: useCallback(() => setPhase(initialPhase), [initialPhase]),
  };
}

/**
 * Hook for managing multi-step exercises (like dialogues, card sessions).
 */
export function useExerciseSteps(totalSteps: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const progress = useMemo(() => {
    if (totalSteps === 0) return 0;
    return (currentIndex / totalSteps) * 100;
  }, [currentIndex, totalSteps]);

  const markStepComplete = useCallback((stepIndex: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(stepIndex);
      return newSet;
    });
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    setCurrentIndex(Math.max(0, Math.min(stepIndex, totalSteps - 1)));
  }, [totalSteps]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setCompletedSteps(new Set());
  }, []);

  return {
    currentIndex,
    setCurrentIndex,
    completedSteps,
    markStepComplete,
    progress,
    goToNext,
    goToPrevious,
    goToStep,
    reset,
    isFirstStep: currentIndex === 0,
    isLastStep: totalSteps > 0 && currentIndex === totalSteps - 1,
    isComplete: totalSteps > 0 && currentIndex >= totalSteps - 1,
  };
}
