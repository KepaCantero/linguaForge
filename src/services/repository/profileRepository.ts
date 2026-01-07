import { BaseRepository } from './baseRepository';
import { Profile, ProfileSchema } from '@/schemas/supabase';
import { supabase } from '@/lib/supabase';

/**
 * Repository para gestionar perfiles de usuario
 * Extiende BaseRepository con métodos específicos para perfiles
 */
export class ProfileRepository extends BaseRepository<Profile> {
  constructor() {
    super('profiles');
  }

  /**
   * Busca un perfil por user_id
   */
  async findByUserId(userId: string): Promise<Profile | null> {
    return this.findOne({
      where: `user_id = eq.${userId}`,
    }).then((result) => {
      if (result.error) {
        console.error(`Error finding profile for user ${userId}:`, result.error);
        return null;
      }
      return result.data;
    });
  }

  /**
   * Busca un perfil por username
   */
  async findByUsername(username: string): Promise<Profile | null> {
    return this.findOne({
      where: `username = eq.${username}`,
    }).then((result) => {
      if (result.error) {
        console.error(`Error finding profile with username ${username}:`, result.error);
        return null;
      }
      return result.data;
    });
  }

  /**
   * Actualiza parcialmente un perfil
   */
  async updatePartial(
    id: string,
    data: Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<Profile | null> {
    const { data: updated, error } = await this.update(id, data);

    if (error) {
      console.error(`Error updating profile ${id}:`, error);
      return null;
    }

    if (!updated) {
      console.error(`Failed to update profile record for ${id}`);
      return null;
    }

    const validated = ProfileSchema.safeParse(updated);
    if (!validated.success) {
      console.error('Invalid profile data returned from database:', validated.error);
      return null;
    }

    return validated.data;
  }

  /**
   * Crea o actualiza un perfil
   */
  async upsertProfile(
    data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: { onConflict?: string }
  ): Promise<Profile | null> {
    const { data: upserted, error } = await this.upsert(data, {
      onConflict: options?.onConflict ?? 'user_id',
    });

    if (error) {
      console.error('Error upserting profile:', error);
      return null;
    }

    if (!upserted) {
      console.error('Failed to upsert profile record');
      return null;
    }

    const validated = ProfileSchema.safeParse(upserted);
    if (!validated.success) {
      console.error('Invalid profile data returned from database:', validated.error);
      return null;
    }

    return validated.data;
  }

  /**
   * Obtiene estadísticas básicas de perfiles
   */
  async getProfileStats(): Promise<{
    total: number;
    withAvatar: number;
    withBio: number;
    lastWeekActive: number;
  }> {
    try {
      // Total perfiles
      const { count: total } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Con avatar
      const { count: withAvatar } = await supabase
        .from(this.tableName)
        .select('avatar_url', { count: 'exact', head: true })
        .not('avatar_url', 'is', null);

      // Con bio
      const { count: withBio } = await supabase
        .from(this.tableName)
        .select('bio', { count: 'exact', head: true })
        .not('bio', 'is', null);

      // Activos la semana pasada (ejemplo)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const { count: lastWeekActive } = await supabase
        .from(this.tableName)
        .select('updated_at', { count: 'exact', head: true })
        .gte('updated_at', oneWeekAgo.toISOString());

      return {
        total: total || 0,
        withAvatar: withAvatar || 0,
        withBio: withBio || 0,
        lastWeekActive: lastWeekActive || 0,
      };
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      return {
        total: 0,
        withAvatar: 0,
        withBio: 0,
        lastWeekActive: 0,
      };
    }
  }

  /**
   * Busca perfiles por lenguaje nativo
   */
  async findByNativeLanguage(language: string): Promise<Profile[]> {
    return this.findMany({
      where: `native_language = eq.${language}`,
      orderBy: { column: 'username', ascending: true },
    }).then((result) => {
      if (result.error) {
        console.error(`Error finding profiles with native language ${language}:`, result.error);
        return [];
      }
      return result.data || [];
    });
  }

  /**
   * Busca perfiles por lenguaje de aprendizaje
   */
  async findByLearningLanguage(language: string): Promise<Profile[]> {
    return this.findMany({
      where: `learning_language = eq.${language}`,
      orderBy: { column: 'username', ascending: true },
    }).then((result) => {
      if (result.error) {
        console.error(`Error finding profiles with learning language ${language}:`, result.error);
        return [];
      }
      return result.data || [];
    });
  }

  /**
   * Elimina un perfil por user_id (útil para eliminación de usuario)
   */
  async deleteByUserId(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error(`Error deleting profile for user ${userId}:`, error);
      return false;
    }

    return true;
  }
}

// Exportar instancia única
export const profileRepository = new ProfileRepository();