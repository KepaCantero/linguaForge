import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================
// TYPES
// ============================================================

interface NodeProgress {
  nodeId: string;
  completedLessons: string[];
  currentLessonIndex: number;
  completedExercises: number;
  totalExercises: number;
  percentage: number;
  isUnlocked: boolean;
  isComplete: boolean;
}

interface CurrentExercise {
  nodeId: string;
  lessonId: string;
  exerciseIndex: number;
  totalExercises: number;
}

interface NodeProgressState {
  nodes: Record<string, NodeProgress>;
  currentExercise: CurrentExercise | null;
}

interface NodeProgressActions {
  initGuidedNodes: (nodeIds: string[]) => void;
  startLesson: (nodeId: string, lessonId: string, totalExercises: number) => void;
  completeExercise: (nodeId: string) => void;
  completeLesson: (nodeId: string, lessonId: string) => void;
  unlockNextNode: (currentNodeId: string) => void;
  getNodeProgress: (nodeId: string) => NodeProgress | undefined;
  isNodeUnlocked: (nodeId: string) => boolean;
  resetProgress: () => void;
}

type NodeProgressStore = NodeProgressState & NodeProgressActions;

// ============================================================
// CONSTANTS
// ============================================================

const GUIDED_NODE_ORDER = ['node-1', 'node-2', 'node-3', 'node-4', 'node-5'] as const;
const LESSONS_PER_NODE = 4;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function createDefaultNodeProgress(nodeId: string, isFirst: boolean): NodeProgress {
  return {
    nodeId,
    completedLessons: [],
    currentLessonIndex: 0,
    completedExercises: 0,
    totalExercises: 0,
    percentage: 0,
    isUnlocked: isFirst,
    isComplete: false,
  };
}

function updateNodeInStore(
  nodes: Record<string, NodeProgress>,
  nodeId: string,
  updates: Partial<NodeProgress>
): Record<string, NodeProgress> {
  const node = nodes[nodeId];
  if (!node) return nodes;

  return {
    ...nodes,
    [nodeId]: { ...node, ...updates },
  };
}

function calculateExercisePercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((completed / total) * 100), 100);
}

function calculateLessonPercentage(completedLessonsCount: number): number {
  return Math.min(Math.round((completedLessonsCount / LESSONS_PER_NODE) * 100), 100);
}

function getNextNodeIndex(currentNodeId: string): number {
  return (GUIDED_NODE_ORDER as readonly string[]).indexOf(currentNodeId);
}

function shouldUnlockNext(currentIndex: number): boolean {
  return currentIndex >= 0 && currentIndex < GUIDED_NODE_ORDER.length - 1;
}

function createExerciseProgress(
  nodes: Record<string, NodeProgress>,
  nodeId: string,
  exerciseIndex: number
): { nodes: Record<string, NodeProgress>; currentExercise: CurrentExercise | null } {
  const node = nodes[nodeId];
  if (!node) {
    return { nodes, currentExercise: null };
  }

  const newCompletedExercises = node.completedExercises + 1;
  const newPercentage = calculateExercisePercentage(newCompletedExercises, node.totalExercises);

  return {
    nodes: updateNodeInStore(nodes, nodeId, {
      completedExercises: newCompletedExercises,
      percentage: newPercentage,
    }),
    currentExercise: {
      nodeId,
      lessonId: '',
      exerciseIndex: exerciseIndex + 1,
      totalExercises: node.totalExercises,
    },
  };
}

function createLessonProgress(
  nodes: Record<string, NodeProgress>,
  nodeId: string,
  lessonId: string
): Record<string, NodeProgress> {
  const node = nodes[nodeId];
  if (!node) return nodes;

  const completedLessons = node.completedLessons.includes(lessonId)
    ? node.completedLessons
    : [...node.completedLessons, lessonId];

  const percentage = calculateLessonPercentage(completedLessons.length);
  const isComplete = percentage >= 100;

  return updateNodeInStore(nodes, nodeId, {
    completedLessons,
    currentLessonIndex: completedLessons.length,
    percentage,
    isComplete,
  });
}

// ============================================================
// STORE
// ============================================================

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
          const existing = get().nodes[nodeId];
          nodes[nodeId] = existing ?? createDefaultNodeProgress(nodeId, index === 0);
        });
        set({ nodes });
      },

      startLesson: (nodeId, lessonId, totalExercises) => {
        set({
          currentExercise: { nodeId, lessonId, exerciseIndex: 0, totalExercises },
        });

        set((state) => {
          const node = state.nodes[nodeId];
          if (!node) return state;

          return {
            nodes: updateNodeInStore(state.nodes, nodeId, {
              totalExercises: Math.max(node.totalExercises, totalExercises),
            }),
          };
        });
      },

      completeExercise: (nodeId) => {
        set((state) => {
          const result = createExerciseProgress(state.nodes, nodeId, state.currentExercise?.exerciseIndex ?? 0);
          return {
            nodes: result.nodes,
            currentExercise: result.currentExercise ?? state.currentExercise,
          };
        });
      },

      completeLesson: (nodeId, lessonId) => {
        set((state) => ({
          nodes: createLessonProgress(state.nodes, nodeId, lessonId),
          currentExercise: null,
        }));

        const updatedNode = get().nodes[nodeId];
        if (updatedNode?.isComplete) {
          get().unlockNextNode(nodeId);
        }
      },

      unlockNextNode: (currentNodeId) => {
        const currentIndex = getNextNodeIndex(currentNodeId);
        if (!shouldUnlockNext(currentIndex)) return;

        const nextNodeId = GUIDED_NODE_ORDER[currentIndex + 1];

        set((state) => {
          const nextNode = state.nodes[nextNodeId];
          if (!nextNode || nextNode.isUnlocked) return state;

          return {
            nodes: updateNodeInStore(state.nodes, nextNodeId, { isUnlocked: true }),
          };
        });
      },

      getNodeProgress: (nodeId) => {
        return get().nodes[nodeId];
      },

      isNodeUnlocked: (nodeId) => {
        return get().nodes[nodeId]?.isUnlocked ?? false;
      },

      resetProgress: () => set(initialState),
    }),
    {
      name: 'linguaforge-node-progress',
    }
  )
);

// ============================================================
// HOOKS
// ============================================================

export function useNodeProgress(nodeId: string) {
  return useNodeProgressStore((state) => state.nodes[nodeId]);
}

export function useCurrentExercise() {
  return useNodeProgressStore((state) => state.currentExercise);
}

export function useIsNodeUnlocked(nodeId: string) {
  return useNodeProgressStore((state) => state.nodes[nodeId]?.isUnlocked ?? false);
}
