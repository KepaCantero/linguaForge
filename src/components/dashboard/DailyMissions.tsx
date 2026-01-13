'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore } from '@/store/useMissionStore';
import { Mission } from '@/store/useMissionStore';

export function DailyMissions() {
  const { dailyMissions, generateDailyMissions, getMissionProgress, areAllMissionsComplete, checkDailyHP } = useMissionStore();

  useEffect(() => {
    // Verificar HP y generar misiones al montar
    checkDailyHP();
    generateDailyMissions();
  }, [checkDailyHP, generateDailyMissions]);

  const allComplete = areAllMissionsComplete();

  const getMissionIcon = (type: Mission['type']) => {
    switch (type) {
      case 'input':
        return '🎧';
      case 'janus':
        return '🔷';
      case 'exercises':
        return '⚡';
      case 'streak':
        return '🔥';
      case 'forgeMandate':
        return '⚔️';
      default:
        return '📋';
    }
  };

  const getMissionColor = (type: Mission['type']) => {
    switch (type) {
      case 'input':
        return 'bg-sky-500';
      case 'janus':
        return 'bg-sky-500';
      case 'exercises':
        return 'bg-accent-500';
      case 'streak':
        return 'bg-amber-500';
      case 'forgeMandate':
        return 'bg-gradient-to-r from-accent-500 to-sky-500';
      default:
        return 'bg-calm-bg-primary0';
    }
  };

  if (dailyMissions.length === 0) {
    return (
      <div className="bg-white dark:bg-calm-bg-elevated rounded-xl p-6 text-center">
        <p className="text-calm-text-muted dark:text-calm-text-muted">Generando misiones diarias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-calm-text-primary dark:text-white">
          Daily Directives
        </h2>
        {allComplete && (
          <motion.span
            className="text-sm text-accent-600 dark:text-accent-400 font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ✓ Todas completadas
          </motion.span>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {dailyMissions.map((mission, index) => {
            const progress = getMissionProgress(mission.id);
            const isCompleted = mission.completed;

            return (
              <motion.div
                key={mission.id}
                className={`
                  bg-white dark:bg-calm-bg-elevated rounded-xl p-4 border-2 transition-all
                  ${isCompleted
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                    : 'border-calm-warm-100 dark:border-calm-warm-200'
                  }
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  {/* Icono */}
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                    ${getMissionColor(mission.type)}
                    ${isCompleted ? 'opacity-60' : ''}
                  `}>
                    {getMissionIcon(mission.type)}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`
                        font-semibold text-calm-text-primary dark:text-white
                        ${isCompleted ? 'line-through opacity-60' : ''}
                      `}>
                        {mission.title}
                      </h3>
                      {isCompleted && (
                        <span className="text-accent-500 text-xl">✓</span>
                      )}
                    </div>

                    <p className="text-sm text-calm-text-secondary dark:text-calm-text-muted mb-3">
                      {mission.description}
                    </p>

                    {/* Barra de progreso */}
                    {!isCompleted && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-calm-text-muted dark:text-calm-text-muted">
                          <span>{mission.current}/{mission.target}</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${getMissionColor(mission.type)} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Recompensas */}
                    <div className="flex items-center gap-3 mt-3 text-xs">
                      <span className="text-accent-600 dark:text-accent-400">
                        +{mission.reward.xp} XP
                      </span>
                      <span className="text-calm-text-secondary dark:text-calm-text-muted">
                        +{mission.reward.coins} Coins
                      </span>
                      {mission.reward.gems && (
                        <span className="text-sky-600 dark:text-sky-400">
                          +{mission.reward.gems} Gems
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Mensaje cuando todas están completadas */}
      {allComplete && (
        <motion.div
          className="bg-gradient-to-r from-accent-400 to-sky-500 rounded-xl p-6 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-4xl mb-2 block">🎉</span>
          <h3 className="text-white text-lg font-bold mb-2">
            ¡Todas las misiones completadas!
          </h3>
          <p className="text-white/90 text-sm">
            Tu HP se ha restaurado completamente
          </p>
        </motion.div>
      )}
    </div>
  );
}

