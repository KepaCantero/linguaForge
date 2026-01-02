import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Progreso de un nodo individual
interface NodeProgress {
  nodeId: string;
  completedLessons: string[]; // IDs de lecciones completadas
  currentLessonIndex: number;
  completedExercises: number;
  totalExercises: number;
  percentage: number; // 0-100
  isUnlocked: boolean;
  isComplete: boolean;
}

// Progreso de ejercicio actual
interface CurrentExercise {
  nodeId: string;
  lessonId: string;
  exerciseIndex: number;
  totalExercises: number;
}

interface NodeProgressState {
  // Progreso por nodo
  nodes: Record<string, NodeProgress>;

  // Ejercicio actual en progreso
  currentExercise: CurrentExercise | null;
}

interface NodeProgressActions {
  // Inicializar nodos del modo guiado
  initGuidedNodes: (nodeIds: string[]) => void;

  // Empezar una lección
  startLesson: (nodeId: string, lessonId: string, totalExercises: number) => void;

  // Completar un ejercicio
  completeExercise: (nodeId: string, correct: boolean) => void;

  // Completar una lección
  completeLesson: (nodeId: string, lessonId: string) => void;

  // Desbloquear el siguiente nodo
  unlockNextNode: (currentNodeId: string) => void;

  // Obtener progreso de un nodo
  getNodeProgress: (nodeId: string) => NodeProgress | undefined;

  // Verificar si un nodo está desbloqueado
  isNodeUnlocked: (nodeId: string) => boolean;

  // Reset
  resetProgress: () => void;
}

type NodeProgressStore = NodeProgressState & NodeProgressActions;

const GUIDED_NODE_ORDER = ['node-1', 'node-2', 'node-3', 'node-4', 'node-5'];

const createDefaultNodeProgress = (nodeId: string, isFirst: boolean): NodeProgress => ({
  nodeId,
  completedLessons: [],
  currentLessonIndex: 0,
  completedExercises: 0,
  totalExercises: 0,
  percentage: 0,
  isUnlocked: isFirst, // Solo el primero está desbloqueado
  isComplete: false,
});

const initialState: NodeProgressState = {
  nodes: {},
  currentExercise: null,
};

export const useNodeProgressStore = create<NodeProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initGuidedNodes: (nodeIds) => {
        const nodes: Record<string, NodeProgress> = {};
        nodeIds.forEach((nodeId, index) => {
          // Si ya existe, mantener el progreso
          const existing = get().nodes[nodeId];
          if (existing) {
            nodes[nodeId] = existing;
          } else {
            nodes[nodeId] = createDefaultNodeProgress(nodeId, index === 0);
          }
        });
        set({ nodes });
      },

      startLesson: (nodeId, lessonId, totalExercises) => {
        set({
          currentExercise: {
            nodeId,
            lessonId,
            exerciseIndex: 0,
            totalExercises,
          },
        });

        // Actualizar total de ejercicios si es necesario
        set((state) => {
          const node = state.nodes[nodeId];
          if (!node) return state;

          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                totalExercises: Math.max(node.totalExercises, totalExercises),
              },
            },
          };
        });
      },

      completeExercise: (nodeId) => {
        set((state) => {
          const node = state.nodes[nodeId];
          const current = state.currentExercise;

          if (!node || !current) return state;

          const newCompletedExercises = node.completedExercises + 1;
          const newPercentage = node.totalExercises > 0
            ? Math.round((newCompletedExercises / node.totalExercises) * 100)
            : 0;

          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                completedExercises: newCompletedExercises,
                percentage: Math.min(newPercentage, 100),
              },
            },
            currentExercise: {
              ...current,
              exerciseIndex: current.exerciseIndex + 1,
            },
          };
        });
      },

      completeLesson: (nodeId, lessonId) => {
        set((state) => {
          const node = state.nodes[nodeId];
          if (!node) return state;

          const completedLessons = node.completedLessons.includes(lessonId)
            ? node.completedLessons
            : [...node.completedLessons, lessonId];

          // Una lección tiene ~4 ejercicios típicamente
          // Cada nodo tiene 4 lecciones = 16 ejercicios por nodo
          const LESSONS_PER_NODE = 4;
          const percentage = Math.round((completedLessons.length / LESSONS_PER_NODE) * 100);
          const isComplete = percentage >= 100;

          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                completedLessons,
                currentLessonIndex: completedLessons.length,
                percentage: Math.min(percentage, 100),
                isComplete,
              },
            },
            currentExercise: null,
          };
        });

        // Si el nodo está completo, desbloquear el siguiente
        const updatedNode = get().nodes[nodeId];
        if (updatedNode?.isComplete) {
          get().unlockNextNode(nodeId);
        }
      },

      unlockNextNode: (currentNodeId) => {
        const currentIndex = GUIDED_NODE_ORDER.indexOf(currentNodeId);
        if (currentIndex < 0 || currentIndex >= GUIDED_NODE_ORDER.length - 1) return;

        const nextNodeId = GUIDED_NODE_ORDER[currentIndex + 1];

        set((state) => {
          const nextNode = state.nodes[nextNodeId];
          if (!nextNode || nextNode.isUnlocked) return state;

          return {
            nodes: {
              ...state.nodes,
              [nextNodeId]: {
                ...nextNode,
                isUnlocked: true,
              },
            },
          };
        });
      },

      getNodeProgress: (nodeId) => {
        return get().nodes[nodeId];
      },

      isNodeUnlocked: (nodeId) => {
        const node = get().nodes[nodeId];
        return node?.isUnlocked ?? false;
      },

      resetProgress: () => set(initialState),
    }),
    {
      name: 'linguaforge-node-progress',
    }
  )
);

// Helper hooks
export function useNodeProgress(nodeId: string) {
  return useNodeProgressStore((state) => state.nodes[nodeId]);
}

export function useCurrentExercise() {
  return useNodeProgressStore((state) => state.currentExercise);
}

export function useIsNodeUnlocked(nodeId: string) {
  return useNodeProgressStore((state) => state.nodes[nodeId]?.isUnlocked ?? false);
}
