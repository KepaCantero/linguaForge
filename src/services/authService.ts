/**
 * Auth Service - Lógica de negocio de autenticación
 * Proporciona una capa de servicios para operaciones de auth
 */

import { authRepository } from './repository/authRepository';
import type { SessionResult, UserResult } from './repository/authRepository';

// ============================================
// TIPOS
// ============================================

export interface AuthCallbackInput {
  code: string;
  redirectTo?: string;
}

export interface AuthCallbackOutput {
  success: boolean;
  redirectTo: string;
  error?: string;
}

// ============================================
// SERVICIO
// ============================================

/**
 * Maneja el callback de autenticación OAuth
 * Intercambia el código por una sesión y redirige al usuario
 */
export async function handleAuthCallback(input: AuthCallbackInput): Promise<AuthCallbackOutput> {
  const { code, redirectTo = '/tree' } = input;

  // Validar que tenemos un código
  if (!code) {
    return {
      success: false,
      redirectTo,
      error: 'Missing authorization code',
    };
  }

  // Intentar intercambiar el código por una sesión
  const result = await authRepository.exchangeCodeForSession(code);

  if (!result.success) {
    return {
      success: false,
      redirectTo,
      error: result.error?.message ?? 'Failed to exchange code for session',
    };
  }

  return {
    success: true,
    redirectTo,
  };
}

/**
 * Obtiene la sesión actual del usuario
 */
export async function getCurrentSession(): Promise<SessionResult> {
  return await authRepository.getSession();
}

/**
 * Obtiene el usuario actual
 */
export async function getCurrentUser(): Promise<UserResult> {
  return await authRepository.getUser();
}

/**
 * Cierra la sesión del usuario
 */
export async function signOutUser(): Promise<{ success: boolean; error: Error | null }> {
  return await authRepository.signOut();
}

/**
 * Refresca la sesión actual
 */
export async function refreshCurrentSession(): Promise<SessionResult> {
  return await authRepository.refreshSession();
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isUserAuthenticated(): Promise<boolean> {
  const result = await authRepository.getSession();
  return result.session !== null && result.error === null;
}
