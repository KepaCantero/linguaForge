/**
 * Store para manejo de tema (Light/Dark mode)
 *
 * Persiste la preferencia del usuario y la sincroniza con system preference
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TIPOS
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  resolved: ResolvedTheme;

  // Acciones
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // Getters
  getTheme: () => ResolvedTheme;
}

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene el tema preferido del sistema
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Resuelve el tema actual basado en el modo
 */
function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
}

// ============================================
// STORE
// ============================================

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      resolved: 'dark',

      setTheme: (mode) => {
        set({
          mode,
          resolved: resolveTheme(mode),
        });
      },

      toggleTheme: () => {
        const { resolved } = get();
        const newTheme: ResolvedTheme = resolved === 'dark' ? 'light' : 'dark';
        set({
          mode: newTheme,
          resolved: newTheme,
        });
      },

      getTheme: () => {
        return get().resolved;
      },
    }),
    {
      name: 'linguaforge-theme',
    }
  )
);

// ============================================
// HOOKS
// ============================================

/**
 * Hook para obtener el tema resuelto y función para cambiarlo
 */
export function useTheme() {
  const { mode, resolved, setTheme, toggleTheme, getTheme } = useThemeStore();

  // Escuchar cambios en preferencia del sistema cuando mode='system'
  if (typeof window !== 'undefined' && mode === 'system') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const systemTheme = getSystemTheme();
      // Actualizar solo si cambió
      if (resolveTheme(mode) !== systemTheme) {
        setTheme(mode);
      }
    });
  }

  return {
    theme: resolved,
    mode,
    setTheme,
    toggleTheme,
    isDark: resolved === 'dark',
    isLight: resolved === 'light',
  };
}

/**
 * Hook para obtener clases CSS según el tema
 */
export function useThemeClasses() {
  const { isDark, isLight } = useTheme();

  return {
    root: isDark ? 'dark' : 'light',
    background: isDark ? 'bg-slate-900' : 'bg-gray-50',
    foreground: isDark ? 'text-white' : 'text-gray-900',
    card: isDark ? 'bg-slate-800' : 'bg-white',
    cardBorder: isDark ? 'border-slate-700' : 'border-gray-200',
    input: isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900',
    muted: isDark ? 'text-slate-400' : 'text-gray-600',
  };
}
