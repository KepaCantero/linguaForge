'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'linguaforge-theme';

/**
 * Hook para gestionar el tema de la aplicación (light/dark mode)
 *
 * Características:
 * - Persistencia en localStorage
 * - Detección de preferencia del sistema
 * - Evita flash de contenido incorrecto (FOUC)
 * - Sincronización con clase .dark en HTML
 * - SSR-safe: no accede a window/localStorage durante el renderizado
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Inicializar tema desde localStorage o preferencia del sistema
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      const initialTheme = storedTheme || 'system';
      setThemeState(initialTheme);
    } catch (e) {
      // Si localStorage no está disponible, usar sistema
      console.warn('localStorage not available:', e);
    }
    setMounted(true);
  }, []);

  // Aplicar tema al documento HTML
  const applyTheme = (theme: Theme) => {
    if (typeof window === 'undefined') return;

    try {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    } catch (e) {
      console.warn('Error applying theme:', e);
    }
  };

  // Cambiar tema
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
    applyTheme(newTheme);
  };

  // Obtener tema actual resuelto (light, dark, o system)
  const resolvedTheme =
    theme === 'system'
      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark'
        : 'light'
      : theme;

  // Aplicar tema cuando cambie
  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
  }, [theme, mounted]);

  // Escuchar cambios en preferencia del sistema
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return {
    theme,
    setTheme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    mounted,
  };
}
