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
        <RewardsModalHeader feedback={feedback} />
        <RewardsModalContent
          stage={stage}
          rewards={rewards}
          feedback={feedback}
          showDetails={showDetails}
          onAnimationComplete={() => setAnimationComplete(true)}
          onContinue={() => setStage('feedback')}
        />
        <RewardsModalFooter onClose={onClose} onContinue={onContinue} />
      </motion.div>
    </motion.div>
  );
}

// ============================================
// SUBCOMPONENTES
// ============================================

interface RewardsModalHeaderProps {
  feedback: SessionFeedback;
}

function RewardsModalHeader({ feedback }: RewardsModalHeaderProps) {
  return (
    <div className="relative p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-6xl mb-2"
        >
          {getRatingIcon(feedback.rating)}
        </motion.div>
        <h2 className={`text-2xl font-bold ${getRatingColor(feedback.rating)}`}>
          {getRatingTitle(feedback.rating)}
        </h2>
        <p className="text-gray-400 mt-1">{feedback.message}</p>
      </div>
    </div>
  );
}

interface RewardsModalContentProps {
  stage: 'rewards' | 'achievements' | 'feedback';
  rewards: RewardCalculation;
  feedback: SessionFeedback;
  showDetails: boolean;
  onAnimationComplete: () => void;
  onContinue: () => void;
}

function RewardsModalContent({
  stage,
  rewards,
  feedback,
  showDetails,
  onAnimationComplete,
  onContinue,
}: RewardsModalContentProps) {
  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        {stage === 'rewards' && (
          <RewardsStage
            key="rewards"
            rewards={rewards}
            showDetails={showDetails}
            onAnimationComplete={onAnimationComplete}
          />
        )}
        {stage === 'achievements' && rewards.achievements.length > 0 && (
          <AchievementsStage
            key="achievements"
            achievements={rewards.achievements}
            onContinue={onContinue}
          />
        )}
        {stage === 'feedback' && (
          <FeedbackStage
            key="feedback"
            feedback={feedback}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface RewardsStageProps {
  rewards: RewardCalculation;
  showDetails: boolean;
  onAnimationComplete: () => void;
}

function RewardsStage({ rewards, showDetails, onAnimationComplete }: RewardsStageProps) {
  return (
    <motion.div
      key="rewards"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onAnimationComplete={onAnimationComplete}
    >
      <XPRewardDisplay totalXP={rewards.totalXP} bonusXP={rewards.bonusXP} />
      <CoinsRewardDisplay totalCoins={rewards.totalCoins} />
      {rewards.gems > 0 && <GemsRewardDisplay gems={rewards.gems} />}
      {showDetails && rewards.multipliers.length > 0 && (
        <MultipliersDisplay multipliers={rewards.multipliers} />
      )}
    </motion.div>
  );
}

function XPRewardDisplay({ totalXP, bonusXP }: { totalXP: number; bonusXP: number }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-400">XP Ganado</span>
      <div className="flex items-center gap-2">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-amber-400"
        >
          +{totalXP}
        </motion.span>
        {bonusXP > 0 && (
          <span className="text-sm text-green-400">
            (+{bonusXP} bonus)
          </span>
        )}
      </div>
    </div>
  );
}

function CoinsRewardDisplay({ totalCoins }: { totalCoins: number }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-400">Monedas</span>
      <div className="flex items-center gap-2">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-yellow-400"
        >
          +{totalCoins} 🪙
        </motion.span>
      </div>
    </div>
  );
}

function GemsRewardDisplay({ gems }: { gems: number }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-400">Gemas</span>
      <motion.span
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-purple-400"
      >
        +{gems} 💎
      </motion.span>
    </div>
  );
}

function MultipliersDisplay({ multipliers }: { multipliers: RewardCalculation['multipliers'] }) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-800">
      <p className="text-sm text-gray-500 mb-2">Multiplicadores</p>
      <div className="flex flex-wrap gap-2">
        {multipliers.map((mult, i) => (
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
  );
}

interface AchievementsStageProps {
  achievements: RewardCalculation['achievements'];
  onContinue: () => void;
}

function AchievementsStage({ achievements, onContinue }: AchievementsStageProps) {
  return (
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
      {achievements.map((achievement, i) => (
        <AchievementCard key={achievement.id} achievement={achievement} index={i} />
      ))}
      <button
        onClick={onContinue}
        className="w-full mt-4 py-2 text-indigo-400 hover:text-indigo-300"
      >
        Continuar →
      </button>
    </motion.div>
  );
}

interface AchievementCardProps {
  achievement: RewardCalculation['achievements'][number];
  index: number;
}

function AchievementCard({ achievement, index }: AchievementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.2 }}
      className={`p-4 rounded-xl border ${getAchievementRarityClass(achievement.rarity)}`}
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
  );
}

function getAchievementRarityClass(rarity: string): string {
  const rarityClasses: Record<string, string> = {
    legendary: 'bg-amber-900/20 border-amber-500/50',
    epic: 'bg-purple-900/20 border-purple-500/50',
    rare: 'bg-blue-900/20 border-blue-500/50',
    common: 'bg-gray-800/50 border-gray-700/50',
  };
  return rarityClasses[rarity] || rarityClasses.common;
}

interface FeedbackStageProps {
  feedback: SessionFeedback;
}

function FeedbackStage({ feedback }: FeedbackStageProps) {
  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {feedback.cognitiveInsight && <CognitiveInsight insight={feedback.cognitiveInsight} />}
      {feedback.tips.length > 0 && <TipsSection tips={feedback.tips} />}
      {feedback.nextSteps.length > 0 && <NextStepsSection steps={feedback.nextSteps} />}
    </motion.div>
  );
}

function CognitiveInsight({ insight }: { insight: string }) {
  return (
    <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl mb-4">
      <p className="text-sm text-indigo-300">
        🧠 {insight}
      </p>
    </div>
  );
}

function TipsSection({ tips }: { tips: string[] }) {
  return (
    <div className="mb-4">
      <p className="text-sm text-gray-500 mb-2">Consejos</p>
      <ul className="space-y-1">
        {tips.map((tip, i) => (
          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
            <span className="text-amber-400">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NextStepsSection({ steps }: { steps: string[] }) {
  return (
    <div className="mb-4">
      <p className="text-sm text-gray-500 mb-2">Próximos Pasos</p>
      <ul className="space-y-1">
        {steps.map((step, i) => (
          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
            <span className="text-green-400">→</span>
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface RewardsModalFooterProps {
  onClose: () => void;
  onContinue?: () => void;
}

function RewardsModalFooter({ onClose, onContinue }: RewardsModalFooterProps) {
  return (
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
  );
}

// ============================================
// UTILITIES
// ============================================

function getRatingColor(rating: SessionFeedback['rating']): string {
  const colors: Record<SessionFeedback['rating'], string> = {
    excellent: 'text-amber-400',
    good: 'text-green-400',
    fair: 'text-blue-400',
    needs_improvement: 'text-gray-400',
  };
  return colors[rating];
}

function getRatingIcon(rating: SessionFeedback['rating']): string {
  const icons: Record<SessionFeedback['rating'], string> = {
    excellent: '🌟',
    good: '✨',
    fair: '👍',
    needs_improvement: '💪',
  };
  return icons[rating];
}

function getRatingTitle(rating: SessionFeedback['rating']): string {
  const titles: Record<SessionFeedback['rating'], string> = {
    excellent: 'Excelente',
    good: 'Buen Trabajo',
    fair: 'Completado',
    needs_improvement: 'Sigue Adelante',
  };
  return titles[rating];
}

export default PostCognitiveRewards;
