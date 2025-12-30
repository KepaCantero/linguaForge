import { InputType, InputStats, LanguageCode, LevelCode, InputEvent } from '@/types';
import { LEVEL_THRESHOLDS } from '@/lib/constants';

/**
 * Calcula palabras basado en tipo de input
 */
export function calculateWords(
  type: InputType,
  wordCount: number
): { wordsRead: number; wordsHeard: number; wordsSpoken: number } {
  switch (type) {
    case 'text':
      return { wordsRead: wordCount, wordsHeard: 0, wordsSpoken: 0 };
    case 'audio':
      return { wordsRead: 0, wordsHeard: wordCount, wordsSpoken: 0 };
    case 'video':
      return { wordsRead: 0, wordsHeard: wordCount, wordsSpoken: 0 };
    default:
      return { wordsRead: 0, wordsHeard: 0, wordsSpoken: 0 };
  }
}

/**
 * Calcula minutos basado en duración
 */
export function calculateMinutes(
  type: InputType,
  durationSeconds?: number
): { minutesListened: number; minutesRead: number } {
  const minutes = durationSeconds ? Math.ceil(durationSeconds / 60) : 0;

  switch (type) {
    case 'audio':
    case 'video':
      return { minutesListened: minutes, minutesRead: 0 };
    case 'text':
      return { minutesListened: 0, minutesRead: minutes };
    default:
      return { minutesListened: 0, minutesRead: 0 };
  }
}

/**
 * Actualiza stats con nuevo input
 */
export function updateStats(
  currentStats: InputStats,
  type: InputType,
  wordCount: number,
  durationSeconds?: number
): InputStats {
  const words = calculateWords(type, wordCount);
  const minutes = calculateMinutes(type, durationSeconds);

  return {
    wordsRead: currentStats.wordsRead + words.wordsRead,
    wordsHeard: currentStats.wordsHeard + words.wordsHeard,
    wordsSpoken: currentStats.wordsSpoken + words.wordsSpoken,
    minutesListened: currentStats.minutesListened + minutes.minutesListened,
    minutesRead: currentStats.minutesRead + minutes.minutesRead,
  };
}

/**
 * Calcula el progreso hacia el siguiente nivel
 */
export function calculateLevelProgress(
  stats: InputStats,
  level: LevelCode
): {
  readProgress: number;
  heardProgress: number;
  spokenProgress: number;
  overallProgress: number;
} {
  const thresholds = LEVEL_THRESHOLDS[level];

  const readProgress = Math.min(100, (stats.wordsRead / thresholds.read) * 100);
  const heardProgress = Math.min(100, (stats.wordsHeard / thresholds.heard) * 100);
  const spokenProgress = Math.min(100, (stats.wordsSpoken / thresholds.spoken) * 100);

  // Progreso general ponderado
  const overallProgress = (readProgress * 0.35 + heardProgress * 0.45 + spokenProgress * 0.2);

  return {
    readProgress: Math.round(readProgress),
    heardProgress: Math.round(heardProgress),
    spokenProgress: Math.round(spokenProgress),
    overallProgress: Math.round(overallProgress),
  };
}

/**
 * Verifica si se puede avanzar al siguiente nivel basado en Krashen
 */
export function canAdvanceLevel(stats: InputStats, currentLevel: LevelCode): boolean {
  const thresholds = LEVEL_THRESHOLDS[currentLevel];

  return (
    stats.wordsRead >= thresholds.read &&
    stats.wordsHeard >= thresholds.heard &&
    stats.wordsSpoken >= thresholds.spoken
  );
}

/**
 * Obtiene la debilidad principal del usuario
 */
export function getMainWeakness(
  stats: InputStats,
  level: LevelCode
): 'reading' | 'listening' | 'speaking' {
  const progress = calculateLevelProgress(stats, level);

  if (progress.readProgress <= progress.heardProgress && progress.readProgress <= progress.spokenProgress) {
    return 'reading';
  }
  if (progress.heardProgress <= progress.spokenProgress) {
    return 'listening';
  }
  return 'speaking';
}

/**
 * Genera la clave para identificar stats por idioma+nivel
 */
export function getStatsKey(lang: LanguageCode, level: LevelCode): string {
  return `${lang}-${level}`;
}

/**
 * Crea un nuevo evento de input
 */
export function createInputEvent(
  type: InputType,
  contentId: string,
  wordsCounted: number,
  understood: boolean,
  durationSeconds?: number
): InputEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    type,
    contentId,
    wordsCounted,
    durationSeconds,
    understood,
  };
}

/**
 * Obtiene estadísticas resumen
 */
export function getStatsSummary(stats: InputStats): {
  totalWords: number;
  totalMinutes: number;
  breakdown: { type: string; count: number; percentage: number }[];
} {
  const totalWords = stats.wordsRead + stats.wordsHeard + stats.wordsSpoken;
  const totalMinutes = stats.minutesListened + stats.minutesRead;

  const breakdown = [
    {
      type: 'reading',
      count: stats.wordsRead,
      percentage: totalWords > 0 ? Math.round((stats.wordsRead / totalWords) * 100) : 0,
    },
    {
      type: 'listening',
      count: stats.wordsHeard,
      percentage: totalWords > 0 ? Math.round((stats.wordsHeard / totalWords) * 100) : 0,
    },
    {
      type: 'speaking',
      count: stats.wordsSpoken,
      percentage: totalWords > 0 ? Math.round((stats.wordsSpoken / totalWords) * 100) : 0,
    },
  ];

  return { totalWords, totalMinutes, breakdown };
}

/**
 * Inicializa stats vacías
 */
export function createEmptyStats(): InputStats {
  return {
    wordsRead: 0,
    wordsHeard: 0,
    wordsSpoken: 0,
    minutesListened: 0,
    minutesRead: 0,
  };
}
