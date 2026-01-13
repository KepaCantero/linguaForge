/**
 * Construction Integration Service
 * Conecta el sistema de construcción 3D con gamificación y recompensas
 *
 * TAREA 2.8.9.6: Integración con sistema de recompensas
 */

import { type MaterialRarity } from '@/schemas/construction';
import {
  MATERIALS,
  ELEMENTS,
  CONSTRUCTION_MILESTONES,
  type ElementDefinition,
} from '@/store/useConstructionStore';

// ============================================
// TIPOS
// ============================================

export interface ConstructionReward {
  xp: number;
  coins: number;
  gems: number;
  materials: MaterialReward[];
  bonuses: BonusReward[];
  achievements: string[];
}

export interface MaterialReward {
  materialId: string;
  amount: number;
  isBonus: boolean;
}

export interface BonusReward {
  type: 'streak' | 'perfect' | 'speed' | 'combo' | 'rare_drop';
  multiplier: number;
  description: string;
}

export interface TopicToMaterialMapping {
  topicType: string;
  materials: {
    materialId: string;
    dropRate: number; // 0-1
    baseAmount: number;
    maxAmount: number;
  }[];
}

export interface ElementUnlockRequirement {
  elementId: string;
  requiredLevel: number;
  requiredTopics: number;
  requiredMaterials: { materialId: string; amount: number }[];
  prerequisiteElements: string[];
}

export interface ConstructionSession {
  startTime: Date;
  elementsBuilt: string[];
  materialsUsed: Record<string, number>;
  xpEarned: number;
  coinsSpent: number;
  bonusesEarned: BonusReward[];
}

// ============================================
// CONSTANTES DE CONFIGURACIÓN
// ============================================

// Multiplicadores de rareza para recompensas
const RARITY_MULTIPLIERS: Record<MaterialRarity, number> = {
  common: 1.0,
  uncommon: 1.5,
  rare: 2.5,
  epic: 4.0,
  legendary: 8.0,
};

// Tasas de drop por rareza
const RARITY_DROP_RATES: Record<MaterialRarity, number> = {
  common: 0.6,
  uncommon: 0.25,
  rare: 0.1,
  epic: 0.04,
  legendary: 0.01,
};

// Bonificaciones por racha
const STREAK_BONUSES = [
  { days: 3, xpMultiplier: 1.1, materialBonus: 0.1 },
  { days: 7, xpMultiplier: 1.25, materialBonus: 0.2 },
  { days: 14, xpMultiplier: 1.5, materialBonus: 0.3 },
  { days: 30, xpMultiplier: 2.0, materialBonus: 0.5 },
];

