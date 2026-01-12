'use client';

import { motion } from 'framer-motion';
import { TextStatOrb } from './TextStatsOrb';
import type { TextStats } from '@/hooks/useTextStats';

interface TextInputOrbitalHUDProps {
  textStats: TextStats;
  icon: string;
  colorStart: string;
  colorEnd: string;
}

/**
 * Orbital HUD visualization component for text input stats
 * Reduces parent component complexity by isolating orbital animation logic
 */
export function TextInputOrbitalHUD({
  textStats,
  icon,
  colorStart,
  colorEnd,
}: TextInputOrbitalHUDProps) {
  return (
    <div className="relative w-full h-[45vh] flex items-center justify-center">
      {/* Outer decorative rings */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: `${200 + i * 40}px`,
            height: `${200 + i * 40}px`,
            borderColor: `rgba(6, 182, 212, ${0.15 - i * 0.03})`,
            borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
          }}
          animate={{
            rotate: i % 2 === 0 ? [0, 360] : [360, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 25 + i * 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Central Core */}
      <motion.div
        className="relative w-32 h-32 rounded-full z-10"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colorStart}, ${colorEnd})`,
        }}
        animate={{
          scale: [1, 1.06, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        whileHover={{ scale: 1.12 }}
      >
        {/* Core glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, rgba(6, 182, 212, 0.8), transparent)`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Core icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div
            className="text-5xl"
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {icon}
          </motion.div>
        </div>
      </motion.div>

      {/* Stat orbs in orbital arrangement */}
      <TextStatOrb
        value={textStats.textCount}
        label="Textos"
        icon="📄"
        color="#06B6D4"
        angle={-90}
        distance={120}
        delay={0}
      />

      <TextStatOrb
        value={textStats.wordsRead.toLocaleString()}
        label="Palabras"
        icon="📝"
        color="#22D3EE"
        angle={30}
        distance={120}
        delay={0.1}
      />

      <TextStatOrb
        value={`${textStats.hoursRead}h`}
        label="Horas"
        icon="⏱️"
        color="#67E8F9"
        angle={150}
        distance={120}
        delay={0.2}
      />

      {/* Floating particles */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full opacity-70"
          style={{
            background: i % 2 === 0 ? '#06B6D4' : '#22D3EE',
            left: `${25 + (i * 8) % 50}%`,
            top: `${15 + (i * 10) % 70}%`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, i % 2 === 0 ? 30 : -30, 0],
            scale: [1, 0.6, 1],
            opacity: [0.7, 0.3, 0.7],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}
