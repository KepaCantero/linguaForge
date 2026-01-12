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
 * @param activity - Métricas de la actividad del usuario
 */
export function calculateGermaneLoad(
  activity: ActivityMetrics
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
  const germane = calculateGermaneLoad(activity);

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
    ...(audioDuration !== undefined && { audioDuration }),
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

// ============================================================
// MÉTRICAS DE NEURODISEÑO (FASE 1.3)
// ============================================================

/**
 * Métricas de irrigación neuronal (input comprensible procesado)
 * Basado en la teoría de Krashen: input comprensible = i+1
 */
export interface NeuronalIrrigationMetrics {
  totalMinutes: number;           // Minutos totales de input
  effectiveMinutes: number;       // Minutos efectivos (ajustado por comprensión)
  wordsProcessed: number;         // Palabras procesadas
  comprehensionLevel: number;     // Nivel de comprensión (0-1)
  irrigationRate: number;         // Tasa de irrigación por minuto
  streakDays: number;             // Días consecutivos de práctica
  lastIrrigationTime: number;     // Timestamp de última irrigación
}

/**
 * Métricas de densidad sináptica (conexiones neuronales formadas)
 * Representa la consolidación de memoria a largo plazo
 */
export interface SynapticDensityMetrics {
  totalConnections: number;       // Conexiones totales (simulado)
  activeConnections: number;      // Conexiones activas recientemente
  consolidatedConnections: number;// Conexiones consolidadas (LTM)
  densityLevel: 'seed' | 'sprout' | 'growing' | 'mature' | 'dense';
  growthRate: number;             // Tasa de crecimiento (%/día)
  lastActivationTime: number;     // Timestamp de última activación
}

/**
 * Score de neuroplasticidad (capacidad de cambio cerebral)
 * Combina input + práctica + tiempo
 */
export interface NeuroplasticityScore {
  currentScore: number;           // Score actual (0-100)
  dailyGain: number;              // Ganancia diaria
  weeklyTrend: 'rising' | 'stable' | 'declining';
  brainZones: {
    temporal: number;             // Comprensión auditiva
    broca: number;                // Producción verbal
    motor: number;                // Procesamiento procedimental
    prefrontal: number;           // Memoria de trabajo
  };
  nextMilestone: string;          // Próximo hito a desbloquear
}

// Constantes para cálculo de neurodiseño
const COMPREHENSION_BONUS_MULTIPLIER = 1.5; // Bonus por alta comprensión
const SYNAPTIC_CONSOLIDATION_DAYS = 7; // Días para consolidar una conexión
const DENSITY_THRESHOLDS = {
  seed: 50,
  sprout: 150,
  growing: 400,
  mature: 800,
  dense: 1500,
};

/**
 * Calcula métricas de irrigación neuronal
 * @param minutesSpent Minutos dedicados al input
 * @param wordsProcessed Palabras procesadas
 * @param comprehensionLevel Nivel de comprensión (0-1)
 * @param previousMetrics Métricas previas (para calcular streak)
 */
export function calculateNeuronalIrrigation(
  minutesSpent: number,
  wordsProcessed: number,
  comprehensionLevel: number,
  previousMetrics?: NeuronalIrrigationMetrics
): NeuronalIrrigationMetrics {
  const now = Date.now();

  // Calcular minutos efectivos (ajustado por comprensión)
  const effectiveMinutes = minutesSpent * (0.3 + comprehensionLevel * COMPREHENSION_BONUS_MULTIPLIER);

  // Calcular tasa de irrigación (palabras efectivas por minuto)
  const irrigationRate = minutesSpent > 0
    ? (wordsProcessed * comprehensionLevel) / minutesSpent
    : 0;

  // Calcular racha (streak) de días
  let streakDays = 1;
  if (previousMetrics?.lastIrrigationTime) {
    const daysSinceLastIrrigation = (now - previousMetrics.lastIrrigationTime) / (1000 * 60 * 60 * 24);
    if (daysSinceLastIrrigation <= 1.5) { // Permitir hasta 36h de diferencia
      streakDays = previousMetrics.streakDays + 1;
    } else if (daysSinceLastIrrigation > 2) {
      streakDays = 1; // Reset streak si pasaron más de 2 días
    } else {
      streakDays = previousMetrics.streakDays;
    }
  }

  return {
    totalMinutes: (previousMetrics?.totalMinutes || 0) + minutesSpent,
    effectiveMinutes: (previousMetrics?.effectiveMinutes || 0) + effectiveMinutes,
    wordsProcessed: (previousMetrics?.wordsProcessed || 0) + wordsProcessed,
    comprehensionLevel,
    irrigationRate,
    streakDays,
    lastIrrigationTime: now,
  };
}

/**
 * Calcula métricas de densidad sináptica
 * @param exercisesCompleted Ejercicios completados
 * @param accuracy Precisión promedio (0-1)
 * @param uniqueConcepts Conceptos únicos aprendidos
 * @param previousMetrics Métricas previas
 */
export function calculateSynapticDensity(
  exercisesCompleted: number,
  accuracy: number,
  uniqueConcepts: number,
  previousMetrics?: SynapticDensityMetrics
): SynapticDensityMetrics {
  const now = Date.now();

  // Conexiones base por ejercicio
  const baseConnections = exercisesCompleted * 5;

  // Bonus por precisión (conexiones más fuertes)
  const accuracyBonus = Math.floor(baseConnections * accuracy * 0.5);

  // Conexiones por concepto único
  const conceptConnections = uniqueConcepts * 10;

  // Consolidar conexiones antiguas (pasan a LTM)
  const daysSinceLastActivation = previousMetrics?.lastActivationTime
    ? (now - previousMetrics.lastActivationTime) / (1000 * 60 * 60 * 24)
    : 0;

  let consolidatedConnections = previousMetrics?.consolidatedConnections || 0;
  let activeConnections = baseConnections + accuracyBonus + conceptConnections;

  if (daysSinceLastActivation >= SYNAPTIC_CONSOLIDATION_DAYS && previousMetrics) {
    // Transferir conexiones activas a consolidadas
    const toConsolidate = Math.floor(previousMetrics.activeConnections * 0.7);
    consolidatedConnections += toConsolidate;
    activeConnections = Math.floor(activeConnections * 0.3); // Mantener 30% activas
  }

  const totalConnections = activeConnections + consolidatedConnections;

  // Determinar nivel de densidad
  let densityLevel: SynapticDensityMetrics['densityLevel'] = 'seed';
  if (totalConnections >= DENSITY_THRESHOLDS.dense) densityLevel = 'dense';
  else if (totalConnections >= DENSITY_THRESHOLDS.mature) densityLevel = 'mature';
  else if (totalConnections >= DENSITY_THRESHOLDS.growing) densityLevel = 'growing';
  else if (totalConnections >= DENSITY_THRESHOLDS.sprout) densityLevel = 'sprout';

  // Calcular tasa de crecimiento
  let growthRate = 0;
  if (previousMetrics && previousMetrics.totalConnections > 0) {
    const previousTotal = previousMetrics.totalConnections || previousMetrics.activeConnections + previousMetrics.consolidatedConnections;
    growthRate = ((totalConnections - previousTotal) / previousTotal) * 100;
  }

  return {
    totalConnections,
    activeConnections,
    consolidatedConnections,
    densityLevel,
    growthRate: Math.max(0, Math.min(100, growthRate)),
    lastActivationTime: now,
  };
}

/**
 * Calcula el score de neuroplasticidad
 * @param irrigation Irrigación neuronal
 * @param synapticDensity Densidad sináptica
 * @param activityTypes Tipos de actividades realizadas
 * @param previousScore Score previo
 */
export function calculateNeuroplasticityScore(
  irrigation: NeuronalIrrigationMetrics,
  synapticDensity: SynapticDensityMetrics,
  activityTypes: ExerciseType[],
  previousScore?: NeuroplasticityScore
): NeuroplasticityScore {
  // Puntuación base por irrigación (hasta 30 puntos)
  const irrigationPoints = Math.min(30, irrigation.effectiveMinutes * 0.5);

  // Puntuación por densidad sináptica (hasta 40 puntos)
  const densityPoints = Math.min(
    40,
    (synapticDensity.totalConnections / DENSITY_THRESHOLDS.dense) * 40
  );

  // Puntuación por variedad de actividades (hasta 20 puntos)
  const uniqueActivities = new Set(activityTypes).size;
  const varietyPoints = Math.min(20, uniqueActivities * 4);

  // Puntuación por consistencia (streak) (hasta 10 puntos)
  const consistencyPoints = Math.min(10, irrigation.streakDays * 1.5);

  const currentScore = Math.min(100, irrigationPoints + densityPoints + varietyPoints + consistencyPoints);

  // Calcular ganancia diaria
  const dailyGain = previousScore ? currentScore - previousScore.currentScore : currentScore;

  // Determinar tendencia semanal
  let weeklyTrend: NeuroplasticityScore['weeklyTrend'] = 'stable';
  if (dailyGain > 1) weeklyTrend = 'rising';
  else if (dailyGain < -0.5) weeklyTrend = 'declining';

  // Calcular activación por zonas cerebrales
  const brainZones = {
    temporal: calculateZoneActivation(['input-listening', 'echo-stream', 'resonance-path'], activityTypes),
    broca: calculateZoneActivation(['shadowing', 'janus-composer', 'glyph-weaving'], activityTypes),
    motor: calculateZoneActivation(['cloze', 'variations', 'srs-review'], activityTypes),
    prefrontal: calculateZoneActivation(['janus-composer', 'pragma-strike', 'shard-detection'], activityTypes),
  };

  // Determinar próximo hito
  const nextMilestone = getNextMilestone(currentScore);

  return {
    currentScore: Math.round(currentScore),
    dailyGain: Math.round(dailyGain * 100) / 100,
    weeklyTrend,
    brainZones,
    nextMilestone,
  };
}

/**
 * Helper: Calcula activación de zona cerebral basado en tipos de ejercicio
 */
function calculateZoneActivation(
  zoneExercises: ExerciseType[],
  performedExercises: ExerciseType[]
): number {
  const performed = performedExercises.filter((e) => zoneExercises.includes(e));
  if (performed.length === 0) return 0;

  // Cada ejercicio en la zona aporta 25 puntos, máximo 100
  return Math.min(100, performed.length * 25);
}

/**
 * Helper: Determina el próximo hito basado en score
 */
function getNextMilestone(score: number): string {
  const milestones: Record<string, { score: number; description: string }> = {
    initial: { score: 10, description: 'Primera chispa neuronal' },
    seedling: { score: 25, description: 'Brote sináptico' },
    rooted: { score: 40, description: 'Raíces establecidas' },
    branching: { score: 55, description: 'Ramificación activa' },
    flowering: { score: 70, description: 'Floración cognitiva' },
    fruiting: { score: 85, description: 'Fructificación neuronal' },
    ecosystem: { score: 95, description: 'Ecosistema mental' },
  };

  for (const milestone of Object.values(milestones)) {
    if (score < milestone.score) {
      return milestone.description;
    }
  }

  return 'Maestría neuronal alcanzada';
}

/**
 * Combina todas las métricas de neurodiseño en un solo objeto
 */
export interface NeuroDesignMetrics {
  irrigation: NeuronalIrrigationMetrics;
  synapticDensity: SynapticDensityMetrics;
  neuroplasticity: NeuroplasticityScore;
  cognitiveLoad: CognitiveLoadCalculation;
  lastUpdate: number;
}

/**
 * Parámetros de entrada para cálculo de métricas de neurodiseño
 */
export interface NeuroDesignInput {
  inputMinutes: number;
  wordsProcessed: number;
  comprehensionLevel: number;
  exercisesCompleted: number;
  accuracy: number;
  uniqueConcepts: number;
  activityTypes: ExerciseType[];
  content: ContentMetrics;
  context: ContextMetrics;
  activity: ActivityMetrics;
  previousMetrics?: {
    irrigation?: NeuronalIrrigationMetrics;
    synapticDensity?: SynapticDensityMetrics;
    neuroplasticity?: NeuroplasticityScore;
  };
}

/**
 * Calcula métricas completas de neurodiseño
 * Función principal que combina CLT + métricas neuronales
 */
export function calculateNeuroDesignMetrics(input: NeuroDesignInput): NeuroDesignMetrics {
  // Calcular carga cognitiva (CLT)
  const cognitiveLoad = calculateCognitiveLoad(input.content, input.context, input.activity);

  // Calcular irrigación neuronal
  const irrigation = calculateNeuronalIrrigation(
    input.inputMinutes,
    input.wordsProcessed,
    input.comprehensionLevel,
    input.previousMetrics?.irrigation
  );

  // Calcular densidad sináptica
  const synapticDensity = calculateSynapticDensity(
    input.exercisesCompleted,
    input.accuracy,
    input.uniqueConcepts,
    input.previousMetrics?.synapticDensity
  );

  // Calcular neuroplasticidad
  const neuroplasticity = calculateNeuroplasticityScore(
    irrigation,
    synapticDensity,
    input.activityTypes,
    input.previousMetrics?.neuroplasticity
  );

  return {
    irrigation,
    synapticDensity,
    neuroplasticity,
    cognitiveLoad,
    lastUpdate: Date.now(),
  };
}
