/**
 * Memory Bank Integration Service
 * Integra el sistema Memory Bank AAA con el Workout/Mission Generator
 *
 * TAREA 2.8.6: Integrar Memory Bank con Workout Generator
 */

import { type LearningContext } from '@/lib/textures';
import {
  type MemoryBankCard,
  type SessionMetrics,
} from '@/components/exercises/MemoryBank/MemoryBankSession';
import { type Mission } from '@/store/useMissionStore';

// ============================================
// TIPOS
// ============================================

export interface MemoryBankMissionConfig {
  minCards: number;
  maxCards: number;
  targetAccuracy: number;
  xpPerCard: number;
  bonusThreshold: number;
  bonusMultiplier: number;
}

export interface MemoryBankWorkout {
  id: string;
  title: string;
  description: string;
  cards: MemoryBankCard[];
  context: LearningContext;
  config: MemoryBankMissionConfig;
  estimatedMinutes: number;
  cognitiveLoad: number;
}

export interface MemoryBankRewards {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  coins: number;
  gems: number;
  streakBonus: boolean;
  perfectBonus: boolean;
}

// ============================================
// CONFIGURACIÓN POR NIVEL
// ============================================

const LEVEL_CONFIG: Record<number, MemoryBankMissionConfig> = {
  1: { minCards: 5, maxCards: 10, targetAccuracy: 60, xpPerCard: 5, bonusThreshold: 80, bonusMultiplier: 1.5 },
  2: { minCards: 8, maxCards: 12, targetAccuracy: 65, xpPerCard: 6, bonusThreshold: 80, bonusMultiplier: 1.5 },
  3: { minCards: 10, maxCards: 15, targetAccuracy: 70, xpPerCard: 7, bonusThreshold: 85, bonusMultiplier: 1.6 },
  4: { minCards: 12, maxCards: 18, targetAccuracy: 70, xpPerCard: 8, bonusThreshold: 85, bonusMultiplier: 1.6 },
  5: { minCards: 15, maxCards: 20, targetAccuracy: 75, xpPerCard: 9, bonusThreshold: 90, bonusMultiplier: 1.7 },
  6: { minCards: 18, maxCards: 25, targetAccuracy: 75, xpPerCard: 10, bonusThreshold: 90, bonusMultiplier: 1.7 },
  7: { minCards: 20, maxCards: 28, targetAccuracy: 80, xpPerCard: 11, bonusThreshold: 92, bonusMultiplier: 1.8 },
  8: { minCards: 22, maxCards: 30, targetAccuracy: 80, xpPerCard: 12, bonusThreshold: 92, bonusMultiplier: 1.8 },
  9: { minCards: 25, maxCards: 32, targetAccuracy: 82, xpPerCard: 13, bonusThreshold: 95, bonusMultiplier: 1.9 },
  10: { minCards: 28, maxCards: 35, targetAccuracy: 85, xpPerCard: 15, bonusThreshold: 95, bonusMultiplier: 2.0 },
};

// ============================================
// CONTEXTO DE APRENDIZAJE POR TIPO DE MISIÓN
// ============================================

const MISSION_TO_CONTEXT: Record<string, LearningContext> = {
  input: 'vocabulary',
  exercises: 'grammar',
  janus: 'grammar',
  forgeMandate: 'advanced',
  memoryBank: 'vocabulary',
};

// ============================================
// CARGA COGNITIVA POR CONTEXTO
// ============================================

const CONTEXT_COGNITIVE_LOAD: Record<LearningContext, number> = {
  vocabulary: 35,
  conversation: 45,
  grammar: 55,
  culture: 40,
  advanced: 70,
};

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Obtiene la configuración de Memory Bank para el nivel del usuario
 */
export function getConfigForLevel(level: number): MemoryBankMissionConfig {
  const clampedLevel = Math.max(1, Math.min(10, level));
  return LEVEL_CONFIG[clampedLevel] || LEVEL_CONFIG[1];
}

