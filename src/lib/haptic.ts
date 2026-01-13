/**
 * Sistema de Feedback Háptico para Memory Bank AAA
 * Patrones de vibración distintos según tipo de contenido
 *
 * TAREA 2.8.4: Sistema de Feedback Háptico
 */

import { z } from 'zod';

// ============================================
// TIPOS Y SCHEMAS
// ============================================

export const HapticPatternTypeSchema = z.enum([
  'success',        // Selección correcta
  'error',          // Error o corrección
  'tap',            // Tap simple
  'select',         // Selección de elemento
  'milestone',      // Logro importante
  'notification',   // Notificación
  'warning',        // Advertencia
  'confirm',        // Confirmación
  'card_flip',      // Voltear tarjeta
  'drag_start',     // Inicio de arrastre
  'drag_end',       // Fin de arrastre
  'level_up',       // Subida de nivel
]);

export type HapticPatternType = z.infer<typeof HapticPatternTypeSchema>;

export const HapticIntensitySchema = z.enum(['light', 'medium', 'heavy']);
export type HapticIntensity = z.infer<typeof HapticIntensitySchema>;

export interface HapticPattern {
  type: HapticPatternType;
  pattern: number[];  // Patrón de vibración [vibrar, pausa, vibrar, ...]
  intensity: HapticIntensity;
  description: string;
}

// ============================================
// PATRONES DE VIBRACIÓN
// ============================================

export const HAPTIC_PATTERNS: Record<HapticPatternType, HapticPattern> = {
  success: {
    type: 'success',
    pattern: [50, 30, 50],
    intensity: 'medium',
    description: 'Doble vibración corta para éxito',
  },
  error: {
    type: 'error',
    pattern: [100, 50, 100, 50, 100],
    intensity: 'heavy',
    description: 'Triple vibración para error',
  },
  tap: {
    type: 'tap',
    pattern: [10],
    intensity: 'light',
    description: 'Vibración mínima para feedback táctil',
  },
  select: {
    type: 'select',
    pattern: [30],
    intensity: 'light',
    description: 'Vibración corta para selección',
  },
  milestone: {
    type: 'milestone',
    pattern: [50, 100, 50, 100, 200],
    intensity: 'heavy',
    description: 'Patrón celebratorio para logros',
  },
  notification: {
    type: 'notification',
    pattern: [100, 50, 100],
    intensity: 'medium',
    description: 'Patrón de notificación',
  },
  warning: {
    type: 'warning',
    pattern: [200, 100, 200],
    intensity: 'heavy',
    description: 'Patrón de advertencia',
  },
  confirm: {
    type: 'confirm',
    pattern: [50, 50, 100],
    intensity: 'medium',
    description: 'Patrón de confirmación',
  },
  card_flip: {
    type: 'card_flip',
    pattern: [20, 30, 40],
    intensity: 'light',
    description: 'Patrón suave para voltear tarjeta',
  },
  drag_start: {
    type: 'drag_start',
    pattern: [15],
    intensity: 'light',
    description: 'Feedback al iniciar arrastre',
  },
  drag_end: {
    type: 'drag_end',
    pattern: [30, 20, 30],
    intensity: 'medium',
    description: 'Feedback al soltar elemento',
  },
  level_up: {
    type: 'level_up',
    pattern: [100, 50, 100, 50, 100, 100, 200],
    intensity: 'heavy',
    description: 'Celebración de subida de nivel',
  },
};

// ============================================
// DETECCIÓN DE SOPORTE
// ============================================

/**
 * Verifica si el dispositivo soporta vibración
 */
export function isHapticSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'vibrate' in navigator;
}

/**
 * Verifica si el usuario prefiere movimiento reducido
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================
// ESTADO GLOBAL
// ============================================

let hapticEnabled = true;

/**
 * Habilita o deshabilita el feedback háptico globalmente
 */
export function setHapticEnabled(enabled: boolean): void {
  hapticEnabled = enabled;
}

/**
 * Obtiene el estado actual del feedback háptico
 */
export function isHapticEnabled(): boolean {
  return hapticEnabled && isHapticSupported() && !prefersReducedMotion();
}

// ============================================
// FUNCIONES DE VIBRACIÓN
// ============================================

/**
 * Ejecuta un patrón de vibración
 */
