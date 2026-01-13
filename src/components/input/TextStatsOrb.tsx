'use client';

import { motion } from 'framer-motion';

interface TextStatOrbProps {
  value: string | number;
  label: string;
  icon: string;
  color: string;
  angle: number;
  distance: number;
  delay: number;
}

/**
 * Circular stat orb component for displaying statistics in orbital arrangement
 * Reduces complexity of parent components by isolating animation logic
 */
export function TextStatOrb({ value, label, icon, color, angle, distance, delay }: TextStatOrbProps) {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * distance;
  const y = Math.sin(radians) * distance;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px - 50px)`,
        top: `calc(50% + ${y}px - 50px)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 200,
      }}
    >
      <motion.div
        className="relative w-24 h-24 rounded-full cursor-pointer"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}DD)`,
        }}
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 3 + delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.15, y: -18 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-lg"
          style={{
            background: `radial-gradient(circle, ${color}CC, transparent)`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity, delay }}
        />

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          {icon}
        </div>

        {/* Value */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-sm font-bold text-white">{value}</div>
          <div className="text-xs text-calm-text-muted">{label}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
