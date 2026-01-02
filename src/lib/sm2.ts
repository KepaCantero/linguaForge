/**
 * Implementación del algoritmo SuperMemo 2 (SM-2)
 *
 * El algoritmo SM-2 es un sistema de repaso espaciado que calcula
 * el intervalo óptimo para revisar una tarjeta basándose en:
 * - La respuesta del usuario (again, hard, good, easy)
 * - El factor de facilidad de la tarjeta
 * - El número de repeticiones consecutivas correctas
 *
 * Referencia: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

import {
  SRSCard,
  ReviewResponse,
  SRS_CONFIG,
  CardStatus,
} from '@/types/srs';

// ============================================
// TIPOS INTERNOS
// ============================================

interface SM2Result {
  interval: number; // Nuevo intervalo en días
  easeFactor: number; // Nuevo factor de facilidad
  repetitions: number; // Nuevo contador de repeticiones
  status: CardStatus; // Nuevo estado de la tarjeta
  nextReviewDate: string; // Fecha del próximo repaso (ISO string)
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Convierte ReviewResponse a quality (0-5) del SM-2 original
 */
function responseToQuality(response: ReviewResponse): number {
  switch (response) {
    case 'again':
      return 0; // Fallo completo
    case 'hard':
      return 2; // Recordó con dificultad
    case 'good':
      return 4; // Recordó correctamente
    case 'easy':
      return 5; // Recordó perfectamente
    default:
      return 3;
  }
}

/**
 * Calcula la fecha del próximo repaso
 */
function calculateNextReviewDate(intervalDays: number): string {
  const now = new Date();
  const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  return nextDate.toISOString();
}

/**
 * Determina el estado de la tarjeta basado en repeticiones e intervalo
 */
function determineCardStatus(
  repetitions: number,
  interval: number,
  wasCorrect: boolean
): CardStatus {
  if (!wasCorrect || repetitions === 0) {
    return 'learning';
  }

  if (interval >= SRS_CONFIG.graduationInterval) {
    return 'graduated';
  }

  if (repetitions >= 2) {
    return 'review';
  }

  return 'learning';
}

// ============================================
// ALGORITMO SM-2 PRINCIPAL
// ============================================

/**
 * Calcula el próximo estado de una tarjeta después de una revisión
 *
 * @param card - Tarjeta SRS actual
 * @param response - Respuesta del usuario
 * @returns Nuevo estado de la tarjeta
 */
export function calculateNextReview(
  card: SRSCard,
  response: ReviewResponse
): SM2Result {
  const quality = responseToQuality(response);
  const wasCorrect = quality >= 2;

  let { easeFactor, interval, repetitions } = card;

  // Si la tarjeta es nueva, usar intervalos predefinidos
  if (card.status === 'new') {
    interval = SRS_CONFIG.newCardIntervals[response];
    repetitions = wasCorrect ? 1 : 0;
    easeFactor = SRS_CONFIG.defaultEaseFactor;

    return {
      interval,
      easeFactor,
      repetitions,
      status: determineCardStatus(repetitions, interval, wasCorrect),
      nextReviewDate: calculateNextReviewDate(interval),
    };
  }

  // Algoritmo SM-2 estándar
  if (wasCorrect) {
    // Respuesta correcta: aumentar intervalo
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Respuesta incorrecta: reiniciar
    repetitions = 0;
    interval = 1;
  }

  // Actualizar factor de facilidad
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Aplicar modificadores adicionales por respuesta
  const easeModifier = SRS_CONFIG.easeModifiers[response];
  easeFactor = Math.max(
    SRS_CONFIG.minEaseFactor,
    Math.min(SRS_CONFIG.maxEaseFactor, newEaseFactor + easeModifier)
  );

  // Asegurar intervalo mínimo de 1 día
  interval = Math.max(1, interval);

  return {
    interval,
    easeFactor,
    repetitions,
    status: determineCardStatus(repetitions, interval, wasCorrect),
    nextReviewDate: calculateNextReviewDate(interval),
  };
}

/**
 * Aplica el resultado del SM-2 a una tarjeta
 *
 * @param card - Tarjeta original
 * @param response - Respuesta del usuario
 * @param timeSpentMs - Tiempo que tardó en responder (ms)
 * @returns Tarjeta actualizada
 */
