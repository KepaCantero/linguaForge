import { useState, useCallback } from 'react';
import type { ExerciseType } from '@/hooks/useExerciseFlow';

/**
 * Custom hook for exercise selection state
 * Manages selected exercise type and selection handler
 */
export function useExerciseSelection() {
  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseType>(null);

  const handleSelectExercise = useCallback((type: ExerciseType) => {
    setSelectedExerciseType(type);
  }, []);

  return {
    selectedExerciseType,
    setSelectedExerciseType,
    handleSelectExercise,
  };
}
