/**
 * constructionRewards - Otorga materiales de construcción automáticamente
 *
 * Conecta el progreso de aprendizaje (XP, nivel) con el sistema de construcción.
 * Cada vez que el usuario gana XP, automáticamente recibe materiales.
 */

import { useConstructionStore, MATERIALS } from '@/store/useConstructionStore';

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * Probabilidades de obtener materiales por XP ganado
 */
const MATERIAL_DROP_RATES = {
  // Por cada 10 XP, probabilidad de obtener material
  common: 0.6,      // 60% probabilidad de material común
  uncommon: 0.25,   // 25% probabilidad de material poco común
  rare: 0.1,        // 10% probabilidad de material raro
  epic: 0.04,       // 4% probabilidad de material épico
  legendary: 0.01,  // 1% probabilidad de material legendario
} as const;

/**
 * Materiales por rareza
 */
const MATERIALS_BY_RARITY = {
  common: Object.values(MATERIALS).filter(m => m.rarity === 'common'),
  uncommon: Object.values(MATERIALS).filter(m => m.rarity === 'uncommon'),
  rare: Object.values(MATERIALS).filter(m => m.rarity === 'rare'),
  epic: Object.values(MATERIALS).filter(m => m.rarity === 'epic'),
  legendary: Object.values(MATERIALS).filter(m => m.rarity === 'legendary'),
};

/**
 * Cantidad de materiales a otorgar según rareza
 */
const MATERIAL_AMOUNTS = {
  common: 5,      // 5 unidades de material común
  uncommon: 3,    // 3 unidades de material poco común
  rare: 2,        // 2 unidades de material raro
  epic: 1,        // 1 unidad de material épico
  legendary: 1,   // 1 unidad de material legendario
} as const;

// ============================================
// FUNCIONES
// ============================================

/**
 * Otorga materiales basado en el XP ganado
 * @param xpGained - Cantidad de XP ganada
 * @returns Materiales otorgados { materialId: amount }
 */
export function grantMaterialsForXP(xpGained: number): Record<string, number> {
  if (xpGained <= 0) return {};

  const { addMaterial } = useConstructionStore.getState();
  const granted: Record<string, number> = {};

  // Cada 10 XP = 1 oportunidad de drop
  const dropChances = Math.floor(xpGained / 10);

  for (let i = 0; i < dropChances; i++) {
    const material = getRandomMaterialDrop();
    if (material) {
      const amount = MATERIAL_AMOUNTS[material.rarity];
      addMaterial(material.id, amount);
      granted[material.id] = (granted[material.id] || 0) + amount;
    }
  }

  // Disparar evento para feedback visual
  if (typeof window !== 'undefined' && Object.keys(granted).length > 0) {
    globalThis.dispatchEvent(new CustomEvent('materials-gained', { detail: granted }));
  }

  return granted;
}

/**
 * Selecciona un material aleatorio basado en las probabilidades de drop
 */
function getRandomMaterialDrop(): typeof MATERIALS[keyof typeof MATERIALS] | null {
  const roll = Math.random();

  // Determinar rareza
  let rarity: keyof typeof MATERIAL_DROP_RATES = 'common';
  if (roll < MATERIAL_DROP_RATES.legendary) {
    rarity = 'legendary';
  } else if (roll < MATERIAL_DROP_RATES.legendary + MATERIAL_DROP_RATES.epic) {
    rarity = 'epic';
  } else if (roll < MATERIAL_DROP_RATES.legendary + MATERIAL_DROP_RATES.epic + MATERIAL_DROP_RATES.rare) {
    rarity = 'rare';
  } else if (roll < MATERIAL_DROP_RATES.legendary + MATERIAL_DROP_RATES.epic + MATERIAL_DROP_RATES.rare + MATERIAL_DROP_RATES.uncommon) {
    rarity = 'uncommon';
  }

  // Seleccionar material aleatorio de esa rareza
  const materials = MATERIALS_BY_RARITY[rarity];
  if (materials.length === 0) return null;

  return materials[Math.floor(Math.random() * materials.length)];
}

/**
 * Otorga materiales al subir de nivel
 * @param newLevel - Nuevo nivel del usuario
 */
export function grantMaterialsForLevelUp(newLevel: number): Record<string, number> {
  if (newLevel <= 1) return {};

  const { addMaterial } = useConstructionStore.getState();
  const granted: Record<string, number> = {};

  // Bonus de nivel: 3-5 materiales garantizados de rareza uncommon+
  const bonusCount = 3 + Math.floor(Math.random() * 3); // 3-5 materiales

  for (let i = 0; i < bonusCount; i++) {
    // Nivel alto = mejores materiales
    let rarity: keyof typeof MATERIAL_DROP_RATES = 'uncommon';
    if (newLevel >= 10) rarity = 'rare';
    if (newLevel >= 20) rarity = 'epic';
    if (newLevel >= 30) rarity = 'legendary';

    const materials = MATERIALS_BY_RARITY[rarity];
    if (materials.length > 0) {
      const material = materials[Math.floor(Math.random() * materials.length)];
      const amount = MATERIAL_AMOUNTS[rarity] * 2; // Doble cantidad por level up
      addMaterial(material.id, amount);
      granted[material.id] = (granted[material.id] || 0) + amount;
    }
  }

  // Disparar evento para feedback visual
  if (typeof window !== 'undefined' && Object.keys(granted).length > 0) {
    globalThis.dispatchEvent(new CustomEvent('materials-gained', { detail: granted }));
  }

  return granted;
}

/**
 * Hook para escuchar eventos de gamificación y otorgar materiales automáticamente
 */
export function initConstructionRewards() {
  // Escuchar eventos de XP ganado
  if (typeof window !== 'undefined') {
    globalThis.addEventListener('xp-gained', ((e: CustomEvent<{ amount: number }>) => {
      grantMaterialsForXP(e.detail.amount);
    }) as EventListener);

    // Escuchar eventos de nivel subido
    globalThis.addEventListener('level-up', ((e: CustomEvent<{ newLevel: number }>) => {
      grantMaterialsForLevelUp(e.detail.newLevel);
    }) as EventListener);
  }
}
