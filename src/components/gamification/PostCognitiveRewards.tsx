'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RewardCalculation, SessionFeedback } from '@/services/postCognitiveRewards';

interface PostCognitiveRewardsProps {
  rewards: RewardCalculation;
  feedback: SessionFeedback;
  onClose: () => void;
  onContinue?: () => void;
  showDetails?: boolean;
}

/**
 * PostCognitiveRewards Component
 *
 * Muestra las recompensas y feedback después de completar
 * una sesión de estudio o ejercicio.
 */
export function PostCognitiveRewards({
  rewards,
  feedback,
  onClose,
  onContinue,
  showDetails = true,
}: PostCognitiveRewardsProps) {
  const [stage, setStage] = useState<'rewards' | 'achievements' | 'feedback'>('rewards');
  const [animationComplete, setAnimationComplete] = useState(false);

  // Avanzar automáticamente entre etapas
  useEffect(() => {
    if (stage === 'rewards' && animationComplete) {
      const timer = setTimeout(() => {
        if (rewards.achievements.length > 0) {
          setStage('achievements');
          setAnimationComplete(false);
        } else {
          setStage('feedback');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, animationComplete, rewards.achievements]);

  // Color del rating
  const getRatingColor = () => {
    switch (feedback.rating) {
      case 'excellent':
        return 'text-amber-400';
      case 'good':
        return 'text-green-400';
      case 'fair':
        return 'text-blue-400';
      case 'needs_improvement':
        return 'text-gray-400';
    }
  };

  // Icono del rating
  const getRatingIcon = () => {
    switch (feedback.rating) {
      case 'excellent':
        return '🌟';
      case 'good':
        return '✨';
      case 'fair':
        return '👍';
      case 'needs_improvement':
        return '💪';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md mx-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-6xl mb-2"
            >
              {getRatingIcon()}
            </motion.div>
            <h2 className={`text-2xl font-bold ${getRatingColor()}`}>
              {feedback.rating === 'excellent' && 'Excelente'}
              {feedback.rating === 'good' && 'Buen Trabajo'}
              {feedback.rating === 'fair' && 'Completado'}
              {feedback.rating === 'needs_improvement' && 'Sigue Adelante'}
            </h2>
            <p className="text-gray-400 mt-1">{feedback.message}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Etapa: Recompensas */}
            {stage === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onAnimationComplete={() => setAnimationComplete(true)}
              >
                {/* XP */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">XP Ganado</span>
                  <div className="flex items-center gap-2">
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-2xl font-bold text-amber-400"
                    >
                      +{rewards.totalXP}
                    </motion.span>
                    {rewards.bonusXP > 0 && (
                      <span className="text-sm text-green-400">
                        (+{rewards.bonusXP} bonus)
                      </span>
                    )}
                  </div>
                </div>

                {/* Coins */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Monedas</span>
                  <div className="flex items-center gap-2">
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl font-bold text-yellow-400"
                    >
                      +{rewards.totalCoins} 🪙
                    </motion.span>
                  </div>
                </div>

                {/* Gems */}
                {rewards.gems > 0 && (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">Gemas</span>
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-purple-400"
                    >
                      +{rewards.gems} 💎
                    </motion.span>
                  </div>
                )}

                {/* Multiplicadores */}
                {showDetails && rewards.multipliers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-500 mb-2">Multiplicadores</p>
                    <div className="flex flex-wrap gap-2">
                      {rewards.multipliers.map((mult, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="px-3 py-1 bg-indigo-900/30 border border-indigo-500/30 rounded-full text-sm"
                        >
                          <span className="mr-1">{mult.icon}</span>
                          <span className="text-indigo-300">{mult.name}</span>
                          <span className="text-indigo-400 ml-1">x{mult.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Etapa: Logros */}
            {stage === 'achievements' && rewards.achievements.length > 0 && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold text-center text-amber-400 mb-4">
                  🏆 Logros Desbloqueados
                </h3>
                {rewards.achievements.map((achievement, i) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className={`p-4 rounded-xl border ${
                      achievement.rarity === 'legendary'
                        ? 'bg-amber-900/20 border-amber-500/50'
                        : achievement.rarity === 'epic'
                        ? 'bg-purple-900/20 border-purple-500/50'
                        : achievement.rarity === 'rare'
                        ? 'bg-blue-900/20 border-blue-500/50'
                        : 'bg-gray-800/50 border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div>
                        <p className="font-medium text-white">{achievement.name}</p>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                        <p className="text-sm text-amber-400 mt-1">
                          +{achievement.xpBonus} XP
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <button
                  onClick={() => setStage('feedback')}
                  className="w-full mt-4 py-2 text-indigo-400 hover:text-indigo-300"
                >
                  Continuar →
                </button>
              </motion.div>
            )}

            {/* Etapa: Feedback */}
            {stage === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Insight Cognitivo */}
                <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl mb-4">
                  <p className="text-sm text-indigo-300">
                    🧠 {feedback.cognitiveInsight}
                  </p>
                </div>

                {/* Tips */}
                {feedback.tips.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Consejos</p>
                    <ul className="space-y-1">
                      {feedback.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-amber-400">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Próximos pasos */}
                {feedback.nextSteps.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Próximos Pasos</p>
                    <ul className="space-y-1">
                      {feedback.nextSteps.map((step, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-green-400">→</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
          >
            Cerrar
          </button>
          {onContinue && (
            <button
              onClick={onContinue}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              Continuar
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PostCognitiveRewards;
