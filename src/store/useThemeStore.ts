/**
 * Store para manejo de tema (Light/Dark mode)
 *
 * Persiste la preferencia del usuario y la sincroniza con system preference
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
        const resolved = resolveTheme(mode);
        set({ mode, resolved });

        // Apply theme to HTML element
        if (typeof window !== 'undefined') {
          const html = document.documentElement;
          html.classList.remove('light', 'dark');
          html.classList.add(resolved);
        }
      },

      toggleTheme: () => {
        const { resolved } = get();
        const newTheme: ResolvedTheme = resolved === 'dark' ? 'light' : 'dark';
        set({
          mode: newTheme,
          resolved: newTheme,
        });

        // Apply theme to HTML element
        if (typeof window !== 'undefined') {
          const html = document.documentElement;
          html.classList.remove('light', 'dark');
          html.classList.add(newTheme);
        }
      },

      getTheme: () => {
        return get().resolved;
      },
    }),
    {
      name: 'linguaforge-theme',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state && typeof window !== 'undefined') {
          const html = document.documentElement;
          html.classList.remove('light', 'dark');
          html.classList.add(state.resolved);
        }
      },
    }
  )
);

// Initial theme application
if (typeof window !== 'undefined') {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('linguaforge-theme');
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      const theme = parsed.state?.resolved || 'dark';
      html.classList.remove('light', 'dark');
      html.classList.add(theme);
    } catch {
      // If parsing fails, use dark theme
      html.classList.remove('light');
      html.classList.add('dark');
    }
  } else {
    html.classList.add('dark');
  }
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook para obtener el tema resuelto y función para cambiarlo
 */
export function useTheme() {
  const { mode, resolved, setTheme, toggleTheme } = useThemeStore();

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
  const { isDark } = useTheme();

  return {
    root: isDark ? 'dark' : 'light',
    background: isDark ? 'bg-calm-bg-primary' : 'bg-calm-bg-primary',
    foreground: isDark ? 'text-white' : 'text-calm-text-primary',
    card: isDark ? 'bg-calm-bg-elevated' : 'bg-white',
    cardBorder: isDark ? 'border-calm-warm-200' : 'border-calm-warm-100',
    input: isDark ? 'bg-calm-bg-tertiary border-calm-warm-200 text-white' : 'bg-white border-calm-warm-200 text-calm-text-primary',
    muted: isDark ? 'text-calm-text-muted' : 'text-calm-text-secondary',
  };
}
