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
// HELPERS
// ============================================

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _isToday(dateString: string): boolean {
  return dateString.startsWith(getTodayString());
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
        
        const timeSpent = state.warmupStartTime
          ? Math.round((Date.now() - state.warmupStartTime) / 1000)
          : 0;
        
        const result: WarmupResult = {
          warmupId: state.currentWarmup.id,
          missionId: state.currentMissionId,
          score: Math.max(0, Math.min(100, score)),
          timeSpent,
          completedAt: new Date().toISOString(),
          skipped: false,
        };
        
        // Actualizar historial
        const newHistory = [...state.warmupHistory, result];
        const newCompletedToday = new Set(state.completedToday);
        newCompletedToday.add(state.currentMissionId);
        
        // Actualizar métricas
        const totalCompleted = state.metrics.totalCompleted + 1;
        const averageScore = state.metrics.totalCompleted > 0
          ? (state.metrics.averageScore * state.metrics.totalCompleted + score) / totalCompleted
          : score;
        
        set({
          warmupCompleted: true,
          warmupScore: score,
          warmupHistory: newHistory,
          completedToday: newCompletedToday,
          metrics: {
            ...state.metrics,
            totalCompleted,
            averageScore,
            lastCompleted: result.completedAt,
          },
        });
        
        return result;
      },
      
      // Saltar calentamiento
      skipWarmup: () => {
        const state = get();
        if (!state.currentWarmup || !state.currentMissionId) {
          return;
        }
        
        const result: WarmupResult = {
          warmupId: state.currentWarmup.id,
          missionId: state.currentMissionId,
          score: 0,
          timeSpent: 0,
          completedAt: new Date().toISOString(),
          skipped: true,
        };
        
        const newHistory = [...state.warmupHistory, result];
        const newCompletedToday = new Set(state.completedToday);
        newCompletedToday.add(state.currentMissionId);
        
        const totalSkipped = state.metrics.totalSkipped + 1;
        
        set({
          warmupCompleted: true,
          warmupScore: 0,
          warmupHistory: newHistory,
          completedToday: newCompletedToday,
          metrics: {
            ...state.metrics,
            totalSkipped,
          },
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
        const state = get();
        // No mostrar si ya se completó hoy
        return !state.completedToday.has(missionId);
      },
      
      // Obtener calentamiento para tipo de misión
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getWarmupForMission: (_missionType: MissionType) => {
        // Esta función será implementada por warmupSelector service
        // Por ahora retorna null, se implementará en TAREA 6
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
        const state = get();
        const history = state.warmupHistory;
        
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
        
        const completionRate = history.length > 0
          ? completed.length / history.length
          : 0;
        
        const skipRate = history.length > 0
          ? skipped.length / history.length
          : 0;
        
        const lastCompleted = history.length > 0
          ? history[history.length - 1].completedAt
          : null;
        
        return {
          averageScore,
          averageTime,
          completionRate,
          skipRate,
          lastCompleted,
        };
      },
    }),
    {
      name: 'french-app-warmups',
      // Custom storage para manejar Set
      storage: {
        getItem: (name) => {
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
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              completedToday: Array.from(value.state?.completedToday || []),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

