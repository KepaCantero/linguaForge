import { BaseRepository } from './baseRepository';
import { UserStats, UserStatsSchema } from '@/schemas/supabase';
import { supabase } from '@/lib/supabase';

/**
 * Repository para gestionar estadísticas de usuario
 * Extiende BaseRepository con métodos específicos para estadísticas de usuario
 */
export class UserStatsRepository extends BaseRepository<UserStats> {
  constructor() {
    super('user_stats');
  }

  /**
   * Busca estadísticas de un usuario
   */
  async findByUserId(userId: string): Promise<UserStats | null> {
    return this.findOne({
      where: `user_id = eq.${userId}`,
    }).then((result) => {
      if (result.error) {
        return null;
      }
      return result.data;
    });
  }

  /**
   * Crea o actualiza estadísticas de usuario (upsert)
   */
  async upsertUserStats(
    userId: string,
    data: Partial<Omit<UserStats, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<UserStats | null> {
    // Primero verificamos si existen estadísticas para este usuario
    const existing = await this.findByUserId(userId);

    if (existing) {
      // Actualizamos las estadísticas existentes
      const updateData: Partial<UserStats> = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error } = await this.update(existing.id, updateData);

      if (error) {
        return null;
      }

      if (!updated) {
        return null;
      }

      const validated = UserStatsSchema.safeParse(updated);
      if (!validated.success) {
        return null;
      }

      return validated.data;
    } else {
      // Creamos nuevas estadísticas
      const createData: Partial<UserStats> = {
        user_id: userId,
        ...data,
        level: data.level || 1,
        rank: data.rank || 'Beginner',
        achievements: data.achievements || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await this.create(createData);
      if (result.error) {
        return null;
      }

      if (!result.data) {
        return null;
      }

      const validated = UserStatsSchema.safeParse(result.data);
      if (!validated.success) {
        return null;
      }

      return validated.data;
    }
  }

  /**
   * Actualiza XP y recalcula nivel y rango
   */
  async updateXP(userId: string, xpGained: number): Promise<UserStats | null> {
    const existing = await this.findByUserId(userId);

    if (!existing) {
      // Si no existen estadísticas, las creamos con el XP ganado
      return this.upsertUserStats(userId, {
        total_xp_earned: xpGained,
        level: this.calculateLevel(xpGained),
        rank: this.calculateRank(xpGained),
      });
    }

    const newXp = existing.total_xp_earned + xpGained;
    const newLevel = this.calculateLevel(newXp);
    const newRank = this.calculateRank(newXp);

    return this.upsertUserStats(userId, {
      total_xp_earned: newXp,
      level: newLevel,
      rank: newRank,
    });
  }

  /**
   * Actualiza monedas
   */
  async updateCoins(userId: string, coinsGained: number): Promise<UserStats | null> {
    const existing = await this.findByUserId(userId);

    if (!existing) {
      return this.upsertUserStats(userId, {
        total_coins_earned: coinsGained,
      });
    }

    const newCoins = existing.total_coins_earned + coinsGained;

    return this.upsertUserStats(userId, {
      total_coins_earned: newCoins,
    });
  }

  /**
   * Actualiza gemas
   */
  async updateGems(userId: string, gemsGained: number): Promise<UserStats | null> {
    const existing = await this.findByUserId(userId);

    if (!existing) {
      return this.upsertUserStats(userId, {
        total_gems_earned: gemsGained,
      });
    }

    const newGems = existing.total_gems_earned + gemsGained;

    return this.upsertUserStats(userId, {
      total_gems_earned: newGems,
    });
  }

  /**
   * Actualiza logros
   */
  async updateAchievements(userId: string, achievements: string[]): Promise<UserStats | null> {
    return this.upsertUserStats(userId, {
      achievements,
    });
  }

  /**
   * Añade un logro
   */
  async addAchievement(userId: string, achievementId: string): Promise<UserStats | null> {
    const existing = await this.findByUserId(userId);

    if (!existing) {
      return this.upsertUserStats(userId, {
        achievements: [achievementId],
      });
    }

    // Evitar duplicados
    if (!existing.achievements.includes(achievementId)) {
      const updatedAchievements = [...existing.achievements, achievementId];
      return this.upsertUserStats(userId, {
        achievements: updatedAchievements,
      });
    }

    return existing;
  }

  /**
   * Actualiza racha
   */
  async updateStreak(userId: string, newStreak: number): Promise<UserStats | null> {
    const existing = await this.findByUserId(userId);

    if (!existing) {
      return this.upsertUserStats(userId, {
        current_streak: newStreak,
        longest_streak: newStreak,
      });
    }

    return this.upsertUserStats(userId, {
      current_streak: newStreak,
      longest_streak: Math.max(existing.longest_streak, newStreak),
    });
  }

  /**
   * Incrementa contador de lecciones completadas
   */
  async incrementLessonsCompleted(userId: string): Promise<UserStats | null> {
    const existing = await this.findByUserId(userId);

    if (!existing) {
      return this.upsertUserStats(userId, {
        lessons_completed: 1,
      });
    }

    return this.upsertUserStats(userId, {
      lessons_completed: existing.lessons_completed + 1,
    });
  }

  /**
   * Incrementa contador de ejercicios completados
   */
  async incrementExercisesCompleted(userId: string, accuracy?: number): Promise<UserStats | null> {
    const existing = await this.findByUserId(userId);

    if (!existing) {
      const initialAccuracy = accuracy || 0;
      return this.upsertUserStats(userId, {
        exercises_completed: 1,
        accuracy_rate: initialAccuracy,
      });
    }

    const newCompleted = existing.exercises_completed + 1;

    // Calcular nueva precisión promedio
    let newAccuracy = existing.accuracy_rate || 0;
    if (accuracy !== undefined) {
      if (existing.exercises_completed > 0 && existing.accuracy_rate !== null) {
        newAccuracy = (existing.accuracy_rate * existing.exercises_completed + accuracy) / newCompleted;
      } else {
        newAccuracy = accuracy;
      }
    }

    return this.upsertUserStats(userId, {
      exercises_completed: newCompleted,
      accuracy_rate: Math.round(newAccuracy),
    });
  }

  /**
   * Actualiza tiempo de uso
   */
  async updateTimeSpent(userId: string, timeSpent: number): Promise<UserStats | null> {
    const existing = await this.findByUserId(userId);

    if (!existing) {
      return this.upsertUserStats(userId, {
        time_spent_total: timeSpent,
      });
    }

    return this.upsertUserStats(userId, {
      time_spent_total: existing.time_spent_total + timeSpent,
    });
  }

  /**
   * Obtiene leaderboard de XP
   */
  async getTopUsersByXP(limit: number = 10): Promise<UserStats[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('total_xp_earned', { ascending: false })
        .limit(limit);

      if (error) {
        return [];
      }

      const validated = data
        .map((item) => UserStatsSchema.safeParse(item))
        .filter((result): result is { success: true; data: UserStats } => result.success)
        .map((result) => result.data);

      return validated;
    } catch {
      return [];
    }
  }

