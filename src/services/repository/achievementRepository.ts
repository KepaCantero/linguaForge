import { BaseRepository } from './baseRepository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Achievement, AchievementSchema, UserAchievement, UserAchievementSchema } from '@/schemas/supabase';
import { supabase } from '@/lib/supabase';

// Type for the simplified data structure used in getTopAchievers
interface UserAchievementCount {
  user_id: string;
  achievement_id: string;
}

/**
 * Repository para gestionar logros y progreso de logros de usuario
 */
export class AchievementRepository extends BaseRepository<Achievement> {
  constructor() {
    super('achievements');
  }

  /**
   * Obtiene todos los logros por categoría
   */
  async getByCategory(category: string): Promise<Achievement[]> {
    return this.findMany({
      where: `category = eq.${category}`,
      orderBy: { column: 'rarity', ascending: true },
    }).then((result) => {
      if (result.error) {
        console.error(`Error fetching achievements for category ${category}:`, result.error);
        return [];
      }
      return result.data || [];
    });
  }

  /**
   * Obtiene logros por rareza
   */
  async getByRarity(rarity: string): Promise<Achievement[]> {
    return this.findMany({
      where: `rarity = eq.${rarity}`,
      orderBy: { column: 'name', ascending: true },
    }).then((result) => {
      if (result.error) {
        console.error(`Error fetching achievements with rarity ${rarity}:`, result.error);
        return [];
      }
      return result.data || [];
    });
  }

  /**
   * Busca logros por condición (simple string match)
   */
  async searchByCondition(condition: string): Promise<Achievement[]> {
    // Nota: Esta es una implementación simple. En producción, podrías usar full-text search
    return this.findMany({
      where: `condition.ilike.%${condition}%`,
      orderBy: { column: 'name', ascending: true },
    }).then((result) => {
      if (result.error) {
        console.error(`Error searching achievements with condition ${condition}:`, result.error);
        return [];
      }
      return result.data || [];
    });
  }

  /**
   * Obtiene logros recomendados para un usuario basado en su progreso
   */
  async getRecommendedForUser(userId: string, limit: number = 10): Promise<Achievement[]> {
    // Implementación básica: devuelve logros no desbloqueados
    // En una implementación real, analizarías el progreso del usuario
    return this.findMany({
      from: 0,
      to: limit - 1,
      orderBy: { column: 'xp_reward', ascending: true },
    }).then((result) => {
      if (result.error) {
        console.error(`Error fetching recommended achievements for user ${userId}:`, result.error);
        return [];
      }
      return result.data || [];
    });
  }
}

/**
 * Repository para gestionar progreso de logros de usuario
 */
export class UserAchievementRepository extends BaseRepository<UserAchievement> {
  constructor() {
    super('user_achievements');
  }

  /**
   * Busca logros desbloqueados por usuario
   */
  async findByUserId(userId: string): Promise<UserAchievement[]> {
    return this.findMany({
      where: `user_id = eq.${userId}`,
      orderBy: { column: 'unlocked_at', ascending: false },
    }).then((result) => {
      if (result.error) {
        console.error(`Error fetching achievements for user ${userId}:`, result.error);
        return [];
      }
      return result.data || [];
    });
  }

  /**
   * Verifica si un usuario tiene un logro específico
   */
  async hasUserAchievement(userId: string, achievementId: string): Promise<boolean> {
    const result = await this.findOne({
      where: `user_id = eq.${userId} and achievement_id = eq.${achievementId}`,
    });

    if (result.error) {
      console.error(`Error checking achievement for user ${userId}:`, result.error);
      return false;
    }

    return result.data !== null;
  }

  /**
   * Desbloquea un logro para un usuario
   */
  async unlockAchievement(
    userId: string,
    achievementId: string,
    progress: Record<string, unknown> = {}
  ): Promise<UserAchievement | null> {
    // Verificar si ya está desbloqueado
    const hasAchievement = await this.hasUserAchievement(userId, achievementId);
    if (hasAchievement) {
      console.log(`User ${userId} already has achievement ${achievementId}`);
      return null;
    }

    const userAchievement: Partial<UserAchievement> = {
      user_id: userId,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
      progress,
    };

    const { data: created, error } = await this.create(userAchievement);

    if (error) {
      console.error(`Error unlocking achievement ${achievementId} for user ${userId}:`, error);
      return null;
    }

    if (!created) {
      console.error(`Failed to create achievement record for user ${userId}`);
      return null;
    }

    const validated = UserAchievementSchema.safeParse(created);
    if (!validated.success) {
      console.error('Invalid user achievement data returned from database:', validated.error);
      return null;
    }

    return validated.data;
  }

