'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '@/constants/colors';

interface AAAInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'glass' | 'solid' | 'underline';
}

// Variant style configurations
const VARIANT_STYLES = {
  glass: {
    input: 'bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/30 focus:border-accent-500-light/60 focus:shadow-calm-md',
    underline: 'bg-transparent border-0 border-b-2 border-calm-warm-100/30 rounded-none focus:border-accent-500 focus:shadow-inner-glow',
  },
  solid: 'bg-white/10 backdrop-blur-md border border-calm-warm-100/20 focus:border-accent-500/50',
  underline: 'bg-transparent border-0 border-b-2 border-calm-warm-100/30 rounded-none focus:border-accent-500 focus:shadow-inner-glow',
};

// Helper function to get variant styles
function getVariantStyles(variant: AAAInputProps['variant']): string {
  switch (variant) {
    case 'solid':
      return VARIANT_STYLES.solid;
    case 'underline':
      return VARIANT_STYLES.underline;
    case 'glass':
    default:
      return VARIANT_STYLES.glass.input;
  }
}

// Helper function to get label color
function getLabelColor(isFocused: boolean, hasError: boolean): string {
  if (hasError) return 'text-semantic-error';
  if (isFocused) return 'text-calm-text-primary-light';
  return 'text-white/60';
}

// FloatingLabel subcomponent
interface FloatingLabelProps {
  label: string;
  isFocused: boolean;
  hasValue: boolean;
  hasError: boolean;
}

function FloatingLabel({ label, isFocused, hasValue, hasError }: FloatingLabelProps) {
  const shouldFloat = isFocused || hasValue;
  const labelColor = getLabelColor(isFocused, hasError);

  return (
    <motion.label
      className={`absolute left-4 top-3.5 text-sm pointer-events-none transition-colors duration-300 ${labelColor}`}
      initial={false}
      animate={{
        y: shouldFloat ? -24 : 0,
        scale: shouldFloat ? 0.85 : 1,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {label}
    </motion.label>
  );
}

// InputIcon subcomponent
interface InputIconProps {
  icon: React.ReactNode;
  isFocused: boolean;
}

function InputIcon({ icon, isFocused }: InputIconProps) {
  return (
    <motion.div
      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
      animate={{
        color: isFocused ? COLORS.sky[80] : COLORS.white[40],
      }}
      transition={{ duration: 0.3 }}
    >
      {icon}
    </motion.div>
  );
}

// FocusGlow subcomponent
function FocusGlow() {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl pointer-events-none"
      style={{ boxShadow: `0 0 20px ${COLORS.sky[30]}` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  );
}

// ErrorMessage subcomponent
interface ErrorMessageProps {
  error: string;
}

function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <motion.div
      className="mt-1 text-sm text-semantic-error flex items-center gap-1"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-xs">⚠</span>
      {error}
    </motion.div>
  );
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
  ({ label, error, icon, variant = 'glass', className = '', value, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== '';

    const variantStyles = getVariantStyles(variant);
    const baseStyles = `w-full px-4 py-3 rounded-xl text-white placeholder-white/40 outline-none transition-all duration-300 ${variantStyles} ${error ? 'border-semantic-error focus:border-semantic-error-dark' : ''} ${className}`;
    const wrapperStyles = variant === 'underline' ? '' : 'relative';
    const paddingTop = label && (isFocused || hasValue) ? '1.5rem' : '0.75rem';

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <div className={wrapperStyles}>
        {/* Floating label */}
        {label && <FloatingLabel label={label} isFocused={isFocused} hasValue={hasValue} hasError={!!error} />}

        {/* Input container */}
        <div className="relative">
          {/* Icon */}
          {icon && <InputIcon icon={icon} isFocused={isFocused} />}

          {/* Input */}
          <input
            ref={ref}
            className={baseStyles}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ paddingTop }}
            {...props}
          />

          {/* Focus glow effect */}
          <AnimatePresence>
            {isFocused && <FocusGlow />}
          </AnimatePresence>
        </div>

        {/* Error message with animation */}
        <AnimatePresence>
          {error && <ErrorMessage error={error} />}
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
  ({ label, error, variant = 'glass', className = '', rows = 4, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== '';

    const variantStyles = getVariantStyles(variant);
    const baseStyles = `w-full px-4 py-3 rounded-xl text-white placeholder-white/40 outline-none transition-all duration-300 resize-none ${variantStyles} ${error ? 'border-semantic-error' : ''} ${className}`;
    const paddingTop = label && (isFocused || hasValue) ? '1.5rem' : '0.75rem';

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="relative">
        {/* Floating label */}
        {label && <FloatingLabel label={label} isFocused={isFocused} hasValue={hasValue} hasError={!!error} />}

        <textarea
          ref={ref}
          rows={rows}
          className={baseStyles}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ paddingTop }}
          {...(props as any)}
        />

        {/* Error message */}
        <AnimatePresence>
          {error && <ErrorMessage error={error} />}
        </AnimatePresence>
      </div>
    );
  }
);

AAATextarea.displayName = 'AAATextarea';
