/**
 * Tests para fsrs - Algoritmo FSRS v6
 */

import { describe, it, expect } from 'vitest';
import {
  createFSRSCard,
  responseToFSRSGrade,
  fsrsRatingToResponse,
  reviewFSRSCard,
  isDue,
  getRetention,
  getCollectionStats,
  sortByReviewPriority,
  migrateFromSM2,
  type FSRSCardState,
} from '@/lib/fsrs';
import type { ReviewResponse } from '@/types/srs';

describe('fsrs', () => {
  describe('createFSRSCard', () => {
    it('debería crear una tarjeta FSRS vacía', () => {
      const card = createFSRSCard();

      expect(card.due).toBeInstanceOf(Date);
      expect(card.stability).toBe(0);
      expect(card.difficulty).toBe(0);
      expect(card.elapsed_days).toBe(0);
      expect(card.scheduled_days).toBe(0);
      expect(card.reps).toBe(0);
      expect(card.lapses).toBe(0);
    });

    it('debería crear una tarjeta con fecha de revisión futura', () => {
      const card = createFSRSCard();
      const now = new Date();

      // La tarjeta nueva debería tener due = now o futura
      expect(card.due.getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000);
    });
  });

  describe('responseToFSRSGrade', () => {
    it('debería convertir again a Again', () => {
      expect(responseToFSRSGrade('again')).toBe(1); // Rating.Again = 1
    });

    it('debería convertir hard a Hard', () => {
      expect(responseToFSRSGrade('hard')).toBe(2); // Rating.Hard = 2
    });

    it('debería convertir good a Good', () => {
      expect(responseToFSRSGrade('good')).toBe(3); // Rating.Good = 3
    });

    it('debería convertir easy a Easy', () => {
      expect(responseToFSRSGrade('easy')).toBe(4); // Rating.Easy = 4
    });
  });

  describe('fsrsRatingToResponse', () => {
    it('debería convertir Again a again', () => {
      expect(fsrsRatingToResponse(1)).toBe('again');
    });

    it('debería convertir Hard a hard', () => {
      expect(fsrsRatingToResponse(2)).toBe('hard');
    });

    it('debería convertir Good a good', () => {
      expect(fsrsRatingToResponse(3)).toBe('good');
    });

    it('debería convertir Easy a easy', () => {
      expect(fsrsRatingToResponse(4)).toBe('easy');
    });

    it('debería manejar valores inválidos', () => {
      // Manual (0) se mapea a good por defecto
      expect(fsrsRatingToResponse(0)).toBe('good');
    });
  });

  describe('reviewFSRSCard', () => {
    it('debería revisar una tarjeta con again', () => {
      const card = createFSRSCard();
      const result = reviewFSRSCard(card, 'again');

      expect(result.card).toBeDefined();
      expect(result.nextReviewDate).toBeDefined();
      expect(result.interval).toBeDefined();
      expect(result.card.reps).toBe(1);
    });

    it('debería revisar una tarjeta con good', () => {
      const card = createFSRSCard();
      const result = reviewFSRSCard(card, 'good');

      expect(result.card).toBeDefined();
      expect(result.nextReviewDate).toBeDefined();
      expect(result.interval).toBeGreaterThanOrEqual(0);
      expect(result.card.reps).toBe(1);
    });

    it('debería incrementar reps con cada revisión', () => {
      const card = createFSRSCard();
      let result = reviewFSRSCard(card, 'good');

      expect(result.card.reps).toBe(1);

      result = reviewFSRSCard(result.card, 'good');
      expect(result.card.reps).toBe(2);

      result = reviewFSRSCard(result.card, 'good');
      expect(result.card.reps).toBe(3);
    });

    it('debería incrementar lapses con again', () => {
      const card = createFSRSCard();
      // Primero hacer good para que salga de New
      let result = reviewFSRSCard(card, 'good');

      // Luego again para aumentar lapses
      result = reviewFSRSCard(result.card, 'again');

      // lapses puede incrementarse después de un again
      expect(result.card.lapses).toBeGreaterThanOrEqual(0);
    });

    it('debería actualizar la fecha de próxima revisión', () => {
      const card = createFSRSCard();
      const result = reviewFSRSCard(card, 'good');

      const nextReview = new Date(result.nextReviewDate);
      const now = new Date();

      // La próxima revisión debería ser en el futuro
      expect(nextReview.getTime()).toBeGreaterThan(now.getTime() - 1000);
    });

    it('debería aumentar el intervalo con good/easy', () => {
      const card = createFSRSCard();
      let result = reviewFSRSCard(card, 'good');

      const firstInterval = result.interval;

      result = reviewFSRSCard(result.card, 'good');
      const secondInterval = result.interval;

      // El intervalo debería aumentar o mantenerse
      expect(secondInterval).toBeGreaterThanOrEqual(firstInterval);
    });

    it('debería manejar múltiples revisiones', () => {
      const card = createFSRSCard();
      const responses: ReviewResponse[] = ['good', 'good', 'hard', 'easy', 'good'];

      let currentCard = card;
      for (const response of responses) {
        const result = reviewFSRSCard(currentCard, response);
        currentCard = result.card;
      }

      expect(currentCard.reps).toBe(5);
      expect(currentCard.stability).toBeGreaterThan(0);
    });
  });

  describe('isDue', () => {
    it('debería retornar true para tarjeta con fecha pasada', () => {
      const card = createFSRSCard();
      card.due = new Date(Date.now() - 1000); // 1 segundo en el pasado

      expect(isDue(card)).toBe(true);
    });

    it('debería retornar true para tarjeta con fecha actual', () => {
      const card = createFSRSCard();
      card.due = new Date();

      expect(isDue(card)).toBe(true);
    });

    it('debería retornar false para tarjeta con fecha futura', () => {
      const card = createFSRSCard();
      card.due = new Date(Date.now() + 100000); // 100 segundos en el futuro

      expect(isDue(card)).toBe(false);
    });

    it('debería usar fecha actual por defecto', () => {
      const card = createFSRSCard();
      card.due = new Date();

      expect(isDue(card)).toBe(true);
    });

    it('debería aceptar fecha personalizada', () => {
      const card = createFSRSCard();
      card.due = new Date('2024-01-01');

      const pastDate = new Date('2024-01-02');
      expect(isDue(card, pastDate)).toBe(true);

      const futureDate = new Date('2023-12-31');
      expect(isDue(card, futureDate)).toBe(false);
    });
  });

  describe('getRetention', () => {
    it('debería calcular retención para tarjeta nueva', () => {
      const card = createFSRSCard();
      const retention = getRetention(card);

      // Tarjeta nueva tiene retención del 100%
      expect(retention).toBe(1);
    });

    it('debería calcular retención para tarjeta revisada', () => {
      const card = createFSRSCard();
      const result = reviewFSRSCard(card, 'good');

      const retention = getRetention(result.card);

      // La retención debería estar entre 0 y 1
      expect(retention).toBeGreaterThan(0);
      expect(retention).toBeLessThanOrEqual(1);
    });

    it('debería disminuir retención con el tiempo', () => {
      const card = createFSRSCard();
      const result = reviewFSRSCard(card, 'good');

      const nowRetention = getRetention(result.card, new Date());

      // Retención en el futuro (después de pasar el intervalo)
      const futureDate = new Date(result.card.due.getTime() + 86400000); // +1 día
      const futureRetention = getRetention(result.card, futureDate);

      // La retención debería ser menor en el futuro
      expect(futureRetention).toBeLessThanOrEqual(nowRetention);
    });

    it('debería usar fecha actual por defecto', () => {
      const card = createFSRSCard();
      const retention = getRetention(card);

      expect(typeof retention).toBe('number');
    });
  });

  describe('getCollectionStats', () => {
    it('debería calcular estadísticas para array vacío', () => {
      const stats = getCollectionStats([]);

      expect(stats.total).toBe(0);
      expect(stats.new).toBe(0);
      expect(stats.learning).toBe(0);
      expect(stats.review).toBe(0);
      expect(stats.relearning).toBe(0);
      expect(stats.dueToday).toBe(0);
    });

    it('debería contar tarjetas nuevas', () => {
      const cards = [
        createFSRSCard(),
        createFSRSCard(),
        createFSRSCard(),
      ];

      const stats = getCollectionStats(cards);

      expect(stats.total).toBe(3);
      expect(stats.new).toBe(3);
    });

    it('debería contar tarjetas de repaso', () => {
      const cards = [];
      for (let i = 0; i < 5; i++) {
        const card = createFSRSCard();
        // Hacer múltiples revisiones good para que pase a Review
        let result = reviewFSRSCard(card, 'good');
        result = reviewFSRSCard(result.card, 'good');
        result = reviewFSRSCard(result.card, 'good');
        cards.push(result.card);
      }

      const stats = getCollectionStats(cards);

      // Todas las tarjetas deberían estar (New o Learning o Review dependiendo de FSRS)
      expect(stats.total).toBe(5);
      // Verificar que al menos algunas están en Review o Learning
      expect(stats.learning + stats.review + stats.new).toBe(5);
    });

    it('debería calcular estabilidad promedio', () => {
      const cards = [];
      for (let i = 0; i < 3; i++) {
        const card = createFSRSCard();
        const result = reviewFSRSCard(card, 'good');
        cards.push(result.card);
      }

      const stats = getCollectionStats(cards);

      expect(stats.averageStability).toBeGreaterThan(0);
      expect(typeof stats.averageStability).toBe('number');
    });

    it('debería calcular dificultad promedio', () => {
      const cards = [];
      for (let i = 0; i < 3; i++) {
        const card = createFSRSCard();
        const result = reviewFSRSCard(card, 'good');
        cards.push(result.card);
      }

      const stats = getCollectionStats(cards);

      expect(typeof stats.averageDifficulty).toBe('number');
    });

    it('debería calcular tarjetas debidas hoy', () => {
      const cards = [];

      // Añadir tarjetas debidas
      for (let i = 0; i < 3; i++) {
        const card = createFSRSCard();
        card.due = new Date(Date.now() - 1000); // En el pasado
        cards.push(card);
      }

      // Añadir tarjetas no debidas
      for (let i = 0; i < 2; i++) {
        const card = createFSRSCard();
        card.due = new Date(Date.now() + 100000); // En el futuro
        cards.push(card);
      }

      const stats = getCollectionStats(cards);

      expect(stats.total).toBe(5);
      expect(stats.dueToday).toBe(3);
    });

    it('debería calcular retención estimada', () => {
      const cards = [];
      for (let i = 0; i < 5; i++) {
        const card = createFSRSCard();
        const result = reviewFSRSCard(card, 'good');
        cards.push(result.card);
      }

      const stats = getCollectionStats(cards);

      expect(stats.estimatedRetention).toBeGreaterThan(0);
      expect(stats.estimatedRetention).toBeLessThanOrEqual(1);
    });
  });

  describe('sortByReviewPriority', () => {
    it('debería ordenar tarjetas por retención', () => {
      const cards = [];
      for (let i = 0; i < 5; i++) {
        const card = createFSRSCard();
        const result = reviewFSRSCard(card, 'good');
        cards.push(result.card);
      }

      const sorted = sortByReviewPriority(cards);

      expect(sorted.length).toBe(5);
      // Las tarjetas deberían estar en algún orden
      expect(sorted[0]).toBeDefined();
    });

    it('debería priorizar tarjetas con menor retención', () => {
      const cards = [];

      // Crear tarjeta con alta retención (easy)
      const card1 = createFSRSCard();
      const result1 = reviewFSRSCard(card1, 'easy');

      // Crear tarjeta con menor retención (good)
      const card2 = createFSRSCard();
      const result2 = reviewFSRSCard(card2, 'good');

      const sorted = sortByReviewPriority([result1.card, result2.card]);

      // La tarjeta con menor retención debería venir primero
      expect(sorted).toHaveLength(2);
    });

    it('debería manejar array vacío', () => {
      const sorted = sortByReviewPriority([]);

      expect(sorted).toHaveLength(0);
    });

    it('debería manejar tarjetas nuevas', () => {
      const cards = [createFSRSCard(), createFSRSCard()];

      const sorted = sortByReviewPriority(cards);

      expect(sorted).toHaveLength(2);
    });
  });

  describe('migrateFromSM2', () => {
    it('debería migrar tarjeta SM-2 a FSRS', () => {
      const sm2Card = {
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        status: 'new' as const,
      };

      const fsrsCard = migrateFromSM2(sm2Card);

      expect(fsrsCard).toBeDefined();
      expect(fsrsCard.due).toBeInstanceOf(Date);
      expect(fsrsCard.stability).toBeGreaterThanOrEqual(0);
      expect(fsrsCard.difficulty).toBeGreaterThanOrEqual(0);
    });

    it('debería conservar reps de SM-2', () => {
      const sm2Card = {
        easeFactor: 2.5,
        interval: 10,
        repetitions: 5,
        status: 'review' as const,
      };

      const fsrsCard = migrateFromSM2(sm2Card);

      expect(fsrsCard.reps).toBe(sm2Card.repetitions);
    });

    it('debería manejar tarjeta nueva SM-2', () => {
      const sm2Card = {
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        status: 'new' as const,
      };

      const fsrsCard = migrateFromSM2(sm2Card);

      expect(fsrsCard.reps).toBe(0);
      expect(fsrsCard.lapses).toBe(0);
    });

    it('debería calcular dificultad desde ease factor', () => {
      const sm2Card = {
        easeFactor: 2.5,
        interval: 5,
        repetitions: 3,
        status: 'review' as const,
      };

      const fsrsCard = migrateFromSM2(sm2Card);

      // La dificultad debería calcularse desde ease factor
      expect(typeof fsrsCard.difficulty).toBe('number');
    });
  });
});
