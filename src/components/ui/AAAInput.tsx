'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AAAInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'glass' | 'solid' | 'underline';
}

/**
 * Premium input component with AAA-quality interactions
 * Features:
 * - Floating label animation
 * - Glassmorphism variants
 * - Smooth focus transitions
 * - Error states with visual feedback
 */
export const AAAInput = forwardRef<HTMLInputElement, AAAInputProps>(
  (
    {
      label,
      error,
      icon,
      variant = 'glass',
      className = '',
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== '';

    const variantStyles = {
      glass: `
        bg-glass-surface
        backdrop-blur-aaa
        border border-white/20
        focus:border-lf-primary-light/60
        focus:shadow-glow-accent
      `,
      solid: `
        bg-white/10
        backdrop-blur-md
        border border-white/10
        focus:border-lf-primary/50
      `,
      underline: `
        bg-transparent
        border-0 border-b-2 border-white/20
        rounded-none
        focus:border-lf-primary
        focus:shadow-inner-glow
      `,
    };

    const baseStyles = `
      w-full px-4 py-3
      rounded-xl
      text-white placeholder-white/40
      outline-none
      transition-all duration-300
      ${variantStyles[variant]}
      ${error ? 'border-lf-error focus:border-lf-error-dark' : ''}
      ${className}
    `;

    const wrapperStyles = variant === 'underline' ? '' : 'relative';

    return (
      <div className={wrapperStyles}>
        {/* Floating label */}
        {label && (
          <motion.label
            className={`
              absolute left-4 top-3.5
              text-sm pointer-events-none
              transition-colors duration-300
              ${error ? 'text-lf-error' : isFocused ? 'text-lf-primary-light' : 'text-white/60'}
            `}
            initial={false}
            animate={{
              y: isFocused || hasValue ? -24 : 0,
              scale: isFocused || hasValue ? 0.85 : 1,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {label}
          </motion.label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <motion.div
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
              animate={{
                color: isFocused ? 'rgba(99, 102, 241, 0.8)' : 'rgba(255, 255, 255, 0.4)',
              }}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.div>
          )}

          {/* Input */}
          <input
            ref={ref}
            className={baseStyles}
            value={value}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            style={{ paddingTop: label && (isFocused || hasValue) ? '1.5rem' : '0.75rem' }}
            {...props}
          />

          {/* Focus glow effect */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Error message with animation */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mt-1 text-sm text-lf-error flex items-center gap-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xs">⚠</span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AAAInput.displayName = 'AAAInput';

/**
 * Textarea variant for multi-line input
 */
interface AAATextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: 'glass' | 'solid' | 'underline';
  rows?: number;
}

export const AAATextarea = forwardRef<HTMLTextAreaElement, AAATextareaProps>(
  (
    {
      label,
      error,
      variant = 'glass',
      className = '',
      rows = 4,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== '';

    const variantStyles = {
      glass: `
        bg-glass-surface
        backdrop-blur-aaa
        border border-white/20
        focus:border-lf-primary-light/60
        resize-none
      `,
      solid: `
        bg-white/10
        backdrop-blur-md
        border border-white/10
        focus:border-lf-primary/50
        resize-none
      `,
      underline: `
        bg-transparent
        border-0 border-b-2 border-white/20
        rounded-none
        focus:border-lf-primary
        resize-none
      `,
    };

    const baseStyles = `
      w-full px-4 py-3
      rounded-xl
      text-white placeholder-white/40
      outline-none
      transition-all duration-300
      ${variantStyles[variant]}
      ${error ? 'border-lf-error' : ''}
      ${className}
    `;

    return (
      <div className="relative">
        {/* Floating label */}
        {label && (
          <motion.label
            className={`
              absolute left-4 top-3.5
              text-sm pointer-events-none
              transition-colors duration-300
              ${error ? 'text-lf-error' : isFocused ? 'text-lf-primary-light' : 'text-white/60'}
            `}
            initial={false}
            animate={{
              y: isFocused || hasValue ? -24 : 0,
              scale: isFocused || hasValue ? 0.85 : 1,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {label}
          </motion.label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          className={baseStyles}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={{ paddingTop: label && (isFocused || hasValue) ? '1.5rem' : '0.75rem' }}
          {...(props as any)}
        />

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mt-1 text-sm text-lf-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AAATextarea.displayName = 'AAATextarea';
