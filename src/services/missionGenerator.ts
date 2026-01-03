/**
 * Mission Generator Service
 *
 * Genera misiones diarias basadas en:
 * - Cognitive Load Theory (CLT)
 * - Nivel del usuario
 * - Historial de rendimiento
 * - Balance de tipos de actividad
 */

import type { Mission, MissionType } from '@/store/useMissionStore';
import type { MissionType as WarmupMissionType, Difficulty } from '@/schemas/warmup';

// ============================================================
// TIPOS
// ============================================================

export interface UserContext {
  level: number;
  rank: string;
  streak: number;
  hp: number;
  recentPerformance: {
    exercisesCompleted: number;
    accuracy: number; // 0-1
    averageSessionMinutes: number;
  };
  preferences: {
    focusOnGrammar: boolean;
    focusOnVocabulary: boolean;
    focusOnPronunciation: boolean;
  };
  lastSessionLoad?: {
    intrinsic: number;
    extraneous: number;
    germane: number;
  };
}

export interface MissionTemplate {
  type: MissionType['type'];
  baseTarget: number;
  targetScaling: number; // Multiplicador por nivel
  baseXP: number;
  baseCoins: number;
  baseGems?: number;
  warmupMissionType: WarmupMissionType;
  baseCognitiveLoad: number;
  requiresFocus: boolean;
  minLevel: number;
  priority: number; // 1-10, mayor = más importante
}

export interface GeneratedMission extends Omit<Mission, 'id'> {
  templateType: string;
}

// ============================================================
// TEMPLATES DE MISIONES
// ============================================================

const MISSION_TEMPLATES: MissionTemplate[] = [
  // Misión de Input (siempre presente, carga baja)
  {
    type: 'input',
    baseTarget: 5,
    targetScaling: 2,
    baseXP: 25,
    baseCoins: 10,
    warmupMissionType: 'vocabulary',
    baseCognitiveLoad: 25,
    requiresFocus: true,
    minLevel: 1,
    priority: 8,
  },
  // Misión de Ejercicios (siempre presente, carga media)
  {
    type: 'exercises',
    baseTarget: 3,
    targetScaling: 0.5,
    baseXP: 30,
    baseCoins: 15,
    warmupMissionType: 'grammar',
    baseCognitiveLoad: 50,
    requiresFocus: true,
    minLevel: 1,
    priority: 9,
  },
  // Misión Janus (nivel 2+, carga alta)
  {
    type: 'janus',
    baseTarget: 5,
    targetScaling: 1,
    baseXP: 20,
    baseCoins: 10,
    warmupMissionType: 'grammar',
    baseCognitiveLoad: 65,
    requiresFocus: true,
    minLevel: 2,
    priority: 6,
  },
  // Misión Forge Mandate (siempre, carga muy alta)
  {
    type: 'forgeMandate',
    baseTarget: 1,
    targetScaling: 0,
    baseXP: 100,
    baseCoins: 50,
    baseGems: 20,
    warmupMissionType: 'mixed',
    baseCognitiveLoad: 75,
    requiresFocus: true,
    minLevel: 1,
    priority: 10,
  },
  // Misión de Streak (motivación, carga baja)
  {
    type: 'streak',
    baseTarget: 1,
    targetScaling: 0,
    baseXP: 15,
    baseCoins: 5,
    warmupMissionType: 'mixed',
    baseCognitiveLoad: 10,
    requiresFocus: false,
    minLevel: 1,
    priority: 5,
  },
];

// ============================================================
// CONSTANTES CLT
// ============================================================

const CLT_CONFIG = {
  // Carga total máxima recomendada por sesión
  maxTotalLoad: 250,

  // Número de misiones por nivel de HP
  missionsByHP: {
    full: 4,      // HP >= 80%
    high: 4,      // HP >= 60%
    medium: 3,    // HP >= 40%
    low: 2,       // HP < 40%
  },

  // Ajuste de carga por precisión reciente
  accuracyLoadModifier: {
    high: 0.9,    // > 80% precisión: puede manejar más carga
    medium: 1.0,  // 60-80% precisión: normal
    low: 1.15,    // < 60% precisión: reducir carga
  },

  // Bonus XP por completar todas las misiones
  allMissionsBonus: 50,
};

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

/**
 * Calcula la dificultad basada en el nivel del usuario
 */
function calculateDifficulty(level: number): Difficulty {
  if (level <= 3) return 'low';
  if (level <= 6) return 'medium';
  return 'high';
}

/**
 * Calcula el target ajustado por nivel
 */
function calculateTarget(template: MissionTemplate, level: number): number {
  const baseTarget = template.baseTarget;
  const scaling = template.targetScaling;
  return Math.round(baseTarget + (level * scaling));
}

