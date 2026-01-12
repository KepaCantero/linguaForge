import { useCallback } from 'react';
import type { ExerciseType, ExerciseData, LessonMode } from '@/hooks/useExerciseFlow';

interface UseExerciseProgressionOptions {
  selectedExerciseType: ExerciseType;
  exerciseIndices: Record<string, number>;
  exerciseData: ExerciseData | null;
  currentMode: LessonMode;
  setExerciseIndices: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setSelectedExerciseType: React.Dispatch<React.SetStateAction<ExerciseType>>;
}

/**
 * Custom hook for exercise progression logic
 * Handles auto-advancement in challenge mode and return to menu in academy mode
 */
export function useExerciseProgression({
  selectedExerciseType,
  exerciseIndices,
  exerciseData,
  currentMode,
  setExerciseIndices,
  setSelectedExerciseType,
}: UseExerciseProgressionOptions) {
  const handleExerciseComplete = useCallback(() => {
    if (!selectedExerciseType || !exerciseData) return;

    // En modo desafío, avanzar automáticamente
    if (currentMode === 'desafio') {
      const currentIndex = exerciseIndices[selectedExerciseType];
      const exercises = exerciseData[selectedExerciseType];

      if (exercises && currentIndex < exercises.length - 1) {
        setTimeout(() => {
          setExerciseIndices((prev) => ({
            ...prev,
            [selectedExerciseType]: prev[selectedExerciseType] + 1,
          }));
        }, 500);
      } else {
        setTimeout(() => {
          setSelectedExerciseType(null);
        }, 500);
      }
    } else {
      // En modo academia, volver al menú
      setTimeout(() => {
        setSelectedExerciseType(null);
      }, 500);
    }
  }, [selectedExerciseType, exerciseIndices, exerciseData, currentMode, setExerciseIndices, setSelectedExerciseType]);

  return { handleExerciseComplete };
}
