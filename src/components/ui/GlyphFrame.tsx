'use client';
import { COLORS } from '@/constants/colors';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlyphFrameProps {
  children: ReactNode;
  title?: string;
  variant?: 'default' | 'accent' | 'success' | 'muted' | 'warning' | 'error' | 'gradient';
  className?: string;
  animate?: boolean;
  glow?: boolean;
  glowColor?: string;
}

const variantStyles = {
  default: {
    border: 'border-accent-500/40',
    corner: 'border-amber-500',
    title: 'text-calm-text-secondary',
    bg: 'bg-calm-bg-tertiary/95',
  },
  accent: {
    border: 'border-amber-500/40',
    corner: 'border-sky-500',
    title: 'text-amber-500',
    bg: 'bg-calm-bg-tertiary/95',
  },
  success: {
    border: 'border-accent-500/40',
    corner: 'border-accent-400',
    title: 'text-accent-400',
    bg: 'bg-calm-bg-tertiary/95',
  },
  muted: {
    border: 'border-calm-warm-100/40',
    corner: 'border-calm-warm-100',
    title: 'text-calm-text-muted',
    bg: 'bg-calm-bg-secondary/90',
  },
  warning: {
    border: 'border-amber-500/40',
    corner: 'border-amber-400',
    title: 'text-amber-400',
    bg: 'bg-amber-900/10',
  },
  error: {
    border: 'border-semantic-error/40',
    corner: 'border-semantic-error',
    title: 'text-semantic-error',
    bg: 'bg-semantic-error-bg',
  },
  gradient: {
    border: 'border-transparent',
    corner: 'border-transparent',
    title: 'text-white',
    bg: 'bg-gradient-to-br from-accent-500/20 to-sky-500/20',
  },
};

export function GlyphFrame({
  children,
  title,
  variant = 'default',
  className = '',
  animate = true,
  glow = false,
  glowColor,
}: GlyphFrameProps) {
  const styles = variantStyles[variant];

  const FrameWrapper = animate ? motion.div : 'div';
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <FrameWrapper
      className={`relative p-[1px] rounded-glyph ${className} ${glow ? 'shadow-lg' : ''}`}
      style={glow ? { boxShadow: `0 0 20px ${glowColor || COLORS.sky[30]}` } : {}}
      {...animationProps}
    >
      {/* Main border */}
      <div className={`absolute inset-0 border ${styles.border} rounded-glyph pointer-events-none`}>
        {/* Title badge */}
        {title && (
          <div className="absolute top-0 left-4 px-2 bg-calm-bg-tertiary -translate-y-1/2">
            <span className={`font-rajdhani ${styles.title} text-xs uppercase tracking-[0.15em]`}>
              {title}
            </span>
          </div>
        )}

        {/* Corner decorations - top left */}
        <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${styles.corner} rounded-tl-glyph`} />
        {/* Corner decorations - top right */}
        <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${styles.corner} rounded-tr-glyph`} />
        {/* Corner decorations - bottom left */}
        <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${styles.corner} rounded-bl-glyph`} />
        {/* Corner decorations - bottom right */}
        <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${styles.corner} rounded-br-glyph`} />

        {/* Glyph pattern overlay (subtle) */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "url('/patterns/phonetic-glyphs.svg')",
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content area */}
      <div className={`relative ${styles.bg} p-4 rounded-glyph`}>
        {children}
      </div>
    </FrameWrapper>
  );
}
