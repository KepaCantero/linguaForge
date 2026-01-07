import { BaseRepository } from './baseRepository';
import { LessonProgress, LessonProgressSchema } from '@/schemas/supabase';
import { supabase } from '@/lib/supabase';

/**
 * Repository para gestionar progreso de lecciones
 * Extiende BaseRepository con métodos específicos para progreso de lecciones
 */
export class LessonProgressRepository extends BaseRepository<LessonProgress> {
  constructor() {
    super('lesson_progress');
  }

  /**
   * Busca progreso de lección por user_id y lesson_id
   */
  async findByUserIdAndLesson(userId: string, lessonId: string): Promise<LessonProgress | null> {
    return this.findOne({
      where: `user_id = eq.${userId} and lesson_id = eq.${lessonId}`,
    }).then((result) => {
      if (result.error) {
        console.error(`Error finding lesson progress for user ${userId} and lesson ${lessonId}:`, result.error);
        return null;
      }
      return result.data;
    });
  }

  /**
   * Obtiene todo el progreso de un usuario
   */
  async findByUserId(userId: string, options?: {
    level?: string;
    completed?: boolean;
    limit?: number;
    orderBy?: 'progress_percentage' | 'last_accessed' | 'created_at';
  }): Promise<LessonProgress[]> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId);

    if (options?.level) {
      query = query.eq('level', options.level);
    }

    if (options?.completed !== undefined) {
      query = query.eq('completed', options.completed);
    }

    if (options?.orderBy) {
      const ascending = options.orderBy === 'last_accessed' || options.orderBy === 'created_at';
      query = query.order(options.orderBy, { ascending });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching lesson progress for user ${userId}:`, error);
      return [];
    }

    const validated = data
      .map((item) => LessonProgressSchema.safeParse(item))
      .filter((result): result is { success: true; data: LessonProgress } => result.success)
      .map((result) => result.data);

    return validated;
  }

  /**
   * Actualiza el progreso de una lección
   */
  async updateProgress(
    userId: string,
    lessonId: string,
    data: Partial<Omit<LessonProgress, 'id' | 'user_id' | 'lesson_id' | 'created_at' | 'updated_at'>>
  ): Promise<LessonProgress | null> {
    // Primero obtenemos el registro existente
    const existing = await this.findByUserIdAndLesson(userId, lessonId);

    if (!existing) {
      // Si no existe, creamos uno nuevo
      const createData: Partial<LessonProgress> = {
        user_id: userId,
        lesson_id: lessonId,
        completed: data.completed || false,
        progress_percentage: data.progress_percentage || 0,
        started_at: data.started_at || new Date().toISOString(),
        last_accessed: new Date().toISOString(),
        time_spent: data.time_spent || 0,
        exercises_completed: data.exercises_completed || 0,
        total_exercises: data.total_exercises || 0,
        accuracy: data.accuracy || null,
        streak: data.streak || 0,
      };

      return this.create(createData).then((result) => {
        if (result.error) {
          console.error(`Error creating lesson progress for ${lessonId}:`, result.error);
          return null;
        }
        return result.data;
      });
    }

    // Si existe, actualizamos
    const updateData: Partial<LessonProgress> = {
      ...data,
      last_accessed: new Date().toISOString(),
    };

    // Si se marca como completado, actualizamos completed_at
    if (data.completed === true && !existing.completed) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: updated, error } = await this.update(existing.id, updateData);

    if (error) {
      console.error(`Error updating lesson progress for ${lessonId}:`, error);
      return null;
    }

    if (!updated) {
      console.error(`Failed to update lesson progress record for ${lessonId}`);
      return null;
    }

    const validated = LessonProgressSchema.safeParse(updated);
    if (!validated.success) {
      console.error('Invalid lesson progress data returned from database:', validated.error);
      return null;
    }

    return validated.data;
  }

  /**
   * Incrementa el contador de ejercicios completados
   */
  async incrementExerciseCount(
    userId: string,
    lessonId: string,
    isCorrect: boolean = true
  ): Promise<{ progress: LessonProgress | null; accuracy: number }> {
    const existing = await this.findByUserIdAndLesson(userId, lessonId);

    if (!existing) {
      // Si no existe, creamos un nuevo registro con el ejercicio completado
      const newProgress: Partial<LessonProgress> = {
        user_id: userId,
        lesson_id: lessonId,
        exercises_completed: 1,
        total_exercises: 1,
        accuracy: isCorrect ? 100 : 0,
        progress_percentage: 10, // Suponemos que es el primer ejercicio
        started_at: new Date().toISOString(),
        last_accessed: new Date().toISOString(),
      };

      const created = await this.create(newProgress);
      return {
        progress: created.data,
        accuracy: isCorrect ? 100 : 0,
      };
    }

    // Si existe, actualizamos
    const updatedExercises = existing.exercises_completed + 1;
    const updatedTotal = existing.total_exercises + 1;

    // Calculamos nueva precisión
    let newAccuracy = existing.accuracy || 0;
    if (isCorrect) {
      newAccuracy = ((existing.exercises_completed * (existing.accuracy || 0)) + 100) / updatedExercises;
    } else {
      newAccuracy = (existing.exercises_completed * (existing.accuracy || 0)) / updatedExercises;
    }

    const newProgress = Math.min(100, Math.round((updatedExercises / updatedTotal) * 100));

    const updated = await this.updateProgress(userId, lessonId, {
      exercises_completed: updatedExercises,
      total_exercises: updatedTotal,
      accuracy: Math.round(newAccuracy),
      progress_percentage: newProgress,
    });

    return {
      progress: updated,
      accuracy: Math.round(newAccuracy),
    };
  }

  /**
   * Obtiene estadísticas de progreso de un usuario
   */
  async getUserProgressStats(userId: string): Promise<{
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    averageProgress: number;
    totalTimeSpent: number;
    totalExercises: number;
    completedExercises: number;
    averageAccuracy: number;
  }> {
    try {
      const allProgress = await this.findByUserId(userId);

      const totalLessons = allProgress.length;
      const completedLessons = allProgress.filter(p => p.completed).length;
      const inProgressLessons = allProgress.filter(p => !p.completed).length;

      const totalTimeSpent = allProgress.reduce((sum, p) => sum + (p.time_spent || 0), 0);
      const totalExercises = allProgress.reduce((sum, p) => sum + (p.total_exercises || 0), 0);
      const completedExercises = allProgress.reduce((sum, p) => sum + (p.exercises_completed || 0), 0);

      const progressValues = allProgress.map(p => p.progress_percentage || 0);
      const averageProgress = progressValues.length > 0
        ? Math.round(progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length)
        : 0;

      const accuracyValues = allProgress.map(p => p.accuracy).filter(a => a !== null) as number[];
      const averageAccuracy = accuracyValues.length > 0
        ? Math.round(accuracyValues.reduce((sum, a) => sum + a, 0) / accuracyValues.length)
        : 0;

      return {
        totalLessons,
        completedLessons,
        inProgressLessons,
        averageProgress,
        totalTimeSpent,
        totalExercises,
        completedExercises,
        averageAccuracy,
      };
    } catch (error) {
      console.error('Error fetching user progress stats:', error);
      return {
        totalLessons: 0,
        completedLessons: 0,
        inProgressLessons: 0,
        averageProgress: 0,
        totalTimeSpent: 0,
        totalExercises: 0,
        completedExercises: 0,
        averageAccuracy: 0,
      };
    }
  }

  /**
   * Obtiene lecciones recientes de un usuario
   */
  async getRecentLessons(userId: string, limit: number = 10): Promise<LessonProgress[]> {
    return this.findByUserId(userId, {
      orderBy: 'last_accessed',
      limit,
    });
  }

  /**
   * Obtiene lecciones completadas de un usuario
   */
  async getCompletedLessons(userId: string, level?: string): Promise<LessonProgress[]> {
    return this.findByUserId(userId, {
      level,
      completed: true,
      orderBy: 'created_at',
    });
  }

  /**
   * Elimina progreso de lecciones para un usuario específico
   */
  async deleteByUserId(userId: string): Promise<number> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error(`Error deleting lesson progress for user ${userId}:`, error);
      return 0;
    }

    // Devuelve el número de registros eliminados (esto es una estimación)
    return -1; // En Supabase, no se devuelve el count directamente en DELETE
  }
}

// Exportar instancia única
export const lessonProgressRepository = new LessonProgressRepository();