/**
 * Calcula las recompensas ajustadas por nivel y dificultad
 */
function calculateRewards(
  template: MissionTemplate,
  level: number,
  difficulty: Difficulty
): { xp: number; coins: number; gems?: number } {
  const difficultyMultiplier = {
    low: 0.8,
    medium: 1.0,
    high: 1.3,
  };

  const levelMultiplier = 1 + (level * 0.05); // +5% por nivel
  const mult = difficultyMultiplier[difficulty] * levelMultiplier;

  return {
    xp: Math.round(template.baseXP * mult),
    coins: Math.round(template.baseCoins * mult),
    gems: template.baseGems ? Math.round(template.baseGems * mult) : undefined,
  };
}

/**
 * Calcula la carga cognitiva esperada para una misión
 */
function calculateCognitiveLoad(
  template: MissionTemplate,
  context: UserContext
): number {
  let load = template.baseCognitiveLoad;

  // Ajustar por precisión reciente
  if (context.recentPerformance.accuracy > 0.8) {
    load *= CLT_CONFIG.accuracyLoadModifier.high;
  } else if (context.recentPerformance.accuracy < 0.6) {
    load *= CLT_CONFIG.accuracyLoadModifier.low;
  }

  // Ajustar si la última sesión fue muy cargada
  if (context.lastSessionLoad) {
    const lastTotal = context.lastSessionLoad.intrinsic + context.lastSessionLoad.extraneous;
    if (lastTotal > 70) {
      load *= 0.85; // Reducir carga si la última sesión fue pesada
    }
  }

  return Math.round(Math.min(100, load));
}

/**
 * Calcula minutos estimados para completar una misión
 */
function calculateEstimatedMinutes(
  template: MissionTemplate,
  target: number
): number {
  const minutesPerUnit: Record<MissionType['type'], number> = {
    input: 1, // 1 minuto por minuto (es input de tiempo)
    exercises: 2, // 2 minutos por ejercicio
    janus: 0.5, // 30 segundos por combinación
    forgeMandate: 15, // 15 minutos total
    streak: 0, // No tiene tiempo asociado
  };

  return Math.ceil(target * (minutesPerUnit[template.type] || 1));
}

/**
 * Genera el título de la misión
 */
function generateTitle(template: MissionTemplate): string {
  const titles: Record<MissionType['type'], string> = {
    input: 'Consumir Input Comprensible',
    exercises: 'Completar Ejercicios',
    janus: 'Combinaciones Janus',
    forgeMandate: 'Forge Mandate',
    streak: 'Mantener Racha',
  };

  return titles[template.type] || 'Misión';
}

/**
 * Genera la descripción de la misión
 */
function generateDescription(
  template: MissionTemplate,
  target: number
): string {
  const descriptions: Record<MissionType['type'], (t: number) => string> = {
    input: (t) => `Escucha o lee ${t} minutos de contenido`,
    exercises: (t) => `Completa ${t} ejercicios`,
    janus: (t) => `Crea ${t} combinaciones en la matriz Janus`,
    forgeMandate: () => 'Completa la misión diaria Forge Mandate',
    streak: () => 'Completa al menos una actividad hoy',
  };

  return descriptions[template.type]?.(target) || `Completa ${target} tareas`;
}

/**
 * Determina cuántas misiones generar según el HP
 */
function getMissionCount(hp: number, maxHP: number): number {
  const hpPercent = (hp / maxHP) * 100;

  if (hpPercent >= 80) return CLT_CONFIG.missionsByHP.full;
  if (hpPercent >= 60) return CLT_CONFIG.missionsByHP.high;
  if (hpPercent >= 40) return CLT_CONFIG.missionsByHP.medium;
  return CLT_CONFIG.missionsByHP.low;
}

/**
 * Filtra y ordena templates según el contexto del usuario
 */
