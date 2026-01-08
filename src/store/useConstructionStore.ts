/**
 * useConstructionStore - Store para Sistema de Construcción 3D
 * Gestiona materiales, elementos, proyectos y progreso de construcción
 *
 * TAREA 2.8.9.2: Extender sistema de gamificación con construcción
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type MaterialRarity,
  type MaterialTexture,
  type BuildingElementType,
  type ConstructionState,
  ConstructionStateSchema,
} from '@/schemas/construction';

// ============================================
// TIPOS
// ============================================

interface ConstructionActions {
  // Materiales
  addMaterial: (materialId: string, amount: number) => void;
  removeMaterial: (materialId: string, amount: number) => boolean;
  getMaterialCount: (materialId: string) => number;
  hasMaterials: (requirements: { materialId: string; amount: number }[]) => boolean;

  // Elementos
  unlockElement: (elementId: string) => void;
  isElementUnlocked: (elementId: string) => boolean;
  updateElementProgress: (elementId: string, progress: number) => void;
  completeElement: (elementId: string) => void;

  // Proyectos
  startProject: (projectId: string) => void;
  completeProject: (projectId: string) => void;
  abandonProject: () => void;
  isProjectActive: () => boolean;

  // Hitos
  addMilestone: (milestone: number) => void;
  hasMilestone: (milestone: number) => boolean;

  // Estadísticas
  incrementBuilds: () => void;
  getStats: () => ConstructionStats;

  // Reset
  resetConstruction: () => void;
}

interface ConstructionStats {
  totalBuilds: number;
  uniqueElementsUnlocked: number;
  projectsCompleted: number;
  totalMaterialsCollected: number;
  milestonesReached: number;
}

type ConstructionStore = ConstructionState & ConstructionActions;

// ============================================
// ESTADO INICIAL
// ============================================

const initialState: ConstructionState = {
  unlockedElements: [],
  currentProject: null,
  elementProgress: {},
  materialInventory: {},
  completedProjects: [],
  totalBuilds: 0,
  constructionMilestones: [],
  lastBuildDate: null,
};

// ============================================
// MATERIALES PREDEFINIDOS
// ============================================

export interface MaterialDefinition {
  id: string;
  name: string;
  rarity: MaterialRarity;
  texture: MaterialTexture;
  xpCost: number;
  coinCost: number;
}

export const MATERIALS: Record<string, MaterialDefinition> = {
  // Madera
  oak_wood: { id: 'oak_wood', name: 'Roble', rarity: 'common', texture: 'wood', xpCost: 10, coinCost: 5 },
  mahogany_wood: { id: 'mahogany_wood', name: 'Caoba', rarity: 'uncommon', texture: 'wood', xpCost: 25, coinCost: 15 },
  ebony_wood: { id: 'ebony_wood', name: 'Ébano', rarity: 'rare', texture: 'wood', xpCost: 50, coinCost: 30 },

  // Piedra
  limestone: { id: 'limestone', name: 'Caliza', rarity: 'common', texture: 'stone', xpCost: 10, coinCost: 5 },
  marble: { id: 'marble', name: 'Mármol', rarity: 'uncommon', texture: 'stone', xpCost: 30, coinCost: 20 },
  obsidian: { id: 'obsidian', name: 'Obsidiana', rarity: 'rare', texture: 'stone', xpCost: 60, coinCost: 40 },

  // Vidrio
  clear_glass: { id: 'clear_glass', name: 'Vidrio Claro', rarity: 'common', texture: 'glass', xpCost: 15, coinCost: 10 },
  stained_glass: { id: 'stained_glass', name: 'Vitral', rarity: 'uncommon', texture: 'glass', xpCost: 35, coinCost: 25 },
  crystal_glass: { id: 'crystal_glass', name: 'Cristal', rarity: 'rare', texture: 'glass', xpCost: 70, coinCost: 50 },

  // Metal
  iron: { id: 'iron', name: 'Hierro', rarity: 'common', texture: 'metal', xpCost: 20, coinCost: 12 },
  bronze: { id: 'bronze', name: 'Bronce', rarity: 'uncommon', texture: 'metal', xpCost: 40, coinCost: 28 },
  gold: { id: 'gold', name: 'Oro', rarity: 'epic', texture: 'metal', xpCost: 100, coinCost: 75 },

  // Cristal mágico
  amethyst: { id: 'amethyst', name: 'Amatista', rarity: 'rare', texture: 'crystal', xpCost: 80, coinCost: 60 },
  sapphire: { id: 'sapphire', name: 'Zafiro', rarity: 'epic', texture: 'crystal', xpCost: 150, coinCost: 100 },
  diamond: { id: 'diamond', name: 'Diamante', rarity: 'legendary', texture: 'crystal', xpCost: 300, coinCost: 200 },
};

// ============================================
// ELEMENTOS CONSTRUCTIVOS
// ============================================

export interface ElementDefinition {
  id: string;
  name: string;
  type: BuildingElementType;
  requiredMaterials: { materialId: string; amount: number }[];
  unlockLevel: number;
  xpReward: number;
}

export const ELEMENTS: Record<string, ElementDefinition> = {
  // Fundamentos
  stone_foundation: {
    id: 'stone_foundation',
    name: 'Cimiento de Piedra',
    type: 'foundation',
    requiredMaterials: [{ materialId: 'limestone', amount: 5 }],
    unlockLevel: 1,
    xpReward: 50,
  },
  marble_foundation: {
    id: 'marble_foundation',
    name: 'Cimiento de Mármol',
    type: 'foundation',
    requiredMaterials: [{ materialId: 'marble', amount: 5 }],
    unlockLevel: 3,
    xpReward: 100,
  },

  // Paredes
  wooden_wall: {
    id: 'wooden_wall',
    name: 'Muro de Madera',
    type: 'wall',
    requiredMaterials: [{ materialId: 'oak_wood', amount: 3 }],
    unlockLevel: 1,
    xpReward: 30,
  },
  stone_wall: {
    id: 'stone_wall',
    name: 'Muro de Piedra',
    type: 'wall',
    requiredMaterials: [{ materialId: 'limestone', amount: 4 }],
    unlockLevel: 2,
    xpReward: 40,
  },

  // Pilares
  marble_pillar: {
    id: 'marble_pillar',
    name: 'Pilar de Mármol',
    type: 'pillar',
    requiredMaterials: [{ materialId: 'marble', amount: 2 }],
    unlockLevel: 3,
    xpReward: 60,
  },

  // Techos
  wooden_roof: {
    id: 'wooden_roof',
    name: 'Techo de Madera',
    type: 'roof',
    requiredMaterials: [{ materialId: 'oak_wood', amount: 4 }],
    unlockLevel: 2,
    xpReward: 45,
  },

  // Torres
  stone_tower: {
    id: 'stone_tower',
    name: 'Torre de Piedra',
    type: 'tower',
    requiredMaterials: [
      { materialId: 'limestone', amount: 8 },
      { materialId: 'iron', amount: 2 },
    ],
    unlockLevel: 4,
    xpReward: 150,
  },

  // Jardín
  flower_garden: {
    id: 'flower_garden',
    name: 'Jardín Florido',
    type: 'garden',
    requiredMaterials: [{ materialId: 'oak_wood', amount: 2 }],
    unlockLevel: 2,
    xpReward: 35,
  },

  // Fuente
  marble_fountain: {
    id: 'marble_fountain',
    name: 'Fuente de Mármol',
    type: 'fountain',
    requiredMaterials: [
      { materialId: 'marble', amount: 4 },
      { materialId: 'clear_glass', amount: 2 },
    ],
    unlockLevel: 4,
    xpReward: 120,
  },

  // Ventanas
  glass_window: {
    id: 'glass_window',
    name: 'Ventana de Cristal',
    type: 'window',
    requiredMaterials: [
      { materialId: 'clear_glass', amount: 2 },
      { materialId: 'iron', amount: 1 },
    ],
    unlockLevel: 2,
    xpReward: 40,
  },
  stained_window: {
    id: 'stained_window',
    name: 'Vitral',
    type: 'window',
    requiredMaterials: [
      { materialId: 'stained_glass', amount: 3 },
      { materialId: 'bronze', amount: 1 },
    ],
    unlockLevel: 5,
    xpReward: 100,
  },

  // Puertas
  wooden_door: {
    id: 'wooden_door',
    name: 'Puerta de Madera',
    type: 'door',
    requiredMaterials: [
      { materialId: 'oak_wood', amount: 2 },
      { materialId: 'iron', amount: 1 },
    ],
    unlockLevel: 1,
    xpReward: 25,
  },
  golden_gate: {
    id: 'golden_gate',
    name: 'Portón Dorado',
    type: 'gate',
    requiredMaterials: [
      { materialId: 'gold', amount: 3 },
      { materialId: 'iron', amount: 4 },
    ],
    unlockLevel: 7,
    xpReward: 250,
  },

  // Cúpula
  crystal_dome: {
    id: 'crystal_dome',
    name: 'Cúpula de Cristal',
    type: 'dome',
    requiredMaterials: [
      { materialId: 'crystal_glass', amount: 6 },
      { materialId: 'gold', amount: 2 },
    ],
    unlockLevel: 8,
    xpReward: 400,
  },
};

// ============================================
// HITOS DE CONSTRUCCIÓN
// ============================================

export const CONSTRUCTION_MILESTONES = [
  { builds: 1, reward: { xp: 50, coins: 25 }, title: 'Primer Cimiento' },
  { builds: 5, reward: { xp: 100, coins: 50 }, title: 'Constructor Novato' },
  { builds: 10, reward: { xp: 200, coins: 100 }, title: 'Arquitecto Aprendiz' },
  { builds: 25, reward: { xp: 500, coins: 250 }, title: 'Maestro Constructor' },
  { builds: 50, reward: { xp: 1000, coins: 500 }, title: 'Arquitecto Real' },
  { builds: 100, reward: { xp: 2500, coins: 1000 }, title: 'Leyenda del Oficio' },
];

// ============================================
// STORE
// ============================================

export const useConstructionStore = create<ConstructionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // MATERIALES
      // ============================================

      addMaterial: (materialId, amount) => {
        set((state) => ({
          materialInventory: {
            ...state.materialInventory,
            [materialId]: (state.materialInventory[materialId] || 0) + amount,
          },
        }));
      },

      removeMaterial: (materialId, amount) => {
        const current = get().materialInventory[materialId] || 0;
        if (current < amount) return false;

        set((state) => ({
          materialInventory: {
            ...state.materialInventory,
            [materialId]: current - amount,
          },
        }));
        return true;
      },

      getMaterialCount: (materialId) => {
        return get().materialInventory[materialId] || 0;
      },

      hasMaterials: (requirements) => {
        const inventory = get().materialInventory;
        return requirements.every(
          (req) => (inventory[req.materialId] || 0) >= req.amount
        );
      },

      // ============================================
      // ELEMENTOS
      // ============================================

      unlockElement: (elementId) => {
        set((state) => {
          if (state.unlockedElements.includes(elementId)) return state;
          return {
            unlockedElements: [...state.unlockedElements, elementId],
          };
        });
      },

      isElementUnlocked: (elementId) => {
        return get().unlockedElements.includes(elementId);
      },

      updateElementProgress: (elementId, progress) => {
        set((state) => ({
          elementProgress: {
            ...state.elementProgress,
            [elementId]: Math.min(100, Math.max(0, progress)),
          },
        }));
      },

      completeElement: (elementId) => {
        const state = get();

        // Verificar materiales
        const element = ELEMENTS[elementId];
        if (!element) return;

        if (!state.hasMaterials(element.requiredMaterials)) return;

        // Consumir materiales
        element.requiredMaterials.forEach((req) => {
          state.removeMaterial(req.materialId, req.amount);
        });

        // Marcar como completo
        set((state) => ({
          elementProgress: {
            ...state.elementProgress,
            [elementId]: 100,
          },
          totalBuilds: state.totalBuilds + 1,
          lastBuildDate: new Date().toISOString(),
        }));

        // Desbloquear elemento si no está
        state.unlockElement(elementId);
      },

      // ============================================
      // PROYECTOS
      // ============================================

      startProject: (projectId) => {
        set({ currentProject: projectId });
      },

      completeProject: (projectId) => {
        set((state) => ({
          currentProject: null,
          completedProjects: state.completedProjects.includes(projectId)
            ? state.completedProjects
            : [...state.completedProjects, projectId],
        }));
      },

      abandonProject: () => {
        set({ currentProject: null });
      },

      isProjectActive: () => {
        return get().currentProject !== null;
      },

      // ============================================
      // HITOS
      // ============================================

      addMilestone: (milestone) => {
        set((state) => ({
          constructionMilestones: state.constructionMilestones.includes(milestone)
            ? state.constructionMilestones
            : [...state.constructionMilestones, milestone],
        }));
      },

      hasMilestone: (milestone) => {
        return get().constructionMilestones.includes(milestone);
      },

      // ============================================
      // ESTADÍSTICAS
      // ============================================

      incrementBuilds: () => {
        set((state) => ({
          totalBuilds: state.totalBuilds + 1,
          lastBuildDate: new Date().toISOString(),
        }));
      },

      getStats: () => {
        const state = get();
        const totalMaterialsCollected = Object.values(state.materialInventory).reduce(
          (sum, count) => sum + count,
          0
        );

        return {
          totalBuilds: state.totalBuilds,
          uniqueElementsUnlocked: state.unlockedElements.length,
          projectsCompleted: state.completedProjects.length,
          totalMaterialsCollected,
          milestonesReached: state.constructionMilestones.length,
        };
      },

      // ============================================
      // RESET
      // ============================================

      resetConstruction: () => {
        set(initialState);
      },
    }),
    {
      name: 'french-app-construction',
      // Validar estado al cargar
      onRehydrateStorage: () => (state) => {
        if (state) {
          try {
            ConstructionStateSchema.parse({
              unlockedElements: state.unlockedElements,
              currentProject: state.currentProject,
              elementProgress: state.elementProgress,
              materialInventory: state.materialInventory,
              completedProjects: state.completedProjects,
              totalBuilds: state.totalBuilds,
              constructionMilestones: state.constructionMilestones,
              lastBuildDate: state.lastBuildDate,
            });
          } catch (error) {
            console.warn('[ConstructionStore] Invalid state, resetting:', error);
            // El estado será reseteado automáticamente si es inválido
          }
        }
      },
    }
  )
);

// ============================================
// HOOKS UTILITARIOS
// ============================================

/**
 * Hook para obtener materiales disponibles por rareza
 */
export function useMaterialsByRarity(rarity: MaterialRarity): MaterialDefinition[] {
  return Object.values(MATERIALS).filter((m) => m.rarity === rarity);
}

/**
 * Hook para obtener elementos disponibles por tipo
 */
export function getElementsByType(type: BuildingElementType): ElementDefinition[] {
  return Object.values(ELEMENTS).filter((e) => e.type === type);
}

/**
 * Hook para verificar si se puede construir un elemento
 */
export function useCanBuildElement(elementId: string): boolean {
  const hasMaterials = useConstructionStore((state) => state.hasMaterials);
  const element = ELEMENTS[elementId];
  if (!element) return false;
  return hasMaterials(element.requiredMaterials);
}

// ============================================
// EXPORTACIONES
// ============================================

export default useConstructionStore;
