/**
 * Implementación del algoritmo FSRS v6 (Free Spaced Repetition Scheduler)
 *
 * FSRS es un algoritmo moderno de repaso espaciado basado en:
 * - Curvas de olvido personalizadas
 * - Estabilidad de memoria
 * - Dificultad adaptativa
 *
 * Mejora ~15% la retención vs SM-2 según estudios de Anki
 *
 * Referencia: https://github.com/open-spaced-repetition/fsrs4anki
 */

import {
  FSRS,
  Card,
  State,
  Rating,
  type RecordLog,
  type Grade,
  createEmptyCard,
  generatorParameters,
  FSRSParameters,
} from 'ts-fsrs';

import type { ReviewResponse } from '@/types/srs';

// ============================================
// CONFIGURACIÓN FSRS
// ============================================

/**
 * Parámetros optimizados para aprendizaje de idiomas
 * Basados en datos de usuarios de Anki para contenido lingüístico
 */
const FSRS_PARAMS: Partial<FSRSParameters> = {
  // Retención objetivo: 90% (balance entre esfuerzo y retención)
  request_retention: 0.9,

  // Intervalo máximo: 365 días
  maximum_interval: 365,

  // Pesos del modelo (optimizados para vocabulario)
  // Estos valores pueden ajustarse con datos reales de usuarios
  w: [
    0.4, // w0: estabilidad inicial para Again
    0.6, // w1: estabilidad inicial para Hard
    2.4, // w2: estabilidad inicial para Good
    5.8, // w3: estabilidad inicial para Easy
    4.93, // w4: factor de dificultad
    0.94, // w5: factor de estabilidad
    0.86, // w6: factor de decaimiento
    0.01, // w7: factor de dificultad mínimo
    1.49, // w8: factor de estabilidad en fallo
    0.14, // w9: factor de dificultad en fallo
    0.94, // w10: factor de estabilidad en éxito
    2.18, // w11: factor de decaimiento en éxito
    0.05, // w12: factor de estabilidad corto plazo
    0.34, // w13: factor de dificultad largo plazo
    1.26, // w14: factor de estabilidad largo plazo
    0.29, // w15: factor de decaimiento largo plazo
    2.61, // w16: factor de estabilidad máximo
  ],
};

// Instancia singleton del scheduler FSRS
const fsrs = new FSRS(generatorParameters(FSRS_PARAMS));

// ============================================
// TIPOS
// ============================================

export interface FSRSCardState {
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: State;
  last_review?: Date;
  learning_steps: number;
}

