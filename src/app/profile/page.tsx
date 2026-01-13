'use client';

import { motion } from 'framer-motion';
import { useProgressStore } from '@/store/useProgressStore';
import { useInputStore } from '@/store/useInputStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useUserStore } from '@/store/useUserStore';
import { getLevelByXP, SUPPORTED_LANGUAGES, SUPPORTED_LEVELS } from '@/lib/constants';
import { User, Settings, Info, AlertTriangle, Bell, Volume2, Moon } from 'lucide-react';

const LANGUAGE_INFO: Record<string, { flag: string; name: string; gradient: string }> = {
  fr: { flag: '🇫🇷', name: 'Francés', gradient: 'from-blue-500 to-indigo-500' },
  de: { flag: '🇩🇪', name: 'Alemán', gradient: 'from-yellow-500 to-red-500' },
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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-lf-primary via-lf-secondary to-lf-accent p-[2px]">
          <div className="relative rounded-2xl bg-lf-dark p-6">
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
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lf-primary via-lf-secondary to-lf-accent flex items-center justify-center shadow-glow-accent">
                  <User className="w-10 h-10 text-white" />
                </div>
                {/* Pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-lf-accent"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">Mi Perfil</h1>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-lf-accent/20 border border-lf-accent/30 text-lf-accent text-sm font-bold">
                    {userLevel.title}
                  </span>
                  <span className="text-lf-muted text-sm">Nivel {level}</span>
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
                  <div className="text-2xl font-bold text-lf-accent">{xp}</div>
                  <div className="text-xs text-lf-muted">XP</div>
                </motion.div>
                <motion.div
                  className="text-center"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="text-2xl font-bold text-lf-secondary">{streak}</div>
                  <div className="text-xs text-lf-muted">🔥</div>
                </motion.div>
              </div>
            </div>

            {/* Rank & Progress Display */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-glass-surface backdrop-blur-aaa border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lf-primary to-lf-secondary flex items-center justify-center text-white font-bold text-lg">
                  {rank}
                </div>
                <div>
                  <div className="text-sm text-lf-muted">Rango Actual</div>
                  <div className="font-bold text-white">{userLevel.title}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-lf-muted">Próximo nivel</div>
                <div className="font-bold text-white">{userLevel.xpRequired - xp} XP</div>
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
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
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
                    ? 'border-lf-primary bg-lf-primary/10'
                    : 'border-white/10 bg-glass-surface backdrop-blur-aaa hover:border-white/20'
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
                    <p className={`font-bold ${isActive ? 'text-white' : 'text-white/80'}`}>
                      {info?.name}
                    </p>
                    <p className={`text-xs font-bold ${isActive ? 'text-lf-accent' : 'text-lf-muted'}`}>
                      {lang.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Checkmark for active */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-lf-accent flex items-center justify-center"
                  >
                    <span className="text-lf-dark text-xs">✓</span>
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
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Nivel CEFR
        </h3>
        <div className="p-4 rounded-xl bg-glass-surface backdrop-blur-aaa border border-white/10">
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
                      ? 'bg-gradient-to-r from-lf-primary to-lf-secondary text-white shadow-glow-accent'
                      : isDisabled
                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                        : 'bg-white/10 text-white/70 hover:bg-white/15'
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
          <p className="text-xs text-lf-muted text-center">
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
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
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
                ? 'border-lf-primary bg-lf-primary/10'
                : 'border-white/10 bg-glass-surface backdrop-blur-aaa hover:border-white/20'
              }
            `}
          >
            {mode === 'guided' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-lf-primary/20 to-lf-secondary/20"
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${mode === 'guided' ? 'bg-lf-primary/20' : 'bg-white/10'}`}>
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <p className={`font-bold ${mode === 'guided' ? 'text-white' : 'text-white/80'}`}>
                    Modo Guiado
                  </p>
                  {mode === 'guided' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs text-lf-accent font-medium"
                    >
                      ✓ Activo
                    </motion.span>
                  )}
                </div>
              </div>
              <p className={`text-sm ${mode === 'guided' ? 'text-white/70' : 'text-white/50'}`}>
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
                ? 'border-lf-secondary bg-lf-secondary/10'
                : 'border-white/10 bg-glass-surface backdrop-blur-aaa hover:border-white/20'
              }
            `}
          >
            {mode === 'autonomous' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-lf-secondary/20 to-lf-accent/20"
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${mode === 'autonomous' ? 'bg-lf-secondary/20' : 'bg-white/10'}`}>
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <p className={`font-bold ${mode === 'autonomous' ? 'text-white' : 'text-white/80'}`}>
                    Modo Autónomo
                  </p>
                  {mode === 'autonomous' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs text-lf-accent font-medium"
                    >
                      ✓ Activo
                    </motion.span>
                  )}
                </div>
              </div>
              <p className={`text-sm ${mode === 'autonomous' ? 'text-white/70' : 'text-white/50'}`}>
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
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span className="text-xl">💎</span>
          Recursos
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {/* HP */}
          <div className="relative overflow-hidden rounded-xl p-3 bg-glass-surface backdrop-blur-aaa border border-white/10 text-center">
            <div className="text-2xl mb-1">❤️</div>
            <div className="text-xl font-bold text-red-400">{hp}/100</div>
            <div className="text-xs text-lf-muted">HP</div>
          </div>

          {/* Coins */}
          <div className="relative overflow-hidden rounded-xl p-3 bg-glass-surface backdrop-blur-aaa border border-white/10 text-center">
            <div className="text-2xl mb-1">◈</div>
            <div className="text-xl font-bold text-lf-secondary">{coins}</div>
            <div className="text-xs text-lf-muted">Monedas</div>
          </div>

          {/* Gems */}
          <div className="relative overflow-hidden rounded-xl p-3 bg-glass-surface backdrop-blur-aaa border border-white/10 text-center">
            <div className="text-2xl mb-1">⬡</div>
            <div className="text-xl font-bold text-lf-primary">{gems}</div>
            <div className="text-xs text-lf-muted">Gemas</div>
          </div>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
      >
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuración
        </h3>
        <div className="p-4 rounded-xl bg-glass-surface backdrop-blur-aaa border border-white/10 space-y-3">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10">
                <Bell className="w-5 h-5 text-lf-muted" />
              </div>
              <span className="text-white">Notificaciones</span>
            </div>
            <span className="text-xs text-lf-muted">Próximamente</span>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10">
                <Volume2 className="w-5 h-5 text-lf-muted" />
              </div>
              <span className="text-white">Sonidos</span>
            </div>
            <span className="text-xs text-lf-muted">Activados</span>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10">
                <Moon className="w-5 h-5 text-lf-muted" />
              </div>
              <span className="text-white">Tema oscuro</span>
            </div>
            <span className="text-xs text-lf-muted">Sistema</span>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Acerca de
        </h3>
        <div className="p-4 rounded-xl bg-glass-surface backdrop-blur-aaa border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lf-muted">Versión</span>
            <span className="text-white font-medium">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lf-muted">Metodología</span>
            <span className="text-white font-medium">Krashen + Janulus</span>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Zona de Peligro
        </h3>
        <div className="relative overflow-hidden rounded-xl p-[2px]">
          <div className="relative rounded-xl bg-red-500/10 border border-red-500/30 p-4">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10"
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative">
              <p className="text-sm text-red-300 mb-3">
                Esta acción eliminará permanentemente todo tu progreso.
              </p>
              <button
                onClick={handleResetAll}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
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
