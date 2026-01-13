/**
 * Hook para animaciones optimizadas con INP < 200ms
 *
 * Aplica automáticamente las mejores prácticas de rendimiento
 * para mantener Interaction to Next Paint bajo 200ms.
 */

import { useMemo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  TRANSITIONS,
  shouldAnimateComplex,
  getOptimizedConfig,
  getCriticalConfig,
} from '@/lib/animations';

// ============================================
// HOOK PRINCIPAL
// ============================================

interface _OptimizedMotionConfig {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
  layout?: 'position';
}

/**
 * Hook que retorna props de animación optimizados según el contexto
 *
 * @param context - Tipo de animación (tap, feedback, ui, overlay, critical)
 * @param options - Configuración adicional
 * @returns Props optimizados para motion components
 */
export function useOptimizedAnimation(
  context: 'tap' | 'feedback' | 'ui' | 'overlay' | 'critical' = 'ui',
  options?: {
    hasTransform?: boolean;
    hasOpacity?: boolean;
    customDuration?: number;
  }
) {
  const prefersReduced = useReducedMotion();
  const canAnimateComplex = useMemo(() => shouldAnimateComplex(), []);

  // Obtener configuración optimizada (antes del early return)
  const config = useMemo(() => {
    if (context === 'critical') {
      return getCriticalConfig();
    }
    return getOptimizedConfig();
  }, [context, canAnimateComplex]);

  // Construir transición optimizada
  const transition = useMemo(() => {
    // Si el usuario prefiere reduced motion, deshabilitar animaciones
    if (prefersReduced || !canAnimateComplex) {
      return { duration: 0 };
    }

    const base = context === 'critical'
      ? { duration: config.duration, ease: 'linear' }
      : TRANSITIONS[context] || TRANSITIONS.ui;

    return {
      ...base,
      duration: options?.customDuration || (base as any).duration,
    };
  }, [context, config, options?.customDuration, prefersReduced, canAnimateComplex]);

  // Calcular valores iniciales/animados
  const initial = useMemo(() => {
    if (prefersReduced || !canAnimateComplex) {
      return { opacity: 1 };
    }
    return undefined; // Usar defaults de Framer Motion
  }, [prefersReduced, canAnimateComplex]);

  const animate = useMemo(() => {
    if (prefersReduced || !canAnimateComplex) {
      return { opacity: 1 };
    }
    return undefined;
  }, [prefersReduced, canAnimateComplex]);

  return {
    initial,
    animate,
    transition,
    // layout="position" es crucial para INP
    layout: 'position' as const,
  };
}

// ============================================
// VARIANTES ESPECIALIZADAS
// ============================================

/**
 * Hook para botones y elementos interactivos (tap animation)
 */
export function useTapAnimation(hasHover = true) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return { transition: { duration: 0 } };
  }

  return {
    whileTap: { scale: 0.97 },
    whileHover: hasHover ? { scale: 1.02 } : undefined,
    transition: TRANSITIONS.tap,
  };
}

/**
 * Hook para feedback visual (éxito/error)
 */
export function useFeedbackAnimation(type: 'success' | 'error' | 'neutral' = 'neutral') {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return { transition: { duration: 0 } };
  }

  const variants = {
    success: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
      transition: TRANSITIONS.feedback,
    },
    error: {
      initial: { x: -5 },
      animate: { x: 0 },
      transition: {
        duration: 100,
        ease: 'easeOut',
      },
    },
    neutral: {
      transition: TRANSITIONS.ui,
    },
  };

  return variants[type] || variants.neutral;
}

/**
 * Hook para animaciones de entrada/salida de modales
 */
export function useModalAnimation() {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    };
  }

  return {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: TRANSITIONS.modal,
  };
}

/**
 * Hook para listas y grids (layout animation optimizada)
 */
export function useListAnimation(delay = 0) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return { transition: { duration: 0 } };
  }

  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      delay,
      duration: 150,
      ease: 'easeOut',
    },
  };
}

// ============================================
// PERFIL DE RENDIMIZADO
// ============================================

/**
 * Ajusta la calidad de render según la capacidad del dispositivo
 */
export function getRenderQuality(): 'high' | 'medium' | 'low' {
  if (typeof window === 'undefined') return 'high';

  const cores = navigator.hardwareConcurrency || 4;
  const memory = (performance as any).memory?.jsHeapSizeLimit || 0;

  if (cores <= 2 || memory < 500_000_000) return 'low';
  if (cores <= 4 || memory < 2_000_000_000) return 'medium';
  return 'high';
}

/**
 * Obtiene el número máximo de partículas según el dispositivo
 */
export function getMaxParticles(): number {
  const quality = getRenderQuality();

  switch (quality) {
    case 'low':
      return 20;
    case 'medium':
      return 50;
    case 'high':
      return 100;
    default:
      return 50;
  }
}

/**
 * Obtiene el intervalo de actualización para animaciones continuas
 */
export function getAnimationFrameInterval(): number {
  const quality = getRenderQuality();

  switch (quality) {
    case 'low':
      return 33; // ~30fps
    case 'medium':
      return 20; // ~50fps
    case 'high':
      return 16; // ~60fps
    default:
      return 16;
  }
}
