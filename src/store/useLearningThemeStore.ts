/**
 * Learning Theme Store - Zustand store for managing learning themes
 *
 * This store provides CRUD operations and specialized queries for Learning Themes.
 * Learning Themes are logical groupings of related Nodes that form coherent learning units.
 *
 * Location: src/store/useLearningThemeStore.ts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Theme,
  ThemeMetadata,
  CreateThemeInput,
  UpdateThemeInput,
  ThemeFilters,
  ThemeCategory,
  CEFRLevel,
  ThemeRecommendation,
} from '@/types/theme';
import {
  generateThemeId,
  calculateDifficultyScore,
  calculateEstimatedStudyTime,
  validatePrerequisites,
} from '@/types/theme';

// ============================================================
// STORE STATE
// ============================================================

interface LearningThemeState {
  themes: Theme[];
  activeThemeId: string | null;
  completedThemes: string[]; // Theme IDs completados
}

// ============================================================
// STORE ACTIONS - FACTORY FUNCTIONS
// ============================================================

/**
 * Acciones CRUD básicas
 */
const createCRUDActions: (
  set: (partial: Partial<LearningThemeStore> | ((state: LearningThemeStore) => Partial<LearningThemeStore>)) => void,
  get: () => LearningThemeStore
) => {
  createTheme: (input: CreateThemeInput) => string;
  updateTheme: (themeId: string, updates: UpdateThemeInput) => void;
  deleteTheme: (themeId: string) => void;
  getTheme: (themeId: string) => Theme | undefined;
  resetThemes: () => void;
} = (
  set,
  get
) => ({
  /**
   * Crear un nuevo theme
   */
  createTheme: (input: CreateThemeInput): string => {
    const id = generateThemeId();
    const now = new Date().toISOString();

    // Calcular metadatos iniciales
    const metadata: ThemeMetadata = {
      wordCount: 0,
      estimatedStudyTime: calculateEstimatedStudyTime(0, input.level),
      difficultyScore: calculateDifficultyScore(
        input.category,
        input.level,
        input.prerequisites.length
      ),
      totalNodes: input.nodes.length,
      completedNodes: 0,
      averageNodeProgress: 0,
    };

    const newTheme: Theme = {
      ...input,
      id,
      metadata,
      createdAt: now,
      updatedAt: now,
    };

    set((state: LearningThemeStore) => ({
      themes: [...state.themes, newTheme],
    }));

    return id;
  },

  /**
   * Actualizar un theme existente
   */
  updateTheme: (themeId: string, updates: UpdateThemeInput): void => {
    set((state: LearningThemeStore) => ({
      themes: state.themes.map((theme: Theme) =>
        theme.id === themeId
          ? {
              ...theme,
              ...updates,
              updatedAt: new Date().toISOString(),
              // Recalcular dificultad si cambió categoría, nivel o prerrequisitos
              metadata: updates.category || updates.level || updates.prerequisites
                ? {
                    ...theme.metadata,
                    difficultyScore: calculateDifficultyScore(
                      updates.category || theme.category,
                      updates.level || theme.level,
                      updates.prerequisites?.length ?? theme.prerequisites.length
                    ),
                  }
                : theme.metadata,
            }
          : theme
      ),
    }));
  },

  /**
   * Eliminar un theme
   */
  deleteTheme: (themeId: string): void => {
    set((state: LearningThemeStore) => ({
      themes: state.themes.filter((theme: Theme) => theme.id !== themeId),
      activeThemeId: state.activeThemeId === themeId ? null : state.activeThemeId,
    }));
  },

  /**
   * Obtener un theme por ID
   */
  getTheme: (themeId: string): Theme | undefined => {
    return get().themes.find((theme: Theme) => theme.id === themeId);
  },

  /**
   * Resetear todos los themes
   */
  resetThemes: (): void => {
    set({ themes: [], activeThemeId: null, completedThemes: [] });
  },
});

/**
 * Acciones de gestión de nodos en themes
 */
