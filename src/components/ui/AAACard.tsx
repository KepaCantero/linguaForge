'use client';

import { ReactNode, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionProps } from 'framer-motion';

interface AAACardProps {
  children: ReactNode;
  variant?: 'glass' | 'solid' | 'gradient';
  intensity?: 'subtle' | 'medium' | 'strong';
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Premium card component with 3D perspective and depth effects
 * Inspired by AAA game UI cards (God of War, Horizon, TLOU2)
 *
 * Features:
 * - 3D tilt effect on mouse move
 * - Glassmorphism with depth layers
 * - Premium hover states with glow
 * - Smooth spring animations
 */
export function AAACard({
  children,
  variant = 'glass',
  intensity = 'medium',
  glow = true,
  className = '',
  onClick,
}: AAACardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Mouse position tracking for 3D effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring-configured transforms for smooth 3D movement
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Transform mouse position to rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [intensity === 'strong' ? 8 : 4, intensity === 'strong' ? -8 : -4]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [intensity === 'strong' ? -8 : -4, intensity === 'strong' ? 8 : 4]);

  // Handle mouse move for 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  // Reset on mouse leave
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Variant styling
  const variantStyles = {
    glass: `
      bg-glass-surface
      backdrop-blur-aaa
      border border-white/20
      shadow-glass-xl
    `,
    solid: `
      bg-white/10
      backdrop-blur-md
      border border-white/10
      shadow-depth-lg
    `,
    gradient: `
      bg-gradient-to-br from-white/15 to-white/5
      backdrop-blur-aaa
      border border-white/20
      shadow-glow-accent
    `,
  };

  // Intensity-based glow
  const glowIntensity = {
    subtle: 'opacity-30',
    medium: 'opacity-60',
    strong: 'opacity-100',
  };

  return (
    <motion.div
      ref={ref}
      className={`
        relative rounded-aaa-xl overflow-hidden
        transition-all duration-500
        ${variantStyles[variant]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Premium glow effect on hover */}
      {glow && (
        <motion.div
          className={`
            absolute inset-0 rounded-aaa-xl
            bg-gradient-to-br from-lf-primary/20 via-lf-secondary/20 to-lf-accent/20
            shadow-inner-glow
            ${glowIntensity[intensity]}
          `}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Depth shadow layer */}
      <div className="absolute inset-0 rounded-aaa-xl shadow-depth-xl opacity-40" />

      {/* Content with depth */}
      <div className="relative z-10 h-full" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>

      {/* Subtle shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, transparent 50%)',
          backgroundSize: '200% 100%',
        }}
        whileHover={{
          opacity: 1,
          backgroundPosition: ['100% 0%', '-100% 0%'],
        }}
        transition={{ duration: 1.5 }}
      />
    </motion.div>
  );
}

/**
 * Simplified card variant without 3D effects
 * Better for lists and grids where performance matters
 */
export function AAACardSimple({
  children,
  variant = 'glass',
  className = '',
  onClick,
}: {
  children: ReactNode;
  variant?: 'glass' | 'solid' | 'gradient';
  className?: string;
  onClick?: () => void;
}) {
  const variantStyles = {
    glass: `
      bg-glass-surface
      backdrop-blur-aaa
      border border-white/20
      shadow-glass
    `,
    solid: `
      bg-white/10
      backdrop-blur-md
      border border-white/10
      shadow-depth-md
    `,
    gradient: `
      bg-gradient-to-br from-white/15 to-white/5
      backdrop-blur-aaa
      border border-white/20
    `,
  };

  return (
    <motion.div
      className={`
        relative rounded-aaa-xl overflow-hidden
        transition-all duration-300
        ${variantStyles[variant]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={{
        scale: 1.01,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
