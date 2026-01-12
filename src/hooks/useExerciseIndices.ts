import { useState } from 'react';

/**
 * Custom hook for exercise indices state
 * Manages current index for each exercise type
 */
export function useExerciseIndices() {
  const [exerciseIndices, setExerciseIndices] = useState<Record<string, number>>({
    cloze: 0,
    variations: 0,
    conversationalEcho: 0,
    dialogueIntonation: 0,
    janusComposer: 0,
  });

  return { exerciseIndices, setExerciseIndices };
}
