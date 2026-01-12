'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CALM_EASING } from '@/lib/animations';

interface AAACardProps {
  children: ReactNode;
  variant?: 'elevated' | 'flat' | 'outlined';
  className?: string;
  onClick?: () => void;
}

/**
 * CALM Card Component
 *
 * Design Philosophy:
 * - No 3D tilt effects (too aggressive)
 * - No shimmer (distracting)
 * - Simple, soft shadow elevation on hover
 * - Feels like a resting place for content
 */
export function AAACard({
  children,
  variant = 'elevated',
  className = '',
  onClick,
}: AAACardProps) {
  // Calm variant styles - light backgrounds, soft borders
  const variantStyles = {
    elevated: `
      bg-calm-bg-elevated
      border border-calm-warm-100
      shadow-calm-sm
    `,
    flat: `
      bg-calm-bg-secondary
      border border-calm-warm-100
    `,
    outlined: `
      bg-calm-bg-elevated
      border border-calm-warm-200
    `,
  };

  // Calm hover shadows per variant
  const hoverShadows = {
    elevated: '0 8px 24px rgba(45, 55, 72, 0.08)',
    flat: '0 4px 12px rgba(45, 55, 72, 0.06)',
    outlined: '0 4px 12px rgba(45, 55, 72, 0.06)',
  };

  return (
    <motion.div
      className={`
        relative rounded-calm-xl overflow-hidden
        transition-colors duration-300
        ${variantStyles[variant]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      // Calm hover - only shadow elevation, no scale
      whileHover={{
        boxShadow: hoverShadows[variant],
      }}
      // Gentle transition
      transition={{
        duration: 0.4,
        ease: CALM_EASING.mist,
      }}
    >
      {/* Content - no depth layers, no transforms */}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Simple card variant - same calm styling
 * For lists and grids
 */
export function AAACardSimple({
  children,
  variant = 'elevated',
  className = '',
  onClick,
}: {
  children: ReactNode;
  variant?: 'elevated' | 'flat' | 'outlined';
  className?: string;
  onClick?: () => void;
}) {
  const variantStyles = {
    elevated: `
      bg-calm-bg-elevated
      border border-calm-warm-100
      shadow-calm-sm
    `,
    flat: `
      bg-calm-bg-secondary
      border border-calm-warm-100
    `,
    outlined: `
      bg-calm-bg-elevated
      border border-calm-warm-200
    `,
  };

  return (
    <motion.div
      className={`
        relative rounded-calm-lg overflow-hidden
        transition-colors duration-300
        ${variantStyles[variant]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      // Calm hover - subtle shadow only
      whileHover={{
        boxShadow: '0 4px 12px rgba(45, 55, 72, 0.06)',
      }}
      transition={{
        duration: 0.3,
        ease: CALM_EASING.gentle,
      }}
    >
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/**
 * Interactive card with tap feedback
 * For clickable items like exercise cards
 */
export function AAACardInteractive({
  children,
  className = '',
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.div
      className={`
        relative rounded-calm-xl overflow-hidden
        bg-calm-bg-elevated
        border border-calm-warm-100
        shadow-calm-sm
        transition-colors duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      // Calm hover
      whileHover={disabled ? {} : {
        boxShadow: '0 8px 24px rgba(45, 55, 72, 0.08)',
        borderColor: 'rgba(114, 168, 125, 0.3)', // Soft sage hint
      }}
      // Calm tap
      whileTap={disabled ? {} : {
        opacity: 0.95,
      }}
      transition={{
        duration: 0.3,
        ease: CALM_EASING.gentle,
      }}
    >
      <div className="relative">{children}</div>
    </motion.div>
  );
}