const createNodeActions: (
  set: (partial: Partial<LearningThemeStore> | ((state: LearningThemeStore) => Partial<LearningThemeStore>)) => void,
  get: () => LearningThemeStore
) => {
  addNodeToTheme: (themeId: string, nodeId: string) => void;
  removeNodeFromTheme: (themeId: string, nodeId: string) => void;
  updateThemeProgress: (themeId: string, completedNodes: number, averageProgress: number) => void;
} = (
  set,
  _get
) => ({
  /**
   * Añadir un nodo a un theme
   */
  addNodeToTheme: (themeId: string, nodeId: string): void => {
    set((state: LearningThemeStore) => ({
      themes: state.themes.map((theme: Theme) =>
        theme.id === themeId && !theme.nodes.includes(nodeId)
          ? {
              ...theme,
              nodes: [...theme.nodes, nodeId],
              metadata: {
                ...theme.metadata,
                totalNodes: theme.metadata.totalNodes + 1,
              },
              updatedAt: new Date().toISOString(),
            }
          : theme
      ),
    }));
  },

  /**
   * Eliminar un nodo de un theme
   */
  removeNodeFromTheme: (themeId: string, nodeId: string): void => {
    set((state: LearningThemeStore) => ({
      themes: state.themes.map((theme: Theme) =>
        theme.id === themeId
          ? {
              ...theme,
              nodes: theme.nodes.filter((id: string) => id !== nodeId),
              metadata: {
                ...theme.metadata,
                totalNodes: Math.max(0, theme.metadata.totalNodes - 1),
              },
              updatedAt: new Date().toISOString(),
            }
          : theme
      ),
    }));
  },

  /**
   * Actualizar progreso de nodos de un theme
   */
  updateThemeProgress: (
    themeId: string,
    completedNodes: number,
    averageProgress: number
  ): void => {
    set((state: LearningThemeStore) => ({
      themes: state.themes.map((theme: Theme) =>
        theme.id === themeId
          ? {
              ...theme,
              metadata: {
                ...theme.metadata,
                completedNodes,
                averageNodeProgress: averageProgress,
              },
              updatedAt: new Date().toISOString(),
            }
          : theme
      ),
    }));
  },
});

/**
 * Acciones de consultas y filtros
 */
