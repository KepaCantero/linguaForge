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
  getBranchProgress: (treeId: string, branchId: string) => number;
  getOverallProgress: (treeId: string) => { completed: number; total: number };
}

const initialState = {
  treeProgress: {} as Record<string, TreeProgress>,
  expandedBranch: null as string | null,
};

export const useTreeProgressStore = create<TreeProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initTreeProgress: (treeId) => {
        const current = get().treeProgress[treeId];
        if (!current) {
          // Pre-populate with some completed leaves to show progress
          // This unlocks up to branch 4 (Airbnb/Housing)
          const initialCompletedLeaves = [
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

          set((state) => ({
            treeProgress: {
              ...state.treeProgress,
              [treeId]: {
                treeId,
                completedLeaves: initialCompletedLeaves,
                activeBranch: null,
                activeLeaf: null,
              },
            },
          }));
        }
      },

      expandBranch: (branchId) => {
        set({ expandedBranch: branchId });
      },

      completeLeaf: (treeId, leafId) => {
        set((state) => {
          const current = state.treeProgress[treeId] || {
            treeId,
            completedLeaves: [],
            activeBranch: null,
            activeLeaf: null,
          };

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
          const current = state.treeProgress[treeId] || {
            treeId,
            completedLeaves: [],
            activeBranch: null,
            activeLeaf: null,
          };

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

        // Ya completada?
        if (progress?.completedLeaves.some(id => id.includes(leafId.split('-').slice(0, 3).join('-')))) {
          return 'completed';
        }

        // Primera rama, primera hoja siempre activa
        if (branchIndex === 0 && leafIndex === 0) {
          return 'active';
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
      },

      getBranchProgress: (treeId, branchId) => {
        const progress = get().treeProgress[treeId];
        if (!progress) return 0;

        const branchNumber = branchId.split('-')[1];
        const completedInBranch = progress.completedLeaves.filter(
          id => id.includes(`leaf-${branchNumber}-`)
        ).length;

        return completedInBranch;
      },

      getOverallProgress: (treeId) => {
        const progress = get().treeProgress[treeId];
        return {
          completed: progress?.completedLeaves.length ?? 0,
          total: 33, // 11 ramas * 3 hojas
        };
      },
    }),
    {
      name: 'french-app-tree-progress',
    }
  )
);
