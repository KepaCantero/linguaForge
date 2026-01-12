import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLevelByXP, getRankByXP, STREAK_CONFIG, COIN_RULES, HP_CONFIG, type HunterRank } from '@/lib/constants';

// ============================================================
// TYPES
// ============================================================

interface GamificationStore {
  // Estado
  xp: number;
  level: number;
  rank: HunterRank;
  coins: number;
  gems: number;
  streak: number;
  lastActiveDate: string | null;
  longestStreak: number;
  lastRankUpXP: number;
  hp: number;
  streakFrozenUntil: string | null;

  // Acciones
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  updateStreak: () => { continued: boolean; lost: boolean; newStreak: number };
  freezeStreak: () => boolean;
  reduceHP: (amount: number) => void;
  recoverHP: (amount: number) => void;
  canAccessPremium: () => boolean;
  resetGamification: () => void;
}

// ============================================================
// CONSTANTS
// ============================================================

const initialState = {
  xp: 0,
  level: 1,
  rank: 'E' as HunterRank,
  coins: 0,
  gems: 0,
  streak: 0,
  lastActiveDate: null as string | null,
  longestStreak: 0,
  lastRankUpXP: 0,
  hp: HP_CONFIG.maxHP,
  streakFrozenUntil: null as string | null,
};

const SURGE_CHANCE = 0.1;
const STREAK_MILESTONES = [7, 30, 100] as const;
const GEMS_FOR_FREEZE = 5;
const FREEZE_HOURS = 24;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDateString(date: Date): string {
  const adjusted = new Date(date);
  adjusted.setHours(adjusted.getHours() - STREAK_CONFIG.resetHour);
  return adjusted.toISOString().split('T')[0];
}

function calculateXPWithSurge(amount: number): { actualAmount: number; isSurge: boolean } {
  const isSurge = Math.random() < SURGE_CHANCE;
  const actualAmount = isSurge ? amount * 2 : amount;
  return { actualAmount, isSurge };
}

function dispatchXPEvents(actualAmount: number, originalAmount: number, leveledUp: boolean, newLevel: number, previousLevel: number): void {
  if (typeof window === 'undefined') return;

  if (actualAmount !== originalAmount) {
    globalThis.dispatchEvent(new CustomEvent('xp-surge', { detail: { amount: actualAmount, original: originalAmount } }));
  }

  globalThis.dispatchEvent(new CustomEvent('xp-gained', { detail: { amount: actualAmount } }));

  if (leveledUp) {
    globalThis.dispatchEvent(new CustomEvent('level-up', { detail: { newLevel, previousLevel } }));
  }
}

function calculateStreakBonus(newStreak: number): number {
  if (STREAK_MILESTONES.includes(newStreak as typeof STREAK_MILESTONES[number])) {
    return COIN_RULES[`streak${newStreak}` as keyof typeof COIN_RULES] ?? 0;
  }
  return 0;
}

function isStreakFrozen(stamp: string | null, now: Date): boolean {
  if (!stamp) return false;
  return now < new Date(stamp);
}

function calculateNewStreak(
  currentStreak: number,
  lastActiveDate: string | null,
  now: Date,
  longestStreak: number,
  currentCoins: number
): { streak: number; lastActiveDate: string; longestStreak: number; coins: number; continued: boolean; lost: boolean } {
  const todayStr = getDateString(now);

  if (!lastActiveDate) {
    return { streak: 1, lastActiveDate: todayStr, longestStreak: Math.max(1, longestStreak), coins: currentCoins, continued: true, lost: false };
  }

  if (lastActiveDate === todayStr) {
    return { streak: currentStreak, lastActiveDate: todayStr, longestStreak, coins: currentCoins, continued: true, lost: false };
  }

  const lastDate = new Date(lastActiveDate);
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    const newStreak = currentStreak + 1;
    const bonusCoins = calculateStreakBonus(newStreak);
    return {
      streak: newStreak,
      lastActiveDate: todayStr,
      longestStreak: Math.max(newStreak, longestStreak),
      coins: currentCoins + bonusCoins,
      continued: true,
      lost: false,
    };
  }

  return { streak: 1, lastActiveDate: todayStr, longestStreak, coins: currentCoins, continued: false, lost: true };
}

// ============================================================
// STORE
// ============================================================

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXP: (amount) => {
        set((state) => {
          const { actualAmount } = calculateXPWithSurge(amount);
          const newXP = state.xp + actualAmount;
          const levelInfo = getLevelByXP(newXP);
          const rankInfo = getRankByXP(newXP);
          const previousRank = state.rank;
          const previousLevel = state.level;

          const rankUp = rankInfo.rank !== previousRank && rankInfo.xpRequired > state.lastRankUpXP;
          const leveledUp = levelInfo.level > previousLevel;

          dispatchXPEvents(actualAmount, amount, leveledUp, levelInfo.level, previousLevel);

          return {
            xp: newXP,
            level: levelInfo.level,
            rank: rankInfo.rank,
            lastRankUpXP: rankUp ? newXP : state.lastRankUpXP,
          };
        });
      },

      addCoins: (amount) => {
        set((state) => ({ coins: state.coins + amount }));

        if (typeof window !== 'undefined' && amount > 0) {
          globalThis.dispatchEvent(new CustomEvent('coins-gained', { detail: { amount } }));
        }
      },

      addGems: (amount) => {
        set((state) => ({ gems: state.gems + amount }));
      },

      updateStreak: () => {
        const state = get();
        const now = new Date();

        if (isStreakFrozen(state.streakFrozenUntil, now)) {
          return { continued: true, lost: false, newStreak: state.streak };
        }

        if (state.streakFrozenUntil) {
          set({ streakFrozenUntil: null });
        }

        const result = calculateNewStreak(
          state.streak,
          state.lastActiveDate,
          now,
          state.longestStreak,
          state.coins
        );

        set({
          streak: result.streak,
          lastActiveDate: result.lastActiveDate,
          longestStreak: result.longestStreak,
          coins: result.coins,
        });

        return { continued: result.continued, lost: result.lost, newStreak: result.streak };
      },

      freezeStreak: () => {
        const state = get();

        if (state.gems < GEMS_FOR_FREEZE) {
          return false;
        }

        const frozenUntil = new Date();
        frozenUntil.setHours(frozenUntil.getHours() + FREEZE_HOURS);

        set({
          gems: state.gems - GEMS_FOR_FREEZE,
          streakFrozenUntil: frozenUntil.toISOString(),
        });

        return true;
      },

      reduceHP: (amount) => {
        set((state) => ({ hp: Math.max(0, state.hp - amount) }));
      },

      recoverHP: (amount) => {
        set((state) => ({ hp: Math.min(HP_CONFIG.maxHP, state.hp + amount) }));
      },

      canAccessPremium: () => {
        return get().hp >= HP_CONFIG.minHPForPremium;
      },

      resetGamification: () => set(initialState),
    }),
    {
      name: 'french-app-gamification',
    }
  )
);
