'use client';

import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import Link from 'next/link';
import { useGamificationStore } from '@/store/useGamificationStore';
import { getLevelProgress } from '@/lib/constants';
import { RankBadgeWithTooltip } from '@/components/ui/RankBadge';
import { HPIndicator } from '@/components/ui/HPIndicator';
import { CognitiveLoadIndicator } from '@/components/ui/CognitiveLoadIndicator';
import { CountUpNumber } from '@/components/ui/CountUpNumber';
import { StatTooltip } from '@/components/ui/Tooltip';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CALM_EASING } from '@/lib/animations';

/**
 * CALM Header - Serene, unobtrusive navigation
 */
export function Header() {
  const { xp, streak, rank, hp } = useGamificationStore();
  const progress = getLevelProgress(xp);

  return (
    <motion.header
      role="banner"
      aria-label="Barra de navegación principal"
      className="fixed top-0 left-0 right-0 h-header z-50 safe-top"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: CALM_EASING.mist }}
    >
      {/* Calm backdrop - adapts to theme */}
      <div className="absolute inset-0 bg-calm-bg-elevated/95 backdrop-blur-calm border-b border-calm-warm-100 shadow-calm-sm" />

      {/* Content */}
      <div className="relative h-full w-full px-4 flex items-center justify-between lg:container lg:mx-auto">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ opacity: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <a
            href="/"
            aria-label="LinguaForge - Ir al inicio"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:ring-offset-2 rounded-lg"
          >
            {/* Logo - accent color */}
            <div className="relative w-9 h-9 rounded-xl bg-accent-500 flex items-center justify-center shadow-calm-sm">
              <span className="text-sm font-quicksand font-semibold text-white tracking-wide">
                LF
              </span>
            </div>

            {/* Brand text */}
            <div className="flex flex-col">
              <h1 className="font-quicksand font-semibold text-lg text-calm-text-primary tracking-wide">
                LinguaForge
              </h1>
              <span className="text-[10px] text-calm-text-tertiary tracking-widest uppercase">
                Aprende a tu ritmo
              </span>
            </div>
          </a>
        </motion.div>

        {/* Stats - Calm cards */}
        <nav aria-label="Estadísticas del usuario">
          <ul className="flex items-center gap-2 lg:gap-3 text-sm list-none">
            {/* Rank Badge */}
            <li>
              <RankBadgeWithTooltip rank={rank} size="sm" tooltip />
            </li>

            {/* Divider */}
            <li
              aria-hidden="true"
              className="w-px h-5 bg-calm-warm-100 hidden sm:block"
            />

            {/* XP */}
            <li>
              <StatTooltip stat="xp">
                <output
                  className="relative px-3 py-1.5 rounded-xl bg-calm-bg-secondary border border-calm-warm-100"
                  aria-label={`${xp} puntos de experiencia, ${progress}% para el siguiente nivel`}
                >
                  <div className="flex items-center gap-2">
                    {/* XP Icon */}
                    <div className="w-5 h-5 rounded bg-accent-100 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-accent-500 rounded-sm" />
                    </div>

                    {/* XP Value */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-calm-text-tertiary uppercase tracking-wide">
                          XP
                        </span>
                        <span className="font-quicksand font-semibold text-accent-500 text-sm">
                          <CountUpNumber value={xp} duration={0.8} />
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div
                        className="w-14 h-1.5 bg-calm-bg-tertiary rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Progreso de nivel"
                      >
                        <motion.div
                          className="h-full bg-accent-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                </output>
              </StatTooltip>
            </li>

            {/* Streak */}
            <li>
              <StatTooltip stat="streak">
                <output
                  className="px-2.5 py-1.5 rounded-xl bg-calm-bg-secondary border border-calm-warm-100 flex items-center gap-1.5"
                  aria-label={`Racha de ${streak} días`}
                >
                  <span
                    className={`text-sm ${streak > 0 ? "" : "opacity-40"}`}
                    aria-hidden="true"
                  >
                    🔥
                  </span>
                  <span className="font-quicksand font-medium text-calm-text-primary text-sm">
                    {streak}
                  </span>
                </output>
              </StatTooltip>
            </li>

            {/* HP - Large screens */}
            <li className="hidden sm:block">
              <StatTooltip stat="hp">
                <div className="px-2.5 py-1.5 rounded-xl bg-calm-bg-secondary border border-calm-warm-100">
                  <HPIndicator hp={hp} showLabel={false} size="sm" />
                </div>
              </StatTooltip>
            </li>

            {/* Cognitive Load - Large screens */}
            <li className="hidden md:block">
              <StatTooltip stat="cognitiveLoad">
                <div className="px-2.5 py-1.5 rounded-xl bg-calm-bg-secondary border border-calm-warm-100">
                  <CognitiveLoadIndicator showLabel={false} size="sm" />
                </div>
              </StatTooltip>
            </li>

            {/* Divider */}
            <li
              aria-hidden="true"
              className="w-px h-5 bg-calm-warm-100 hidden sm:block"
            />

            {/* Theme Toggle - New! */}
            <li>
              <ThemeToggle />
            </li>

            {/* Profile Button */}
            <li>
              <Link
                href="/profile"
                className="px-2.5 py-1.5 rounded-xl bg-calm-bg-secondary border border-calm-warm-100 flex items-center gap-1.5 hover:bg-calm-bg-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:ring-offset-2"
                aria-label="Ir al perfil"
              >
                <User className="w-4 h-4 text-calm-text-secondary" aria-hidden="true" />
                <span className="hidden lg:inline font-quicksand font-medium text-calm-text-primary text-sm">
                  Perfil
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
}
