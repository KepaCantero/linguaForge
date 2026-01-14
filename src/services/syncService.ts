/**
 * Sync Service
 * Sincroniza el estado local de Zustand con Supabase
 * Maneja conflictos y estado offline/online
 */

import { createClient } from '@/lib/supabase/client';
import type { UserStats, LessonProgress } from '@/schemas/supabase';

const supabase = createClient();

// ============================================================
// TIPOS
// ============================================================

export interface SyncResult {
  success: boolean;
  error?: string;
  syncedAt?: string;
  conflicts?: SyncConflict[];
}

export interface SyncConflict {
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  resolvedValue: unknown;
}

export interface LocalGamificationState {
  xp: number;
  level: number;
  coins: number;
  gems: number;
  streak: number;
  lastActiveDate: string | null;
  longestStreak: number;
}

export interface LocalSRSData {
  cards: Array<{
    id: string;
    front: string;
    back: string;
    interval: number;
    easeFactor: number;
    dueDate: string;
    repetitions: number;
  }>;
}

export interface LocalProgressData {
  completedLeaves: string[];
  activeBranch: string | null;
  activeLeaf: string | null;
}

// ============================================================
// SYNC HELPERS
// ============================================================

/**
 * Detecta si estamos online
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Registra listeners para cambios de conectividad
 */
export function registerConnectivityListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  globalThis.addEventListener('online', onOnline);
  globalThis.addEventListener('offline', onOffline);

  return () => {
    globalThis.removeEventListener('online', onOnline);
    globalThis.removeEventListener('offline', onOffline);
  };
}

/**
 * Obtiene la última fecha de sync
 */
export function getLastSyncTime(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('linguaforge-last-sync');
}

/**
 * Guarda la fecha de sync
 */
export function setLastSyncTime(time: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('linguaforge-last-sync', time);
  }
}

// ============================================================
// SYNC GAMIFICATION
// ============================================================

/**
 * Obtiene el estado remoto de gamificación
 */
