/**
 * Warmup Selector Service
 *
 * Selecciona el calentamiento óptimo basado en:
 * - Tipo de misión (gramática, vocabulario, pronunciación)
 * - Dificultad del usuario
 * - Historial de calentamientos
 * - Carga cognitiva actual
 */

import type { Warmup, MissionType, Difficulty, WarmupType } from '@/schemas/warmup';

// ============================================================
// TIPOS
// ============================================================

export interface WarmupSelectionContext {
  missionType: MissionType;
  difficulty: Difficulty;
  userLevel: number;
  recentWarmupTypes?: WarmupType[];
  cognitiveLoadCurrent?: number;
}

// ============================================================
// TEMPLATES DE WARMUPS
// ============================================================

const WARMUP_TEMPLATES: Record<WarmupType, Omit<Warmup, 'id'>> = {
  rhythmSequence: {
    type: 'rhythmSequence',
    title: 'Secuencia Rítmica',
    description: 'Activa los ganglios basales con patrones rítmicos',
    duration: 45,
    config: {
      sequences: [
        { pattern: ['tap', 'tap', 'hold'], duration: 2000, bpm: 80 },
        { pattern: ['tap', 'hold', 'tap', 'tap'], duration: 2500, bpm: 90 },
        { pattern: ['hold', 'tap', 'tap', 'hold'], duration: 3000, bpm: 100 },
      ],
      visualStyle: 'geometric',
      soundEnabled: true,
    },
    missionType: 'grammar',
    difficulty: 'medium',
    adaptive: true,
  },
  visualMatch: {
    type: 'visualMatch',
    title: 'Reconocimiento Visual',
    description: 'Activa el lóbulo temporal con asociaciones visuales',
    duration: 40,
    config: {
      images: [
        { url: '/warmup/vocab1.jpg', category: 'objetos', blurLevel: 8 },
        { url: '/warmup/vocab2.jpg', category: 'animales', blurLevel: 7 },
        { url: '/warmup/vocab3.jpg', category: 'comida', blurLevel: 6 },
        { url: '/warmup/vocab4.jpg', category: 'lugares', blurLevel: 5 },
        { url: '/warmup/vocab5.jpg', category: 'acciones', blurLevel: 4 },
      ],
      focusSpeed: 500,
      recognitionThreshold: 0.6,
      speedIncrease: 0.1,
    },
    missionType: 'vocabulary',
    difficulty: 'medium',
    adaptive: true,
  },
  voiceImitation: {
    type: 'voiceImitation',
    title: 'Imitación de Voz',
    description: 'Activa el cerebelo con patrones de entonación',
    duration: 50,
    config: {
      pattern: [
        { frequency: 150, duration: 300 },
        { frequency: 200, duration: 400 },
        { frequency: 180, duration: 350 },
        { frequency: 250, duration: 500 },
      ],
      visualGuide: 'wave',
      tolerance: 0.25,
      minFrequency: 100,
      maxFrequency: 400,
    },
    missionType: 'pronunciation',
    difficulty: 'medium',
    adaptive: true,
  },
};

// ============================================================
// MAPEO MISIÓN → WARMUP
// ============================================================

const MISSION_TO_WARMUP: Record<MissionType, WarmupType[]> = {
  grammar: ['rhythmSequence'],
  vocabulary: ['visualMatch'],
  pronunciation: ['voiceImitation'],
  mixed: ['rhythmSequence', 'visualMatch'], // Alterna entre los dos
};

// ============================================================
// FUNCIONES DE SELECCIÓN
// ============================================================

/**
 * Genera un ID único para el warmup
 */
function generateWarmupId(type: WarmupType): string {
  return `warmup-${type}-${Date.now()}`;
}

/**
 * Ajusta la dificultad del warmup según el nivel del usuario
 */
function adjustDifficulty(
  template: Omit<Warmup, 'id'>,
  _userLevel: number,
  targetDifficulty: Difficulty
): Omit<Warmup, 'id'> {
  // For simplicity, just adjust the difficulty level without modifying config
  // Config adjustments would require proper type narrowing
  return { ...template, difficulty: targetDifficulty };
}

/**
 * Selecciona el tipo de warmup basado en el contexto
 */
function selectWarmupType(context: WarmupSelectionContext): WarmupType {
  const candidates = MISSION_TO_WARMUP[context.missionType];

  if (candidates.length === 1) {
    return candidates[0];
  }

  // Si hay múltiples opciones (mixed), elegir uno que no se haya hecho recientemente
  if (context.recentWarmupTypes && context.recentWarmupTypes.length > 0) {
    const notRecent = candidates.filter(
      (c) => !context.recentWarmupTypes!.includes(c)
    );
    if (notRecent.length > 0) {
      return notRecent[0];
    }
  }

  // Por defecto, elegir aleatoriamente
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ============================================================
// API PÚBLICA
// ============================================================

/**
 * Selecciona un warmup apropiado para el contexto dado
 */
export function selectWarmup(context: WarmupSelectionContext): Warmup {
  const warmupType = selectWarmupType(context);
  const template = WARMUP_TEMPLATES[warmupType];
  const adjusted = adjustDifficulty(template, context.userLevel, context.difficulty);

  return {
    ...adjusted,
    id: generateWarmupId(warmupType),
  } as Warmup;
}

/**
 * Obtiene el warmup recomendado para un tipo de misión
 */
export function getWarmupForMissionType(
  missionType: MissionType,
  difficulty: Difficulty = 'medium',
  userLevel: number = 1
): Warmup {
  return selectWarmup({
    missionType,
    difficulty,
    userLevel,
  });
}

/**
 * Obtiene todos los tipos de warmup disponibles
 */
export function getAvailableWarmupTypes(): WarmupType[] {
  return Object.keys(WARMUP_TEMPLATES) as WarmupType[];
}

/**
 * Verifica si un warmup es apropiado para la carga cognitiva actual
 */
export function isWarmupAppropriate(
  warmupType: WarmupType,
  currentLoad: number
): { appropriate: boolean; reason?: string } {
  // Si la carga es muy alta, solo permitir warmups relajados
  if (currentLoad > 80) {
    return {
      appropriate: warmupType === 'visualMatch',
      ...(currentLoad > 80 && {
        reason: 'Tu carga cognitiva es alta. Un warmup visual suave es lo mejor.',
      }),
    };
  }

  return { appropriate: true };
}

/**
 * Calcula la duración ajustada del warmup
 */
export function getAdjustedDuration(
  warmup: Warmup,
  userPerformance: { averageScore: number; completionRate: number }
): number {
  let duration = warmup.duration;

  // Si el usuario tiene buen rendimiento, puede ser más corto
  if (userPerformance.averageScore > 85 && userPerformance.completionRate > 0.9) {
    duration = Math.round(duration * 0.8);
  }

  // Si tiene bajo rendimiento, puede ser más largo para mejor preparación
  if (userPerformance.averageScore < 60) {
    duration = Math.round(duration * 1.2);
  }

  return Math.max(30, Math.min(90, duration));
}
