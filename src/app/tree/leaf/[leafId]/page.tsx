'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TopicTreeSchema } from '@/types';
import type { TopicLeaf, TopicBranch } from '@/types';

export default function LeafPage() {
  const params = useParams();
  const router = useRouter();
  const leafId = params.leafId as string;

  const [leaf, setLeaf] = useState<TopicLeaf | null>(null);
  const [branch, setBranch] = useState<TopicBranch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const data = await import('@/../content/fr/A1/topic-tree.json');
        const parsed = TopicTreeSchema.parse(data.default || data);

        // Find the leaf
        for (const b of parsed.branches) {
          const foundLeaf = b.leaves.find(l => l.id === leafId);
          if (foundLeaf) {
            setLeaf(foundLeaf);
            setBranch(b);
            break;
          }
        }
      } catch (err) {
        console.error('Error loading leaf:', err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [leafId]);

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

  if (!leaf || !branch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-4xl mb-4">🍂</span>
        <p className="text-gray-600 dark:text-gray-400">
          Hoja no encontrada
        </p>
        <button
          onClick={() => router.push('/tree')}
          className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg"
        >
          Volver al árbol
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Back button */}
      <motion.button
        onClick={() => router.push('/tree')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <span>←</span>
        <span>Volver al árbol</span>
      </motion.button>

      {/* Header */}
      <motion.div
        className="rounded-2xl overflow-hidden shadow-lg mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="p-6 text-white"
          style={{ backgroundColor: branch.color }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{leaf.icon || branch.icon}</span>
            <div>
              <p className="text-sm opacity-80">{branch.title}</p>
              <h1 className="text-xl font-bold">{leaf.title}</h1>
            </div>
          </div>
          <p className="text-sm opacity-90 italic">{leaf.titleFr}</p>
        </div>
      </motion.div>

      {/* Coming soon content */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-5xl mb-4 block">🚧</span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Contenido próximamente
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Estamos preparando ejercicios interactivos para este tema.
        </p>

        {/* Duration */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
          <span>⏱️</span>
          <span>Duración estimada: {leaf.estimatedMinutes} minutos</span>
        </div>
      </motion.div>

      {/* Grammar section */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span>📌</span>
          Gramática que aprenderás
        </h3>
        <ul className="space-y-2">
          {leaf.grammar.map((g, i) => (
            <motion.li
              key={i}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {g}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* What you'll learn */}
      <motion.div
        className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span>🎯</span>
          Lo que incluirá esta lección
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>📘</span>
            <span>Input comprensible</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>🎧</span>
            <span>Audio nativo</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>✏️</span>
            <span>Ejercicios</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>✅</span>
            <span>Mini-test</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
