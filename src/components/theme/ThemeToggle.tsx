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
      className="relative w-10 h-10 rounded-full bg-slate-700 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-lf-accent focus:ring-offset-2 focus:ring-offset-slate-900"
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      title={`Modo ${isDark ? 'oscuro' : 'claro'} - Click para cambiar`}
    >
      {/* Icono con animación */}
      <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300">
        <span className={`transition-opacity duration-300 ${isDark ? 'opacity-0 rotate-90' : 'opacity-100'}`}>
          <Sun className="w-5 h-5 text-yellow-400" />
        </span>
        <span className={`transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0 -rotate-90'}`}>
          <Moon className="w-5 h-5 text-blue-300" />
        </span>
      </span>

      {/* Indicador visual del estado */}
      <span
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full transition-all duration-300 ${
          isDark ? 'bg-blue-300 translate-y-[-2px]' : 'bg-yellow-400'
        }`}
      />
    </button>
  );
}
