import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppLanguage } from '@/i18n';

// Tipos
export type LearningMode = 'guided' | 'autonomous';
export type TargetLanguage = 'fr'; // MVP: solo francés, extensible

interface UserState {
  // Configuración de la app
  appLanguage: AppLanguage;

  // Configuración de aprendizaje
  targetLanguage: TargetLanguage;
  mode: LearningMode;

  // Estado de onboarding
  hasCompletedOnboarding: boolean;

  // Preferencias
  dailyGoal: number; // minutos
  notifications: boolean;
}

interface UserActions {
  // Setters
  setAppLanguage: (lang: AppLanguage) => void;
  setMode: (mode: LearningMode) => void;
  setDailyGoal: (minutes: number) => void;
  setNotifications: (enabled: boolean) => void;

  // Onboarding
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Reset
  resetUser: () => void;
}

type UserStore = UserState & UserActions;

const initialState: UserState = {
  appLanguage: 'es',
  targetLanguage: 'fr',
  mode: 'guided',
  hasCompletedOnboarding: false,
  dailyGoal: 10,
  notifications: true,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAppLanguage: (appLanguage) => set({ appLanguage }),

      setMode: (mode) => set({ mode }),

      setDailyGoal: (dailyGoal) => set({ dailyGoal }),

      setNotifications: (notifications) => set({ notifications }),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      resetOnboarding: () => set({ hasCompletedOnboarding: false }),

      resetUser: () => set(initialState),
    }),
    {
      name: 'linguaforge-user',
      // Asegurar que la persistencia funcione correctamente
      partialize: (state) => ({
        appLanguage: state.appLanguage,
        targetLanguage: state.targetLanguage,
        mode: state.mode,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        dailyGoal: state.dailyGoal,
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => () => {
        // Rehidratación completada
      },
    }
  )
);

// Hook helper para obtener traducciones basadas en el idioma del usuario
export function useAppLanguage() {
  return useUserStore((state) => state.appLanguage);
}

export function useLearningMode() {
  return useUserStore((state) => state.mode);
}

export function useHasCompletedOnboarding() {
  return useUserStore((state) => state.hasCompletedOnboarding);
}
