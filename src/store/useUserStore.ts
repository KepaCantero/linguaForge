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

      setAppLanguage: (appLanguage) => {
        console.log('[UserStore] setAppLanguage:', appLanguage);
        set({ appLanguage });

        // Verificar que se guardó
        setTimeout(() => {
          const stored = localStorage.getItem('linguaforge-user');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              console.log('[UserStore] LocalStorage appLanguage después de setAppLanguage:', parsed.state?.appLanguage);
            } catch (e) {
              console.error('[UserStore] Error verificando localStorage:', e);
            }
          }
        }, 100);
      },

      setMode: (mode) => {
        console.log('[UserStore] setMode:', mode);
        set({ mode });

        // Verificar que se guardó
        setTimeout(() => {
          const stored = localStorage.getItem('linguaforge-user');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              console.log('[UserStore] LocalStorage mode después de setMode:', parsed.state?.mode);
            } catch (e) {
              console.error('[UserStore] Error verificando localStorage:', e);
            }
          }
        }, 100);
      },

      setDailyGoal: (dailyGoal) => set({ dailyGoal }),

      setNotifications: (notifications) => set({ notifications }),

      completeOnboarding: () => {
        console.log('[UserStore] completeOnboarding llamado');
        set({ hasCompletedOnboarding: true });

        // Verificar que se guardó
        setTimeout(() => {
          const stored = localStorage.getItem('linguaforge-user');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              console.log('[UserStore] Después de completeOnboarding, hasCompletedOnboarding:', parsed.state?.hasCompletedOnboarding);
            } catch (e) {
              console.error('[UserStore] Error verificando localStorage:', e);
            }
          } else {
            console.error('[UserStore] ERROR: localStorage vacío después de completeOnboarding!');
          }
        }, 100);
      },

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
      onRehydrateStorage: () => (state) => {
        console.log('[UserStore] Rehidratando store...');
        console.log('[UserStore] Estado cargado:', state);
        if (state) {
          console.log('[UserStore] appLanguage:', state.appLanguage);
          console.log('[UserStore] mode:', state.mode);
          console.log('[UserStore] hasCompletedOnboarding:', state.hasCompletedOnboarding);
        }
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
