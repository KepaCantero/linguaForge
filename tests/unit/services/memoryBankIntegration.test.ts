/**
 * Tests para Memory Bank Integration Service
 * TAREA 2.8.7: Tests para componentes Memory Bank
 */

import { describe, it, expect } from 'vitest';
import {
  getConfigForLevel,
  generateMemoryBankWorkout,
  calculateRewards,
  generateMemoryBankMission,
  shouldSuggestMemoryBank,
  sessionMetricsToMissionProgress,
  getMemoryBankStats,
  type MemoryBankMissionConfig,
} from '@/services/memoryBankIntegration';
import type { MemoryBankCard, SessionMetrics } from '@/components/exercises/MemoryBank/MemoryBankSession';

describe('memoryBankIntegration', () => {
  // Helper para crear cards de prueba
  const createTestCards = (count: number): MemoryBankCard[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `card-${i}`,
      front: { text: `Front ${i}` },
      back: { text: `Back ${i}` },
      context: 'vocabulary' as const,
      reviewCount: 0,
      lastReviewedAt: undefined,
    }));
  };

  // Helper para crear métricas de sesión
  const createSessionMetrics = (overrides: Partial<SessionMetrics> = {}): SessionMetrics => ({
    totalCards: 10,
    cardsReviewed: 10,
    correctAnswers: 8,
    incorrectAnswers: 2,
    averageResponseTime: 2500,
    sessionDuration: 300,
    accuracy: 80,
    ...overrides,
  });

  describe('getConfigForLevel', () => {
    it('debe retornar configuración para nivel 1', () => {
      const config = getConfigForLevel(1);
      expect(config.minCards).toBe(5);
      expect(config.maxCards).toBe(10);
      expect(config.targetAccuracy).toBe(60);
    });

    it('debe retornar configuración para nivel 5', () => {
      const config = getConfigForLevel(5);
      expect(config.minCards).toBe(15);
      expect(config.maxCards).toBe(20);
      expect(config.targetAccuracy).toBe(75);
    });

    it('debe retornar configuración para nivel 10', () => {
      const config = getConfigForLevel(10);
      expect(config.minCards).toBe(28);
      expect(config.maxCards).toBe(35);
      expect(config.targetAccuracy).toBe(85);
    });

    it('debe limitar niveles menores a 1', () => {
      const config = getConfigForLevel(0);
      expect(config).toEqual(getConfigForLevel(1));
    });

    it('debe limitar niveles mayores a 10', () => {
      const config = getConfigForLevel(15);
      expect(config).toEqual(getConfigForLevel(10));
    });

    it('la configuración debe tener todas las propiedades requeridas', () => {
      for (let level = 1; level <= 10; level++) {
        const config = getConfigForLevel(level);
        expect(config.minCards).toBeDefined();
        expect(config.maxCards).toBeDefined();
        expect(config.targetAccuracy).toBeDefined();
        expect(config.xpPerCard).toBeDefined();
        expect(config.bonusThreshold).toBeDefined();
        expect(config.bonusMultiplier).toBeDefined();
      }
    });

    it('minCards debe ser menor o igual a maxCards', () => {
      for (let level = 1; level <= 10; level++) {
        const config = getConfigForLevel(level);
        expect(config.minCards).toBeLessThanOrEqual(config.maxCards);
      }
    });
  });

  describe('generateMemoryBankWorkout', () => {
    it('debe generar workout con cards válidas', () => {
      const cards = createTestCards(20);
      const workout = generateMemoryBankWorkout(cards, 5);

      expect(workout.id).toMatch(/^mb-workout-/);
      expect(workout.cards.length).toBeGreaterThan(0);
      expect(workout.cards.length).toBeLessThanOrEqual(20);
      expect(workout.context).toBeDefined();
      expect(workout.config).toBeDefined();
    });

    it('debe respetar límites de cards según nivel', () => {
      const cards = createTestCards(50);
      const config = getConfigForLevel(3);
      const workout = generateMemoryBankWorkout(cards, 3);

      expect(workout.cards.length).toBeGreaterThanOrEqual(config.minCards);
      expect(workout.cards.length).toBeLessThanOrEqual(config.maxCards);
    });

    it('debe manejar menos cards de las mínimas', () => {
      const cards = createTestCards(3);
      const workout = generateMemoryBankWorkout(cards, 5);

      expect(workout.cards.length).toBe(3);
    });

    it('debe calcular tiempo estimado correctamente', () => {
      const cards = createTestCards(10);
      const workout = generateMemoryBankWorkout(cards, 1);

      // 30 segundos por tarjeta promedio
      expect(workout.estimatedMinutes).toBeGreaterThan(0);
    });

    it('debe asignar contexto según tipo de misión', () => {
      const cards = createTestCards(10);

      const vocabWorkout = generateMemoryBankWorkout(cards, 1, 'input');
      expect(vocabWorkout.context).toBe('vocabulary');

      const grammarWorkout = generateMemoryBankWorkout(cards, 1, 'exercises');
      expect(grammarWorkout.context).toBe('grammar');
    });

    it('debe priorizar cards no revisadas', () => {
      const cards: MemoryBankCard[] = [
        { id: '1', front: { text: 'A' }, back: { text: 'A' }, context: 'vocabulary', reviewCount: 5, lastReviewedAt: new Date().toISOString() },
        { id: '2', front: { text: 'B' }, back: { text: 'B' }, context: 'vocabulary', reviewCount: 0, lastReviewedAt: undefined },
        { id: '3', front: { text: 'C' }, back: { text: 'C' }, context: 'vocabulary', reviewCount: 0, lastReviewedAt: undefined },
      ];

      const workout = generateMemoryBankWorkout(cards, 1);

      // Las cards no revisadas deberían estar primero
      const firstCard = workout.cards[0];
      expect(firstCard.lastReviewedAt).toBeUndefined();
    });
  });

  describe('calculateRewards', () => {
    const baseConfig: MemoryBankMissionConfig = {
      minCards: 10,
      maxCards: 15,
      targetAccuracy: 70,
      xpPerCard: 10,
      bonusThreshold: 80,
      bonusMultiplier: 1.5,
    };

    it('debe calcular XP base correctamente', () => {
      const metrics = createSessionMetrics({ correctAnswers: 8 });
      const rewards = calculateRewards(metrics, baseConfig, 0);

      expect(rewards.baseXP).toBe(80); // 8 * 10
    });

    it('debe aplicar bonus por precisión alta', () => {
      const metrics = createSessionMetrics({ accuracy: 85, correctAnswers: 10 });
      const rewards = calculateRewards(metrics, baseConfig, 0);

      expect(rewards.bonusXP).toBeGreaterThan(0);
      expect(rewards.totalXP).toBeGreaterThan(rewards.baseXP);
    });

    it('no debe aplicar bonus si precisión es baja', () => {
      const metrics = createSessionMetrics({ accuracy: 70, correctAnswers: 7 });
      const rewards = calculateRewards(metrics, baseConfig, 0);

      expect(rewards.bonusXP).toBe(0);
      expect(rewards.totalXP).toBe(rewards.baseXP);
    });

    it('debe aplicar bonus por racha de 7+ días', () => {
      const metrics = createSessionMetrics({ accuracy: 70, correctAnswers: 10 });
      const rewardsNoStreak = calculateRewards(metrics, baseConfig, 3);
      const rewardsWithStreak = calculateRewards(metrics, baseConfig, 7);

      expect(rewardsWithStreak.streakBonus).toBe(true);
      expect(rewardsWithStreak.bonusXP).toBeGreaterThan(rewardsNoStreak.bonusXP);
    });

    it('debe dar bonus por sesión perfecta', () => {
      const metrics = createSessionMetrics({ accuracy: 100, cardsReviewed: 15, correctAnswers: 15 });
      const rewards = calculateRewards(metrics, baseConfig, 0);

      expect(rewards.perfectBonus).toBe(true);
      expect(rewards.gems).toBe(5);
    });

    it('debe calcular coins basados en XP', () => {
      const metrics = createSessionMetrics({ correctAnswers: 10 });
      const rewards = calculateRewards(metrics, baseConfig, 0);

      expect(rewards.coins).toBe(Math.round(rewards.totalXP * 0.4));
    });
  });

  describe('generateMemoryBankMission', () => {
    it('debe generar misión con estructura válida', () => {
      const mission = generateMemoryBankMission(5);

      expect(mission.id).toMatch(/^mission-memoryBank-/);
      expect(mission.type).toBe('exercises');
      expect(mission.title).toBe('Memory Bank');
      expect(mission.target).toBeGreaterThan(0);
      expect(mission.current).toBe(0);
      expect(mission.completed).toBe(false);
      expect(mission.reward).toBeDefined();
      expect(mission.reward.xp).toBeGreaterThan(0);
      expect(mission.reward.coins).toBeGreaterThan(0);
    });

    it('debe ajustar dificultad según nivel', () => {
      const lowLevel = generateMemoryBankMission(2);
      const midLevel = generateMemoryBankMission(5);
      const highLevel = generateMemoryBankMission(8);

      expect(lowLevel.difficulty).toBe('low');
      expect(midLevel.difficulty).toBe('medium');
      expect(highLevel.difficulty).toBe('high');
    });

    it('debe escalar target con el nivel', () => {
      const level1 = generateMemoryBankMission(1);
      const level10 = generateMemoryBankMission(10);

      expect(level10.target).toBeGreaterThan(level1.target);
    });
  });

  describe('shouldSuggestMemoryBank', () => {
    it('no debe sugerir si HP es muy bajo', () => {
      const result = shouldSuggestMemoryBank(20, null, 20, 100);

      expect(result.suggest).toBe(false);
      expect(result.reason).toContain('HP bajo');
    });

    it('debe sugerir con urgencia alta si hay muchas cards pendientes', () => {
      const result = shouldSuggestMemoryBank(35, null, 80, 100);

      expect(result.suggest).toBe(true);
      expect(result.urgency).toBe('high');
    });

    it('debe sugerir con urgencia media si pasaron más de 24 horas', () => {
      const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      const result = shouldSuggestMemoryBank(15, yesterday, 80, 100);

      expect(result.suggest).toBe(true);
      expect(result.urgency).toBe('medium');
    });

    it('debe sugerir con urgencia baja para cards normales', () => {
      const result = shouldSuggestMemoryBank(8, null, 80, 100);

      expect(result.suggest).toBe(true);
      expect(result.urgency).toBe('low');
    });

    it('no debe sugerir si hay pocas cards', () => {
      const result = shouldSuggestMemoryBank(3, null, 80, 100);

      expect(result.suggest).toBe(false);
      expect(result.reason).toContain('Todo al día');
    });
  });

  describe('sessionMetricsToMissionProgress', () => {
    it('debe sumar cards revisadas al progreso actual', () => {
      const metrics = createSessionMetrics({ cardsReviewed: 10 });
      const progress = sessionMetricsToMissionProgress(metrics, 5);

      expect(progress).toBe(15);
    });

    it('debe funcionar con progreso inicial en 0', () => {
      const metrics = createSessionMetrics({ cardsReviewed: 8 });
      const progress = sessionMetricsToMissionProgress(metrics, 0);

      expect(progress).toBe(8);
    });
  });

  describe('getMemoryBankStats', () => {
    it('debe calcular estadísticas agregadas', () => {
      const sessions: SessionMetrics[] = [
        createSessionMetrics({ cardsReviewed: 10, correctAnswers: 8, sessionDuration: 300 }),
        createSessionMetrics({ cardsReviewed: 15, correctAnswers: 12, sessionDuration: 450 }),
      ];

      const stats = getMemoryBankStats(sessions);

      expect(stats.totalCards).toBe(25);
      expect(stats.totalCorrect).toBe(20);
      expect(stats.totalTime).toBe(750);
      expect(stats.sessionsCount).toBe(2);
      expect(stats.averageAccuracy).toBe(80); // 20/25 * 100
    });

    it('debe manejar array vacío', () => {
      const stats = getMemoryBankStats([]);

      expect(stats.totalCards).toBe(0);
      expect(stats.totalCorrect).toBe(0);
      expect(stats.averageAccuracy).toBe(0);
      expect(stats.totalTime).toBe(0);
      expect(stats.sessionsCount).toBe(0);
    });

    it('debe calcular precisión correctamente', () => {
      const sessions: SessionMetrics[] = [
        createSessionMetrics({ cardsReviewed: 10, correctAnswers: 10 }),
        createSessionMetrics({ cardsReviewed: 10, correctAnswers: 5 }),
      ];

      const stats = getMemoryBankStats(sessions);

      expect(stats.averageAccuracy).toBe(75); // 15/20 * 100
    });
  });
});