  /**
   * Obtiene logros recién desbloqueados
   */
  async getRecentUnlocks(userId: string, limit: number = 5): Promise<UserAchievement[]> {
    return this.findByUserId(userId).then((achievements) => {
      return achievements.slice(0, limit);
    });
  }

  /**
   * Obtiene estadísticas de logros de un usuario
   */
  async getUserAchievementStats(userId: string): Promise<{
    totalUnlocked: number;
    byCategory: Record<string, number>;
    byRarity: Record<string, number>;
    recentUnlocks: number;
    totalXPFromAchievements: number;
    totalCoinsFromAchievements: number;
    totalGemsFromAchievements: number;
  }> {
    const achievements = await this.findByUserId(userId);

    // Obtener detalles completos de cada logro
    const achievementDetails = await Promise.all(
      achievements.map(async (ua) => {
        const { data: achievement } = await supabase
          .from('achievements')
          .select('*')
          .eq('id', ua.achievement_id)
          .single();

        return achievement;
      })
    );

    const byCategory: Record<string, number> = {};
    const byRarity: Record<string, number> = {};
    let totalXP = 0;
    let totalCoins = 0;
    let totalGems = 0;

    achievementDetails.forEach((achievement) => {
      if (!achievement) return;

      // Type assertion to fix TypeScript inference
      const achievementData = achievement as Achievement;

      // Contar por categoría
      byCategory[achievementData.category] = (byCategory[achievementData.category] || 0) + 1;

      // Contar por rareza
      byRarity[achievementData.rarity] = (byRarity[achievementData.rarity] || 0) + 1;

      // Sumar recompensas
      totalXP += achievementData.xp_reward || 0;
      totalCoins += achievementData.coin_reward || 0;
      totalGems += achievementData.gem_reward || 0;
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentUnlocks = achievements.filter(
      (ua) => new Date(ua.unlocked_at) > oneWeekAgo
    ).length;

    return {
      totalUnlocked: achievements.length,
      byCategory,
      byRarity,
      recentUnlocks,
      totalXPFromAchievements: totalXP,
      totalCoinsFromAchievements: totalCoins,
      totalGemsFromAchievements: totalGems,
    };
  }

  /**
   * Actualiza progreso de un logro
   */
  async updateProgress(
    userId: string,
    achievementId: string,
    progress: Record<string, unknown>
  ): Promise<UserAchievement | null> {
    const userAchievementResult = await this.findOne({
      where: `user_id = eq.${userId} and achievement_id = eq.${achievementId}`,
    });

    if (!userAchievementResult || !userAchievementResult.data) {
      console.error(`User achievement not found for user ${userId} and achievement ${achievementId}`);
      return null;
    }

    const { data: updated, error } = await this.update(userAchievementResult.data.id, {
      progress,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error updating progress for achievement ${achievementId}:`, error);
      return null;
    }

    if (!updated) {
      console.error(`Failed to update achievement record for user ${userId}`);
      return null;
    }

    const validated = UserAchievementSchema.safeParse(updated);
    if (!validated.success) {
      console.error('Invalid user achievement data returned from database:', validated.error);
      return null;
    }

    return validated.data;
  }

  /**
   * Obtiene usuarios con más logros
   */
  async getTopAchievers(limit: number = 10): Promise<{
    userId: string;
    achievementCount: number;
    achievements: Achievement[];
  }[]> {
    try {
      // Agrupar por usuario y contar logros
      const { data, error } = await supabase
        .from(this.tableName)
        .select('user_id, achievement_id')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching top achievers:', error);
        return [];
      }

      // Contar logros por usuario
      const userCounts = data.reduce((acc, item) => {
        // Type assertion to fix TypeScript inference
        const dataItem = item as UserAchievementCount;
        acc[dataItem.user_id] = (acc[dataItem.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Ordenar por cantidad de logros
      const sortedUsers = Object.entries(userCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([userId, achievementCount]) => ({ userId, achievementCount }));

      // Obtener detalles de los logros para cada usuario
      const result = await Promise.all(
        sortedUsers.map(async ({ userId, achievementCount }) => {
          const userAchievements = await this.findByUserId(userId);
          const achievementIds = userAchievements.map(ua => ua.achievement_id);

          const { data: achievements } = await supabase
            .from('achievements')
            .select('*')
            .in('id', achievementIds);

          return {
            userId,
            achievementCount,
            achievements: achievements || [],
          };
        })
      );

      return result;
    } catch (error) {
      console.error('Error fetching top achievers:', error);
      return [];
    }
  }
}

// Exportar instancias únicas
export const achievementRepository = new AchievementRepository();
export const userAchievementRepository = new UserAchievementRepository();