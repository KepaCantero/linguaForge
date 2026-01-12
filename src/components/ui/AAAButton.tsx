'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { CALM_EASING } from '@/lib/animations';

interface AAAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

/**
 * CALM Button Component
 *
 * Design Philosophy:
 * - No aggressive scale effects
 * - Soft shadow elevation on hover
 * - Gentle opacity change on tap
 * - Nurturing, not demanding
 */
export const AAAButton = forwardRef<HTMLButtonElement, AAAButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Calm variant styles - soft, inviting colors
    const variantStyles = {
      primary: `
        bg-calm-sage-400
        text-white
        border border-calm-sage-300/30
        shadow-calm-sm
      `,
      secondary: `
        bg-calm-blue-400
        text-white
        border border-calm-blue-300/30
        shadow-calm-sm
      `,
      accent: `
        bg-calm-accent-400
        text-white
        border border-calm-accent-300/30
        shadow-calm-sm
      `,
      ghost: `
        bg-transparent
        text-calm-text-primary
        border border-transparent
        hover:bg-calm-bg-tertiary
      `,
      outline: `
        bg-calm-bg-elevated
        text-calm-text-primary
        border border-calm-warm-200
        shadow-calm-sm
      `,
    };

    // Calm size system - generous padding, rounded corners
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-calm-lg',
      xl: 'px-10 py-5 text-xl rounded-calm-xl',
    };

    const baseStyles = `
      relative overflow-hidden
      font-medium
      transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-calm-sage-400/30 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `;

    // Calm hover shadow based on variant
    const hoverShadow = {
      primary: '0 4px 12px rgba(114, 168, 125, 0.15)',
      secondary: '0 4px 12px rgba(130, 154, 177, 0.15)',
      accent: '0 4px 12px rgba(232, 144, 124, 0.15)',
      ghost: '0 2px 8px rgba(45, 55, 72, 0.06)',
      outline: '0 4px 12px rgba(45, 55, 72, 0.08)',
    };

    return (
      <motion.button
        ref={ref}
        className={baseStyles}
        disabled={disabled}
        // Calm hover - just shadow elevation, no scale
        whileHover={{
          boxShadow: hoverShadow[variant],
        }}
        // Calm tap - soft opacity, no scale down
        whileTap={{
          opacity: 0.9,
        }}
        // Gentle, non-bouncy transition
        transition={{
          duration: 0.3,
          ease: CALM_EASING.gentle,
        }}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {/* Button content - no shimmer, no glow overlays */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  }
);

AAAButton.displayName = 'AAAButton';
