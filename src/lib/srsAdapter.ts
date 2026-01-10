/**
 * SRS Adapter - Puente entre FSRS v6 y el formato de tarjeta existente
 *
 * Este adapter permite que el store use FSRS manteniendo compatibilidad
 * con el formato existente de SRSCard.
 */

import type { SRSCard, ReviewResponse, CreateSRSCardInput } from '@/types/srs';
import {
  createFSRSCard,
  reviewFSRSCard,
  isDue,
  getRetention,
  getCollectionStats,
  sortByReviewPriority,
  migrateFromSM2,
  State,
  type Card as FSRSCard,
  type FSRSCardState,
} from '@/lib/fsrs';

// ============================================
// CONSTANTES
// ============================================

const SRS_CONFIG = {
  maxNewCardsPerDay: 20,
  maxReviewPerDay: 200,
};

// ============================================
// CONVERSIÓN ENTRE FORMATOS
// ============================================

/**
 * Convierte SRSCard a FSRSCard
 */
function srsToFSRSCard(card: SRSCard): FSRSCard {
  // Convertir string de estado a enum numérico
  const stringToState = (stateStr: 'New' | 'Learning' | 'Review' | 'Relearning'): State => {
    switch (stateStr) {
      case 'New': return State.New;
      case 'Learning': return State.Learning;
      case 'Review': return State.Review;
      case 'Relearning': return State.Relearning;
      default: return State.New;
    }
  };

  // Si la tarjeta ya tiene estado FSRS, usarlo
  if (card.fsrs) {
    return {
      due: new Date(card.fsrs.due),
      stability: card.fsrs.stability,
      difficulty: card.fsrs.difficulty,
      elapsed_days: card.fsrs.elapsed_days,
      scheduled_days: card.fsrs.scheduled_days,
      reps: card.fsrs.reps,
      lapses: card.fsrs.lapses,
      state: stringToState(card.fsrs.state),
      last_review: card.fsrs.last_review ? new Date(card.fsrs.last_review) : undefined,
      learning_steps: 0, // Valor por defecto requerido por ts-fsrs
    };
  }

  // Si usa SM-2, migrar a FSRS
  if (card.algorithm === 'sm2') {
    const migrated = migrateFromSM2({
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      status: card.status,
    });
    return {
      ...migrated,
      learning_steps: 0, // Valor por defecto
    };
  }

  // Nueva tarjeta, crear vacía
  const newCard = createFSRSCard();
  return {
    ...newCard,
    learning_steps: 0, // Valor por defecto
  };
}

/**
 * Convierte FSRSCardState al formato de almacenamiento
 */
function fsrsToStorageFormat(fsrsState: FSRSCardState) {
  // Convertir enum numérico a string
  const stateToString = (state: State): 'New' | 'Learning' | 'Review' | 'Relearning' => {
    switch (state) {
      case State.New: return 'New';
      case State.Learning: return 'Learning';
      case State.Review: return 'Review';
      case State.Relearning: return 'Relearning';
      default: return 'New';
    }
  };

  return {
    due: fsrsState.due.toISOString(),
    stability: fsrsState.stability,
    difficulty: fsrsState.difficulty,
    elapsed_days: fsrsState.elapsed_days,
    scheduled_days: fsrsState.scheduled_days,
    reps: fsrsState.reps,
    lapses: fsrsState.lapses, // lapses con 'e' al final
    state: stateToString(fsrsState.state),
    last_review: fsrsState.last_review?.toISOString(),
  };
}

/**
 * Obtiene el estado de tarjeta a partir del estado FSRS
 * Mapea estados FSRS a estados SRSCard compatibles
 */
function getStatusFromFSRS(fsrsState: FSRSCardState): 'new' | 'learning' | 'review' | 'graduated' {
  switch (fsrsState.state) {
    case State.New:
      return 'new';
    case State.Learning:
    case State.Relearning:
      return 'learning';
    case State.Review:
      return 'graduated';
    default:
      return 'new';
  }
}

// ============================================
// FUNCIONES PRINCIPALES (API compatible con SM-2)
// ============================================

/**
 * Crea una nueva tarjeta SRS usando FSRS
 */
export function createCard(
  phrase: string,
  translation: string,
  source: CreateSRSCardInput['source'],
  options: {
    audioUrl?: string;
    languageCode?: string;
    levelCode?: string;
    tags?: string[];
    notes?: string;
  } = {}
): SRSCard {
  const fsrsCard = createFSRSCard();
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    phrase,
    translation,
    audioUrl: options.audioUrl,
    source,
    createdAt: now,
    languageCode: options.languageCode || 'fr',
    levelCode: options.levelCode || 'A1',
    tags: options.tags || [],
    notes: options.notes,

    // Estado SM-2 (legacy, mantener por compatibilidad)
    status: 'new',
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,

    // Estado FSRS
    fsrs: fsrsToStorageFormat(fsrsCard),
    nextReviewDate: fsrsCard.due.toISOString(),

    // Marcar como FSRS
    algorithm: 'fsrs',

    // Historial vacío
    reviewHistory: [],
  };
}

/**
 * Aplica una revisión a una tarjeta usando FSRS
 */
