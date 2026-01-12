'use client';

import { motion } from 'framer-motion';
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
    <div className="relative min-h-screen bg-lf-dark pb-20">
      {/* Animated background */}
      {shouldAnimate && (
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, #6366F1 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, #C026D3 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, #6366F1 0%, transparent 50%)',
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
            className="text-3xl font-bold text-white mb-3"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
          >
            Elige tu modo de práctica
          </h2>
          <p
            className="text-lf-muted"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
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
