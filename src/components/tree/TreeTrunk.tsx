'use client';

import { motion } from 'framer-motion';
import { SPRING, DURATION } from '@/lib/motion';

interface TreeTrunkProps {
  cx: number;
  cy: number;
  radius: number;
  title?: string;
}

export function TreeTrunk({ cx, cy, radius }: TreeTrunkProps) {
  return (
    <g>
      {/* Definitions for gradients and filters */}
      <defs>
        {/* Main gradient */}
        <radialGradient id="trunkGradient" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#581C87" />
        </radialGradient>

        {/* Outer glow gradient */}
        <radialGradient id="trunkGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7E22CE" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#7E22CE" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7E22CE" stopOpacity="0" />
        </radialGradient>

        {/* Inner highlight */}
        <radialGradient id="trunkHighlight" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outermost glow ring - breathing animation */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={radius + 20}
        fill="url(#trunkGlow)"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Second glow ring */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={radius + 10}
        fill="none"
        stroke="#D946EF"
        strokeWidth={1}
        strokeOpacity={0.3}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      {/* Main trunk circle */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="url(#trunkGradient)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ ...SPRING.bouncy, delay: 0.1 }}
      />

      {/* Inner highlight for 3D effect */}
      <circle cx={cx} cy={cy} r={radius} fill="url(#trunkHighlight)" />

      {/* Border ring */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={2}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: DURATION.normal }}
      />

      {/* Center icon */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING.bouncy, delay: 0.4 }}
      >
        {/* Icon background circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius * 0.5}
          fill="rgba(0,0,0,0.2)"
        />

        {/* Tree emoji */}
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={radius * 0.6}
        >
          🌳
        </text>
      </motion.g>

      {/* Accent dots around the trunk */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const dotX = cx + Math.cos(rad) * (radius + 5);
        const dotY = cy + Math.sin(rad) * (radius + 5);

        return (
          <motion.circle
            key={angle}
            cx={dotX}
            cy={dotY}
            r={2}
            fill="#FACC15"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: 1 }}
            transition={{
              opacity: { duration: 2, repeat: Infinity, delay: i * 0.2 },
              scale: { ...SPRING.snappy, delay: 0.5 + i * 0.05 },
            }}
          />
        );
      })}
    </g>
  );
}
