import { describe, it, expect } from 'vitest';
import {
  selectWarmup,
  getWarmupForMissionType,
  getAvailableWarmupTypes,
  isWarmupAppropriate,
  getAdjustedDuration,
  type WarmupSelectionContext,
} from '@/services/warmupSelector';
import type { Warmup, MissionType } from '@/schemas/warmup';

describe('Warmup Selector Service', () => {
  const baseContext: WarmupSelectionContext = {
    missionType: 'grammar',
    difficulty: 'medium',
    userLevel: 3,
  };

  describe('selectWarmup', () => {
    it('should return a valid warmup for grammar mission', () => {
      const warmup = selectWarmup({ ...baseContext, missionType: 'grammar' });

      expect(warmup).toBeDefined();
      expect(warmup.id).toBeDefined();
      expect(warmup.type).toBe('rhythmSequence');
    });

    it('should return visualMatch for vocabulary mission', () => {
      const warmup = selectWarmup({ ...baseContext, missionType: 'vocabulary' });

      expect(warmup.type).toBe('visualMatch');
    });

    it('should return voiceImitation for pronunciation mission', () => {
      const warmup = selectWarmup({ ...baseContext, missionType: 'pronunciation' });

      expect(warmup.type).toBe('voiceImitation');
    });

    it('should handle mixed mission type', () => {
      const warmup = selectWarmup({ ...baseContext, missionType: 'mixed' });

      expect(['rhythmSequence', 'visualMatch']).toContain(warmup.type);
    });

    it('should include all required warmup properties', () => {
      const warmup = selectWarmup(baseContext);

      expect(warmup).toHaveProperty('id');
      expect(warmup).toHaveProperty('type');
      expect(warmup).toHaveProperty('title');
      expect(warmup).toHaveProperty('description');
      expect(warmup).toHaveProperty('duration');
      expect(warmup).toHaveProperty('config');
      expect(warmup).toHaveProperty('missionType');
      expect(warmup).toHaveProperty('difficulty');
      expect(warmup).toHaveProperty('adaptive');
    });

    it('should adjust difficulty based on context', () => {
      const lowDifficultyWarmup = selectWarmup({ ...baseContext, difficulty: 'low' });
      const highDifficultyWarmup = selectWarmup({ ...baseContext, difficulty: 'high' });

      expect(lowDifficultyWarmup.difficulty).toBe('low');
      expect(highDifficultyWarmup.difficulty).toBe('high');
    });

    it('should avoid recently used warmup types for mixed', () => {
      const contextWithRecent: WarmupSelectionContext = {
        ...baseContext,
        missionType: 'mixed',
        recentWarmupTypes: ['rhythmSequence'],
      };

      const warmup = selectWarmup(contextWithRecent);

      // Should prefer visualMatch since rhythmSequence was recent
      expect(warmup.type).toBe('visualMatch');
    });

    it('should generate valid warmup IDs', () => {
      const warmup = selectWarmup(baseContext);

      expect(warmup.id).toMatch(/^warmup-\w+-\d+$/);
      expect(warmup.id).toContain('warmup-');
    });
  });

  describe('getWarmupForMissionType', () => {
    it('should return warmup with default parameters', () => {
      const warmup = getWarmupForMissionType('grammar');

      expect(warmup).toBeDefined();
      expect(warmup.difficulty).toBe('medium');
    });

    it('should accept custom difficulty', () => {
      const warmup = getWarmupForMissionType('vocabulary', 'high');

      expect(warmup.difficulty).toBe('high');
    });

    it('should accept custom user level', () => {
      const warmup = getWarmupForMissionType('pronunciation', 'medium', 5);

      expect(warmup).toBeDefined();
    });

    it('should work for all mission types', () => {
      const missionTypes: MissionType[] = ['grammar', 'vocabulary', 'pronunciation', 'mixed'];

      missionTypes.forEach((type) => {
        const warmup = getWarmupForMissionType(type);
        expect(warmup).toBeDefined();
        expect(warmup.id).toBeDefined();
      });
    });
  });

  describe('getAvailableWarmupTypes', () => {
    it('should return all warmup types', () => {
      const types = getAvailableWarmupTypes();

      expect(types).toContain('rhythmSequence');
      expect(types).toContain('visualMatch');
      expect(types).toContain('voiceImitation');
    });

    it('should return an array', () => {
      const types = getAvailableWarmupTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBe(3);
    });
  });

  describe('isWarmupAppropriate', () => {
    it('should allow all warmups for normal cognitive load', () => {
      const result = isWarmupAppropriate('rhythmSequence', 50);

      expect(result.appropriate).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should only allow visualMatch for high cognitive load', () => {
      const rhythmResult = isWarmupAppropriate('rhythmSequence', 85);
      const visualResult = isWarmupAppropriate('visualMatch', 85);
      const voiceResult = isWarmupAppropriate('voiceImitation', 85);

      expect(rhythmResult.appropriate).toBe(false);
      expect(visualResult.appropriate).toBe(true);
      expect(voiceResult.appropriate).toBe(false);
    });

    it('should provide reason for high load', () => {
      const result = isWarmupAppropriate('rhythmSequence', 85);

      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('carga cognitiva');
    });
  });

  describe('getAdjustedDuration', () => {
    const baseWarmup: Warmup = {
      id: 'test-warmup',
      type: 'rhythmSequence',
      title: 'Test',
      description: 'Test warmup',
      duration: 45,
      config: {
        sequences: [],
        visualStyle: 'geometric',
        soundEnabled: true,
      },
      missionType: 'grammar',
      difficulty: 'medium',
      adaptive: true,
    };

    it('should return base duration for average performance', () => {
      const duration = getAdjustedDuration(baseWarmup, {
        averageScore: 75,
        completionRate: 0.8,
      });

      expect(duration).toBe(45);
    });

    it('should reduce duration for high performers', () => {
      const duration = getAdjustedDuration(baseWarmup, {
        averageScore: 90,
        completionRate: 0.95,
      });

      expect(duration).toBeLessThan(45);
      expect(duration).toBe(36); // 45 * 0.8
    });

    it('should increase duration for low performers', () => {
      const duration = getAdjustedDuration(baseWarmup, {
        averageScore: 50,
        completionRate: 0.6,
      });

      expect(duration).toBeGreaterThan(45);
      expect(duration).toBe(54); // 45 * 1.2
    });

    it('should clamp duration between 30 and 90 seconds', () => {
      const shortWarmup = { ...baseWarmup, duration: 20 };
      const longWarmup = { ...baseWarmup, duration: 100 };

      const shortDuration = getAdjustedDuration(shortWarmup, {
        averageScore: 50,
        completionRate: 0.5,
      });

      const longDuration = getAdjustedDuration(longWarmup, {
        averageScore: 90,
        completionRate: 0.95,
      });

      expect(shortDuration).toBeGreaterThanOrEqual(30);
      expect(longDuration).toBeLessThanOrEqual(90);
    });
  });
});