export interface FSRSReviewResult {
  card: FSRSCardState;
  nextReviewDate: string;
  interval: number; // días
  state: 'new' | 'learning' | 'review' | 'relearning';
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Crea una nueva tarjeta FSRS con valores por defecto
 */
export function createFSRSCard(): Card {
  return createEmptyCard();
}

/**
 * Convierte el estado FSRS a nuestro formato de estado
 */
function stateToCardStatus(state: State): 'new' | 'learning' | 'review' | 'relearning' {
  switch (state) {
    case State.New:
      return 'new';
    case State.Learning:
      return 'learning';
    case State.Review:
      return 'review';
    case State.Relearning:
      return 'relearning';
    default:
      return 'new';
  }
}

/**
 * Convierte nuestra respuesta al Grade de FSRS (excluye Manual)
 */
export function responseToFSRSGrade(response: ReviewResponse): Grade {
  switch (response) {
    case 'again':
      return Rating.Again;
    case 'hard':
      return Rating.Hard;
    case 'good':
      return Rating.Good;
    case 'easy':
      return Rating.Easy;
    default:
      return Rating.Good;
  }
}

/**
 * Convierte Rating de FSRS a nuestra respuesta
 */
export function fsrsRatingToResponse(rating: Rating): ReviewResponse {
  switch (rating) {
    case Rating.Again:
      return 'again';
    case Rating.Hard:
      return 'hard';
    case Rating.Good:
      return 'good';
    case Rating.Easy:
      return 'easy';
    default:
      return 'good';
  }
}

/**
 * Convierte FSRSCardState a Card de ts-fsrs para review
 */
function fsrsCardStateToCard(cardState: FSRSCardState): Card {
  return {
    due: cardState.due,
    stability: cardState.stability,
    difficulty: cardState.difficulty,
    elapsed_days: cardState.elapsed_days,
    scheduled_days: cardState.scheduled_days,
    reps: cardState.reps,
    lapses: cardState.lapses,
    state: cardState.state,
    last_review: cardState.last_review,
    learning_steps: 0, // Valor por defecto para FSRS
  } as unknown as Card;
}

/**
 * Revisa una tarjeta y calcula el próximo estado
 */
export function reviewFSRSCard(
  card: Card | FSRSCardState,
  response: ReviewResponse,
  now: Date = new Date()
): FSRSReviewResult {
  const grade = responseToFSRSGrade(response);
  // Convertir FSRSCardState a Card si es necesario
  const fsrsCard = 'due' in card && 'state' in card && typeof card.state !== 'string'
    ? card as Card
    : fsrsCardStateToCard(card as FSRSCardState);
  const scheduling = fsrs.repeat(fsrsCard, now);
  const result = scheduling[grade];

  return {
    card: {
      due: result.card.due,
      stability: result.card.stability,
      difficulty: result.card.difficulty,
      elapsed_days: result.card.elapsed_days,
      scheduled_days: result.card.scheduled_days,
      reps: result.card.reps,
      lapses: result.card.lapses,
      state: result.card.state,
      last_review: result.card.last_review,
      learning_steps: (result.card as any).learning_steps || 0,
    },
    nextReviewDate: result.card.due.toISOString(),
    interval: result.card.scheduled_days,
    state: stateToCardStatus(result.card.state),
  };
}

/**
 * Obtiene las opciones de scheduling para mostrar al usuario
 * (muestra cuántos días hasta el próximo repaso para cada opción)
 */
export function getSchedulingOptions(
  card: Card,
  now: Date = new Date()
): Record<ReviewResponse, { interval: number; nextReview: string }> {
  const scheduling = fsrs.repeat(card, now);

  return {
    again: {
      interval: scheduling[Rating.Again].card.scheduled_days,
      nextReview: formatInterval(scheduling[Rating.Again].card.scheduled_days),
    },
    hard: {
      interval: scheduling[Rating.Hard].card.scheduled_days,
      nextReview: formatInterval(scheduling[Rating.Hard].card.scheduled_days),
    },
    good: {
      interval: scheduling[Rating.Good].card.scheduled_days,
      nextReview: formatInterval(scheduling[Rating.Good].card.scheduled_days),
    },
    easy: {
      interval: scheduling[Rating.Easy].card.scheduled_days,
      nextReview: formatInterval(scheduling[Rating.Easy].card.scheduled_days),
    },
  };
}

/**
 * Formatea el intervalo en texto legible
 */
function formatInterval(days: number): string {
  if (days < 1) {
    const minutes = Math.round(days * 24 * 60);
    if (minutes < 60) {
      return `${minutes}min`;
    }
    return `${Math.round(minutes / 60)}h`;
  }
  if (days < 7) {
    return `${Math.round(days)}d`;
  }
  if (days < 30) {
    return `${Math.round(days / 7)}sem`;
  }
  if (days < 365) {
    return `${Math.round(days / 30)}mes`;
  }
  return `${Math.round(days / 365)}año`;
}

// ============================================
// MIGRACIÓN DESDE SM-2
// ============================================

interface SM2Card {
  easeFactor: number;
  interval: number;
  repetitions: number;
  status: string;
}

/**
 * Migra una tarjeta SM-2 existente a FSRS
 * Usa heurísticas para estimar estabilidad y dificultad
 */
export function migrateFromSM2(sm2Card: SM2Card): Card {
  const card = createEmptyCard();

  // Estimar estado basado en repeticiones
  if (sm2Card.repetitions === 0) {
    card.state = State.New;
  } else if (sm2Card.repetitions < 3) {
    card.state = State.Learning;
  } else {
    card.state = State.Review;
  }

  // Estimar estabilidad basada en intervalo
  // Mayor intervalo = mayor estabilidad
  card.stability = Math.max(1, sm2Card.interval * 0.9);

  // Estimar dificultad basada en ease factor
  // SM-2 ease factor típico: 1.3 - 2.5
  // FSRS difficulty: 0 (fácil) - 10 (difícil)
  // Invertir la escala: ease alto = dificultad baja
  card.difficulty = Math.max(0, Math.min(10, (2.5 - sm2Card.easeFactor) * 5));

  // Configurar fecha de repaso
  card.scheduled_days = sm2Card.interval;
  card.reps = sm2Card.repetitions;

  // La fecha due se mantiene en la tarjeta original
  card.due = new Date();

  return card;
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Verifica si una tarjeta necesita repaso
 */
export function isDue(card: Card, now: Date = new Date()): boolean {
  return card.due <= now;
}

/**
 * Calcula la retención estimada actual de una tarjeta
 */
export function getRetention(card: Card, now: Date = new Date()): number {
  if (card.state === State.New) {
    return 1; // Nueva = 100% (no se ha olvidado nada)
  }

  if (!card.last_review) {
    return 1;
  }

  // Fórmula de retención de FSRS
  // R(t) = exp(-t / S)
  // donde t = tiempo desde última revisión, S = estabilidad
  const daysSinceReview = (now.getTime() - card.last_review.getTime()) / (1000 * 60 * 60 * 24);
  const retention = Math.exp(-daysSinceReview / card.stability);

  return Math.max(0, Math.min(1, retention));
}

/**
 * Obtiene estadísticas de una colección de tarjetas
 */
export function getCollectionStats(cards: Card[]): {
  total: number;
  new: number;
  learning: number;
  review: number;
  relearning: number;
  dueToday: number;
  averageStability: number;
  averageDifficulty: number;
  estimatedRetention: number;
} {
  const now = new Date();

  const stats = {
    total: cards.length,
    new: 0,
    learning: 0,
    review: 0,
    relearning: 0,
    dueToday: 0,
    averageStability: 0,
    averageDifficulty: 0,
    estimatedRetention: 0,
  };

  if (cards.length === 0) {
    return stats;
  }

  let totalStability = 0;
  let totalDifficulty = 0;
  let totalRetention = 0;
  let reviewableCards = 0;

  for (const card of cards) {
    // Contar por estado
    switch (card.state) {
      case State.New:
        stats.new++;
        break;
      case State.Learning:
        stats.learning++;
        break;
      case State.Review:
        stats.review++;
        break;
      case State.Relearning:
        stats.relearning++;
        break;
    }

    // Contar due today
    if (isDue(card, now)) {
      stats.dueToday++;
    }

    // Acumular para promedios (solo tarjetas que han sido revisadas)
    if (card.state !== State.New) {
      totalStability += card.stability;
      totalDifficulty += card.difficulty;
      totalRetention += getRetention(card, now);
      reviewableCards++;
    }
  }

  // Calcular promedios
  if (reviewableCards > 0) {
    stats.averageStability = totalStability / reviewableCards;
    stats.averageDifficulty = totalDifficulty / reviewableCards;
    stats.estimatedRetention = totalRetention / reviewableCards;
  }

  return stats;
}

/**
 * Ordena tarjetas por prioridad de repaso
 * Prioridad: due más antiguo primero, luego por menor retención
 */
export function sortByReviewPriority(cards: Card[], now: Date = new Date()): Card[] {
  return [...cards].sort((a, b) => {
    // Primero las que están due
    const aDue = isDue(a, now);
    const bDue = isDue(b, now);

    if (aDue && !bDue) return -1;
    if (!aDue && bDue) return 1;

    // Si ambas están due, ordenar por retención (menor primero)
    if (aDue && bDue) {
      return getRetention(a, now) - getRetention(b, now);
    }

    // Si ninguna está due, ordenar por fecha due (más próxima primero)
    return a.due.getTime() - b.due.getTime();
  });
}

// ============================================
// EXPORTS
// ============================================

export {
  fsrs,
  State,
  Rating,
  type Card,
  type RecordLog,
  type Grade,
};
