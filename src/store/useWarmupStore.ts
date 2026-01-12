import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Warmup, WarmupResult, MissionType } from '@/schemas/warmup';

// ============================================
// INTERFACES
// ============================================

interface WarmupStore {
  // Estado actual
  currentWarmup: Warmup | null;
  currentMissionId: string | null;
  warmupCompleted: boolean;
  warmupScore: number; // 0-100
  warmupStartTime: number | null;

  // Historial
  warmupHistory: WarmupResult[];
  completedToday: Set<string>; // IDs de misiones con calentamiento completado hoy

  // Métricas
  metrics: {
    totalCompleted: number;
    totalSkipped: number;
    averageScore: number;
    lastCompleted: string | null;
  };

  // Acciones
  startWarmup: (warmup: Warmup, missionId: string) => void;
  completeWarmup: (score: number) => WarmupResult;
  skipWarmup: () => void;
  resetCurrentWarmup: () => void;

  // Consultas
  shouldShowWarmup: (missionId: string) => boolean;
  getWarmupForMission: (missionType: MissionType) => Warmup | null;
  getWarmupHistory: (missionId?: string) => WarmupResult[];
  getMetrics: () => {
    averageScore: number;
    averageTime: number;
    completionRate: number;
    skipRate: number;
    lastCompleted: string | null;
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateWarmupResult(
  warmupId: string,
  missionId: string,
  score: number,
  startTime: number | null,
  skipped: boolean
): WarmupResult {
  return {
    warmupId,
    missionId,
    score: Math.max(0, Math.min(100, score)),
    timeSpent: startTime ? Math.round((Date.now() - startTime) / 1000) : 0,
    completedAt: new Date().toISOString(),
    skipped,
  };
}

function updateMetricsWithCompletion(
  oldMetrics: WarmupStore['metrics'],
  score: number,
  completedAt: string,
  isSkipped: boolean
): WarmupStore['metrics'] {
  if (isSkipped) {
    return {
      ...oldMetrics,
      totalSkipped: oldMetrics.totalSkipped + 1,
    };
  }

  const totalCompleted = oldMetrics.totalCompleted + 1;
  const averageScore = oldMetrics.totalCompleted > 0
    ? (oldMetrics.averageScore * oldMetrics.totalCompleted + score) / totalCompleted
    : score;

  return {
    ...oldMetrics,
    totalCompleted,
    averageScore,
    lastCompleted: completedAt,
  };
}

function getWarmupMetrics(history: WarmupResult[]) {
  if (history.length === 0) {
    return {
      averageScore: 0,
      averageTime: 0,
      completionRate: 0,
      skipRate: 0,
      lastCompleted: null,
    };
  }

  const completed = history.filter(r => !r.skipped);
  const skipped = history.filter(r => r.skipped);

  const averageScore = completed.length > 0
    ? completed.reduce((sum, r) => sum + r.score, 0) / completed.length
    : 0;

  const averageTime = completed.length > 0
    ? completed.reduce((sum, r) => sum + r.timeSpent, 0) / completed.length
    : 0;

  const completionRate = history.length > 0 ? completed.length / history.length : 0;
  const skipRate = history.length > 0 ? skipped.length / history.length : 0;

  const lastCompleted = history.length > 0 ? history[history.length - 1].completedAt : null;

  return { averageScore, averageTime, completionRate, skipRate, lastCompleted };
}

function createCustomStorage() {
  return {
    getItem: (name: string) => {
      const str = localStorage.getItem(name);
      if (!str) return null;
      try {
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          state: {
            ...parsed.state,
            completedToday: new Set(parsed.state?.completedToday || []),
          },
        };
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: unknown) => {
      const storedValue = value as { state?: { completedToday?: Set<string> }; version?: number };
      const toStore = {
        ...(storedValue as object),
        state: {
          ...(storedValue.state as object),
          completedToday: Array.from(storedValue.state?.completedToday || []),
        },
      };
      localStorage.setItem(name, JSON.stringify(toStore));
    },
    removeItem: (name: string) => localStorage.removeItem(name),
  };
}

// ============================================
// STORE
// ============================================

export const useWarmupStore = create<WarmupStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentWarmup: null,
      currentMissionId: null,
      warmupCompleted: false,
      warmupScore: 0,
      warmupStartTime: null,
      warmupHistory: [],
      completedToday: new Set(),

      metrics: {
        totalCompleted: 0,
        totalSkipped: 0,
        averageScore: 0,
        lastCompleted: null,
      },

      // Iniciar calentamiento
      startWarmup: (warmup: Warmup, missionId: string) => {
        set({
          currentWarmup: warmup,
          currentMissionId: missionId,
          warmupCompleted: false,
          warmupScore: 0,
          warmupStartTime: Date.now(),
        });
      },

      // Completar calentamiento
      completeWarmup: (score: number) => {
        const state = get();
        if (!state.currentWarmup || !state.currentMissionId) {
          throw new Error('No warmup in progress');
        }

        const result = calculateWarmupResult(
          state.currentWarmup.id,
          state.currentMissionId,
          score,
          state.warmupStartTime,
          false
        );

        const newCompletedToday = new Set(state.completedToday);
        newCompletedToday.add(state.currentMissionId);

        set({
          warmupCompleted: true,
          warmupScore: score,
          warmupHistory: [...state.warmupHistory, result],
          completedToday: newCompletedToday,
          metrics: updateMetricsWithCompletion(state.metrics, score, result.completedAt, false),
        });

        return result;
      },

      // Saltar calentamiento
      skipWarmup: () => {
        const state = get();
        if (!state.currentWarmup || !state.currentMissionId) {
          return;
        }

        const result = calculateWarmupResult(
          state.currentWarmup.id,
          state.currentMissionId,
          0,
          state.warmupStartTime,
          true
        );

        const newCompletedToday = new Set(state.completedToday);
        newCompletedToday.add(state.currentMissionId);

        set({
          warmupCompleted: true,
          warmupScore: 0,
          warmupHistory: [...state.warmupHistory, result],
          completedToday: newCompletedToday,
          metrics: updateMetricsWithCompletion(state.metrics, 0, result.completedAt, true),
        });
      },

      // Resetear calentamiento actual
      resetCurrentWarmup: () => {
        set({
          currentWarmup: null,
          currentMissionId: null,
          warmupCompleted: false,
          warmupScore: 0,
          warmupStartTime: null,
        });
      },

      // Verificar si debe mostrar calentamiento
      shouldShowWarmup: (missionId: string) => {
        return !get().completedToday.has(missionId);
      },

      // Obtener calentamiento para tipo de misión
      getWarmupForMission: (_missionType: MissionType) => {
        return null;
      },

      // Obtener historial de calentamientos
      getWarmupHistory: (missionId?: string) => {
        const state = get();
        if (missionId) {
          return state.warmupHistory.filter(r => r.missionId === missionId);
        }
        return state.warmupHistory;
      },

      // Obtener métricas agregadas
      getMetrics: () => {
        return getWarmupMetrics(get().warmupHistory);
      },
    }),
    {
      name: 'french-app-warmups',
      storage: createCustomStorage(),
    }
  )
);