export function vibrate(pattern: number[]): boolean {
  if (!isHapticEnabled()) return false;

  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

/**
 * Detiene cualquier vibración en curso
 */
export function stopVibration(): boolean {
  if (!isHapticSupported()) return false;

  try {
    return navigator.vibrate(0);
  } catch {
    return false;
  }
}

/**
 * Ejecuta un patrón de vibración predefinido
 */
export function triggerHaptic(type: HapticPatternType): boolean {
  const pattern = HAPTIC_PATTERNS[type];
  if (!pattern) {
    return false;
  }

  return vibrate(pattern.pattern);
}

/**
 * Ejecuta un patrón de vibración con intensidad ajustada
 */
export function triggerHapticWithIntensity(
  type: HapticPatternType,
  intensityMultiplier: number = 1
): boolean {
  const pattern = HAPTIC_PATTERNS[type];
  if (!pattern) return false;

  // Ajustar duración según intensidad
  const adjustedPattern = pattern.pattern.map(duration =>
    Math.round(duration * intensityMultiplier)
  );

  return vibrate(adjustedPattern);
}

// ============================================
// PATRONES CONTEXTUALES
// ============================================

/**
 * Feedback para respuesta correcta
 */
export function hapticSuccess(): boolean {
  return triggerHaptic('success');
}

/**
 * Feedback para respuesta incorrecta
 */
export function hapticError(): boolean {
  return triggerHaptic('error');
}

/**
 * Feedback para tap/selección
 */
export function hapticTap(): boolean {
  return triggerHaptic('tap');
}

/**
 * Feedback para selección de elemento
 */
export function hapticSelect(): boolean {
  return triggerHaptic('select');
}

/**
 * Feedback para logro/milestone
 */
export function hapticMilestone(): boolean {
  return triggerHaptic('milestone');
}

/**
 * Feedback para voltear tarjeta
 */
export function hapticCardFlip(): boolean {
  return triggerHaptic('card_flip');
}

/**
 * Feedback para inicio de arrastre
 */
export function hapticDragStart(): boolean {
  return triggerHaptic('drag_start');
}

/**
 * Feedback para fin de arrastre
 */
export function hapticDragEnd(): boolean {
  return triggerHaptic('drag_end');
}

/**
 * Feedback para subida de nivel
 */
export function hapticLevelUp(): boolean {
  return triggerHaptic('level_up');
}

// ============================================
// FALLBACK VISUAL
// ============================================

export interface VisualFeedbackOptions {
  element: HTMLElement;
  type: 'shake' | 'pulse' | 'flash';
  duration?: number;
}

/**
 * Proporciona feedback visual como fallback cuando no hay vibración
 */
export function visualFeedback(options: VisualFeedbackOptions): void {
  const { element, type, duration = 300 } = options;

  const animations: Record<string, Keyframe[]> = {
    shake: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(0)' },
    ],
    pulse: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.05)', opacity: 0.9 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    flash: [
      { opacity: 1 },
      { opacity: 0.5 },
      { opacity: 1 },
    ],
  };

  const keyframes = animations[type];
  if (!keyframes) return;

  element.animate(keyframes, {
    duration,
    easing: 'ease-in-out',
  });
}

/**
 * Ejecuta feedback háptico con fallback visual
 */
export function hapticWithFallback(
  type: HapticPatternType,
  element?: HTMLElement
): boolean {
  const success = triggerHaptic(type);

  // Si no hay vibración y se proporciona elemento, usar fallback visual
  if (!success && element) {
    const visualType = type === 'error' ? 'shake' : 'pulse';
    visualFeedback({ element, type: visualType });
  }

  return success;
}

// ============================================
// HOOK PARA REACT
// ============================================

/**
 * Hook para usar feedback háptico en componentes React
 *
 * Uso:
 * const haptic = useHaptic();
 * haptic.success();
 * haptic.error();
 * haptic.tap();
 */
export function useHaptic() {
  return {
    isSupported: isHapticSupported,
    isEnabled: isHapticEnabled,
    setEnabled: setHapticEnabled,
    trigger: triggerHaptic,
    success: hapticSuccess,
    error: hapticError,
    tap: hapticTap,
    select: hapticSelect,
    milestone: hapticMilestone,
    cardFlip: hapticCardFlip,
    dragStart: hapticDragStart,
    dragEnd: hapticDragEnd,
    levelUp: hapticLevelUp,
    stop: stopVibration,
    withFallback: hapticWithFallback,
    visualFeedback,
  };
}

// ============================================
// EXPORTACIONES
// ============================================

export const HAPTIC_PATTERN_TYPES = Object.keys(HAPTIC_PATTERNS) as HapticPatternType[];

const hapticAPI = {
  trigger: triggerHaptic,
  success: hapticSuccess,
  error: hapticError,
  tap: hapticTap,
  select: hapticSelect,
  milestone: hapticMilestone,
  cardFlip: hapticCardFlip,
  levelUp: hapticLevelUp,
  isSupported: isHapticSupported,
  isEnabled: isHapticEnabled,
  setEnabled: setHapticEnabled,
};

export default hapticAPI;
