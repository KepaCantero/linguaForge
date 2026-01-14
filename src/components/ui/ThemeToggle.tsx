'use client';

import { motion } from 'framer-motion';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { CALM_EASING } from '@/lib/animations';

/**
 * ThemeToggle Component
 *
 * Botón para alternar entre light/dark/system theme
 * Diseño calm, no agresivo, con animaciones suaves
 */
export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();

  // Evitar render hasta que el componente esté montado (prevenir FOUC)
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-calm-bg-elevated border border-calm-warm-100 animate-pulse" />
    );
  }

  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Modo claro' },
    { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Modo oscuro' },
    { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'Sistema' },
  ];

  const currentIndex = options.findIndex((opt) => opt.value === theme);
  const nextIndex = (currentIndex + 1) % options.length;
  const nextOption = options[nextIndex];

  return (
    <motion.button
      onClick={() => setTheme(nextOption.value)}
      className="relative w-10 h-10 rounded-xl bg-calm-bg-elevated border border-calm-warm-100 flex items-center justify-center overflow-hidden"
      whileHover={{
        boxShadow: 'var(--shadow-soft-md)',
        borderColor: 'var(--accent-500)',
      }}
      whileTap={{ opacity: 0.9 }}
      transition={{
        duration: 0.3,
        ease: CALM_EASING.gentle,
      }}
      aria-label={`Cambiar tema. Actual: ${nextOption.label}`}
      title={nextOption.label}
    >
      {/* Icono actual con animación de fade */}
      <motion.div
        key={theme}
        initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
        transition={{
          duration: 0.3,
          ease: CALM_EASING.gentle,
        }}
        className="text-calm-text-primary"
      >
        {options[currentIndex].icon}
      </motion.div>

      {/* Tooltip en hover */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-calm-bg-tertiary text-calm-text-secondary text-xs rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 pointer-events-none transition-opacity">
        {nextOption.label}
      </span>
    </motion.button>
  );
}

/**
 * ThemeToggleWithLabel - Versión con etiqueta para configuraciones
 */
export function ThemeToggleWithLabel() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-calm-bg-elevated border border-calm-warm-100">
        <span className="text-calm-text-primary">Tema</span>
        <div className="w-10 h-10 rounded-xl bg-calm-bg-secondary animate-pulse" />
      </div>
    );
  }

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Claro', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Oscuro', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'Sistema', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-calm-bg-elevated border border-calm-warm-100">
      <span className="font-medium text-calm-text-primary">Tema</span>

      <div className="flex items-center gap-2">
        {options.map((option) => {
          const isActive = theme === option.value;
          return (
            <motion.button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`
                relative px-4 py-2 rounded-lg font-medium text-sm
                flex items-center gap-2 transition-colors
                ${isActive
                  ? 'bg-accent-500 text-white'
                  : 'bg-calm-bg-secondary text-calm-text-secondary hover:text-calm-text-primary'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              aria-label={option.label}
              aria-pressed={isActive}
            >
              {option.icon}
              <span>{option.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
