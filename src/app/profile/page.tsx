'use client';

import { motion } from 'framer-motion';
import { useProgressStore } from '@/store/useProgressStore';
import { useInputStore } from '@/store/useInputStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useUserStore } from '@/store/useUserStore';
import { getLevelByXP, SUPPORTED_LANGUAGES, SUPPORTED_LEVELS } from '@/lib/constants';
import { User, Settings, Info, AlertTriangle, Bell, Volume2 } from 'lucide-react';
import { ThemeToggleWithLabel } from '@/components/ui/ThemeToggle';

const LANGUAGE_INFO: Record<string, { flag: string; name: string; gradient: string }> = {
  fr: { flag: '🇫🇷', name: 'Francés', gradient: 'from-sky-500 to-accent-500' },
  de: { flag: '🇩🇪', name: 'Alemán', gradient: 'from-amber-400 to-amber-500' },
};

export default function ProfilePage() {
  const {
    activeLanguage,
    activeLevel,
    setActiveLanguage,
    setActiveLevel,
    resetProgress,
  } = useProgressStore();
  const { resetStats } = useInputStore();
  const { xp, level, rank, hp, coins, gems, streak, resetGamification } = useGamificationStore();
  const { mode, setMode } = useUserStore();

  const userLevel = getLevelByXP(xp);

  const handleModeChange = (newMode: 'guided' | 'autonomous') => {
    setMode(newMode);
  };

  const handleResetAll = () => {
    if (confirm('¿Estás seguro de que quieres resetear todo el progreso? Esta acción no se puede deshacer.')) {
      resetProgress();
      resetStats();
      resetGamification();
    }
  };

  return (
    <div className="space-y-6 py-4 px-4 pb-32">
      {/* Header Card - Premium AAA Design */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Gradient Border Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-500 via-sky-500 to-amber-500 p-[2px]">
          <div className="relative rounded-2xl bg-calm-bg-elevated p-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4 mb-6">
              {/* Animated Avatar */}
              <motion.div
                className="relative"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-500 via-sky-500 to-amber-500 flex items-center justify-center shadow-calm-md">
                  <User className="w-10 h-10 text-calm-text-primary" />
                </div>
                {/* Pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-amber-400"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-calm-text-primary mb-1">Mi Perfil</h1>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 text-sm font-bold">
                    {userLevel.title}
                  </span>
                  <span className="text-calm-text-muted text-sm">Nivel {level}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-3">
                <motion.div
                  className="text-center"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="text-2xl font-bold text-accent-500">{xp}</div>
                  <div className="text-xs text-calm-text-muted">XP</div>
                </motion.div>
                <motion.div
                  className="text-center"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="text-2xl font-bold text-sky-500">{streak}</div>
                  <div className="text-xs text-calm-text-muted">🔥</div>
                </motion.div>
              </div>
            </div>

            {/* Rank & Progress Display */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-calm-bg-secondary border border-calm-warm-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-sky-500 flex items-center justify-center text-calm-text-primary font-bold text-lg">
                  {rank}
                </div>
                <div>
                  <div className="text-sm text-calm-text-muted">Rango Actual</div>
                  <div className="font-bold text-calm-text-primary">{userLevel.title}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-calm-text-muted">Próximo nivel</div>
                <div className="font-bold text-calm-text-primary">{userLevel.xpRequired - xp} XP</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Language Selector - Premium Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-bold text-calm-text-primary mb-3 flex items-center gap-2">
          <span className="text-xl">🌍</span>
          Idioma de Estudio
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(SUPPORTED_LANGUAGES as readonly string[]).map((lang) => {
            const info = LANGUAGE_INFO[lang];
            const isActive = lang === activeLanguage;

            return (
              <motion.button
                key={lang}
                onClick={() => setActiveLanguage(lang as 'fr' | 'de')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative overflow-hidden rounded-xl p-4 border-2 transition-all
                  ${isActive
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                    : 'border-calm-warm-100 bg-calm-bg-secondary hover:border-calm-warm-200'
                  }
                `}
              >
                {/* Active glow */}
                {isActive && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-10`}
                    animate={{
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}

                <div className="relative flex items-center gap-3">
                  <motion.span
                    className="text-4xl"
                    animate={isActive ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {info?.flag}
                  </motion.span>
                  <div className="text-left">
                    <p className={`font-bold ${isActive ? 'text-calm-text-primary' : 'text-calm-text-secondary'}`}>
                      {info?.name}
                    </p>
                    <p className={`text-xs font-bold ${isActive ? 'text-accent-500' : 'text-calm-text-muted'}`}>
                      {lang.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Checkmark for active */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent-500 flex items-center justify-center"
                  >
                    <span className="text-calm-text-primary text-xs">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Level Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="text-lg font-bold text-calm-text-primary mb-3 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Nivel CEFR
        </h3>
        <div className="p-4 rounded-xl bg-calm-bg-secondary border border-calm-warm-100">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {(SUPPORTED_LEVELS as readonly string[]).map((lvl) => {
              const isActive = lvl === activeLevel;
              const isDisabled = !['A1', 'A2'].includes(lvl);

              return (
                <motion.button
                  key={lvl}
                  onClick={() => !isDisabled && setActiveLevel(lvl as 'A1' | 'A2')}
                  disabled={isDisabled}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  className={`
                    relative overflow-hidden py-3 rounded-xl font-bold transition-all
                    ${isActive
                      ? 'bg-gradient-to-r from-accent-500 to-sky-500 text-calm-text-primary shadow-calm-md'
                      : isDisabled
                        ? 'bg-calm-bg-tertiary text-calm-text-muted cursor-not-allowed'
                        : 'bg-calm-bg-tertiary text-calm-text-secondary hover:bg-calm-warm-100'
                    }
                  `}
                >
                  {lvl}
                  {isDisabled && <span className="ml-1 text-xs">🔒</span>}
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
          <p className="text-xs text-calm-text-muted text-center">
            ✨ Disponibles: A1 (Principiante) y A2 (Básico)
          </p>
        </div>
      </motion.div>

      {/* Learning Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.17 }}
      >
        <h3 className="text-lg font-bold text-calm-text-primary mb-3 flex items-center gap-2">
          <span className="text-xl">🎯</span>
          Modo de Aprendizaje
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Guided Mode */}
          <motion.button
            onClick={() => handleModeChange('guided')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative overflow-hidden rounded-xl p-4 border-2 text-left transition-all
              ${mode === 'guided'
                ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                : 'border-calm-warm-100 bg-calm-bg-secondary hover:border-calm-warm-200'
              }
            `}
          >
            {mode === 'guided' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-accent-500/20 to-sky-500/20"
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${mode === 'guided' ? 'bg-accent-100 dark:bg-accent-900/30' : 'bg-calm-bg-tertiary'}`}>
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <p className={`font-bold ${mode === 'guided' ? 'text-calm-text-primary' : 'text-calm-text-secondary'}`}>
                    Modo Guiado
                  </p>
                  {mode === 'guided' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs text-accent-500 font-medium"
                    >
                      ✓ Activo
                    </motion.span>
                  )}
                </div>
              </div>
              <p className={`text-sm ${mode === 'guided' ? 'text-calm-text-tertiary' : 'text-calm-text-muted'}`}>
                Lecciones estructuradas paso a paso. Ideal para principiantes.
              </p>
            </div>
          </motion.button>

          {/* Autonomous Mode */}
          <motion.button
            onClick={() => handleModeChange('autonomous')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative overflow-hidden rounded-xl p-4 border-2 text-left transition-all
              ${mode === 'autonomous'
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                : 'border-calm-warm-100 bg-calm-bg-secondary hover:border-calm-warm-200'
              }
            `}
          >
            {mode === 'autonomous' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-amber-500/20"
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${mode === 'autonomous' ? 'bg-sky-100 dark:bg-sky-900/30' : 'bg-calm-bg-tertiary'}`}>
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <p className={`font-bold ${mode === 'autonomous' ? 'text-calm-text-primary' : 'text-calm-text-secondary'}`}>
                    Modo Autónomo
                  </p>
                  {mode === 'autonomous' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs text-sky-500 font-medium"
                    >
                      ✓ Activo
                    </motion.span>
                  )}
                </div>
              </div>
              <p className={`text-sm ${mode === 'autonomous' ? 'text-calm-text-tertiary' : 'text-calm-text-muted'}`}>
                Aprende desde contenido real que importes. Para usuarios con base.
              </p>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Stats Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-bold text-calm-text-primary mb-3 flex items-center gap-2">
          <span className="text-xl">💎</span>
          Recursos
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {/* HP */}
          <div className="relative overflow-hidden rounded-xl p-3 bg-calm-bg-secondary border border-calm-warm-100 text-center">
            <div className="text-2xl mb-1">❤️</div>
            <div className="text-xl font-bold text-semantic-error">{hp}/100</div>
            <div className="text-xs text-calm-text-muted">HP</div>
          </div>

          {/* Coins */}
          <div className="relative overflow-hidden rounded-xl p-3 bg-calm-bg-secondary border border-calm-warm-100 text-center">
            <div className="text-2xl mb-1">◈</div>
            <div className="text-xl font-bold text-sky-500">{coins}</div>
            <div className="text-xs text-calm-text-muted">Monedas</div>
          </div>

          {/* Gems */}
          <div className="relative overflow-hidden rounded-xl p-3 bg-calm-bg-secondary border border-calm-warm-100 text-center">
            <div className="text-2xl mb-1">⬡</div>
            <div className="text-xl font-bold text-accent-500">{gems}</div>
            <div className="text-xs text-calm-text-muted">Gemas</div>
          </div>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
      >
        <h3 className="text-lg font-bold text-calm-text-primary mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuración
        </h3>
        <div className="p-4 rounded-xl bg-calm-bg-secondary border border-calm-warm-100 space-y-3">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-calm-bg-tertiary">
                <Bell className="w-5 h-5 text-calm-text-muted" />
              </div>
              <span className="text-calm-text-primary">Notificaciones</span>
            </div>
            <span className="text-xs text-calm-text-muted">Próximamente</span>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-calm-bg-tertiary">
                <Volume2 className="w-5 h-5 text-calm-text-muted" />
              </div>
              <span className="text-calm-text-primary">Sonidos</span>
            </div>
            <span className="text-xs text-calm-text-muted">Activados</span>
          </div>
        </div>

        {/* Theme Toggle - Functional! */}
        <div className="mt-3">
          <ThemeToggleWithLabel />
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h3 className="text-lg font-bold text-calm-text-primary mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Acerca de
        </h3>
        <div className="p-4 rounded-xl bg-calm-bg-secondary border border-calm-warm-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-calm-text-muted">Versión</span>
            <span className="text-calm-text-primary font-medium">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-calm-text-muted">Metodología</span>
            <span className="text-calm-text-primary font-medium">Krashen + Janulus</span>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-bold text-calm-text-primary mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-semantic-error" />
          Zona de Peligro
        </h3>
        <div className="relative overflow-hidden rounded-xl p-[2px]">
          <div className="relative rounded-xl bg-semantic-error-bg border border-semantic-error p-4">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-semantic-error/10 to-amber-500/10"
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative">
              <p className="text-sm text-semantic-error-text mb-3">
                Esta acción eliminará permanentemente todo tu progreso.
              </p>
              <button
                onClick={handleResetAll}
                className="w-full py-3 rounded-xl font-bold text-calm-text-primary bg-gradient-to-r from-semantic-error to-amber-500 hover:from-semantic-error hover:to-amber-600 transition-all shadow-calm-md"
              >
                Resetear Todo el Progreso
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
