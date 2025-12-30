'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlyphFrameProps {
  children: ReactNode;
  title?: string;
  variant?: 'default' | 'accent' | 'success' | 'muted';
  className?: string;
  animate?: boolean;
}

const variantStyles = {
  default: {
    border: 'border-lf-primary/40',
    corner: 'border-lf-accent',
    title: 'text-lf-secondary',
    bg: 'bg-lf-dark/95',
  },
  accent: {
    border: 'border-lf-accent/40',
    corner: 'border-lf-secondary',
    title: 'text-lf-accent',
    bg: 'bg-lf-dark/95',
  },
  success: {
    border: 'border-emerald-500/40',
    corner: 'border-emerald-400',
    title: 'text-emerald-400',
    bg: 'bg-lf-dark/95',
  },
  muted: {
    border: 'border-lf-muted/40',
    corner: 'border-lf-muted',
    title: 'text-gray-400',
    bg: 'bg-lf-soft/90',
  },
};

export function GlyphFrame({
  children,
  title,
  variant = 'default',
  className = '',
  animate = true,
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
      className={`relative p-[1px] rounded-glyph ${className}`}
      {...animationProps}
    >
      {/* Main border */}
      <div className={`absolute inset-0 border ${styles.border} rounded-glyph pointer-events-none`}>
        {/* Title badge */}
        {title && (
          <div className="absolute top-0 left-4 px-2 bg-lf-dark -translate-y-1/2">
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
