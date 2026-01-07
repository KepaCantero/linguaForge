import { BaseRepository } from './baseRepository';
import { StudySession, StudySessionSchema } from '@/schemas/supabase';
import { supabase } from '@/lib/supabase';

// Type for the simplified data structure used in getTopStudyTimeUsers
interface StudySessionSummary {
  user_id: string;
  duration: number;
}

/**
 * Repository para gestionar sesiones de estudio
 */
export class StudySessionRepository extends BaseRepository<StudySession> {
  constructor() {
    super('study_sessions');
  }

  /**
   * Crea una nueva sesión de estudio
   */
  async createSession(
    userId: string,
    sessionType: StudySession['session_type'],
    options: {
      duration?: number;
      xpEarned?: number;
      coinsEarned?: number;
      gemsEarned?: number;
      exercisesCompleted?: number;
      accuracy?: number;
      lessonsCompleted?: number;
      cardsReviewed?: number;
    } = {}
  ): Promise<StudySession | null> {
    const session: Partial<StudySession> = {
      user_id: userId,
      session_type: sessionType,
      duration: options.duration || 0,
      xp_earned: options.xpEarned || 0,
      coins_earned: options.coinsEarned || 0,
      gems_earned: options.gemsEarned || 0,
      exercises_completed: options.exercisesCompleted || 0,
      accuracy: options.accuracy || 0,
      lessons_completed: options.lessonsCompleted || 0,
      cards_reviewed: options.cardsReviewed || 0,
      started_at: new Date().toISOString(),
      ended_at: null,
    };

    const { data: created, error } = await this.create(session);

    if (error) {
      console.error('Error creating study session:', error);
      return null;
    }

    if (!created) {
      console.error('Failed to create study session record');
      return null;
    }

    const validated = StudySessionSchema.safeParse(created);
    if (!validated.success) {
      console.error('Invalid study session data returned from database:', validated.error);
      return null;
    }

    return validated.data;
  }

  /**
   * Finaliza una sesión de estudio
   */
  async endSession(sessionId: string, updates?: {
    duration?: number;
    xpEarned?: number;
    coinsEarned?: number;
    gemsEarned?: number;
    exercisesCompleted?: number;
    accuracy?: number;
    lessonsCompleted?: number;
    cardsReviewed?: number;
  }): Promise<StudySession | null> {
    const updateData: Partial<StudySession> = {
      ended_at: new Date().toISOString(),
    };

    // Aplicar actualizaciones si se proporcionan
    if (updates) {
      if (updates.duration !== undefined) updateData.duration = updates.duration;
      if (updates.xpEarned !== undefined) updateData.xp_earned = updates.xpEarned;
      if (updates.coinsEarned !== undefined) updateData.coins_earned = updates.coinsEarned;
      if (updates.gemsEarned !== undefined) updateData.gems_earned = updates.gemsEarned;
      if (updates.exercisesCompleted !== undefined) updateData.exercises_completed = updates.exercisesCompleted;
      if (updates.accuracy !== undefined) updateData.accuracy = updates.accuracy;
      if (updates.lessonsCompleted !== undefined) updateData.lessons_completed = updates.lessonsCompleted;
      if (updates.cardsReviewed !== undefined) updateData.cards_reviewed = updates.cardsReviewed;
    }

    const { data: updated, error } = await this.update(sessionId, updateData);

    if (error) {
      console.error(`Error ending study session ${sessionId}:`, error);
      return null;
    }

    const validated = StudySessionSchema.safeParse(updated);
    if (!validated.success) {
      console.error('Invalid study session data returned from database:', validated.error);
      return null;
    }

    return validated.data;
  }

