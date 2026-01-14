import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================
// TIPOS Y CONSTANTES
// ============================================================

/**
 * Cognitive Load Theory (CLT) - Teoría de la Carga Cognitiva
 *
 * - Carga Intrínseca: Complejidad inherente del material (gramática, vocabulario nuevo)
 * - Carga Extraña: Distracciones y elementos no relevantes (animaciones, notificaciones)
 * - Carga Germana: Procesamiento profundo que lleva al aprendizaje (práctica, elaboración)
 *
 * Objetivo: Minimizar carga extraña, gestionar intrínseca, maximizar germana
 */

export interface CognitiveLoadMetrics {
  intrinsic: number;  // 0-100: Complejidad del contenido
  extraneous: number; // 0-100: Distracciones activas
  germane: number;    // 0-100: Procesamiento profundo
  total: number;      // Suma ponderada (máx recomendado: 70-80)
}

export interface SessionMetrics {
  startTime: number;
  exercisesCompleted: number;
  correctAnswers: number;
  totalAttempts: number;
  averageResponseTime: number; // ms
  peakLoad: number;           // Máxima carga alcanzada
  loadHistory: number[];      // Historial de carga cada 30s
}

export type FocusLevel = 'relaxed' | 'normal' | 'focused' | 'deep';

export interface CognitiveLoadState {
  // Estado actual de carga
  currentLoad: CognitiveLoadMetrics;

  // Modo Focus
  focusMode: boolean;
  focusLevel: FocusLevel;
  focusStartTime: number | null;

  // Métricas de sesión
  session: SessionMetrics | null;

  // Configuración
  autoFocusEnabled: boolean;     // Activar focus automático durante audio
  loadThreshold: number;         // Umbral para advertencias (default: 80)
  showLoadIndicator: boolean;    // Mostrar indicador de carga en UI
}

interface CognitiveLoadActions {
  // Gestión de carga
  updateIntrinsicLoad: (value: number, reason?: string) => void;
  updateExtraneousLoad: (value: number, reason?: string) => void;
  updateGermaneLoad: (value: number, reason?: string) => void;
  calculateTotalLoad: () => number;
  resetLoad: () => void;

  // Modo Focus
  enterFocusMode: (level?: FocusLevel) => void;
  exitFocusMode: () => void;
  toggleFocusMode: () => void;
  setAutoFocus: (enabled: boolean) => void;

  // Sesión
  startSession: () => void;
  endSession: () => SessionMetrics | null;
  recordExerciseCompletion: (correct: boolean, responseTime: number) => void;

  // Helpers
  getLoadStatus: () => 'low' | 'optimal' | 'high' | 'overload';
  shouldReduceComplexity: () => boolean;
  getRecommendedBreak: () => number; // minutos
}

type CognitiveLoadStore = CognitiveLoadState & CognitiveLoadActions;

// ============================================================
// CONSTANTES DE CONFIGURACIÓN
// ============================================================

const LOAD_WEIGHTS = {
  intrinsic: 0.4,   // 40% peso
  extraneous: 0.35, // 35% peso
  germane: 0.25,    // 25% peso (positivo - queremos maximizarlo)
};

const LOAD_THRESHOLDS = {
  low: 40,
  optimal: 70,
  high: 85,
  overload: 100,
};

const FOCUS_LEVEL_MODIFIERS: Record<FocusLevel, number> = {
  relaxed: 1.0,    // Sin reducción
  normal: 0.85,    // 15% reducción de carga extraña
  focused: 0.6,    // 40% reducción
  deep: 0.3,       // 70% reducción
};

// ============================================================
// INITIAL STATE
// ============================================================

const initialState: CognitiveLoadState = {
  currentLoad: {
    intrinsic: 30,
    extraneous: 20,
    germane: 50,
    total: 0,
  },
  focusMode: false,
  focusLevel: 'normal',
  focusStartTime: null,
  session: null,
  autoFocusEnabled: true,
  loadThreshold: 80,
  showLoadIndicator: false,
};

// ============================================================
// HELPER FUNCTIONS FOR STORE ACTIONS
// ============================================================

/**
 * Factory para acciones de gestión de carga
 */