async function fetchRemoteGamificationState(
  userId: string
): Promise<{ data: UserStats | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

/**
 * Resuelve conflictos entre estado local y remoto
 */
function resolveGamificationConflicts(
  localState: LocalGamificationState,
  remoteStats: UserStats | null
): { resolvedState: Record<string, unknown>; conflicts: SyncConflict[] } {
  const conflicts: SyncConflict[] = [];

  const resolvedState = {
    total_xp_earned: Math.max(localState.xp, remoteStats?.total_xp_earned || 0),
    level: Math.max(localState.level, remoteStats?.level || 1),
    total_coins_earned: Math.max(localState.coins, remoteStats?.total_coins_earned || 0),
    total_gems_earned: Math.max(localState.gems, remoteStats?.total_gems_earned || 0),
    current_streak: Math.max(localState.streak, remoteStats?.current_streak || 0),
    longest_streak: Math.max(
      localState.longestStreak,
      remoteStats?.longest_streak || 0
    ),
    updated_at: localState.lastActiveDate || new Date().toISOString(),
  };

  // Detectar conflictos para logging
  if (remoteStats) {
    if (localState.xp !== remoteStats.total_xp_earned) {
      conflicts.push({
        field: 'xp',
        localValue: localState.xp,
        remoteValue: remoteStats.total_xp_earned,
        resolvedValue: resolvedState.total_xp_earned,
      });
    }
    if (localState.streak !== remoteStats.current_streak) {
      conflicts.push({
        field: 'streak',
        localValue: localState.streak,
        remoteValue: remoteStats.current_streak,
        resolvedValue: resolvedState.current_streak,
      });
    }
  }

  return { resolvedState, conflicts };
}

/**
 * Guarda el estado resuelto en Supabase
 */
async function upsertGamificationState(
  userId: string,
  resolvedState: Record<string, unknown>
): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: null };
  }

  const { error } = await supabase
    .from('user_stats')
    .upsert({
      user_id: userId,
      ...resolvedState,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  return { error: error || null };
}

/**
 * Construye resultado de sync exitoso
 */
function buildSyncSuccessResult(conflicts: SyncConflict[]): SyncResult {
  const syncedAt = new Date().toISOString();
  setLastSyncTime(syncedAt);

  return {
    success: true,
    syncedAt,
    ...(conflicts.length > 0 && { conflicts }),
  };
}

/**
 * Construye resultado de sync fallido
 */
function buildSyncErrorResult(error: unknown): SyncResult {
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}

/**
 * Sincroniza el estado de gamificación con Supabase
 */
export async function syncGamification(
  userId: string,
  localState: LocalGamificationState
): Promise<SyncResult> {
  if (!supabase) {
    return { success: true };
  }

  if (!isOnline()) {
    return { success: false, error: 'Offline' };
  }

  try {
    const { data: remoteStats, error: fetchError } = await fetchRemoteGamificationState(userId);

    if (fetchError && 'code' in fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const { resolvedState, conflicts } = resolveGamificationConflicts(localState, remoteStats);
    const { error: upsertError } = await upsertGamificationState(userId, resolvedState);

    if (upsertError) throw upsertError;

    return buildSyncSuccessResult(conflicts);
  } catch (error) {
    return buildSyncErrorResult(error);
  }
}

// ============================================================
// SYNC PROGRESS
// ============================================================

/**
 * Sincroniza el progreso de lecciones con Supabase
 */
export async function syncProgress(
  userId: string,
  localProgress: LocalProgressData
): Promise<SyncResult> {
  if (!supabase) {
    return { success: true };
  }

  if (!isOnline()) {
    return { success: false, error: 'Offline' };
  }

  try {
    // Obtener progreso remoto
    const { data: remoteProgress, error: fetchError } = await supabase
      .from('lesson_progress')
      .select('lesson_id, status')
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    // Unir lecciones completadas (local + remote)
    const remoteCompleted = new Set(
      (remoteProgress || [])
        .filter(p => p.status === 'completed')
        .map(p => p.lesson_id)
    );

    const localCompleted = new Set(localProgress.completedLeaves);

    // Nuevas lecciones completadas localmente que no están en remoto
    const toUpload = localProgress.completedLeaves.filter(
      leafId => !remoteCompleted.has(leafId)
    );

    if (toUpload.length > 0) {
      const entries = toUpload.map(lessonId => ({
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

      const { error: insertError } = await supabase
        .from('lesson_progress')
        .upsert(entries, {
          onConflict: 'user_id,lesson_id',
        });

      if (insertError) throw insertError;
    }

    // Lecciones completadas en remoto que no están en local
    const fromRemote = Array.from(remoteCompleted).filter(
      leafId => !localCompleted.has(leafId)
    );

    const syncedAt = new Date().toISOString();
    setLastSyncTime(syncedAt);

    return {
      success: true,
      syncedAt,
      ...(fromRemote.length > 0 && {
        conflicts: [{ field: 'completedLeaves', localValue: localProgress.completedLeaves.length, remoteValue: remoteCompleted.size, resolvedValue: localCompleted.size + fromRemote.length }],
      }),
    };
  } catch (error) {
    // TODO: Add proper logging service for sync errors
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// FULL SYNC
// ============================================================

export interface FullSyncOptions {
  userId: string;
  gamification?: LocalGamificationState;
  progress?: LocalProgressData;
}

/**
 * Sincroniza todo el estado local con Supabase
 */
export async function fullSync(options: FullSyncOptions): Promise<SyncResult> {
  if (!supabase) {
    return { success: true };
  }

  if (!isOnline()) {
    return { success: false, error: 'Offline - sync queued' };
  }

  const results: SyncResult[] = [];

  if (options.gamification) {
    const gamResult = await syncGamification(options.userId, options.gamification);
    results.push(gamResult);
  }

  if (options.progress) {
    const progResult = await syncProgress(options.userId, options.progress);
    results.push(progResult);
  }

  // Agregar resultados
  const allSuccess = results.every(r => r.success);
  const allConflicts = results.flatMap(r => r.conflicts || []);
  const errors = results.filter(r => !r.success).map(r => r.error).join(', ');

  return {
    success: allSuccess,
    syncedAt: new Date().toISOString(),
    ...(allConflicts.length > 0 && { conflicts: allConflicts }),
    ...(errors && { error: errors }),
  };
}

// ============================================================
// AUTO-SYNC HOOK
// ============================================================

/**
 * Hook para sincronización automática
 * Llamar en el layout principal o en un provider
 */
export function createAutoSync(
  getUserId: () => string | null,
  getLocalState: () => FullSyncOptions | null,
  onSyncComplete?: (result: SyncResult) => void
) {
  let syncInterval: NodeJS.Timeout | null = null;
  const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos

  const performSync = async () => {
    const userId = getUserId();
    const localState = getLocalState();

    if (!userId || !localState) return;

    const result = await fullSync({ ...localState, userId });

    if (onSyncComplete) {
      onSyncComplete(result);
    }
  };

  const start = () => {
    // Sync inicial
    performSync();

    // Sync periódico
    syncInterval = setInterval(performSync, SYNC_INTERVAL);

    // Sync cuando vuelve online
    const cleanup = registerConnectivityListeners(
      () => {
        performSync();
      },
      () => {
        // Sync paused while offline
      }
    );

    return () => {
      if (syncInterval) clearInterval(syncInterval);
      cleanup();
    };
  };

  return { start, performSync };
}
