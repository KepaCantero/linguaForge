'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';

export default function ImportedNodePage() {
  const params = useParams();
  const nodeId = params.nodeId as string;
  const router = useRouter();

  const { nodes } = useImportedNodesStore();
  const node = nodes.find((n) => n.id === nodeId);

  if (!node) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">404</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Nodo no encontrado</p>
          <Link
            href="/learn"
            className="text-indigo-600 hover:text-indigo-700"
          >
            Volver al mapa
          </Link>
        </div>
      </div>
    );
  }

  const handleSubtopicClick = (subtopicId: string) => {
    // Redirigir directamente a la página de selección de modo (Academia/Desafío)
    router.push(`/learn/imported/${nodeId}/practice?subtopic=${subtopicId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/learn"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <span className="text-xl">←</span>
          </Link>
          <div className="flex-1 flex items-center gap-3">
            <span className="text-2xl">{node.icon}</span>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                {node.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {node.percentage}% completado
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="h-1 bg-gray-100 dark:bg-gray-700">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${node.percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 pt-6">
        {/* Info del contenido */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            {node.sourceType === 'podcast' && <span>Podcast</span>}
            {node.sourceType === 'article' && <span>Articulo</span>}
            {node.sourceType === 'youtube' && <span>Video</span>}
            <span>-</span>
            <span>{node.subtopics.reduce((acc, s) => acc + s.phrases.length, 0)} frases</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {node.sourceText.substring(0, 200)}...
          </p>
        </div>

        {/* Lista de subtópicos */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Subtemas ({node.completedSubtopics.length}/{node.subtopics.length})
        </h2>

        <div className="space-y-3">
          {node.subtopics.map((subtopic, index) => {
            const isCompleted = node.completedSubtopics.includes(subtopic.id);

            return (
              <motion.div
                key={subtopic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSubtopicClick(subtopic.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      isCompleted
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {subtopic.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {subtopic.phrases.length} frases
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Si no hay subtópicos */}
        {node.subtopics.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay subtemas en este nodo
          </div>
        )}
      </main>
    </div>
  );
}
