/**
 * CALM ANIMATION SYSTEM
 *
 * Configuración de animaciones para activar el sistema parasimpático.
 * Filosofía: "Aparecer como niebla, no explotar como fuegos artificiales"
 *
 * Principios:
 * - Transiciones lentas y suaves (300-600ms base)
 * - Springs con bajo stiffness y alto damping (sin rebote)
 * - Sin scale agresivos, sin shake, sin partículas
 * - Feedback visual que nutre, no que alarma
 */

import type { Transition } from 'framer-motion';

// ============================================
// CALM ANIMATION CONSTANTS
// ============================================

/**
 * Duraciones de animación calm - lentas, respiradas
 * Comparado con el sistema anterior:
 * - Tap: 80ms → 200ms
 * - Hover: 120ms → 300ms
 * - Feedback: 140ms → 400ms
 */
export const ANIMATION_DURATION = {
  // Interacciones - gentiles, no instantáneas
  tap: 200,
  press: 180,
  hover: 300,

  // Feedback - nurturing pace
  feedback: 400,
  success: 600,
  error: 500,

  // Transiciones de UI - appearing like mist
  ui: 400,
  modal: 500,
  tooltip: 250,

  // Transiciones ambient - breathing background
  decor: 600,
  background: 800,
  page: 600,
} as const;

// Legacy alias for compatibility
export const CALM_DURATION = ANIMATION_DURATION;

/**
 * Configuraciones de Spring CALM
 * - Stiffness bajo (100-150) para movimiento suave
 * - Damping alto (30-40) para evitar rebote
 * - Mass mayor (1.0-1.5) para sensación de peso
 */
export const SPRING_CONFIG = {
  // Gentle - para la mayoría de interacciones
  gentle: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 30,
    mass: 1.2,
  },

  // Breath - para animaciones ambient
  breath: {
    type: 'spring' as const,
    stiffness: 80,
    damping: 40,
    mass: 1.5,
  },

  // Float - para hover states
  float: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 35,
    mass: 1,
  },

  // Legacy mappings (now calm)
  fast: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 28,
    mass: 1,
  },

  smooth: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 30,
    mass: 1.2,
  },
} as const;

// Calm spring config alias
export const CALM_SPRING_CONFIG = SPRING_CONFIG;

/**
 * Easing curves CALM - suaves, naturales
 */
export const CALM_EASING = {
  // Standard gentle curve
  gentle: [0.25, 0.1, 0.25, 1.0],

  // Breathing in
  breathIn: [0.4, 0, 0.2, 1],

  // Breathing out
  breathOut: [0.0, 0, 0.2, 1],

  // Appearing like mist
  mist: [0.16, 1, 0.3, 1],

  // Soft settle
  settle: [0.25, 0.1, 0.25, 1],
} as const;

/**
 * Transiciones predefinidas CALM
 */
export const TRANSITIONS: Record<string, Transition> = {
  // Para interacciones - gentle, not snappy
  tap: {
    duration: ANIMATION_DURATION.tap / 1000,
    ease: CALM_EASING.gentle,
  },

  // Para feedback visual - nurturing
  feedback: {
    duration: ANIMATION_DURATION.feedback / 1000,
    ease: CALM_EASING.breathOut,
  },

  // Para transiciones de UI - mist-like
  ui: {
    duration: ANIMATION_DURATION.ui / 1000,
    ease: CALM_EASING.mist,
  },

  // Para tooltips y overlays
  overlay: {
    duration: ANIMATION_DURATION.tooltip / 1000,
    ease: CALM_EASING.gentle,
  },

  // Fade suave
  fade: {
    duration: 0.3,
    ease: CALM_EASING.gentle,
  },

  // Scale suave (solo opacidad, sin scale agresivo)
  scale: {
    duration: 0.3,
    ease: CALM_EASING.settle,
  },

  // Página completa
  page: {
    duration: ANIMATION_DURATION.page / 1000,
    ease: CALM_EASING.mist,
  },

  // Success feedback
  success: {
    duration: ANIMATION_DURATION.success / 1000,
    ease: CALM_EASING.breathOut,
  },

  // Error feedback (no shake, gentle)
  error: {
    duration: ANIMATION_DURATION.error / 1000,
    ease: CALM_EASING.gentle,
  },
} as const;

// ============================================
// CALM ANIMATION VARIANTS
// ============================================

/**
 * Variants para elementos que aparecen
 * "Appearing like mist" - no "popping in"
 */
export const CALM_APPEAR_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 4,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.ui,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

/**
 * Variants para fade simple
 */
export const CALM_FADE_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: TRANSITIONS.fade,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

/**
 * Variants para hover - solo sombra, sin scale
 */
