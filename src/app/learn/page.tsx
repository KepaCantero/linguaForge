'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { useNodeProgressStore } from '@/store/useNodeProgressStore';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { useTreeProgressStore } from '@/store/useTreeProgressStore';
import { getTranslations } from '@/i18n';

// ============================================================
// UNIFIED CONTENT DATA STRUCTURE
// ============================================================

interface UnifiedTopic {
  id: string;
  type: 'a0-course' | 'imported' | 'coming-soon';
  title: string;
  description?: string;
  icon: string;
  category: string;
  subcategory?: string;
  level: string;
  progress: number;
  isLocked: boolean;
  isCompleted: boolean;
  totalExercises?: number;
  completedExercises?: number;
  color: string;
  gradient: string;
  href: string;
  metadata?: {
    phrases?: number;
    subtopics?: number;
    source?: string;
  };
}

// Category definitions with colors
const CATEGORIES = [
  { id: 'basics', name: 'Fundamentos', icon: '🎯', color: '#6366F1', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)' },
  { id: 'communication', name: 'Comunicación', icon: '💬', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
  { id: 'food', name: 'Comida', icon: '🍽️', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
  { id: 'travel', name: 'Viajes', icon: '✈️', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)' },
  { id: 'health', name: 'Salud', icon: '🏥', color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)' },
  { id: 'imported', name: 'Importado', icon: '📁', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
] as const;

// A0 Course nodes (structured content from the app)
const A0_COURSES = [
  { id: 'node-1', icon: '🏠', category: 'accommodation', title: 'Alojamiento', titleFr: 'Logement', description: 'Hoteles, Airbnb, reservas' },
  { id: 'node-2', icon: '🍽️', category: 'food', title: 'Restaurantes', titleFr: 'Restaurants', description: 'Pedir comida, menús, quejas' },
  { id: 'node-3', icon: '🚇', category: 'transport', title: 'Transporte', titleFr: 'Transport', description: 'Metro, taxi, direcciones' },
  { id: 'node-4', icon: '🏥', category: 'health', title: 'Salud', titleFr: 'Santé', description: 'Farmacia, doctor, emergencias' },
  { id: 'node-5', icon: '🆘', category: 'recovery', title: 'Recuperación', titleFr: 'Récupération', description: 'Perdido, policía, ayuda' },
] as const;

// Coming soon placeholders
const COMING_SOON_COURSES = [
  { id: 'coming-1', icon: '👋', category: 'basics', title: 'Saludos y Presentaciones', description: 'Aprender a presentarte y saludar' },
  { id: 'coming-2', icon: '🔢', category: 'basics', title: 'Números y Contar', description: 'Números del 0 al 1000+' },
  { id: 'coming-3', icon: '⏰', category: 'basics', title: 'Hora y Fechas', description: 'Decir la hora y las fechas' },
  { id: 'coming-4', icon: '👨‍👩‍👧‍👦', category: 'communication', title: 'Familia y Amigos', description: 'Describir a tu familia' },
  { id: 'coming-5', icon: '🛍️', category: 'basics', title: 'Compras', description: 'Tiendas, precios, pagar' },
];

export default function LearnPage() {
  const router = useRouter();
  const { appLanguage } = useUserStore();
  const { nodes, initGuidedNodes, isNodeUnlocked } = useNodeProgressStore();
  const { nodes: importedNodes, deleteNode } = useImportedNodesStore();
  const { treeProgress } = useTreeProgressStore();
  const t = getTranslations(appLanguage);
  const [isMounted, setIsMounted] = useState(false);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

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
    COMING_SOON_COURSES.forEach((course) => {
      const categoryInfo = CATEGORIES.find(c => c.id === course.category) || CATEGORIES[0];

      topics.push({
        id: course.id,
        type: 'coming-soon',
        title: course.title,
        description: course.description,
        icon: course.icon,
        category: categoryInfo.id,
        level: 'A0',
        progress: 0,
        isLocked: true,
        isCompleted: false,
        color: categoryInfo.color,
        gradient: categoryInfo.gradient,
        href: '#',
      });
    });

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
      <div className="min-h-screen bg-lf-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lf-primary" />
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
            className="absolute inset-0 rounded-full bg-gradient-to-r from-lf-primary to-lf-secondary"
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
        className="bg-glass-surface dark:bg-lf-soft/50 rounded-aaa-xl p-6 shadow-glass-xl backdrop-blur-aaa border border-lf-muted/20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-lf-dark dark:text-white mb-1">
              Tu Camino de Aprendizaje
            </h1>
            <p className="text-sm text-lf-muted dark:text-lf-muted/70">
              {stats.total} temas • {stats.completed} completados • {stats.inProgress} en progreso
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-lf-soft/50 dark:bg-lf-dark/30 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-lf-primary text-white shadow-resonance'
                  : 'text-lf-muted dark:text-lf-muted/70 hover:bg-lf-muted/20'
              }`}
            >
              📊
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-lf-primary text-white shadow-resonance'
                  : 'text-lf-muted dark:text-lf-muted/70 hover:bg-lf-muted/20'
              }`}
            >
              📋
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="w-full h-2 bg-lf-muted/20 dark:bg-lf-muted/40 rounded-full overflow-hidden">
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
              <div className="w-2 h-2 rounded-full bg-lf-success" />
              <span className="text-lf-muted dark:text-lf-muted/80">
                Completados: {stats.completed}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-lf-primary" />
              <span className="text-lf-muted dark:text-lf-muted/80">
                En progreso: {stats.inProgress}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-lf-muted/40" />
              <span className="text-lf-muted dark:text-lf-muted/80">
                Disponibles: {stats.available}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-lf-muted" />
            <span className="text-lf-muted dark:text-lf-muted/80">
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
            className="w-full px-6 py-4 pl-14 rounded-aaa-xl bg-glass-surface dark:bg-lf-soft/50 backdrop-blur-aaa border border-lf-muted/30 text-lf-dark dark:text-white placeholder:text-lf-muted/50 focus:ring-2 focus:ring-lf-primary/50 focus:border-lf-primary transition-all shadow-glass-xl"
          />
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-lf-muted hover:text-lf-dark dark:hover:text-white transition-colors"
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
                ? 'bg-lf-primary text-white shadow-resonance'
                : 'bg-glass-surface dark:bg-lf-soft/50 text-lf-dark dark:text-lf-muted border border-lf-muted/30 hover:border-lf-primary/50'
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
                    ? 'bg-lf-primary text-white shadow-resonance'
                    : 'bg-glass-surface dark:bg-lf-soft/50 text-lf-dark dark:text-lf-muted border border-lf-muted/30 hover:border-lf-primary/50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Additional Options */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-glass-surface dark:bg-lf-soft/50 border border-lf-muted/30">
          <span className="text-sm text-lf-dark dark:text-lf-muted font-medium">
            Mostrar solo disponibles
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
              showOnlyAvailable ? 'bg-lf-primary' : 'bg-lf-muted/30 dark:bg-lf-muted/50'
            }`}
          >
            <motion.div
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
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
        className="text-sm text-lf-muted dark:text-lf-muted/70 text-center"
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
            <p className="text-xl text-lf-muted dark:text-lf-muted/70 mb-2">
              No se encontraron resultados
            </p>
            <p className="text-sm text-lf-muted/50 dark:text-lf-muted/50 mb-6">
              Intenta con otros filtros o busca algo diferente
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="px-6 py-3 rounded-aaa-xl bg-lf-primary text-white font-bold hover:bg-lf-primary/90 transition-all shadow-glass-xl"
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

// ============================================================
// TOPIC CARD COMPONENT (Grid View)
// ============================================================

interface TopicCardProps {
  topic: UnifiedTopic;
  index: number;
  onDelete: (e: React.MouseEvent, nodeId: string) => void;
}

function TopicCard({ topic, index, onDelete }: TopicCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!topic.isLocked && topic.type !== 'coming-soon') {
      router.push(topic.href);
    }
  };

  const isComingSoon = topic.type === 'coming-soon';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 150 }}
      onClick={handleClick}
      className={`
        relative group cursor-pointer overflow-hidden rounded-aaa-xl
        ${topic.isLocked || isComingSoon ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Background gradient based on completion */}
      <div
        className={`
          absolute inset-0 transition-all duration-500
          ${topic.isCompleted
            ? 'bg-lf-success/10 dark:bg-lf-success/20'
            : topic.isLocked || isComingSoon
            ? 'bg-lf-muted/10 dark:bg-lf-muted/20'
            : 'bg-glass-surface dark:bg-lf-soft/50'
          }
        `}
      />

      {/* Animated border for completed topics */}
      {topic.isCompleted && (
        <motion.div
          className="absolute inset-0 rounded-aaa-xl border-2 border-lf-success"
          animate={{
            boxShadow: [
              '0 0 10px rgba(34, 197, 94, 0.3)',
              '0 0 20px rgba(34, 197, 94, 0.5)',
              '0 0 10px rgba(34, 197, 94, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Border for in-progress topics */}
      {!topic.isCompleted && !topic.isLocked && !isComingSoon && (
        <div className="absolute inset-0 rounded-aaa-xl border-2 border-lf-primary/30 dark:border-lf-primary/40" />
      )}

      {/* Border for locked topics */}
      {(topic.isLocked || isComingSoon) && (
        <div className="absolute inset-0 rounded-aaa-xl border border-lf-muted/30 dark:border-lf-muted/40" />
      )}

      {/* Content */}
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Icon */}
          <div className="relative">
            <motion.div
              className={`
                w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
                ${topic.isCompleted
                  ? 'bg-gradient-to-br from-lf-success to-lf-success-dark shadow-glow-success'
                  : topic.isLocked || isComingSoon
                  ? 'bg-lf-muted/30 dark:bg-lf-muted/50'
                  : 'shadow-depth-lg'
                }
              `}
              style={
                !topic.isCompleted && !topic.isLocked && !isComingSoon
                  ? { background: topic.gradient }
                  : undefined
              }
              whileHover={!topic.isLocked && !isComingSoon ? { scale: 1.05, rotate: 5 } : {}}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {topic.isLocked ? (
                <span className="text-lf-muted">🔒</span>
              ) : isComingSoon ? (
                <span className="text-lf-muted">🔜</span>
              ) : topic.isCompleted ? (
                <span className="text-white text-2xl">✓</span>
              ) : (
                topic.icon
              )}
            </motion.div>

            {/* Progress ring for non-locked topics */}
            {!topic.isLocked && !isComingSoon && topic.progress > 0 && !topic.isCompleted && (
              <svg className="absolute inset-0 rotate-[-90deg]" style={{ width: '100%', height: '100%' }}>
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.2)"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: topic.progress / 100 }}
                  transition={{ duration: 1, delay: index * 0.02 }}
                  style={{ strokeDasharray: '282.74', strokeDashoffset: '0' }}
                />
              </svg>
            )}
          </div>

          {/* Title and info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-lg text-lf-dark dark:text-white truncate">
                {topic.title}
              </h3>
              {/* Type badge */}
              <span className={`
                px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap
                ${topic.type === 'a0-course'
                  ? 'bg-lf-primary/20 dark:bg-lf-primary/30 text-lf-primary dark:text-lf-primary'
                  : topic.type === 'imported'
                  ? 'bg-lf-secondary/20 dark:bg-lf-secondary/30 text-lf-secondary dark:text-lf-secondary'
                  : 'bg-lf-muted/20 text-lf-muted/70'
                }
              `}>
                {topic.type === 'a0-course' ? '🎓 A0' : topic.type === 'imported' ? '📁 Importado' : '🔜 Próximamente'}
              </span>
            </div>

            {topic.description && (
              <p className="text-sm text-lf-muted dark:text-lf-muted/70 line-clamp-1 mb-2">
                {topic.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-lf-muted dark:text-lf-muted/60">
              <span className="px-2 py-0.5 rounded-md bg-lf-muted/20 dark:bg-lf-muted/30">
                {topic.level}
              </span>
              {topic.metadata?.phrases && (
                <>
                  <span>{topic.metadata.phrases} frases</span>
                  <span>•</span>
                  <span>{topic.metadata.subtopics} bloques</span>
                </>
              )}
              {topic.totalExercises && !isComingSoon && (
                <span>
                  {topic.completedExercises}/{topic.totalExercises} ejercicios
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {!isComingSoon && (
          <div className="space-y-2">
            <div className="relative h-2 bg-lf-muted/20 dark:bg-lf-muted/40 rounded-full overflow-hidden">
              <motion.div
                className={`
                  h-full rounded-full
                  ${topic.isCompleted
                    ? 'bg-lf-success'
                    : 'bg-gradient-to-r from-lf-primary to-lf-secondary'
                  }
                `}
                initial={{ width: 0 }}
                animate={{ width: `${topic.progress}%` }}
                transition={{ duration: 0.8, delay: index * 0.02 }}
              />
            </div>

            {/* Progress text */}
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${topic.isCompleted ? 'text-lf-success' : 'text-lf-primary'}`}>
                {isComingSoon ? 'Próximamente' : topic.isCompleted ? '✓ Completado' : `${topic.progress}%`}
              </span>
              {!topic.isLocked && !isComingSoon && (
                <span className="text-lf-muted dark:text-lf-muted/60">
                  {topic.progress === 0 ? 'Comenzar' : topic.isCompleted ? 'Repasar' : 'Continuar'} →
                </span>
              )}
            </div>
          </div>
        )}

        {/* Coming Soon Badge */}
        {isComingSoon && (
          <div className="flex items-center justify-center py-2">
            <span className="text-sm text-lf-muted dark:text-lf-muted/60">Próximamente</span>
          </div>
        )}

        {/* Delete button for imported content */}
        {topic.type === 'imported' && (
          <motion.button
            onClick={(e) => onDelete(e, topic.id)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-lf-error/20 hover:bg-lf-error text-lf-error hover:text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        )}

        {/* Glow effect for completed topics */}
        {topic.isCompleted && (
          <motion.div
            className="absolute inset-0 rounded-aaa-xl bg-gradient-to-r from-lf-success/20 to-lf-success/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// TOPIC ROW COMPONENT (List View)
// ============================================================

interface TopicRowProps {
  topic: UnifiedTopic;
  index: number;
  onDelete: (e: React.MouseEvent, nodeId: string) => void;
}

function TopicRow({ topic, index, onDelete }: TopicRowProps) {
  const router = useRouter();
  const isComingSoon = topic.type === 'coming-soon';

  const handleClick = () => {
    if (!topic.isLocked && !isComingSoon) {
      router.push(topic.href);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      onClick={handleClick}
      className={`
        relative group cursor-pointer overflow-hidden rounded-xl
        ${topic.isLocked || isComingSoon ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div
        className={`
          relative p-4 border-2 transition-all duration-300
          ${topic.isCompleted
            ? 'bg-lf-success/10 dark:bg-lf-success/20 border-lf-success/50 shadow-glow-success'
            : topic.isLocked || isComingSoon
            ? 'bg-lf-muted/10 dark:bg-lf-muted/20 border-lf-muted/30'
            : 'bg-glass-surface dark:bg-lf-soft/50 border-lf-primary/30 hover:border-lf-primary/50'
          }
        `}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <motion.div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0
              ${topic.isCompleted
                ? 'bg-gradient-to-br from-lf-success to-lf-success-dark'
                : topic.isLocked || isComingSoon
                ? 'bg-lf-muted/30 dark:bg-lf-muted/50'
                : ''
              }
            `}
            style={
              !topic.isCompleted && !topic.isLocked && !isComingSoon
                ? { background: topic.gradient }
                : undefined
            }
            whileHover={!topic.isLocked && !isComingSoon ? { scale: 1.05, rotate: 5 } : {}}
          >
            {topic.isLocked ? (
              <span className="text-lf-muted">🔒</span>
            ) : isComingSoon ? (
              <span className="text-lf-muted">🔜</span>
            ) : topic.isCompleted ? (
              <span className="text-white">✓</span>
            ) : (
              topic.icon
            )}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lf-dark dark:text-white truncate">
                {topic.title}
              </h3>
              <span className={`
                px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap
                ${topic.type === 'a0-course'
                  ? 'bg-lf-primary/20 text-lf-primary'
                  : topic.type === 'imported'
                  ? 'bg-lf-secondary/20 text-lf-secondary'
                  : 'bg-lf-muted/20 text-lf-muted/70'
                }
              `}>
                {topic.type === 'a0-course' ? 'A0' : topic.type === 'imported' ? 'Importado' : 'Próximamente'}
              </span>
            </div>

            {topic.description && (
              <p className="text-sm text-lf-muted dark:text-lf-muted/70 truncate">
                {topic.description}
              </p>
            )}
          </div>

          {/* Progress */}
          {!isComingSoon && (
            <div className="flex items-center gap-4">
              <div className="w-32">
                <div className="relative h-1.5 bg-lf-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    className={`
                      h-full rounded-full
                      ${topic.isCompleted ? 'bg-lf-success' : 'bg-lf-primary'}
                    `}
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.progress}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              <span className={`text-sm font-semibold whitespace-nowrap ${
                topic.isCompleted ? 'text-lf-success' : 'text-lf-primary'
              }`}>
                {topic.isCompleted ? '✓' : `${topic.progress}%`}
              </span>
              {!topic.isLocked && (
                <span className="text-lf-primary">→</span>
              )}
            </div>
          )}

          {/* Delete button for imported */}
          {topic.type === 'imported' && (
            <motion.button
              onClick={(e) => onDelete(e, topic.id)}
              className="w-8 h-8 rounded-full bg-lf-error/20 hover:bg-lf-error text-lf-error hover:text-white flex items-center justify-center text-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