const createLoadActions = (
  set: (partial: Partial<CognitiveLoadStore> | ((state: CognitiveLoadStore) => Partial<CognitiveLoadStore>)) => void,
  get: () => CognitiveLoadStore
) => ({
  updateIntrinsicLoad: (value: number, _reason?: string) => {
    const clamped = Math.max(0, Math.min(100, value));
    set((state) => {
      const newLoad = { ...state.currentLoad, intrinsic: clamped };
      const total = get().calculateTotalLoad();
      return { currentLoad: { ...newLoad, total } };
    });
  },

  updateExtraneousLoad: (value: number, _reason?: string) => {
    const clamped = Math.max(0, Math.min(100, value));
    const { focusMode, focusLevel } = get();

    // Aplicar modificador de focus
    const modifier = focusMode ? FOCUS_LEVEL_MODIFIERS[focusLevel] : 1;
    const adjustedValue = clamped * modifier;

    set((state) => {
      const newLoad = { ...state.currentLoad, extraneous: adjustedValue };
      const total = get().calculateTotalLoad();
      return { currentLoad: { ...newLoad, total } };
    });
  },

  updateGermaneLoad: (value: number, _reason?: string) => {
    const clamped = Math.max(0, Math.min(100, value));
    set((state) => {
      const newLoad = { ...state.currentLoad, germane: clamped };
      const total = get().calculateTotalLoad();
      return { currentLoad: { ...newLoad, total } };
    });
  },

  calculateTotalLoad: () => {
    const { currentLoad } = get();
    const total =
      currentLoad.intrinsic * LOAD_WEIGHTS.intrinsic +
      currentLoad.extraneous * LOAD_WEIGHTS.extraneous -
      currentLoad.germane * LOAD_WEIGHTS.germane * 0.5;
    return Math.max(0, Math.min(100, total));
  },

  resetLoad: () => {
    set({
      currentLoad: {
        intrinsic: 30,
        extraneous: 20,
        germane: 50,
        total: 0,
      },
    });
  },
});

/**
 * Factory para acciones de modo focus
 */
const createFocusActions = (
  set: (partial: Partial<CognitiveLoadStore> | ((state: CognitiveLoadStore) => Partial<CognitiveLoadStore>)) => void,
  get: () => CognitiveLoadStore
) => ({
  enterFocusMode: (level: FocusLevel = 'focused') => {
    set({
      focusMode: true,
      focusLevel: level,
      focusStartTime: Date.now(),
    });

    const { currentLoad } = get();
    const modifier = FOCUS_LEVEL_MODIFIERS[level];
    set((state) => ({
      currentLoad: {
        ...state.currentLoad,
        extraneous: currentLoad.extraneous * modifier,
      },
    }));
  },

  exitFocusMode: () => {
    set({
      focusMode: false,
      focusLevel: 'normal',
      focusStartTime: null,
    });
  },

  toggleFocusMode: () => {
    const { focusMode } = get();
    if (focusMode) {
      get().exitFocusMode();
    } else {
      get().enterFocusMode();
    }
  },

  setAutoFocus: (enabled: boolean) => {
    set({ autoFocusEnabled: enabled });
  },
});

/**
 * Factory para acciones de sesión
 */
const createSessionActions = (
  set: (partial: Partial<CognitiveLoadStore> | ((state: CognitiveLoadStore) => Partial<CognitiveLoadStore>)) => void,
  get: () => CognitiveLoadStore
) => ({
  startSession: () => {
    set({
      session: {
        startTime: Date.now(),
        exercisesCompleted: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        averageResponseTime: 0,
        peakLoad: 0,
        loadHistory: [],
      },
    });
  },

  endSession: () => {
    const { session } = get();
    if (!session) return null;

    const finalSession = { ...session };
    set({ session: null });
    return finalSession;
  },

  recordExerciseCompletion: (correct: boolean, responseTime: number) => {
    const { session, currentLoad } = get();
    if (!session) return;

    const newTotal = session.totalAttempts + 1;
    const newAvgTime = (session.averageResponseTime * session.totalAttempts + responseTime) / newTotal;
    const total = get().calculateTotalLoad();

    set({
      session: {
        ...session,
        exercisesCompleted: session.exercisesCompleted + 1,
        correctAnswers: session.correctAnswers + (correct ? 1 : 0),
        totalAttempts: newTotal,
        averageResponseTime: newAvgTime,
        peakLoad: Math.max(session.peakLoad, total),
        loadHistory: [...session.loadHistory, total],
      },
    });

    // Ajustar carga germana basada en performance
    if (correct && responseTime < 3000) {
      get().updateGermaneLoad(Math.min(100, currentLoad.germane + 5), 'quick correct answer');
    } else if (!correct) {
      get().updateIntrinsicLoad(Math.min(100, currentLoad.intrinsic + 3), 'incorrect answer');
    }
  },
});

/**
 * Factory para funciones helper de análisis
 */
