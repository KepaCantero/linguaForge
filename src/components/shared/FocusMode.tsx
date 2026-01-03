'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusMode, useCognitiveLoad } from '@/store/useCognitiveLoadStore';

interface FocusModeProps {
  children: React.ReactNode;
  /** Activar focus automáticamente cuando se monta */
  autoActivate?: boolean;
  /** Nivel de focus inicial */
  initialLevel?: 'relaxed' | 'normal' | 'focused' | 'deep';
  /** Callback cuando se activa/desactiva */
  onFocusChange?: (active: boolean) => void;
  /** Mostrar controles de focus */
  showControls?: boolean;
  /** Mostrar indicador de carga cognitiva */
  showLoadIndicator?: boolean;
}

/**
 * FocusMode Component
 *
 * Envuelve contenido y gestiona el modo focus para reducir carga cognitiva extraña.
 * Cuando está activo:
 * - Oculta elementos de gamificación (XP, coins, etc.)
 * - Reduce animaciones
 * - Bloquea notificaciones visuales
 * - Aplica overlay sutil para concentración
 */
export function FocusMode({
  children,
  autoActivate = false,
  initialLevel = 'focused',
  onFocusChange,
  showControls = false,
  showLoadIndicator = false,
}: FocusModeProps) {
  const { isActive, level, enter, exit, toggle } = useFocusMode();
  const { load, status } = useCognitiveLoad();

  // Auto-activar si está configurado
  useEffect(() => {
    if (autoActivate && !isActive) {
      enter(initialLevel);
    }

    return () => {
      if (autoActivate && isActive) {
        exit();
      }
    };
  }, [autoActivate, initialLevel, isActive, enter, exit]);

  // Notificar cambios
  useEffect(() => {
    if (onFocusChange) {
      onFocusChange(isActive);
    }
  }, [isActive, onFocusChange]);

  // Atajos de teclado
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + F para toggle focus
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        toggle();
      }
    },
    [toggle]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Color del indicador de carga
  const getLoadColor = () => {
    switch (status) {
      case 'low':
        return 'bg-green-500';
      case 'optimal':
        return 'bg-blue-500';
      case 'high':
        return 'bg-amber-500';
      case 'overload':
        return 'bg-red-500';
    }
  };

  return (
    <div className="relative">
      {/* Overlay sutil cuando está en focus mode */}
      <AnimatePresence>
        {isActive && level !== 'relaxed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-40"
            style={{
              background:
                level === 'deep'
                  ? 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
                  : level === 'focused'
                  ? 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.2) 100%)'
                  : 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <div
        className={`transition-all duration-300 ${
          isActive ? 'focus-mode-active' : ''
        }`}
      >
        {children}
      </div>

      {/* Controles de focus */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 right-4 z-50"
        >
          <button
            onClick={toggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            title="Toggle Focus Mode (Ctrl+Shift+F)"
          >
            <span className="text-lg">{isActive ? '🎯' : '👁️'}</span>
            <span className="text-sm font-medium">
              {isActive ? `Focus: ${level}` : 'Focus'}
            </span>
          </button>
        </motion.div>
      )}

      {/* Indicador de carga cognitiva */}
      {showLoadIndicator && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3"
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Carga Cognitiva
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getLoadColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${load.total}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {Math.round(load.total)}%
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
            <div className="text-center">
              <div className="text-gray-400">Intrín.</div>
              <div className="font-medium">{Math.round(load.intrinsic)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Extrán.</div>
              <div className="font-medium">{Math.round(load.extraneous)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">German.</div>
              <div className="font-medium">{Math.round(load.germane)}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* CSS para ocultar elementos durante focus mode */}
      <style jsx global>{`
        .focus-mode-active .hide-on-focus,
        .focus-mode-active [data-hide-on-focus="true"] {
          opacity: 0 !important;
          pointer-events: none !important;
          transition: opacity 0.3s ease;
        }

        .focus-mode-active .reduce-on-focus,
        .focus-mode-active [data-reduce-on-focus="true"] {
          opacity: 0.3 !important;
          transition: opacity 0.3s ease;
        }

        .focus-mode-active .no-animation-on-focus,
        .focus-mode-active [data-no-animation-on-focus="true"] {
          animation: none !important;
          transition: none !important;
        }
      `}</style>
    </div>
  );
}

/**
 * Hook para usar Focus Mode en componentes
 */
export function useFocusModeContext() {
  const { isActive, level, enter, exit, toggle, autoEnabled, setAutoEnabled } =
    useFocusMode();

  return {
    isActive,
    level,
    enter,
    exit,
    toggle,
    autoEnabled,
    setAutoEnabled,
  };
}

/**
 * Componente para envolver elementos que deben ocultarse durante focus
 */
export function HideOnFocus({ children }: { children: React.ReactNode }) {
  return (
    <div className="hide-on-focus" data-hide-on-focus="true">
      {children}
    </div>
  );
}

/**
 * Componente para envolver elementos que deben reducirse durante focus
 */
export function ReduceOnFocus({ children }: { children: React.ReactNode }) {
  return (
    <div className="reduce-on-focus" data-reduce-on-focus="true">
      {children}
    </div>
  );
}