function filterAndSortTemplates(
  templates: MissionTemplate[],
  context: UserContext
): MissionTemplate[] {
  return templates
    .filter((t) => t.minLevel <= context.level)
    .sort((a, b) => {
      // Ordenar por prioridad y preferencias del usuario
      let scoreA = a.priority;
      let scoreB = b.priority;

      // Boost por preferencias
      if (context.preferences.focusOnGrammar && a.warmupMissionType === 'grammar') {
        scoreA += 2;
      }
      if (context.preferences.focusOnVocabulary && a.warmupMissionType === 'vocabulary') {
        scoreA += 2;
      }
      if (context.preferences.focusOnPronunciation && a.warmupMissionType === 'pronunciation') {
        scoreA += 2;
      }

      if (context.preferences.focusOnGrammar && b.warmupMissionType === 'grammar') {
        scoreB += 2;
      }
      if (context.preferences.focusOnVocabulary && b.warmupMissionType === 'vocabulary') {
        scoreB += 2;
      }
      if (context.preferences.focusOnPronunciation && b.warmupMissionType === 'pronunciation') {
        scoreB += 2;
      }

      return scoreB - scoreA; // Mayor score primero
    });
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

/**
 * Genera misiones diarias adaptadas al contexto del usuario
 */
export function generateDailyMissions(
  context: UserContext,
  maxHP: number = 100
): GeneratedMission[] {
  const missionCount = getMissionCount(context.hp, maxHP);
  const difficulty = calculateDifficulty(context.level);

  // Filtrar y ordenar templates
  const sortedTemplates = filterAndSortTemplates(MISSION_TEMPLATES, context);

  // Calcular carga total disponible
  let remainingLoad = CLT_CONFIG.maxTotalLoad;
  const missions: GeneratedMission[] = [];

  // Generar misiones hasta llenar el cupo
  for (const template of sortedTemplates) {
    if (missions.length >= missionCount) break;

    const cognitiveLoad = calculateCognitiveLoad(template, context);

    // Verificar si hay espacio para esta carga
    if (cognitiveLoad > remainingLoad && missions.length > 0) {
      continue; // Saltar si no hay espacio (pero incluir al menos una)
    }

    const target = calculateTarget(template, context.level);
    const rewards = calculateRewards(template, context.level, difficulty);
    const estimatedMinutes = calculateEstimatedMinutes(template, target);

    missions.push({
      type: template.type,
      title: generateTitle(template),
      description: generateDescription(template, target),
      target,
      current: 0,
      reward: rewards,
      completed: false,
      warmupMissionType: template.warmupMissionType,
      difficulty,
      cognitiveLoadTarget: cognitiveLoad,
      estimatedMinutes,
      requiresFocus: template.requiresFocus,
      templateType: template.type,
    });

    remainingLoad -= cognitiveLoad;
  }

  return missions;
}

/**
 * Calcula el bonus por completar todas las misiones
 */
export function calculateAllMissionsBonus(missions: Mission[]): {
  xp: number;
  coins: number;
  gems: number;
} {
  const allCompleted = missions.every((m) => m.completed);

  if (!allCompleted) {
    return { xp: 0, coins: 0, gems: 0 };
  }

  // Bonus base + bonus por número de misiones
  const missionBonus = missions.length * 10;

  return {
    xp: CLT_CONFIG.allMissionsBonus + missionBonus,
    coins: Math.round((CLT_CONFIG.allMissionsBonus + missionBonus) * 0.5),
    gems: missions.length >= 4 ? 5 : 0,
  };
}

/**
 * Sugiere el orden óptimo para completar misiones
 */
export function suggestMissionOrder(missions: Mission[]): Mission[] {
  return [...missions].sort((a, b) => {
    // 1. Misiones de baja carga primero (calentamiento)
    const loadA = a.cognitiveLoadTarget || 50;
    const loadB = b.cognitiveLoadTarget || 50;

    // 2. Pero Forge Mandate siempre al final
    if (a.type === 'forgeMandate') return 1;
    if (b.type === 'forgeMandate') return -1;

    // 3. Input antes de ejercicios (preparación)
    if (a.type === 'input' && b.type !== 'input') return -1;
    if (b.type === 'input' && a.type !== 'input') return 1;

    // 4. Por carga cognitiva ascendente
    return loadA - loadB;
  });
}

/**
 * Calcula si el usuario debería tomar un descanso
 */
export function shouldTakeBreak(
  completedMissions: number,
  totalMinutesActive: number,
  currentLoad: number
): { shouldBreak: boolean; recommendedMinutes: number; reason: string } {
  // Regla 1: Cada 3 misiones, descanso corto
  if (completedMissions > 0 && completedMissions % 3 === 0) {
    return {
      shouldBreak: true,
      recommendedMinutes: 5,
      reason: 'Has completado 3 misiones. Buen trabajo!',
    };
  }

  // Regla 2: Más de 30 minutos activo
  if (totalMinutesActive >= 30) {
    return {
      shouldBreak: true,
      recommendedMinutes: 10,
      reason: 'Llevas 30+ minutos estudiando. Toma un descanso.',
    };
  }

  // Regla 3: Carga cognitiva alta
  if (currentLoad >= 80) {
    return {
      shouldBreak: true,
      recommendedMinutes: 5,
      reason: 'Tu carga cognitiva es alta. Un descanso ayudará.',
    };
  }

  return {
    shouldBreak: false,
    recommendedMinutes: 0,
    reason: '',
  };
}

/**
 * Genera un ID único para una misión
 */
export function generateMissionId(type: string, index: number): string {
  return `mission-${type}-${Date.now()}-${index}`;
}
