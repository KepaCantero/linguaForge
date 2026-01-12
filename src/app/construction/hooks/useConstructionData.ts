import { useMemo } from 'react';
import {
  ELEMENTS,
  MATERIALS,
  useConstructionStore,
} from '@/store/useConstructionStore';
import {
  getActiveEvents,
  getMasteryLevel,
} from '@/lib/progression/construction';
import type { BuildingElementType } from '@/schemas/construction';

export type ConstructionMaterialType = 'wood' | 'stone' | 'glass' | 'metal' | 'crystal';

const MATERIAL_COLORS: Record<string, string> = {
  wood: '#8B4513',
  stone: '#808080',
  glass: '#87CEEB',
  metal: '#C0C0C0',
  crystal: '#E0FFFF',
};

export interface Construction3DElement {
  id: string;
  type: BuildingElementType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  material: ConstructionMaterialType;
  color: string;
}

export interface MaterialStats {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
}

export function useConstructionData() {
  const {
    materialInventory,
    elementProgress,
    totalBuilds,
    constructionMilestones,
  } = useConstructionStore();

  const masteryLevel = useMemo(() => getMasteryLevel(totalBuilds), [totalBuilds]);
  const masteryLevelValue = masteryLevel.level;
  const activeEvents = useMemo(() => getActiveEvents(), []);
  const constructionStreak = constructionMilestones.length;

  // Material counts by rarity
  const materialStats = useMemo((): MaterialStats => {
    const stats = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    Object.entries(materialInventory).forEach(([id, qty]) => {
      const mat = MATERIALS[id];
      if (mat && qty > 0) {
        stats[mat.rarity] += qty;
      }
    });
    return stats;
  }, [materialInventory]);

  // Elements for 3D view
  const elementsFor3D = useMemo((): Construction3DElement[] => {
    return Object.entries(elementProgress)
      .filter(([, progress]) => progress >= 100)
      .map(([id], index) => {
        const element = ELEMENTS[id];
        const primaryMat = element?.requiredMaterials?.[0]?.materialId;
        const matDef = primaryMat ? MATERIALS[primaryMat] : null;
        const texture: ConstructionMaterialType = (matDef?.texture || 'wood') as ConstructionMaterialType;
        return {
          id,
          type: (element?.type || 'foundation') as BuildingElementType,
          position: [index * 2, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          material: texture,
          color: MATERIAL_COLORS[texture] || '#8B4513',
        };
      });
  }, [elementProgress]);

  return {
    totalBuilds,
    masteryLevelValue,
    constructionStreak,
    materialStats,
    elementsFor3D,
    activeEvents,
  };
}
