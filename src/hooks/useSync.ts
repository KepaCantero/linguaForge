'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useTreeProgressStore } from '@/store/useTreeProgressStore';
import type { TreeProgress } from '@/schemas/topicTree';
import {
  fullSync,
  isOnline,
  registerConnectivityListeners,
  getLastSyncTime,
  type SyncResult,
} from '@/services/syncService';

interface UseSyncOptions {
  autoSync?: boolean;
  syncInterval?: number; // ms
}

interface UseSyncReturn {
  isSyncing: boolean;
  lastSyncTime: string | null;
  isOnline: boolean;
  syncNow: () => Promise<SyncResult | null>;
  lastResult: SyncResult | null;
}

/**
 * Hook para sincronización automática con Supabase
 */
export function useSync(options: UseSyncOptions = {}): UseSyncReturn {
  const { autoSync = true, syncInterval = 5 * 60 * 1000 } = options;

  const { user, isConfigured } = useAuth();
  const gamification = useGamificationStore();
  const treeProgress = useTreeProgressStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);

  // Función de sync
  const syncNow = useCallback(async (): Promise<SyncResult | null> => {
    if (!user?.id || !isConfigured) {
      return null;
    }

    if (!isOnline()) {
      return { success: false, error: 'Offline' };
    }

    setIsSyncing(true);

    try {
      // Obtener todas las hojas completadas de todos los árboles
      const allCompletedLeaves: string[] = [];
      let currentActiveBranch: string | null = null;
      let currentActiveLeaf: string | null = null;

      (Object.values(treeProgress.treeProgress) as TreeProgress[]).forEach((progress) => {
        if (progress.completedLeaves) {
          allCompletedLeaves.push(...progress.completedLeaves);
        }
        if (progress.activeBranch) {
          currentActiveBranch = progress.activeBranch;
        }
        if (progress.activeLeaf) {
          currentActiveLeaf = progress.activeLeaf;
        }
      });

      const result = await fullSync({
        userId: user.id,
        gamification: {
          xp: gamification.xp,
          level: gamification.level,
          coins: gamification.coins,
          gems: gamification.gems,
          streak: gamification.streak,
          lastActiveDate: gamification.lastActiveDate,
          longestStreak: gamification.longestStreak,
        },
        progress: {
          completedLeaves: allCompletedLeaves,
          activeBranch: currentActiveBranch,
          activeLeaf: currentActiveLeaf,
        },
      });

      setLastResult(result);

      if (result.success && result.syncedAt) {
        setLastSyncTime(result.syncedAt);
      }

      return result;
    } catch (error) {
      console.error('[useSync] Sync failed:', error);
      const errorResult: SyncResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsSyncing(false);
    }
  }, [user?.id, isConfigured, gamification, treeProgress]);

  // Cargar última fecha de sync
  useEffect(() => {
    setLastSyncTime(getLastSyncTime());
  }, []);

  // Detectar conectividad
  useEffect(() => {
    setOnline(isOnline());

    const cleanup = registerConnectivityListeners(
      () => {
        setOnline(true);
        // Sync cuando volvemos online
        if (autoSync) {
          syncNow();
        }
      },
      () => {
        setOnline(false);
      }
    );

    return cleanup;
  }, [autoSync, syncNow]);

  // Auto-sync periódico
  useEffect(() => {
    if (!autoSync || !user?.id || !isConfigured) {
      return;
    }

    // Sync inicial después de un pequeño delay
    const initialTimeout = setTimeout(() => {
      syncNow();
    }, 2000);

    // Sync periódico
    const interval = setInterval(() => {
      if (isOnline()) {
        syncNow();
      }
    }, syncInterval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [autoSync, syncInterval, user?.id, isConfigured, syncNow]);

  return {
    isSyncing,
    lastSyncTime,
    isOnline: online,
    syncNow,
    lastResult,
  };
}

/**
 * Hook simple para mostrar estado de sync en UI
 */
export function useSyncStatus() {
  const { isSyncing, lastSyncTime, isOnline } = useSync({ autoSync: false });

  return {
    isSyncing,
    lastSyncTime,
    isOnline,
    status: isSyncing
      ? 'syncing'
      : isOnline
      ? 'online'
      : 'offline',
  };
}