export function applyReview(
  card: SRSCard,
  response: ReviewResponse,
  timeSpentMs: number = 0
): SRSCard {
  const result = calculateNextReview(card, response);

  const reviewEntry = {
    date: new Date().toISOString(),
    response,
    timeSpentMs,
  };

  return {
    ...card,
    easeFactor: result.easeFactor,
    interval: result.interval,
    repetitions: result.repetitions,
    status: result.status,
    nextReviewDate: result.nextReviewDate,
    reviewHistory: [...card.reviewHistory, reviewEntry],
  };
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Verifica si una tarjeta necesita repaso hoy
 */
export function isDueForReview(card: SRSCard): boolean {
  const now = new Date();
  const reviewDate = new Date(card.nextReviewDate);
  return reviewDate <= now;
}

/**
 * Obtiene las tarjetas que necesitan repaso ordenadas por urgencia
 */
export function getCardsForReview(cards: SRSCard[], limit?: number): SRSCard[] {
  const dueCards = cards
    .filter(isDueForReview)
    .sort((a, b) => {
      // Primero las más atrasadas
      const dateA = new Date(a.nextReviewDate).getTime();
      const dateB = new Date(b.nextReviewDate).getTime();
      return dateA - dateB;
    });

  return limit ? dueCards.slice(0, limit) : dueCards;
}

/**
 * Obtiene tarjetas nuevas para estudiar
 */
export function getNewCards(cards: SRSCard[], limit?: number): SRSCard[] {
  const newCards = cards
    .filter((card) => card.status === 'new')
    .sort((a, b) => {
      // Más antiguas primero
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });

  return limit ? newCards.slice(0, limit) : newCards;
}

/**
 * Combina tarjetas para una sesión de estudio
 * Mezcla tarjetas nuevas con tarjetas de repaso
 */
export function getStudySession(
  cards: SRSCard[],
  maxNew: number = SRS_CONFIG.maxNewCardsPerDay,
  maxReview: number = SRS_CONFIG.maxReviewsPerDay
): SRSCard[] {
  const newCards = getNewCards(cards, maxNew);
  const reviewCards = getCardsForReview(
    cards.filter((c) => c.status !== 'new'),
    maxReview
  );

  // Intercalar tarjetas nuevas con repasos para mejor retención
  const session: SRSCard[] = [];
  let newIdx = 0;
  let reviewIdx = 0;

  while (
    newIdx < newCards.length ||
    reviewIdx < reviewCards.length
  ) {
    // Añadir 1 nueva cada 3 repasos
    if (reviewIdx < reviewCards.length) {
      session.push(reviewCards[reviewIdx++]);
    }
    if (reviewIdx < reviewCards.length) {
      session.push(reviewCards[reviewIdx++]);
    }
    if (reviewIdx < reviewCards.length) {
      session.push(reviewCards[reviewIdx++]);
    }
    if (newIdx < newCards.length) {
      session.push(newCards[newIdx++]);
    }
  }

  return session;
}

/**
 * Calcula estadísticas de retención
 */
export function calculateRetentionRate(cards: SRSCard[]): number {
  const cardsWithHistory = cards.filter((c) => c.reviewHistory.length > 0);
  if (cardsWithHistory.length === 0) return 0;

  let totalReviews = 0;
  let correctReviews = 0;

  for (const card of cardsWithHistory) {
    for (const review of card.reviewHistory) {
      totalReviews++;
      if (review.response !== 'again') {
        correctReviews++;
      }
    }
  }

  return totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;
}

/**
 * Calcula el factor de facilidad promedio
 */
export function calculateAverageEaseFactor(cards: SRSCard[]): number {
  if (cards.length === 0) return SRS_CONFIG.defaultEaseFactor;

  const sum = cards.reduce((acc, card) => acc + card.easeFactor, 0);
  return sum / cards.length;
}

/**
 * Estima el tiempo de una sesión de repaso
 */
export function estimateSessionDuration(cardCount: number): number {
  // Asumimos ~10 segundos por tarjeta en promedio
  const secondsPerCard = 10;
  return Math.ceil((cardCount * secondsPerCard) / 60); // Retorna minutos
}

/**
 * Obtiene el texto descriptivo del próximo repaso
 */
export function getNextReviewText(card: SRSCard): string {
  const now = new Date();
  const reviewDate = new Date(card.nextReviewDate);
  const diffMs = reviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays < 7) return `En ${diffDays} días`;
  if (diffDays < 30) return `En ${Math.ceil(diffDays / 7)} semanas`;
  return `En ${Math.ceil(diffDays / 30)} meses`;
}

/**
 * Crea una nueva tarjeta con valores por defecto
 */
export function createCard(
  phrase: string,
  translation: string,
  source: SRSCard['source'],
  options?: Partial<SRSCard>
): SRSCard {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    phrase,
    translation,
    source,
    createdAt: now,
    languageCode: options?.languageCode ?? 'fr',
    levelCode: options?.levelCode ?? 'A1',
    status: 'new',
    easeFactor: SRS_CONFIG.defaultEaseFactor,
    interval: 0,
    repetitions: 0,
    nextReviewDate: now, // Disponible inmediatamente
    reviewHistory: [],
    tags: options?.tags ?? [],
    audioUrl: options?.audioUrl,
    notes: options?.notes,
  };
}
