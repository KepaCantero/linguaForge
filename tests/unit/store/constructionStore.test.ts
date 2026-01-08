/**
 * Tests para useConstructionStore
 * TAREA 2.8.9.10: Tests para sistema de construcción 3D
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  useConstructionStore,
  MATERIALS,
  ELEMENTS,
  CONSTRUCTION_MILESTONES,
  useMaterialsByRarity,
  getElementsByType,
} from '@/store/useConstructionStore';

describe('useConstructionStore', () => {
  // Reset store antes de cada test
  beforeEach(() => {
    useConstructionStore.getState().resetConstruction();
  });

  describe('MATERIALS constant', () => {
    it('debe tener 15 materiales definidos', () => {
      const materialCount = Object.keys(MATERIALS).length;
      expect(materialCount).toBe(15);
    });

    it('cada material debe tener propiedades requeridas', () => {
      Object.values(MATERIALS).forEach((material) => {
        expect(material.id).toBeDefined();
        expect(material.name).toBeDefined();
        expect(material.rarity).toBeDefined();
        expect(material.texture).toBeDefined();
        expect(material.xpCost).toBeGreaterThan(0);
        expect(material.coinCost).toBeGreaterThan(0);
      });
    });

    it('debe tener materiales de cada textura', () => {
      const textures = new Set(Object.values(MATERIALS).map((m) => m.texture));
      expect(textures.has('wood')).toBe(true);
      expect(textures.has('stone')).toBe(true);
      expect(textures.has('glass')).toBe(true);
      expect(textures.has('metal')).toBe(true);
      expect(textures.has('crystal')).toBe(true);
    });

    it('debe tener materiales de cada rareza', () => {
      const rarities = new Set(Object.values(MATERIALS).map((m) => m.rarity));
      expect(rarities.has('common')).toBe(true);
      expect(rarities.has('uncommon')).toBe(true);
      expect(rarities.has('rare')).toBe(true);
      expect(rarities.has('epic')).toBe(true);
      expect(rarities.has('legendary')).toBe(true);
    });

    it('xpCost debe aumentar con la rareza', () => {
      const commonMaterials = Object.values(MATERIALS).filter((m) => m.rarity === 'common');
      const legendaryMaterials = Object.values(MATERIALS).filter((m) => m.rarity === 'legendary');

      const avgCommonCost = commonMaterials.reduce((sum, m) => sum + m.xpCost, 0) / commonMaterials.length;
      const avgLegendaryCost = legendaryMaterials.reduce((sum, m) => sum + m.xpCost, 0) / legendaryMaterials.length;

      expect(avgLegendaryCost).toBeGreaterThan(avgCommonCost);
    });
  });

  describe('ELEMENTS constant', () => {
    it('debe tener 14 elementos definidos', () => {
      const elementCount = Object.keys(ELEMENTS).length;
      expect(elementCount).toBe(14);
    });

    it('cada elemento debe tener propiedades requeridas', () => {
      Object.values(ELEMENTS).forEach((element) => {
        expect(element.id).toBeDefined();
        expect(element.name).toBeDefined();
        expect(element.type).toBeDefined();
        expect(element.requiredMaterials.length).toBeGreaterThan(0);
        expect(element.unlockLevel).toBeGreaterThan(0);
        expect(element.xpReward).toBeGreaterThan(0);
      });
    });

    it('todos los materiales requeridos deben existir', () => {
      Object.values(ELEMENTS).forEach((element) => {
        element.requiredMaterials.forEach((req) => {
          expect(MATERIALS[req.materialId]).toBeDefined();
        });
      });
    });

    it('debe tener elementos de varios tipos', () => {
      const types = new Set(Object.values(ELEMENTS).map((e) => e.type));
      expect(types.size).toBeGreaterThan(5);
    });
  });

  describe('CONSTRUCTION_MILESTONES', () => {
    it('debe tener 6 hitos definidos', () => {
      expect(CONSTRUCTION_MILESTONES.length).toBe(6);
    });

    it('los hitos deben estar ordenados por builds', () => {
      for (let i = 1; i < CONSTRUCTION_MILESTONES.length; i++) {
        expect(CONSTRUCTION_MILESTONES[i].builds).toBeGreaterThan(
          CONSTRUCTION_MILESTONES[i - 1].builds
        );
      }
    });

    it('cada hito debe tener recompensas', () => {
      CONSTRUCTION_MILESTONES.forEach((milestone) => {
        expect(milestone.reward.xp).toBeGreaterThan(0);
        expect(milestone.reward.coins).toBeGreaterThan(0);
        expect(milestone.title).toBeDefined();
      });
    });

    it('las recompensas deben aumentar con el hito', () => {
      for (let i = 1; i < CONSTRUCTION_MILESTONES.length; i++) {
        expect(CONSTRUCTION_MILESTONES[i].reward.xp).toBeGreaterThan(
          CONSTRUCTION_MILESTONES[i - 1].reward.xp
        );
      }
    });
  });

  describe('Material Management', () => {
    describe('addMaterial', () => {
      it('debe agregar materiales al inventario', () => {
        const store = useConstructionStore.getState();
        store.addMaterial('oak_wood', 5);

        expect(useConstructionStore.getState().materialInventory['oak_wood']).toBe(5);
      });

      it('debe acumular materiales existentes', () => {
        const store = useConstructionStore.getState();
        store.addMaterial('oak_wood', 5);
        store.addMaterial('oak_wood', 3);

        expect(useConstructionStore.getState().materialInventory['oak_wood']).toBe(8);
      });

      it('debe manejar múltiples materiales', () => {
        const store = useConstructionStore.getState();
        store.addMaterial('oak_wood', 5);
        store.addMaterial('limestone', 10);

        const inventory = useConstructionStore.getState().materialInventory;
        expect(inventory['oak_wood']).toBe(5);
        expect(inventory['limestone']).toBe(10);
      });
    });

    describe('removeMaterial', () => {
      it('debe remover materiales del inventario', () => {
        const store = useConstructionStore.getState();
        store.addMaterial('oak_wood', 10);

        const result = store.removeMaterial('oak_wood', 3);
        expect(result).toBe(true);

        expect(useConstructionStore.getState().materialInventory['oak_wood']).toBe(7);
      });

      it('debe retornar false si no hay suficiente material', () => {
        const store = useConstructionStore.getState();
        store.addMaterial('oak_wood', 5);

        const result = store.removeMaterial('oak_wood', 10);
        expect(result).toBe(false);

        expect(useConstructionStore.getState().materialInventory['oak_wood']).toBe(5);
      });

      it('debe retornar false si el material no existe', () => {
        const store = useConstructionStore.getState();

        const result = store.removeMaterial('nonexistent', 1);
        expect(result).toBe(false);
      });

      it('debe permitir remover todo el material disponible', () => {
        const store = useConstructionStore.getState();
        store.addMaterial('oak_wood', 5);

        const result = store.removeMaterial('oak_wood', 5);
        expect(result).toBe(true);

        expect(useConstructionStore.getState().materialInventory['oak_wood']).toBe(0);
      });
    });

    describe('getMaterialCount', () => {
      it('debe retornar cantidad de material', () => {
        const store = useConstructionStore.getState();
        store.addMaterial('oak_wood', 15);

        expect(store.getMaterialCount('oak_wood')).toBe(15);
      });

      it('debe retornar 0 para material inexistente', () => {
        const store = useConstructionStore.getState();
        expect(store.getMaterialCount('nonexistent')).toBe(0);
      });
    });

    describe('hasMaterials', () => {
      it('debe verificar si hay materiales suficientes', () => {
        const store = useConstructionStore.getState();
        store.addMaterial('oak_wood', 10);
        store.addMaterial('limestone', 5);

        expect(
          store.hasMaterials([
            { materialId: 'oak_wood', amount: 5 },
            { materialId: 'limestone', amount: 3 },
          ])
        ).toBe(true);
      });

      it('debe retornar false si falta algún material', () => {
        const store = useConstructionStore.getState();
        store.addMaterial('oak_wood', 10);

        expect(
          store.hasMaterials([
            { materialId: 'oak_wood', amount: 5 },
            { materialId: 'limestone', amount: 3 },
          ])
        ).toBe(false);
      });

      it('debe retornar false si la cantidad es insuficiente', () => {
        const store = useConstructionStore.getState();
        store.addMaterial('oak_wood', 3);

        expect(store.hasMaterials([{ materialId: 'oak_wood', amount: 5 }])).toBe(false);
      });

      it('debe retornar true para lista vacía', () => {
        const store = useConstructionStore.getState();
        expect(store.hasMaterials([])).toBe(true);
      });
    });
  });

  describe('Element Management', () => {
    describe('unlockElement', () => {
      it('debe desbloquear elemento', () => {
        const store = useConstructionStore.getState();
        store.unlockElement('stone_foundation');

        expect(useConstructionStore.getState().unlockedElements).toContain('stone_foundation');
      });

      it('no debe duplicar elementos desbloqueados', () => {
        const store = useConstructionStore.getState();
        store.unlockElement('stone_foundation');
        store.unlockElement('stone_foundation');

        const unlocked = useConstructionStore.getState().unlockedElements;
        const count = unlocked.filter((e) => e === 'stone_foundation').length;
        expect(count).toBe(1);
      });
    });

    describe('isElementUnlocked', () => {
      it('debe verificar si elemento está desbloqueado', () => {
        const store = useConstructionStore.getState();
        store.unlockElement('stone_foundation');

        expect(store.isElementUnlocked('stone_foundation')).toBe(true);
        expect(store.isElementUnlocked('marble_foundation')).toBe(false);
      });
    });

    describe('updateElementProgress', () => {
      it('debe actualizar progreso de elemento', () => {
        const store = useConstructionStore.getState();
        store.updateElementProgress('stone_foundation', 50);

        expect(useConstructionStore.getState().elementProgress['stone_foundation']).toBe(50);
      });

      it('debe limitar progreso a 0-100', () => {
        const store = useConstructionStore.getState();
        store.updateElementProgress('stone_foundation', 150);

        expect(useConstructionStore.getState().elementProgress['stone_foundation']).toBe(100);

        store.updateElementProgress('stone_foundation', -10);

        expect(useConstructionStore.getState().elementProgress['stone_foundation']).toBe(0);
      });
    });

    describe('completeElement', () => {
      it('debe completar elemento con materiales suficientes', () => {
        const store = useConstructionStore.getState();

        // Agregar materiales necesarios para stone_foundation (5 limestone)
        store.addMaterial('limestone', 10);
        store.completeElement('stone_foundation');

        const state = useConstructionStore.getState();
        expect(state.elementProgress['stone_foundation']).toBe(100);
        expect(state.materialInventory['limestone']).toBe(5); // 10 - 5
        expect(state.totalBuilds).toBe(1);
        expect(state.unlockedElements).toContain('stone_foundation');
      });

      it('no debe completar elemento sin materiales suficientes', () => {
        const store = useConstructionStore.getState();

        store.addMaterial('limestone', 2);
        store.completeElement('stone_foundation');

        const state = useConstructionStore.getState();
        expect(state.elementProgress['stone_foundation']).toBeUndefined();
        expect(state.materialInventory['limestone']).toBe(2);
        expect(state.totalBuilds).toBe(0);
      });

      it('no debe completar elemento inexistente', () => {
        const store = useConstructionStore.getState();

        store.completeElement('nonexistent_element');

        expect(useConstructionStore.getState().totalBuilds).toBe(0);
      });

      it('debe actualizar lastBuildDate', () => {
        const store = useConstructionStore.getState();

        store.addMaterial('limestone', 5);
        store.completeElement('stone_foundation');

        expect(useConstructionStore.getState().lastBuildDate).not.toBeNull();
      });
    });
  });

  describe('Project Management', () => {
    describe('startProject', () => {
      it('debe iniciar proyecto', () => {
        const store = useConstructionStore.getState();
        store.startProject('project_1');

        expect(useConstructionStore.getState().currentProject).toBe('project_1');
      });

      it('debe reemplazar proyecto actual', () => {
        const store = useConstructionStore.getState();
        store.startProject('project_1');
        store.startProject('project_2');

        expect(useConstructionStore.getState().currentProject).toBe('project_2');
      });
    });

    describe('completeProject', () => {
      it('debe completar proyecto', () => {
        const store = useConstructionStore.getState();
        store.startProject('project_1');
        store.completeProject('project_1');

        const state = useConstructionStore.getState();
        expect(state.currentProject).toBeNull();
        expect(state.completedProjects).toContain('project_1');
      });

      it('no debe duplicar proyectos completados', () => {
        const store = useConstructionStore.getState();
        store.completeProject('project_1');
        store.completeProject('project_1');

        const count = useConstructionStore.getState().completedProjects.filter(
          (p) => p === 'project_1'
        ).length;
        expect(count).toBe(1);
      });
    });

    describe('abandonProject', () => {
      it('debe abandonar proyecto actual', () => {
        const store = useConstructionStore.getState();
        store.startProject('project_1');
        store.abandonProject();

        expect(useConstructionStore.getState().currentProject).toBeNull();
      });
    });

    describe('isProjectActive', () => {
      it('debe verificar si hay proyecto activo', () => {
        const store = useConstructionStore.getState();

        expect(store.isProjectActive()).toBe(false);

        store.startProject('project_1');

        expect(store.isProjectActive()).toBe(true);
      });
    });
  });

  describe('Milestones', () => {
    describe('addMilestone', () => {
      it('debe agregar hito', () => {
        const store = useConstructionStore.getState();
        store.addMilestone(1);

        expect(useConstructionStore.getState().constructionMilestones).toContain(1);
      });

      it('no debe duplicar hitos', () => {
        const store = useConstructionStore.getState();
        store.addMilestone(1);
        store.addMilestone(1);

        const count = useConstructionStore.getState().constructionMilestones.filter(
          (m) => m === 1
        ).length;
        expect(count).toBe(1);
      });
    });

    describe('hasMilestone', () => {
      it('debe verificar si tiene hito', () => {
        const store = useConstructionStore.getState();
        store.addMilestone(5);

        expect(store.hasMilestone(5)).toBe(true);
        expect(store.hasMilestone(10)).toBe(false);
      });
    });
  });

  describe('Statistics', () => {
    describe('incrementBuilds', () => {
      it('debe incrementar total de builds', () => {
        const store = useConstructionStore.getState();
        store.incrementBuilds();
        store.incrementBuilds();

        expect(useConstructionStore.getState().totalBuilds).toBe(2);
      });

      it('debe actualizar lastBuildDate', () => {
        const store = useConstructionStore.getState();
        store.incrementBuilds();

        expect(useConstructionStore.getState().lastBuildDate).not.toBeNull();
      });
    });

    describe('getStats', () => {
      it('debe retornar estadísticas completas', () => {
        const store = useConstructionStore.getState();
        store.addMaterial('oak_wood', 10);
        store.addMaterial('limestone', 5);
        store.unlockElement('stone_foundation');
        store.completeProject('project_1');
        store.addMilestone(1);
        store.incrementBuilds();

        const stats = store.getStats();
        expect(stats.totalBuilds).toBe(1);
        expect(stats.uniqueElementsUnlocked).toBe(1);
        expect(stats.projectsCompleted).toBe(1);
        expect(stats.totalMaterialsCollected).toBe(15);
        expect(stats.milestonesReached).toBe(1);
      });

      it('debe retornar stats vacías inicialmente', () => {
        const store = useConstructionStore.getState();
        const stats = store.getStats();

        expect(stats.totalBuilds).toBe(0);
        expect(stats.uniqueElementsUnlocked).toBe(0);
        expect(stats.projectsCompleted).toBe(0);
        expect(stats.totalMaterialsCollected).toBe(0);
        expect(stats.milestonesReached).toBe(0);
      });
    });
  });

  describe('Reset', () => {
    it('debe resetear todo el estado', () => {
      const store = useConstructionStore.getState();
      store.addMaterial('oak_wood', 10);
      store.unlockElement('stone_foundation');
      store.startProject('project_1');
      store.addMilestone(1);
      store.incrementBuilds();

      store.resetConstruction();

      const state = useConstructionStore.getState();
      expect(state.materialInventory).toEqual({});
      expect(state.unlockedElements).toEqual([]);
      expect(state.currentProject).toBeNull();
      expect(state.constructionMilestones).toEqual([]);
      expect(state.totalBuilds).toBe(0);
    });
  });

  describe('Helper Functions', () => {
    describe('useMaterialsByRarity', () => {
      it('debe retornar materiales comunes', () => {
        const common = useMaterialsByRarity('common');
        expect(common.length).toBeGreaterThan(0);
        common.forEach((m) => expect(m.rarity).toBe('common'));
      });

      it('debe retornar materiales legendarios', () => {
        const legendary = useMaterialsByRarity('legendary');
        expect(legendary.length).toBeGreaterThan(0);
        legendary.forEach((m) => expect(m.rarity).toBe('legendary'));
      });
    });

    describe('getElementsByType', () => {
      it('debe retornar elementos de tipo foundation', () => {
        const foundations = getElementsByType('foundation');
        expect(foundations.length).toBeGreaterThan(0);
        foundations.forEach((e) => expect(e.type).toBe('foundation'));
      });

      it('debe retornar elementos de tipo wall', () => {
        const walls = getElementsByType('wall');
        expect(walls.length).toBeGreaterThan(0);
        walls.forEach((e) => expect(e.type).toBe('wall'));
      });

      it('debe retornar array vacío para tipo inexistente', () => {
        const invalid = getElementsByType('invalid' as Parameters<typeof getElementsByType>[0]);
        expect(invalid).toEqual([]);
      });
    });
  });

  describe('Integration Tests', () => {
    it('debe manejar flujo completo de construcción', () => {
      const store = useConstructionStore.getState();

      // Agregar materiales
      store.addMaterial('limestone', 10);
      store.addMaterial('oak_wood', 10);
      store.addMaterial('iron', 5);

      // Iniciar proyecto
      store.startProject('my_castle');

      expect(store.isProjectActive()).toBe(true);

      // Construir cimientos
      store.completeElement('stone_foundation');

      // Construir muros
      store.completeElement('wooden_wall');

      // Verificar estado
      const state = useConstructionStore.getState();
      expect(state.totalBuilds).toBe(2);
      expect(state.unlockedElements).toContain('stone_foundation');
      expect(state.unlockedElements).toContain('wooden_wall');

      // Verificar materiales consumidos
      expect(state.materialInventory['limestone']).toBe(5); // 10 - 5
      expect(state.materialInventory['oak_wood']).toBe(7); // 10 - 3

      // Completar proyecto
      store.completeProject('my_castle');
      store.addMilestone(1);

      const finalState = useConstructionStore.getState();
      expect(finalState.completedProjects).toContain('my_castle');
      expect(finalState.currentProject).toBeNull();
      expect(finalState.constructionMilestones).toContain(1);
    });
  });
});