  /**
   * Obtiene leaderboard de lecciones completadas
   */
  async getTopUsersByLessonsCompleted(limit: number = 10): Promise<UserStats[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('lessons_completed', { ascending: false })
        .limit(limit);

      if (error) {
        return [];
      }

      const validated = data
        .map((item) => UserStatsSchema.safeParse(item))
        .filter((result): result is { success: true; data: UserStats } => result.success)
        .map((result) => result.data);

      return validated;
    } catch {
      return [];
    }
  }

  /**
   * Calcula nivel basado en XP
   */
  private calculateLevel(xp: number): number {
    // Fórmula de nivel: nivel = floor((raiz(xp / 100)) + 1)
    return Math.floor(Math.sqrt(xp / 1000)) + 1;
  }

  /**
   * Calcula rango basado en XP
   */
  private calculateRank(xp: number): string {
    if (xp < 1000) return 'Beginner';
    if (xp < 5000) return 'Novice';
    if (xp < 15000) return 'Intermediate';
    if (xp < 50000) return 'Advanced';
    if (xp < 100000) return 'Expert';
    if (xp < 200000) return 'Master';
    return 'Legendary';
  }

  /**
   * Obtiene estadísticas generales de la plataforma
   */
  async getGlobalStats(): Promise<{
    totalUsers: number;
    totalXP: number;
    totalLessons: number;
    totalExercises: number;
    averageLevel: number;
    topUser: UserStats | null;
  }> {
    try {
      const { count: totalUsers } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      const { data: allStats } = await supabase
        .from(this.tableName)
        .select('*');

      // Type assertion to fix TypeScript inference
      const statsWithProperTypes = allStats?.map((stats) => stats as UserStats) || [];

      const totalXP = statsWithProperTypes.reduce((sum, stats) => sum + (stats.total_xp_earned || 0), 0);
      const totalLessons = statsWithProperTypes.reduce((sum, stats) => sum + (stats.lessons_completed || 0), 0);
      const totalExercises = statsWithProperTypes.reduce((sum, stats) => sum + (stats.exercises_completed || 0), 0);

      const averageLevel = statsWithProperTypes.length > 0
        ? statsWithProperTypes.reduce((sum, stats) => sum + (stats.level || 1), 0) / statsWithProperTypes.length
        : 1;

      const topUser = statsWithProperTypes.length > 0
        ? statsWithProperTypes.reduce((top, current) =>
            (current.total_xp_earned || 0) > (top.total_xp_earned || 0) ? current : top
          )
        : null;

      return {
        totalUsers: totalUsers || 0,
        totalXP,
        totalLessons,
        totalExercises,
        averageLevel: Math.round(averageLevel),
        topUser: topUser ? UserStatsSchema.parse(topUser) : null,
      };
    } catch {
      return {
        totalUsers: 0,
        totalXP: 0,
        totalLessons: 0,
        totalExercises: 0,
        averageLevel: 1,
        topUser: null,
      };
    }
  }
}

// Exportar instancia única
export const userStatsRepository = new UserStatsRepository();