// Mapeo de tipos de contenido a materiales
const TOPIC_MATERIAL_MAPPING: TopicToMaterialMapping[] = [
  {
    topicType: 'vocabulary',
    materials: [
      { materialId: 'oak_wood', dropRate: 0.4, baseAmount: 1, maxAmount: 3 },
      { materialId: 'limestone', dropRate: 0.3, baseAmount: 1, maxAmount: 2 },
      { materialId: 'clear_glass', dropRate: 0.2, baseAmount: 1, maxAmount: 2 },
      { materialId: 'mahogany_wood', dropRate: 0.08, baseAmount: 1, maxAmount: 1 },
      { materialId: 'amethyst', dropRate: 0.02, baseAmount: 1, maxAmount: 1 },
    ],
  },
  {
    topicType: 'grammar',
    materials: [
      { materialId: 'limestone', dropRate: 0.35, baseAmount: 1, maxAmount: 3 },
      { materialId: 'iron', dropRate: 0.3, baseAmount: 1, maxAmount: 2 },
      { materialId: 'marble', dropRate: 0.2, baseAmount: 1, maxAmount: 2 },
      { materialId: 'bronze', dropRate: 0.1, baseAmount: 1, maxAmount: 1 },
      { materialId: 'obsidian', dropRate: 0.05, baseAmount: 1, maxAmount: 1 },
    ],
  },
  {
    topicType: 'conversation',
    materials: [
      { materialId: 'oak_wood', dropRate: 0.3, baseAmount: 1, maxAmount: 2 },
      { materialId: 'clear_glass', dropRate: 0.3, baseAmount: 1, maxAmount: 2 },
      { materialId: 'stained_glass', dropRate: 0.2, baseAmount: 1, maxAmount: 1 },
      { materialId: 'mahogany_wood', dropRate: 0.15, baseAmount: 1, maxAmount: 1 },
      { materialId: 'sapphire', dropRate: 0.05, baseAmount: 1, maxAmount: 1 },
    ],
  },
  {
    topicType: 'culture',
    materials: [
      { materialId: 'marble', dropRate: 0.35, baseAmount: 1, maxAmount: 2 },
      { materialId: 'stained_glass', dropRate: 0.25, baseAmount: 1, maxAmount: 2 },
      { materialId: 'bronze', dropRate: 0.2, baseAmount: 1, maxAmount: 1 },
      { materialId: 'gold', dropRate: 0.15, baseAmount: 1, maxAmount: 1 },
      { materialId: 'sapphire', dropRate: 0.05, baseAmount: 1, maxAmount: 1 },
    ],
  },
  {
    topicType: 'advanced',
    materials: [
      { materialId: 'obsidian', dropRate: 0.25, baseAmount: 1, maxAmount: 2 },
      { materialId: 'crystal_glass', dropRate: 0.25, baseAmount: 1, maxAmount: 2 },
      { materialId: 'gold', dropRate: 0.2, baseAmount: 1, maxAmount: 1 },
      { materialId: 'sapphire', dropRate: 0.2, baseAmount: 1, maxAmount: 1 },
      { materialId: 'diamond', dropRate: 0.1, baseAmount: 1, maxAmount: 1 },
    ],
  },
];

// ============================================
// FUNCIONES DE CÁLCULO DE RECOMPENSAS
// ============================================

/**
 * Calcula recompensas por completar un tema/lección
 */
export function calculateTopicRewards(
  topicType: string,
  userLevel: number,
  streakDays: number,
  accuracy: number,
  timeBonus: boolean
): ConstructionReward {
  const rewards: ConstructionReward = {
    xp: 0,
    coins: 0,
    gems: 0,
    materials: [],
    bonuses: [],
    achievements: [],
  };

  // XP base por nivel
  const baseXP = 20 + userLevel * 5;
  rewards.xp = baseXP;

  // Coins base
  rewards.coins = Math.round(baseXP * 0.5);

  // Calcular materiales
  const mapping = TOPIC_MATERIAL_MAPPING.find((m) => m.topicType === topicType);
  if (mapping) {
    rewards.materials = calculateMaterialDrops(mapping, userLevel, accuracy);
  }

  // Aplicar bonificaciones
  const bonuses = calculateBonuses(streakDays, accuracy, timeBonus);
  rewards.bonuses = bonuses;

  // Aplicar multiplicadores de bonificación
  const totalMultiplier = bonuses.reduce((mult, b) => mult * b.multiplier, 1);
  rewards.xp = Math.round(rewards.xp * totalMultiplier);
  rewards.coins = Math.round(rewards.coins * totalMultiplier);

  // Gems por precisión perfecta o racha larga
  if (accuracy === 100) {
    rewards.gems = 1;
    rewards.achievements.push('perfect_accuracy');
  }
  if (streakDays >= 7) {
    rewards.gems += Math.floor(streakDays / 7);
  }

  return rewards;
}

/**
 * Calcula drops de materiales basado en tasas y nivel
 */
