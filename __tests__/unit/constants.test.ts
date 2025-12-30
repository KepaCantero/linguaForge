import { describe, it, expect } from 'vitest';
import {
  getLevelByXP,
  getXPToNextLevel,
  getLevelProgress,
  USER_LEVELS,
  LEVEL_THRESHOLDS,
  XP_RULES,
  JANUS_CONFIG,
} from '@/lib/constants';

describe('Constants', () => {
  describe('getLevelByXP', () => {
    it('should return level 1 for 0 XP', () => {
      const level = getLevelByXP(0);
      expect(level.level).toBe(1);
      expect(level.title).toBe('Débutant');
    });

    it('should return level 2 for 100 XP', () => {
      const level = getLevelByXP(100);
      expect(level.level).toBe(2);
      expect(level.title).toBe('Curieux');
    });

    it('should return level 5 for 1000 XP', () => {
      const level = getLevelByXP(1000);
      expect(level.level).toBe(5);
      expect(level.title).toBe('Voyageur');
    });

    it('should return level 10 for 5500+ XP', () => {
      const level = getLevelByXP(5500);
      expect(level.level).toBe(10);
      expect(level.title).toBe('Maître');
    });

    it('should return level 10 for XP above maximum threshold', () => {
      const level = getLevelByXP(10000);
      expect(level.level).toBe(10);
    });
  });

  describe('getXPToNextLevel', () => {
    it('should return 100 XP to next level from 0 XP', () => {
      expect(getXPToNextLevel(0)).toBe(100);
    });

    it('should return 200 XP to next level from 100 XP', () => {
      expect(getXPToNextLevel(100)).toBe(200);
    });

    it('should return 0 at max level', () => {
      expect(getXPToNextLevel(5500)).toBe(0);
    });
  });

  describe('getLevelProgress', () => {
    it('should return 0% at level start', () => {
      expect(getLevelProgress(0)).toBe(0);
    });

    it('should return 50% at halfway point', () => {
      expect(getLevelProgress(50)).toBe(50);
    });

    it('should return 100% at max level', () => {
      expect(getLevelProgress(5500)).toBe(100);
    });
  });

  describe('USER_LEVELS', () => {
    it('should have 10 levels', () => {
      expect(USER_LEVELS).toHaveLength(10);
    });

    it('should start at 0 XP for level 1', () => {
      expect(USER_LEVELS[0].xpRequired).toBe(0);
    });

    it('should have increasing XP requirements', () => {
      for (let i = 1; i < USER_LEVELS.length; i++) {
        expect(USER_LEVELS[i].xpRequired).toBeGreaterThan(USER_LEVELS[i - 1].xpRequired);
      }
    });
  });

  describe('LEVEL_THRESHOLDS', () => {
    it('should have thresholds for A1', () => {
      expect(LEVEL_THRESHOLDS.A1).toEqual({
        read: 30000,
        heard: 35000,
        spoken: 5000,
      });
    });

    it('should have increasing thresholds for higher levels', () => {
      expect(LEVEL_THRESHOLDS.A2.read).toBeGreaterThan(LEVEL_THRESHOLDS.A1.read);
      expect(LEVEL_THRESHOLDS.B1.read).toBeGreaterThan(LEVEL_THRESHOLDS.A2.read);
    });
  });

  describe('XP_RULES', () => {
    it('should reward more XP for correct answers', () => {
      expect(XP_RULES.clozeCorrect).toBeGreaterThan(XP_RULES.clozeIncorrect);
    });

    it('should have bonus for completing Janus matrix', () => {
      expect(XP_RULES.janusMatrixComplete).toBe(100);
    });
  });

  describe('JANUS_CONFIG', () => {
    it('should have 4 columns per matrix', () => {
      expect(JANUS_CONFIG.columnsPerMatrix).toBe(4);
    });

    it('should target 25 repetitions', () => {
      expect(JANUS_CONFIG.targetRepetitions).toBe(25);
    });
  });
});
