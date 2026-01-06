/**
 * Post-Cognitive Feedback Service
 *
 * Sistema de feedback post-cognitivo basado en:
 * - Teoría de Carga Cognitiva (CLT)
 * - Principios de neurociencia del aprendizaje
 * - Gamificación basada en comportamiento
 */

import type { CognitiveLoadMetrics, SessionMetrics } from '@/store/useCognitiveLoadStore';

// ============================================================
// TIPOS
// ============================================================

export interface ExerciseAttempt {
  exerciseId: string;
  exerciseType: string;
  userResponse: string;
  correctResponse: string;
  isCorrect: boolean;
  responseTime: number; // ms
  timestamp: number;
  attempts: number; // número de intentos para este ejercicio
}

export interface PostCognitiveFeedback {
  immediate: ImmediateFeedback;
  reflective: ReflectiveFeedback;
  neuroplasticity: NeuroplasticityUpdate;
  recommendations: LearningRecommendation[];
}

export interface ImmediateFeedback {
  message: string;
  emoji: string;
  color: 'green' | 'amber' | 'red' | 'blue';
  showInsight: boolean;
  cognitiveNote: string;
}

export interface ReflectiveFeedback {
  accuracyTrend: 'improving' | 'stable' | 'declining';
  speedTrend: 'improving' | 'stable' | 'declining';
  cognitivePattern: CognitivePattern;
  strengths: string[];
  areasToImprove: string[];
}

export interface CognitivePattern {
  highIntrinsic: boolean;      // Contenido complejo
  highExtraneous: boolean;     // Muchas distracciones
  highGermane: boolean;        // Alto procesamiento profundo
  optimalLoad: boolean;        // Carga en zona óptima
  overloadRisk: boolean;       // Riesgo de sobrecarga
}

export interface NeuroplasticityUpdate {
  germaneLoadIncrease: number;  // Incremento de carga germana
  connectionsFormed: number;    // Conexiones estimadas
  zoneActivated: string[];      // Zonas cerebrales activadas
  retentionProbability: number; // Probabilidad de retención (0-1)
}

export interface LearningRecommendation {
  type: 'break' | 'continue' | 'review' | 'practice' | 'focus';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: string;
}

export interface FeedbackContext {
  sessionMetrics: SessionMetrics;
  cognitiveLoad: CognitiveLoadMetrics;
  recentAttempts: ExerciseAttempt[];
  currentStreak: number;
  focusModeActive: boolean;
}

// ============================================================
// CONSTANTES
// ============================================================

const FEEDBACK_PATTERNS = {
  // Feedback correcto rápido
  correctFast: {
    message: '¡Perfecto! Respuesta rápida y correcta.',
    emoji: '⚡',
    color: 'green' as const,
    cognitiveNote: 'Alta activación de memoria a largo plazo.',
  },
  // Feedback correcto lento
  correctSlow: {
    message: '¡Correcto! Pero puedes responder más rápido.',
    emoji: '✓',
    color: 'amber' as const,
    cognitiveNote: 'Recuperación correcta pero requiere reforzamiento.',
  },
  // Feedback incorrecto
  incorrect: {
    message: 'No es correcto. Repasemos este concepto.',
    emoji: '📚',
    color: 'red' as const,
    cognitiveNote: 'Oportunidad de consolidación de memoria.',
  },
  // Feedback tras múltiples intentos
  multipleAttempts: {
    message: 'Lo lograste después de varios intentos.',
    emoji: '💪',
    color: 'blue' as const,
    cognitiveNote: 'El esfuerzo adicional fortalece la memoria.',
  },
};

// ============================================================
// FUNCIONES DE ANÁLISIS
// ============================================================

/**
 * Analiza el patrón cognitivo de la sesión
 */
function analyzeCognitivePattern(
  load: CognitiveLoadMetrics,
  sessionDuration: number
): CognitivePattern {
  const total = load.total;

  return {
    highIntrinsic: load.intrinsic > 60,
    highExtraneous: load.extraneous > 50,
    highGermane: load.germane >= 60,
    optimalLoad: total >= 40 && total <= 70,
    overloadRisk: total > 85 || (total > 70 && sessionDuration > 1800),
  };
}

/**
 * Analiza tendencias de rendimiento
 */
