'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MissionFeed } from '@/components/missions';
import { useMissionStore, type Mission } from '@/store/useMissionStore';

export default function MissionsPage() {
  const router = useRouter();
  const { generateDailyMissions, checkDailyHP, dailyMissions } = useMissionStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    checkDailyHP();
    generateDailyMissions();
  }, [checkDailyHP, generateDailyMissions]);

  const handleMissionStart = (mission: Mission) => {
    switch (mission.type) {
      case 'input':
        router.push('/input');
        break;
      case 'exercises':
        router.push('/learn');
        break;
      case 'janus':
        router.push('/learn');
        break;
      case 'forgeMandate':
        router.push('/learn');
        break;
      case 'streak':
        break;
      default:
        router.push('/learn');
    }
  };

  // Stats from missions
  const completedCount = dailyMissions.filter(m => m.completed).length;
  const totalCount = dailyMissions.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Main Progress Orb - Giant central HUD */}
      <div className="relative w-full h-[50vh] flex items-center justify-center">
        {/* Outer rotating rings */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2"
            style={{
              width: `${200 + i * 40}px`,
              height: `${200 + i * 40}px`,
              borderColor: i % 2 === 0 ? 'rgba(99, 102, 241, 0.3)' : 'rgba(192, 38, 211, 0.3)',
            }}
            animate={{
              rotate: i % 2 === 0 ? [0, 360] : [360, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        {/* Progress ring */}
        <svg
          className="absolute"
          style={{ width: '280px', height: '280px' }}
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#C026D3" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#progress-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 1.5 }}
            style={{
              strokeDasharray: '282.74',
              strokeDashoffset: '0',
              transformOrigin: 'center',
            }}
          />
        </svg>

        {/* Central orb */}
        <motion.div
          className="relative w-48 h-48 rounded-full cursor-pointer"
          style={{
            background: progress === 100
              ? 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A, #15803D)'
              : 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5, #4338CA)',
          }}
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          whileHover={{ scale: 1.12 }}
        >
          {/* Inner glow */}
          <motion.div
            className="absolute inset-4 rounded-full blur-xl"
            style={{
              background: progress === 100
                ? 'radial-gradient(circle, rgba(34, 197, 94, 0.8), transparent)'
                : 'radial-gradient(circle, rgba(99, 102, 241, 0.8), transparent)',
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.div
              className="text-6xl mb-2"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {progress === 100 ? '🏆' : '⚔️'}
            </motion.div>
            <motion.div
              className="text-4xl font-bold text-white"
              animate={{
                textShadow: [
                  '0 0 10px rgba(255,255,255,0.5)',
                  '0 0 20px rgba(255,255,255,0.8)',
                  '0 0 10px rgba(255,255,255,0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {completedCount}/{totalCount}
            </motion.div>
            <div className="text-sm text-lf-muted mt-1">
              {progress === 100 ? '¡Completado!' : 'Misiones'}
            </div>
          </div>
        </motion.div>

        {/* Floating particles */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? '#6366F1' : '#C026D3',
              left: `${30 + (i * 10) % 40}%`,
              top: `${20 + (i * 15) % 60}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, (i % 2 === 0 ? 30 : -30), 0],
              scale: [1, 0, 1],
              opacity: [0.8, 0.3, 0.8],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Mission Orbs - Floating spheres instead of list */}
      <div className="flex flex-wrap justify-center gap-6">
        {dailyMissions.map((mission, index) => (
          <MissionOrb
            key={mission.id}
            mission={mission}
            index={index}
            onStart={() => handleMissionStart(mission)}
          />
        ))}
      </div>

      {/* Memory Bank Quick Access Orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="flex justify-center"
      >
        <Link href="/decks/review">
          <motion.div
            className="relative w-24 h-24 rounded-full cursor-pointer"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Rotating outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #A855F7, #EC4899, #FDE047, #A855F7)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />

            {/* Inner orb */}
            <div className="absolute inset-1 rounded-full bg-lf-dark flex items-center justify-center">
              <motion.span
                className="text-4xl"
                animate={{
                  rotate: -360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity },
                }}
              >
                🧠
              </motion.span>
            </div>

            {/* Pulse rings */}
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-purple-500/50"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i,
                }}
              />
            ))}
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}

// Individual Mission Orb
interface MissionOrbProps {
  mission: Mission;
  index: number;
  onStart: () => void;
}

function MissionOrb({ mission, index, onStart }: MissionOrbProps) {
  const isCompleted = mission.completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        type: 'spring',
        stiffness: 150,
      }}
      className="relative"
    >
      <motion.div
        className="w-20 h-20 rounded-full cursor-pointer relative"
        onClick={onStart}
        whileHover={{ scale: 1.15, y: -10 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Main orb */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: isCompleted
              ? 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)'
              : 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
          }}
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 3 + index * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full blur-md"
            style={{
              background: isCompleted
                ? 'radial-gradient(circle, rgba(34, 197, 94, 0.8), transparent)'
                : 'radial-gradient(circle, rgba(99, 102, 241, 0.8), transparent)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          />
        </motion.div>

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          {isCompleted ? '✓' : '⚔️'}
        </div>

        {/* XP reward badge */}
        {mission.reward?.xp && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-lf-accent text-lf-dark text-xs font-bold flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 1, repeat: Infinity, delay: index * 0.5 }}
          >
            {mission.reward.xp}
          </motion.div>
        )}

        {/* Completion ring */}
        {isCompleted && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-400"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Title tooltip */}
      <motion.div
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 rounded-lg bg-lf-dark/90 backdrop-blur-md border border-white/20 text-center whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        initial={{ y: 5 }}
        whileHover={{ y: 0, opacity: 1 }}
      >
        <p className="text-xs font-semibold text-white">{mission.title}</p>
        <p className="text-xs text-lf-muted">{mission.reward?.xp || 0} XP</p>
      </motion.div>
    </motion.div>
  );
}
