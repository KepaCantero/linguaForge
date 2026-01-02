'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HierarchicalTree } from '@/components/tree/HierarchicalTree';
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          className="relative w-16 h-16"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500" />
        </motion.div>
        <motion.p
          className="text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Cargando contenido...
        </motion.p>
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.div
          className="w-20 h-20 mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <span className="text-4xl">😕</span>
        </motion.div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Algo salió mal
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs">
          {error || "No se pudo cargar el árbol de tópicos"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors"
        >
          ← Volver
        </button>
      </div>
    );
  }

  // Usar HierarchicalTree para visualización jerárquica tipo árbol de directorios
  return <HierarchicalTree tree={tree} />;
}