function calculateMaterialDrops(
  mapping: TopicToMaterialMapping,
  userLevel: number,
  accuracy: number
): MaterialReward[] {
  const drops: MaterialReward[] = [];
  const accuracyBonus = accuracy / 100;
  const levelBonus = 1 + (userLevel - 1) * 0.1;

  for (const mat of mapping.materials) {
    const adjustedDropRate = mat.dropRate * accuracyBonus * levelBonus;
    const roll = Math.random();

    if (roll < adjustedDropRate) {
      const amount = Math.min(
        mat.maxAmount,
        mat.baseAmount + Math.floor(Math.random() * (mat.maxAmount - mat.baseAmount + 1))
      );

      // Verificar si es drop bonus (roll muy bajo)
      const isBonus = roll < adjustedDropRate * 0.2;

      drops.push({
        materialId: mat.materialId,
        amount: isBonus ? amount * 2 : amount,
        isBonus,
      });
    }
  }

  return drops;
}

/**
 * Calcula bonificaciones aplicables
 */
function calculateBonuses(
  streakDays: number,
  accuracy: number,
  timeBonus: boolean
): BonusReward[] {
  const bonuses: BonusReward[] = [];

  // Bonus por racha
  for (let i = STREAK_BONUSES.length - 1; i >= 0; i--) {
    if (streakDays >= STREAK_BONUSES[i].days) {
      bonuses.push({
        type: 'streak',
        multiplier: STREAK_BONUSES[i].xpMultiplier,
        description: `Racha de ${STREAK_BONUSES[i].days} días`,
      });
      break;
    }
  }

  // Bonus por precisión perfecta
  if (accuracy === 100) {
    bonuses.push({
      type: 'perfect',
      multiplier: 1.5,
      description: 'Precisión perfecta',
    });
  }

  // Bonus por velocidad
  if (timeBonus) {
    bonuses.push({
      type: 'speed',
      multiplier: 1.2,
      description: 'Completado rápidamente',
    });
  }

  return bonuses;
}

/**
 * Calcula recompensas por construir un elemento
 */
export function calculateBuildRewards(
  elementId: string,
  userLevel: number,
  streakDays: number
): ConstructionReward {
  const element = ELEMENTS[elementId];
  if (!element) {
    return { xp: 0, coins: 0, gems: 0, materials: [], bonuses: [], achievements: [] };
  }

  const rewards: ConstructionReward = {
    xp: element.xpReward,
    coins: Math.round(element.xpReward * 0.3),
    gems: 0,
    materials: [],
    bonuses: [],
    achievements: [],
  };

  // Bonus por nivel
  const levelMultiplier = 1 + (userLevel - 1) * 0.05;
  rewards.xp = Math.round(rewards.xp * levelMultiplier);
  rewards.coins = Math.round(rewards.coins * levelMultiplier);

  // Bonus por racha
  const streakBonus = STREAK_BONUSES.find((b) => streakDays >= b.days);
  if (streakBonus) {
    rewards.bonuses.push({
      type: 'streak',
      multiplier: streakBonus.xpMultiplier,
      description: `Racha de ${streakBonus.days} días`,
    });
    rewards.xp = Math.round(rewards.xp * streakBonus.xpMultiplier);
  }

  // Gems por elementos raros
  const rarity = getMaterialRarityFromElement(element);
  if (rarity === 'epic' || rarity === 'legendary') {
    rewards.gems = rarity === 'legendary' ? 5 : 2;
    rewards.achievements.push(`built_${rarity}_element`);
  }

  return rewards;
}

/**
 * Obtiene la rareza del material principal de un elemento
 */
function getMaterialRarityFromElement(element: ElementDefinition): MaterialRarity {
  if (element.requiredMaterials.length === 0) return 'common';

  const mainMaterialId = element.requiredMaterials[0].materialId;
  const material = MATERIALS[mainMaterialId];

  return material?.rarity || 'common';
}

/**
 * Calcula el costo de construcción de un elemento
 */
