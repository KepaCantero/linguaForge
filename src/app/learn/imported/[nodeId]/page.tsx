'use client';

import { motion } from 'framer-motion';
import { useImportedNodeData } from './hooks/useImportedNodeData';
import { LoadingState } from './components/LoadingState';
import { NodeHeader } from './components/NodeHeader';
import { SubtopicList } from './components/SubtopicList';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Imported Node Page - Displays imported learning content with subtopics.
 * Automatically redirects to first subtopic if available.
 *
 * Route: /learn/imported/[nodeId]
 *
 * Features:
 * - Automatic redirect to first subtopic
 * - Progress tracking display
 * - Interactive subtopic cards
 * - AAA accessibility compliance
 */
export default function ImportedNodePage() {
  const { node, isMounted, isRedirecting, handleSubtopicClick } = useImportedNodeData();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  // Show loading state while mounting, redirecting, or node not found
  if (!isMounted || isRedirecting || !node) {
    return <LoadingState />;
  }

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

      {/* Header section with progress bar */}
      <NodeHeader node={node} />

      {/* Main content */}
      <main className="relative max-w-lg mx-auto px-4 pt-6">
        <SubtopicList node={node} onSubtopicClick={handleSubtopicClick} />
      </main>
    </div>
  );
}
