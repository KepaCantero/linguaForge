import { COLORS } from '@/constants/colors';
import { motion } from 'framer-motion';
import { ImportedSubtopic } from '@/store/useImportedNodesStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SubtopicCardProps {
  subtopic: ImportedSubtopic;
  index: number;
  isCompleted: boolean;
  onClick: () => void;
}

/**
 * Individual subtopic card displaying title, phrase count, and completion status.
 * Interactive with hover animations and accessibility features.
 */
export function SubtopicCard({
  subtopic,
  index,
  isCompleted,
  onClick,
}: SubtopicCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="relative cursor-pointer group focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-calm-bg-tertiary rounded-2xl"
      style={{ willChange: shouldAnimate ? 'transform' : 'auto' }}
      whileHover={shouldAnimate ? { scale: 1.02 } : {}}
      whileTap={shouldAnimate ? { scale: 0.98 } : {}}
      tabIndex={0}
      role="button"
      aria-label={`${subtopic.title}: ${subtopic.phrases.length} frases. ${isCompleted ? 'Completado' : 'Pendiente'}`}
    >
      {/* Orb background */}
      <div
        className="absolute inset-0 rounded-2xl opacity-50 blur-xl"
        style={{
          background: isCompleted
            ? 'radial-gradient(circle, var(--accent-500)/40, transparent)'
            : 'radial-gradient(circle, var(--sky-500)/40, transparent)',
        }}
      />

      {/* Card content */}
      <div
        className="relative backdrop-blur-md rounded-2xl p-4 border-2 transition-all"
        style={{
          background: COLORS.white[5],
          borderColor: isCompleted
            ? COLORS.accent[30]
            : COLORS.white[10],
        }}
      >
        <div className="flex items-center gap-4">
          {/* Progress orb */}
          <motion.div
            className="relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{
              background: isCompleted
                ? 'radial-gradient(circle at 30% 30%, var(--accent-500), var(--accent-600))'
                : 'radial-gradient(circle at 30% 30%, var(--sky-500), var(--sky-600))',
              willChange: shouldAnimate ? 'transform' : 'auto',
            }}
            animate={shouldAnimate ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={{
              duration: 2 + index * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {isCompleted ? '✓' : index + 1}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-bold truncate ${
                isCompleted
                  ? 'text-accent-400'
                  : 'text-calm-text-primary'
              }`}
              style={{ textShadow: COLORS.effects.textShadowMd }}
            >
              {subtopic.title}
            </h3>
            <p className="text-sm text-calm-text-muted">
              {subtopic.phrases.length} frases
            </p>
          </div>

          <motion.span
            className="text-2xl flex-shrink-0"
            style={{ textShadow: COLORS.effects.textShadowMd }}
            animate={shouldAnimate ? {
              x: [0, 4, 0],
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.1,
            }}
          >
            →
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
