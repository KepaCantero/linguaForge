'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useNodeProgressStore } from '@/store/useNodeProgressStore';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { TopicCard } from './components/TopicCard';
import { TopicRow } from './components/TopicRow';
import type { UnifiedTopic } from './types';
import { CATEGORIES, A0_COURSES, COMING_SOON_COURSES } from './types';

// ============================================================
// UNIFIED CONTENT DATA STRUCTURE
// ============================================================

export type { UnifiedTopic } from './types';

export default function LearnPage() {
  const { nodes, initGuidedNodes, isNodeUnlocked } = useNodeProgressStore();
  const { nodes: importedNodes } = useImportedNodesStore();
  const [isMounted, setIsMounted] = useState(false);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    initGuidedNodes(['node-1', 'node-2', 'node-3', 'node-4', 'node-5']);
  }, [initGuidedNodes]);

  // ============================================================
  // UNIFY ALL CONTENT INTO SINGLE LIST
  // ============================================================

  const unifiedTopics = useMemo((): UnifiedTopic[] => {
    const topics: UnifiedTopic[] = [];

    // 1. Add A0 Guided Courses
    A0_COURSES.forEach((course) => {
      const progress = nodes[course.id];
      const isUnlocked = isNodeUnlocked(course.id);
      const categoryInfo = CATEGORIES.find(c => c.id === course.category) || CATEGORIES[0];

      topics.push({
        id: course.id,
        type: 'a0-course',
        title: course.title,
        description: course.description,
        icon: course.icon,
        category: categoryInfo.id,
        level: 'A0',
        progress: progress?.percentage || 0,
        isLocked: !isUnlocked,
        isCompleted: progress?.isComplete || false,
        totalExercises: 16, // 4 lessons × 4 exercises
        completedExercises: progress?.completedExercises || 0,
        color: categoryInfo.color,
        gradient: categoryInfo.gradient,
        href: isUnlocked ? `/learn/node/${course.id}` : '#',
      });
    });

    // 2. Add Coming Soon Courses (placeholders)
    // COMING_SOON_COURSES.forEach((course) => {
    //   const categoryInfo = CATEGORIES.find(c => c.id === course.category) || CATEGORIES[0];
    //   topics.push({
    //     id: course.id,
    //     type: 'coming-soon',
    //     title: course.title,
    //     description: course.description,
    //     icon: course.icon,
    //     category: categoryInfo.id,
    //     level: 'A0',
    //     progress: 0,
    //     isLocked: true,
    //     isCompleted: false,
    //     color: categoryInfo.color,
    //     gradient: categoryInfo.gradient,
    //     href: '#',
    //   });
    // });

    // 3. Add Imported Content
    importedNodes.forEach((node) => {
      const categoryInfo = CATEGORIES.find(c => c.id === 'imported')!;

      topics.push({
        id: node.id,
        type: 'imported',
        title: node.title,
        icon: node.icon,
        category: 'imported',
        level: 'Personalizado',
        progress: node.percentage,
        isLocked: false,
        isCompleted: node.percentage === 100,
        totalExercises: node.subtopics.reduce((acc, s) => acc + s.phrases.length, 0),
        completedExercises: Math.round((node.percentage / 100) * node.subtopics.reduce((acc, s) => acc + s.phrases.length, 0)),
        color: categoryInfo.color,
        gradient: categoryInfo.gradient,
        href: `/learn/imported/${node.id}`,
        metadata: {
          phrases: node.subtopics.reduce((acc, s) => acc + s.phrases.length, 0),
          subtopics: node.subtopics.length,
          source: 'imported',
        },
      });
    });

    return topics;
  }, [nodes, importedNodes, isNodeUnlocked]);

  // ============================================================
  // FILTERING
  // ============================================================

  const filteredTopics = useMemo(() => {
    return unifiedTopics.filter(topic => {
      const matchesSearch = searchQuery === '' ||
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || topic.category === selectedCategory;
      const matchesLocked = !showOnlyAvailable || !topic.isLocked;

      return matchesSearch && matchesCategory && matchesLocked;
    });
  }, [unifiedTopics, searchQuery, selectedCategory, showOnlyAvailable]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = unifiedTopics.length;
    const completed = unifiedTopics.filter(t => t.isCompleted).length;
    const inProgress = unifiedTopics.filter(t => !t.isCompleted && !t.isLocked && t.progress > 0).length;
    const available = unifiedTopics.filter(t => !t.isLocked).length;
    const locked = unifiedTopics.filter(t => t.isLocked).length;

    return { total, completed, inProgress, available, locked };
  }, [unifiedTopics]);

  const handleDeleteNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('¿Eliminar este contenido importado?')) {
      // Delete through store
      const { deleteNode } = useImportedNodesStore.getState();
      deleteNode(nodeId);
    }
  };

  // Avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-calm-bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Floating Import Button */}
      <Link href="/import" className="fixed top-20 right-4 z-50">
        <motion.div
          className="relative w-14 h-14 rounded-full cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r to-accent-500 to-sky-500"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            ✨
          </div>
        </motion.div>
      </Link>

      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-calm-bg-elevated rounded-2xl p-6 shadow-calm-lg backdrop-blur-md border border-calm-warm-100/40"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-calm-text-primary mb-1">
              Tu Camino de Aprendizaje
            </h1>
            <p className="text-sm text-calm-text-muted/80">
              {stats.total} temas • {stats.completed} completados • {stats.inProgress} en progreso
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-calm-bg-tertiary/40 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-accent-500 text-calm-text-primary shadow-resonance'
                  : 'text-calm-text-muted/70 hover:bg-calm-bg-tertiary/20'
              }`}
            >
              📊
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-accent-500 text-calm-text-primary shadow-resonance'
                  : 'text-calm-text-muted/70 hover:bg-calm-bg-tertiary/20'
              }`}
            >
              📋
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="w-full h-2 bg-calm-bg-tertiary/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-forge-gradient rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between mt-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-500" />
              <span className="text-calm-text-muted/80">
                Completados: {stats.completed}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-500" />
              <span className="text-calm-text-muted/80">
                En progreso: {stats.inProgress}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-calm-bg-tertiary/40" />
              <span className="text-calm-text-muted/80">
                Disponibles: {stats.available}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-calm-bg-tertiary" />
            <span className="text-calm-text-muted/80">
              Bloqueados: {stats.locked}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar temas, lecciones o contenido..."
            className="w-full px-6 py-4 pl-14 rounded-2xl bg-calm-bg-elevated/80 backdrop-blur-md border border-calm-warm-100/30 text-calm-text-primary placeholder:text-calm-text-muted/70 focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all shadow-calm-lg"
          />
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-calm-text-muted hover:text-calm-text-primary transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all flex items-center gap-2 ${
              !selectedCategory
                ? 'bg-accent-500 text-calm-text-primary shadow-resonance'
                : 'bg-calm-bg-elevated/80 text-calm-text-primary border border-calm-warm-100/30 hover:border-accent-500/50'
            }`}
          >
            <span>📚</span>
            <span>Todos ({stats.total})</span>
          </button>
          {CATEGORIES.map((cat) => {
            const count = unifiedTopics.filter(t => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-accent-500 text-calm-text-primary shadow-resonance'
                    : 'bg-calm-bg-elevated/80 text-calm-text-primary border border-calm-warm-100/30 hover:border-accent-500/50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Additional Options */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-calm-bg-elevated/80 border border-calm-warm-100/30">
          <span className="text-sm text-calm-text-primary font-medium">
            Mostrar solo disponibles
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
              showOnlyAvailable ? 'bg-accent-500' : 'bg-calm-bg-tertiary/40'
            }`}
          >
            <motion.div
              className="absolute top-1 w-6 h-6 rounded-full bg-calm-bg-elevated shadow-md"
              animate={{ left: showOnlyAvailable ? 'calc(100% - 28px)' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-calm-text-muted/70 text-center"
      >
        {searchQuery || selectedCategory
          ? `Mostrando ${filteredTopics.length} de ${unifiedTopics.length} temas`
          : `${filteredTopics.length} temas disponibles`
        }
      </motion.div>

      {/* Topics Grid/List */}
      <AnimatePresence mode="wait">
        {filteredTopics.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-20"
          >
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-xl text-calm-text-muted/70 mb-2">
              No se encontraron resultados
            </p>
            <p className="text-sm text-calm-text-muted/70 mb-6">
              Intenta con otros filtros o busca algo diferente
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="px-6 py-3 rounded-2xl bg-accent-500 text-calm-text-primary font-bold hover:bg-accent-500/90 transition-all shadow-calm-lg"
            >
              Limpiar filtros
            </button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredTopics.map((topic, index) => (
              <TopicCard key={topic.id} topic={topic} index={index} onDelete={handleDeleteNode} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filteredTopics.map((topic, index) => (
              <TopicRow key={topic.id} topic={topic} index={index} onDelete={handleDeleteNode} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