/**
 * Genera un workout de Memory Bank basado en las misiones activas
 */
export function generateMemoryBankWorkout(
  cards: MemoryBankCard[],
  userLevel: number,
  missionType?: Mission['type']
): MemoryBankWorkout {
  const config = getConfigForLevel(userLevel);
  const context: LearningContext = missionType
    ? MISSION_TO_CONTEXT[missionType] || 'vocabulary'
    : 'vocabulary';

  // Seleccionar cards según configuración
  const cardCount = Math.min(
    cards.length,
    Math.floor(Math.random() * (config.maxCards - config.minCards + 1)) + config.minCards
  );

  // Priorizar cards que necesitan repaso
  const sortedCards = [...cards].sort((a, b) => {
    // Cards nunca revisadas primero
    if (!a.lastReviewedAt && b.lastReviewedAt) return -1;
    if (a.lastReviewedAt && !b.lastReviewedAt) return 1;
    // Luego por fecha de última revisión (más antiguas primero)
    if (a.lastReviewedAt && b.lastReviewedAt) {
      return new Date(a.lastReviewedAt).getTime() - new Date(b.lastReviewedAt).getTime();
    }
    return 0;
  });

  const selectedCards = sortedCards.slice(0, cardCount);

  // Calcular tiempo estimado (30 segundos por tarjeta promedio)
  const estimatedMinutes = Math.ceil((cardCount * 30) / 60);

  // Calcular carga cognitiva
  const cognitiveLoad = CONTEXT_COGNITIVE_LOAD[context];

  return {
    id: `mb-workout-${Date.now()}`,
    title: `Memory Bank: ${getContextTitle(context)}`,
    description: `Repasa ${cardCount} tarjetas de ${getContextTitle(context).toLowerCase()}`,
    cards: selectedCards,
    context,
    config,
    estimatedMinutes,
    cognitiveLoad,
  };
}

/**
 * Calcula las recompensas basadas en los resultados de la sesión
 */
export function calculateRewards(
  metrics: SessionMetrics,
  config: MemoryBankMissionConfig,
  streakDays: number
): MemoryBankRewards {
  const { accuracy, cardsReviewed, correctAnswers } = metrics;

  // XP base por tarjeta correcta
  const baseXP = correctAnswers * config.xpPerCard;

  // Bonus por precisión alta
  let bonusXP = 0;
  if (accuracy >= config.bonusThreshold) {
    bonusXP = Math.round(baseXP * (config.bonusMultiplier - 1));
  }

  // Bonus por racha
  const streakBonus = streakDays >= 7;
  if (streakBonus) {
    bonusXP += Math.round(baseXP * 0.1); // +10% por racha de 7+ días
  }

  // Bonus por perfección
  const perfectBonus = accuracy === 100 && cardsReviewed >= 10;
  if (perfectBonus) {
    bonusXP += 25; // Bonus fijo por sesión perfecta
  }

  const totalXP = baseXP + bonusXP;

  // Coins basados en XP
  const coins = Math.round(totalXP * 0.4);

  // Gems solo por rendimiento excepcional
  let gems = 0;
  if (perfectBonus) {
    gems = 5;
  } else if (accuracy >= 95 && cardsReviewed >= 15) {
    gems = 2;
  }

  return {
    baseXP,
    bonusXP,
    totalXP,
    coins,
    gems,
    streakBonus,
    perfectBonus,
  };
}

/**
 * Genera una misión de Memory Bank para el sistema de misiones diarias
 */