  /**
   * Obtiene sesiones recientes de un usuario
   */
  async getRecentSessions(userId: string, limit: number = 10): Promise<StudySession[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`Error fetching recent sessions for user ${userId}:`, error);
      return [];
    }

    const validated = data
      .map((item) => StudySessionSchema.safeParse(item))
      .filter((result): result is { success: true; data: StudySession } => result.success)
      .map((result) => result.data);

    return validated;
  }

  /**
   * Obtiene sesiones por tipo
   */
  async getByType(userId: string, sessionType: StudySession['session_type']): Promise<StudySession[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('session_type', sessionType)
      .order('started_at', { ascending: false });

    if (error) {
      console.error(`Error fetching sessions of type ${sessionType} for user ${userId}:`, error);
      return [];
    }

    const validated = data
      .map((item) => StudySessionSchema.safeParse(item))
      .filter((result): result is { success: true; data: StudySession } => result.success)
      .map((result) => result.data);

    return validated;
  }

  /**
   * Obtiene estadísticas de sesiones de un usuario
   */
  async getUserSessionStats(userId: string): Promise<{
    totalSessions: number;
    totalTimeSpent: number;
    totalXP: number;
    totalCoins: number;
    totalGems: number;
    totalExercises: number;
    averageAccuracy: number;
    sessionsByType: Record<StudySession['session_type'], number>;
    weeklyStats: {
      weekStart: string;
      sessions: number;
      duration: number;
      xp: number;
    }[];
  }> {
    try {
      const allSessions = await this.getRecentSessions(userId, 1000); // Obtener todas las sesiones

      const totalSessions = allSessions.length;
      const totalTimeSpent = allSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const totalXP = allSessions.reduce((sum, session) => sum + (session.xp_earned || 0), 0);
      const totalCoins = allSessions.reduce((sum, session) => sum + (session.coins_earned || 0), 0);
      const totalGems = allSessions.reduce((sum, session) => sum + (session.gems_earned || 0), 0);
      const totalExercises = allSessions.reduce((sum, session) => sum + (session.exercises_completed || 0), 0);

      // Calcular precisión promedio (excluyendo sesiones sin ejercicios)
      const sessionsWithExercises = allSessions.filter(session => session.exercises_completed > 0);
      const averageAccuracy = sessionsWithExercises.length > 0
        ? sessionsWithExercises.reduce((sum, session) => sum + (session.accuracy || 0), 0) / sessionsWithExercises.length
        : 0;

      // Agrupar por tipo
      const sessionsByType: Record<StudySession['session_type'], number> = {
        lesson: 0,
        review: 0,
        practice: 0,
        challenge: 0,
      };

      allSessions.forEach(session => {
        sessionsByType[session.session_type]++;
      });

      // Estadísticas semanales (últimas 4 semanas)
      const weeklyStats = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() || 7) - (i * 7));
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekSessions = allSessions.filter(session => {
          const sessionDate = new Date(session.started_at);
          return sessionDate >= weekStart && sessionDate < weekEnd;
        });

        weeklyStats.push({
          weekStart: weekStart.toISOString().split('T')[0],
          sessions: weekSessions.length,
          duration: weekSessions.reduce((sum, session) => sum + (session.duration || 0), 0),
          xp: weekSessions.reduce((sum, session) => sum + (session.xp_earned || 0), 0),
        });
      }

      return {
        totalSessions,
        totalTimeSpent,
        totalXP,
        totalCoins,
        totalGems,
        totalExercises,
        averageAccuracy: Math.round(averageAccuracy),
        sessionsByType,
        weeklyStats,
      };
    } catch (error) {
      console.error('Error fetching user session stats:', error);
      return {
        totalSessions: 0,
        totalTimeSpent: 0,
        totalXP: 0,
        totalCoins: 0,
        totalGems: 0,
        totalExercises: 0,
        averageAccuracy: 0,
        sessionsByType: {
          lesson: 0,
          review: 0,
          practice: 0,
          challenge: 0,
        },
        weeklyStats: [],
      };
    }
  }

  /**
   * Obtiene sesiones entre dos fechas
   */
  async getSessionsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<StudySession[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .order('started_at', { ascending: false });

    if (error) {
      console.error(`Error fetching sessions between ${startDate} and ${endDate}:`, error);
      return [];
    }

    const validated = data
      .map((item) => StudySessionSchema.safeParse(item))
      .filter((result): result is { success: true; data: StudySession } => result.success)
      .map((result) => result.data);

    return validated;
  }

  /**
   * Obtiene usuarios con más tiempo de estudio
   */
  async getTopStudyTimeUsers(limit: number = 10): Promise<{
    userId: string;
    totalTimeSpent: number;
    sessionCount: number;
  }[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('user_id, duration')
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching top study time users:', error);
        return [];
      }

      // Agrupar por usuario y sumar tiempo
      const userStats = data.reduce((acc, item) => {
        // Type assertion to fix TypeScript inference
        const sessionSummary = item as StudySessionSummary;

        if (!acc[sessionSummary.user_id]) {
          acc[sessionSummary.user_id] = { totalTimeSpent: 0, sessionCount: 0 };
        }
        acc[sessionSummary.user_id].totalTimeSpent += sessionSummary.duration || 0;
        acc[sessionSummary.user_id].sessionCount += 1;
        return acc;
      }, {} as Record<string, { totalTimeSpent: number; sessionCount: number }>);

      // Ordenar por tiempo total y tomar los primeros
      const sorted = Object.entries(userStats)
        .sort(([, a], [, b]) => b.totalTimeSpent - a.totalTimeSpent)
        .slice(0, limit)
        .map(([userId, stats]) => ({
          userId,
          totalTimeSpent: stats.totalTimeSpent,
          sessionCount: stats.sessionCount,
        }));

      return sorted;
    } catch (error) {
      console.error('Error fetching top study time users:', error);
      return [];
    }
  }
}

// Exportar instancia única
export const studySessionRepository = new StudySessionRepository();