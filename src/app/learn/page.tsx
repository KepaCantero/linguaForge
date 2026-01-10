'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { useNodeProgressStore } from '@/store/useNodeProgressStore';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { getTranslations } from '@/i18n';
import { InfiniteCourseMap } from '@/components/learn/InfiniteCourseMap';

export default function LearnPage() {
  const router = useRouter();
  const { appLanguage } = useUserStore();
  const { nodes, initGuidedNodes } = useNodeProgressStore();
  const { nodes: importedNodes, deleteNode } = useImportedNodesStore();
  const t = getTranslations(appLanguage);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    initGuidedNodes(['node-1', 'node-2', 'node-3', 'node-4', 'node-5']);
  }, [initGuidedNodes]);

  // Evitar hidratación mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-lf-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lf-primary" />
      </div>
    );
  }

  const handleNodeClick = (nodeId: string) => {
    router.push(`/learn/imported/${nodeId}`);
  };

  const handleDeleteNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este nodo?')) {
      deleteNode(nodeId);
    }
  };

  // Filter imported nodes
  const filteredNodes = importedNodes.filter(node => {
    const matchesSearch = searchQuery === '' ||
      node.title.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (selectedFilter === 'progress') {
      matchesFilter = node.percentage > 0 && node.percentage < 100;
    } else if (selectedFilter === 'completed') {
      matchesFilter = node.percentage === 100;
    } else if (selectedFilter === 'not-started') {
      matchesFilter = node.percentage === 0;
    }

    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { id: 'all', icon: '📚', name: 'Todos' },
    { id: 'progress', icon: '📊', name: 'En progreso' },
    { id: 'completed', icon: '✅', name: 'Completados' },
    { id: 'not-started', icon: '🆕', name: 'Sin empezar' },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Floating Import Button */}
      <Link href="/import" className="fixed top-20 right-4 z-50">
        <motion.div
          className="relative w-16 h-16 rounded-full cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-lf-primary to-lf-secondary"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            ✨
          </div>
        </motion.div>
      </Link>

      {/* Sección 1: Curso A0 */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span>📚</span>
            <span>Curso A0 - Francés Básico</span>
          </h2>
          <p className="text-lf-muted">Aprende desde cero con lecciones estructuradas</p>
        </motion.div>
        <InfiniteCourseMap translations={t} userProgress={nodes} />
      </section>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Sección 2: Tu Contenido Importado */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span>🎯</span>
            <span>Tu Contenido</span>
          </h2>
          <p className="text-lf-muted">Material importado para practicar</p>
        </motion.div>

        {importedNodes.length === 0 ? (
          <EmptyState translations={t} />
        ) : (
          <>
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mb-6"
            >
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar contenido..."
                  className="w-full px-6 py-4 pl-14 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-lf-accent focus:border-transparent"
                />
                <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
              </div>

              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id === 'all' ? null : filter.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all flex items-center gap-2 ${
                      (filter.id === 'all' && !selectedFilter) || selectedFilter === filter.id
                        ? 'bg-lf-accent text-lf-dark'
                        : 'bg-glass-surface backdrop-blur-md border border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{filter.icon}</span>
                    <span>{filter.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Nodes Grid */}
            {filteredNodes.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-white/60">No se encontraron resultados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNodeClick(node.id)}
                    className="relative group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4 transition-all hover:border-lf-primary/50">
                      {/* Progress bar at top */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                        <motion.div
                          className="h-full bg-gradient-to-r from-lf-primary to-lf-secondary"
                          initial={{ width: 0 }}
                          animate={{ width: `${node.percentage}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>

                      {/* Delete button */}
                      <motion.button
                        onClick={(e) => handleDeleteNode(e, node.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-sm z-10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ✕
                      </motion.button>

                      {/* Content */}
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="relative w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br from-lf-primary to-lf-secondary">
                          {node.icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate mb-1">
                            {node.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-lf-muted">
                            <span>{node.subtopics.reduce((acc, s) => acc + s.phrases.length, 0)} frases</span>
                            <span>•</span>
                            <span>{node.subtopics.length} bloques</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress footer */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${node.percentage === 100 ? 'bg-green-400' : 'bg-lf-accent'}`} />
                          <span className="text-sm text-white/70">
                            {node.percentage === 100 ? 'Completado' : `${node.percentage}%`}
                          </span>
                        </div>
                        <span className="text-lf-accent text-sm">→</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// Empty state
function EmptyState({ translations: t }: { translations: ReturnType<typeof getTranslations> }) {
  return (
    <div className="relative w-full h-[50vh] flex items-center justify-center">
      <Link href="/import">
        <motion.div
          className="text-center cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-lf-primary to-lf-secondary flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="text-5xl">✨</span>
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-2">
            ¡Importa tu primer contenido!
          </h2>
          <p className="text-sm text-lf-muted">
            Videos, podcasts o artículos para aprender
          </p>
        </motion.div>
      </Link>
    </div>
  );
}
