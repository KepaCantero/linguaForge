/**
 * FocusMode Component
 * Componente que permite al usuario entrar en un estado de concentración sin distracciones
 * Oculta elementos del UI y mantiene solo el contenido esencial del aprendizaje
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Maximize2, Timer } from 'lucide-react';

// ============================================
// TIPOS
// ============================================

export interface FocusModeConfig {
  onEnter?: () => void;
  onExit?: (duration: number) => void;
  showTimer?: boolean;
  allowBreak?: boolean;
  autoHideCursor?: boolean;
  dimBackground?: boolean;
}

interface FocusModeProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  children: React.ReactNode;
  config?: FocusModeConfig;
}

interface FocusTimerProps {
  startTime: number;
  isRunning: boolean;
}

// ============================================
// UTILIDADES
// ============================================

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  if (minutes > 0) {
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }
  return `${seconds}s`;
}

// ============================================
// COMPONENTE TIMER
// ============================================

function FocusTimer({ startTime, isRunning }: FocusTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isRunning]);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full">
      <Timer className="w-4 h-4 text-green-400" />
      <span className="text-white font-mono text-sm">{formatDuration(elapsed)}</span>
    </div>
  );
}

// ============================================
// COMPONENTE FOCUS MODE
// ============================================

export function FocusMode({
  isActive,
  onToggle,
  children,
  config = {},
}: FocusModeProps) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showExitHint, setShowExitHint] = useState(false);

  // Manejar entrada a focus mode
  const handleEnter = useCallback(() => {
    setStartTime(Date.now());
    setIsMinimized(false);
    config.onEnter?.();

    if (config.autoHideCursor) {
      document.body.style.cursor = 'none';
    }
  }, [config]);

  // Manejar salida de focus mode
  const handleExit = useCallback(() => {
    const duration = startTime ? Date.now() - startTime : 0;
    config.onExit?.(duration);

    if (config.autoHideCursor) {
      document.body.style.cursor = '';
    }

    onToggle(false);
  }, [startTime, config, onToggle]);

  // Manejar tecla ESC para salir
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (config.allowBreak) {
          handleExit();
        } else {
          setShowExitHint(true);
          setTimeout(() => setShowExitHint(false), 2000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, config.allowBreak, handleExit]);

  // Inicializar timer al entrar
  useEffect(() => {
    if (isActive && !startTime) {
      handleEnter();
    }
  }, [isActive, startTime, handleEnter]);

  // Dim background cuando está activo
  useEffect(() => {
    if (!config.dimBackground) return;

    if (isActive) {
      document.body.classList.add('focus-mode-active');
    } else {
      document.body.classList.remove('focus-mode-active');
    }

    return () => {
      document.body.classList.remove('focus-mode-active');
    };
  }, [isActive, config.dimBackground]);

  return (
    <>
      {/* Botón toggle */}
      <AnimatePresence>
        {!isActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => onToggle(true)}
            className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            title="Entrar en Modo Focus"
          >
            <Maximize2 className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {isActive && (
          <>
            {/* Overlay de fondo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-sm z-40"
              onClick={() => {
                if (config.allowBreak) {
                  handleExit();
                }
              }}
            />

            {/* Contenido */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`fixed inset-4 z-50 ${
                isMinimized ? 'top-4 right-4 bottom-auto left-auto w-auto h-auto' : 'inset-4'
              }`}
            >
              <div className="h-full flex flex-col bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <h2 className="text-white font-semibold">Modo Focus</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Timer */}
                    {config.showTimer !== false && startTime && (
                      <FocusTimer startTime={startTime} isRunning={true} />
                    )}

                    {/* Minimizar */}
                    <button
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title={isMinimized ? 'Maximizar' : 'Minimizar'}
                    >
                      {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                    </button>

                    {/* Salir */}
                    <button
                      onClick={handleExit}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Salir (ESC)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Contenido minimizado */}
                {isMinimized ? (
                  <div className="px-6 py-4">
                    <p className="text-gray-400 text-sm">Modo Focus activo...</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto p-6">
                    {children}
                  </div>
                )}

                {/* Footer con hint */}
                {showExitHint && !config.allowBreak && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-6 py-3 bg-yellow-500/10 border-t border-yellow-500/20"
                  >
                    <p className="text-yellow-200 text-sm text-center">
                      Modo Focus activo - Las pausas están deshabilitadas para mantener la concentración
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Estilos globales para Focus Mode */}
      <style jsx global>{`
        body.focus-mode-active {
          overflow: hidden;
        }

        body.focus-mode-active * {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}

// ============================================
// HOOK PERSONALIZADO
// ============================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useFocusMode(_config?: FocusModeConfig) {
  const [isActive, setIsActive] = useState(false);

  const toggle = useCallback((active: boolean) => {
    setIsActive(active);
  }, []);

  const enter = useCallback(() => {
    setIsActive(true);
  }, []);

  const exit = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    toggle,
    enter,
    exit,
    FocusModeComponent: FocusMode,
  };
}
