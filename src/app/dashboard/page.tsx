'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NeuralDashboard } from '@/components/visualization/NeuralDashboard';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useCognitiveLoad } from '@/store/useCognitiveLoadStore';
import { useMissionStore } from '@/store/useMissionStore';
import type { BrainZoneId } from '@/components/visualization/BrainZoneActivation';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { xp, level, rank } = useGamificationStore();
  const { load } = useCognitiveLoad();
  const { dailyMissions } = useMissionStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const synapsesCount = useMemo(() => {
    return Math.floor(xp / 10) + (level * 100);
  }, [xp, level]);

  const synapticStrength = useMemo(() => {
    return Math.min(100, level * 5 + load.germane);
  }, [level, load.germane]);

  const activePathways = useMemo(() => {
    const completed = dailyMissions.filter(m => m.completed).length;
    const pathways = [];

    if (completed >= 1) pathways.push('comprehension');
    if (completed >= 2) pathways.push('production');
    if (completed >= 3) pathways.push('retention');
    if (completed >= 4) pathways.push('fluency');

    return pathways;
  }, [dailyMissions]);

  const activatedZones = useMemo(() => {
    const zones: BrainZoneId[] = [];

    if (load.germane > 60) zones.push('prefrontal');
    if (load.germane > 40) zones.push('temporal');
    if (load.intrinsic > 50) zones.push('parietal');
    if (load.germane > 30 && load.extraneous < 40) zones.push('broca');
    if (load.germane > 70) zones.push('wernicke');

    return zones;
  }, [load]);

  const neuronalIrrigation = useMemo(() => ({
    totalMinutes: Math.floor(xp / 10),
    effectiveMinutes: Math.floor((xp / 10) * (load.germane / 100)),
    wordsProcessed: synapsesCount * 10,
    comprehensionLevel: load.germane / 100,
    irrigationRate: Math.max(0, load.germane),
    streakDays: 0,
    lastIrrigationTime: Date.now(),
  }), [xp, synapsesCount, load]);

  const currentLevel = useMemo(() => {
    const xpForCurrentLevel = level * 1000;
    const xpForNextLevel = (level + 1) * 1000;
    const progress = (xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel);
    return Math.round(progress * 100);
  }, [xp, level]);

  const inputLevel = useMemo(() => {
    const inputMissions = dailyMissions.filter(m => m.type === 'input' && m.completed).length;
    return Math.min(100, inputMissions * 25);
  }, [dailyMissions]);

  return (
    <div className="space-y-8">
      {/* Central HUD - Giant circular stats */}
      <div className="relative w-full h-[55vh] flex items-center justify-center">
        {/* Outer decorative rings */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: `${250 + i * 50}px`,
              height: `${250 + i * 50}px`,
              borderColor: `rgba(99, 102, 241, ${0.15 - i * 0.02})`,
              borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
            }}
            animate={{
              rotate: i % 2 === 0 ? [0, 360] : [360, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 30 + i * 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        {/* Main stats in orbital arrangement */}
        {/* Level orb - Top */}
        <StatOrb
          value={level}
          label="Nivel"
          icon="⭐"
          color="#FDE047"
          angle={-90}
          distance={140}
          delay={0}
        />

        {/* XP orb - Top Right */}
        <StatOrb
          value={xp.toLocaleString()}
          label="XP"
          icon="✨"
          color="#6366F1"
          angle={-18}
          distance={140}
          delay={0.1}
        />

        {/* Synapses orb - Bottom Right */}
        <StatOrb
          value={synapsesCount.toLocaleString()}
          label="Sinapsis"
          icon="🔗"
          color="#22C55E"
          angle={54}
          distance={140}
          delay={0.2}
        />

        {/* Rank orb - Bottom Left */}
        <StatOrb
          value={rank}
          label="Rango"
          icon="🏅"
          color="#C026D3"
          angle={126}
          distance={140}
          delay={0.3}
        />

        {/* Level progress orb - Top Left */}
        <StatOrb
          value={`${currentLevel}%`}
          label="Progreso"
          icon="📈"
          color="#F59E0B"
          angle={198}
          distance={140}
          delay={0.4}
        />

        {/* Central Core */}
        <motion.div
          className="relative w-40 h-40 rounded-full cursor-pointer z-10"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5, #4338CA)',
          }}
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, 3, -3, 0],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          whileHover={{ scale: 1.15 }}
        >
          {/* Inner glow */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8), transparent)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Animated inner rings */}
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2 border-white/20"
              style={{
                width: `${60 + i * 15}px`,
                height: `${60 + i * 15}px`,
                left: `${20 - i * 7.5}px`,
                top: `${20 - i * 7.5}px`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 360, 0],
              }}
              transition={{
                duration: 4 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.div
              className="text-5xl mb-1"
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🧠
            </motion.div>
            <motion.div
              className="text-2xl font-bold text-white"
              animate={{
                textShadow: [
                  '0 0 10px rgba(255,255,255,0.5)',
                  '0 0 20px rgba(255,255,255,0.8)',
                  '0 0 10px rgba(255,255,255,0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {level}
            </motion.div>
            <div className="text-xs text-lf-muted">
              Nivel
            </div>
          </div>
        </motion.div>

        {/* Floating particles */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-lf-accent opacity-70"
            style={{
              left: `${25 + (i * 9) % 50}%`,
              top: `${20 + (i * 7) % 60}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, (i % 2 === 0 ? 40 : -40), 0],
              scale: [1, 0.5, 1],
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

      {/* Neural Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <NeuralDashboard
          currentLevel={currentLevel}
          inputLevel={inputLevel}
          synapsesCount={synapsesCount}
          synapticStrength={synapticStrength}
          activePathways={activePathways}
          activatedZones={activatedZones}
          neuronalIrrigation={neuronalIrrigation}
          variant="standard"
          showAnimations={true}
        />
      </motion.div>

      {/* Cognitive Load - Circular meters */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative h-48"
      >
        <h2 className="text-center text-lg font-bold text-white mb-6">Carga Cognitiva</h2>

        {/* Three circular meters */}
        <div className="flex justify-center items-center gap-8">
          {/* Intrinsic Load */}
          <CircularMeter
            value={load.intrinsic}
            label="Intrínseca"
            color="#3B82F6"
            delay={0}
          />

          {/* Germane Load */}
          <CircularMeter
            value={load.germane}
            label="Germana"
            color="#22C55E"
            delay={0.1}
            isMain
          />

          {/* Extraneous Load */}
          <CircularMeter
            value={load.extraneous}
            label="Extraña"
            color="#F59E0B"
            delay={0.2}
          />
        </div>
      </motion.div>
    </div>
  );
}

// Stat Orb Component
interface StatOrbProps {
  value: string | number;
  label: string;
  icon: string;
  color: string;
  angle: number;
  distance: number;
  delay: number;
}

function StatOrb({ value, label, icon, color, angle, distance, delay }: StatOrbProps) {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * distance;
  const y = Math.sin(radians) * distance;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px - 40px)`,
        top: `calc(50% + ${y}px - 40px)`,
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
        className="relative w-20 h-20 rounded-full cursor-pointer"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}DD)`,
        }}
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 3 + delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.15, y: -15 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-md"
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
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {icon}
        </div>

        {/* Value */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-sm font-bold text-white">{value}</div>
          <div className="text-xs text-lf-muted">{label}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Circular Meter Component
interface CircularMeterProps {
  value: number;
  label: string;
  color: string;
  delay: number;
  isMain?: boolean;
}

function CircularMeter({ value, label, color, delay, isMain = false }: CircularMeterProps) {
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
          stroke="rgba(255,255,255,0.1)"
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
        <div className="text-xs text-lf-muted mt-1">{label}</div>
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
