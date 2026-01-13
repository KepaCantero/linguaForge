'use client';

import { motion } from 'framer-motion';
import { COLORS } from '@/constants/colors';
import { ModeHeader } from './ModeHeader';
import { ModeGrid } from './ModeGrid';
import type { ImportedNode, ImportedSubtopic } from '@/store/useImportedNodesStore';

interface PageContentProps {
  nodeId: string;
  node: ImportedNode;
  subtopic: ImportedSubtopic;
  onModeSelect: (mode: 'academia' | 'desafio') => void;
  shouldAnimate: boolean;
}

/**
 * Main content component for practice mode selection page.
 * Renders header, title, description, and mode grid.
 */
export function PageContent({
  nodeId,
  node,
  subtopic,
  onModeSelect,
  shouldAnimate,
}: PageContentProps) {
  return (
    <div className="relative min-h-screen bg-calm-bg-tertiary pb-20">
      {/* Animated background */}
      {shouldAnimate && (
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, var(--sky-500) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, #F59E0B 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, var(--sky-500) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Header */}
      <ModeHeader nodeId={nodeId} node={node} subtopic={subtopic} shouldAnimate={shouldAnimate} />

      {/* Main content */}
      <main className="relative max-w-lg mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl font-bold text-calm-text-primary mb-3"
            style={{ textShadow: COLORS.effects.textShadowLg }}
          >
            Elige tu modo de práctica
          </h2>
          <p
            className="text-calm-text-muted"
            style={{ textShadow: COLORS.effects.textShadowSm }}
          >
            Selecciona cómo quieres practicar estas frases
          </p>
        </motion.div>

        {/* Mode selection */}
        <ModeGrid onModeSelect={onModeSelect} shouldAnimate={shouldAnimate} />
      </main>
    </div>
  );
}
