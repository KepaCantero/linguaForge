'use client';

import { useState, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { KeyboardShortcutsModal, useKeyboardShortcutsModal } from './KeyboardShortcuts';
import { TutorialContext } from '../tutorial/TutorialProvider';
import { WelcomeModal, useWelcomeModal } from '../onboarding';

// ============================================
// TIPOS
// ============================================

interface HelpOption {
  icon: string;
  label: string;
  description: string;
  action: () => void;
}

// Hook seguro para tutorial (no lanza error si no hay provider)
function useTutorialSafe() {
  return useContext(TutorialContext);
}

// ============================================
// COMPONENTE
// ============================================

export function HelpButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const shortcuts = useKeyboardShortcutsModal();
  const welcome = useWelcomeModal();
  const prefersReduced = useReducedMotion();

  // El tutorial puede no estar disponible (es opcional)
  const tutorial = useTutorialSafe();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const helpOptions: HelpOption[] = [
    {
      icon: '🚀',
      label: 'Ver introducción',
      description: 'Tour de la app',
      action: () => {
        closeMenu();
        welcome.open();
      },
    },
    {
      icon: '⌨️',
      label: 'Atajos de teclado',
      description: 'Ver todos los atajos',
      action: () => {
        closeMenu();
        shortcuts.open();
      },
    },
    ...(tutorial
      ? [
          {
            icon: '🎓',
            label: 'Ver tutorial',
            description: 'Guía interactiva',
            action: () => {
              closeMenu();
              tutorial?.startTour('dashboard');
            },
          },
        ]
      : []),
    {
      icon: '❓',
      label: 'Preguntas frecuentes',
      description: 'Centro de ayuda',
      action: () => {
        closeMenu();
        window.open('/help/faq', '_blank');
      },
    },
    {
      icon: '💬',
      label: 'Contactar soporte',
      description: 'Enviar mensaje',
      action: () => {
        closeMenu();
        window.location.href = 'mailto:soporte@linguaforge.app?subject=Ayuda%20con%20LinguaForge';
      },
    },
  ];

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        onClick={toggleMenu}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full
                   bg-gradient-to-br to-accent-500 to-sky-500
                   shadow-lg shadow-accent-500/30
                   flex items-center justify-center text-white text-xl font-bold
                   focus:outline-none focus:ring-4 focus:ring-accent-500/50"
        whileHover={prefersReduced ? {} : { scale: 1.1 }}
        whileTap={prefersReduced ? {} : { scale: 0.95 }}
        animate={prefersReduced ? {} : {
          boxShadow: isMenuOpen
            ? '0 0 20px var(--sky-500)/50'
            : '0 4px 12px var(--sky-500)/30',
        }}
        aria-label="Abrir menú de ayuda"
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
      >
        <motion.span
          animate={{ rotate: isMenuOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isMenuOpen ? '✕' : '?'}
        </motion.span>
      </motion.button>

      {/* Overlay para cerrar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Menú de opciones */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            role="menu"
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-40 right-4 z-40
                       bg-calm-bg-secondary rounded-xl border border-accent-500/20
                       overflow-hidden shadow-2xl min-w-[220px]"
          >
            {helpOptions.map((option, index) => (
              <motion.button
                key={option.label}
                role="menuitem"
                onClick={option.action}
                className="w-full px-4 py-3 flex items-center gap-3 text-left
                           hover:bg-accent-500/10 transition-colors
                           focus:outline-none focus:bg-accent-500/20"
                initial={prefersReduced ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="text-xl" aria-hidden="true">
                  {option.icon}
                </span>
                <div>
                  <span className="text-white font-medium block">
                    {option.label}
                  </span>
                  <span className="text-xs text-calm-text-muted">
                    {option.description}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de atajos de teclado */}
      <KeyboardShortcutsModal isOpen={shortcuts.isOpen} onClose={shortcuts.close} />

      {/* Modal de bienvenida */}
      <WelcomeModal
        isOpen={welcome.isOpen}
        onClose={welcome.close}
        onComplete={welcome.markAsSeen}
      />
    </>
  );
}
