import { motion } from 'framer-motion';
import Link from 'next/link';
import { ImportedNode } from '@/store/useImportedNodesStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

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
      <header className="relative border-b border-white/10 backdrop-blur-md">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/learn"
            className="flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus:ring-4 focus:ring-lf-accent focus:ring-offset-2 focus:ring-offset-lf-dark"
            style={{
              minWidth: '48px',
              minHeight: '48px',
            }}
            aria-label="Volver al mapa de aprendizaje"
          >
            <motion.span
              className="text-2xl"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
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
                  ? 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)'
                  : 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
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
                className="font-bold text-white line-clamp-1"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
              >
                {node.title}
              </h1>
              <p className="text-xs text-lf-muted">
                {node.percentage}% completado
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative border-b border-white/10 backdrop-blur-md">
        <div className="h-2 bg-white/10">
          <motion.div
            className="h-full"
            style={{
              background: 'linear-gradient(to right, #6366F1, #C026D3)',
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
        className="relative backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="flex items-center gap-2 text-sm text-lf-muted mb-2">
          <span>{sourceIcon}</span>
          <span>{sourceLabel}</span>
          <span>•</span>
          <span>{totalPhrases} frases</span>
        </div>
        <p
          className="text-sm text-gray-300 line-clamp-3"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          {node.sourceText.substring(0, 200)}...
        </p>
      </motion.div>
    </>
  );
}
