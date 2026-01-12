import { describe, it, expect } from 'vitest';
import {
  generateDailyMissions,
  calculateAllMissionsBonus,
  suggestMissionOrder,
  shouldTakeBreak,
  generateMissionId,
  type UserContext,
} from '@/services/missionGenerator';
import type { Mission } from '@/store/useMissionStore';

describe('Mission Generator Service', () => {
  const baseContext: UserContext = {
    level: 3,
    rank: 'Aprendiz',
    streak: 5,
    hp: 80,
    recentPerformance: {
      exercisesCompleted: 10,
      accuracy: 0.75,
      averageSessionMinutes: 15,
    },
    preferences: {
      focusOnGrammar: false,
      focusOnVocabulary: false,
      focusOnPronunciation: false,
    },
  };

  describe('generateDailyMissions', () => {
    it('should generate missions based on user context', () => {
      const missions = generateDailyMissions(baseContext);

      expect(missions).toBeDefined();
      expect(missions.length).toBeGreaterThan(0);
      expect(missions.length).toBeLessThanOrEqual(4);
    });

    it('should include required mission properties', () => {
      const missions = generateDailyMissions(baseContext);

      missions.forEach((mission) => {
        expect(mission).toHaveProperty('type');
        expect(mission).toHaveProperty('title');
        expect(mission).toHaveProperty('description');
        expect(mission).toHaveProperty('target');
        expect(mission).toHaveProperty('current', 0);
        expect(mission).toHaveProperty('reward');
        expect(mission).toHaveProperty('completed', false);
        expect(mission).toHaveProperty('warmupMissionType');
        expect(mission).toHaveProperty('difficulty');
        expect(mission).toHaveProperty('cognitiveLoadTarget');
      });
    });

    it('should generate fewer missions for low HP', () => {
      const lowHPContext = { ...baseContext, hp: 30 };
      const lowHPMissions = generateDailyMissions(lowHPContext);
      const fullHPMissions = generateDailyMissions(baseContext);

      expect(lowHPMissions.length).toBeLessThanOrEqual(fullHPMissions.length);
    });

    it('should not include high-level missions for beginners', () => {
      const beginnerContext = { ...baseContext, level: 1 };
      const missions = generateDailyMissions(beginnerContext);

      // Janus requires level 2+
      const janusMission = missions.find((m) => m.type === 'janus');
      expect(janusMission).toBeUndefined();
    });

    it('should respect user preferences for grammar', () => {
      const grammarContext = {
        ...baseContext,
        preferences: {
          focusOnGrammar: true,
          focusOnVocabulary: false,
          focusOnPronunciation: false,
        },
      };
      const missions = generateDailyMissions(grammarContext);

      // Should still generate valid missions
      expect(missions.length).toBeGreaterThan(0);
    });

    it('should adjust cognitive load for high accuracy users', () => {
      const highAccuracyContext = {
        ...baseContext,
        recentPerformance: {
          ...baseContext.recentPerformance,
          accuracy: 0.9,
        },
      };
      const missions = generateDailyMissions(highAccuracyContext);

      expect(missions.length).toBeGreaterThan(0);
    });

    it('should adjust cognitive load after heavy session', () => {
      const heavySessionContext = {
        ...baseContext,
        lastSessionLoad: {
          intrinsic: 50,
          extraneous: 30,
          germane: 45,
        },
      };
      const missions = generateDailyMissions(heavySessionContext);

      expect(missions.length).toBeGreaterThan(0);
    });
  });

  describe('calculateAllMissionsBonus', () => {
    const createMission = (completed: boolean): Mission => ({
      id: 'test-1',
      type: 'exercises',
      title: 'Test',
      description: 'Test mission',
      target: 5,
      current: completed ? 5 : 0,
      reward: { xp: 30, coins: 15 },
      completed,
      warmupMissionType: 'grammar',
      difficulty: 'medium',
    });

    it('should return no bonus if not all missions completed', () => {
      const missions = [createMission(true), createMission(false)];
      const bonus = calculateAllMissionsBonus(missions);

      expect(bonus.xp).toBe(0);
      expect(bonus.coins).toBe(0);
      expect(bonus.gems).toBe(0);
    });

    it('should return bonus when all missions completed', () => {
      const missions = [
        createMission(true),
        createMission(true),
        createMission(true),
        createMission(true),
      ];
      const bonus = calculateAllMissionsBonus(missions);

      expect(bonus.xp).toBeGreaterThan(0);
      expect(bonus.coins).toBeGreaterThan(0);
    });

    it('should include gems for 4+ missions', () => {
      const missions = [
        createMission(true),
        createMission(true),
        createMission(true),
        createMission(true),
      ];
      const bonus = calculateAllMissionsBonus(missions);

      expect(bonus.gems).toBe(5);
    });

    it('should not include gems for less than 4 missions', () => {
      const missions = [
        createMission(true),
        createMission(true),
        createMission(true),
      ];
      const bonus = calculateAllMissionsBonus(missions);

      expect(bonus.gems).toBe(0);
    });
  });

  describe('suggestMissionOrder', () => {
    const createMissionWithType = (
      type: string,
      cognitiveLoad: number
    ): Mission => ({
      id: `mission-${type}`,
      type: type as Mission['type'],
      title: type,
      description: `${type} mission`,
      target: 5,
      current: 0,
      reward: { xp: 30, coins: 15 },
      completed: false,
      warmupMissionType: 'grammar',
      difficulty: 'medium',
      cognitiveLoadTarget: cognitiveLoad,
    });

    it('should put forgeMandate last', () => {
      const missions = [
        createMissionWithType('forgeMandate', 75),
        createMissionWithType('exercises', 50),
        createMissionWithType('input', 25),
      ];

      const ordered = suggestMissionOrder(missions);

      expect(ordered.at(-1)?.type).toBe('forgeMandate');
    });

    it('should put input before other types', () => {
      const missions = [
        createMissionWithType('exercises', 50),
        createMissionWithType('input', 25),
        createMissionWithType('janus', 65),
      ];

      const ordered = suggestMissionOrder(missions);

      expect(ordered[0].type).toBe('input');
    });

    it('should order by cognitive load (ascending)', () => {
      const missions = [
        createMissionWithType('exercises', 60),
        createMissionWithType('janus', 40),
        createMissionWithType('streak', 20),
      ];

      const ordered = suggestMissionOrder(missions);

      // streak (20) should be before janus (40) which is before exercises (60)
      const streakIndex = ordered.findIndex((m) => m.type === 'streak');
      const janusIndex = ordered.findIndex((m) => m.type === 'janus');
      const exercisesIndex = ordered.findIndex((m) => m.type === 'exercises');

      expect(streakIndex).toBeLessThan(janusIndex);
      expect(janusIndex).toBeLessThan(exercisesIndex);
    });
  });

  describe('shouldTakeBreak', () => {
    it('should recommend break after 3 missions', () => {
      const result = shouldTakeBreak(3, 20, 50);

      expect(result.shouldBreak).toBe(true);
      expect(result.recommendedMinutes).toBe(5);
    });

    it('should recommend break after 30+ minutes', () => {
      const result = shouldTakeBreak(2, 35, 50);

      expect(result.shouldBreak).toBe(true);
      expect(result.recommendedMinutes).toBe(10);
    });

    it('should recommend break with high cognitive load', () => {
      const result = shouldTakeBreak(1, 10, 85);

      expect(result.shouldBreak).toBe(true);
      expect(result.recommendedMinutes).toBe(5);
    });

    it('should not recommend break in normal conditions', () => {
      const result = shouldTakeBreak(1, 10, 50);

      expect(result.shouldBreak).toBe(false);
      expect(result.recommendedMinutes).toBe(0);
    });
  });

  describe('generateMissionId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateMissionId('exercises', 0);
      const id2 = generateMissionId('exercises', 1);

      expect(id1).not.toBe(id2);
    });

    it('should include type in ID', () => {
      const id = generateMissionId('input', 0);

      expect(id).toContain('input');
    });

    it('should include mission prefix', () => {
      const id = generateMissionId('janus', 0);

      expect(id.startsWith('mission-')).toBe(true);
    });
  });
});
