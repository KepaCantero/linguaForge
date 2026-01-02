'use client';

import { motion } from 'framer-motion';
import { useGamificationStore } from '@/store/useGamificationStore';
import { getLevelProgress } from '@/lib/constants';
import { RankBadgeWithTooltip } from '@/components/ui/RankBadge';
import { HPIndicator } from '@/components/ui/HPIndicator';
import { CountUpNumber } from '@/components/ui/CountUpNumber';

export function Header() {
  const { xp, coins, streak, rank, hp } = useGamificationStore();
  const progress = getLevelProgress(xp);

  return (
    <header
      role="banner"
      aria-label="Barra de navegación principal"
      className="fixed top-0 left-0 right-0 h-header bg-lf-soft border-b border-lf-primary/20 z-50 safe-top"
    >
      <div className="h-full w-full px-4 flex items-center justify-between lg:container lg:mx-auto">
        {/* Logo - usar heading semántico */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            aria-label="LinguaForge - Ir al inicio"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-lf-accent focus:ring-offset-2 focus:ring-offset-lf-dark rounded-lg"
          >
            <div
              className="w-8 h-8 rounded bg-resonance-gradient flex items-center justify-center shadow-resonance"
              aria-hidden="true"
            >
              <span className="text-sm font-rajdhani font-bold text-white">
                LF
              </span>
            </div>
            <h1 className="font-rajdhani font-bold text-lf-secondary tracking-wide text-base lg:text-lg">
              LinguaForge
            </h1>
          </a>
        </div>

        {/* Stats - usar lista semántica */}
        <nav aria-label="Estadísticas del usuario">
          <ul className="flex items-center gap-3 lg:gap-4 text-sm list-none">
            <li>
              <RankBadgeWithTooltip rank={rank} size="sm" tooltip />
            </li>

            <li
              aria-hidden="true"
              className="w-px h-6 bg-lf-primary/30 hidden sm:block"
            />

            {/* XP con label accesible */}
            <li>
              <div
                className="flex items-center gap-1.5"
                role="status"
                aria-label={`${xp} puntos de experiencia, ${progress}% para el siguiente nivel`}
              >
                <div
                  className="w-4 h-4 bg-lf-accent/20 rounded-sm flex items-center justify-center"
                  aria-hidden="true"
                >
                  <div className="w-2 h-2 bg-lf-accent rounded-sm animate-resonance-pulse" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-lf-muted uppercase tracking-wide">
                      XP
                    </span>
                    <span className="font-rajdhani font-bold text-lf-accent text-xs">
                      <CountUpNumber value={xp} duration={0.8} />
                    </span>
                  </div>
                  <div
                    className="w-12 h-1.5 bg-lf-muted/30 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progreso de nivel"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-lf-accent to-lf-secondary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </li>

            <li
              aria-hidden="true"
              className="w-px h-6 bg-lf-primary/30 hidden sm:block"
            />

            {/* Coins */}
            <li>
              <div
                className="flex items-center gap-1"
                role="status"
                aria-label={`${coins} monedas`}
                title="Monedas"
              >
                <span className="text-lf-secondary text-sm" aria-hidden="true">
                  ◈
                </span>
                <span className="font-rajdhani font-medium text-white">
                  <CountUpNumber value={coins} duration={0.6} />
                </span>
              </div>
            </li>

            {/* Streak */}
            <li>
              <div
                className="flex items-center gap-1"
                role="status"
                aria-label={`Racha de ${streak} días`}
                title="Racha de días"
              >
                <span
                  className={`text-sm ${
                    streak > 0
                      ? "animate-resonance-pulse text-lf-accent"
                      : "text-lf-muted"
                  }`}
                  aria-hidden="true"
                >
                  ⬡
                </span>
                <span className="font-rajdhani font-medium text-white">
                  {streak}
                </span>
              </div>
            </li>

            {/* HP - solo en pantallas grandes */}
            <li className="hidden sm:block">
              <HPIndicator hp={hp} showLabel={false} size="sm" />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
