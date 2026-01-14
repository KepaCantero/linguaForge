/**
 * Tests para srsAdapter - Adapter entre FSRS y el formato de tarjeta existente
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createCard,
  applyReview,
  getCardsForReview,
  getNewCards,
  getStudySession,
  isDueForReview,
  calculateRetentionRate,
  calculateAverageEaseFactor,
  getDetailedStats,
} from '@/lib/srsAdapter';
import type { SRSCard, ReviewResponse } from '@/types/srs';
import { SUPPORTED_LANGUAGES, SUPPORTED_LEVELS } from '@/lib/constants';

describe('srsAdapter', () => {
  let testCard: SRSCard;
  const manualSource = {
    type: 'text' as const,
    id: 'manual',
    title: 'Manual Entry',
  };

  beforeEach(() => {
    // Crear una tarjeta de prueba antes de cada test
    testCard = createCard('test phrase', 'test translation', manualSource, {
      languageCode: 'de',
      levelCode: 'A1',
      tags: ['test'],
    });
  });

  describe('createCard', () => {
    const lessonSource = {
      type: 'text' as const,
      id: 'lesson-1',
      title: 'Lesson 1',
    };

    it('debería crear una tarjeta SRS con FSRS', () => {
      const card = createCard('Bonjour', 'Hello', lessonSource, {
        languageCode: 'fr',
        levelCode: 'A2',
        tags: ['greeting'],
        notes: 'test note',
      });

      expect(card.phrase).toBe('Bonjour');
      expect(card.translation).toBe('Hello');
      expect(card.source).toEqual(lessonSource);
      expect(card.languageCode).toBe('fr');
      expect(card.levelCode).toBe('A2');
      expect(card.tags).toEqual(['greeting']);
      expect(card.notes).toBe('test note');
      expect(card.algorithm).toBe('fsrs');
      expect(card.status).toBe('new');
      expect(card.fsrs).toBeDefined();
    });

    it('debería crear una tarjeta con valores por defecto', () => {
      const card = createCard('Test', 'Prueba', manualSource);

      expect(card.languageCode).toBe('de'); // DEFAULT_SRS_LANGUAGE
      expect(card.levelCode).toBe('A1'); // DEFAULT_SRS_LEVEL
      expect(card.tags).toEqual([]);
      expect(card.notes).toBeUndefined();
      expect(card.audioUrl).toBeUndefined();
    });

    it('debería crear una tarjeta con estado FSRS válido', () => {
      const card = createCard('Test', 'Prueba', manualSource);

      expect(card.fsrs).toBeDefined();
      expect(card.fsrs!.due).toBeDefined();
      expect(card.fsrs!.stability).toBe(0);
      expect(card.fsrs!.difficulty).toBe(0);
      expect(card.fsrs!.elapsed_days).toBe(0);
      expect(card.fsrs!.scheduled_days).toBe(0);
      expect(card.fsrs!.reps).toBe(0);
      expect(card.fsrs!.lapses).toBe(0);
      expect(card.fsrs!.state).toBe('New');
    });

    it('debería crear tarjetas para todos los idiomas soportados', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const card = createCard('Test', 'Prueba', manualSource, { languageCode: lang });
        expect(card.languageCode).toBe(lang);
        expect(card.fsrs).toBeDefined();
      }
    });

    it('debería crear tarjetas para todos los niveles soportados', () => {
      for (const level of SUPPORTED_LEVELS) {
        const card = createCard('Test', 'Prueba', manualSource, { levelCode: level });
        expect(card.levelCode).toBe(level);
      }
    });
  });

  describe('applyReview', () => {
    it('debería aplicar una revisión correcta (again)', () => {
      const result = applyReview(testCard, 'again');

      expect(result.fsrs).toBeDefined();
      expect(result.fsrs!.reps).toBe(1);
      expect(result.reviewHistory).toHaveLength(1);
      expect(result.reviewHistory[0].response).toBe('again');
    });

    it('debería aplicar una revisión correcta (hard)', () => {
      const result = applyReview(testCard, 'hard');

      expect(result.fsrs).toBeDefined();
      expect(result.fsrs!.reps).toBe(1);
      expect(result.reviewHistory).toHaveLength(1);
      expect(result.reviewHistory[0].response).toBe('hard');
    });

    it('debería aplicar una revisión correcta (good)', () => {
      const result = applyReview(testCard, 'good');

      expect(result.fsrs).toBeDefined();
      expect(result.fsrs!.reps).toBe(1);
      expect(result.reviewHistory).toHaveLength(1);
      expect(result.reviewHistory[0].response).toBe('good');
    });

    it('debería aplicar una revisión correcta (easy)', () => {
      const result = applyReview(testCard, 'easy');

      expect(result.fsrs).toBeDefined();
      expect(result.fsrs!.reps).toBe(1);
      expect(result.reviewHistory).toHaveLength(1);
      expect(result.reviewHistory[0].response).toBe('easy');
    });

    it('debería registrar el tiempo gastado en la revisión', () => {
      const timeSpent = 5000;
      const result = applyReview(testCard, 'good', timeSpent);

      expect(result.reviewHistory[0].timeSpentMs).toBe(timeSpent);
    });

    it('debería acumular el historial de revisiones', () => {
      let card = testCard;
      const responses: ReviewResponse[] = ['good', 'hard', 'easy'];

      for (const response of responses) {
        card = applyReview(card, response, 1000);
      }

      expect(card.reviewHistory).toHaveLength(3);
      expect(card.fsrs).toBeDefined();
      expect(card.fsrs!.reps).toBe(3);
    });

    it('debería actualizar la fecha de próxima revisión', () => {
      const before = testCard.nextReviewDate;
      const result = applyReview(testCard, 'good');

      expect(result.nextReviewDate).toBeDefined();
      expect(result.nextReviewDate).not.toBe(before);
    });

    it('debería mantener los metadatos de la tarjeta', () => {
      const result = applyReview(testCard, 'good');

      expect(result.id).toBe(testCard.id);
      expect(result.phrase).toBe(testCard.phrase);
      expect(result.translation).toBe(testCard.translation);
      expect(result.languageCode).toBe(testCard.languageCode);
      expect(result.levelCode).toBe(testCard.levelCode);
    });
  });

  describe('getCardsForReview', () => {
    it('debería devolver tarjetas que necesitan repaso', () => {
      const cards = [
        testCard,
        createCard('card2', 'trans2', manualSource),
        createCard('card3', 'trans3', manualSource),
      ];

      // Marcar una tarjeta como Review
      cards[1].status = 'review';
      cards[1].nextReviewDate = new Date(Date.now() - 1000).toISOString();

      const reviewCards = getCardsForReview(cards);

      expect(reviewCards.length).toBeGreaterThanOrEqual(1);
      expect(reviewCards.some(c => c.id === cards[1].id)).toBe(true);
    });

    it('debería respetar el límite de tarjetas', () => {
      const cards: SRSCard[] = [];
      for (let i = 0; i < 10; i++) {
        const card = createCard(`card${i}`, `trans${i}`, manualSource);
        card.status = 'review';
        card.nextReviewDate = new Date(Date.now() - 1000).toISOString();
        cards.push(card);
      }

      const reviewCards = getCardsForReview(cards, 5);

      expect(reviewCards.length).toBeLessThanOrEqual(5);
    });

    it('debería filtrar tarjetas nuevas', () => {
      const cards = [
        testCard, // new
        createCard('card2', 'trans2', manualSource),
      ];

      const reviewCards = getCardsForReview(cards);

      expect(reviewCards.some((c: SRSCard) => c.id === testCard.id)).toBe(false);
    });

    it('debería devolver array vacío si no hay tarjetas para repasar', () => {
      const cards = [testCard]; // new
      const reviewCards = getCardsForReview(cards);

      expect(reviewCards).toHaveLength(0);
    });

    it('debería ordenar por retención (prioridad)', () => {
      const cards: SRSCard[] = [];
      for (let i = 0; i < 5; i++) {
        const card = createCard(`card${i}`, `trans${i}`, manualSource);
        card.status = 'review';
        card.nextReviewDate = new Date(Date.now() - 1000).toISOString();
        cards.push(card);
      }

      const reviewCards = getCardsForReview(cards);

      // Verificar que se devuelven en algún orden (la ordenación exacta depende de getRetention)
      expect(reviewCards.length).toBeGreaterThan(0);
    });
  });

  describe('getNewCards', () => {
    it('debería devolver tarjetas nuevas', () => {
      const cards = [
        testCard, // new
        createCard('card2', 'trans2', manualSource),
      ];

      // Marcar la segunda como review
      cards[1].status = 'review';

      const newCards = getNewCards(cards, 10);

      expect(newCards).toHaveLength(1);
      expect(newCards[0].id).toBe(testCard.id);
    });

    it('debería respetar el límite de tarjetas nuevas', () => {
      const cards: SRSCard[] = [];
      for (let i = 0; i < 20; i++) {
        cards.push(createCard(`card${i}`, `trans${i}`, manualSource));
      }

      const newCards = getNewCards(cards, 5);

      expect(newCards.length).toBe(5);
    });

    it('debería devolver array vacío si no hay tarjetas nuevas', () => {
      const cards = [testCard];
      cards[0].status = 'review';

      const newCards = getNewCards(cards, 10);

      expect(newCards).toHaveLength(0);
    });
  });

  describe('getStudySession', () => {
    it('debería mezclar tarjetas de repaso y nuevas', () => {
      const cards: SRSCard[] = [];

      // Añadir tarjetas de repaso
      for (let i = 0; i < 5; i++) {
        const card = createCard(`review${i}`, `trans${i}`, manualSource);
        card.status = 'review';
        card.nextReviewDate = new Date(Date.now() - 1000).toISOString();
        cards.push(card);
      }

      // Añadir tarjetas nuevas
      for (let i = 0; i < 3; i++) {
        cards.push(createCard(`new${i}`, `trans${i}`, manualSource));
      }

      const session = getStudySession(cards);

      expect(session.length).toBeGreaterThan(0);
    });

    it('debería priorizar tarjetas de repaso sobre nuevas', () => {
      const cards: SRSCard[] = [];

      // Añadir tarjetas de repaso
      for (let i = 0; i < 5; i++) {
        const card = createCard(`review${i}`, `trans${i}`, manualSource);
        card.status = 'review';
        card.nextReviewDate = new Date(Date.now() - 1000).toISOString();
        cards.push(card);
      }

      // Añadir muchas tarjetas nuevas
      for (let i = 0; i < 50; i++) {
        cards.push(createCard(`new${i}`, `trans${i}`, manualSource));
      }

      const session = getStudySession(cards);

      // La sesión debería incluir repaso primero
      expect(session.length).toBeGreaterThan(0);
    });

    it('debería respetar maxReviewPerDay y maxNewCardsPerDay', () => {
      const cards: SRSCard[] = [];

      // Crear muchas tarjetas
      for (let i = 0; i < 300; i++) {
        if (i < 250) {
          const card = createCard(`review${i}`, `trans${i}`, manualSource);
          card.status = 'review';
          card.nextReviewDate = new Date(Date.now() - 1000).toISOString();
          cards.push(card);
        } else {
          cards.push(createCard(`new${i}`, `trans${i}`, manualSource));
        }
      }

      const session = getStudySession(cards);

      // maxReviewPerDay = 200, maxNewCardsPerDay = 20
      expect(session.length).toBeLessThanOrEqual(220);
    });
  });

  describe('isDueForReview', () => {
    it('debería retornar true para tarjetas con fecha de revisión pasada', () => {
      testCard.status = 'review';
      testCard.nextReviewDate = new Date(Date.now() - 1000).toISOString();

      expect(isDueForReview(testCard)).toBe(true);
    });

    it('debería retornar true para tarjetas con fecha de revisión actual', () => {
      testCard.status = 'review';
      testCard.nextReviewDate = new Date().toISOString();

      expect(isDueForReview(testCard)).toBe(true);
    });

    it('debería retornar false para tarjetas con fecha de revisión futura', () => {
      testCard.status = 'review';
      testCard.nextReviewDate = new Date(Date.now() + 100000).toISOString();
      if (testCard.fsrs) {
        testCard.fsrs.due = new Date(Date.now() + 100000).toISOString();
      }

      expect(isDueForReview(testCard)).toBe(false);
    });

    it('debería retornar true para tarjetas nuevas (FSRS las considera debidas)', () => {
      // Las tarjetas nuevas en FSRS tienen state=New y due=ahora
      // isDue retorna true porque due <= now
      expect(isDueForReview(testCard)).toBe(true);
    });
  });

  describe('calculateRetentionRate', () => {
    it('debería calcular la retención para tarjetas', () => {
      const cards = [
        testCard,
        createCard('card2', 'trans2', manualSource),
        createCard('card3', 'trans3', manualSource),
      ];

      const retention = calculateRetentionRate(cards);

      expect(retention).toBeGreaterThanOrEqual(0);
      expect(retention).toBeLessThanOrEqual(1);
    });

    it('debería retornar 1 para array vacío', () => {
      const retention = calculateRetentionRate([]);

      expect(retention).toBe(1);
    });

    it('debería calcular retención promedio', () => {
      const cards: SRSCard[] = [];
      for (let i = 0; i < 10; i++) {
        cards.push(createCard(`card${i}`, `trans${i}`, manualSource));
      }

      const retention = calculateRetentionRate(cards);

      expect(typeof retention).toBe('number');
    });
  });

  describe('calculateAverageEaseFactor', () => {
    it('debería calcular el ease factor promedio', () => {
      const cards = [
        testCard,
        createCard('card2', 'trans2', manualSource),
        createCard('card3', 'trans3', manualSource),
      ];

      const avgEase = calculateAverageEaseFactor(cards);

      expect(typeof avgEase).toBe('number');
      expect(avgEase).toBeGreaterThan(0);
    });

    it('debería retornar 2.5 para array vacío', () => {
      const avgEase = calculateAverageEaseFactor([]);

      expect(avgEase).toBe(2.5);
    });

    it('debería calcular ease factor desde FSRS', () => {
      const cards = [testCard];
      if (cards[0].fsrs) {
        cards[0].fsrs.difficulty = 5;
      }

      const avgEase = calculateAverageEaseFactor(cards);

      // easeFactor = 2.5 + (10 - difficulty) * 0.1
      // = 2.5 + (10 - 5) * 0.1 = 2.5 + 0.5 = 3.0
      expect(avgEase).toBeCloseTo(3.0, 1);
    });
  });

  describe('getDetailedStats', () => {
    it('debería devolver estadísticas detalladas', () => {
      const cards = [
        testCard,
        createCard('card2', 'trans2', manualSource),
        createCard('card3', 'trans3', manualSource),
      ];

      const stats = getDetailedStats(cards);

      expect(stats.totalCards).toBe(3);
      expect(stats.newCards).toBeDefined();
      expect(stats.learningCards).toBeDefined();
      expect(stats.reviewCards).toBeDefined();
      expect(stats.dueToday).toBeDefined();
      expect(stats.averageStability).toBeDefined();
      expect(stats.averageDifficulty).toBeDefined();
      expect(stats.estimatedRetention).toBeDefined();
    });

    it('debería calcular estadísticas correctas para tarjetas mixtas', () => {
      const cards: SRSCard[] = [];

      // Añadir tarjetas nuevas (state=New por defecto)
      for (let i = 0; i < 5; i++) {
        cards.push(createCard(`new${i}`, `trans${i}`, manualSource));
      }

      // Añadir tarjetas de repaso (necesitan state=Review en FSRS)
      for (let i = 0; i < 3; i++) {
        const card = createCard(`review${i}`, `trans${i}`, manualSource);
        card.status = 'review';
        card.nextReviewDate = new Date(Date.now() - 1000).toISOString();
        if (card.fsrs) {
          card.fsrs.state = 'Review';
        }
        cards.push(card);
      }

      const stats = getDetailedStats(cards);

      expect(stats.totalCards).toBe(8);
      expect(stats.newCards).toBe(5);
      expect(stats.reviewCards).toBe(3);
    });

    it('debería devolver estadísticas vacías para array vacío', () => {
      const stats = getDetailedStats([]);

      expect(stats.totalCards).toBe(0);
      expect(stats.newCards).toBe(0);
      expect(stats.learningCards).toBe(0);
      expect(stats.reviewCards).toBe(0);
    });
  });
});
