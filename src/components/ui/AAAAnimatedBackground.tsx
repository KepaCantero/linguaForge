'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AAAAnimatedBackgroundProps {
  variant?: 'aurora' | 'midnight' | 'sunset' | 'ocean';
  intensity?: 'subtle' | 'medium' | 'vivid';
  children?: React.ReactNode;
}

/**
 * Premium animated background with atmospheric effects
 * Creates immersive, living environments comparable to AAA game UIs
 *
 * Design philosophy inspired by:
 * - God of War (2018): Atmospheric depth and layering
 * - Horizon Zero Dawn: Dynamic, breathing environments
 * - The Last of Us Part II: Subtle, emotional ambience
 */
export function AAAAnimatedBackground({
  variant = 'aurora',
  intensity = 'medium',
  children,
}: AAAAnimatedBackgroundProps) {
  // Intensity configuration for performance and visual balance
  const intensityConfig = useMemo(() => {
    const configs = {
      subtle: {
        opacity: 0.3,
        scale: 1,
        duration: 20,
        particleCount: 3,
      },
      medium: {
        opacity: 0.5,
        scale: 1.2,
        duration: 15,
        particleCount: 5,
      },
      vivid: {
        opacity: 0.7,
        scale: 1.5,
        duration: 10,
        particleCount: 8,
      },
    };
    return configs[intensity];
  }, [intensity]);

  // Variant-specific gradient combinations
  const gradientLayers = useMemo(() => {
    const variants = {
      aurora: [
        'bg-aurora-borealis',
        'bg-forge-gradient',
        'bg-resonance-gradient',
      ],
      midnight: [
        'bg-midnight-aurora',
        'bg-ocean-depth',
        'bg-gradient-to-b from-calm-bg-tertiary via-calm-bg-tertiary/20 to-calm-bg-tertiary',
      ],
      sunset: [
        'bg-sunset-blaze',
        'bg-gradient-to-br from-amber-500 via-sky-500 to-sky-600',
      ],
      ocean: [
        'bg-ocean-depth',
        'bg-gradient-to-b from-sky-900 via-calm-bg-tertiary to-calm-bg-tertiary',
      ],
    };
    return variants[variant];
  }, [variant]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-calm-bg-tertiary">
      {/* Primary gradient layer - slow, majestic movement */}
      <motion.div
        className={`absolute inset-0 ${gradientLayers[0]}`}
        style={{
          opacity: intensityConfig.opacity * 0.4,
        }}
        animate={{
          scale: [1, intensityConfig.scale, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: intensityConfig.duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary gradient layer - counter-movement for depth */}
      <motion.div
        className={`absolute inset-0 ${gradientLayers[1] || gradientLayers[0]}`}
        style={{
          opacity: intensityConfig.opacity * 0.3,
        }}
        animate={{
          scale: [intensityConfig.scale, 1, intensityConfig.scale],
          rotate: [0, -3, 3, 0],
        }}
        transition={{
          duration: intensityConfig.duration * 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Neural network particles - subtle radial glows */}
      {Array.from({ length: intensityConfig.particleCount }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute bg-neural-network"
          style={{
            width: '400px',
            height: '400px',
            left: `${(i * 100) / intensityConfig.particleCount}%`,
            top: `${(i * 80) / intensityConfig.particleCount}%`,
            opacity: intensityConfig.opacity * 0.2,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [intensityConfig.opacity * 0.2, intensityConfig.opacity * 0.4, intensityConfig.opacity * 0.2],
          }}
          transition={{
            duration: intensityConfig.duration + (i * 2),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Glassmorphism overlay for depth and texture */}
      <div className="absolute inset-0 bg-calm-bg-secondary backdrop-blur-md" />

      {/* Animated vignette for cinematic framing */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(15, 23, 42, 0.4) 100%)',
        }}
        animate={{
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Subtle noise texture for premium feel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Simplified variant for sections (not full page)
 * Use for cards, modals, or specific content areas
 */
export function AAAAnimatedSection({
  variant = 'aurora',
  children,
}: {
  variant?: 'aurora' | 'midnight' | 'sunset' | 'ocean';
  children: React.ReactNode;
}) {
  const gradientClasses = {
    aurora: 'bg-aurora-borealis',
    midnight: 'bg-midnight-aurora',
    sunset: 'bg-sunset-blaze',
    ocean: 'bg-ocean-depth',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Animated gradient background */}
      <motion.div
        className={`absolute inset-0 ${gradientClasses[variant]}`}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-calm-bg-secondary backdrop-blur-md" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