const createHelperActions = (
  _set: (partial: Partial<CognitiveLoadStore> | ((state: CognitiveLoadStore) => Partial<CognitiveLoadStore>)) => void,
  get: () => CognitiveLoadStore
) => ({
  getLoadStatus: (): 'low' | 'optimal' | 'high' | 'overload' => {
    const total = get().calculateTotalLoad();
    if (total <= LOAD_THRESHOLDS.low) return 'low';
    if (total <= LOAD_THRESHOLDS.optimal) return 'optimal';
    if (total <= LOAD_THRESHOLDS.high) return 'high';
    return 'overload';
  },

  shouldReduceComplexity: () => {
    const status = get().getLoadStatus();
    return status === 'high' || status === 'overload';
  },

  getRecommendedBreak: () => {
    const { session } = get();
    if (!session) return 0;

    const duration = (Date.now() - session.startTime) / 1000 / 60; // minutos
    const status = get().getLoadStatus();

    if (duration > 30 && status === 'overload') return 10;
    if (duration > 25 && status === 'high') return 5;
    if (duration > 45) return 5;

    return 0;
  },
});

// ============================================================
// STORE
// ============================================================

export const useCognitiveLoadStore = create<CognitiveLoadStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Gestión de carga
      ...createLoadActions(set, get),

      // Modo Focus
      ...createFocusActions(set, get),

      // Sesión
      ...createSessionActions(set, get),

      // Helpers
      ...createHelperActions(set, get),
    }),
    {
      name: 'linguaforge-cognitive-load',
      partialize: (state) => ({
        autoFocusEnabled: state.autoFocusEnabled,
        loadThreshold: state.loadThreshold,
        showLoadIndicator: state.showLoadIndicator,
      }),
    }
  )
);

// ============================================================
// HOOKS UTILITARIOS
// ============================================================

/**
 * Hook para obtener el estado de carga actual
 */
export function useCognitiveLoad() {
  const load = useCognitiveLoadStore((state) => state.currentLoad);
  const focusMode = useCognitiveLoadStore((state) => state.focusMode);
  const focusLevel = useCognitiveLoadStore((state) => state.focusLevel);

  // Calculate status outside of selector to avoid infinite loops
  const total = load.intrinsic * 0.4 + load.extraneous * 0.35 - (load.germane * 0.25 * 0.5);
  const clampedTotal = Math.max(0, Math.min(100, total));
  const status = getLoadStatus(clampedTotal);

  return { load, status, focusMode, focusLevel };
}

/**
 * Hook para el modo focus
 */
export function useFocusMode() {
  return useCognitiveLoadStore((state) => ({
    isActive: state.focusMode,
    level: state.focusLevel,
    enter: state.enterFocusMode,
    exit: state.exitFocusMode,
    toggle: state.toggleFocusMode,
    autoEnabled: state.autoFocusEnabled,
    setAutoEnabled: state.setAutoFocus,
  }));
}

/**
 * Determina el estado de carga cognitiva
 */
function getLoadStatus(totalLoad: number): 'low' | 'optimal' | 'high' | 'overload' {
  if (totalLoad <= LOAD_THRESHOLDS.low) return 'low';
  if (totalLoad <= LOAD_THRESHOLDS.optimal) return 'optimal';
  if (totalLoad <= LOAD_THRESHOLDS.high) return 'high';
  return 'overload';
}

/**
 * Calcula tiempo de descanso recomendado
 */
function calculateRecommendedBreak(duration: number, status: ReturnType<typeof getLoadStatus>): number {
  const OVERLOAD_THRESHOLD_MIN = 30;
  const HIGH_THRESHOLD_MIN = 25;
  const LONG_SESSION_THRESHOLD_MIN = 45;
  const OVERLOAD_BREAK_MIN = 10;
  const STANDARD_BREAK_MIN = 5;

  if (duration > OVERLOAD_THRESHOLD_MIN && status === 'overload') {
    return OVERLOAD_BREAK_MIN;
  }
  if (duration > HIGH_THRESHOLD_MIN && status === 'high') {
    return STANDARD_BREAK_MIN;
  }
  if (duration > LONG_SESSION_THRESHOLD_MIN) {
    return STANDARD_BREAK_MIN;
  }
  return 0;
}

/**
 * Hook para métricas de sesión
 */
export function useSessionMetrics() {
  const session = useCognitiveLoadStore((state) => state.session);
  const start = useCognitiveLoadStore((state) => state.startSession);
  const end = useCognitiveLoadStore((state) => state.endSession);
  const recordCompletion = useCognitiveLoadStore((state) => state.recordExerciseCompletion);

  // Calcular descanso recomendado
  const recommendedBreak = session
    ? calculateRecommendedBreak(
        (Date.now() - session.startTime) / 1000 / 60,
        getLoadStatus(session.peakLoad)
      )
    : 0;

  return { session, start, end, recordCompletion, recommendedBreak };
}