const createQueryActions: (
  _set: (partial: Partial<LearningThemeStore> | ((state: LearningThemeStore) => Partial<LearningThemeStore>)) => void,
  get: () => LearningThemeStore
) => {
  getThemesByCategory: (category: ThemeCategory) => Theme[];
  getThemesByLevel: (level: CEFRLevel) => Theme[];
  getFilteredThemes: (filters: ThemeFilters) => Theme[];
  getPrerequisites: (themeId: string) => Theme[];
  getDependentThemes: (themeId: string) => Theme[];
  isThemeLocked: (themeId: string) => boolean;
  getAvailableThemes: () => Theme[];
  getRecommendedThemes: (currentLevel: CEFRLevel, studiedThemes: string[], maxRecommendations?: number) => ThemeRecommendation[];
} = (_set, get) => ({
  /**
   * Obtener themes por categoría
   */
  getThemesByCategory: (category: ThemeCategory): Theme[] => {
    return get().themes.filter((theme: Theme) => theme.category === category);
  },

  /**
   * Obtener themes por nivel CEFR
   */
  getThemesByLevel: (level: CEFRLevel): Theme[] => {
    return get().themes.filter((theme: Theme) => theme.level === level);
  },

  /**
   * Obtener themes con filtros combinados
   */
  getFilteredThemes: (filters: ThemeFilters): Theme[] => {
    let filtered = get().themes;

    if (filters.category) {
      filtered = filtered.filter((theme: Theme) => theme.category === filters.category);
    }

    if (filters.level) {
      filtered = filtered.filter((theme: Theme) => theme.level === filters.level);
    }

    if (filters.isPremium !== undefined) {
      filtered = filtered.filter((theme: Theme) => theme.isPremium === filters.isPremium);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (theme: Theme) =>
          theme.title.toLowerCase().includes(query) ||
          theme.description.toLowerCase().includes(query)
      );
    }

    if (filters.hasPrerequisites !== undefined) {
      filtered = filtered.filter(
        (theme: Theme) =>
          filters.hasPrerequisites ? theme.prerequisites.length > 0 : theme.prerequisites.length === 0
      );
    }

    return filtered;
  },

  /**
   * Obtener prerrequisitos de un theme
   */
  getPrerequisites: (themeId: string): Theme[] => {
    const theme = get().getTheme(themeId);
    if (!theme || theme.prerequisites.length === 0) {
      return [];
    }

    return get().themes.filter((t: Theme) => theme.prerequisites.includes(t.id));
  },

  /**
   * Obtener themes que dependen de un theme dado
   */
  getDependentThemes: (themeId: string): Theme[] => {
    return get().themes.filter((theme: Theme) => theme.prerequisites.includes(themeId));
  },

  /**
   * Verificar si un theme está bloqueado por prerrequisitos
   */
  isThemeLocked: (themeId: string): boolean => {
    const { getPrerequisites, completedThemes } = get();
    const prerequisites = getPrerequisites(themeId);

    if (prerequisites.length === 0) {
      return false;
    }

    // Verificar si todos los prerrequisitos están completados
    return !prerequisites.every((prereq: Theme) => completedThemes.includes(prereq.id));
  },

  /**
   * Obtener themes disponibles (sin prerrequisitos pendientes)
   */
  getAvailableThemes: (): Theme[] => {
    const { themes, completedThemes } = get();

    return themes.filter((theme: Theme) => {
      // Si no tiene prerrequisitos, está disponible
      if (theme.prerequisites.length === 0) {
        return true;
      }

      // Si todos los prerrequisitos están completados, está disponible
      return theme.prerequisites.every((prereq: string) => completedThemes.includes(prereq));
    });
  },

  /**
   * Obtener recomendaciones de themes basadas en progreso
   */
  getRecommendedThemes: (
    currentLevel: CEFRLevel,
    studiedThemes: string[],
    maxRecommendations: number = 5
  ): ThemeRecommendation[] => {
    const { themes, completedThemes } = get();
    const recommendations: ThemeRecommendation[] = [];

    // Filtrar themes no estudiados del nivel actual o inferior
    const candidateThemes = themes.filter(
      (theme: Theme) =>
        !studiedThemes.includes(theme.id) &&
        theme.level <= currentLevel
    );

    for (const theme of candidateThemes) {
      const prereqValidation = validatePrerequisites(theme.id, completedThemes, themes);

      // Calcular preparación basada en prerrequisitos completados
      const estimatedReadiness = prereqValidation.met
        ? 100
        : Math.max(0, 100 - prereqValidation.missing.length * 25);

      // Determinar prioridad
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (estimatedReadiness === 100 && theme.level === currentLevel) {
        priority = 'high';
      } else if (estimatedReadiness >= 75) {
        priority = 'medium';
      }

      // Generar razón de recomendación
      const reasons: string[] = [];
      if (theme.level === currentLevel) {
        reasons.push('Apto para tu nivel actual');
      }
      if (theme.prerequisites.length === 0) {
        reasons.push('Sin prerrequisitos requeridos');
      }
      if (estimatedReadiness === 100) {
        reasons.push('Todos los prerrequisitos completados');
      }
      if (theme.category === 'basics') {
        reasons.push('Fundamento esencial');
      }

      recommendations.push({
        themeId: theme.id,
        reason: reasons.join('. ') || 'Theme disponible para estudio',
        priority,
        prerequisitesMet: prereqValidation.met,
        estimatedReadiness,
      });
    }

    // Ordenar por prioridad y preparación
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return b.estimatedReadiness - a.estimatedReadiness;
    });

    return recommendations.slice(0, maxRecommendations);
  },
});

/**
 * Acciones de progreso y completado
 */