function analyzeTrends(
  attempts: ExerciseAttempt[]
): { accuracyTrend: ReflectiveFeedback['accuracyTrend']; speedTrend: ReflectiveFeedback['speedTrend'] } {
  if (attempts.length < 3) {
    return { accuracyTrend: 'stable', speedTrend: 'stable' };
  }

  const recent = attempts.slice(-5);
  const older = attempts.slice(-10, -5);

  // Tendencia de precisión
  const recentAccuracy = recent.filter((a) => a.isCorrect).length / recent.length;
  const olderAccuracy = older.filter((a) => a.isCorrect).length / older.length;

  let accuracyTrend: ReflectiveFeedback['accuracyTrend'] = 'stable';
  if (recentAccuracy > olderAccuracy + 0.1) accuracyTrend = 'improving';
  else if (recentAccuracy < olderAccuracy - 0.1) accuracyTrend = 'declining';

  // Tendencia de velocidad
  const recentAvgTime = recent.reduce((sum, a) => sum + a.responseTime, 0) / recent.length;
  const olderAvgTime = older.reduce((sum, a) => sum + a.responseTime, 0) / older.length;

  let speedTrend: ReflectiveFeedback['speedTrend'] = 'stable';
  if (recentAvgTime < olderAvgTime * 0.8) speedTrend = 'improving';
  else if (recentAvgTime > olderAvgTime * 1.2) speedTrend = 'declining';

  return { accuracyTrend, speedTrend };
}

/**
 * Identifica fortalezas y áreas de mejora
 */
function identifyStrengthsAndWeaknesses(
  attempts: ExerciseAttempt[],
  pattern: CognitivePattern
): { strengths: string[]; areasToImprove: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Análisis por tipo de ejercicio
  const byType = new Map<string, ExerciseAttempt[]>();
  attempts.forEach((a) => {
    const list = byType.get(a.exerciseType) || [];
    list.push(a);
    byType.set(a.exerciseType, list);
  });

  for (const [type, typeAttempts] of Array.from(byType.entries())) {
    const accuracy = typeAttempts.filter((a) => a.isCorrect).length / typeAttempts.length;
    const avgTime = typeAttempts.reduce((sum, a) => sum + a.responseTime, 0) / typeAttempts.length;

    if (accuracy >= 0.8 && avgTime < 3000) {
      strengths.push(`Dominas ${type} con buena precisión y velocidad`);
    } else if (accuracy >= 0.7) {
      strengths.push(`Buena precisión en ${type}`);
    } else if (accuracy < 0.5) {
      weaknesses.push(`${type} necesita práctica adicional`);
    } else if (avgTime > 5000) {
      weaknesses.push(`${type} requiere más velocidad`);
    }
  }

  // Fortalezas cognitivas
  if (pattern.highGermane) {
    strengths.push('Alto nivel de procesamiento profundo');
  }
  if (pattern.optimalLoad) {
    strengths.push('Buen manejo de la carga cognitiva');
  }

  // Debilidades cognitivas
  if (pattern.highExtraneous) {
    weaknesses.push('Demasiadas distracciones durante el estudio');
  }
  if (pattern.overloadRisk) {
    weaknesses.push('Sobrecarga cognitiva detectada');
  }

  return { strengths, areasToImprove: weaknesses };
}

/**
 * Genera recomendaciones de aprendizaje
 */
function generateRecommendations(
  context: FeedbackContext,
  pattern: CognitivePattern,
  trends: { accuracyTrend: ReflectiveFeedback['accuracyTrend']; speedTrend: ReflectiveFeedback['speedTrend'] }
): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = [];
  const { sessionMetrics, cognitiveLoad, focusModeActive } = context;

  // Recomendación de descanso
  if (pattern.overloadRisk || cognitiveLoad.total > 80) {
    recommendations.push({
      type: 'break',
      priority: 'high',
      title: 'Tomar un descanso',
      description: 'Tu carga cognitiva está alta. Un descanso ayudará a consolidar.',
      actionable: 'Toma 5-10 minutos de descanso antes de continuar.',
    });
  }

  // Recomendación de modo Focus
  if (pattern.highExtraneous && !focusModeActive) {
    recommendations.push({
      type: 'focus',
      priority: 'high',
      title: 'Activar Modo Focus',
      description: 'Hay demasiadas distracciones. El modo Focus te ayudará.',
      actionable: 'Activa el modo Focus para reducir la carga extraña.',
    });
  }

  // Recomendación según tendencias
  if (trends.accuracyTrend === 'declining') {
    recommendations.push({
      type: 'review',
      priority: 'medium',
      title: 'Repasar conceptos',
      description: 'Tu precisión está bajando. Un repaso ayudará.',
      actionable: 'Dedica 5 minutos a repasar los ejercicios recientes.',
    });
  }

  if (trends.speedTrend === 'declining') {
    recommendations.push({
      type: 'practice',
      priority: 'medium',
      title: 'Practicar fluidez',
      description: 'Tus respuestas están más lentas. La práctica ayuda.',
      actionable: 'Haz ejercicios rápidos de repetición para ganar fluidez.',
    });
  }

  // Recomendación de continuar
  if (pattern.optimalLoad && pattern.highGermane && !pattern.overloadRisk) {
    recommendations.push({
      type: 'continue',
      priority: 'low',
      title: '¡Excelente ritmo!',
      description: 'Estás en zona óptima de aprendizaje.',
      actionable: 'Continúa así, estás progresando muy bien.',
    });
  }

  // Recomendación de carga intrínseca alta
  if (pattern.highIntrinsic && sessionMetrics.correctAnswers / sessionMetrics.totalAttempts < 0.6) {
    recommendations.push({
      type: 'practice',
      priority: 'medium',
      title: 'Contenido desafiante',
      description: 'El contenido es complejo. Considera practicar más.',
      actionable: 'Practica con ejercicios más simples antes de volver a intentar.',
    });
  }

  return recommendations;
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

