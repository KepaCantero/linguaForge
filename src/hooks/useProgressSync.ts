import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTreeProgressStore } from '@/store/useTreeProgressStore';
import {
  saveExerciseCompletion,
  completeLesson,
  syncProgressToSupabase,
  updateStreak,
  getLessonProgress,
} from '@/lib/services/progressService';

/**
 * Hook para sincronizar progreso local con Supabase
 * Se ejecuta automáticamente cuando hay cambios en el progreso
 */
export function useProgressSync() {
  const { user } = useAuth();
  const { treeProgress } = useTreeProgressStore();

  // Sincronizar progreso al montar si hay usuario
  useEffect(() => {
    if (!user) return;

    const syncAllProgress = async () => {
      for (const [, progress] of Object.entries(treeProgress)) {
        await syncProgressToSupabase(user.id, progress);
      }
    };

    syncAllProgress();
  }, [user, treeProgress]);

  /**
   * Guarda el progreso de un ejercicio completado
   */
  const saveExercise = useCallback(
    async (
      lessonId: string,
      exerciseId: string,
      isCorrect: boolean,
      worldId?: string
    ) => {
      if (!user) {
        // Sin usuario, solo guardar localmente (ya se hace en el store)
        return;
      }

      await saveExerciseCompletion(user.id, lessonId, exerciseId, isCorrect, worldId);
    },
    [user]
  );

  /**
   * Marca una lección como completada
   */
  const completeLessonWithSync = useCallback(
    async (lessonId: string, xpEarned: number) => {
      if (!user) {
        // Sin usuario, solo guardar localmente
        return;
      }

      // Guardar en Supabase
      await completeLesson(user.id, lessonId, xpEarned);

      // Actualizar streak
      await updateStreak(user.id);
    },
    [user]
  );

  /**
   * Carga el progreso de una lección desde Supabase
   */
  const loadLessonProgress = useCallback(
    async (lessonId: string) => {
      if (!user) return null;

      const { data } = await getLessonProgress(user.id, lessonId);
      return data;
    },
    [user]
  );

  return {
    saveExercise,
    completeLessonWithSync,
    loadLessonProgress,
    isAuthenticated: !!user,
  };
}

