/**
 * Cognitive Load Metrics Service
 *
 * Calcula y gestiona métricas de carga cognitiva basadas en:
 * - Contenido (duración, palabras, complejidad gramatical)
 * - Contexto (animaciones, CTAs, distracciones)
 * - Actividad (tipo de ejercicio, interacciones)
 */

// ============================================================
// TIPOS
// ============================================================

export interface ContentMetrics {
  wordCount: number;
  uniqueWords: number;
  averageWordLength: number;
  sentenceCount: number;
  averageSentenceLength: number;
  hasNewVocabulary: boolean;
  hasNewGrammar: boolean;
  audioDuration?: number; // segundos
}

export interface ContextMetrics {
  activeAnimations: number;
  visibleCTAs: number;
  notificationsEnabled: boolean;
  backgroundNoise: boolean;
  multitaskingDetected: boolean;
}

export interface ActivityMetrics {
  exerciseType: ExerciseType;
  interactionLevel: 'passive' | 'active' | 'intensive';
  timeOnTask: number; // segundos
  errorsInSession: number;
  consecutiveCorrect: number;
}

export type ExerciseType =
  | 'input-listening'     // Escucha pasiva
  | 'input-reading'       // Lectura pasiva
  | 'cloze'               // Fill in the blank
  | 'variations'          // Variaciones de frases
  | 'shadowing'           // Repetición de audio
  | 'janus-composer'      // Construcción de frases
  | 'echo-stream'         // Escucha activa
  | 'glyph-weaving'       // Escritura
  | 'resonance-path'      // Entonación
  | 'pragma-strike'       // Situacional
  | 'shard-detection'     // Detección
  | 'srs-review';         // Repaso SRS

export interface CognitiveLoadCalculation {
  intrinsic: number;
  extraneous: number;
  germane: number;
  total: number;
  recommendations: string[];
}

// ============================================================
// CONSTANTES DE CÁLCULO
// ============================================================

const EXERCISE_INTRINSIC_LOAD: Record<ExerciseType, number> = {
  'input-listening': 20,
  'input-reading': 25,
  'cloze': 35,
  'variations': 40,
  'shadowing': 50,
  'janus-composer': 65,
  'echo-stream': 55,
  'glyph-weaving': 70,
  'resonance-path': 45,
  'pragma-strike': 40,
  'shard-detection': 30,
  'srs-review': 35,
};

const EXERCISE_GERMANE_POTENTIAL: Record<ExerciseType, number> = {
  'input-listening': 40,
  'input-reading': 45,
  'cloze': 60,
  'variations': 70,
  'shadowing': 75,
  'janus-composer': 85,
  'echo-stream': 70,
  'glyph-weaving': 80,
  'resonance-path': 65,
  'pragma-strike': 60,
  'shard-detection': 50,
  'srs-review': 70,
};

// ============================================================
// FUNCIONES DE CÁLCULO
// ============================================================

/**
 * Calcula la carga intrínseca basada en el contenido
 */
export function calculateIntrinsicLoad(
  content: ContentMetrics,
  activity: ActivityMetrics
): number {
  let load = EXERCISE_INTRINSIC_LOAD[activity.exerciseType] || 40;

  // Ajustar por longitud del contenido
  if (content.wordCount > 50) {
    load += Math.min(20, (content.wordCount - 50) * 0.2);
  }

  // Ajustar por complejidad de oraciones
  if (content.averageSentenceLength > 12) {
    load += Math.min(15, (content.averageSentenceLength - 12) * 1.5);
  }

  // Ajustar por vocabulario/gramática nueva
  if (content.hasNewVocabulary) load += 10;
  if (content.hasNewGrammar) load += 15;

  // Ajustar por duración de audio
  if (content.audioDuration && content.audioDuration > 60) {
    load += Math.min(15, (content.audioDuration - 60) * 0.1);
  }

  // Ajustar por errores en sesión (indica dificultad)
  if (activity.errorsInSession > 3) {
    load += Math.min(20, activity.errorsInSession * 2);
  }

  return Math.min(100, Math.max(0, load));
}

/**
 * Calcula la carga extraña basada en el contexto
 */
export function calculateExtraneousLoad(context: ContextMetrics): number {
  let load = 10; // Base mínima

  // Animaciones activas
  load += context.activeAnimations * 5;

  // CTAs visibles
  load += context.visibleCTAs * 3;

  // Notificaciones
  if (context.notificationsEnabled) load += 10;

  // Ruido de fondo
  if (context.backgroundNoise) load += 15;

  // Multitasking
  if (context.multitaskingDetected) load += 25;

  return Math.min(100, Math.max(0, load));
}

/**
 * Calcula la carga germana basada en la actividad
 */
