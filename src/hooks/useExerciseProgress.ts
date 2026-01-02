/**
 * Custom hook for managing exercise completion and progress tracking
 * Tracks completed exercises and calculates progress statistics
 */

import { useState, useCallback, useMemo } from 'react';
import type { LessonContent } from '@/types';

interface UseExerciseProgressReturn {
  completedExercises: Set<string>;
  markExerciseComplete: (exerciseId: string) => void;
  isExerciseComplete: (exerciseId: string) => boolean;
  getProgressStats: (lessonContent: LessonContent | null) => {
    totalExercises: number;
    completedCount: number;
    progressPercent: number;
    phrasesCompleted: number;
    totalPhrasesExercises: number;
  };
}

export function useExerciseProgress(): UseExerciseProgressReturn {
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const markExerciseComplete = useCallback((exerciseId: string) => {
    setCompletedExercises((prev) => new Set(prev).add(exerciseId));
  }, []);

  const isExerciseComplete = useCallback((exerciseId: string) => {
    return completedExercises.has(exerciseId);
  }, [completedExercises]);

  const getProgressStats = useCallback((lessonContent: LessonContent | null) => {
    if (!lessonContent) {
      return {
        totalExercises: 0,
        completedCount: 0,
        progressPercent: 0,
        phrasesCompleted: 0,
        totalPhrasesExercises: 0,
      };
    }

    const conversationalBlocks = lessonContent.conversationalBlocks || [];
    const phrases = lessonContent.phrases || [];
    const totalPhrases = conversationalBlocks.reduce((acc, block) => acc + block.phrases.length, 0) + phrases.length;
    const totalPhrasesExercises = totalPhrases * 2; // Cloze + Variations

    const vocabularyCount = lessonContent.coreExercises?.vocabulary?.length || 0;
    const pragmaCount = lessonContent.coreExercises?.pragmaStrike?.length || 0;
    const shardCount = lessonContent.coreExercises?.shardDetection?.length || 0;
    const echoStreamCount = lessonContent.coreExercises?.echoStream?.length || 0;
    const glyphWeavingCount = lessonContent.coreExercises?.glyphWeaving?.length || 0;
    const resonancePathCount = lessonContent.coreExercises?.resonancePath?.length || 0;

    const totalCoreExercises = 
      vocabularyCount + 
      pragmaCount + 
      shardCount + 
      echoStreamCount + 
      glyphWeavingCount + 
      resonancePathCount;

    const totalExercises = totalPhrasesExercises + totalCoreExercises;
    const completedCount = completedExercises.size;
    const progressPercent = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

    const phrasesCompleted = Array.from(completedExercises).filter(
      (id) => id.startsWith('phrase-')
    ).length;

    return {
      totalExercises,
      completedCount,
      progressPercent,
      phrasesCompleted,
      totalPhrasesExercises,
    };
  }, [completedExercises]);

  return useMemo(() => ({
    completedExercises,
    markExerciseComplete,
    isExerciseComplete,
    getProgressStats,
  }), [completedExercises, markExerciseComplete, isExerciseComplete, getProgressStats]);
}

