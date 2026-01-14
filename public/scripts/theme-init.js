/**
 * Theme Initialization Script
 * Previene FOUC (Flash of Unstyled Content) cargando el tema inmediatamente
 * Este script se ejecuta antes que cualquier otro JavaScript de la aplicación
 *
 * NOTA: Este script debe cargarse con defer para ejecutarse después del parseo del DOM
 * pero antes de que se renderice el contenido principal.
 */

(function() {
  // Verificar que estamos en el navegador
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  try {
    const THEME_KEY = 'linguaforge-theme';
    const theme = localStorage.getItem(THEME_KEY) || 'system';

    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Aplicar la clase correspondiente al documentElement
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // Fallback: usar preferencia del sistema si hay error con localStorage
    try {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } catch (fallbackError) {
      // Último fallback: light mode por defecto
      document.documentElement.classList.add('light');
    }
  }
})();
