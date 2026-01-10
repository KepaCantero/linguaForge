/**
 * useSessionStore - Gestión de sesión de aprendizaje
 *
 * Permite a los usuarios continuar donde lo dejaron:
 * - Guarda el progreso de la sesión actual
 * - Permite retomar ejercicios, SRS o input
 * - Persiste en localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

export type SessionType = 'exercise' | 'srs' | 'input' | 'lesson';

export interface LastSession {
  /** Tipo de sesión */
  type: SessionType;
  /** ID del nodo (para ejercicios/lecciones) */
  nodeId?: string;
  /** ID de la lección */
  lessonId?: string;
  /** Título descriptivo */
  title: string;
  /** Índice del ejercicio actual */
  exerciseIndex?: number;
  /** Total de ejercicios en la sesión */
  totalExercises?: number;
  /** Timestamp de cuando se guardó */
  timestamp: string;
  /** Progreso 0-100 */
  progress: number;
  /** URL para retomar */
  resumeUrl: string;
}

interface SessionStore {
  /** Última sesión guardada */
  lastSession: LastSession | null;

  /** Guardar sesión actual */
  saveSession: (session: Omit<LastSession, 'timestamp'>) => void;

  /** Actualizar progreso de sesión */
  updateProgress: (progress: number, exerciseIndex?: number) => void;

  /** Limpiar sesión (completada o descartada) */
  clearSession: () => void;

  /** Verificar si hay sesión activa reciente (menos de 24h) */
  hasRecentSession: () => boolean;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'linguaforge-session';
const SESSION_EXPIRY_HOURS = 24;

// ============================================
// STORE
// ============================================

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      lastSession: null,

      saveSession: (session) => {
        set({
          lastSession: {
            ...session,
            timestamp: new Date().toISOString(),
          },
        });
      },

      updateProgress: (progress, exerciseIndex) => {
        const current = get().lastSession;
        if (!current) return;

        set({
          lastSession: {
            ...current,
            progress,
            exerciseIndex: exerciseIndex ?? current.exerciseIndex,
            timestamp: new Date().toISOString(),
          },
        });
      },

      clearSession: () => {
        set({ lastSession: null });
      },

      hasRecentSession: () => {
        const session = get().lastSession;
        if (!session) return false;

        const sessionTime = new Date(session.timestamp).getTime();
        const now = Date.now();
        const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);

        return hoursDiff < SESSION_EXPIRY_HOURS;
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ lastSession: state.lastSession }),
    }
  )
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Crea una sesión de ejercicios para un nodo importado
 */
export function createExerciseSession(
  nodeId: string,
  title: string,
  exerciseIndex: number,
  totalExercises: number
): Omit<LastSession, 'timestamp'> {
  return {
    type: 'exercise',
    nodeId,
    title,
    exerciseIndex,
    totalExercises,
    progress: Math.round((exerciseIndex / totalExercises) * 100),
    resumeUrl: `/learn/imported/${nodeId}/exercises?start=${exerciseIndex}`,
  };
}

/**
 * Crea una sesión de lección estructurada
 */
export function createLessonSession(
  nodeId: string,
  lessonId: string,
  title: string,
  exerciseIndex: number,
  totalExercises: number
): Omit<LastSession, 'timestamp'> {
  return {
    type: 'lesson',
    nodeId,
    lessonId,
    title,
    exerciseIndex,
    totalExercises,
    progress: Math.round((exerciseIndex / totalExercises) * 100),
    resumeUrl: `/learn/node/${nodeId}/lesson/${lessonId}?exercise=${exerciseIndex}`,
  };
}

/**
 * Crea una sesión de repaso SRS
 */
export function createSRSSession(
  cardsReviewed: number,
  totalCards: number
): Omit<LastSession, 'timestamp'> {
  return {
    type: 'srs',
    title: 'Repaso de tarjetas',
    exerciseIndex: cardsReviewed,
    totalExercises: totalCards,
    progress: Math.round((cardsReviewed / totalCards) * 100),
    resumeUrl: '/decks/review',
  };
}

/**
 * Crea una sesión de input (video/audio/texto)
 */
export function createInputSession(
  title: string,
  inputType: 'video' | 'audio' | 'text'
): Omit<LastSession, 'timestamp'> {
  return {
    type: 'input',
    title,
    progress: 0,
    resumeUrl: `/input/${inputType}`,
  };
}
