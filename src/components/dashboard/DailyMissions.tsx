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
        return 'bg-blue-500';
      case 'janus':
        return 'bg-purple-500';
      case 'exercises':
        return 'bg-indigo-500';
      case 'streak':
        return 'bg-orange-500';
      case 'forgeMandate':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (dailyMissions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Generando misiones diarias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Daily Directives
        </h2>
        {allComplete && (
          <motion.span
            className="text-sm text-emerald-600 dark:text-emerald-400 font-medium"
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
                  bg-white dark:bg-gray-800 rounded-xl p-4 border-2 transition-all
                  ${isCompleted
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-700'
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
                        font-semibold text-gray-900 dark:text-white
                        ${isCompleted ? 'line-through opacity-60' : ''}
                      `}>
                        {mission.title}
                      </h3>
                      {isCompleted && (
                        <span className="text-emerald-500 text-xl">✓</span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {mission.description}
                    </p>

                    {/* Barra de progreso */}
                    {!isCompleted && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{mission.current}/{mission.target}</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                      <span className="text-indigo-600 dark:text-indigo-400">
                        +{mission.reward.xp} XP
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        +{mission.reward.coins} Coins
                      </span>
                      {mission.reward.gems && (
                        <span className="text-purple-600 dark:text-purple-400">
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
          className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl p-6 text-center"
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

