import { describe, it, expect } from 'vitest';
import {
  calculatePostCognitiveRewards,
  getSessionFeedback,
  sessionToPerformanceMetrics,
  type PerformanceMetrics,
} from '@/services/postCognitiveRewards';
import type { CognitiveLoadMetrics, SessionMetrics } from '@/store/useCognitiveLoadStore';

describe('Post Cognitive Rewards Service', () => {
  const baseCognitiveLoad: CognitiveLoadMetrics = {
    intrinsic: 40,
    extraneous: 20,
    germane: 50,
    total: 60,
  };

  const baseMetrics: PerformanceMetrics = {
    accuracy: 0.8,
    averageResponseTime: 3000,
    exercisesCompleted: 15,
    consecutiveCorrect: 8,
    cognitiveLoad: baseCognitiveLoad,
    sessionDuration: 900, // 15 minutes
    focusModeUsed: false,
  };

  describe('calculatePostCognitiveRewards', () => {
    it('should calculate base rewards', () => {
      const rewards = calculatePostCognitiveRewards(baseMetrics);

      expect(rewards.baseXP).toBeGreaterThan(0);
      expect(rewards.baseCoins).toBeGreaterThan(0);
      expect(rewards.totalXP).toBeGreaterThanOrEqual(rewards.baseXP);
      expect(rewards.totalCoins).toBeGreaterThanOrEqual(rewards.baseCoins);
    });

    it('should apply accuracy multiplier for excellent accuracy', () => {
      const excellentMetrics = { ...baseMetrics, accuracy: 0.97 };
      const normalRewards = calculatePostCognitiveRewards(baseMetrics);
      const excellentRewards = calculatePostCognitiveRewards(excellentMetrics);

      expect(excellentRewards.totalXP).toBeGreaterThan(normalRewards.totalXP);
      expect(excellentRewards.multipliers.some((m) => m.name === 'Precisión Excelente')).toBe(true);
    });

    it('should apply speed multiplier for fast responses', () => {
      const fastMetrics = { ...baseMetrics, averageResponseTime: 1500 };
      const rewards = calculatePostCognitiveRewards(fastMetrics);

      expect(rewards.multipliers.some((m) => m.name === 'Respuestas Rápidas')).toBe(true);
    });

    it('should apply streak multiplier for 5+ correct', () => {
      const streakMetrics = { ...baseMetrics, consecutiveCorrect: 6 };
      const rewards = calculatePostCognitiveRewards(streakMetrics);

      expect(rewards.multipliers.some((m) => m.name === 'Racha Activa')).toBe(true);
    });

    it('should apply streak multiplier for 10+ correct', () => {
      const streakMetrics = { ...baseMetrics, consecutiveCorrect: 12 };
      const rewards = calculatePostCognitiveRewards(streakMetrics);

      expect(rewards.multipliers.some((m) => m.name === 'Gran Racha')).toBe(true);
    });

    it('should apply streak multiplier for 20+ correct', () => {
      const streakMetrics = { ...baseMetrics, consecutiveCorrect: 22 };
      const rewards = calculatePostCognitiveRewards(streakMetrics);

      expect(rewards.multipliers.some((m) => m.name === 'Racha Épica')).toBe(true);
    });

    it('should apply focus mode multiplier', () => {
      const focusMetrics = { ...baseMetrics, focusModeUsed: true };
      const rewards = calculatePostCognitiveRewards(focusMetrics);

      expect(rewards.multipliers.some((m) => m.name === 'Modo Focus')).toBe(true);
    });

    it('should apply cognitive bonus for optimal load', () => {
      const optimalLoadMetrics = {
        ...baseMetrics,
        cognitiveLoad: { ...baseCognitiveLoad, total: 55 },
      };
      const rewards = calculatePostCognitiveRewards(optimalLoadMetrics);

      expect(rewards.cognitiveBonus).toBeGreaterThan(0);
    });

    it('should apply cognitive bonus for high germane', () => {
      const highGermaneMetrics = {
        ...baseMetrics,
        cognitiveLoad: { ...baseCognitiveLoad, germane: 65 },
      };
      const rewards = calculatePostCognitiveRewards(highGermaneMetrics);

      expect(rewards.cognitiveBonus).toBeGreaterThan(0);
    });

    it('should apply streak bonus for long streaks', () => {
      const rewards7Days = calculatePostCognitiveRewards(baseMetrics, 7);
      const rewards30Days = calculatePostCognitiveRewards(baseMetrics, 30);
      const rewards100Days = calculatePostCognitiveRewards(baseMetrics, 100);

      expect(rewards7Days.streakBonus).toBeGreaterThan(0);
      expect(rewards30Days.streakBonus).toBeGreaterThan(rewards7Days.streakBonus);
      expect(rewards100Days.streakBonus).toBeGreaterThan(rewards30Days.streakBonus);
    });

    it('should unlock first session achievement', () => {
      const rewards = calculatePostCognitiveRewards(baseMetrics, 0, true);

      expect(rewards.achievements.some((a) => a.id === 'first_session')).toBe(true);
    });

    it('should unlock perfect session achievement', () => {
      const perfectMetrics = {
        ...baseMetrics,
        accuracy: 1,
        exercisesCompleted: 12,
      };
      const rewards = calculatePostCognitiveRewards(perfectMetrics);

      expect(rewards.achievements.some((a) => a.id === 'perfect_session')).toBe(true);
    });

    it('should unlock focus master achievement', () => {
      const focusMasterMetrics = {
        ...baseMetrics,
        focusModeUsed: true,
        sessionDuration: 2000, // 30+ minutes
      };
      const rewards = calculatePostCognitiveRewards(focusMasterMetrics);

      expect(rewards.achievements.some((a) => a.id === 'focus_master')).toBe(true);
    });

    it('should unlock speed demon achievement', () => {
      const speedMetrics = {
        ...baseMetrics,
        averageResponseTime: 1500,
        exercisesCompleted: 25,
      };
      const rewards = calculatePostCognitiveRewards(speedMetrics);

      expect(rewards.achievements.some((a) => a.id === 'speed_demon')).toBe(true);
    });

    it('should unlock cognitive balance achievement', () => {
      const balancedMetrics = {
        ...baseMetrics,
        cognitiveLoad: { ...baseCognitiveLoad, total: 55 },
        sessionDuration: 1000,
      };
      const rewards = calculatePostCognitiveRewards(balancedMetrics);

      expect(rewards.achievements.some((a) => a.id === 'cognitive_balance')).toBe(true);
    });

    it('should unlock deep learner achievement', () => {
      const deepMetrics = {
        ...baseMetrics,
        cognitiveLoad: { ...baseCognitiveLoad, germane: 85 },
      };
      const rewards = calculatePostCognitiveRewards(deepMetrics);

      expect(rewards.achievements.some((a) => a.id === 'deep_learner')).toBe(true);
    });

    it('should award gems for epic/legendary achievements', () => {
      const legendaryMetrics = {
        ...baseMetrics,
        cognitiveLoad: { ...baseCognitiveLoad, germane: 85 },
      };
      const rewards = calculatePostCognitiveRewards(legendaryMetrics);

      expect(rewards.gems).toBeGreaterThan(0);
    });
  });

  describe('getSessionFeedback', () => {
    it('should return excellent rating for high accuracy and many exercises', () => {
      const excellentMetrics = {
        ...baseMetrics,
        accuracy: 0.92,
        exercisesCompleted: 15,
      };
      const { feedback } = getSessionFeedback(excellentMetrics);

      expect(feedback.rating).toBe('excellent');
    });

    it('should return good rating for decent performance', () => {
      const goodMetrics = {
        ...baseMetrics,
        accuracy: 0.78,
        exercisesCompleted: 10,
      };
      const { feedback } = getSessionFeedback(goodMetrics);

      expect(feedback.rating).toBe('good');
    });

    it('should return fair rating for average performance', () => {
      const fairMetrics = {
        ...baseMetrics,
        accuracy: 0.65,
        exercisesCompleted: 6,
      };
      const { feedback } = getSessionFeedback(fairMetrics);

      expect(feedback.rating).toBe('fair');
    });

    it('should return needs_improvement for poor performance', () => {
      const poorMetrics = {
        ...baseMetrics,
        accuracy: 0.4,
        exercisesCompleted: 3,
      };
      const { feedback } = getSessionFeedback(poorMetrics);

      expect(feedback.rating).toBe('needs_improvement');
    });

    it('should provide tips for low accuracy', () => {
      const lowAccuracyMetrics = { ...baseMetrics, accuracy: 0.5 };
      const { feedback } = getSessionFeedback(lowAccuracyMetrics);

      expect(feedback.tips.length).toBeGreaterThan(0);
    });

    it('should suggest focus mode when not used', () => {
      const { feedback } = getSessionFeedback(baseMetrics);

      expect(feedback.tips.some((t) => t.includes('Focus'))).toBe(true);
    });

    it('should provide cognitive insight', () => {
      const { feedback } = getSessionFeedback(baseMetrics);

      expect(feedback.cognitiveInsight).toBeDefined();
      expect(feedback.cognitiveInsight.length).toBeGreaterThan(0);
    });

    it('should provide next steps', () => {
      const { feedback } = getSessionFeedback(baseMetrics);

      expect(feedback.nextSteps.length).toBeGreaterThan(0);
    });
  });

  describe('sessionToPerformanceMetrics', () => {
    const sessionMetrics: SessionMetrics = {
      startTime: Date.now() - 900000, // 15 minutes ago
      exercisesCompleted: 20,
      correctAnswers: 16,
      totalAttempts: 20,
      averageResponseTime: 2500,
      peakLoad: 65,
      loadHistory: [50, 55, 60, 62, 65, 63, 61],
    };

    it('should convert session metrics correctly', () => {
      const performance = sessionToPerformanceMetrics(sessionMetrics, baseCognitiveLoad);

      expect(performance.accuracy).toBe(0.8); // 16/20
      expect(performance.exercisesCompleted).toBe(20);
      expect(performance.averageResponseTime).toBe(2500);
    });

    it('should calculate session duration', () => {
      const performance = sessionToPerformanceMetrics(sessionMetrics, baseCognitiveLoad);

      expect(performance.sessionDuration).toBeGreaterThan(800); // ~15 minutes
    });

    it('should estimate consecutive correct', () => {
      const performance = sessionToPerformanceMetrics(sessionMetrics, baseCognitiveLoad);

      expect(performance.consecutiveCorrect).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero attempts gracefully', () => {
      const emptySession: SessionMetrics = {
        startTime: Date.now() - 900000,
        exercisesCompleted: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        averageResponseTime: 0,
        peakLoad: 30,
        loadHistory: [],
      };
      const performance = sessionToPerformanceMetrics(emptySession, baseCognitiveLoad);

      expect(performance.accuracy).toBe(0);
    });

    it('should include focus mode flag', () => {
      const withFocus = sessionToPerformanceMetrics(sessionMetrics, baseCognitiveLoad, true);
      const withoutFocus = sessionToPerformanceMetrics(sessionMetrics, baseCognitiveLoad, false);

      expect(withFocus.focusModeUsed).toBe(true);
      expect(withoutFocus.focusModeUsed).toBe(false);
    });
  });
});
