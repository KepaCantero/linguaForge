'use client';

import { motion } from 'framer-motion';

interface LinguaShardProps {
  resonance: number; // 0 to 100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeConfig = {
  sm: { width: 'w-16', height: 'h-20', text: 'text-lg' },
  md: { width: 'w-24', height: 'h-28', text: 'text-2xl' },
  lg: { width: 'w-32', height: 'h-36', text: 'text-3xl' },
};

export function LinguaShard({
  resonance,
  label = 'Tongue Mastery',
  size = 'md',
  showLabel = true,
}: LinguaShardProps) {
  const config = sizeConfig[size];
  const clampedResonance = Math.max(0, Math.min(100, resonance));

  // Determine mastery level based on resonance
  const getMasteryLevel = () => {
    if (clampedResonance < 33) return 'Novato';
    if (clampedResonance < 66) return 'Forjador';
    return 'Maestro';
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Crystal Container */}
      <div className={`relative ${config.width} ${config.height}`}>
        {/* Outer Glow */}
        <motion.div
          className="absolute inset-0 rounded-sm blur-xl bg-lf-primary/30"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Hexagonal Crystal Base */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }}
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-lf-dark" />

          {/* Fill based on resonance */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-resonance-gradient"
            initial={{ height: '0%' }}
            animate={{ height: `${clampedResonance}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Crystal crack overlay */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center"
            style={{ backgroundImage: "url('/patterns/crystal-cracks.svg')" }}
          />

          {/* Inner glow */}
          <motion.div
            className="absolute inset-0 bg-lf-accent/10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Border frame */}
        <div
          className="absolute inset-0 border-2 border-lf-primary/60"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }}
        />

        {/* Corner accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-lf-accent rounded-full shadow-glow-accent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-lf-accent rounded-full shadow-glow-accent" />
      </div>

      {/* Labels */}
      {showLabel && (
        <div className="mt-3 text-center">
          <motion.span
            className="block font-rajdhani text-lf-accent text-xs tracking-[0.2em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Resonance
          </motion.span>
          <motion.span
            className={`block font-rajdhani text-white ${config.text} font-bold`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {clampedResonance}%
          </motion.span>
          <motion.p
            className="font-atkinson text-lf-secondary/80 text-xs mt-1 uppercase tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {getMasteryLevel()} - {label}
          </motion.p>
        </div>
      )}
    </div>
  );
}
