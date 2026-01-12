'use client';

import { useCallback, useRef } from 'react';
import { motion, MotionProps, AnimatePresence } from 'framer-motion';

/**
 * Micro-interaction types for different feedback scenarios
 */
export type MicroInteractionType =
  | 'success' // Green pulse, scale up
  | 'error' // Red shake, scale down
  | 'warning' // Yellow pulse
  | 'info' // Blue glow
  | 'click' // Scale down then up
  | 'hover' // Subtle lift and glow
  | 'loading' // Continuous pulse
  | 'complete'; // Success burst

/**
 * Haptic-like visual feedback configuration
 */
interface MicroInteractionConfig {
  scale?: number;
  rotate?: number;
  duration?: number;
  delay?: number;
  brightness?: number;
  glow?: boolean;
}

/**
 * Hook for adding haptic-like micro-interactions
 * Provides visual feedback that mimics physical button sensations
 *
 * Inspired by:
 * - iOS haptic feedback patterns
 * - Game UI responsiveness (God of War, Uncharted)
 * - Material Design motion principles
 */
export function useMicroInteractions() {
  const animationRef = useRef<number | null>(null);

  /**
   * Trigger a micro-interaction with haptic-like visual feedback
   */
  const trigger = useCallback((
    element: HTMLElement | null,
    type: MicroInteractionType,
    config: MicroInteractionConfig = {}
  ) => {
    if (!element) return;

    const {
      scale = 1.05,
      rotate = 0,
      duration = 150,
      delay = 0,
      brightness = 1.1,
      glow = true,
    } = config;

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Clear any existing inline styles
    element.style.transition = 'none';

    // Apply initial state
    element.style.transform = 'scale(1)';
    element.style.filter = 'brightness(1)';

    // Start animation after delay
    setTimeout(() => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for natural feel
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const easeInOut = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        let currentScale = 1;
        let currentRotate = 0;
        let currentBrightness = 1;

        switch (type) {
          case 'success':
            // Scale up and pulse green
            currentScale = 1 + (scale - 1) * easeOut;
            currentBrightness = 1 + (brightness - 1) * Math.sin(easeOut * Math.PI);
            break;

          case 'error':
            // Shake animation
            const shakeIntensity = Math.sin(easeOut * Math.PI * 4) * (rotate || 5);
            currentRotate = shakeIntensity;
            currentScale = 1 - 0.05 * easeOut;
            break;

          case 'warning':
            // Gentle pulse
            currentScale = 1 + 0.02 * Math.sin(easeOut * Math.PI * 2);
            currentBrightness = 1 + 0.1 * Math.sin(easeOut * Math.PI);
            break;

          case 'info':
            // Subtle glow pulse
            currentBrightness = 1 + (brightness - 1) * easeOut;
            break;

          case 'click':
            // Quick down-then-up
            if (progress < 0.5) {
              currentScale = 1 - 0.1 * easeInOut;
            } else {
              currentScale = 0.9 + 0.1 * easeInOut;
            }
            break;

          case 'hover':
            // Smooth lift
            currentScale = 1 + (scale - 1) * easeOut;
            break;

          case 'loading':
            // Continuous pulse
            currentScale = 1 + 0.03 * Math.sin(easeOut * Math.PI * 2);
            break;

          case 'complete':
            // Success burst - scale up then settle
            if (progress < 0.3) {
              currentScale = 1 + 0.15 * (progress / 0.3);
            } else {
              currentScale = 1.15 - 0.15 * ((progress - 0.3) / 0.7);
            }
            currentBrightness = 1 + 0.2 * Math.sin(easeOut * Math.PI);
            break;
        }

        // Apply transforms
        element.style.transform = `scale(${currentScale}) rotate(${currentRotate}deg)`;
        element.style.filter = `brightness(${currentBrightness})`;

        // Continue animation or reset
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Reset to base state
          element.style.transition = 'all 0.2s ease-out';
          element.style.transform = 'scale(1) rotate(0deg)';
          element.style.filter = 'brightness(1)';
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }, delay);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return { trigger };
}

/**
 * HOC to add micro-interactions to any component
 */
export function withMicroInteractions<P extends object>(
  Component: React.ComponentType<P>,
  defaultType: MicroInteractionType = 'hover'
) {
  return function WrappedComponent(props: P) {
    const { trigger } = useMicroInteractions();
    const elementRef = useRef<HTMLElement>(null);

    const handleInteraction = useCallback((type?: MicroInteractionType) => {
      if (elementRef.current) {
        trigger(elementRef.current, type || defaultType);
      }
    }, [trigger, defaultType]);

    return (
      <div
        ref={elementRef as any}
        onMouseEnter={() => handleInteraction('hover')}
        onMouseDown={() => handleInteraction('click')}
        onClick={() => handleInteraction(defaultType)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleInteraction(defaultType);
          }
        }}
        tabIndex={0}
        role="button"
      >
        <Component {...props} />
      </div>
    );
  };
}

/**
 * Motion variants for common micro-interactions
 * Use with Framer Motion components
 */
export const microInteractionVariants = {
  success: {
    scale: [1, 1.1, 1],
    filter: [
      'brightness(1)',
      'brightness(1.2) drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))',
      'brightness(1)',
    ],
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  error: {
    x: [0, -5, 5, -5, 5, 0],
    scale: [1, 0.95, 1],
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
  warning: {
    scale: [1, 1.05, 1],
    filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)'],
    transition: { duration: 0.6, ease: 'easeInOut', repeat: Infinity },
  },
  click: {
    scale: [1, 0.95, 1],
    transition: { duration: 0.15, ease: 'easeInOut' },
  },
  hover: {
    scale: 1.02,
    filter: 'brightness(1.05)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  loading: {
    scale: [1, 1.03, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 1.5, ease: 'easeInOut', repeat: Infinity },
  },
  complete: {
    scale: [1, 1.15, 1],
    filter: [
      'brightness(1)',
      'brightness(1.2) drop-shadow(0 0 20px rgba(99, 102, 241, 0.6))',
      'brightness(1)',
    ],
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/**
 * Ripple effect component for material-style touch feedback
 */
export function RippleEffect({ active }: { active: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none"
      initial={{ opacity: 0 }}
    >
      <AnimatePresence>
        {active && (
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              transformOrigin: 'center',
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Magnetic button effect - button follows cursor slightly
 */
export function useMagneticEffect(strength = 0.3) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    ref.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0, 0)';
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}
