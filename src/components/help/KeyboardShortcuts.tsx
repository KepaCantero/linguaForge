'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ============================================
// DATOS DE ATAJOS
// ============================================

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  category: string;
  shortcuts: ShortcutItem[];
}

const SHORTCUTS: ShortcutCategory[] = [
  {
    category: 'Ejercicios',
    shortcuts: [
      { keys: ['1', '2', '3', '4'], description: 'Seleccionar opción 1-4' },
      { keys: ['Espacio'], description: 'Reproducir audio' },
      { keys: ['Enter'], description: 'Confirmar respuesta' },
      { keys: ['Esc'], description: 'Salir del modo Focus' },
    ],
  },
  {
    category: 'Repaso SRS',
    shortcuts: [
      { keys: ['Espacio'], description: 'Mostrar respuesta' },
      { keys: ['1'], description: 'Otra vez (olvidé)' },
      { keys: ['2'], description: 'Difícil (costó recordar)' },
      { keys: ['3'], description: 'Bien (recordé)' },
      { keys: ['4'], description: 'Fácil (instantáneo)' },
    ],
  },
  {
    category: 'Navegación',
    shortcuts: [
      { keys: ['?'], description: 'Mostrar atajos (esta ventana)' },
      { keys: ['G', 'luego', 'D'], description: 'Ir al Dashboard' },
      { keys: ['G', 'luego', 'L'], description: 'Ir al Mapa de Aprendizaje' },
      { keys: ['G', 'luego', 'R'], description: 'Ir a Repaso' },
    ],
  },
  {
    category: 'General',
    shortcuts: [
      { keys: ['Ctrl', '+', 'K'], description: 'Búsqueda rápida' },
      { keys: ['Esc'], description: 'Cerrar modal / Salir' },
    ],
  },
];

// ============================================
// MODAL DE ATAJOS
// ============================================

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const prefersReduced = useReducedMotion();

  // Cerrar con Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    globalThis.addEventListener('keydown', handleEsc);
    return () => globalThis.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm cursor-pointer border-0 p-0"
            onClick={onClose}
            aria-label="Cerrar atajos de teclado"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: prefersReduced ? 0.1 : 0.2 }}
            className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-2xl max-h-[80vh] overflow-hidden
                         bg-lf-soft rounded-2xl border border-lf-primary/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-lf-primary/10">
                <h2 id="shortcuts-title" className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-lf-accent">⌨️</span>
                  Atajos de Teclado
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full
                             text-lf-muted hover:text-white hover:bg-lf-primary/20
                             transition-colors focus:outline-none focus:ring-2 focus:ring-lf-primary"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <div className="space-y-6">
                  {SHORTCUTS.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-lg font-semibold text-lf-primary mb-3">
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.shortcuts.map((shortcut, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 px-3
                                       bg-lf-dark/50 rounded-lg"
                          >
                            <span className="text-white/80">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, kidx) => (
                                <span key={kidx} className="flex items-center">
                                  {key === '+' || key === 'luego' ? (
                                    <span className="text-lf-muted mx-1 text-xs">{key}</span>
                                  ) : (
                                    <kbd className="px-2 py-1 bg-lf-muted/50 rounded text-sm font-mono text-white min-w-[28px] text-center">
                                      {key}
                                    </kbd>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-lf-primary/10 bg-lf-dark/30">
                <p className="text-sm text-lf-muted text-center">
                  Presiona{' '}
                  <kbd className="px-2 py-0.5 bg-lf-muted/50 rounded text-xs font-mono">?</kbd>
                  {' '}en cualquier momento para ver esta guía
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// HOOK PARA ACTIVAR CON "?"
// ============================================

export function useKeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si está en un input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Abrir con "?"
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggle();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return { isOpen, open, close, toggle };
}
