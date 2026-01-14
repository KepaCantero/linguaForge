/**
 * SyncProvider Component
 *
 * Provider que habilita la sincronización automática con Supabase.
 * Utiliza el hook useAutoSync para mantener los stores de Zustand sincronizados.
 *
 * Características:
 * - Sincronización automática cuando cambian los stores
 * - Sincronización periódica cada 5 minutos
 * - Sincronización al volver a estar online
 * - Indicador de estado de sincronización
 * - Sincronización manual disponible
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import type { SyncStatus } from '@/hooks/useAutoSync';

// ============================================================
// TYPES
// ============================================================

interface SyncContextValue {
  syncStatus: SyncStatus;
  manualSync: () => Promise<void>;
  forceSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

// ============================================================
// PROVIDER
// ============================================================

export function SyncProvider({ children }: { children: ReactNode }) {
  const { syncStatus, manualSync: autoSyncManual, forceSync: autoSyncForce } = useAutoSync();

  const manualSync = async () => {
    await autoSyncManual();
  };

  const forceSync = async () => {
    await autoSyncForce();
  };

  const value: SyncContextValue = {
    syncStatus,
    manualSync,
    forceSync,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
      <SyncIndicator status={syncStatus} />
    </SyncContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
}

// ============================================================
// INDICATOR COMPONENT
// ============================================================

interface SyncIndicatorProps {
  status: SyncStatus;
}

function SyncIndicator({ status }: SyncIndicatorProps) {
  if (typeof window === 'undefined') return null;

  const getIndicatorColor = (): string => {
    if (status.isSyncing) return 'bg-yellow-500';
    if (!status.isOnline) return 'bg-red-500';
    if (status.pendingSync) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getTooltip = (): string => {
    if (status.isSyncing) return 'Sincronizando...';
    if (!status.isOnline) return 'Sin conexión - pendiente de sincronización';
    if (status.pendingSync) return 'Pendiente de sincronización';
    if (status.lastSync) {
      const lastSyncDate = new Date(status.lastSync);
      const now = new Date();
      const diffMs = now.getTime() - lastSyncDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      return `Sincronizado hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    }
    return 'Sincronizado';
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-700"
      title={getTooltip()}
    >
      <div className={`w-2 h-2 rounded-full ${getIndicatorColor()} ${
        status.isSyncing ? 'animate-pulse' : ''
      }`} />
      <span className="text-xs text-gray-300">
        {status.isSyncing ? 'Syncing...' : !status.isOnline ? 'Offline' : 'Synced'}
      </span>
      {status.lastResult && !status.lastResult.success && (
        <span className="text-xs text-red-400" title={status.lastResult.error}>
          ⚠️
        </span>
      )}
    </div>
  );
}