const createProgressActions: (
  set: (partial: Partial<LearningThemeStore> | ((state: LearningThemeStore) => Partial<LearningThemeStore>)) => void,
  get: () => LearningThemeStore
) => {
  markThemeCompleted: (themeId: string) => void;
  markThemeUncompleted: (themeId: string) => void;
  isThemeCompleted: (themeId: string) => boolean;
  setActiveTheme: (themeId: string | null) => void;
  getActiveTheme: () => Theme | undefined;
} = (set, get) => ({
  /**
   * Marcar un theme como completado
   */
  markThemeCompleted: (themeId: string): void => {
    const { completedThemes } = get();

    if (!completedThemes.includes(themeId)) {
      set({
        completedThemes: [...completedThemes, themeId],
      });
    }
  },

  /**
   * Desmarcar un theme como completado
   */
  markThemeUncompleted: (themeId: string): void => {
    set((state: LearningThemeStore) => ({
      completedThemes: state.completedThemes.filter((id: string) => id !== themeId),
    }));
  },

  /**
   * Verificar si un theme está completado
   */
  isThemeCompleted: (themeId: string): boolean => {
    return get().completedThemes.includes(themeId);
  },

  /**
   * Establecer el theme activo
   */
  setActiveTheme: (themeId: string | null): void => {
    set({ activeThemeId: themeId });
  },

  /**
   * Obtener el theme activo
   */
  getActiveTheme: (): Theme | undefined => {
    const { activeThemeId, themes } = get();
    return activeThemeId ? themes.find((theme: Theme) => theme.id === activeThemeId) : undefined;
  },
});

// ============================================================
// STORE TYPE
// ============================================================

type LearningThemeStore = LearningThemeState &
  ReturnType<typeof createCRUDActions> &
  ReturnType<typeof createNodeActions> &
  ReturnType<typeof createQueryActions> &
  ReturnType<typeof createProgressActions>;

// ============================================================
// STORE CREATION
// ============================================================

const initialState: LearningThemeState = {
  themes: [],
  activeThemeId: null,
  completedThemes: [],
};

export const useLearningThemeStore = create<LearningThemeStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      ...createCRUDActions(set, get),
      ...createNodeActions(set, get),
      ...createQueryActions(set, get),
      ...createProgressActions(set, get),
    }),
    {
      name: 'linguaforge-learning-theme-storage',
      onRehydrateStorage: () => () => {
        // Rehidratación completada
        console.info('[LearningThemeStore] Rehidratación completada');
      },
    }
  )
);

// ============================================================
// HELPER HOOKS
// ============================================================

/**
 * Hook para obtener todos los themes
 */
export function useLearningThemes(): Theme[] {
  return useLearningThemeStore((state) => state.themes);
}

/**
 * Hook para obtener un theme específico
 */
export function useLearningTheme(themeId: string): Theme | undefined {
  return useLearningThemeStore((state) => state.themes.find((theme: Theme) => theme.id === themeId));
}

/**
 * Hook para obtener el theme activo
 */
export function useActiveLearningTheme(): Theme | undefined {
  return useLearningThemeStore((state) => state.getActiveTheme());
}

/**
 * Hook para obtener themes disponibles
 */
export function useAvailableLearningThemes(): Theme[] {
  return useLearningThemeStore((state) => state.getAvailableThemes());
}

/**
 * Hook para obtener recomendaciones
 */
export function useLearningThemeRecommendations(
  currentLevel: CEFRLevel,
  maxRecommendations?: number
): ThemeRecommendation[] {
  const studiedThemes = useLearningThemeStore((state) => state.completedThemes);
  const getRecommendedThemes = useLearningThemeStore((state) => state.getRecommendedThemes);

  return getRecommendedThemes(currentLevel, studiedThemes, maxRecommendations);
}

/**
 * Hook para verificar si un theme está bloqueado
 */
export function useLearningThemeLocked(themeId: string): boolean {
  return useLearningThemeStore((state) => state.isThemeLocked(themeId));
}

/**
 * Hook para obtener progreso de un theme
 */
export function useLearningThemeProgress(themeId: string): {
  isCompleted: boolean;
  isLocked: boolean;
  progress: number;
} {
  const theme = useLearningTheme(themeId);
  const isCompleted = useLearningThemeStore((state) => state.isThemeCompleted(themeId));
  const isLocked = useLearningThemeStore((state) => state.isThemeLocked(themeId));

  const progress = theme?.metadata.averageNodeProgress ?? 0;

  return {
    isCompleted,
    isLocked,
    progress,
  };
}
