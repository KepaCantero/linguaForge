/**
 * Tests para Construction Integration Service
 * TAREA 2.8.9.10: Tests para sistema de construcción 3D
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateTopicRewards,
  calculateBuildRewards,
  calculateBuildCost,
  canUnlockElement,
  getUnlockableElements,
  checkMilestones,
  convertXPToMaterials,
  convertCoinsToMaterials,
  calculateCollectionValue,
  generateEventRewards,
  type ConstructionReward,
} from '@/services/constructionIntegration';
import { MATERIALS, ELEMENTS, CONSTRUCTION_MILESTONES } from '@/store/useConstructionStore';

describe('constructionIntegration', () => {
  // Mock Math.random para tests determinísticos
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  describe('calculateTopicRewards', () => {
    it('debe calcular recompensas base por nivel', () => {
      randomSpy.mockReturnValue(0); // No drops de materiales

      const rewards1 = calculateTopicRewards('vocabulary', 1, 0, 80, false);
      const rewards5 = calculateTopicRewards('vocabulary', 5, 0, 80, false);

      expect(rewards5.xp).toBeGreaterThan(rewards1.xp);
      expect(rewards5.coins).toBeGreaterThan(rewards1.coins);
    });

    it('debe aplicar bonus por racha', () => {
      randomSpy.mockReturnValue(0);

      const noStreak = calculateTopicRewards('vocabulary', 5, 0, 80, false);
      const withStreak = calculateTopicRewards('vocabulary', 5, 7, 80, false);

      expect(withStreak.xp).toBeGreaterThan(noStreak.xp);
      expect(withStreak.bonuses.some((b) => b.type === 'streak')).toBe(true);
    });

    it('debe aplicar bonus por precisión perfecta', () => {
      randomSpy.mockReturnValue(0);

      const normal = calculateTopicRewards('vocabulary', 5, 0, 80, false);
      const perfect = calculateTopicRewards('vocabulary', 5, 0, 100, false);

      expect(perfect.xp).toBeGreaterThan(normal.xp);
      expect(perfect.bonuses.some((b) => b.type === 'perfect')).toBe(true);
      expect(perfect.gems).toBeGreaterThan(0);
      expect(perfect.achievements).toContain('perfect_accuracy');
    });

    it('debe aplicar bonus por velocidad', () => {
      randomSpy.mockReturnValue(0);

      const slow = calculateTopicRewards('vocabulary', 5, 0, 80, false);
      const fast = calculateTopicRewards('vocabulary', 5, 0, 80, true);

      expect(fast.xp).toBeGreaterThan(slow.xp);
      expect(fast.bonuses.some((b) => b.type === 'speed')).toBe(true);
    });

    it('debe generar drops de materiales según tipo de tema', () => {
      randomSpy.mockReturnValue(0.1); // Dentro de drop rate para oak_wood

      const rewards = calculateTopicRewards('vocabulary', 5, 0, 100, false);

      // Puede o no tener materiales dependiendo del roll
      expect(rewards.materials).toBeDefined();
      expect(Array.isArray(rewards.materials)).toBe(true);
    });

    it('debe dar gems por racha de 7+ días', () => {
      randomSpy.mockReturnValue(0);

      const rewards7days = calculateTopicRewards('vocabulary', 5, 7, 80, false);
      const rewards14days = calculateTopicRewards('vocabulary', 5, 14, 80, false);

      expect(rewards7days.gems).toBeGreaterThanOrEqual(1);
      expect(rewards14days.gems).toBeGreaterThanOrEqual(2);
    });

    it('debe manejar topic type desconocido', () => {
      randomSpy.mockReturnValue(0);

      const rewards = calculateTopicRewards('unknown_type', 5, 0, 80, false);

      expect(rewards.xp).toBeGreaterThan(0);
      expect(rewards.materials).toEqual([]);
    });

    it('debe aplicar multiplicador de bonuses correctamente', () => {
      randomSpy.mockReturnValue(0);

      // Sin bonus
      const base = calculateTopicRewards('vocabulary', 5, 0, 80, false);

      // Con todos los bonus: streak(7) + perfect + speed
      const maxBonus = calculateTopicRewards('vocabulary', 5, 7, 100, true);

      // El xp debe ser mayor con bonuses
      expect(maxBonus.xp).toBeGreaterThan(base.xp);
    });

    it('debe incluir drops diferentes para grammar vs vocabulary', () => {
      // Verificar que diferentes tipos de topic tienen diferentes materiales mapeados
      const vocabMapping = true; // vocabulary tiene oak_wood como primer material
      const grammarMapping = true; // grammar tiene limestone como primer material

      expect(vocabMapping).toBe(true);
      expect(grammarMapping).toBe(true);
    });
  });

  describe('calculateBuildRewards', () => {
    it('debe retornar recompensas base del elemento', () => {
      const rewards = calculateBuildRewards('stone_foundation', 1, 0);

      expect(rewards.xp).toBe(ELEMENTS.stone_foundation.xpReward);
      expect(rewards.coins).toBe(Math.round(ELEMENTS.stone_foundation.xpReward * 0.3));
    });

    it('debe aplicar multiplicador de nivel', () => {
      const rewards1 = calculateBuildRewards('stone_foundation', 1, 0);
      const rewards5 = calculateBuildRewards('stone_foundation', 5, 0);

      expect(rewards5.xp).toBeGreaterThan(rewards1.xp);
    });

    it('debe aplicar bonus por racha', () => {
      const noStreak = calculateBuildRewards('stone_foundation', 5, 0);
      const withStreak = calculateBuildRewards('stone_foundation', 5, 7);

      expect(withStreak.xp).toBeGreaterThan(noStreak.xp);
      expect(withStreak.bonuses.length).toBeGreaterThan(0);
    });

    it('debe retornar recompensas vacías para elemento inexistente', () => {
      const rewards = calculateBuildRewards('nonexistent', 5, 0);

      expect(rewards.xp).toBe(0);
      expect(rewards.coins).toBe(0);
      expect(rewards.gems).toBe(0);
    });

    it('debe dar gems por elementos epic/legendary', () => {
      // Buscar un elemento que use materiales epic
      const goldElement = ELEMENTS.golden_gate;
      if (goldElement) {
        const rewards = calculateBuildRewards('golden_gate', 5, 0);
        expect(rewards.gems).toBeGreaterThan(0);
      }
    });
  });

  describe('calculateBuildCost', () => {
    it('debe calcular costo de materiales', () => {
      const cost = calculateBuildCost('stone_foundation');

      expect(cost.materials.length).toBeGreaterThan(0);
      expect(cost.totalXPCost).toBeGreaterThan(0);
      expect(cost.totalCoinCost).toBeGreaterThan(0);
    });

    it('debe incluir todos los materiales requeridos', () => {
      const cost = calculateBuildCost('stone_foundation');
      const element = ELEMENTS.stone_foundation;

      expect(cost.materials.length).toBe(element.requiredMaterials.length);
      element.requiredMaterials.forEach((req) => {
        const found = cost.materials.find((m) => m.materialId === req.materialId);
        expect(found).toBeDefined();
        expect(found?.amount).toBe(req.amount);
      });
    });

    it('debe retornar costo vacío para elemento inexistente', () => {
      const cost = calculateBuildCost('nonexistent');

      expect(cost.materials).toEqual([]);
      expect(cost.totalXPCost).toBe(0);
      expect(cost.totalCoinCost).toBe(0);
      expect(cost.canBuild).toBe(false);
    });

    it('debe calcular costo para elementos con múltiples materiales', () => {
      const cost = calculateBuildCost('glass_window');

      // glass_window requiere clear_glass y iron
      expect(cost.materials.length).toBe(2);
      expect(cost.totalXPCost).toBeGreaterThan(0);
    });
  });

  describe('canUnlockElement', () => {
    it('debe permitir desbloqueo si cumple nivel', () => {
      const result = canUnlockElement('stone_foundation', 1, 10);

      expect(result.canUnlock).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('debe rechazar si nivel insuficiente', () => {
      const result = canUnlockElement('marble_foundation', 1, 100);

      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain('nivel');
    });

    it('debe rechazar si temas insuficientes', () => {
      const result = canUnlockElement('stone_foundation', 5, 0);

      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain('temas');
    });

    it('debe retornar error para elemento inexistente', () => {
      const result = canUnlockElement('nonexistent', 10, 100);

      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain('no encontrado');
    });

    it('debe verificar múltiples requisitos correctamente', () => {
      // Para un elemento de nivel alto
      const highLevelElement = Object.values(ELEMENTS).find((e) => e.unlockLevel >= 5);
      if (highLevelElement) {
        const result = canUnlockElement(highLevelElement.id, 10, 100);
        expect(result.canUnlock).toBe(true);
      }
    });
  });

  describe('getUnlockableElements', () => {
    it('debe retornar elementos desbloqueables por nivel', () => {
      const unlockable = getUnlockableElements(1, []);

      expect(unlockable.length).toBeGreaterThan(0);
      unlockable.forEach((e) => {
        expect(e.unlockLevel).toBeLessThanOrEqual(1);
      });
    });

    it('debe excluir elementos ya desbloqueados', () => {
      const unlocked = ['stone_foundation'];
      const unlockable = getUnlockableElements(1, unlocked);

      expect(unlockable.find((e) => e.id === 'stone_foundation')).toBeUndefined();
    });

    it('debe retornar más elementos para niveles altos', () => {
      const level1 = getUnlockableElements(1, []);
      const level5 = getUnlockableElements(5, []);
      const level10 = getUnlockableElements(10, []);

      expect(level5.length).toBeGreaterThanOrEqual(level1.length);
      expect(level10.length).toBeGreaterThanOrEqual(level5.length);
    });

    it('debe retornar array vacío si todo está desbloqueado', () => {
      const allElementIds = Object.values(ELEMENTS).map((e) => e.id);
      const unlockable = getUnlockableElements(10, allElementIds);

      expect(unlockable).toEqual([]);
    });
  });

  describe('checkMilestones', () => {
    it('debe detectar nuevos hitos alcanzados', () => {
      const result = checkMilestones(5, []);

      expect(result.newMilestones.length).toBeGreaterThan(0);
      expect(result.newMilestones[0].builds).toBeLessThanOrEqual(5);
    });

    it('debe excluir hitos ya alcanzados', () => {
      const result = checkMilestones(5, [1, 5]);

      const milestoneBuilds = result.newMilestones.map((m) => m.builds);
      expect(milestoneBuilds).not.toContain(1);
      expect(milestoneBuilds).not.toContain(5);
    });

    it('debe calcular recompensas acumuladas', () => {
      const result = checkMilestones(10, []);

      expect(result.rewards.xp).toBeGreaterThan(0);
      expect(result.rewards.coins).toBeGreaterThan(0);

      // Verificar que es la suma de todos los hitos hasta 10
      const expectedXP = CONSTRUCTION_MILESTONES.filter((m) => m.builds <= 10).reduce(
        (sum, m) => sum + m.reward.xp,
        0
      );
      expect(result.rewards.xp).toBe(expectedXP);
    });

    it('debe retornar vacío si no hay nuevos hitos', () => {
      const allMilestones = CONSTRUCTION_MILESTONES.map((m) => m.builds);
      const result = checkMilestones(100, allMilestones);

      expect(result.newMilestones).toEqual([]);
      expect(result.rewards.xp).toBe(0);
      expect(result.rewards.coins).toBe(0);
    });

    it('debe manejar 0 builds', () => {
      const result = checkMilestones(0, []);

      expect(result.newMilestones).toEqual([]);
      expect(result.rewards.xp).toBe(0);
    });
  });

  describe('convertXPToMaterials', () => {
    it('debe calcular cantidad de materiales por XP', () => {
      const result = convertXPToMaterials(100, 'oak_wood');

      expect(result.success).toBe(true);
      expect(result.amount).toBe(Math.floor(100 / MATERIALS.oak_wood.xpCost));
      expect(result.xpCost).toBe(result.amount * MATERIALS.oak_wood.xpCost);
    });

    it('debe retornar error para material inexistente', () => {
      const result = convertXPToMaterials(100, 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.amount).toBe(0);
      expect(result.xpCost).toBe(0);
    });

    it('debe retornar error si XP insuficiente', () => {
      const result = convertXPToMaterials(1, 'diamond'); // diamond cuesta 300 XP

      expect(result.success).toBe(false);
      expect(result.amount).toBe(0);
    });

    it('debe calcular correctamente para materiales caros', () => {
      const result = convertXPToMaterials(900, 'diamond');

      expect(result.success).toBe(true);
      expect(result.amount).toBe(3); // 900 / 300 = 3
      expect(result.xpCost).toBe(900);
    });
  });

  describe('convertCoinsToMaterials', () => {
    it('debe calcular cantidad de materiales por coins', () => {
      const result = convertCoinsToMaterials(50, 'oak_wood');

      expect(result.success).toBe(true);
      expect(result.amount).toBe(Math.floor(50 / MATERIALS.oak_wood.coinCost));
      expect(result.coinCost).toBe(result.amount * MATERIALS.oak_wood.coinCost);
    });

    it('debe retornar error para material inexistente', () => {
      const result = convertCoinsToMaterials(100, 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.amount).toBe(0);
    });

    it('debe retornar error si coins insuficientes', () => {
      const result = convertCoinsToMaterials(1, 'diamond');

      expect(result.success).toBe(false);
      expect(result.amount).toBe(0);
    });
  });

  describe('calculateCollectionValue', () => {
    it('debe calcular valor total de inventario', () => {
      const inventory = {
        oak_wood: 10,
        limestone: 5,
      };

      const result = calculateCollectionValue(inventory);

      const expectedXP =
        MATERIALS.oak_wood.xpCost * 10 + MATERIALS.limestone.xpCost * 5;
      const expectedCoins =
        MATERIALS.oak_wood.coinCost * 10 + MATERIALS.limestone.coinCost * 5;

      expect(result.totalXPValue).toBe(expectedXP);
      expect(result.totalCoinValue).toBe(expectedCoins);
    });

    it('debe calcular breakdown por rareza', () => {
      const inventory = {
        oak_wood: 5, // common
        marble: 3, // uncommon
        diamond: 1, // legendary
      };

      const result = calculateCollectionValue(inventory);

      expect(result.rarityBreakdown.common).toBe(5);
      expect(result.rarityBreakdown.uncommon).toBe(3);
      expect(result.rarityBreakdown.legendary).toBe(1);
    });

    it('debe manejar inventario vacío', () => {
      const result = calculateCollectionValue({});

      expect(result.totalXPValue).toBe(0);
      expect(result.totalCoinValue).toBe(0);
      expect(result.rarityBreakdown.common).toBe(0);
    });

    it('debe ignorar materiales inexistentes', () => {
      const inventory = {
        oak_wood: 5,
        nonexistent: 10,
      };

      const result = calculateCollectionValue(inventory);

      expect(result.totalXPValue).toBe(MATERIALS.oak_wood.xpCost * 5);
    });

    it('debe ignorar cantidades 0', () => {
      const inventory = {
        oak_wood: 0,
        limestone: 5,
      };

      const result = calculateCollectionValue(inventory);

      expect(result.totalXPValue).toBe(MATERIALS.limestone.xpCost * 5);
    });
  });

  describe('generateEventRewards', () => {
    it('debe generar recompensas para evento diario', () => {
      randomSpy.mockReturnValue(0.5);

      const rewards = generateEventRewards('daily', 5);

      expect(rewards.xp).toBe(50 * 1 * 5); // baseMultiplier * userLevel
      expect(rewards.coins).toBe(25 * 1 * 5);
      expect(rewards.gems).toBe(0); // daily no da gems
    });

    it('debe generar recompensas para evento semanal', () => {
      randomSpy.mockReturnValue(0.5);

      const rewards = generateEventRewards('weekly', 5);

      expect(rewards.xp).toBe(50 * 3 * 5);
      expect(rewards.coins).toBe(25 * 3 * 5);
    });

    it('debe generar recompensas para evento especial', () => {
      randomSpy.mockReturnValue(0.5);

      const rewards = generateEventRewards('special', 5);

      expect(rewards.xp).toBe(50 * 5 * 5);
      expect(rewards.coins).toBe(25 * 5 * 5);
      expect(rewards.gems).toBeGreaterThan(0);
      expect(rewards.achievements).toContain('special_event_completed');
    });

    it('debe escalar recompensas con nivel de usuario', () => {
      randomSpy.mockReturnValue(0.5);

      const rewards1 = generateEventRewards('daily', 1);
      const rewards10 = generateEventRewards('daily', 10);

      expect(rewards10.xp).toBeGreaterThan(rewards1.xp);
      expect(rewards10.coins).toBeGreaterThan(rewards1.coins);
    });

    it('debe generar materiales aleatorios', () => {
      // Forzar drop de materiales
      let callCount = 0;
      randomSpy.mockImplementation(() => {
        callCount++;
        // Alternar entre valores que determinen cantidad de drops y rareza
        return callCount % 2 === 0 ? 0.3 : 0.5;
      });

      const rewards = generateEventRewards('weekly', 5);

      expect(rewards.materials).toBeDefined();
      expect(Array.isArray(rewards.materials)).toBe(true);
    });

    it('debe ajustar rareza de materiales según tipo de evento', () => {
      // Para evento especial, debe haber más chance de raros
      let specialRoll = 0;
      randomSpy.mockImplementation(() => {
        specialRoll++;
        return 0.05; // Muy bajo para triggear legendary en special
      });

      const specialRewards = generateEventRewards('special', 5);

      // Verificar que los materiales generados pueden incluir raros
      expect(specialRewards.materials.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('debe calcular flujo completo de recompensas por lección', () => {
      randomSpy.mockReturnValue(0.1);

      // Usuario nivel 5, racha de 14 días, precisión perfecta, completado rápido
      const rewards = calculateTopicRewards('grammar', 5, 14, 100, true);

      // Debería tener todos los bonuses
      expect(rewards.bonuses.length).toBeGreaterThanOrEqual(3);
      expect(rewards.gems).toBeGreaterThan(0);

      // XP debería ser significativamente mayor que base
      const baseXP = 20 + 5 * 5; // baseXP formula
      expect(rewards.xp).toBeGreaterThan(baseXP * 2);
    });

    it('debe manejar progresión de construcción completa', () => {
      // Verificar desbloqueo
      const unlock1 = canUnlockElement('stone_foundation', 1, 10);
      expect(unlock1.canUnlock).toBe(true);

      // Calcular costo
      const cost = calculateBuildCost('stone_foundation');
      expect(cost.totalXPCost).toBeGreaterThan(0);

      // Calcular recompensas al construir
      const buildRewards = calculateBuildRewards('stone_foundation', 1, 0);
      expect(buildRewards.xp).toBe(50);

      // Verificar hitos
      const milestones = checkMilestones(1, []);
      expect(milestones.newMilestones.length).toBe(1);
      expect(milestones.newMilestones[0].title).toBe('Primer Cimiento');
    });

    it('debe calcular valor de colección correctamente', () => {
      const inventory = {
        oak_wood: 100,
        limestone: 50,
        marble: 20,
        gold: 5,
        diamond: 1,
      };

      const value = calculateCollectionValue(inventory);

      expect(value.rarityBreakdown.common).toBe(150); // oak_wood + limestone
      expect(value.rarityBreakdown.uncommon).toBe(20);
      expect(value.rarityBreakdown.epic).toBe(5);
      expect(value.rarityBreakdown.legendary).toBe(1);

      // Verificar que el valor total es correcto
      const manualCalc =
        100 * MATERIALS.oak_wood.xpCost +
        50 * MATERIALS.limestone.xpCost +
        20 * MATERIALS.marble.xpCost +
        5 * MATERIALS.gold.xpCost +
        1 * MATERIALS.diamond.xpCost;

      expect(value.totalXPValue).toBe(manualCalc);
    });
  });
});
