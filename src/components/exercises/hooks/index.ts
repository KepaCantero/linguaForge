// ============================================
// SHARED EXERCISE HOOKS
// ============================================
// This file exports all shared hooks for exercise components.
// These hooks extract common patterns and reduce hook count in individual components.

// State management hooks
export {
  useExerciseState,
  useExercisePhase,
  useExerciseSteps,
} from './useExerciseState';

// Timer hooks
export {
  useExerciseTimer,
  useCountdownTimer,
  useStopwatch,
  useSilenceTimer,
} from './useExerciseTimer';

// Gamification hooks
export {
  useExerciseGamification,
  useExerciseXP,
  useSessionStats,
} from './useExerciseGamification';

// Audio hooks
export {
  useExerciseAudio,
  useSilenceDetection,
  useAudioElement,
  useAudioSequence,
} from './useExerciseAudio';

// UI hooks
export {
  useExerciseUI,
  useFeedbackAnimation,
  useStepWizard,
  useKeyboardShortcuts,
  useBreakpoint,
} from './useExerciseUI';

// Existing specialized hooks
export { useJanusKeyboardNavigation } from './useJanusKeyboardNavigation';
export { useJanusComposer } from './useJanusComposer';
export { useInteractiveSpeechFlow } from './useInteractiveSpeechFlow';
export { useMemoryBankSession } from './useMemoryBankSession';
