/**
 * LinguaForge Animations - Sistema de Animaciones Reutilizables
 *
 * Basado en Framer Motion con presets para:
 * - Micro-interacciones (max 300ms)
 * - Transiciones de página
 * - Efectos de progreso
 * - Feedback visual
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode, isValidElement } from 'react';

// ============================================================
// CONSTANTES DE DURACIÓN
// ============================================================

export const DURATION = {
  INSTANT: 100,      // Micro-interacciones críticas
  FAST: 200,         // Feedback rápido
  NORMAL: 300,       // Transiciones estándar (máximo para micro-interacciones)
  SLOW: 500,         // Animaciones de contenido
  PAGE: 600,         // Transiciones de página
} as const;

// ============================================================
// EASING PRESETS - Curvas de movimiento naturales
// ============================================================

export const EASING = {
  // Lineal - Para animaciones repetitivas (pulse, spin)
  LINEAR: [0, 0, 1, 1],

  // Ease - Suave y natural
  EASE: [0.25, 0.1, 0.25, 1],
  EASE_IN: [0.42, 0, 1, 1],
  EASE_OUT: [0, 0, 0.58, 1],
  EASE_IN_OUT: [0.42, 0, 0.58, 1],

  // Spring - Para elementos interactivos
  SPRING: [0.175, 0.885, 0.32, 1.275],

  // Circ - Para entrada/salida dramática
  CIRC_IN: [0.6, 0.04, 0.98, 0.335],
  CIRC_OUT: [0.075, 0.82, 0.165, 1],

  // Expo - Para énfasis
  EXPO_IN: [0.95, 0.05, 0.795, 0.035],
  EXPO_OUT: [0.19, 1, 0.22, 1],
} as const;

// ============================================================
// VARIANTS PREDEFINIDAS
// ============================================================

/**
 * Fade - Transiciones de opacidad
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Slide - Transiciones deslizantes
 */
export const slideVariants: Variants = {
  hidden: (direction: number) => ({ x: direction * 100, opacity: 0 }),
  visible: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -100, opacity: 0 }),
};

/**
 * Scale - Transiciones de escala
 */
export const scaleVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

/**
 * Flip - Efecto de volteo (3D)
 */
export const flipVariants: Variants = {
  hidden: { rotateY: -90, opacity: 0 },
  visible: { rotateY: 0, opacity: 1 },
  exit: { rotateY: 90, opacity: 0 },
};

/**
 * Stagger children - Animación en cascada
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: DURATION.FAST / 1000 },
  },
};

// ============================================================
// COMPONENTES DE ANIMACIÓN
// ============================================================

/**
 * FadeIn - Aparición suave
 */
export function FadeIn({
  children,
  delay = 0,
  duration = DURATION.NORMAL,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeVariants}
      transition={{ duration: duration / 1000, delay: delay / 1000, ease: EASING.EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideIn - Aparición desde dirección
 */
export function SlideIn({
  children,
  direction = 'up',
  distance = 20,
  delay = 0,
  duration = DURATION.NORMAL,
  className = '',
}: {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const value = direction === 'up' || direction === 'left' ? distance : -distance;

  const variants: Variants = {
    hidden: { [axis]: value, opacity: 0 },
    visible: { [axis]: 0, opacity: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: duration / 1000, delay: delay / 1000, ease: EASING.EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn - Aparición con escala
 */
export function ScaleIn({
  children,
  delay = 0,
  duration = DURATION.NORMAL,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleVariants}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: EASING.SPRING,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Pulse - Efecto de pulso repetitivo
 */
export function Pulse({
  children,
  intensity = 1.1,
  duration = 1000,
  className = '',
}: {
  children: ReactNode;
  intensity?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        scale: [1, intensity, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: duration / 1000,
        repeat: Infinity,
        ease: EASING.LINEAR,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Shimmer - Efecto de brillo
 */
export function Shimmer({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: EASING.LINEAR,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Bounce - Efecto de rebote
 */
export function Bounce({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 15,
        delay: delay / 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Shake - Vibración de error
 */
export function Shake({
  children,
  trigger = false,
  className = '',
}: {
  children: ReactNode;
  trigger?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, -5, 5, 0],
      } : {}}
      transition={{
        duration: 0.4,
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerList - Lista con animación en cascada
 */
export function StaggerList({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  // Helper to generate stable keys for children
  const getChildKey = (child: ReactNode, index: number): string => {
    if (child && isValidElement(child) && child.key != null) {
      return String(child.key);
    }
    // Fallback to index with prefix for stability
    return `stagger-child-${index}`;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div
            key={getChildKey(child, index)}
            variants={staggerItem}
            custom={index}
          >
            {child}
          </motion.div>
        ))
      ) : (
        children
      )}
    </motion.div>
  );
}

/**
 * PageTransition - Transición de página completa
 */
export function PageTransition({
  children,
  direction = 0,
  className = '',
}: {
  children: ReactNode;
  direction?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={direction}
      variants={slideVariants}
      transition={{
        duration: DURATION.PAGE / 1000,
        ease: EASING.EASE_IN_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedCounter - Contador animado
 */
export function AnimatedCounter({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

/**
 * ProgressBar - Barra de progreso animada
 */
export function ProgressBar({
  progress,
  className = '',
}: {
  progress: number;
  className?: string;
}) {
  return (
    <div className={`bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full h-2 ${className}`}>
      <motion.div
        className="bg-gradient-to-r from-accent-500 to-sky-600 h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: EASING.EASE_OUT }}
      />
    </div>
  );
}

// ============================================================
// PRESETS DE ANIMACIÓN PARA COMPONENTES COMUNES
// ============================================================

/**
 * Card entrance - Animación para tarjetas
 */
export const cardVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: { scale: 0.9, opacity: 0 },
};

/**
 * Button press - Animación para botones
 */
export const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

/**
 * Modal entrance - Animación para modales
 */
export const modalVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: { scale: 0.8, opacity: 0 },
};

/**
 * Notification entrance - Animación para notificaciones
 */
export const notificationVariants: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const linguaForgeAnimations = {
  DURATION,
  EASING,
  fadeVariants,
  slideVariants,
  scaleVariants,
  flipVariants,
  staggerContainer,
  staggerItem,
  FadeIn,
  SlideIn,
  ScaleIn,
  Pulse,
  Shimmer,
  Bounce,
  Shake,
  StaggerList,
  PageTransition,
  AnimatedCounter,
  ProgressBar,
  cardVariants,
  buttonVariants,
  modalVariants,
  notificationVariants,
};

export default linguaForgeAnimations;
