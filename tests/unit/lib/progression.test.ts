/**
 * Tests for Construction Progression System
 * TAREA 2.8.9.8: Sistema de progreso y hitos constructivos
 */

import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import {
  CONSTRUCTION_MILESTONES,
  STREAK_BONUSES,
  MASTERY_LEVELS,
  MASTERY_BONUSES,
  THEME_BONUSES,
  TEMPORAL_EVENTS,
  getStreakBonus,
  getMasteryLevel,
  getMasteryBonuses,
  checkMilestoneCompletion,
  getPendingMilestones,
  getNextMilestone,
  calculateMilestoneReward,
  checkThemeCompletion,
  isEventActive,
  getActiveEvents,
  calculatePrestige,
  type ConstructionMilestone,
} from '@/lib/progression/construction';

// ============================================
// TESTS: CONSTANTES
// ============================================

describe('CONSTRUCTION_MILESTONES', () => {
  it('should have at least 50 milestones', () => {
    expect(CONSTRUCTION_MILESTONES.length).toBeGreaterThanOrEqual(50);
  });

  it('should have all required properties for each milestone', () => {
    CONSTRUCTION_MILESTONES.forEach((milestone) => {
      expect(milestone).toHaveProperty('id');
      expect(milestone).toHaveProperty('name');
      expect(milestone).toHaveProperty('description');
      expect(milestone).toHaveProperty('category');
      expect(milestone).toHaveProperty('icon');
      expect(milestone).toHaveProperty('rarity');
      expect(milestone).toHaveProperty('requirements');
      expect(milestone).toHaveProperty('rewards');
      expect(typeof milestone.hidden).toBe('boolean');
      expect(typeof milestone.order).toBe('number');
    });
  });

  it('should have unique IDs for all milestones', () => {
    const ids = CONSTRUCTION_MILESTONES.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have 7 categories represented', () => {
    const categories = new Set(CONSTRUCTION_MILESTONES.map((m) => m.category));
    expect(categories.size).toBe(7);
    expect(categories.has('building')).toBe(true);
    expect(categories.has('collection')).toBe(true);
    expect(categories.has('mastery')).toBe(true);
    expect(categories.has('streak')).toBe(true);
    expect(categories.has('theme')).toBe(true);
    expect(categories.has('event')).toBe(true);
    expect(categories.has('exploration')).toBe(true);
  });

  it('should have all 5 rarities represented', () => {
    const rarities = new Set(CONSTRUCTION_MILESTONES.map((m) => m.rarity));
    expect(rarities.has('common')).toBe(true);
    expect(rarities.has('uncommon')).toBe(true);
    expect(rarities.has('rare')).toBe(true);
    expect(rarities.has('epic')).toBe(true);
    expect(rarities.has('legendary')).toBe(true);
  });

  it('should have valid reward values', () => {
    CONSTRUCTION_MILESTONES.forEach((milestone) => {
      expect(milestone.rewards.xp).toBeGreaterThanOrEqual(0);
      expect(milestone.rewards.coins).toBeGreaterThanOrEqual(0);
      expect(milestone.rewards.gems).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have milestone with xp rewards scaling with rarity', () => {
    const byRarity: Record<string, number[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    };

    CONSTRUCTION_MILESTONES.forEach((m) => {
      byRarity[m.rarity].push(m.rewards.xp);
    });

    // Check average XP increases with rarity
    const avgCommon = byRarity.common.reduce((a, b) => a + b, 0) / byRarity.common.length;
    const avgLegendary = byRarity.legendary.reduce((a, b) => a + b, 0) / byRarity.legendary.length;

    expect(avgLegendary).toBeGreaterThan(avgCommon);
  });

  it('should have some hidden milestones', () => {
    const hiddenMilestones = CONSTRUCTION_MILESTONES.filter((m) => m.hidden);
    expect(hiddenMilestones.length).toBeGreaterThan(0);
  });
});

describe('STREAK_BONUSES', () => {
  it('should have 7 streak tiers', () => {
    expect(STREAK_BONUSES.length).toBe(7);
  });

  it('should have increasing streak requirements', () => {
    for (let i = 1; i < STREAK_BONUSES.length; i++) {
      expect(STREAK_BONUSES[i].days).toBeGreaterThan(STREAK_BONUSES[i - 1].days);
    }
  });

  it('should have increasing multipliers', () => {
    for (let i = 1; i < STREAK_BONUSES.length; i++) {
      expect(STREAK_BONUSES[i].multiplier).toBeGreaterThan(STREAK_BONUSES[i - 1].multiplier);
    }
  });

  it('should start with 1.0x multiplier at 1 day', () => {
    expect(STREAK_BONUSES[0].days).toBe(1);
    expect(STREAK_BONUSES[0].multiplier).toBe(1.0);
  });

  it('should cap at 3.0x multiplier', () => {
    const lastTier = STREAK_BONUSES[STREAK_BONUSES.length - 1];
    expect(lastTier.multiplier).toBe(3.0);
  });

  it('should have increasing xpBonus', () => {
    for (let i = 1; i < STREAK_BONUSES.length; i++) {
      expect(STREAK_BONUSES[i].xpBonus).toBeGreaterThanOrEqual(STREAK_BONUSES[i - 1].xpBonus);
    }
  });
});

describe('MASTERY_LEVELS', () => {
  it('should have 10 mastery levels', () => {
    expect(MASTERY_LEVELS.length).toBe(10);
  });

  it('should have unique titles', () => {
    const titles = MASTERY_LEVELS.map((l) => l.title);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  it('should have increasing XP requirements', () => {
    for (let i = 1; i < MASTERY_LEVELS.length; i++) {
      expect(MASTERY_LEVELS[i].xpRequired).toBeGreaterThan(MASTERY_LEVELS[i - 1].xpRequired);
    }
  });

  it('should have levels from 1 to 10', () => {
    MASTERY_LEVELS.forEach((level, index) => {
      expect(level.level).toBe(index + 1);
    });
  });

  it('should start with Aprendiz and end with Inmortal', () => {
    expect(MASTERY_LEVELS[0].title).toBe('Aprendiz');
    expect(MASTERY_LEVELS[9].title).toBe('Inmortal');
  });

  it('should start at 0 XP required', () => {
    expect(MASTERY_LEVELS[0].xpRequired).toBe(0);
  });
});

describe('MASTERY_BONUSES', () => {
  it('should have bonus entries', () => {
    expect(MASTERY_BONUSES.length).toBeGreaterThan(0);
  });

  it('should have all required properties for each bonus', () => {
    MASTERY_BONUSES.forEach((bonus) => {
      expect(bonus).toHaveProperty('level');
      expect(bonus).toHaveProperty('type');
      expect(bonus).toHaveProperty('value');
      expect(bonus).toHaveProperty('description');
    });
  });

  it('should have valid bonus types', () => {
    const validTypes = ['speed', 'cost', 'quality', 'xp'];
    MASTERY_BONUSES.forEach((bonus) => {
      expect(validTypes).toContain(bonus.type);
    });
  });

  it('should have bonuses at various levels', () => {
    const levels = MASTERY_BONUSES.map((b) => b.level);
    const uniqueLevels = new Set(levels);
    expect(uniqueLevels.size).toBeGreaterThan(1);
  });

  it('should have positive values for bonuses', () => {
    MASTERY_BONUSES.forEach((bonus) => {
      expect(bonus.value).toBeGreaterThan(0);
    });
  });
});

describe('THEME_BONUSES', () => {
  it('should have at least 5 themes total', () => {
    expect(THEME_BONUSES.length).toBeGreaterThanOrEqual(5);
  });

  it('should have themes for currently supported language (French)', () => {
    // Actualmente los temas son solo franceses. Cuando se agreguen más idiomas,
    // este test debería actualizarse para verificar temas de cada idioma.
    // Los IDs de los temas franceses incluyen referencias culturales francesas
    const frenchThemeIds = THEME_BONUSES.map((t) => t.id);
    const hasFrenchReferences = frenchThemeIds.some((id) =>
      id.includes('paris') || id.includes('french') || id.includes('chateau') || id.includes('cathedral')
    );
    expect(hasFrenchReferences).toBe(true);
  });

  it('should be extensible for future languages', () => {
    // Verificar que la estructura permite agregar temas para otros idiomas
    // Todos los temas tienen la estructura requerida
    THEME_BONUSES.forEach((theme) => {
      expect(theme).toHaveProperty('id');
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('description');
      expect(theme).toHaveProperty('icon');
      expect(theme).toHaveProperty('requiredElements');
      expect(theme).toHaveProperty('bonusMultiplier');
      expect(theme).toHaveProperty('xpBonus');
    });
    // La estructura permite agregar propiedad 'language' en el futuro
    expect(THEME_BONUSES.length).toBeGreaterThan(0);
  });

  it('should have all required properties', () => {
    THEME_BONUSES.forEach((theme) => {
      expect(theme).toHaveProperty('id');
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('description');
      expect(theme).toHaveProperty('icon');
      expect(theme).toHaveProperty('requiredElements');
      expect(theme).toHaveProperty('bonusMultiplier');
      expect(theme).toHaveProperty('xpBonus');
      expect(typeof theme.isComplete).toBe('boolean');
    });
  });

  it('should have bonus multipliers greater than 1', () => {
    THEME_BONUSES.forEach((theme) => {
      expect(theme.bonusMultiplier).toBeGreaterThan(1);
    });
  });

  it('should require multiple elements for completion', () => {
    THEME_BONUSES.forEach((theme) => {
      expect(theme.requiredElements.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('should have unique theme IDs', () => {
    const ids = THEME_BONUSES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('TEMPORAL_EVENTS', () => {
  it('should have 4 seasonal events', () => {
    expect(TEMPORAL_EVENTS.length).toBe(4);
  });

  it('should have all required properties', () => {
    TEMPORAL_EVENTS.forEach((event) => {
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('name');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('startDate');
      expect(event).toHaveProperty('endDate');
      expect(event).toHaveProperty('exclusiveMaterials');
      expect(event).toHaveProperty('bonusMultiplier');
      expect(event).toHaveProperty('specialMilestones');
      expect(typeof event.isActive).toBe('boolean');
    });
  });

  it('should have valid date strings', () => {
    TEMPORAL_EVENTS.forEach((event) => {
      expect(() => new Date(event.startDate)).not.toThrow();
      expect(() => new Date(event.endDate)).not.toThrow();
    });
  });

  it('should have exclusive materials', () => {
    TEMPORAL_EVENTS.forEach((event) => {
      expect(event.exclusiveMaterials.length).toBeGreaterThan(0);
    });
  });

  it('should have special milestones', () => {
    TEMPORAL_EVENTS.forEach((event) => {
      expect(event.specialMilestones.length).toBeGreaterThan(0);
    });
  });

  it('should have French-themed events', () => {
    const names = TEMPORAL_EVENTS.map((e) => e.name.toLowerCase());
    expect(names.some((n) => n.includes('bastilla') || n.includes('bastille'))).toBe(true);
    expect(names.some((n) => n.includes('navidad') || n.includes('christmas'))).toBe(true);
  });

  it('should have events with cultural references', () => {
    // Verificar que los eventos tienen referencias culturales
    // Actualmente son franceses, pero la estructura permite agregar más idiomas
    const allNames = TEMPORAL_EVENTS.map((e) => e.name.toLowerCase()).join(' ');
    const allDescriptions = TEMPORAL_EVENTS.map((e) => e.description.toLowerCase()).join(' ');
    const combined = allNames + ' ' + allDescriptions;

    // Verificar referencias culturales existentes (francesas en este caso)
    expect(combined).toMatch(/francia|francesa|bastille|christmas|navidad/i);
  });
});

// ============================================
// TESTS: FUNCIONES
// ============================================

describe('getStreakBonus', () => {
  it('should return 1.0x for 0 days', () => {
    const bonus = getStreakBonus(0);
    expect(bonus.multiplier).toBe(1.0);
    expect(bonus.xpBonus).toBe(0);
  });

  it('should return 1.0x for 1 day', () => {
    const bonus = getStreakBonus(1);
    expect(bonus.multiplier).toBe(1.0);
    expect(bonus.xpBonus).toBe(0);
  });

  it('should return 1.1x for 3 days', () => {
    const bonus = getStreakBonus(3);
    expect(bonus.multiplier).toBe(1.1);
    expect(bonus.xpBonus).toBe(25);
  });

  it('should return 1.25x for 7 days', () => {
    const bonus = getStreakBonus(7);
    expect(bonus.multiplier).toBe(1.25);
    expect(bonus.xpBonus).toBe(75);
  });

  it('should return 1.5x for 14 days', () => {
    const bonus = getStreakBonus(14);
    expect(bonus.multiplier).toBe(1.5);
    expect(bonus.xpBonus).toBe(200);
  });

  it('should return 2.0x for 30 days', () => {
    const bonus = getStreakBonus(30);
    expect(bonus.multiplier).toBe(2.0);
    expect(bonus.xpBonus).toBe(500);
  });

  it('should return 3.0x for 100+ days', () => {
    const bonus = getStreakBonus(100);
    expect(bonus.multiplier).toBe(3.0);
    expect(getStreakBonus(150).multiplier).toBe(3.0);
  });

  it('should return correct tier for between-tier values', () => {
    // 5 days is between 3 (1.1x) and 7 (1.25x), should return 1.1x
    const bonus = getStreakBonus(5);
    expect(bonus.multiplier).toBe(1.1);
  });

  it('should include xpBonus in result', () => {
    const bonus = getStreakBonus(30);
    expect(bonus).toHaveProperty('xpBonus');
    expect(bonus.xpBonus).toBeGreaterThan(0);
  });
});

describe('getMasteryLevel', () => {
  it('should return level 1 for 0 XP', () => {
    const level = getMasteryLevel(0);
    expect(level.level).toBe(1);
    expect(level.title).toBe('Aprendiz');
  });

  it('should return level 1 for less than 100 XP', () => {
    const level = getMasteryLevel(50);
    expect(level.level).toBe(1);
  });

  it('should return level 2 for 100+ XP', () => {
    const level = getMasteryLevel(100);
    expect(level.level).toBe(2);
    expect(level.title).toBe('Iniciado');
  });

  it('should return level 10 for 10000+ XP', () => {
    const level = getMasteryLevel(10000);
    expect(level.level).toBe(10);
    expect(level.title).toBe('Inmortal');
  });

  it('should return level 10 for very high XP', () => {
    const level = getMasteryLevel(1000000);
    expect(level.level).toBe(10);
  });

  it('should return correct intermediate levels', () => {
    expect(getMasteryLevel(300).level).toBe(3); // xpRequired 300
    expect(getMasteryLevel(600).level).toBe(4); // xpRequired 600
    expect(getMasteryLevel(1000).level).toBe(5); // xpRequired 1000
  });

  it('should include progress in result', () => {
    const level = getMasteryLevel(150);
    expect(level).toHaveProperty('progress');
    expect(level.progress).toBeGreaterThanOrEqual(0);
    expect(level.progress).toBeLessThanOrEqual(100);
  });
});

describe('getMasteryBonuses', () => {
  it('should return empty for level 1', () => {
    const bonuses = getMasteryBonuses(1);
    expect(bonuses.length).toBe(0); // No bonuses at level 1, first bonus at level 2
  });

  it('should return bonuses for level 2+', () => {
    const bonuses = getMasteryBonuses(2);
    expect(bonuses.length).toBeGreaterThan(0);
  });

  it('should return more bonuses at higher levels', () => {
    const level3Bonuses = getMasteryBonuses(3);
    const level10Bonuses = getMasteryBonuses(10);
    expect(level10Bonuses.length).toBeGreaterThan(level3Bonuses.length);
  });

  it('should return empty for invalid levels', () => {
    const bonuses = getMasteryBonuses(0);
    expect(bonuses.length).toBe(0);
  });

  it('should filter by level correctly', () => {
    const bonuses = getMasteryBonuses(5);
    bonuses.forEach((bonus) => {
      expect(bonus.level).toBeLessThanOrEqual(5);
    });
  });
});

describe('checkMilestoneCompletion', () => {
  const createMockStats = (overrides?: Partial<Parameters<typeof checkMilestoneCompletion>[1]>) => ({
    totalBuilds: 0,
    uniqueMaterials: 0,
    currentStreak: 0,
    materialsByType: {} as Record<string, number>,
    buildsByType: {} as Record<string, number>,
    eventsCompleted: 0,
    masteryLevels: {} as Record<string, number>,
    ...overrides,
  });

  it('should return false for incomplete count milestone', () => {
    const stats = createMockStats({ totalBuilds: 5 });
    const milestone = CONSTRUCTION_MILESTONES.find(
      (m) => m.requirements.type === 'count' && m.requirements.target > 5 && !m.requirements.elementType
    );
    if (milestone) {
      expect(checkMilestoneCompletion(milestone, stats)).toBe(false);
    }
  });

  it('should return true for completed count milestone', () => {
    const stats = createMockStats({ totalBuilds: 100 });
    const milestone = CONSTRUCTION_MILESTONES.find(
      (m) => m.requirements.type === 'count' && m.requirements.target <= 100 && !m.requirements.elementType && !m.requirements.condition
    );
    if (milestone) {
      expect(checkMilestoneCompletion(milestone, stats)).toBe(true);
    }
  });

  it('should check unique materials for unique type', () => {
    const stats = createMockStats({ uniqueMaterials: 15 });
    const milestone = CONSTRUCTION_MILESTONES.find(
      (m) => m.requirements.type === 'unique' && m.requirements.target <= 15
    );
    if (milestone) {
      expect(checkMilestoneCompletion(milestone, stats)).toBe(true);
    }
  });

  it('should check streak for streak type', () => {
    const stats = createMockStats({ currentStreak: 7 });
    const milestone = CONSTRUCTION_MILESTONES.find(
      (m) => m.requirements.type === 'streak' && m.requirements.target <= 7
    );
    if (milestone) {
      expect(checkMilestoneCompletion(milestone, stats)).toBe(true);
    }
  });

  it('should check events completed for event type', () => {
    const stats = createMockStats({ eventsCompleted: 5 });
    const milestone = CONSTRUCTION_MILESTONES.find(
      (m) => m.requirements.type === 'event' && m.requirements.target <= 5 && !m.requirements.condition
    );
    if (milestone) {
      expect(checkMilestoneCompletion(milestone, stats)).toBe(true);
    }
  });

  it('should check element-specific builds', () => {
    const stats = createMockStats({
      buildsByType: { foundation: 25 },
    });
    const milestone = CONSTRUCTION_MILESTONES.find(
      (m) => m.requirements.type === 'count' && m.requirements.elementType === 'foundation'
    );
    if (milestone) {
      expect(checkMilestoneCompletion(milestone, stats)).toBe(true);
    }
  });
});

describe('getPendingMilestones', () => {
  it('should return all non-hidden milestones for empty completed list', () => {
    const pending = getPendingMilestones([]);
    const nonHidden = CONSTRUCTION_MILESTONES.filter((m) => !m.hidden);
    expect(pending.length).toBe(nonHidden.length);
  });

  it('should exclude completed milestones', () => {
    const firstMilestone = CONSTRUCTION_MILESTONES[0];
    const pending = getPendingMilestones([firstMilestone.id]);
    expect(pending.find((m) => m.id === firstMilestone.id)).toBeUndefined();
  });

  it('should exclude hidden milestones', () => {
    const pending = getPendingMilestones([]);
    pending.forEach((milestone) => {
      expect(milestone.hidden).toBe(false);
    });
  });

  it('should filter by category if provided', () => {
    const pending = getPendingMilestones([], 'streak');
    pending.forEach((milestone) => {
      expect(milestone.category).toBe('streak');
    });
  });

  it('should be sorted by order', () => {
    const pending = getPendingMilestones([]);
    for (let i = 1; i < pending.length; i++) {
      expect(pending[i].order).toBeGreaterThanOrEqual(pending[i - 1].order);
    }
  });
});

describe('getNextMilestone', () => {
  it('should return a milestone for empty state', () => {
    const next = getNextMilestone([], { totalBuilds: 0, uniqueMaterials: 0, currentStreak: 0 });
    expect(next).toBeDefined();
  });

  it('should return the first pending milestone for minimal progress', () => {
    const next = getNextMilestone([], { totalBuilds: 0, uniqueMaterials: 0, currentStreak: 0 });
    expect(next).not.toBeNull();
    expect(next?.hidden).toBe(false);
  });

  it('should return milestone with progress >= 25%', () => {
    // First milestone requires 1 build, so 1 build = 100% progress
    const next = getNextMilestone([], { totalBuilds: 3, uniqueMaterials: 3, currentStreak: 2 });
    expect(next).toBeDefined();
  });

  it('should return null if all milestones completed', () => {
    const allIds = CONSTRUCTION_MILESTONES.map((m) => m.id);
    const next = getNextMilestone(allIds, { totalBuilds: 1000, uniqueMaterials: 100, currentStreak: 365 });
    expect(next).toBeNull();
  });
});

describe('calculateMilestoneReward', () => {
  const firstMilestone = CONSTRUCTION_MILESTONES[0];

  it('should return base rewards with multiplier 1.0 and no bonus', () => {
    const rewards = calculateMilestoneReward(firstMilestone, 1.0, 0);
    expect(rewards.xp).toBe(firstMilestone.rewards.xp);
    expect(rewards.coins).toBe(firstMilestone.rewards.coins);
  });

  it('should apply streak multiplier to rewards', () => {
    const rewards = calculateMilestoneReward(firstMilestone, 2.0, 0);
    expect(rewards.xp).toBe(firstMilestone.rewards.xp * 2);
    expect(rewards.coins).toBe(firstMilestone.rewards.coins * 2);
  });

  it('should apply mastery bonus to rewards', () => {
    const rewards = calculateMilestoneReward(firstMilestone, 1.0, 0.5);
    expect(rewards.xp).toBe(Math.round(firstMilestone.rewards.xp * 1.5));
    expect(rewards.coins).toBe(Math.round(firstMilestone.rewards.coins * 1.5));
  });

  it('should combine multiplier and bonus', () => {
    const rewards = calculateMilestoneReward(firstMilestone, 2.0, 0.5);
    // Total multiplier = 2.0 * (1 + 0.5) = 3.0
    expect(rewards.xp).toBe(Math.round(firstMilestone.rewards.xp * 3));
    expect(rewards.coins).toBe(Math.round(firstMilestone.rewards.coins * 3));
  });

  it('should preserve gems without multiplier', () => {
    const rewards = calculateMilestoneReward(firstMilestone, 2.0, 0.5);
    expect(rewards.gems).toBe(firstMilestone.rewards.gems);
  });

  it('should round rewards to integers', () => {
    const rewards = calculateMilestoneReward(firstMilestone, 1.33, 0.17);
    expect(Number.isInteger(rewards.xp)).toBe(true);
    expect(Number.isInteger(rewards.coins)).toBe(true);
  });
});

describe('checkThemeCompletion', () => {
  it('should return false for empty elements', () => {
    const theme = THEME_BONUSES[0];
    expect(checkThemeCompletion(theme, [])).toBe(false);
  });

  it('should return false for partial completion', () => {
    const theme = THEME_BONUSES[0];
    const partial = theme.requiredElements.slice(0, 1);
    expect(checkThemeCompletion(theme, partial)).toBe(false);
  });

  it('should return true when all elements completed', () => {
    const theme = THEME_BONUSES[0];
    expect(checkThemeCompletion(theme, theme.requiredElements)).toBe(true);
  });

  it('should return true with extra elements', () => {
    const theme = THEME_BONUSES[0];
    const withExtras = [...theme.requiredElements, 'extra_element'];
    expect(checkThemeCompletion(theme, withExtras)).toBe(true);
  });

  it('should work for all themes', () => {
    THEME_BONUSES.forEach((theme) => {
      expect(checkThemeCompletion(theme, theme.requiredElements)).toBe(true);
      expect(checkThemeCompletion(theme, [])).toBe(false);
    });
  });
});

describe('isEventActive', () => {
  it('should return false for future events', () => {
    const futureEvent: typeof TEMPORAL_EVENTS[0] = {
      id: 'test',
      name: 'Test Event',
      description: 'Test',
      startDate: '2099-01-01T00:00:00Z',
      endDate: '2099-12-31T23:59:59Z',
      exclusiveMaterials: ['test'],
      bonusMultiplier: 1.5,
      specialMilestones: ['test'],
      isActive: false,
    };
    expect(isEventActive(futureEvent)).toBe(false);
  });

  it('should return false for past events', () => {
    const pastEvent: typeof TEMPORAL_EVENTS[0] = {
      id: 'test',
      name: 'Test Event',
      description: 'Test',
      startDate: '2020-01-01T00:00:00Z',
      endDate: '2020-12-31T23:59:59Z',
      exclusiveMaterials: ['test'],
      bonusMultiplier: 1.5,
      specialMilestones: ['test'],
      isActive: false,
    };
    expect(isEventActive(pastEvent)).toBe(false);
  });

  it('should return true for current events', () => {
    const now = new Date();
    const currentEvent: typeof TEMPORAL_EVENTS[0] = {
      id: 'test',
      name: 'Test Event',
      description: 'Test',
      startDate: new Date(now.getTime() - 86400000).toISOString(), // Yesterday
      endDate: new Date(now.getTime() + 86400000).toISOString(), // Tomorrow
      exclusiveMaterials: ['test'],
      bonusMultiplier: 1.5,
      specialMilestones: ['test'],
      isActive: false,
    };
    expect(isEventActive(currentEvent)).toBe(true);
  });
});

describe('getActiveEvents', () => {
  it('should return array of events', () => {
    const events = getActiveEvents();
    expect(Array.isArray(events)).toBe(true);
  });

  it('should only return events that pass isEventActive', () => {
    const events = getActiveEvents();
    events.forEach((event) => {
      expect(isEventActive(event)).toBe(true);
    });
  });
});

describe('calculatePrestige', () => {
  it('should return level 0 for no XP', () => {
    const prestige = calculatePrestige([], 0);
    expect(prestige.level).toBe(0);
    expect(prestige.title).toBe('Nuevo Constructor');
  });

  it('should return level 1 for 5000+ XP', () => {
    const prestige = calculatePrestige([], 5000);
    expect(prestige.level).toBe(1);
    expect(prestige.title).toBe('Constructor Bronce');
  });

  it('should increase with milestones completed', () => {
    // Each milestone adds 100 XP bonus
    const withMilestones = calculatePrestige(['a', 'b', 'c', 'd', 'e'], 4500); // 4500 + 500 = 5000
    expect(withMilestones.level).toBe(1);
  });

  it('should return object with level, title, nextLevelXP', () => {
    const prestige = calculatePrestige([], 10000);
    expect(prestige).toHaveProperty('level');
    expect(prestige).toHaveProperty('title');
    expect(prestige).toHaveProperty('nextLevelXP');
  });

  it('should cap at highest level', () => {
    const maxPrestige = calculatePrestige([], 10000000);
    expect(maxPrestige.level).toBe(8);
    expect(maxPrestige.title).toBe('Constructor Inmortal');
  });

  it('should have increasing nextLevelXP', () => {
    const level0 = calculatePrestige([], 0);
    const level1 = calculatePrestige([], 5000);
    expect(level1.nextLevelXP).toBeGreaterThan(level0.nextLevelXP);
  });
});
