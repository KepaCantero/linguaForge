'use client';
import { COLORS } from '@/constants/colors';

import { motion } from 'framer-motion';

interface PulseRingProps {
  active?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PulseRing({ active = true, color = COLORS.sky[50], children }: PulseRingProps) {
  return (
    <div className="relative inline-flex items-center justify-center">
      {active && (
        <>
          <motion.div
            className={`absolute inset-0 rounded-full`}
            style={{ backgroundColor: color }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ 
              scale: [1, 1.3, 1.5],
              opacity: [0.6, 0.3, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.div
            className={`absolute inset-0 rounded-full`}
            style={{ backgroundColor: color }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ 
              scale: [1, 1.3, 1.5],
              opacity: [0.6, 0.3, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.5,
            }}
          />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

