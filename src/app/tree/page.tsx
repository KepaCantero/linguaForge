'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RadialTree } from '@/components/tree';
import { TopicTreeSchema } from '@/types';
import type { TopicTree } from '@/types';

export default function TreePage() {
  const [tree, setTree] = useState<TopicTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTree() {
      try {
        setLoading(true);
        const data = await import('@/../content/fr/A1/topic-tree.json');
        const parsed = TopicTreeSchema.parse(data.default || data);
        setTree(parsed);
      } catch (err) {
        console.error('Error loading topic tree:', err);
        setError(err instanceof Error ? err.message : 'Error loading tree');
      } finally {
        setLoading(false);
      }
    }
    loadTree();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-4xl mb-4">🌲</span>
        <p className="text-gray-600 dark:text-gray-400">
          {error || 'No se pudo cargar el árbol de tópicos'}
        </p>
      </div>
    );
  }

  return <RadialTree tree={tree} />;
}
