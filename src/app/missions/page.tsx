'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useMissionStore, type Mission } from '@/store/useMissionStore';
import { Crown, Flame, Zap, Hexagon, Sword, Brain } from 'lucide-react';

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

  // Mission type configuration
  const missionConfig: Record<string, { icon: React.ReactNode; color: string; gradient: string; label: string }> = {
    input: { icon: <Zap className="w-6 h-6" />, color: 'text-yellow-400', gradient: 'from-yellow-500 to-orange-500', label: 'Input' },
    exercises: { icon: <Sword className="w-6 h-6" />, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500', label: 'Ejercicios' },
    janus: { icon: <Hexagon className="w-6 h-6" />, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500', label: 'Janus' },
    streak: { icon: <Flame className="w-6 h-6" />, color: 'text-orange-400', gradient: 'from-orange-500 to-red-500', label: 'Racha' },
    forgeMandate: { icon: <Crown className="w-6 h-6" />, color: 'text-amber-400', gradient: 'from-amber-500 to-yellow-500', label: 'Desafío' },
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Header Section - Premium AAA Design */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Misiones Diarias</h1>
        <p className="text-sm text-lf-muted">Completa tus misiones para ganar recompensas</p>
      </motion.div>

      {/* Progress Card - Duolingo Style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-lf-primary via-lf-secondary to-lf-accent p-[2px]">
          <div className="relative rounded-2xl bg-lf-dark p-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Progreso de Hoy</h2>
                <p className="text-sm text-lf-muted">{completedCount} de {totalCount} misiones completadas</p>
              </div>
              <motion.div
                className="text-5xl"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {progress === 100 ? '🏆' : '⚔️'}
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-lf-dark/50 rounded-full overflow-hidden border border-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-lf-primary via-lf-secondary to-lf-accent rounded-full"
                style={{ backgroundSize: '200% 100%' }}
                initial={{ width: 0 }}
                animate={{
                  width: `${progress}%`,
                  backgroundPosition: ['0% 50%', '100% 50%'],
                }}
                transition={{
                  width: { duration: 1, ease: 'easeOut' },
                  backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                }}
              />
            </div>

            {/* Percentage Badge */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
              {progress === 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 font-semibold"
                >
                  ¡Completado!
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mission Cards - Duolingo Style List */}
      <div className="mx-4 space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">Tus Misiones</h3>
        {dailyMissions.map((mission, index) => {
          const config = missionConfig[mission.type] || missionConfig.exercises;
          const progress = mission.target > 0 ? (mission.current / mission.target) * 100 : 0;

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <motion.div
                className={`
                  relative overflow-hidden rounded-2xl border-2 p-5 cursor-pointer
                  transition-all duration-300
                  ${mission.completed
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-glass-surface backdrop-blur-aaa border-white/20 hover:border-white/30'
                  }
                `}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !mission.completed && handleMissionStart(mission)}
              >
                {/* Background Gradient for non-completed */}
                {!mission.completed && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0`}
                    whileHover={{ opacity: 0.1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Content */}
                <div className="relative flex items-start gap-4">
                  {/* Icon Container */}
                  <motion.div
                    className={`
                      flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center
                      ${mission.completed
                        ? 'bg-green-500/20'
                        : `bg-gradient-to-br ${config.gradient}`
                      }
                    `}
                    whileHover={{ rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className={mission.completed ? 'text-green-400' : 'text-white'}>
                      {mission.completed ? <Sword className="w-7 h-7" /> : config.icon}
                    </div>
                  </motion.div>

                  {/* Mission Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className={`text-lg font-bold mb-1 ${mission.completed ? 'text-green-400' : 'text-white'}`}>
                          {mission.title}
                        </h4>
                        <p className="text-sm text-lf-muted line-clamp-2">
                          {mission.description}
                        </p>
                      </div>

                      {/* Reward Badge */}
                      <div className="ml-3 flex-shrink-0">
                        <motion.div
                          className="px-3 py-1.5 rounded-lg bg-lf-accent/20 border border-lf-accent/30"
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <span className="text-sm font-bold text-lf-accent">+{mission.reward?.xp || 0} XP</span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Progress Section */}
                    {!mission.completed && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-white font-medium">{mission.current} / {mission.target}</span>
                          <span className="text-lf-muted">{Math.round(progress)}%</span>
                        </div>
                        <div className="relative h-2 bg-lf-dark/50 rounded-full overflow-hidden">
                          <motion.div
                            className={`absolute inset-y-0 left-0 h-full bg-gradient-to-r ${config.gradient} rounded-full`}
                            style={{ backgroundSize: '200% 100%' }}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${progress}%`,
                              backgroundPosition: ['0% 50%', '100% 50%'],
                            }}
                            transition={{
                              width: { duration: 0.5 },
                              backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Completed Badge */}
                    {mission.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30"
                      >
                        <span className="text-green-400 text-lg">✓</span>
                        <span className="text-green-300 font-semibold">Completado</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Start Button (for non-completed) */}
                {!mission.completed && (
                  <motion.div
                    className="absolute right-5 bottom-5"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold">→</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Memory Bank Quick Access - Card Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-4 mt-8"
      >
        <Link href="/decks/review" className="block">
          <motion.div
            className="relative overflow-hidden rounded-2xl border-2 p-5 bg-glass-surface backdrop-blur-aaa border-purple-500/30 cursor-pointer"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Content */}
            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>

              {/* Info */}
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white">Memory Bank</h4>
                <p className="text-sm text-lf-muted">Repasa tus tarjetas de spaced repetition</p>
              </div>

              {/* Arrow */}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-2xl text-purple-400">→</span>
              </motion.div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}
