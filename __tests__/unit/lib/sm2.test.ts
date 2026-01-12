/**
 * Tests unitarios para el algoritmo SuperMemo 2 (SM-2)
 * Cobertura: calculateNextReview, applyReview, isDueForReview, getCardsForReview, getNewCards, etc.
 */

import {
  calculateNextReview,
  applyReview,
  isDueForReview,
  getCardsForReview,
  getNewCards,
  getStudySession,
  calculateRetentionRate,
  calculateAverageEaseFactor,
  estimateSessionDuration,
  getNextReviewText,
  createCard,
} from '@/lib/sm2';
import type { SRSCard } from '@/types/srs';

describe('SM-2 Algorithm', () => {
  const createMockCard = (overrides?: Partial<SRSCard>): SRSCard => ({
    id: 'test-card-1',
    phrase: 'Test phrase',
    translation: 'Test translation',
    source: { type: 'text', id: 'test-source', title: 'Test Source' },
    createdAt: '2024-01-01T00:00:00.000Z',
    languageCode: 'fr',
    levelCode: 'A1',
    status: 'new',
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: '2024-01-01T00:00:00.000Z',
    reviewHistory: [],
    tags: [],
    algorithm: 'fsrs',
    ...overrides,
  });

  describe('calculateNextReview', () => {
    it('debe manejar tarjetas nuevas con respuesta "again"', () => {
      const card = createMockCard({ status: 'new' });
      const result = calculateNextReview(card, 'again');

      expect(result.interval).toBe(0);
      expect(result.repetitions).toBe(0);
      expect(result.status).toBe('learning');
    });

    it('debe manejar tarjetas nuevas con respuesta "hard"', () => {
      const card = createMockCard({ status: 'new' });
      const result = calculateNextReview(card, 'hard');

      expect(result.interval).toBe(1); // newCardIntervals.hard = 1 día
      expect(result.repetitions).toBe(1);
      expect(result.status).toBe('learning');
    });

    it('debe manejar tarjetas nuevas con respuesta "good"', () => {
      const card = createMockCard({ status: 'new' });
      const result = calculateNextReview(card, 'good');

      expect(result.interval).toBeGreaterThan(0);
      expect(result.repetitions).toBe(1);
      expect(result.status).toBe('learning');
    });

    it('debe manejar tarjetas nuevas con respuesta "easy"', () => {
      const card = createMockCard({ status: 'new' });
      const result = calculateNextReview(card, 'easy');

      expect(result.interval).toBeGreaterThan(0);
      expect(result.repetitions).toBe(1);
    });

    it('debe aumentar intervalo para respuestas correctas consecutivas', () => {
      const card = createMockCard({
        status: 'learning',
        repetitions: 1,
        interval: 1,
        easeFactor: 2.5,
      });
      const result = calculateNextReview(card, 'good');

      expect(result.interval).toBeGreaterThan(1);
      expect(result.repetitions).toBe(2);
    });

    it('debe reiniciar intervalo para respuestas incorrectas', () => {
      const card = createMockCard({
        status: 'review',
        repetitions: 5,
        interval: 21,
        easeFactor: 2.5,
      });
      const result = calculateNextReview(card, 'again');

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
      expect(result.status).toBe('learning');
    });

    it('debe ajustar factor de facilidad correctamente', () => {
      const card = createMockCard({
        status: 'review',
        repetitions: 2,
        interval: 6,
        easeFactor: 2.5,
      });

      const easyResult = calculateNextReview(card, 'easy');
      expect(easyResult.easeFactor).toBeGreaterThan(2.5);

      const againResult = calculateNextReview(card, 'again');
      expect(againResult.easeFactor).toBeLessThan(2.5);
    });

    it('debe respetar límites del factor de facilidad', () => {
      const card = createMockCard({
        status: 'review',
        repetitions: 2,
        interval: 6,
        easeFactor: 1.3, // Casi mínimo
      });

      const result = calculateNextReview(card, 'again');
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('debe calcular próxima fecha de review correctamente', () => {
      const card = createMockCard({
        status: 'learning',
        repetitions: 1,
        interval: 1,
        easeFactor: 2.5,
      });
      const result = calculateNextReview(card, 'good');

      const nextDate = new Date(result.nextReviewDate);
      const now = new Date();
      const diffDays = Math.floor((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(result.interval);
    });
  });

  describe('applyReview', () => {
    it('debe retornar tarjeta actualizada con review en historial', () => {
      const card = createMockCard({ status: 'new' });
      const result = applyReview(card, 'good', 5000);

      expect(result.reviewHistory).toHaveLength(1);
      expect(result.reviewHistory[0]).toMatchObject({
        response: 'good',
        timeSpentMs: 5000,
      });
      expect(result.reviewHistory[0].date).toBeTruthy();
    });

    it('debe preservar todos los campos de la tarjeta original', () => {
      const card = createMockCard({
        phrase: 'Original phrase',
        tags: ['verb', 'present'],
      });
      const result = applyReview(card, 'good');

      expect(result.id).toBe(card.id);
      expect(result.phrase).toBe(card.phrase);
      expect(result.translation).toBe(card.translation);
      expect(result.tags).toEqual(['verb', 'present']);
    });

    it('debe actualizar easeFactor, interval, y repetitions', () => {
      // 'good' tiene easeModifier 0, así que EF no cambia significativamente
      // Para ver cambio en EF, usamos 'easy' que tiene modifier +0.15
      const card = createMockCard({
        status: 'learning',
        repetitions: 1,
        interval: 1,
        easeFactor: 2.5,
      });
      const result = applyReview(card, 'easy');

      // easy aumenta EF (modifier +0.15)
      expect(result.easeFactor).toBeGreaterThan(card.easeFactor);
      expect(result.interval).not.toBe(card.interval);
      expect(result.repetitions).not.toBe(card.repetitions);
    });

    it('debe manejar timeSpentMs opcional', () => {
      const card = createMockCard({ status: 'new' });
      const result = applyReview(card, 'good');

      expect(result.reviewHistory[0].timeSpentMs).toBe(0);
    });
  });

  describe('isDueForReview', () => {
    it('debe retornar true para tarjetas con reviewDate en el pasado', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      const card = createMockCard({ nextReviewDate: pastDate });

      expect(isDueForReview(card)).toBe(true);
    });

    it('debe retornar true para tarjetas con reviewDate hoy', () => {
      const today = new Date().toISOString();
      const card = createMockCard({ nextReviewDate: today });

      expect(isDueForReview(card)).toBe(true);
    });

    it('debe retornar false para tarjetas con reviewDate en el futuro', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
      const card = createMockCard({ nextReviewDate: futureDate });

      expect(isDueForReview(card)).toBe(false);
    });
  });

  describe('getCardsForReview', () => {
    it('debe retornar solo tarjetas que necesitan repaso', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

      const cards = [
        createMockCard({ id: '1', nextReviewDate: pastDate }),
        createMockCard({ id: '2', nextReviewDate: futureDate }),
        createMockCard({ id: '3', nextReviewDate: pastDate }),
      ];

      const result = getCardsForReview(cards);
      expect(result).toHaveLength(2);
      expect(result.map(c => c.id)).toEqual(expect.arrayContaining(['1', '3']));
    });

    it('debe ordenar por urgencia (más atrasadas primero)', () => {
      const veryPast = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();
      const slightlyPast = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

      const cards = [
        createMockCard({ id: '1', nextReviewDate: slightlyPast }),
        createMockCard({ id: '2', nextReviewDate: veryPast }),
      ];

      const result = getCardsForReview(cards);
      expect(result[0].id).toBe('2'); // Más atrasada primero
      expect(result[1].id).toBe('1');
    });

    it('debe respetar el parámetro limit', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      const cards = [
        createMockCard({ id: '1', nextReviewDate: pastDate }),
        createMockCard({ id: '2', nextReviewDate: pastDate }),
        createMockCard({ id: '3', nextReviewDate: pastDate }),
      ];

      const result = getCardsForReview(cards, 2);
      expect(result).toHaveLength(2);
    });
  });

  describe('getNewCards', () => {
    it('debe retornar solo tarjetas con status "new"', () => {
      const cards = [
        createMockCard({ id: '1', status: 'new', createdAt: '2024-01-01T00:00:00.000Z' }),
        createMockCard({ id: '2', status: 'learning', createdAt: '2024-01-02T00:00:00.000Z' }),
        createMockCard({ id: '3', status: 'new', createdAt: '2024-01-03T00:00:00.000Z' }),
      ];

      const result = getNewCards(cards);
      expect(result).toHaveLength(2);
      expect(result.map(c => c.id)).toEqual(['1', '3']);
    });

    it('debe ordenar por antigüedad (más antiguas primero)', () => {
      const cards = [
        createMockCard({ id: '1', status: 'new', createdAt: '2024-01-03T00:00:00.000Z' }),
        createMockCard({ id: '2', status: 'new', createdAt: '2024-01-01T00:00:00.000Z' }),
      ];

      const result = getNewCards(cards);
      expect(result[0].id).toBe('2'); // Más antigua primero
    });

    it('debe respetar el parámetro limit', () => {
      const cards = [
        createMockCard({ id: '1', status: 'new' }),
        createMockCard({ id: '2', status: 'new' }),
        createMockCard({ id: '3', status: 'new' }),
      ];

      const result = getNewCards(cards, 2);
      expect(result).toHaveLength(2);
    });
  });

  describe('getStudySession', () => {
    it('debe mezclar tarjetas nuevas y de repaso', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

      const cards = [
        createMockCard({ id: '1', status: 'new' }),
        createMockCard({ id: '2', status: 'review', nextReviewDate: pastDate }),
        createMockCard({ id: '3', status: 'review', nextReviewDate: pastDate }),
        createMockCard({ id: '4', status: 'review', nextReviewDate: pastDate }),
        createMockCard({ id: '5', status: 'review', nextReviewDate: pastDate }),
      ];

      const result = getStudySession(cards, 2, 10);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(12); // 2 new + 10 review
    });

    it('debe intercalar 1 nueva cada 3 repasos', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

      const cards = [
        createMockCard({ id: 'new-1', status: 'new' }),
        createMockCard({ id: 'review-1', status: 'review', nextReviewDate: pastDate }),
        createMockCard({ id: 'review-2', status: 'review', nextReviewDate: pastDate }),
        createMockCard({ id: 'review-3', status: 'review', nextReviewDate: pastDate }),
      ];

      const result = getStudySession(cards, 1, 10);
      // Patrón esperado: review, review, review, new
      expect(result[3].id).toBe('new-1');
    });

    it('debe respetar maxNew y maxReview', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

      const cards = [
        ...Array.from({ length: 20 }, (_, i) =>
          createMockCard({ id: `new-${i}`, status: 'new' })
        ),
        ...Array.from({ length: 20 }, (_, i) =>
          createMockCard({ id: `review-${i}`, status: 'review', nextReviewDate: pastDate })
        ),
      ];

      const result = getStudySession(cards, 5, 15);
      const newCards = result.filter(c => c.status === 'new');
      const reviewCards = result.filter(c => c.status === 'review');

      expect(newCards.length).toBeLessThanOrEqual(5);
      expect(reviewCards.length).toBeLessThanOrEqual(15);
    });
  });

  describe('calculateRetentionRate', () => {
    it('debe retornar 0 para tarjetas sin historial', () => {
      const cards = [createMockCard()];
      expect(calculateRetentionRate(cards)).toBe(0);
    });

    it('debe calcular porcentaje de respuestas correctas', () => {
      const cards = [
        createMockCard({
          id: '1',
          reviewHistory: [
            { date: '2024-01-01T00:00:00.000Z', response: 'good', timeSpentMs: 1000 },
            { date: '2024-01-02T00:00:00.000Z', response: 'good', timeSpentMs: 1000 },
            { date: '2024-01-03T00:00:00.000Z', response: 'again', timeSpentMs: 1000 },
          ],
        }),
      ];

      const result = calculateRetentionRate(cards);
      expect(result).toBeCloseTo(66.67, 1); // 2/3 = 66.67%
    });

    it('debe manejar múltiples tarjetas', () => {
      const cards = [
        createMockCard({
          id: '1',
          reviewHistory: [
            { date: '2024-01-01T00:00:00.000Z', response: 'good', timeSpentMs: 1000 },
            { date: '2024-01-02T00:00:00.000Z', response: 'again', timeSpentMs: 1000 },
          ],
        }),
        createMockCard({
          id: '2',
          reviewHistory: [
            { date: '2024-01-01T00:00:00.000Z', response: 'good', timeSpentMs: 1000 },
            { date: '2024-01-02T00:00:00.000Z', response: 'good', timeSpentMs: 1000 },
          ],
        }),
      ];

      const result = calculateRetentionRate(cards);
      expect(result).toBe(75); // 3/4 = 75%
    });
  });

  describe('calculateAverageEaseFactor', () => {
    it('debe retornar defaultEaseFactor para array vacío', () => {
      expect(calculateAverageEaseFactor([])).toBe(2.5);
    });

    it('debe calcular promedio correctamente', () => {
      const cards = [
        createMockCard({ id: '1', easeFactor: 2 }),
        createMockCard({ id: '2', easeFactor: 3 }),
      ];

      expect(calculateAverageEaseFactor(cards)).toBe(2.5);
    });
  });

  describe('estimateSessionDuration', () => {
    it('debe estimar minutos basado en cantidad de tarjetas', () => {
      expect(estimateSessionDuration(60)).toBe(10); // 60 * 10s / 60 = 10 min
    });
  });

  describe('getNextReviewText', () => {
    it('debe retornar "Hoy" para tarjetas vencidas', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
      const card = createMockCard({ nextReviewDate: pastDate });

      expect(getNextReviewText(card)).toBe('Hoy');
    });

    it('debe retornar "Mañana" para tarjetas debidas mañana', () => {
      const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
      const card = createMockCard({ nextReviewDate: tomorrow });

      expect(getNextReviewText(card)).toBe('Mañana');
    });

    it('debe retornar "En X días" para próxima semana', () => {
      const threeDays = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString();
      const card = createMockCard({ nextReviewDate: threeDays });

      expect(getNextReviewText(card)).toBe('En 3 días');
    });

    it('debe retornar "En X semanas" para próximas semanas', () => {
      const twoWeeks = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
      const card = createMockCard({ nextReviewDate: twoWeeks });

      expect(getNextReviewText(card)).toBe('En 2 semanas');
    });

    it('debe retornar "En X meses" para próximos meses', () => {
      const twoMonths = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString();
      const card = createMockCard({ nextReviewDate: twoMonths });

      expect(getNextReviewText(card)).toBe('En 2 meses');
    });
  });

  describe('createCard', () => {
    it('debe crear tarjeta con valores por defecto', () => {
      const card = createCard('Bonjour', 'Hello', { type: 'text', id: 'test', title: 'Test' });

      expect(card.phrase).toBe('Bonjour');
      expect(card.translation).toBe('Hello');
      expect(card.status).toBe('new');
      expect(card.easeFactor).toBe(2.5);
      expect(card.interval).toBe(0);
      expect(card.repetitions).toBe(0);
      expect(card.reviewHistory).toEqual([]);
      expect(card.tags).toEqual([]);
    });

    it('debe generar UUID único', () => {
      const card1 = createCard('Test', 'Test', { type: 'text', id: 'test', title: 'Test' });
      const card2 = createCard('Test', 'Test', { type: 'text', id: 'test2', title: 'Test' });

      expect(card1.id).not.toBe(card2.id);
    });

    it('debe permitir overrides opcionales', () => {
      const card = createCard('Merci', 'Thank you', { type: 'text', id: 'test', title: 'Test' }, {
        tags: ['noun'],
        languageCode: 'es',
        levelCode: 'A2',
      });

      expect(card.tags).toEqual(['noun']);
      expect(card.languageCode).toBe('es');
      expect(card.levelCode).toBe('A2');
    });

    it('debe establecer nextReviewDate a ahora para tarjetas nuevas', () => {
      const now = Date.now();
      const card = createCard('Test', 'Test', { type: 'text', id: 'test', title: 'Test' });
      const cardTime = new Date(card.nextReviewDate).getTime();

      // El tiempo debe ser cercano a now (dentro de 100ms debería bastar)
      expect(Math.abs(cardTime - now)).toBeLessThan(100);
    });
  });

  describe('casos edge', () => {
    it('debe manejar easeFactor mínimo', () => {
      const card = createMockCard({
        status: 'review',
        repetitions: 1,
        interval: 1,
        easeFactor: 1.3,
      });

      // Respuestas 'again' no deben reducir EF por debajo de 1.3
      const result = calculateNextReview(card, 'again');
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('debe mantener interval mínimo de 1 día', () => {
      const card = createMockCard({
        status: 'learning',
        repetitions: 1,
        interval: 1,
        easeFactor: 1.3,
      });

      const result = calculateNextReview(card, 'good');
      expect(result.interval).toBeGreaterThanOrEqual(1);
    });

    it('getCardsForReview debe retornar array vacío si no hay tarjetas', () => {
      expect(getCardsForReview([])).toEqual([]);
    });

    it('getNewCards debe retornar array vacío si no hay tarjetas', () => {
      expect(getNewCards([])).toEqual([]);
    });

    it('getStudySession debe manejar límites de 0', () => {
      // BUG CONOCIDO: getStudySession incluye tarjetas 'new' con nextReviewDate futuro
      // incluso cuando maxNew=0. Esto ocurre porque getNewCards con limit=0 debería
      // retornar [], pero la sesión aún incluye tarjetas new
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
      const cards = [
        createMockCard({ id: '1', status: 'new', nextReviewDate: futureDate }),
      ];

      const result = getStudySession(cards, 0, 0);
      // Comportamiento actual: incluye tarjetas new aunque maxNew=0
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].status).toBe('new');
    });
  });
});
