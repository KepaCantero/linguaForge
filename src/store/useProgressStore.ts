import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LanguageCode, LevelCode, WorldProgress, JanusProgress } from '@/types';

interface ProgressStore {
  // Estado
  activeLanguage: LanguageCode;
  activeLevel: LevelCode;
  worldProgress: Record<string, WorldProgress>;

  // Acciones
  setActiveLanguage: (lang: LanguageCode) => void;
  setActiveLevel: (level: LevelCode) => void;
  initWorldProgress: (worldId: string) => void;
  completeMatrix: (worldId: string, matrixId: string) => void;
  setCurrentMatrix: (worldId: string, matrixId: string | null) => void;
  updateJanusProgress: (worldId: string, progress: Partial<JanusProgress>) => void;
  completeWorld: (worldId: string) => void;
  resetProgress: () => void;
}

const initialState = {
  activeLanguage: 'fr' as LanguageCode,
  activeLevel: 'A1' as LevelCode,
  worldProgress: {} as Record<string, WorldProgress>,
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActiveLanguage: (lang) => set({ activeLanguage: lang }),

      setActiveLevel: (level) => set({ activeLevel: level }),

      initWorldProgress: (worldId) => {
        const current = get().worldProgress[worldId];
        if (!current) {
          set((state) => ({
            worldProgress: {
              ...state.worldProgress,
              [worldId]: {
                completedMatrices: [],
                currentMatrixId: null,
                isComplete: false,
              },
            },
          }));
        }
      },

      completeMatrix: (worldId, matrixId) => {
        set((state) => {
          const current = state.worldProgress[worldId] || {
            completedMatrices: [],
            currentMatrixId: null,
            isComplete: false,
          };

          if (current.completedMatrices.includes(matrixId)) {
            return state;
          }

          return {
            worldProgress: {
              ...state.worldProgress,
              [worldId]: {
                ...current,
                completedMatrices: [...current.completedMatrices, matrixId],
              },
            },
          };
        });
      },

      setCurrentMatrix: (worldId, matrixId) => {
        set((state) => {
          const current = state.worldProgress[worldId] || {
            completedMatrices: [],
            currentMatrixId: null,
            isComplete: false,
          };

          return {
            worldProgress: {
              ...state.worldProgress,
              [worldId]: {
                ...current,
                currentMatrixId: matrixId,
              },
            },
          };
        });
      },

      updateJanusProgress: (worldId, progress) => {
        set((state) => {
          const current = state.worldProgress[worldId] || {
            completedMatrices: [],
            currentMatrixId: null,
            isComplete: false,
          };

          const currentJanus = current.janusProgress || {
            matrixId: worldId,
            cellUsage: {},
            combinations: [],
            totalCombinations: 0,
            uniqueCombinations: 0,
            isComplete: false,
          };

          return {
            worldProgress: {
              ...state.worldProgress,
              [worldId]: {
                ...current,
                janusProgress: {
                  ...currentJanus,
                  ...progress,
                },
              },
            },
          };
        });
      },

      completeWorld: (worldId) => {
        set((state) => {
          const current = state.worldProgress[worldId];
          if (!current) return state;

          return {
            worldProgress: {
              ...state.worldProgress,
              [worldId]: {
                ...current,
                isComplete: true,
              },
            },
          };
        });
      },

      resetProgress: () => set(initialState),
    }),
    {
      name: 'french-app-progress',
    }
  )
);
