/**
 * LinguaForge Motion Guidelines
 * =============================
 * Durations, easings, and variants for consistent animation across the app.
 *
 * PRINCIPLES:
 * - Animations should feel like rewards, not distractions
 * - Mobile-first: keep animations short (150-400ms)
 * - Never animate layout-critical elements
 * - Use springs for interactions, easings for transitions
 */

import type { Variants, Transition } from 'framer-motion';

// =============================================================================
// TIMING CONSTANTS
// =============================================================================

export const DURATION = {
  instant: 0.1,      // Micro-feedback (tap response)
  fast: 0.2,         // Quick transitions
  normal: 0.3,       // Standard transitions
  slow: 0.5,         // Emphasis animations
  deliberate: 0.8,   // Dramatic reveals
} as const;

export const DELAY = {
  none: 0,
  micro: 0.05,       // Stagger between items
  short: 0.1,        // Short pause
  medium: 0.2,       // Noticeable pause
  long: 0.4,         // Dramatic pause
} as const;

// =============================================================================
// EASING PRESETS
// =============================================================================

export const EASING = {
  // Standard easings
  smooth: [0.4, 0, 0.2, 1],           // Material Design standard
  decelerate: [0, 0, 0.2, 1],         // Enter animations
  accelerate: [0.4, 0, 1, 1],         // Exit animations
  sharp: [0.4, 0, 0.6, 1],            // Quick emphasis

  // Bouncy easings for gamification
  bounce: [0.68, -0.55, 0.265, 1.55], // Overshoot then settle
  elastic: [0.68, -0.6, 0.32, 1.6],   // More dramatic overshoot

  // Smooth easings for UI
  gentle: [0.25, 0.1, 0.25, 1],       // Subtle movement
} as const;

// =============================================================================
// SPRING PRESETS
// =============================================================================

export const SPRING = {
  // Interactive elements (buttons, cards)
  snappy: { type: 'spring', stiffness: 400, damping: 30 },

  // Modals, overlays
  smooth: { type: 'spring', stiffness: 300, damping: 25 },

  // Emphasis animations
  bouncy: { type: 'spring', stiffness: 500, damping: 15 },

  // Gentle movements
  soft: { type: 'spring', stiffness: 200, damping: 20 },
} as const;

// =============================================================================
// STANDARD VARIANTS
// =============================================================================

/** Fade in from bottom - standard entry for cards and sections */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/** Fade in from right - for page transitions */
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

/** Scale up from center - for modals and emphasis */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

/** Pop in with bounce - for success states and rewards */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING.bouncy,
  },
};

/** Stagger children - for lists */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: DELAY.micro,
      delayChildren: DELAY.short,
    },
  },
};

/** Child item for stagger */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

// =============================================================================
// INTERACTIVE STATES
// =============================================================================

/** Tap/click feedback - use with whileTap */
export const tapFeedback = {
  scale: 0.97,
  transition: { duration: DURATION.instant },
};

/** Hover feedback - use with whileHover */
export const hoverFeedback = {
  scale: 1.02,
  transition: { duration: DURATION.fast },
};

/** Hover lift - cards that lift on hover */
export const hoverLift = {
  y: -4,
  scale: 1.01,
  transition: { duration: DURATION.fast },
};

/** Press down - for buttons */
export const pressDown = {
  scale: 0.95,
  y: 2,
  transition: { duration: DURATION.instant },
};

// =============================================================================
// FEEDBACK ANIMATIONS
// =============================================================================

/** Success pulse - use for correct answers */
export const successPulse: Variants = {
  initial: { scale: 1, boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
  animate: {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0 0 rgba(16, 185, 129, 0.4)',
      '0 0 0 15px rgba(16, 185, 129, 0)',
      '0 0 0 0 rgba(16, 185, 129, 0)',
    ],
    transition: { duration: 0.6 },
  },
};

/** Error shake - use for incorrect answers */
export const errorShake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [-8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

/** Reward pop - for XP, coins, etc */
export const rewardPop: Variants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...SPRING.bouncy,
      opacity: { duration: DURATION.fast },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -20,
    transition: { duration: DURATION.fast },
  },
};

// =============================================================================
// PROGRESS ANIMATIONS
// =============================================================================

/** Progress bar fill - use with style={{ width }} */
export const progressFill = {
  initial: { scaleX: 0 },
  animate: { scaleX: 1 },
  transition: { duration: DURATION.slow, ease: EASING.decelerate },
};

/** Glow pulse - for active elements */
export const glowPulse: Variants = {
  animate: {
    boxShadow: [
      '0 0 5px rgba(126, 34, 206, 0.3)',
      '0 0 20px rgba(126, 34, 206, 0.5)',
      '0 0 5px rgba(126, 34, 206, 0.3)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Resonance glow - LinguaForge specific */
export const resonanceGlow: Variants = {
  animate: {
    filter: [
      'drop-shadow(0 0 5px #7E22CE)',
      'drop-shadow(0 0 15px #D946EF)',
      'drop-shadow(0 0 5px #7E22CE)',
    ],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Generate stagger delay based on index */
export function staggerDelay(index: number, base: number = DELAY.micro): number {
  return base + index * DELAY.micro;
}

/** Create transition with common defaults */
export function createTransition(
  duration = DURATION.normal,
  delay = 0,
  ease = EASING.smooth
): Transition {
  return { duration, delay, ease };
}

/** Create delayed entry for lists */
export function delayedEntry(index: number): Transition {
  return {
    duration: DURATION.normal,
    delay: staggerDelay(index),
    ease: EASING.decelerate,
  };
}
