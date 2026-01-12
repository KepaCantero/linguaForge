import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TreeProgress, NodeStatus } from '@/types';

interface TreeProgressStore {
  // Estado
  treeProgress: Record<string, TreeProgress>;
  expandedBranch: string | null;

  // Acciones
  initTreeProgress: (treeId: string) => void;
  expandBranch: (branchId: string | null) => void;
  completeLeaf: (treeId: string, leafId: string) => void;
  setActiveLeaf: (treeId: string, leafId: string | null) => void;
  resetTreeProgress: () => void;

  // Selectores
  getLeafStatus: (treeId: string, branchIndex: number, leafIndex: number) => NodeStatus;
  getBranchProgress: (treeId: string, branchId: string | number) => { completed: number; total: number };
  getOverallProgress: (treeId: string) => { completed: number; total: number };
}

const initialState = {
  treeProgress: {} as Record<string, TreeProgress>,
  expandedBranch: null as string | null,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getInitialCompletedLeaves(): string[] {
  return [
    // Branch 1 - Identity (completed)
    'leaf-1-1-greetings',
    'leaf-1-2-introduce',
    'leaf-1-3-personal-info',
    // Branch 2 - Time (completed)
    'leaf-2-1-numbers',
    'leaf-2-2-dates',
    'leaf-2-3-hour',
    // Branch 3 - Location (completed)
    'leaf-3-1-countries',
    'leaf-3-2-city',
    'leaf-3-3-transport',
  ];
}

function isLeafCompleted(completedLeaves: string[], leafId: string): boolean {
  return completedLeaves.some(id => id.includes(leafId.split('-').slice(0, 3).join('-')));
}

function isArea0Completed(progress: TreeProgress | undefined): boolean {
  if (!progress) return false;
  const area0Completed = progress.completedLeaves.filter(
    id => id.startsWith('nodo-0-') ||
          id.includes('nodo-0-1') ||
          id.includes('nodo-0-2') ||
          id.includes('nodo-0-3') ||
          id.includes('nodo-0-4') ||
          id.includes('nodo-0-5') ||
          id.includes('nodo-0-6') ||
          id.includes('nodo-0-7')
  ).length;
  return area0Completed >= 5;
}

function getLeafStatusForBranch(
  progress: TreeProgress | undefined,
  branchIndex: number,
  leafIndex: number,
  leafId: string
): NodeStatus {
  // Ya completada?
  if (progress && isLeafCompleted(progress.completedLeaves, leafId)) {
    return 'completed';
  }

  // ÁREA 0 (branchIndex 0): siempre activa desde el inicio
  if (branchIndex === 0) {
    return 'active';
  }

  // Para otras áreas (branchIndex > 0): verificar si ÁREA 0 está completa
  if (!isArea0Completed(progress)) {
    return 'locked';
  }

  // Primera hoja de rama: requiere progreso en rama anterior
  if (leafIndex === 0) {
    const prevBranchPrefix = `leaf-${branchIndex}`;
    const prevBranchHasProgress = progress?.completedLeaves.some(
      id => id.includes(prevBranchPrefix)
    ) ?? false;
    return prevBranchHasProgress ? 'active' : 'locked';
  }

  // Hojas 2 y 3: requieren hoja anterior completada
  const prevLeafPrefix = `leaf-${branchIndex + 1}-${leafIndex}`;
  const prevLeafCompleted = progress?.completedLeaves.some(
    id => id.includes(prevLeafPrefix)
  ) ?? false;
  return prevLeafCompleted ? 'active' : 'locked';
}

function calculateBranchProgress(
  completedLeaves: string[],
  branchId: string | number
): { completed: number; total: number } {
  let branchNumber: string;
  let branchPrefix: string;

  if (typeof branchId === 'string') {
    const parts = branchId.split('-');
    branchNumber = parts[parts.length - 1];
    branchPrefix = branchId;
  } else {
    branchNumber = String(branchId);
    branchPrefix = `leaf-${branchNumber}`;
  }

  const completedInBranch = completedLeaves.filter(id => {
    if (typeof branchId === 'string') {
      return id.startsWith(branchPrefix + '-') ||
             id.includes(branchPrefix) ||
             (id.startsWith('leaf-') && id.includes(`-${branchNumber}-`));
    }
    return id.includes(`leaf-${branchNumber}-`) ||
           id.startsWith(`leaf-${branchNumber}-`);
  }).length;

  return { completed: completedInBranch, total: 0 };
}

function createTreeProgress(treeId: string, completedLeaves: string[]): TreeProgress {
  return {
    treeId,
    completedLeaves,
    activeBranch: null,
    activeLeaf: null,
  };
}

// ============================================
// STORE
// ============================================

export const useTreeProgressStore = create<TreeProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initTreeProgress: (treeId) => {
        const current = get().treeProgress[treeId];
        if (!current) {
          const initialCompletedLeaves = getInitialCompletedLeaves();
          set((state) => ({
            treeProgress: {
              ...state.treeProgress,
              [treeId]: createTreeProgress(treeId, initialCompletedLeaves),
            },
          }));
        }
      },

      expandBranch: (branchId) => {
        set({ expandedBranch: branchId });
      },

      completeLeaf: (treeId, leafId) => {
        set((state) => {
          const current = state.treeProgress[treeId] || createTreeProgress(treeId, []);

          if (current.completedLeaves.includes(leafId)) {
            return state;
          }

          return {
            treeProgress: {
              ...state.treeProgress,
              [treeId]: {
                ...current,
                completedLeaves: [...current.completedLeaves, leafId],
              },
            },
          };
        });
      },

      setActiveLeaf: (treeId, leafId) => {
        set((state) => {
          const current = state.treeProgress[treeId] || createTreeProgress(treeId, []);

          return {
            treeProgress: {
              ...state.treeProgress,
              [treeId]: {
                ...current,
                activeLeaf: leafId,
              },
            },
          };
        });
      },

      resetTreeProgress: () => set(initialState),

      getLeafStatus: (treeId, branchIndex, leafIndex) => {
        const progress = get().treeProgress[treeId];
        const leafId = `leaf-${branchIndex + 1}-${leafIndex + 1}`;
        return getLeafStatusForBranch(progress, branchIndex, leafIndex, leafId);
      },

      getBranchProgress: (treeId, branchId) => {
        const progress = get().treeProgress[treeId];
        if (!progress) return { completed: 0, total: 0 };
        return calculateBranchProgress(progress.completedLeaves, branchId);
      },

      getOverallProgress: (treeId) => {
        const progress = get().treeProgress[treeId];
        return {
          completed: progress?.completedLeaves.length ?? 0,
          total: 33,
        };
      },
    }),
    {
      name: 'french-app-tree-progress',
    }
  )
);