export function calculateBuildCost(elementId: string): {
  materials: { materialId: string; amount: number; available: boolean }[];
  totalXPCost: number;
  totalCoinCost: number;
  canBuild: boolean;
} {
  const element = ELEMENTS[elementId];
  if (!element) {
    return { materials: [], totalXPCost: 0, totalCoinCost: 0, canBuild: false };
  }

  let totalXPCost = 0;
  let totalCoinCost = 0;
  const materials = element.requiredMaterials.map((req) => {
    const material = MATERIALS[req.materialId];
    if (material) {
      totalXPCost += material.xpCost * req.amount;
      totalCoinCost += material.coinCost * req.amount;
    }
    return {
      materialId: req.materialId,
      amount: req.amount,
      available: false, // Se verificará con el store
    };
  });

  return {
    materials,
    totalXPCost,
    totalCoinCost,
    canBuild: true, // Se verificará con el store
  };
}

/**
 * Verifica si un elemento puede ser desbloqueado
 */
export function canUnlockElement(
  elementId: string,
  userLevel: number,
  topicsCompleted: number
): { canUnlock: boolean; reason: string | null } {
  const element = ELEMENTS[elementId];
  if (!element) {
    return { canUnlock: false, reason: 'Elemento no encontrado' };
  }

  // Verificar nivel
  if (userLevel < element.unlockLevel) {
    return {
      canUnlock: false,
      reason: `Requiere nivel ${element.unlockLevel}`,
    };
  }

  // Verificar temas completados (estimación: 5 temas por nivel)
  const requiredTopics = element.unlockLevel * 5;
  if (topicsCompleted < requiredTopics) {
    return {
      canUnlock: false,
      reason: `Requiere ${requiredTopics} temas completados`,
    };
  }

  return { canUnlock: true, reason: null };
}

/**
 * Obtiene elementos desbloqueables para un nivel dado
 */
export function getUnlockableElements(
  userLevel: number,
  unlockedElements: string[]
): ElementDefinition[] {
  return Object.values(ELEMENTS).filter(
    (element) =>
      element.unlockLevel <= userLevel &&
      !unlockedElements.includes(element.id)
  );
}

/**
 * Calcula hitos de construcción alcanzados
 */
export function checkMilestones(
  totalBuilds: number,
  currentMilestones: number[]
): {
  newMilestones: typeof CONSTRUCTION_MILESTONES;
  rewards: { xp: number; coins: number };
} {
  const newMilestones = CONSTRUCTION_MILESTONES.filter(
    (m) => totalBuilds >= m.builds && !currentMilestones.includes(m.builds)
  );

  const rewards = newMilestones.reduce(
    (acc, m) => ({
      xp: acc.xp + m.reward.xp,
      coins: acc.coins + m.reward.coins,
    }),
    { xp: 0, coins: 0 }
  );

  return { newMilestones, rewards };
}

/**
 * Convierte XP en materiales (para sistema de compra)
 */
export function convertXPToMaterials(
  xp: number,
  targetMaterialId: string
): { success: boolean; amount: number; xpCost: number } {
  const material = MATERIALS[targetMaterialId];
  if (!material) {
    return { success: false, amount: 0, xpCost: 0 };
  }

  const maxAffordable = Math.floor(xp / material.xpCost);
  if (maxAffordable <= 0) {
    return { success: false, amount: 0, xpCost: 0 };
  }

  return {
    success: true,
    amount: maxAffordable,
    xpCost: maxAffordable * material.xpCost,
  };
}

/**
 * Convierte coins en materiales (para sistema de compra)
 */
export function convertCoinsToMaterials(
  coins: number,
  targetMaterialId: string
): { success: boolean; amount: number; coinCost: number } {
  const material = MATERIALS[targetMaterialId];
  if (!material) {
    return { success: false, amount: 0, coinCost: 0 };
  }

  const maxAffordable = Math.floor(coins / material.coinCost);
  if (maxAffordable <= 0) {
    return { success: false, amount: 0, coinCost: 0 };
  }

  return {
    success: true,
    amount: maxAffordable,
    coinCost: maxAffordable * material.coinCost,
  };
}

/**
 * Calcula el valor total de una colección de materiales
 */
