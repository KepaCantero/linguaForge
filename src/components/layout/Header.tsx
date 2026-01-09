'use client';

import { motion } from 'framer-motion';
import { useGamificationStore } from '@/store/useGamificationStore';
import { getLevelProgress } from '@/lib/constants';
import { RankBadgeWithTooltip } from '@/components/ui/RankBadge';
import { HPIndicator } from '@/components/ui/HPIndicator';
import { CognitiveLoadIndicator } from '@/components/ui/CognitiveLoadIndicator';
import { CountUpNumber } from '@/components/ui/CountUpNumber';

/**
 * Premium Header with AAA-quality visual design
 * Inspired by: God of War (2018), Horizon Zero Dawn, The Last of Us Part II
 *
 * Features:
 * - Glassmorphism with depth layers
 * - Premium glow effects
 * - Smooth micro-interactions
 * - Atmospheric backdrop
 */
export function Header() {
  const { xp, coins, gems, streak, rank, hp } = useGamificationStore();
  const progress = getLevelProgress(xp);

  return (
    <motion.header
      role="banner"
      aria-label="Barra de navegación principal"
      className="fixed top-0 left-0 right-0 h-header z-50 safe-top"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
    >
      {/* Glassmorphism backdrop with depth */}
      <div className="absolute inset-0">
        {/* Primary glass layer */}
        <div className="absolute inset-0 bg-glass-surface backdrop-blur-aaa" />

        {/* Gradient accent at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lf-primary/50 to-transparent" />

        {/* Premium glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-lf-primary/5 to-transparent"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Depth shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full w-full px-4 flex items-center justify-between lg:container lg:mx-auto">
        {/* Logo - Premium 3D effect */}
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <a
            href="/"
            aria-label="LinguaForge - Ir al inicio"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-lf-accent focus:ring-offset-2 focus:ring-offset-lf-dark rounded-lg"
          >
            {/* Logo container with premium glow */}
            <motion.div
              className="relative"
              whileHover={{ rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-lg bg-resonance-gradient blur-md"
                animate={{
                  opacity: [0.4, 0.6, 0.4],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Main logo */}
              <div
                className="relative w-10 h-10 rounded-lg bg-resonance-gradient flex items-center justify-center shadow-glass-xl"
                style={{ transform: 'translateZ(20px)' }}
              >
                <span className="text-base font-rajdhani font-bold text-white tracking-wide">
                  LF
                </span>

                {/* Inner shine effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/30 to-transparent" />
              </div>
            </motion.div>

            {/* Brand text with gradient */}
            <div className="flex flex-col">
              <h1 className="font-rajdhani font-bold text-lg lg:text-xl tracking-wide">
                <span className="bg-gradient-to-r from-lf-secondary via-lf-primary-light to-lf-secondary bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_100%]">
                  LinguaForge
                </span>
              </h1>
              <span className="text-[10px] text-lf-muted tracking-widest uppercase">
                AAA Learning
              </span>
            </div>
          </a>
        </motion.div>

        {/* Stats - Premium glass cards */}
        <nav aria-label="Estadísticas del usuario">
          <ul className="flex items-center gap-2 lg:gap-3 text-sm list-none">
            {/* Rank Badge */}
            <motion.li whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-lf-primary/20 blur-sm"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <RankBadgeWithTooltip rank={rank} size="sm" tooltip />
              </div>
            </motion.li>

            {/* Divider */}
            <li
              aria-hidden="true"
              className="w-px h-6 bg-gradient-to-b from-transparent via-lf-primary/30 to-transparent hidden sm:block"
            />

            {/* XP - Premium progress bar */}
            <li>
              <motion.div
                className="relative px-3 py-1.5 rounded-xl bg-glass-surface backdrop-blur-md border border-white/10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-lf-accent/10 to-lf-secondary/10" />

                <div
                  className="relative flex items-center gap-2"
                  role="status"
                  aria-label={`${xp} puntos de experiencia, ${progress}% para el siguiente nivel`}
                >
                  {/* XP Icon */}
                  <motion.div
                    className="w-5 h-5 rounded bg-lf-accent/20 flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <div className="w-2.5 h-2.5 bg-lf-accent rounded-sm animate-resonance-pulse" />
                  </motion.div>

                  {/* XP Value */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-lf-muted uppercase tracking-wide">
                        XP
                      </span>
                      <span className="font-rajdhani font-bold text-lf-accent text-sm">
                        <CountUpNumber value={xp} duration={0.8} />
                      </span>
                    </div>

                    {/* Premium progress bar */}
                    <div
                      className="w-14 h-2 bg-lf-dark/50 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Progreso de nivel"
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-lf-accent via-lf-secondary to-lf-accent rounded-full"
                        style={{ backgroundSize: '200% 100%' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%`, backgroundPosition: ['0% 50%', '100% 50%'] }}
                        transition={{
                          width: { duration: 0.5, ease: 'easeOut' },
                          backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </li>

            {/* Divider */}
            <li
              aria-hidden="true"
              className="w-px h-6 bg-gradient-to-b from-transparent via-lf-primary/30 to-transparent hidden sm:block"
            />

            {/* Coins */}
            <motion.li whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
              <div
                className="px-2.5 py-1.5 rounded-xl bg-glass-surface backdrop-blur-md border border-white/10 flex items-center gap-1.5"
                role="status"
                aria-label={`${coins} monedas`}
                title="Monedas"
              >
                <motion.span
                  className="text-lf-secondary"
                  aria-hidden="true"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ◈
                </motion.span>
                <span className="font-rajdhani font-medium text-white text-sm">
                  <CountUpNumber value={coins} duration={0.6} />
                </span>
              </div>
            </motion.li>

            {/* Gems */}
            <motion.li whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
              <div
                className="px-2.5 py-1.5 rounded-xl bg-glass-surface backdrop-blur-md border border-white/10 flex items-center gap-1.5"
                role="status"
                aria-label={`${gems} gemas`}
                title="Gemas"
              >
                <motion.span
                  className="text-lf-secondary"
                  aria-hidden="true"
                  animate={{ rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ⬡
                </motion.span>
                <span className="font-rajdhani font-medium text-white text-sm">
                  <CountUpNumber value={gems} duration={0.6} />
                </span>
              </div>
            </motion.li>

            {/* Streak */}
            <motion.li whileHover={{ y: -2, scale: 1.05 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
              <div
                className="px-2.5 py-1.5 rounded-xl bg-glass-surface backdrop-blur-md border border-white/10 flex items-center gap-1.5"
                role="status"
                aria-label={`Racha de ${streak} días`}
                title="Racha de días"
              >
                <motion.span
                  className={`text-sm ${
                    streak > 0
                      ? "text-lf-accent"
                      : "text-lf-muted"
                  }`}
                  aria-hidden="true"
                  animate={streak > 0 ? {
                    scale: [1, 1.2, 1],
                    filter: ['drop-shadow(0 0 0px rgba(253, 224, 71, 0))', 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.6))', 'drop-shadow(0 0 0px rgba(253, 224, 71, 0))'],
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🔥
                </motion.span>
                <span className="font-rajdhani font-medium text-white text-sm">
                  {streak}
                </span>
              </div>
            </motion.li>

            {/* HP - Large screens */}
            <motion.li
              className="hidden sm:block"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className="px-2.5 py-1.5 rounded-xl bg-glass-surface backdrop-blur-md border border-white/10">
                <HPIndicator hp={hp} showLabel={false} size="sm" />
              </div>
            </motion.li>

            {/* Cognitive Load - Large screens */}
            <motion.li
              className="hidden md:block"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className="px-2.5 py-1.5 rounded-xl bg-glass-surface backdrop-blur-md border border-white/10">
                <CognitiveLoadIndicator showLabel={false} size="sm" />
              </div>
            </motion.li>
          </ul>
        </nav>
      </div>

      {/* Animated bottom border */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lf-primary to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
        style={{ originX: 0.5 }}
      />
    </motion.header>
  );
}