/**
 * Genera feedback inmediato después de un ejercicio
 */
export function generateImmediateFeedback(
  attempt: ExerciseAttempt,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cognitiveLoad: CognitiveLoadMetrics
): ImmediateFeedback {
  const { isCorrect, responseTime, attempts } = attempt;

  let pattern;
  if (isCorrect && responseTime < 2500 && attempts === 1) {
    pattern = FEEDBACK_PATTERNS.correctFast;
  } else if (isCorrect && responseTime >= 2500) {
    pattern = FEEDBACK_PATTERNS.correctSlow;
  } else if (!isCorrect) {
    pattern = FEEDBACK_PATTERNS.incorrect;
  } else {
    pattern = FEEDBACK_PATTERNS.multipleAttempts;
  }

  return {
    ...pattern,
    showInsight: Math.random() < 0.3, // 30% de probabilidad de mostrar insight adicional
  };
}

/**
 * Genera feedback completo post-cognitivo
 */
export function generatePostCognitiveFeedback(
  context: FeedbackContext
): PostCognitiveFeedback {
  const { sessionMetrics, cognitiveLoad, recentAttempts } = context;

  // Análisis cognitivo
  const pattern = analyzeCognitivePattern(cognitiveLoad, Date.now() - sessionMetrics.startTime);

  // Análisis de tendencias
  const trends = analyzeTrends(recentAttempts);

  // Fortalezas y debilidades
  const { strengths, areasToImprove } = identifyStrengthsAndWeaknesses(recentAttempts, pattern);

  // Recomendaciones
  const recommendations = generateRecommendations(context, pattern, trends);

  // Actualización de neuroplasticidad
  const germaneIncrease = recentAttempts.filter((a) => a.isCorrect).length * 2;
  const avgAccuracy = sessionMetrics.totalAttempts > 0
    ? sessionMetrics.correctAnswers / sessionMetrics.totalAttempts
    : 0;

  const neuroplasticity: NeuroplasticityUpdate = {
    germaneLoadIncrease: Math.min(20, germaneIncrease),
    connectionsFormed: Math.floor(sessionMetrics.exercisesCompleted * avgAccuracy * 5),
    zoneActivated: pattern.highGermane
      ? ['temporal', 'broca', 'motor', 'prefrontal']
      : ['temporal', 'motor'],
    retentionProbability: avgAccuracy >= 0.8 ? 0.85 : avgAccuracy >= 0.6 ? 0.65 : 0.40,
  };

  // Feedback inmediato (basado en el último intento)
  const lastAttempt = recentAttempts[recentAttempts.length - 1];
  const immediate = lastAttempt
    ? generateImmediateFeedback(lastAttempt, cognitiveLoad)
    : {
        message: 'Sesión en progreso...',
        emoji: '📖',
        color: 'blue' as const,
        showInsight: false,
        cognitiveNote: '',
      };

  return {
    immediate,
    reflective: {
      accuracyTrend: trends.accuracyTrend,
      speedTrend: trends.speedTrend,
      cognitivePattern: pattern,
      strengths,
      areasToImprove,
    },
    neuroplasticity,
    recommendations,
  };
}

/**
 * Genera mensaje motivacional basado en streak
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return '¡Comienza tu racha hoy!';
  if (streak < 3) return `Buena racha: ${streak} días`;
  if (streak < 7) return `¡Racha de ${streak} días! ¡Sigue así!`;
  if (streak < 14) return `¡${streak} días consecutivos! Impresionante.`;
  if (streak < 30) return `¡Racha de fuego: ${streak} días!`;
  return `Leyenda: ${streak} días seguidos`;
}

/**
 * Genera emoji de progreso
 */
export function getProgressEmoji(progress: number): string {
  if (progress >= 1.0) return '🏆';
  if (progress >= 0.8) return '🌟';
  if (progress >= 0.6) return '✨';
  if (progress >= 0.4) return '💪';
  if (progress >= 0.2) return '📚';
  return '🌱';
}
