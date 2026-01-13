/**
 * ThemeToggle - Botón para cambiar entre modo claro y oscuro
 *
 * Componente accesible que persiste la preferencia del usuario
 */

'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/store/useThemeStore';

export function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full bg-calm-bg-tertiary dark:bg-calm-bg-tertiary hover:bg-calm-warm-200 dark:hover:bg-calm-bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-calm-bg-tertiary"
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      title={`Modo ${isDark ? 'oscuro' : 'claro'} - Click para cambiar`}
    >
      {/* Icono con animación */}
      <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300">
        <span className={`transition-opacity duration-300 ${isDark ? 'opacity-0 rotate-90' : 'opacity-100'}`}>
          <Sun className="w-5 h-5 text-amber-400" />
        </span>
        <span className={`transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0 -rotate-90'}`}>
          <Moon className="w-5 h-5 text-sky-300" />
        </span>
      </span>

      {/* Indicador visual del estado */}
      <span
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full transition-all duration-300 ${
          isDark ? 'bg-sky-300 translate-y-[-2px]' : 'bg-amber-400'
        }`}
      />
    </button>
  );
}
