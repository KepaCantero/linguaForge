import { motion } from 'framer-motion';
import Link from 'next/link';
import { ImportedNode } from '@/store/useImportedNodesStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { COLORS } from '@/constants/colors';

interface NodeHeaderProps {
  node: ImportedNode;
}

/**
 * Header section displaying node title, icon, and progress.
 * Shows source type indicator and navigation back button.
 */
export function NodeHeader({ node }: NodeHeaderProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  // Source type display configuration
  const sourceTypeConfig = {
    podcast: { icon: '🎙️', label: 'Podcast' },
    article: { icon: '📰', label: 'Artículo' },
    youtube: { icon: '🎬', label: 'Video' },
  };

  const { icon: sourceIcon, label: sourceLabel } = sourceTypeConfig[node.sourceType];
  const totalPhrases = node.subtopics.reduce((acc, s) => acc + s.phrases.length, 0);

  return (
    <>
      {/* Header */}
      <header className="relative border-b border-calm-warm-100/10 backdrop-blur-md">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/learn"
            className="flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-calm-bg-tertiary"
            style={{
              minWidth: '48px',
              minHeight: '48px',
            }}
            aria-label="Volver al mapa de aprendizaje"
          >
            <motion.span
              className="text-2xl"
              style={{ textShadow: COLORS.effects.textShadowMd }}
              whileHover={shouldAnimate ? { x: -4 } : {}}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              ←
            </motion.span>
          </Link>
          <div className="flex-1 flex items-center gap-3">
            <motion.div
              className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
              style={{
                background: node.percentage === 100
                  ? 'radial-gradient(circle at 30% 30%, var(--accent-500), var(--accent-600))'
                  : 'radial-gradient(circle at 30% 30%, var(--sky-500), var(--sky-600))',
                willChange: shouldAnimate ? 'transform' : 'auto',
              }}
              animate={shouldAnimate ? {
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              } : {}}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {node.icon}
            </motion.div>
            <div>
              <h1
                className="font-bold text-calm-text-primary line-clamp-1"
                style={{ textShadow: `0 2px 4px ${COLORS.black[60]}` }}
              >
                {node.title}
              </h1>
              <p className="text-xs text-calm-text-muted">
                {node.percentage}% completado
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative border-b border-calm-warm-100/10 backdrop-blur-md">
        <div className="h-2 bg-calm-bg-elevated/10">
          <motion.div
            className="h-full"
            style={{
              background: 'linear-gradient(to right, var(--sky-500), #F59E0B)',
              willChange: shouldAnimate ? 'width' : 'auto',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${node.percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Content info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative backdrop-blur-md rounded-2xl p-4 mb-6 border border-calm-warm-100/20"
        style={{
          background: COLORS.white[5],
        }}
      >
        <div className="flex items-center gap-2 text-sm text-calm-text-muted mb-2">
          <span>{sourceIcon}</span>
          <span>{sourceLabel}</span>
          <span>•</span>
          <span>{totalPhrases} frases</span>
        </div>
        <p
          className="text-sm text-calm-text-tertiary line-clamp-3"
          style={{ textShadow: COLORS.effects.textShadowSm }}
        >
          {node.sourceText.substring(0, 200)}...
        </p>
      </motion.div>
    </>
  );
}
