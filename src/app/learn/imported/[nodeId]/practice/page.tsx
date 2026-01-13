'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePracticeModeData } from './hooks/usePracticeModeData';
import { NotFoundState } from './components/NotFoundState';
import { PageContent } from './components/PageContent';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function PracticeModeSelection() {
  const params = useParams();
  const nodeId = params.nodeId as string;
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const { data, error } = usePracticeModeData();

  // Handle not found states
  if (error) {
    return <NotFoundState nodeId={nodeId} shouldAnimate={shouldAnimate} />;
  }

  // Data is guaranteed to exist when error is null
  const { node, subtopic, handleModeSelect } = data!;

  return (
    <PageContent
      nodeId={nodeId}
      node={node}
      subtopic={subtopic}
      onModeSelect={handleModeSelect}
      shouldAnimate={shouldAnimate}
    />
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen bg-calm-bg-tertiary flex items-center justify-center">
          {typeof window !== 'undefined' && (
            <motion.div
              className="absolute inset-0 opacity-20"
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
          <motion.div
            className="relative w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, var(--sky-500), var(--sky-600))',
              border: '4px solid transparent',
              borderTopColor: '#FDE047',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      }
    >
      <PracticeModeSelection />
    </Suspense>
  );
}
