/**
 * Configuración de Supabase para la aplicación
 * Exporta el cliente de Supabase y tipos relacionados
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Crear cliente de Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  // Opciones del cliente
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  // Globalmente, no hacer reintentos automáticos de peticiones fallidas
  // Los repositorios manejan su propia lógica de reintento
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Exportar tipos para acceso global
export type SupabaseClient = typeof supabase;

// Helper para manejo de errores de Supabase
export const supabaseQuery = async <T>(
  query: Promise<{ data: T | null; error: unknown }>
): Promise<{ data: T | null; error: unknown }> => {
  return query;
};

// Función helper para manejar errores de autenticación
export const handleAuthError = (error: unknown): string => {
  const supabaseError = error as { code?: string; message?: string };
  if (supabaseError?.code === 'PGRST116') {
    return 'No tienes permiso para realizar esta operación';
  }
  if (supabaseError?.code === 'PGRST301') {
    return 'Sesión expirada. Por favor, inicia sesión de nuevo';
  }
  if (supabaseError?.code === '429') {
    return 'Demasiadas peticiones. Por favor, espera antes de intentarlo de nuevo';
  }
  return supabaseError?.message || 'Error desconocido';
};

// Función helper para formatear errores
export const formatSupabaseError = (error: unknown): string => {
  if (!error) return 'Error desconocido';

  const supabaseError = error as { message?: string; code?: string };

  if (supabaseError?.message) {
    return supabaseError.message;
  }

  if (supabaseError?.code === '23505') {
    return 'Registro duplicado. Este recurso ya existe';
  }

  if (supabaseError?.code === '23503') {
    return 'Referencia inválida. El recurso relacionado no existe';
  }

  if (supabaseError?.code === '22001') {
    return 'Valor demasiado largo. Por favor, acorta el texto';
  }

  if (supabaseError?.code === '22003') {
    return 'Valor numérico inválido';
  }

  return 'Error en la operación';
};

// Función helper para logging de operaciones
export const logSupabaseOperation = (
  operation: string,
  table: string,
  details?: Record<string, unknown>
): void => {
};

// Función helper para validación de datos antes de insertar/actualizar
export const validateBeforeSupabaseOperation = async <T>(
  data: T,
  schema: { parse: (input: unknown) => T }
): Promise<{ valid: true; data: T } | { valid: false; error: string }> => {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof Error) {
      return { valid: false, error: error.message };
    }
    return { valid: false, error: 'Error de validación desconocido' };
  }
};