export const CALM_HOVER_VARIANTS = {
  initial: {
    boxShadow: '0 1px 2px rgba(45, 55, 72, 0.04)',
  },
  hover: {
    boxShadow: '0 4px 12px rgba(45, 55, 72, 0.08)',
    transition: { duration: 0.3 },
  },
};

/**
 * Variants para cards - elevación suave
 */
export const CALM_CARD_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: CALM_EASING.mist,
    },
  },
  hover: {
    boxShadow: '0 8px 24px rgba(45, 55, 72, 0.08)',
    transition: { duration: 0.3 },
  },
};

/**
 * Variants para success feedback - gentle acknowledgment
 */
export const CALM_SUCCESS_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 4,
  },
  visible: {
    opacity: 1,
    y: 0,
    backgroundColor: 'rgba(114, 168, 125, 0.1)', // Soft sage
    transition: TRANSITIONS.success,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

/**
 * Variants para error feedback - gentle guidance, NO SHAKE
 */
export const CALM_ERROR_VARIANTS = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    backgroundColor: 'rgba(201, 128, 122, 0.1)', // Soft dusty rose
    transition: TRANSITIONS.error,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

// ============================================
// OPTIMIZED MOTION PROPS
// ============================================

export const OPTIMIZED_MOTION_PROPS = {
  layout: 'position' as const,
} as const;

/**
 * Crea transiciones CALM según el contexto
 */
export function createOptimizedTransition(
  context: 'tap' | 'feedback' | 'ui' | 'overlay' | 'success' | 'error'
): Transition {
  return TRANSITIONS[context] || TRANSITIONS.ui;
}

// ============================================
// DEVICE-AWARE ANIMATION
// ============================================

/**
 * Verifica si debemos ejecutar animaciones
 */
export function shouldAnimateComplex(): boolean {
  if (typeof window === 'undefined') return true;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return !prefersReduced;
}

/**
 * Obtiene configuración de animación según el dispositivo
 */
export function getOptimizedConfig() {
  const canAnimate = shouldAnimateComplex();

  return {
    spring: canAnimate ? SPRING_CONFIG.gentle : SPRING_CONFIG.breath,
    duration: canAnimate ? ANIMATION_DURATION.ui : ANIMATION_DURATION.ui * 0.5,
    shouldAnimate: canAnimate,
  };
}

// ============================================
// CALM INTERACTION PATTERNS
// ============================================

/**
 * Props para botones CALM
 * - No scale on hover
 * - Soft opacity on tap
 * - Gentle shadow elevation
 */
export const CALM_BUTTON_MOTION_PROPS = {
  whileHover: {
    boxShadow: '0 4px 12px rgba(45, 55, 72, 0.08)',
  },
  whileTap: {
    opacity: 0.9,
  },
  transition: {
    duration: 0.3,
    ease: CALM_EASING.gentle,
  },
};

/**
 * Props para cards CALM
 * - No 3D tilt
 * - Soft shadow on hover
 */
export const CALM_CARD_MOTION_PROPS = {
  whileHover: {
    boxShadow: '0 8px 24px rgba(45, 55, 72, 0.08)',
  },
  transition: {
    duration: 0.4,
    ease: CALM_EASING.mist,
  },
};

/**
 * Props para inputs CALM
 * - Soft focus ring
 * - Gentle border color change
 */
export const CALM_INPUT_MOTION_PROPS = {
  whileFocus: {
    boxShadow: '0 0 0 3px rgba(114, 168, 125, 0.15)',
  },
  transition: {
    duration: 0.2,
    ease: CALM_EASING.gentle,
  },
};

// ============================================
// LEGACY COMPATIBILITY
// ============================================

// Components that were in the critical path - now all use calm timing
export const CRITICAL_INTERACTION_COMPONENTS = [
  'AAAButton',
  'ExerciseCard',
  'SRSCard',
  'MultipleChoiceOption',
  'TextInput',
] as const;

export function isCriticalComponent(componentName: string): boolean {
  return CRITICAL_INTERACTION_COMPONENTS.some((critical) =>
    componentName.includes(critical)
  );
}

// Now all components use calm timing
export function getCriticalConfig() {
  return {
    duration: ANIMATION_DURATION.tap / 1000,
    ease: CALM_EASING.gentle,
    layout: 'position' as const,
  };
}

// ============================================
// CSS WILL-CHANGE STRATEGY
// ============================================

export const WILL_CHANGE_PROPS = {
  transform: 'transform',
  opacity: 'opacity',
  both: 'transform, opacity',
} as const;

export function getWillChangeProperty(hasTransform: boolean, hasOpacity: boolean): string {
  if (hasTransform && hasOpacity) return WILL_CHANGE_PROPS.both;
  if (hasTransform) return WILL_CHANGE_PROPS.transform;
  if (hasOpacity) return WILL_CHANGE_PROPS.opacity;
  return 'auto';
}