export function calculateCollectionValue(
  inventory: Record<string, number>
): { totalXPValue: number; totalCoinValue: number; rarityBreakdown: Record<MaterialRarity, number> } {
  let totalXPValue = 0;
  let totalCoinValue = 0;
  const rarityBreakdown: Record<MaterialRarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  for (const [materialId, amount] of Object.entries(inventory)) {
    const material = MATERIALS[materialId];
    if (material && amount > 0) {
      totalXPValue += material.xpCost * amount;
      totalCoinValue += material.coinCost * amount;
      rarityBreakdown[material.rarity] += amount;
    }
  }

  return { totalXPValue, totalCoinValue, rarityBreakdown };
}

/**
 * Determina la rareza de material basada en evento y roll
 */
function determineEventRarity(eventType: 'daily' | 'weekly' | 'special', roll: number): MaterialRarity {
  const SPECIAL_THRESHOLDS = { legendary: 0.1, epic: 0.3, rare: 0.6 };
  const WEEKLY_THRESHOLDS = { epic: 0.05, rare: 0.2, uncommon: 0.5 };
  const DAILY_THRESHOLDS = { rare: 0.1, uncommon: 0.35 };

  if (eventType === 'special') {
    if (roll < SPECIAL_THRESHOLDS.legendary) return 'legendary';
    if (roll < SPECIAL_THRESHOLDS.epic) return 'epic';
    if (roll < SPECIAL_THRESHOLDS.rare) return 'rare';
    return 'uncommon';
  }

  if (eventType === 'weekly') {
    if (roll < WEEKLY_THRESHOLDS.epic) return 'epic';
    if (roll < WEEKLY_THRESHOLDS.rare) return 'rare';
    if (roll < WEEKLY_THRESHOLDS.uncommon) return 'uncommon';
    return 'common';
  }

  // Daily
  if (roll < DAILY_THRESHOLDS.rare) return 'rare';
  if (roll < DAILY_THRESHOLDS.uncommon) return 'uncommon';
  return 'common';
}

/**
 * Genera recompensas aleatorias para eventos especiales
 */
export function generateEventRewards(
  eventType: 'daily' | 'weekly' | 'special',
  userLevel: number
): ConstructionReward {
  const baseMultipliers = { daily: 1, weekly: 3, special: 5 };
  const multiplier = baseMultipliers[eventType];

  const rewards: ConstructionReward = {
    xp: 50 * multiplier * userLevel,
    coins: 25 * multiplier * userLevel,
    gems: eventType === 'special' ? Math.floor(Math.random() * 3) + 1 : 0,
    materials: [],
    bonuses: [],
    achievements: eventType === 'special' ? ['special_event_completed'] : [],
  };

  // Generar drops de materiales con rareza ajustada
  const materialCount = 1 + Math.floor(Math.random() * (multiplier + 1));
  const allMaterials = Object.values(MATERIALS);

  for (let i = 0; i < materialCount; i++) {
    const roll = Math.random();
    const targetRarity = determineEventRarity(eventType, roll);

    const eligibleMaterials = allMaterials.filter((m) => m.rarity === targetRarity);
    if (eligibleMaterials.length > 0) {
      const selectedMaterial = eligibleMaterials[Math.floor(Math.random() * eligibleMaterials.length)];
      rewards.materials.push({
        materialId: selectedMaterial.id,
        amount: 1 + Math.floor(Math.random() * multiplier),
        isBonus: false,
      });
    }
  }

  return rewards;
}

// ============================================
// EXPORTACIONES
// ============================================

const constructionIntegrationAPI = {
  // Constantes
  RARITY_MULTIPLIERS,
  RARITY_DROP_RATES,
  STREAK_BONUSES,
  TOPIC_MATERIAL_MAPPING,

  // Funciones de recompensas
  calculateTopicRewards,
  calculateBuildRewards,
  calculateBuildCost,

  // Funciones de desbloqueo
  canUnlockElement,
  getUnlockableElements,

  // Funciones de hitos
  checkMilestones,

  // Funciones de conversión
  convertXPToMaterials,
  convertCoinsToMaterials,
  calculateCollectionValue,

  // Funciones de eventos
  generateEventRewards,
};

export default constructionIntegrationAPI;
