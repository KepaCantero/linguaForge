import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface LessonProgress {
  id?: string;
  user_id: string;
  lesson_id: string;
  world_id?: string;
  completed_exercises: string[];
  correct_answers: number;
  total_attempts: number;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  last_activity_at?: string;
  xp_earned: number;
}

export interface UserStats {
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  coins: number;
  gems: number;
  lessons_completed: number;
  exercises_completed: number;
  total_time_minutes: number;
}

/**
 * Guarda el progreso de un ejercicio completado
 */
export async function saveExerciseCompletion(
  userId: string,
  lessonId: string,
  exerciseId: string,
  isCorrect: boolean,
  worldId?: string
): Promise<{ error: Error | null }> {
  // Skip if Supabase is not configured
  if (!supabase) {
    return { error: null };
  }

  try {
    // Obtener o crear progreso de lección
    const { data: existingProgress, error: fetchError } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    let progress: LessonProgress;

    if (fetchError && fetchError.code === 'PGRST116') {
      progress = createNewProgress(userId, lessonId, exerciseId, isCorrect, worldId);
    } else if (fetchError) {
      throw fetchError;
    } else {
      progress = updateExistingProgress(existingProgress, exerciseId, isCorrect);
    }

    // Guardar en Supabase
    const { error } = await supabase
      .from('lesson_progress')
      .upsert(progress, {
        onConflict: 'user_id,lesson_id',
      });

    if (error) throw error;

    return { error: null };
  } catch (error) {
    // TODO: Add proper logging service for exercise completion errors
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

function createNewProgress(
  userId: string,
  lessonId: string,
  exerciseId: string,
  isCorrect: boolean,
  worldId?: string
): LessonProgress {
  return {
    user_id: userId,
    lesson_id: lessonId,
    ...(worldId !== undefined && { world_id: worldId }),
    completed_exercises: [exerciseId],
    correct_answers: isCorrect ? 1 : 0,
    total_attempts: 1,
    status: 'in_progress',
    started_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
    xp_earned: 0,
  };
}

function updateExistingProgress(
  existingProgress: LessonProgress,
  exerciseId: string,
  isCorrect: boolean
): LessonProgress {
  const completedExercises = existingProgress.completed_exercises || [];
  const isNewExercise = !completedExercises.includes(exerciseId);

  return {
    ...existingProgress,
    completed_exercises: isNewExercise
      ? [...completedExercises, exerciseId]
      : completedExercises,
    correct_answers: existingProgress.correct_answers + (isCorrect ? 1 : 0),
    total_attempts: existingProgress.total_attempts + 1,
    status: existingProgress.status === 'not_started' ? 'in_progress' : existingProgress.status,
    last_activity_at: new Date().toISOString(),
  };
}

/**
 * Obtiene el progreso de una lección específica
 */
export async function getLessonProgress(
  userId: string,
  lessonId: string
): Promise<{ data: LessonProgress | null; error: Error | null }> {
  // Skip if Supabase is not configured
  if (!supabase) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { data: data || null, error: null };
  } catch (error) {
    // TODO: Add proper logging service for lesson progress errors
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Obtiene todo el progreso del usuario
 */
export async function getUserProgress(
  userId: string
): Promise<{ data: LessonProgress[]; error: Error | null }> {
  // Skip if Supabase is not configured
  if (!supabase) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    // TODO: Add proper logging service for user progress errors
    return {
      data: [],
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Marca una lección como completada
 */
export async function completeLesson(
  userId: string,
  lessonId: string,
  xpEarned: number
): Promise<{ error: Error | null }> {
  // Skip if Supabase is not configured
  if (!supabase) {
    return { error: null };
  }

  try {
    const { error } = await supabase
      .from('lesson_progress')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        xp_earned: xpEarned,
        last_activity_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('lesson_id', lessonId);

    if (error) throw error;

    // Actualizar stats del usuario
    await addXP(userId, xpEarned);
    await incrementLessonsCompleted(userId);

    return { error: null };
  } catch (error) {
    // TODO: Add proper logging service for lesson completion errors
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

/**
 * Añade XP al usuario y actualiza nivel
 */
export async function addXP(userId: string, amount: number): Promise<{ error: Error | null }> {
  // Skip if Supabase is not configured
  if (!supabase) {
    return { error: null };
  }

  try {
    // Obtener stats actuales
    const { data: stats, error: fetchError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newTotalXP = (stats.total_xp || 0) + amount;
    // Calcular nivel basado en XP (simplificado, ajustar según tus reglas)
    const newLevel = Math.floor(newTotalXP / 1000) + 1;

    const { error } = await supabase
      .from('user_stats')
      .update({
        total_xp: newTotalXP,
        current_level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    // TODO: Add proper logging service for XP errors
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

/**
 * Actualiza el streak del usuario
 */
export async function updateStreak(userId: string): Promise<{ error: Error | null }> {
  // Skip if Supabase is not configured
  if (!supabase) {
    return { error: null };
  }

  try {
    const { data: stats, error: fetchError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = stats.last_activity_date;

    let newStreak = stats.current_streak || 0;
    let longestStreak = stats.longest_streak || 0;

    if (lastActivity === today) {
      // Ya se actualizó hoy, no hacer nada
      return { error: null };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActivity === yesterdayStr) {
      // Continuar streak
      newStreak += 1;
    } else if (!lastActivity || lastActivity < yesterdayStr) {
      // Resetear streak
      newStreak = 1;
    }

    if (newStreak > longestStreak) {
      longestStreak = newStreak;
    }

    const { error } = await supabase
      .from('user_stats')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    // TODO: Add proper logging service for streak errors
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

/**
 * Incrementa el contador de lecciones completadas
 */
export async function incrementLessonsCompleted(userId: string): Promise<{ error: Error | null }> {
  // Skip if Supabase is not configured
  if (!supabase) {
    return { error: null };
  }

  try {
    const { data: stats, error: fetchError } = await supabase
      .from('user_stats')
      .select('lessons_completed')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('user_stats')
      .update({
        lessons_completed: (stats.lessons_completed || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    // TODO: Add proper logging service for lessons completed errors
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

/**
 * Obtiene las estadísticas del usuario
 */
export async function getUserStats(
  userId: string
): Promise<{ data: UserStats | null; error: Error | null }> {
  // Skip if Supabase is not configured
  if (!supabase) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { data: data || null, error: null };
  } catch (error) {
    // TODO: Add proper logging service for user stats errors
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Sincroniza el progreso local con Supabase
 */
export async function syncProgressToSupabase(
  userId: string,
  localProgress: { completedLeaves: string[] }
): Promise<{ error: Error | null }> {
  // Skip if Supabase is not configured
  if (!supabase) {
    return { error: null };
  }

  try {
    // Obtener progreso remoto
    const { data: remoteProgress, error: fetchError } = await getUserProgress(userId);
    if (fetchError) throw fetchError;

    const remoteLessonIds = new Set(remoteProgress.map((p) => p.lesson_id));

    // Crear entradas para lecciones completadas localmente pero no en remoto
    const newLessons = localProgress.completedLeaves.filter(
      (leafId) => !remoteLessonIds.has(leafId)
    );

    if (newLessons.length > 0) {
      const newProgressEntries = newLessons.map((lessonId) => ({
        user_id: userId,
        lesson_id: lessonId,
        status: 'completed',
        completed_exercises: [],
        correct_answers: 0,
        total_attempts: 0,
        xp_earned: 0,
        completed_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('lesson_progress')
        .insert(newProgressEntries);

      if (error) throw error;
    }

    return { error: null };
  } catch (error) {
    // TODO: Add proper logging service for sync errors
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

