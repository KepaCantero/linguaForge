'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useUserStore } from '@/store/useUserStore';

// ============================================
// TYPES
// ============================================

interface WelcomeStep {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const WELCOME_STEPS: WelcomeStep[] = [
  {
    icon: '🧠',
    title: 'Bienvenido a LinguaForge',
    description: 'Tu asistente de aprendizaje de francés con inteligencia artificial.',
    features: [
      'Repaso espaciado científico (FSRS)',
      'Ejercicios adaptativos a tu nivel',
      'Aprendizaje gamificado con XP y logros',
    ],
  },
  {
    icon: '📚',
    title: 'Camino de Aprendizaje',
    description: 'Sigue un camino estructurado desde A1 hasta C2.',
    features: [
      'Lecciones organizadas por temas',
      'Ejercicios interactivos variados',
      'Progreso visual en el mapa',
    ],
  },
  {
    icon: '📥',
    title: 'Importa Contenido Real',
    description: 'Aprende con videos de YouTube, podcasts o textos.',
    features: [
      'Extracción automática de vocabulario',
      'Transcripciones con traducción',
      'Frases guardadas en tu deck',
    ],
  },
  {
    icon: '🔄',
    title: 'Repaso Inteligente',
    description: 'El sistema FSRS optimiza cuándo repasar cada tarjeta.',
    features: [
      'Intervalos personalizados',
      'Mayor retención con menos esfuerzo',
      'Estadísticas de tu memoria',
    ],
  },
  {
    icon: '🎮',
    title: 'Aprende Jugando',
    description: 'Gana XP, mantén tu racha y sube de nivel.',
    features: [
      'Misiones diarias y semanales',
      'Sistema de rangos neurales',
      'Recompensas por consistencia',
    ],
  },
];

// ============================================
// HOOK - Now uses Zustand store
// ============================================

export function useWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const hasCompletedOnboarding = useUserStore((state) => state.hasCompletedOnboarding);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  useEffect(() => {
    // Only show onboarding if not completed
    if (!hasCompletedOnboarding) {
      setIsOpen(true);
    }
  }, [hasCompletedOnboarding]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const markAsSeen = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  return {
    isOpen,
    open,
    close,
    markAsSeen,
    hasCompletedOnboarding,
  };
}

// ============================================
// COMPONENT
// ============================================

export function WelcomeModal({ isOpen, onClose, onComplete }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const prefersReduced = useReducedMotion();
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  const handleNext = useCallback(() => {
    if (currentStep < WELCOME_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Mark as seen using Zustand store
      completeOnboarding();
      onComplete?.();
      onClose();
    }
  }, [currentStep, completeOnboarding, onClose, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    completeOnboarding();
    onClose();
  }, [completeOnboarding, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'Escape':
          handleSkip();
          break;
      }
    },
    [handleNext, handlePrev, handleSkip]
  );

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const step = WELCOME_STEPS[currentStep];
  const isLastStep = currentStep === WELCOME_STEPS.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleSkip}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-lg bg-gradient-to-b from-lf-soft to-lf-dark
                       rounded-2xl border border-lf-primary/30 shadow-2xl overflow-hidden"
          >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-lf-primary/20">
              <motion.div
                className="h-full bg-gradient-to-r from-lf-primary to-lf-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / WELCOME_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-lf-muted hover:text-white transition-colors
                         text-sm focus:outline-none focus:ring-2 focus:ring-lf-primary rounded px-2 py-1"
              aria-label="Saltar introducción"
            >
              Saltar
            </button>

            {/* Content */}
            <div className="p-8 pt-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  {/* Icon */}
                  <motion.div
                    className="text-6xl mb-4"
                    animate={prefersReduced ? {} : { scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {step.icon}
                  </motion.div>

                  {/* Title */}
                  <h2
                    id="welcome-title"
                    className="text-2xl font-bold text-white mb-2"
                  >
                    {step.title}
                  </h2>

                  {/* Description */}
                  <p className="text-lf-muted mb-6">{step.description}</p>

                  {/* Features */}
                  <ul className="text-left space-y-3 mb-8">
                    {step.features.map((feature, idx) => (
                      <motion.li
                        key={feature}
                        initial={prefersReduced ? {} : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.1 }}
                        className="flex items-center gap-3 text-white/90"
                      >
                        <span className="w-6 h-6 rounded-full bg-lf-primary/20 flex items-center justify-center text-lf-accent text-sm">
                          ✓
                        </span>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              {/* Step indicators */}
              <div className="flex justify-center gap-2 mb-6">
                {WELCOME_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-lf-primary
                               ${idx === currentStep
                                 ? 'w-6 bg-lf-primary'
                                 : 'bg-lf-primary/30 hover:bg-lf-primary/50'}`}
                    aria-label={`Ir al paso ${idx + 1}`}
                    aria-current={idx === currentStep ? 'step' : undefined}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex-1 py-3 px-4 bg-lf-primary/20 hover:bg-lf-primary/30
                               text-white font-medium rounded-xl transition-colors
                               focus:outline-none focus:ring-2 focus:ring-lf-primary"
                  >
                    Anterior
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`flex-1 py-3 px-4 font-medium rounded-xl transition-colors
                             focus:outline-none focus:ring-2 focus:ring-lf-primary
                             ${isLastStep
                               ? 'bg-gradient-to-r from-lf-primary to-lf-secondary text-white'
                               : 'bg-lf-primary hover:bg-lf-primary/80 text-white'}`}
                >
                  {isLastStep ? '¡Empezar!' : 'Siguiente'}
                </button>
              </div>

              {/* Keyboard hint */}
              <p className="text-center text-xs text-lf-muted mt-4">
                Usa ← → para navegar, Enter para continuar
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
