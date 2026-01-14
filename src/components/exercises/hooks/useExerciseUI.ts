'use client';

import { useState, useCallback, useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export interface FeedbackState {
  show: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  details?: string;
}

export interface ExerciseUIReturn {
  // Translation toggle
  showTranslation: boolean;
  toggleTranslation: () => void;
  // Feedback
  feedback: FeedbackState | null;
  showFeedback: (type: FeedbackState['type'], message: string, details?: string) => void;
  hideFeedback: () => void;
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // Hint state
  showHint: boolean;
  toggleHint: () => void;
  // Modal states
  modals: Record<string, boolean>;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
}

// ============================================
// HOOK
// ============================================

/**
 * Shared hook for managing UI state across exercises.
 * Handles common UI patterns: translation toggle, feedback display, hints, modals.
 *
 * @example
 * ```ts
 * const {
 *   showTranslation,
 *   toggleTranslation,
 *   showFeedback,
 *   feedback
 * } = useExerciseUI();
 *
 * // Show success feedback
 * showFeedback('success', 'Correct!', '+10 XP');
 *
 * // Toggle translation visibility
 * toggleTranslation();
 * ```
 */
export function useExerciseUI(): ExerciseUIReturn {
  // Translation toggle
  const [showTranslation, setShowTranslation] = useState(false);

  // Feedback state
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Hint state
  const [showHint, setShowHint] = useState(false);

  // Modal states (for multiple modals)
  const [modals, setModals] = useState<Record<string, boolean>>({});

  // Toggle translation
  const toggleTranslation = useCallback(() => {
    setShowTranslation(prev => !prev);
  }, []);

  // Show feedback
  const showFeedback = useCallback((
    type: FeedbackState['type'],
    message: string,
    details?: string
  ) => {
    setFeedback({ show: true, type, message, details });
  }, []);

  // Hide feedback
  const hideFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  // Toggle hint
  const toggleHint = useCallback(() => {
    setShowHint(prev => !prev);
  }, []);

  // Open modal
  const openModal = useCallback((modalId: string) => {
    setModals(prev => ({ ...prev, [modalId]: true }));
  }, []);

  // Close modal
  const closeModal = useCallback((modalId: string) => {
    setModals(prev => ({ ...prev, [modalId]: false }));
  }, []);

  // Toggle modal
  const toggleModal = useCallback((modalId: string) => {
    setModals(prev => ({ ...prev, [modalId]: !prev[modalId] }));
  }, []);

  return {
    showTranslation,
    toggleTranslation,
    feedback,
    showFeedback,
    hideFeedback,
    isLoading,
    setIsLoading,
    showHint,
    toggleHint,
    modals,
    openModal,
    closeModal,
    toggleModal,
  };
}

// ============================================
// SPECIALIZED UI HOOKS
// ============================================

/**
 * Hook for managing feedback animations and timing.
 */
export function useFeedbackAnimation(duration = 2000) {
  const [isVisible, setIsVisible] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const showFeedback = useCallback((
    type: FeedbackState['type'],
    message: string,
    details?: string
  ) => {
    setFeedback({ show: true, type, message, details });
    setIsVisible(true);

    // Auto-hide after duration
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setFeedback(null);
      }, 300); // Wait for exit animation
    }, duration);
  }, [duration]);

  const hideFeedback = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setFeedback(null);
    }, 300);
  }, []);

  return {
    feedback,
    isVisible,
    showFeedback,
    hideFeedback,
  };
}

/**
 * Hook for managing step-by-step UI (wizards, tutorials, multi-phase exercises).
 */
export interface StepConfig {
  id: string;
  title: string;
  description?: string;
}

export function useStepWizard(steps: StepConfig[]) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const goToStep = useCallback((stepIndex: number) => {
    setCurrentStepIndex(Math.max(0, Math.min(stepIndex, steps.length - 1)));
  }, [steps.length]);

  const goToNextStep = useCallback(() => {
    if (!isLastStep) {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.add(currentStep.id);
        return newSet;
      });
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [isLastStep, currentStep.id]);

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  const markStepComplete = useCallback((stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(stepId);
      return newSet;
    });
  }, []);

  const reset = useCallback(() => {
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
  }, []);

  return {
    currentStep,
    currentStepIndex,
    completedSteps,
    progress,
    isFirstStep,
    isLastStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    markStepComplete,
    reset,
  };
}

/**
 * Hook for managing keyboard shortcuts in exercises.
 */
export interface KeyboardShortcutConfig {
  key: string;
  handler: () => void;
  description?: string;
  enabled?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        if (event.key === shortcut.key) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return {
    shortcuts: shortcuts.map(s => ({
      key: s.key,
      description: s.description || '',
    })),
  };
}

import { useEffect } from 'react';

/**
 * Hook for managing responsive breakpoints in exercises.
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'sm' || breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl',
  };
}
