import { motion } from 'framer-motion';
import { COLORS } from '@/constants/colors';

interface CircularMeterProps {
  value: number;
  label: string;
  color: string;
  delay: number;
  isMain?: boolean;
}

export function CircularMeter({ value, label, color, delay, isMain = false }: CircularMeterProps) {
  const size = isMain ? 100 : 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLORS.white[10]}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{ duration: 1.5, delay: delay + 0.2 }}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: 0,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="text-lg font-bold text-white"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, delay }}
        >
          {Math.round(value)}%
        </motion.div>
        <div className="text-xs text-calm-text-muted mt-1">{label}</div>
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl opacity-50"
        style={{ background: color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, delay }}
      />
    </motion.div>
  );
}
