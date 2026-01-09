'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface AAAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  children: React.ReactNode;
}

/**
 * Premium button component with AAA-quality interactions
 * Features:
 * - Haptic-like visual feedback
 * - Glassmorphism variants
 * - Premium glow effects
 * - Smooth micro-interactions
 */
export const AAAButton = forwardRef<HTMLButtonElement, AAAButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      glow = true,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Variant styling - AAA-quality color systems
    const variantStyles = {
      primary: `
        bg-gradient-to-r from-lf-primary to-lf-primary-dark
        text-white
        border border-lf-primary-light/30
        shadow-glow-accent
        hover:shadow-resonance-lg
      `,
      secondary: `
        bg-gradient-to-r from-lf-secondary to-lf-secondary-light
        text-white
        border border-lf-secondary-light/30
        shadow-glow-secondary
        hover:shadow-glow-secondary
      `,
      accent: `
        bg-gradient-to-r from-lf-accent to-lf-accent-dark
        text-lf-dark
        border border-lf-accent-subtle/50
        shadow-glow-accent
        hover:shadow-glow-accent
      `,
      ghost: `
        bg-transparent
        text-lf-primary-light
        border border-lf-primary/20
        hover:bg-lf-primary/10
        hover:border-lf-primary/40
      `,
      glass: `
        bg-glass-surface
        backdrop-blur-aaa
        text-white
        border border-white/20
        shadow-glass
        hover:bg-white/10
      `,
    };

    // Size system - consistent spacing
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-aaa-lg',
      xl: 'px-10 py-5 text-xl rounded-aaa-xl',
    };

    const baseStyles = `
      relative overflow-hidden
      font-medium
      transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-lf-primary-light/50
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `;

    return (
      <motion.button
        ref={ref}
        className={baseStyles}
        disabled={disabled}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...(props as any)}
      >
        {/* Shimmer effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
          style={{ mixBlendMode: 'overlay' }}
        />

        {/* Inner glow for premium feel */}
        {glow && (
          <motion.div
            className="absolute inset-0 rounded-inherit shadow-inner-glow opacity-0"
            whileHover={{ opacity: 0.5 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  }
);

AAAButton.displayName = 'AAAButton';
