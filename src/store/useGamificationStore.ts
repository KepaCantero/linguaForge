import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLevelByXP, STREAK_CONFIG, COIN_RULES } from '@/lib/constants';

interface GamificationStore {
  // Estado
  xp: number;
  level: number;
  coins: number;
  gems: number;
  streak: number;
  lastActiveDate: string | null;
  longestStreak: number;

  // Acciones
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  updateStreak: () => { continued: boolean; lost: boolean; newStreak: number };
  resetGamification: () => void;
}

const initialState = {
  xp: 0,
  level: 1,
  coins: 0,
  gems: 0,
  streak: 0,
  lastActiveDate: null as string | null,
  longestStreak: 0,
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
          const newXP = state.xp + amount;
          const levelInfo = getLevelByXP(newXP);
          return {
            xp: newXP,
            level: levelInfo.level,
          };
        });
      },

      addCoins: (amount) => {
        set((state) => ({
          coins: state.coins + amount,
        }));
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
          // Streak perdido
          set({
            streak: 1,
            lastActiveDate: todayStr,
          });
          return { continued: false, lost: true, newStreak: 1 };
        }

        // Mismo día (no debería llegar aquí)
        return { continued: true, lost: false, newStreak: state.streak };
      },

      resetGamification: () => set(initialState),
    }),
    {
      name: 'french-app-gamification',
    }
  )
);
