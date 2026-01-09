import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLevelByXP, getRankByXP, STREAK_CONFIG, COIN_RULES, HP_CONFIG, type HunterRank } from '@/lib/constants';

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
  lastRankUpXP: number; // XP cuando subió de rango por última vez
  hp: number; // Salud (Health Points)
  streakFrozenUntil: string | null; // Fecha hasta la cual el streak está congelado

  // Acciones
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  updateStreak: () => { continued: boolean; lost: boolean; newStreak: number };
  freezeStreak: () => boolean; // Consume 5 gems, retorna true si exitoso
  reduceHP: (amount: number) => void;
  recoverHP: (amount: number) => void;
  canAccessPremium: () => boolean;
  resetGamification: () => void;
}

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

function getDateString(date: Date): string {
  // Ajustar por la hora de reset (4:00 AM)
  const adjusted = new Date(date);
  adjusted.setHours(adjusted.getHours() - STREAK_CONFIG.resetHour);
  return adjusted.toISOString().split('T')[0];
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXP: (amount) => {
        set((state) => {
          // Variable rewards: 10% probabilidad de "surge crítico" (doble XP)
          const isSurge = Math.random() < 0.1;
          const actualAmount = isSurge ? amount * 2 : amount;

          const newXP = state.xp + actualAmount;
          const levelInfo = getLevelByXP(newXP);
          const rankInfo = getRankByXP(newXP);
          const previousRank = state.rank;
          const previousLevel = state.level;

          // Verificar si subió de rango
          const rankUp = rankInfo.rank !== previousRank && rankInfo.xpRequired > state.lastRankUpXP;

          // Verificar si subió de nivel
          const leveledUp = levelInfo.level > previousLevel;

          // Mostrar notificación de surge si aplica
          if (isSurge && typeof window !== 'undefined') {
            // Disparar evento para animación de surge (se manejará en UI)
            window.dispatchEvent(new CustomEvent('xp-surge', { detail: { amount: actualAmount, original: amount } }));
          }

          // Disparar evento de XP ganado (para construcción rewards)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('xp-gained', { detail: { amount: actualAmount } }));
          }

          // Disparar evento de nivel subido (para construction bonuses)
          if (leveledUp && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('level-up', { detail: { newLevel: levelInfo.level, previousLevel } }));
          }

          return {
            xp: newXP,
            level: levelInfo.level,
            rank: rankInfo.rank,
            lastRankUpXP: rankUp ? newXP : state.lastRankUpXP,
          };
        });
      },

      addCoins: (amount) => {
        set((state) => ({
          coins: state.coins + amount,
        }));

        // Disparar evento de coins ganados (para feedback visual)
        if (typeof window !== 'undefined' && amount > 0) {
          window.dispatchEvent(new CustomEvent('coins-gained', { detail: { amount } }));
        }
      },

      addGems: (amount) => {
        set((state) => ({
          gems: state.gems + amount,
        }));
      },

      updateStreak: () => {
        const state = get();
        const now = new Date();
        const todayStr = getDateString(now);

        // Verificar si streak está congelado
        if (state.streakFrozenUntil) {
          const frozenUntil = new Date(state.streakFrozenUntil);
          if (now < frozenUntil) {
            // Streak congelado - no se pierde pero tampoco se incrementa
            return { continued: true, lost: false, newStreak: state.streak };
          } else {
            // Período de congelación expirado, limpiar
            set({ streakFrozenUntil: null });
          }
        }

        // Si ya se actualizó hoy, no hacer nada
        if (state.lastActiveDate === todayStr) {
          return { continued: true, lost: false, newStreak: state.streak };
        }

        // Si es la primera vez
        if (!state.lastActiveDate) {
          set({
            streak: 1,
            lastActiveDate: todayStr,
            longestStreak: Math.max(1, state.longestStreak),
          });
          return { continued: true, lost: false, newStreak: 1 };
        }

        // Calcular diferencia de días
        const lastDate = new Date(state.lastActiveDate);
        const diffTime = now.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Día consecutivo - streak continúa
          const newStreak = state.streak + 1;

          // Verificar milestone para bonus de coins
          let bonusCoins = 0;
          if (newStreak === 7) bonusCoins = COIN_RULES.streak7;
          if (newStreak === 30) bonusCoins = COIN_RULES.streak30;
          if (newStreak === 100) bonusCoins = COIN_RULES.streak100;

          set({
            streak: newStreak,
            lastActiveDate: todayStr,
            longestStreak: Math.max(newStreak, state.longestStreak),
            coins: state.coins + bonusCoins,
          });

          return { continued: true, lost: false, newStreak };
        } else if (diffDays > 1) {
          // Streak perdido (a menos que esté congelado)
          set({
            streak: 1,
            lastActiveDate: todayStr,
          });
          return { continued: false, lost: true, newStreak: 1 };
        }

        // Mismo día (no debería llegar aquí)
        return { continued: true, lost: false, newStreak: state.streak };
      },

      freezeStreak: () => {
        const state = get();
        
        // Verificar si tiene suficientes gems
        if (state.gems < 5) {
          return false;
        }

        // Congelar streak por 24 horas
        const frozenUntil = new Date();
        frozenUntil.setHours(frozenUntil.getHours() + 24);

        set({
          gems: state.gems - 5,
          streakFrozenUntil: frozenUntil.toISOString(),
        });

        return true;
      },

      reduceHP: (amount) => {
        set((state) => ({
          hp: Math.max(0, state.hp - amount),
        }));
      },

      recoverHP: (amount) => {
        set((state) => ({
          hp: Math.min(HP_CONFIG.maxHP, state.hp + amount),
        }));
      },

      canAccessPremium: () => {
        const state = get();
        return state.hp >= HP_CONFIG.minHPForPremium;
      },

      resetGamification: () => set(initialState),
    }),
    {
      name: 'french-app-gamification',
    }
  )
);
