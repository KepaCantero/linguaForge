/**
 * Post-Cognitive Rewards Service
 *
 * Sistema de recompensas post-cognitivas basado en:
 * - Rendimiento en la sesión (precisión, velocidad)
 * - Carga cognitiva manejada
 * - Progreso germano (aprendizaje profundo)
 * - Streaks y consistencia
 */

import type { CognitiveLoadMetrics, SessionMetrics } from '@/store/useCognitiveLoadStore';

// ============================================================
// TIPOS
// ============================================================

export interface PerformanceMetrics {
  accuracy: number;           // 0-1
  averageResponseTime: number; // ms
  exercisesCompleted: number;
  consecutiveCorrect: number;
  cognitiveLoad: CognitiveLoadMetrics;
  sessionDuration: number;    // segundos
  focusModeUsed: boolean;
}

export interface RewardCalculation {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  baseCoins: number;
  bonusCoins: number;
  totalCoins: number;
  gems: number;
  multipliers: RewardMultiplier[];
  achievements: AchievementUnlock[];
  streakBonus: number;
  cognitiveBonus: number;
}

export interface RewardMultiplier {
  name: string;
  value: number;
  description: string;
  icon: string;
}

export interface AchievementUnlock {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpBonus: number;
}

export interface SessionFeedback {
  rating: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  message: string;
  tips: string[];
  nextSteps: string[];
  cognitiveInsight: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const BASE_REWARDS = {
  xpPerExercise: 10,
  coinsPerExercise: 5,
  xpPerMinute: 2, // XP por minuto de estudio efectivo
};

const MULTIPLIER_THRESHOLDS = {
  accuracy: {
    excellent: 0.95,  // 95%+ = 1.5x
    good: 0.85,       // 85%+ = 1.25x
    fair: 0.70,       // 70%+ = 1.0x
  },
  speed: {
    fast: 2000,       // < 2s = 1.3x
    normal: 4000,     // < 4s = 1.1x
  },
  consecutiveCorrect: {
    streak5: 5,       // 5+ = 1.2x
    streak10: 10,     // 10+ = 1.4x
    streak20: 20,     // 20+ = 1.6x
  },
  focusMode: 1.15,    // Focus mode = 1.15x
};

const COGNITIVE_BONUSES = {
  lowLoad: 0,         // < 40 total load
  optimalLoad: 10,    // 40-70 total load
  highLoad: 5,        // > 70 load (menor bonus por sobreesfuerzo)
  highGermane: 15,    // Germane > 60 (aprendizaje profundo)
};

const ACHIEVEMENTS: Record<string, Omit<AchievementUnlock, 'id'>> = {
  first_session: {
    name: 'Primer Paso',
    description: 'Completa tu primera sesión de estudio',
    icon: '🌟',
    rarity: 'common',
    xpBonus: 25,
  },
  perfect_session: {
    name: 'Sesión Perfecta',
    description: 'Completa una sesión con 100% de precisión',
    icon: '💯',
    rarity: 'rare',
    xpBonus: 50,
  },
  focus_master: {
    name: 'Maestro del Focus',
    description: 'Completa 30+ minutos en modo Focus',
    icon: '🎯',
    rarity: 'rare',
    xpBonus: 40,
  },
  speed_demon: {
    name: 'Velocista',
    description: 'Promedio de respuesta < 2 segundos en 20+ ejercicios',
    icon: '⚡',
    rarity: 'epic',
    xpBonus: 75,
  },
  cognitive_balance: {
    name: 'Balance Cognitivo',
    description: 'Mantén carga óptima durante toda la sesión',
    icon: '🧠',
    rarity: 'epic',
    xpBonus: 60,
  },
  deep_learner: {
    name: 'Aprendiz Profundo',
    description: 'Alcanza 80+ de carga germana',
    icon: '🔮',
    rarity: 'legendary',
    xpBonus: 100,
  },
  streak_fire: {
    name: 'En Llamas',
    description: '20 respuestas correctas consecutivas',
    icon: '🔥',
    rarity: 'rare',
    xpBonus: 45,
  },
  marathon: {
    name: 'Maratón Mental',
    description: 'Estudia 60+ minutos en una sesión',
    icon: '🏃',
    rarity: 'epic',
    xpBonus: 80,
  },
};

// ============================================================
// FUNCIONES DE CÁLCULO
// ============================================================

/**
 * Calcula multiplicadores de recompensa
 */
function calculateMultipliers(metrics: PerformanceMetrics): RewardMultiplier[] {
  const multipliers: RewardMultiplier[] = [];

  // Multiplicador por precisión
  if (metrics.accuracy >= MULTIPLIER_THRESHOLDS.accuracy.excellent) {
    multipliers.push({
      name: 'Precisión Excelente',
      value: 1.5,
      description: `${Math.round(metrics.accuracy * 100)}% de precisión`,
      icon: '🎯',
    });
  } else if (metrics.accuracy >= MULTIPLIER_THRESHOLDS.accuracy.good) {
    multipliers.push({
      name: 'Buena Precisión',
      value: 1.25,
      description: `${Math.round(metrics.accuracy * 100)}% de precisión`,
      icon: '✓',
    });
  }

  // Multiplicador por velocidad
  if (metrics.averageResponseTime < MULTIPLIER_THRESHOLDS.speed.fast) {
    multipliers.push({
      name: 'Respuestas Rápidas',
      value: 1.3,
      description: `Promedio ${(metrics.averageResponseTime / 1000).toFixed(1)}s`,
      icon: '⚡',
    });
  } else if (metrics.averageResponseTime < MULTIPLIER_THRESHOLDS.speed.normal) {
    multipliers.push({
      name: 'Buen Ritmo',
      value: 1.1,
      description: `Promedio ${(metrics.averageResponseTime / 1000).toFixed(1)}s`,
      icon: '⏱️',
    });
  }

  // Multiplicador por racha
  if (metrics.consecutiveCorrect >= MULTIPLIER_THRESHOLDS.consecutiveCorrect.streak20) {
    multipliers.push({
      name: 'Racha Épica',
      value: 1.6,
      description: `${metrics.consecutiveCorrect} correctas seguidas`,
      icon: '🔥',
    });
  } else if (metrics.consecutiveCorrect >= MULTIPLIER_THRESHOLDS.consecutiveCorrect.streak10) {
    multipliers.push({
      name: 'Gran Racha',
      value: 1.4,
      description: `${metrics.consecutiveCorrect} correctas seguidas`,
      icon: '🔥',
    });
  } else if (metrics.consecutiveCorrect >= MULTIPLIER_THRESHOLDS.consecutiveCorrect.streak5) {
    multipliers.push({
      name: 'Racha Activa',
      value: 1.2,
      description: `${metrics.consecutiveCorrect} correctas seguidas`,
      icon: '🔥',
    });
  }

  // Multiplicador por modo Focus
  if (metrics.focusModeUsed) {
    multipliers.push({
      name: 'Modo Focus',
      value: MULTIPLIER_THRESHOLDS.focusMode,
      description: 'Estudiaste con menos distracciones',
      icon: '🧘',
    });
  }

  return multipliers;
}

/**
 * Calcula bonus por carga cognitiva
 */
function calculateCognitiveBonus(load: CognitiveLoadMetrics): number {
  let bonus = 0;

  // Bonus por carga total óptima
  if (load.total >= 40 && load.total <= 70) {
    bonus += COGNITIVE_BONUSES.optimalLoad;
  } else if (load.total > 70) {
    bonus += COGNITIVE_BONUSES.highLoad;
  }

  // Bonus por carga germana alta (aprendizaje profundo)
  if (load.germane >= 60) {
    bonus += COGNITIVE_BONUSES.highGermane;
  }

  return bonus;
}

/**
 * Detecta logros desbloqueados
 */
function detectAchievements(
  metrics: PerformanceMetrics,
  isFirstSession: boolean = false
): AchievementUnlock[] {
  const unlocked: AchievementUnlock[] = [];

  // Primer sesión
  if (isFirstSession) {
    unlocked.push({ id: 'first_session', ...ACHIEVEMENTS.first_session });
  }

  // Sesión perfecta
  if (metrics.accuracy === 1.0 && metrics.exercisesCompleted >= 10) {
    unlocked.push({ id: 'perfect_session', ...ACHIEVEMENTS.perfect_session });
  }

  // Maestro del Focus
  if (metrics.focusModeUsed && metrics.sessionDuration >= 1800) {
    unlocked.push({ id: 'focus_master', ...ACHIEVEMENTS.focus_master });
  }

  // Velocista
  if (
    metrics.averageResponseTime < 2000 &&
    metrics.exercisesCompleted >= 20
  ) {
    unlocked.push({ id: 'speed_demon', ...ACHIEVEMENTS.speed_demon });
  }

  // Balance Cognitivo
  if (
    metrics.cognitiveLoad.total >= 40 &&
    metrics.cognitiveLoad.total <= 70 &&
    metrics.sessionDuration >= 900
  ) {
    unlocked.push({ id: 'cognitive_balance', ...ACHIEVEMENTS.cognitive_balance });
  }

  // Aprendiz Profundo
  if (metrics.cognitiveLoad.germane >= 80) {
    unlocked.push({ id: 'deep_learner', ...ACHIEVEMENTS.deep_learner });
  }

  // En Llamas
  if (metrics.consecutiveCorrect >= 20) {
    unlocked.push({ id: 'streak_fire', ...ACHIEVEMENTS.streak_fire });
  }

  // Maratón
  if (metrics.sessionDuration >= 3600) {
    unlocked.push({ id: 'marathon', ...ACHIEVEMENTS.marathon });
  }

  return unlocked;
}

/**
 * Determina el rating y mensaje basado en métricas
 */
function determineRatingAndMessage(
  metrics: PerformanceMetrics
): { rating: SessionFeedback['rating']; message: string } {
  if (metrics.accuracy >= 0.9 && metrics.exercisesCompleted >= 10) {
    return {
      rating: 'excellent',
      message: '¡Sesión excepcional! Estás dominando el material.',
    };
  }
  if (metrics.accuracy >= 0.75 || metrics.exercisesCompleted >= 15) {
    return {
      rating: 'good',
      message: 'Buen trabajo. Estás progresando consistentemente.',
    };
  }
  if (metrics.accuracy >= 0.6 || metrics.exercisesCompleted >= 5) {
    return {
      rating: 'fair',
      message: 'Sesión completada. Hay espacio para mejorar.',
    };
  }
  return {
    rating: 'needs_improvement',
    message: 'Cada sesión cuenta. Intenta mantener el ritmo.',
  };
}

/**
 * Genera tips basados en rendimiento
 */
function generatePerformanceTips(metrics: PerformanceMetrics): string[] {
  const tips: string[] = [];

  if (metrics.accuracy < 0.7) {
    tips.push('Intenta ir más despacio y leer bien cada pregunta');
  }
  if (metrics.averageResponseTime > 5000) {
    tips.push('Practica más para mejorar tu velocidad de respuesta');
  }
  if (!metrics.focusModeUsed) {
    tips.push('Prueba el modo Focus para reducir distracciones');
  }
  if (metrics.cognitiveLoad.extraneous > 40) {
    tips.push('Tu entorno tiene muchas distracciones. Busca un lugar tranquilo');
  }

  return tips;
}

/**
 * Genera próximos pasos basados en rendimiento
 */
function generateNextSteps(metrics: PerformanceMetrics): string[] {
  const nextSteps: string[] = [];

  if (metrics.exercisesCompleted < 10) {
    nextSteps.push('Completa al menos 10 ejercicios por sesión');
  }
  if (metrics.sessionDuration < 600) {
    nextSteps.push('Intenta estudiar al menos 10 minutos por sesión');
  }
  nextSteps.push('Revisa las palabras que fallaste en el SRS');

  return nextSteps;
}

/**
 * Genera insight cognitivo basado en carga cognitiva
 */
function generateCognitiveInsight(load: CognitiveLoadMetrics): string {
  if (load.germane >= 60) {
    return 'Tu cerebro está procesando el contenido profundamente. ¡Excelente retención esperada!';
  }
  if (load.intrinsic > 70) {
    return 'El contenido fue desafiante. Considera repasar antes de continuar.';
  }
  if (load.extraneous > 50) {
    return 'Hubo muchas distracciones. El modo Focus puede ayudarte.';
  }
  return 'Buen balance cognitivo durante la sesión.';
}

/**
 * Genera feedback de sesión
 * @param metrics - Métricas de rendimiento de la sesión
 */
function generateSessionFeedback(
  metrics: PerformanceMetrics
): SessionFeedback {
  const { rating, message } = determineRatingAndMessage(metrics);
  const tips = generatePerformanceTips(metrics);
  const nextSteps = generateNextSteps(metrics);
  const cognitiveInsight = generateCognitiveInsight(metrics.cognitiveLoad);

  return {
    rating,
    message,
    tips,
    nextSteps,
    cognitiveInsight,
  };
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

/**
 * Calcula las recompensas post-cognitivas completas
 */
export function calculatePostCognitiveRewards(
  metrics: PerformanceMetrics,
  currentStreak: number = 0,
  isFirstSession: boolean = false
): RewardCalculation {
  // Calcular recompensas base
  const baseXP =
    metrics.exercisesCompleted * BASE_REWARDS.xpPerExercise +
    Math.floor(metrics.sessionDuration / 60) * BASE_REWARDS.xpPerMinute;

  const baseCoins = metrics.exercisesCompleted * BASE_REWARDS.coinsPerExercise;

  // Calcular multiplicadores
  const multipliers = calculateMultipliers(metrics);
  const totalMultiplier = multipliers.reduce((acc, m) => acc * m.value, 1);

  // Calcular bonus cognitivo
  const cognitiveBonus = calculateCognitiveBonus(metrics.cognitiveLoad);

  // Calcular bonus de streak
  let streakBonus = 0;
  if (currentStreak >= 7) streakBonus += 20;
  if (currentStreak >= 30) streakBonus += 30;
  if (currentStreak >= 100) streakBonus += 50;

  // Detectar logros
  const achievements = detectAchievements(metrics, isFirstSession);
  const achievementBonus = achievements.reduce((acc, a) => acc + a.xpBonus, 0);

  // Calcular totales
  const bonusXP = Math.round(
    (baseXP * (totalMultiplier - 1)) + cognitiveBonus + streakBonus + achievementBonus
  );
  const totalXP = baseXP + bonusXP;

  const bonusCoins = Math.round(baseCoins * (totalMultiplier - 1));
  const totalCoins = baseCoins + bonusCoins;

  // Gems solo por logros especiales
  const gems = achievements.filter((a) => a.rarity === 'epic' || a.rarity === 'legendary').length * 5;

  return {
    baseXP,
    bonusXP,
    totalXP,
    baseCoins,
    bonusCoins,
    totalCoins,
    gems,
    multipliers,
    achievements,
    streakBonus,
    cognitiveBonus,
  };
}

/**
 * Obtiene feedback completo de sesión
 */
export function getSessionFeedback(
  metrics: PerformanceMetrics,
  isFirstSession: boolean = false
): { rewards: RewardCalculation; feedback: SessionFeedback } {
  const rewards = calculatePostCognitiveRewards(metrics, 0, isFirstSession);
  const feedback = generateSessionFeedback(metrics);

  return { rewards, feedback };
}

/**
 * Convierte SessionMetrics del store a PerformanceMetrics
 */
export function sessionToPerformanceMetrics(
  session: SessionMetrics,
  cognitiveLoad: CognitiveLoadMetrics,
  focusModeUsed: boolean = false
): PerformanceMetrics {
  const duration = (Date.now() - session.startTime) / 1000;
  const accuracy = session.totalAttempts > 0
    ? session.correctAnswers / session.totalAttempts
    : 0;

  // Estimar consecutiveCorrect basado en accuracy y ejercicios
  const estimatedConsecutive = Math.floor(session.correctAnswers * accuracy);

  return {
    accuracy,
    averageResponseTime: session.averageResponseTime,
    exercisesCompleted: session.exercisesCompleted,
    consecutiveCorrect: estimatedConsecutive,
    cognitiveLoad,
    sessionDuration: duration,
    focusModeUsed,
  };
}