export function applyReview(
  card: SRSCard,
  response: ReviewResponse,
  timeSpentMs: number = 0
): SRSCard {
  const fsrsCard = srsToFSRSCard(card);
  const result = reviewFSRSCard(fsrsCard, response);

  // Crear entrada de historial
  const historyEntry = {
    date: new Date().toISOString(),
    response,
    timeSpentMs,
    interval: result.interval,
  };

  // Mapear estado FSRS a estado SRSCard
  let cardStatus: 'new' | 'learning' | 'review' | 'graduated';
  switch (result.card.state) {
    case State.New:
      cardStatus = 'new';
      break;
    case State.Learning:
    case State.Relearning:
      cardStatus = 'learning';
      break;
    case State.Review:
      cardStatus = 'graduated';
      break;
    default:
      cardStatus = 'new';
  }

  return {
    ...card,
    // Actualizar estado SM-2 (legacy, mantener sincronizado)
    status: cardStatus,
    interval: result.interval,
    repetitions: result.card.reps,
    easeFactor: 2.5 + (10 - result.card.difficulty) * 0.1, // Convertir dificultad FSRS a ease factor

    // Actualizar estado FSRS
    fsrs: fsrsToStorageFormat(result.card),
    nextReviewDate: result.nextReviewDate,

    // Añadir al historial
    reviewHistory: [...card.reviewHistory, historyEntry],
  };
}

/**
 * Obtiene las tarjetas que necesitan repaso
 */
export function getCardsForReview(cards: SRSCard[], limit?: number): SRSCard[] {
  const now = new Date();

  // Convertir a FSRS, filtrar due, y ordenar por prioridad
  const fsrsCards = cards
    .filter((c) => c.status !== 'new')
    .map((card) => ({ card, fsrs: srsToFSRSCard(card) }))
    .filter(({ fsrs }) => isDue(fsrs, now));

  // Ordenar por prioridad
  const sorted = fsrsCards.sort((a, b) => {
    const aRetention = getRetention(a.fsrs, now);
    const bRetention = getRetention(b.fsrs, now);
    return aRetention - bRetention; // Menor retención primero
  });

  return sorted.slice(0, limit).map((item) => item.card);
}

/**
 * Obtiene tarjetas nuevas para estudiar
 */
export function getNewCards(cards: SRSCard[], limit: number): SRSCard[] {
  return cards
    .filter((c) => c.status === 'new')
    .slice(0, limit);
}

/**
 * Obtiene una sesión de estudio mezclando repaso y nuevas tarjetas
 */
export function getStudySession(cards: SRSCard[]): SRSCard[] {
  const now = new Date();

  // Tarjetas para repaso
  const dueCards = cards
    .filter((c) => c.status !== 'new')
    .filter((c) => {
      const fsrs = srsToFSRSCard(c);
      return isDue(fsrs, now);
    })
    .map((card) => ({ card, fsrs: srsToFSRSCard(card) }))
    .sort((a, b) => getRetention(a.fsrs, now) - getRetention(b.fsrs, now))
    .map((item) => item.card)
    .slice(0, SRS_CONFIG.maxReviewPerDay);

  // Nuevas tarjetas
  const newCards = getNewCards(cards, SRS_CONFIG.maxNewCardsPerDay);

  // Mezclar priorizando repaso primero
  return [...dueCards, ...newCards];
}

/**
 * Verifica si una tarjeta necesita repaso
 */
export function isDueForReview(card: SRSCard): boolean {
  const fsrs = srsToFSRSCard(card);
  return isDue(fsrs, new Date());
}

/**
 * Calcula la tasa de retención global
 */
export function calculateRetentionRate(cards: SRSCard[]): number {
  if (cards.length === 0) return 1;

  const now = new Date();
  const fsrsCards = cards.map((c) => srsToFSRSCard(c));

  const totalRetention = fsrsCards.reduce((sum, card) => sum + getRetention(card, now), 0);
  return totalRetention / fsrsCards.length;
}

/**
 * Calcula el ease factor promedio (para compatibilidad con SM-2)
 */
export function calculateAverageEaseFactor(cards: SRSCard[]): number {
  if (cards.length === 0) return 2.5;

  const total = cards.reduce((sum, card) => {
    // Usar easeFactor del estado SM-2 o calcular desde FSRS
    if (card.fsrs) {
      return sum + (2.5 + (10 - card.fsrs.difficulty) * 0.1);
    }
    return sum + card.easeFactor;
  }, 0);

  return total / cards.length;
}

/**
 * Obtiene estadísticas detalladas del conjunto de tarjetas
 */
export function getDetailedStats(cards: SRSCard[]) {
  const fsrsCards = cards.map((c) => srsToFSRSCard(c));
  const stats = getCollectionStats(fsrsCards);

  return {
    totalCards: stats.total,
    newCards: stats.new,
    learningCards: stats.learning,
    reviewCards: stats.review,
    relearningCards: stats.relearning,
    dueToday: stats.dueToday,
    averageStability: stats.averageStability,
    averageDifficulty: stats.averageDifficulty,
    estimatedRetention: stats.estimatedRetention,
  };
}
