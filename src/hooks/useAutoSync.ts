/**
 * Hook de sincronización automática
 * Conecta los stores de Zustand con syncService para persistir en Supabase
 *
 * Sincroniza:
 * - Gamification (xp, level, coins, gems, streak)
 * - Progress (completed leaves, active branch/leaf)
 * - SRS (cards, reviews)
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useSRSStore } from '@/store/useSRSStore';
import {
  fullSync,
  type LocalGamificationState,
  type LocalProgressData,
  type LocalSRSData,
  type SyncResult,
  getLastSyncTime,
  isOnline,
} from '@/services/syncService';

// ============================================================
// TYPES
// ============================================================

export interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  isSyncing: boolean;
  pendingSync: boolean;
  lastResult: SyncResult | null;
}

export interface UseAutoSyncReturn {
  syncStatus: SyncStatus;
  manualSync: () => Promise<SyncResult>;
  forceSync: () => Promise<SyncResult>;
}

// ============================================================
// CONSTANTS
// ============================================================

const SYNC_DEBOUNCE_MS = 2000;
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function extractGamificationState(store: ReturnType<typeof useGamificationStore.getState>): LocalGamificationState {
  return {
    xp: store.xp,
    level: store.level,
    coins: store.coins,
    gems: store.gems,
    streak: store.streak,
    lastActiveDate: store.lastActiveDate,
    longestStreak: store.longestStreak,
  };
}

function extractProgressData(store: ReturnType<typeof useProgressStore.getState>): LocalProgressData {
  const completedLeaves: string[] = [];
  let activeBranch: string | null = null;
  let activeLeaf: string | null = null;

  for (const [worldId, progress] of Object.entries(store.worldProgress)) {
    if (progress.completedMatrices) {
      completedLeaves.push(...progress.completedMatrices);
    }
    if (progress.currentMatrixId && !activeLeaf) {
      activeLeaf = progress.currentMatrixId;
      activeBranch = worldId;
    }
  }

  return {
    completedLeaves,
    activeBranch,
    activeLeaf,
  };
}

function extractSRSData(store: ReturnType<typeof useSRSStore.getState>): LocalSRSData {
  return {
    cards: store.cards.map(card => ({
      id: card.id,
      phrase: card.phrase,
      translation: card.translation,
      status: card.status,
      nextReviewDate: card.nextReviewDate,
      reviewHistory: card.reviewHistory,
      fsrs: card.fsrs,
    })),
    reviewedToday: store.reviewedToday,
    lastReviewDate: store.lastReviewDate,
  };
}

// ============================================================
// HOOK
// ============================================================

export function useAutoSync(): UseAutoSyncReturn {
  const { user } = useAuth();
  const gamificationStore = useGamificationStore();
  const progressStore = useProgressStore();
  const srsStore = useSRSStore();

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: isOnline(),
    lastSync: getLastSyncTime(),
    isSyncing: false,
    pendingSync: false,
    lastResult: null,
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Realiza la sincronización completa con Supabase
   */
  const performSync = useCallback(async (isManual = false): Promise<SyncResult> => {
    if (!user?.id) {
      return { success: false, error: 'No user' };
    }

    if (!isOnline()) {
      setSyncStatus(prev => ({ ...prev, pendingSync: true }));
      return { success: false, error: 'Offline' };
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      const result = await fullSync({
        userId: user.id,
        gamification: extractGamificationState(gamificationStore),
        progress: extractProgressData(progressStore),
        srs: extractSRSData(srsStore),
      });

      if (isMountedRef.current) {
        setSyncStatus({
          isOnline: true,
          lastSync: result.syncedAt || getLastSyncTime(),
          isSyncing: false,
          pendingSync: !result.success,
          lastResult: result,
        });
      }

      return result;
    } catch (error) {
      const errorResult: SyncResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      if (isMountedRef.current) {
        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          pendingSync: true,
          lastResult: errorResult,
        }));
      }

      return errorResult;
    }
  }, [user, gamificationStore, progressStore, srsStore]);

  /**
   * Sincronización debounced (se llama cuando cambian los stores)
   */
  const scheduleSync = useCallback(() => {
    if (!user?.id) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      performSync();
    }, SYNC_DEBOUNCE_MS);
  }, [user, performSync]);

  /**
   * Sincronización manual (inmediata)
   */
  const manualSync = useCallback(async (): Promise<SyncResult> => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
    return performSync(true);
  }, [performSync]);

  /**
   * Sincronización forzada (incluso si estamos offline, se intentará)
   */
  const forceSync = useCallback(async (): Promise<SyncResult> => {
    return performSync(true);
  }, [performSync]);

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Sincronización inicial
  useEffect(() => {
    if (!user?.id) return;

    performSync();
  }, [user?.id]);

  // Sincronización periódica
  useEffect(() => {
    if (!user?.id) return;

    intervalRef.current = setInterval(() => {
      if (isOnline()) {
        performSync();
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?.id, performSync]);

  // Listeners de conectividad
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      if (syncStatus.pendingSync) {
        performSync();
      }
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);

    return () => {
      globalThis.removeEventListener('online', handleOnline);
      globalThis.removeEventListener('offline', handleOffline);
    };
  }, [syncStatus.pendingSync, performSync]);

  // Suscribirse a cambios en los stores
  useEffect(() => {
    if (!user?.id) return;

    let lastGamification = JSON.stringify({
      xp: gamificationStore.xp,
      level: gamificationStore.level,
      coins: gamificationStore.coins,
      gems: gamificationStore.gems,
      streak: gamificationStore.streak,
    });
    let lastProgress = JSON.stringify(progressStore.worldProgress);
    let lastSRS = JSON.stringify({
      cardsCount: srsStore.cards.length,
      reviewedToday: srsStore.reviewedToday,
    });

    const unsubscribeGamification = useGamificationStore.subscribe((state) => {
      const current = JSON.stringify({
        xp: state.xp,
        level: state.level,
        coins: state.coins,
        gems: state.gems,
        streak: state.streak,
      });
      if (current !== lastGamification) {
        lastGamification = current;
        scheduleSync();
      }
    });

    const unsubscribeProgress = useProgressStore.subscribe((state) => {
      const current = JSON.stringify(state.worldProgress);
      if (current !== lastProgress) {
        lastProgress = current;
        scheduleSync();
      }
    });

    const unsubscribeSRS = useSRSStore.subscribe((state) => {
      const current = JSON.stringify({
        cardsCount: state.cards.length,
        reviewedToday: state.reviewedToday,
      });
      if (current !== lastSRS) {
        lastSRS = current;
        scheduleSync();
      }
    });

    return () => {
      unsubscribeGamification();
      unsubscribeProgress();
      unsubscribeSRS();
    };
  }, [user?.id, scheduleSync, gamificationStore, progressStore, srsStore]);

  return {
    syncStatus,
    manualSync,
    forceSync,
  };
}
