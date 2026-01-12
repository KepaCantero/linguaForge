'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ImportedNode, ImportedSubtopic } from '@/store/useImportedNodesStore';

interface ModeHeaderProps {
  nodeId: string;
  node: ImportedNode;
  subtopic: ImportedSubtopic;
  shouldAnimate: boolean;
}

/**
 * Header component for practice mode selection page.
 * Displays back button, node icon, subtopic title, and phrase count.
 */
export function ModeHeader({ nodeId, node, subtopic, shouldAnimate }: ModeHeaderProps) {
  return (
    <header className="relative border-b border-white/10 backdrop-blur-md">
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
        <Link
          href={`/learn/imported/${nodeId}`}
          className="flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus:ring-4 focus:ring-lf-accent focus:ring-offset-2 focus:ring-offset-lf-dark"
          style={{
            minWidth: '48px',
            minHeight: '48px',
          }}
          aria-label="Volver al nodo"
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
              background: 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
              willChange: shouldAnimate ? 'transform' : 'auto',
            }}
            animate={
              shouldAnimate
                ? {
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                  }
                : {}
            }
            transition={{ duration: 4, repeat: Infinity }}
          >
            {node.icon}
          </motion.div>
          <div>
            <h1
              className="font-bold text-white line-clamp-1"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
            >
              {subtopic.title}
            </h1>
            <p className="text-xs text-lf-muted">{subtopic.phrases.length} frases</p>
          </div>
        </div>
      </div>
    </header>
  );
}
