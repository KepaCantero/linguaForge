/**
 * Configuración optimizada de animaciones para INP < 200ms
 *
 * Interaction to Next Paint (INP) mide la latencia de interacciones.
 * Las animaciones pesadas pueden bloquear el thread principal y aumentar INP.
 *
 * Optimizaciones aplicadas:
 * - Duraciones cortas (< 200ms) para interacciones
 * - layout="position" para animaciones de layout eficientes
 * - Springs optimizados (stiffness alto, damping medio)
 * - will-change solo cuando es necesario
 */

import type { Transition } from 'framer-motion';

// ============================================
// CONSTANTES OPTIMIZADAS
// ============================================

/**
 * Duraciones de animación optimizadas para diferentes contextos
 */
export const ANIMATION_DURATION = {
  // Interacciones críticas (clicks, taps) - < 100ms
  tap: 80,
  press: 60,
  hover: 120,

  // Feedback inmediato - < 150ms
  feedback: 140,
  success: 150,
  error: 150,

  // Transiciones de UI - < 200ms
  ui: 180,
  modal: 200,
  tooltip: 120,

  // Transiciones lentas (fuera del path de interacción)
  decor: 300,
  background: 400,
} as const;

/**
 * Configuraciones de Spring optimizadas para baja latencia
 */
export const SPRING_CONFIG = {
  // Rápido y responsive para interacciones
  fast: {
    type: 'spring',
    stiffness: 500,
    damping: 25,
    mass: 0.5,
  },

  // Balanceado para transiciones
  smooth: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },

  // Suave para animaciones decorativas
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 35,
    mass: 1,
  },
} as const;

/**
 * Transiciones predefinidas optimizadas
 */
export const TRANSITIONS: Record<string, Transition> = {
  // Para botones y elementos interactivos
  tap: {
    duration: ANIMATION_DURATION.tap,
    ease: 'easeOut',
  },

  // Para feedback visual
  feedback: {
    duration: ANIMATION_DURATION.feedback,
    ease: [0.25, 0.1, 0.25, 1], // ease-out cubic
  },

  // Para transiciones de UI
  ui: {
    duration: ANIMATION_DURATION.ui,
    ease: 'easeInOut',
  },

  // Para tooltips y overlays
  overlay: {
    duration: ANIMATION_DURATION.tooltip,
    ease: 'easeOut',
  },

  // Fade in/out rápido
  fade: {
    duration: 120,
    ease: 'linear',
  },

  // Scale rápido (para feedback)
  scale: {
    duration: 100,
    ease: 'easeOut',
  },
} as const;

// ============================================
// OPTIMIZACIONES PARA COMPONENTES
// ============================================

/**
 * Props de Framer Motion optimizados para bajo INP
 */
export const OPTIMIZED_MOTION_PROPS = {
  // layout="position" es crítico para animaciones de layout eficientes
  // Evita recalcular layout del DOM completo
  layout: 'position',

  // Reducir calidad de render durante animaciones si es necesario
  // (útil en dispositivos de gama baja)
  // @ts-ignore - Prop no documentada
  // reduceMotion: 'user',

  // Optimizar GPU
  // @ts-ignore
  willChange: 'auto', // Solo usar will-change cuando sea necesario
} as const;

/**
 * Hook para crear transiciones optimizadas según el contexto
 */
export function createOptimizedTransition(context: 'tap' | 'feedback' | 'ui' | 'overlay'): Transition {
  const base = TRANSITIONS[context] || TRANSITIONS.ui;

  // Añadir layout propagation optimizado
  return {
    ...base,
    // Evita conflictos de layout
    // @ts-ignore
    layout: 'position',
  };
}

// ============================================
// AYUDAS PARA REDUCIR INP
// ============================================

/**
 * Verifica si una animación debería ejecutarse según la capacidad del dispositivo
 */
export function shouldAnimateComplex(): boolean {
  if (typeof window === 'undefined') return true;

  // Deshabilitar animaciones complejas en:
  // - Dispositivos muy lentos (hardwareConcurrency <= 2)
  // - Cuando el usuario prefiere reduced motion
  const isLowEnd = (navigator.hardwareConcurrency || 4) <= 2;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return !isLowEnd && !prefersReduced;
}

/**
 * Obtiene configuración de animación según el dispositivo
 */
export function getOptimizedConfig() {
  const complex = shouldAnimateComplex();

  return {
    // Usar springs más simples en dispositivos de gama baja
    spring: complex ? SPRING_CONFIG.fast : SPRING_CONFIG.smooth,

    // Reducir duración en dispositivos lentos
    duration: complex ? ANIMATION_DURATION.tap : ANIMATION_DURATION.tap * 0.7,
  };
}

// ============================================
// PATH CRÍTICO DE INTERACCIÓN
// ============================================

/**
 * Componentes que están en el path crítico de interacción
 * Deben tener animaciones ultra optimizadas (< 100ms)
 */
export const CRITICAL_INTERACTION_COMPONENTS = [
  'AAAButton',
  'ExerciseCard',
  'SRSCard',
  'MultipleChoiceOption',
  'TextInput',
] as const;

/**
 * Verifica si un componente está en el path crítico
 */
export function isCriticalComponent(componentName: string): boolean {
  return CRITICAL_INTERACTION_COMPONENTS.some((critical) =>
    componentName.includes(critical)
  );
}

/**
 * Obtiene configuración ultra optimizada para componentes críticos
 */
export function getCriticalConfig() {
  return {
    duration: 80, // < 100ms para componentes críticos
    ease: 'linear' as const, // El más rápido
    layout: 'position' as const,
  };
}

// ============================================
// CSS WILL-CHANGE STRATEGY
// ============================================

/**
 * Aplica will-change solo cuando sea necesario
 * Overuse de will-change puede causar más problemas que solucionar
 */
export const WILL_CHANGE_PROPS = {
  // Para animaciones de transform (GPU acelerado)
  transform: 'transform',

  // Para animaciones de opacidad
  opacity: 'opacity',

  // Para ambos (usar con moderación)
  both: 'transform, opacity',
} as const;

/**
 * Obtiene el valor de will-change apropiado para una animación
 */
export function getWillChangeProperty(hasTransform: boolean, hasOpacity: boolean): string {
  if (hasTransform && hasOpacity) return WILL_CHANGE_PROPS.both;
  if (hasTransform) return WILL_CHANGE_PROPS.transform;
  if (hasOpacity) return WILL_CHANGE_PROPS.opacity;
  return 'auto';
}
