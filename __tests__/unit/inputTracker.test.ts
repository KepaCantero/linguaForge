import { describe, it, expect } from 'vitest';
import {
  calculateWords,
  calculateMinutes,
  updateStats,
  calculateLevelProgress,
  canAdvanceLevel,
  getMainWeakness,
  createEmptyStats,
  getStatsSummary,
} from '@/services/inputTracker';
import { InputStats } from '@/types';

describe('InputTracker Service', () => {
  describe('calculateWords', () => {
    it('should count words as read for text type', () => {
      const result = calculateWords('text', 100);
      expect(result.wordsRead).toBe(100);
      expect(result.wordsHeard).toBe(0);
      expect(result.wordsSpoken).toBe(0);
    });

    it('should count words as heard for audio type', () => {
      const result = calculateWords('audio', 50);
      expect(result.wordsRead).toBe(0);
      expect(result.wordsHeard).toBe(50);
      expect(result.wordsSpoken).toBe(0);
    });

    it('should count words as heard for video type', () => {
      const result = calculateWords('video', 75);
      expect(result.wordsRead).toBe(0);
      expect(result.wordsHeard).toBe(75);
      expect(result.wordsSpoken).toBe(0);
    });
  });

  describe('calculateMinutes', () => {
    it('should calculate minutes listened for audio', () => {
      const result = calculateMinutes('audio', 120);
      expect(result.minutesListened).toBe(2);
      expect(result.minutesRead).toBe(0);
    });

    it('should calculate minutes listened for video', () => {
      const result = calculateMinutes('video', 180);
      expect(result.minutesListened).toBe(3);
      expect(result.minutesRead).toBe(0);
    });

    it('should calculate minutes read for text', () => {
      const result = calculateMinutes('text', 300);
      expect(result.minutesListened).toBe(0);
      expect(result.minutesRead).toBe(5);
    });

    it('should round up to nearest minute', () => {
      const result = calculateMinutes('audio', 61);
      expect(result.minutesListened).toBe(2);
    });
  });

  describe('updateStats', () => {
    it('should add words to existing stats', () => {
      const current: InputStats = createEmptyStats();
      const updated = updateStats(current, 'text', 100, 60);

      expect(updated.wordsRead).toBe(100);
      expect(updated.minutesRead).toBe(1);
    });

    it('should accumulate stats over multiple updates', () => {
      let stats = createEmptyStats();
      stats = updateStats(stats, 'text', 100, 60);
      stats = updateStats(stats, 'audio', 50, 120);

      expect(stats.wordsRead).toBe(100);
      expect(stats.wordsHeard).toBe(50);
      expect(stats.minutesRead).toBe(1);
      expect(stats.minutesListened).toBe(2);
    });
  });

  describe('calculateLevelProgress', () => {
    it('should return 0% for empty stats', () => {
      const stats = createEmptyStats();
      const progress = calculateLevelProgress(stats, 'A1');

      expect(progress.readProgress).toBe(0);
      expect(progress.heardProgress).toBe(0);
      expect(progress.spokenProgress).toBe(0);
      expect(progress.overallProgress).toBe(0);
    });

    it('should calculate correct percentages', () => {
      const stats: InputStats = {
        wordsRead: 15000, // 50% of 30000
        wordsHeard: 17500, // 50% of 35000
        wordsSpoken: 2500, // 50% of 5000
        minutesListened: 0,
        minutesRead: 0,
      };

      const progress = calculateLevelProgress(stats, 'A1');

      expect(progress.readProgress).toBe(50);
      expect(progress.heardProgress).toBe(50);
      expect(progress.spokenProgress).toBe(50);
    });

    it('should cap progress at 100%', () => {
      const stats: InputStats = {
        wordsRead: 60000, // 200% of A1 threshold
        wordsHeard: 0,
        wordsSpoken: 0,
        minutesListened: 0,
        minutesRead: 0,
      };

      const progress = calculateLevelProgress(stats, 'A1');
      expect(progress.readProgress).toBe(100);
    });
  });

  describe('canAdvanceLevel', () => {
    it('should return false when not all thresholds are met', () => {
      const stats: InputStats = {
        wordsRead: 30000,
        wordsHeard: 35000,
        wordsSpoken: 4000, // Below 5000 threshold
        minutesListened: 0,
        minutesRead: 0,
      };

      expect(canAdvanceLevel(stats, 'A1')).toBe(false);
    });

    it('should return true when all thresholds are met', () => {
      const stats: InputStats = {
        wordsRead: 30000,
        wordsHeard: 35000,
        wordsSpoken: 5000,
        minutesListened: 0,
        minutesRead: 0,
      };

      expect(canAdvanceLevel(stats, 'A1')).toBe(true);
    });
  });

  describe('getMainWeakness', () => {
    it('should identify reading as weakness when lowest', () => {
      const stats: InputStats = {
        wordsRead: 10000,
        wordsHeard: 35000,
        wordsSpoken: 5000,
        minutesListened: 0,
        minutesRead: 0,
      };

      expect(getMainWeakness(stats, 'A1')).toBe('reading');
    });

    it('should identify listening as weakness when lowest', () => {
      const stats: InputStats = {
        wordsRead: 30000,
        wordsHeard: 10000,
        wordsSpoken: 5000,
        minutesListened: 0,
        minutesRead: 0,
      };

      expect(getMainWeakness(stats, 'A1')).toBe('listening');
    });

    it('should identify speaking as weakness when lowest', () => {
      const stats: InputStats = {
        wordsRead: 30000,
        wordsHeard: 35000,
        wordsSpoken: 1000,
        minutesListened: 0,
        minutesRead: 0,
      };

      expect(getMainWeakness(stats, 'A1')).toBe('speaking');
    });
  });

  describe('createEmptyStats', () => {
    it('should create stats with all zeros', () => {
      const stats = createEmptyStats();

      expect(stats.wordsRead).toBe(0);
      expect(stats.wordsHeard).toBe(0);
      expect(stats.wordsSpoken).toBe(0);
      expect(stats.minutesListened).toBe(0);
      expect(stats.minutesRead).toBe(0);
    });
  });

  describe('getStatsSummary', () => {
    it('should calculate totals correctly', () => {
      const stats: InputStats = {
        wordsRead: 100,
        wordsHeard: 200,
        wordsSpoken: 50,
        minutesListened: 30,
        minutesRead: 20,
      };

      const summary = getStatsSummary(stats);

      expect(summary.totalWords).toBe(350);
      expect(summary.totalMinutes).toBe(50);
    });

    it('should calculate percentages correctly', () => {
      const stats: InputStats = {
        wordsRead: 50,
        wordsHeard: 100,
        wordsSpoken: 50,
        minutesListened: 0,
        minutesRead: 0,
      };

      const summary = getStatsSummary(stats);

      expect(summary.breakdown[0].percentage).toBe(25); // reading
      expect(summary.breakdown[1].percentage).toBe(50); // listening
      expect(summary.breakdown[2].percentage).toBe(25); // speaking
    });
  });
});