export function generateMemoryBankMission(
  userLevel: number,
  index: number = 0
): Mission {
  const config = getConfigForLevel(userLevel);
  const targetCards = Math.floor((config.minCards + config.maxCards) / 2);
  const estimatedMinutes = Math.ceil((targetCards * 30) / 60);

  return {
    id: `mission-memoryBank-${Date.now()}-${index}`,
    type: 'exercises', // Usar tipo 'exercises' ya que memoryBank no está en el enum
    title: 'Memory Bank',
    description: `Repasa ${targetCards} tarjetas en Memory Bank`,
    target: targetCards,
    current: 0,
    reward: {
      xp: targetCards * config.xpPerCard,
      coins: Math.round(targetCards * config.xpPerCard * 0.4),
      gems: targetCards >= 15 ? 2 : undefined,
    },
    completed: false,
    warmupMissionType: 'vocabulary',
    difficulty: userLevel <= 3 ? 'low' : userLevel <= 6 ? 'medium' : 'high',
    cognitiveLoadTarget: CONTEXT_COGNITIVE_LOAD.vocabulary,
    estimatedMinutes,
    requiresFocus: true,
  };
}

/**
 * Verifica si se debe sugerir una sesión de Memory Bank
 */
export function shouldSuggestMemoryBank(
  pendingCards: number,
  lastSessionDate: string | null,
  userHP: number,
  maxHP: number
): { suggest: boolean; reason: string; urgency: 'low' | 'medium' | 'high' } {
  const now = new Date();
  const hoursSinceLastSession = lastSessionDate
    ? (now.getTime() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60)
    : 999;

  // HP bajo - no sugerir sesiones intensas
  if (userHP / maxHP < 0.3) {
    return {
      suggest: false,
      reason: 'HP bajo, descansa primero',
      urgency: 'low',
    };
  }

  // Muchas tarjetas pendientes
  if (pendingCards > 30) {
    return {
      suggest: true,
      reason: `${pendingCards} tarjetas esperando repaso`,
      urgency: 'high',
    };
  }

  // Han pasado más de 24 horas
  if (hoursSinceLastSession > 24 && pendingCards > 10) {
    return {
      suggest: true,
      reason: 'Ha pasado más de un día desde tu última sesión',
      urgency: 'medium',
    };
  }

  // Hay tarjetas pendientes
  if (pendingCards > 5) {
    return {
      suggest: true,
      reason: `${pendingCards} tarjetas disponibles para repaso`,
      urgency: 'low',
    };
  }

  return {
    suggest: false,
    reason: 'Todo al día',
    urgency: 'low',
  };
}

/**
 * Convierte métricas de sesión a progreso de misión
 */
export function sessionMetricsToMissionProgress(
  metrics: SessionMetrics,
  currentMissionProgress: number
): number {
  // El progreso es el número de tarjetas revisadas
  return currentMissionProgress + metrics.cardsReviewed;
}

/**
 * Obtiene estadísticas agregadas de Memory Bank
 */
export function getMemoryBankStats(sessions: SessionMetrics[]): {
  totalCards: number;
  totalCorrect: number;
  averageAccuracy: number;
  totalTime: number;
  sessionsCount: number;
} {
  if (sessions.length === 0) {
    return {
      totalCards: 0,
      totalCorrect: 0,
      averageAccuracy: 0,
      totalTime: 0,
      sessionsCount: 0,
    };
  }

  const totalCards = sessions.reduce((sum, s) => sum + s.cardsReviewed, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
  const totalTime = sessions.reduce((sum, s) => sum + s.sessionDuration, 0);
  const averageAccuracy = totalCards > 0 ? (totalCorrect / totalCards) * 100 : 0;

  return {
    totalCards,
    totalCorrect,
    averageAccuracy,
    totalTime,
    sessionsCount: sessions.length,
  };
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function getContextTitle(context: LearningContext): string {
  const titles: Record<LearningContext, string> = {
    vocabulary: 'Vocabulario',
    conversation: 'Conversación',
    grammar: 'Gramática',
    culture: 'Cultura',
    advanced: 'Avanzado',
  };
  return titles[context];
}

// ============================================
// EXPORTACIONES
// ============================================

const memoryBankIntegrationAPI = {
  getConfigForLevel,
  generateMemoryBankWorkout,
  calculateRewards,
  generateMemoryBankMission,
  shouldSuggestMemoryBank,
  sessionMetricsToMissionProgress,
  getMemoryBankStats,
};

export default memoryBankIntegrationAPI;
