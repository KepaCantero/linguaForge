/**
 * Auth Repository - Capa de acceso a Supabase Auth
 * Proporciona abstracción sobre operaciones de autenticación de Supabase
 */

import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================
// TIPOS
// ============================================

export interface AuthCallbackResult {
  success: boolean;
  error: Error | null;
}

export interface SessionResult {
  session: unknown | null;
  error: Error | null;
}

export interface UserResult {
  user: unknown | null;
  error: Error | null;
}

// ============================================
// REPOSITORY
// ============================================

/**
 * Repository para operaciones de autenticación
 * Nota: Supabase Auth no sigue el patrón de tabla tradicional,
 * por lo que este repository no extiende BaseRepository
 */
class AuthRepository {
  /**
   * Obtiene el cliente de Supabase para el servidor
   */
  private async getClient(): Promise<SupabaseClient | null> {
    return await createClient();
  }

  /**
   * Intercambia un código OAuth por una sesión
   * Usado en el callback de autenticación
   */
  async exchangeCodeForSession(code: string): Promise<AuthCallbackResult> {
    try {
      const supabase = await this.getClient();

      if (!supabase) {
        return {
          success: false,
          error: new Error('Supabase client not available'),
        };
      }

      await supabase.auth.exchangeCodeForSession(code);

      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Obtiene la sesión actual del usuario
   */
  async getSession(): Promise<SessionResult> {
    try {
      const supabase = await this.getClient();

      if (!supabase) {
        return {
          session: null,
          error: new Error('Supabase client not available'),
        };
      }

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return {
          session: null,
          error: new Error(error.message),
        };
      }

      return { session: data.session, error: null };
    } catch (error) {
      return {
        session: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Obtiene el usuario actual
   */
  async getUser(): Promise<UserResult> {
    try {
      const supabase = await this.getClient();

      if (!supabase) {
        return {
          user: null,
          error: new Error('Supabase client not available'),
        };
      }

      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return {
          user: null,
          error: new Error(error.message),
        };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  async signOut(): Promise<{ success: boolean; error: Error | null }> {
    try {
      const supabase = await this.getClient();

      if (!supabase) {
        return {
          success: false,
          error: new Error('Supabase client not available'),
        };
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: new Error(error.message),
        };
      }

      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Refresca la sesión actual
   */
  async refreshSession(): Promise<SessionResult> {
    try {
      const supabase = await this.getClient();

      if (!supabase) {
        return {
          session: null,
          error: new Error('Supabase client not available'),
        };
      }

      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return {
          session: null,
          error: new Error(error.message),
        };
      }

      return { session: data.session, error: null };
    } catch (error) {
      return {
        session: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

// Singleton instance
export const authRepository = new AuthRepository();