export function calculateGermaneLoad(
  activity: ActivityMetrics,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  content: ContentMetrics
): number {
  let load = EXERCISE_GERMANE_POTENTIAL[activity.exerciseType] || 50;

  // Ajustar por nivel de interacción
  switch (activity.interactionLevel) {
    case 'passive':
      load *= 0.6;
      break;
    case 'active':
      load *= 0.85;
      break;
    case 'intensive':
      load *= 1.0;
      break;
  }

  // Bonus por racha de aciertos (indica aprendizaje efectivo)
  if (activity.consecutiveCorrect > 3) {
    load += Math.min(15, activity.consecutiveCorrect * 2);
  }

  // Reducir si hay muchos errores (frustración, no aprendizaje)
  if (activity.errorsInSession > 5) {
    load -= Math.min(20, activity.errorsInSession * 2);
  }

  // Ajustar por tiempo en tarea (sweet spot: 5-15 min)
  const minutes = activity.timeOnTask / 60;
  if (minutes < 2) {
    load *= 0.7; // Muy poco tiempo, aún calentando
  } else if (minutes > 20) {
    load *= 0.8; // Fatiga
  } else if (minutes >= 5 && minutes <= 15) {
    load *= 1.1; // Zona óptima
  }

  return Math.min(100, Math.max(0, load));
}

/**
 * Calcula la carga cognitiva total y genera recomendaciones
 */
export function calculateCognitiveLoad(
  content: ContentMetrics,
  context: ContextMetrics,
  activity: ActivityMetrics
): CognitiveLoadCalculation {
  const intrinsic = calculateIntrinsicLoad(content, activity);
  const extraneous = calculateExtraneousLoad(context);
  const germane = calculateGermaneLoad(activity, content);

  // Total ponderado (germane reduce la carga efectiva)
  const total = intrinsic * 0.4 + extraneous * 0.35 - germane * 0.15;
  const clampedTotal = Math.min(100, Math.max(0, total));

  // Generar recomendaciones
  const recommendations: string[] = [];

  if (intrinsic > 70) {
    recommendations.push('Considera dividir el contenido en partes más pequeñas');
  }

  if (extraneous > 40) {
    recommendations.push('Activa el modo Focus para reducir distracciones');
  }

  if (germane < 40) {
    recommendations.push('Intenta un ejercicio más interactivo para mejor retención');
  }

  if (clampedTotal > 80) {
    recommendations.push('Toma un descanso de 5 minutos');
  }

  if (activity.errorsInSession > 5) {
    recommendations.push('Revisa el contenido antes de continuar');
  }

  if (activity.timeOnTask > 1800) {
    // 30 min
    recommendations.push('Has estado estudiando 30+ minutos. ¡Buen trabajo! Considera un descanso.');
  }

  return {
    intrinsic,
    extraneous,
    germane,
    total: clampedTotal,
    recommendations,
  };
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Analiza texto y extrae métricas de contenido
 */
export function analyzeContent(text: string, audioDuration?: number): ContentMetrics {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));

  return {
    wordCount: words.length,
    uniqueWords: uniqueWords.size,
    averageWordLength:
      words.length > 0
        ? words.reduce((sum, w) => sum + w.length, 0) / words.length
        : 0,
    sentenceCount: sentences.length,
    averageSentenceLength:
      sentences.length > 0 ? words.length / sentences.length : 0,
    hasNewVocabulary: false, // Se debe determinar externamente
    hasNewGrammar: false,    // Se debe determinar externamente
    audioDuration,
  };
}

/**
 * Detecta el contexto actual del navegador
 */
export function detectContext(): ContextMetrics {
  if (typeof window === 'undefined') {
    return {
      activeAnimations: 0,
      visibleCTAs: 0,
      notificationsEnabled: false,
      backgroundNoise: false,
      multitaskingDetected: false,
    };
  }

  // Contar animaciones activas (aproximación)
  const animations = document.getAnimations?.()?.length || 0;

  // Contar CTAs visibles
  const ctas = document.querySelectorAll('button, a[href], [role="button"]').length;

  // Detectar si las notificaciones están habilitadas
  const notificationsEnabled =
    'Notification' in window && Notification.permission === 'granted';

  // Detectar multitasking (documento no visible)
  const multitaskingDetected = document.hidden;

  return {
    activeAnimations: Math.min(animations, 20),
    visibleCTAs: Math.min(ctas, 30),
    notificationsEnabled,
    backgroundNoise: false, // Requiere acceso a micrófono
    multitaskingDetected,
  };
}

/**
 * Obtiene el tipo de ejercicio desde un string
 */
export function getExerciseType(type: string): ExerciseType {
  const typeMap: Record<string, ExerciseType> = {
    cloze: 'cloze',
    variations: 'variations',
    shadowing: 'shadowing',
    'janus-composer': 'janus-composer',
    januscomposer: 'janus-composer',
    'echo-stream': 'echo-stream',
    echostream: 'echo-stream',
    'glyph-weaving': 'glyph-weaving',
    glyphweaving: 'glyph-weaving',
    'resonance-path': 'resonance-path',
    resonancepath: 'resonance-path',
    'pragma-strike': 'pragma-strike',
    pragmastrike: 'pragma-strike',
    'shard-detection': 'shard-detection',
    sharddetection: 'shard-detection',
    'srs-review': 'srs-review',
    srs: 'srs-review',
    listening: 'input-listening',
    reading: 'input-reading',
  };

  return typeMap[type.toLowerCase()] || 'cloze';
}
