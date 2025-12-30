'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '@/store/useProgressStore';
import { useInputStore } from '@/store/useInputStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { calculateLevelProgress, getStatsSummary } from '@/services/inputTracker';
import { getLevelByXP, getLevelProgress, getXPToNextLevel, LEVEL_THRESHOLDS, USER_LEVELS } from '@/lib/constants';
import { SPRING, DELAY, DURATION, staggerDelay } from '@/lib/motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING.smooth,
  },
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      ...SPRING.bouncy,
      delay: staggerDelay(i, DELAY.short),
    },
  }),
};

export default function DashboardPage() {
  const { activeLanguage, activeLevel, worldProgress } = useProgressStore();
  const { getStats } = useInputStore();
  const { xp, coins, gems, streak, longestStreak } = useGamificationStore();

  const stats = getStats(activeLanguage, activeLevel);
  const krashenProgress = calculateLevelProgress(stats, activeLevel);
  const statsSummary = getStatsSummary(stats);
  const userLevel = getLevelByXP(xp);
  const xpProgress = getLevelProgress(xp);
  const xpToNext = getXPToNextLevel(xp);
  const thresholds = LEVEL_THRESHOLDS[activeLevel];

  const totalMatricesCompleted = Object.values(worldProgress).reduce(
    (acc, w) => acc + (w.completedMatrices?.length || 0),
    0
  );

  const quickStats = [
    { icon: '💰', value: coins, label: 'Monedas', color: 'text-amber-400', bg: 'from-amber-500/20 to-orange-500/10' },
    { icon: '💎', value: gems, label: 'Gemas', color: 'text-lf-secondary', bg: 'from-lf-secondary/20 to-fuchsia-500/10' },
    { icon: '🔥', value: streak, label: 'Racha', color: 'text-orange-500', bg: 'from-orange-500/20 to-red-500/10', pulse: streak > 0 },
  ];

  const progressBars = [
    {
      icon: '📖',
      label: 'Palabras leídas',
      current: stats.wordsRead,
      total: thresholds.read,
      progress: krashenProgress.readProgress,
      gradient: 'from-blue-400 to-cyan-500',
      glow: 'shadow-blue-500/30',
    },
    {
      icon: '🎧',
      label: 'Palabras escuchadas',
      current: stats.wordsHeard,
      total: thresholds.heard,
      progress: krashenProgress.heardProgress,
      gradient: 'from-lf-primary to-lf-secondary',
      glow: 'shadow-lf-primary/30',
    },
    {
      icon: '🗣️',
      label: 'Palabras producidas',
      current: stats.wordsSpoken,
      total: thresholds.spoken,
      progress: krashenProgress.spokenProgress,
      gradient: 'from-emerald-400 to-teal-500',
      glow: 'shadow-emerald-500/30',
    },
  ];

  const learningStats = [
    { value: statsSummary.totalWords.toLocaleString(), label: 'Palabras totales', icon: '📚' },
    { value: statsSummary.totalMinutes.toString(), label: 'Minutos práctica', icon: '⏱️' },
    { value: totalMatricesCompleted.toString(), label: 'Matrices completadas', icon: '🎯' },
    { value: longestStreak.toString(), label: 'Mejor racha', icon: '🏆' },
  ];

  return (
    <motion.div
      className="space-y-6 py-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="font-rajdhani text-3xl font-bold text-white">
          Dashboard
        </h1>
        <p className="font-atkinson text-sm text-gray-400 mt-1">
          Tu progreso en <span className="text-lf-secondary font-semibold">{activeLanguage.toUpperCase()} {activeLevel}</span>
        </p>
      </motion.div>

      {/* User Level Card */}
      <motion.div
        className="relative bg-gradient-to-br from-lf-primary via-purple-600 to-lf-secondary rounded-2xl p-6 text-white overflow-hidden"
        variants={itemVariants}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('/patterns/crystal-cracks.svg')",
            backgroundSize: '100px 100px',
          }}
        />

        {/* Animated glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative flex items-center gap-4">
          {/* Level badge */}
          <motion.div
            className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={SPRING.snappy}
          >
            <motion.span
              className="font-rajdhani text-4xl font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...SPRING.bouncy, delay: 0.3 }}
            >
              {userLevel.level}
            </motion.span>
          </motion.div>

          <div className="flex-1">
            <p className="font-atkinson text-white/70 text-sm">Nivel actual</p>
            <h2 className="font-rajdhani text-2xl font-bold">{userLevel.title}</h2>

            {/* XP Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-white/70 mb-1.5 font-rajdhani">
                <span className="flex items-center gap-1">
                  <span className="text-lf-accent">⭐</span>
                  {xp.toLocaleString()} XP
                </span>
                <span>{xpToNext > 0 ? `${xpToNext.toLocaleString()} para subir` : 'Nivel máximo'}</span>
              </div>
              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-lf-accent via-amber-400 to-orange-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: DURATION.slow, delay: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24">
          <div className="absolute top-0 right-0 w-32 h-8 bg-lf-accent/30 transform rotate-45 translate-x-10 -translate-y-4" />
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {quickStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`bg-lf-soft rounded-xl p-4 text-center border border-lf-muted/30 relative overflow-hidden`}
            variants={statVariants}
            custom={i}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-50`} />

            <motion.span
              className={`text-2xl block mb-1 relative ${stat.pulse ? '' : ''}`}
              animate={stat.pulse ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {stat.icon}
            </motion.span>
            <motion.p
              className={`font-rajdhani text-xl font-bold ${stat.color} relative`}
              key={stat.value}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={SPRING.bouncy}
            >
              {stat.value}
            </motion.p>
            <p className="font-atkinson text-xs text-gray-500 relative">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Krashen Progress */}
      <motion.div
        className="bg-lf-soft rounded-xl p-6 border border-lf-muted/30"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-rajdhani font-bold text-white">
            Progreso hacia {activeLevel} completo
          </h3>
          <motion.div
            className="px-3 py-1 bg-lf-primary/20 rounded-full border border-lf-primary/30"
            animate={{ boxShadow: ['0 0 0 0 rgba(126,34,206,0)', '0 0 0 8px rgba(126,34,206,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="font-rajdhani text-sm font-bold text-lf-secondary">
              {krashenProgress.overallProgress}%
            </span>
          </motion.div>
        </div>

        <div className="space-y-5">
          {progressBars.map((bar, i) => (
            <motion.div
              key={bar.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{bar.icon}</span>
                  <span className="font-atkinson text-sm text-gray-400">{bar.label}</span>
                </div>
                <span className="font-rajdhani text-sm font-medium text-white">
                  {bar.current.toLocaleString()} <span className="text-gray-500">/ {bar.total.toLocaleString()}</span>
                </span>
              </div>
              <div className="w-full h-3 bg-lf-dark rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${bar.gradient} rounded-full shadow-lg ${bar.glow}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(bar.progress, 100)}%` }}
                  transition={{ duration: DURATION.slow, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}

          {/* Overall progress bar */}
          <motion.div
            className="pt-4 border-t border-lf-muted/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-rajdhani font-bold text-white">Progreso general</span>
              <div className="flex items-center gap-2">
                <motion.span
                  className="font-rajdhani text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lf-primary to-lf-secondary"
                  key={krashenProgress.overallProgress}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={SPRING.bouncy}
                >
                  {krashenProgress.overallProgress}%
                </motion.span>
              </div>
            </div>
            <div className="w-full h-4 bg-lf-dark rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-lf-primary via-lf-secondary to-fuchsia-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${krashenProgress.overallProgress}%` }}
                transition={{ duration: DURATION.deliberate, delay: 0.8, ease: 'easeOut' }}
              />
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 1 }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Learning Stats Grid */}
      <motion.div
        className="bg-lf-soft rounded-xl p-6 border border-lf-muted/30"
        variants={itemVariants}
      >
        <h3 className="font-rajdhani font-bold text-white mb-4">
          Estadísticas de aprendizaje
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {learningStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-lf-dark/50 rounded-xl p-4 border border-lf-muted/20 group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(126,34,206,0.5)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <motion.p
                    className="font-rajdhani text-2xl font-bold text-white"
                    key={stat.value}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="font-atkinson text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
                <motion.span
                  className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  {stat.icon}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* User Levels */}
      <motion.div
        className="bg-lf-soft rounded-xl p-6 border border-lf-muted/30"
        variants={itemVariants}
      >
        <h3 className="font-rajdhani font-bold text-white mb-4">
          Niveles de usuario
        </h3>

        <div className="space-y-2">
          {USER_LEVELS.map((lvl, i) => {
            const isCurrentLevel = lvl.level === userLevel.level;
            const isUnlocked = xp >= lvl.xpRequired;

            return (
              <motion.div
                key={lvl.level}
                className={`
                  relative flex items-center gap-3 p-3 rounded-xl transition-all
                  ${isCurrentLevel
                    ? 'bg-gradient-to-r from-lf-primary/20 to-lf-secondary/20 border border-lf-primary/50'
                    : isUnlocked
                      ? 'bg-lf-dark/50 border border-lf-muted/20 hover:border-lf-primary/30'
                      : 'bg-lf-dark/30 border border-transparent opacity-50'
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isUnlocked ? 1 : 0.5, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                whileHover={isUnlocked ? { x: 4 } : {}}
              >
                {/* Level badge */}
                <motion.div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-rajdhani font-bold text-sm
                    ${isCurrentLevel
                      ? 'bg-gradient-to-br from-lf-primary to-lf-secondary text-white shadow-lg shadow-lf-primary/30'
                      : isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-lf-muted/30 text-gray-500'
                    }
                  `}
                  animate={isCurrentLevel ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isUnlocked ? lvl.level : '🔒'}
                </motion.div>

                {/* Level info */}
                <div className="flex-1">
                  <p className={`font-rajdhani font-bold ${isCurrentLevel ? 'text-lf-secondary' : 'text-white'}`}>
                    {lvl.title}
                  </p>
                  <p className="font-atkinson text-xs text-gray-500">
                    {lvl.xpRequired.toLocaleString()} XP
                  </p>
                </div>

                {/* Current level badge */}
                <AnimatePresence>
                  {isCurrentLevel && (
                    <motion.span
                      className="px-2.5 py-1 bg-lf-primary text-white text-xs font-rajdhani font-bold rounded-full shadow-lg shadow-lf-primary/30"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={SPRING.bouncy}
                    >
                      Actual
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Glow effect for current level */}
                {isCurrentLevel && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(126,34,206,0)',
                        '0 0 20px 0 rgba(126,34,206,0.3)',
                        '0 0 0 0 rgba(126,34,206,0)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
