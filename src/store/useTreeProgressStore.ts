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

        // ÁREA 0 (branchIndex 0): siempre activa desde el inicio
        if (branchIndex === 0) {
          return 'active';
        }

        // Para otras áreas (branchIndex > 0): verificar si ÁREA 0 está completa
        // ÁREA 0 tiene 7 nodos (nodo-0-1 a nodo-0-7)
        const area0Completed = progress?.completedLeaves.filter(
          id => id.startsWith('nodo-0-') || 
                id.includes('nodo-0-1') || 
                id.includes('nodo-0-2') ||
                id.includes('nodo-0-3') ||
                id.includes('nodo-0-4') ||
                id.includes('nodo-0-5') ||
                id.includes('nodo-0-6') ||
                id.includes('nodo-0-7')
        ).length ?? 0;

        // Requerir al menos 5 de 7 nodos de ÁREA 0 completados para desbloquear otras áreas
        const area0MinimumCompleted = 5;
        if (area0Completed < area0MinimumCompleted) {
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
      },

      getBranchProgress: (treeId, branchId) => {
        const progress = get().treeProgress[treeId];
        if (!progress) return { completed: 0, total: 0 };

        // branchId puede ser un string (ej: "a1-A-1") o un número (legacy)
        let branchNumber: string;
        let branchPrefix: string;
        
        if (typeof branchId === 'string') {
          // Formato nuevo: a1-A-1 -> extraer el número final y el prefijo completo
          const parts = branchId.split('-');
          branchNumber = parts[parts.length - 1];
          branchPrefix = branchId; // Usar el ID completo como prefijo
        } else {
          // Formato legacy: número directo
          branchNumber = String(branchId);
          branchPrefix = `leaf-${branchNumber}`;
        }

        const completedInBranch = progress.completedLeaves.filter(
          id => {
            // Buscar hojas que pertenecen a esta rama
            if (typeof branchId === 'string') {
              // Para IDs nuevos como "a1-A-1", buscar hojas que empiecen con ese prefijo
              // Ej: "a1-A-1-1", "a1-A-1-2", etc. o "leaf-1-1-greetings" si es legacy
              return id.startsWith(branchPrefix + '-') || 
                     id.includes(branchPrefix) ||
                     (id.startsWith('leaf-') && id.includes(`-${branchNumber}-`));
            } else {
              // Para IDs legacy, buscar formato leaf-X-Y
              return id.includes(`leaf-${branchNumber}-`) || 
                     id.startsWith(`leaf-${branchNumber}-`);
            }
          }
        ).length;

        // Necesitamos el total de hojas, pero no lo tenemos aquí
        // Retornamos solo completed por ahora
        return { completed: completedInBranch, total: 0 };
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
