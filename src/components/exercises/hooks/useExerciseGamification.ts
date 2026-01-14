'use client';

import { useCallback, useMemo } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';

// ============================================
// TYPES
// ============================================

export interface ExerciseRewardConfig {
  baseXP: number;
  bonusXP?: number;
  gems?: number;
  coins?: number;
}

export interface ExercisePerformanceMetrics {
  accuracy?: number;
  speed?: number; // Time in seconds
  streak?: number;
  attempts?: number;
}

export interface GamificationRewardResult {
  xpEarned: number;
  gemsEarned: number;
  coinsEarned: number;
  totalReward: number;
}

// ============================================
// HOOK
// ============================================

/**
 * Shared hook for managing gamification rewards (XP, gems, coins) across exercises.
 * Provides standardized reward calculation and distribution based on performance.
 *
 * @example
 * ```ts
 * const { grantReward, grantBonus, calculateReward } = useExerciseGamification();
 *
 * // Grant base reward
 * const result = grantReward({ baseXP: 10, gems: 2 });
 *
 * // Grant bonus for perfect performance
 * grantBonus('perfect', 5);
 * ```
 */
export function useExerciseGamification() {
  const { addXP, addGems, addCoins } = useGamificationStore();

  // Grant base reward
  const grantReward = useCallback((config: ExerciseRewardConfig): GamificationRewardResult => {
    const { baseXP, bonusXP = 0, gems = 0, coins = 0 } = config;

    const xpEarned = baseXP + bonusXP;
    const gemsEarned = gems;
    const coinsEarned = coins;
    const totalReward = xpEarned + (gemsEarned * 10) + coinsEarned;

    if (xpEarned > 0) addXP(xpEarned);
    if (gemsEarned > 0) addGems(gemsEarned);
    if (coinsEarned > 0) addCoins(coinsEarned);

    return {
      xpEarned,
      gemsEarned,
      coinsEarned,
      totalReward,
    };
  }, [addXP, addGems, addCoins]);

  // Grant bonus rewards for exceptional performance
  const grantBonus = useCallback((
    type: 'perfect' | 'fast' | 'streak' | 'milestone',
    multiplier?: number
  ) => {
    const bonusMultiplier = multiplier || 1;

    switch (type) {
      case 'perfect':
        return grantReward({
          baseXP: 0,
          bonusXP: Math.floor(10 * bonusMultiplier),
          gems: Math.floor(3 * bonusMultiplier),
        });
      case 'fast':
        return grantReward({
          baseXP: 0,
          bonusXP: Math.floor(5 * bonusMultiplier),
          gems: Math.floor(2 * bonusMultiplier),
        });
      case 'streak':
        return grantReward({
          baseXP: 0,
          bonusXP: Math.floor(15 * bonusMultiplier),
          gems: Math.floor(5 * bonusMultiplier),
        });
      case 'milestone':
        return grantReward({
          baseXP: 0,
          bonusXP: Math.floor(25 * bonusMultiplier),
          gems: Math.floor(10 * bonusMultiplier),
          coins: Math.floor(50 * bonusMultiplier),
        });
      default:
        return { xpEarned: 0, gemsEarned: 0, coinsEarned: 0, totalReward: 0 };
    }
  }, [grantReward]);

  // Calculate reward based on performance metrics
  const calculateReward = useCallback((
    baseConfig: ExerciseRewardConfig,
    metrics: ExercisePerformanceMetrics
  ): GamificationRewardResult => {
    const { accuracy = 100, speed = 0, streak = 0 } = metrics;

    let bonusXP = 0;
    let bonusGems = 0;

    // Accuracy bonus
    if (accuracy >= 100) {
      bonusXP += baseConfig.baseXP * 0.5;
      bonusGems += 2;
    } else if (accuracy >= 80) {
      bonusXP += baseConfig.baseXP * 0.25;
      bonusGems += 1;
    }

    // Speed bonus (fast completion)
    if (speed > 0 && speed < 3) {
      bonusXP += 5;
      bonusGems += 1;
    }

    // Streak bonus
    if (streak >= 5) {
      bonusXP += streak * 2;
      bonusGems += Math.floor(streak / 3);
    }

    return grantReward({
      ...baseConfig,
      bonusXP,
      gems: (baseConfig.gems || 0) + bonusGems,
    });
  }, [grantReward]);

  return {
    grantReward,
    grantBonus,
    calculateReward,
  };
}

// ============================================
// SPECIALIZED GAMIFICATION HOOKS
// ============================================

/**
 * Hook for managing XP rewards specifically.
 */
export function useExerciseXP() {
  const { addXP } = useGamificationStore();

  const addXPWithFeedback = useCallback((amount: number, reason?: string) => {
    addXP(amount);
    // Could trigger toast notification, animation, etc.
    return amount;
  }, [addXP]);

  const calculateXPMultiplier = useCallback((
    baseXP: number,
    metrics: ExercisePerformanceMetrics
  ): number => {
    const { accuracy = 100, speed = 0, streak = 0 } = metrics;
    let multiplier = 1;

    // Accuracy multiplier
    if (accuracy >= 100) multiplier += 0.5;
    else if (accuracy >= 80) multiplier += 0.25;

    // Speed multiplier
    if (speed > 0 && speed < 3) multiplier += 0.2;

    // Streak multiplier
    if (streak >= 3) multiplier += 0.1;
    if (streak >= 5) multiplier += 0.15;
    if (streak >= 10) multiplier += 0.25;

    return Math.floor(baseXP * multiplier);
  }, []);

  return {
    addXP: addXPWithFeedback,
    calculateXPMultiplier,
  };
}

/**
 * Hook for managing session statistics and achievements.
 */
export interface SessionStats {
  totalExercises: number;
  completedExercises: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalXP: number;
  averageTimePerExercise: number;
  streak: number;
}

export function useSessionStats() {
  const [stats, setStats] = useState<SessionStats>({
    totalExercises: 0,
    completedExercises: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    totalXP: 0,
    averageTimePerExercise: 0,
    streak: 0,
  });

  const recordExercise = useCallback((
    isCorrect: boolean,
    xpEarned: number,
    timeSpent: number
  ) => {
    setStats(prev => {
      const newCompleted = prev.completedExercises + 1;
      const newCorrect = isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers;
      const newIncorrect = !isCorrect ? prev.incorrectAnswers + 1 : prev.incorrectAnswers;
      const newTotalXP = prev.totalXP + xpEarned;
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newAvgTime = (prev.averageTimePerExercise * prev.completedExercises + timeSpent) / newCompleted;

      return {
        ...prev,
        completedExercises: newCompleted,
        correctAnswers: newCorrect,
        incorrectAnswers: newIncorrect,
        totalXP: newTotalXP,
        streak: newStreak,
        averageTimePerExercise: newAvgTime,
      };
    });
  }, []);

  const resetStats = useCallback(() => {
    setStats({
      totalExercises: 0,
      completedExercises: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalXP: 0,
      averageTimePerExercise: 0,
      streak: 0,
    });
  }, []);

  const accuracy = useMemo(() => {
    if (stats.completedExercises === 0) return 0;
    return (stats.correctAnswers / stats.completedExercises) * 100;
  }, [stats.completedExercises, stats.correctAnswers]);

  return {
    stats,
    recordExercise,
    resetStats,
    accuracy,
  };
}

import { useState } from 'react';
