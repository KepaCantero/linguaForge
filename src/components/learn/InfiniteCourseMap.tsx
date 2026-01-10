'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import type { TranslationKeys } from '@/i18n';

// Expanded node system with hundreds of topics
interface TopicNode {
  id: string;
  icon: string;
  title: string;
  category: string;
  subcategory?: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  progress: number;
  isLocked: boolean;
  isCompleted: boolean;
  xpReward: number;
  color: string;
  gradient: string;
}

// Topic categories for organization
const TOPIC_CATEGORIES = [
  { id: 'basics', name: 'Bases', icon: '🎯', color: '#6366F1', gradient: 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)' },
  { id: 'food', name: 'Comida', icon: '🍽️', color: '#F59E0B', gradient: 'radial-gradient(circle at 30% 30%, #F59E0B, #D97706)' },
  { id: 'travel', name: 'Viajes', icon: '✈️', color: '#10B981', gradient: 'radial-gradient(circle at 30% 30%, #10B981, #059669)' },
  { id: 'business', name: 'Negocios', icon: '💼', color: '#3B82F6', gradient: 'radial-gradient(circle at 30% 30%, #3B82F6, #2563EB)' },
  { id: 'health', name: 'Salud', icon: '🏥', color: '#EF4444', gradient: 'radial-gradient(circle at 30% 30%, #EF4444, #DC2626)' },
  { id: 'culture', name: 'Cultura', icon: '🎨', color: '#8B5CF6', gradient: 'radial-gradient(circle at 30% 30%, #8B5CF6, #7C3AED)' },
  { id: 'sports', name: 'Deportes', icon: '⚽', color: '#EC4899', gradient: 'radial-gradient(circle at 30% 30%, #EC4899, #DB2777)' },
  { id: 'technology', name: 'Tecnología', icon: '💻', color: '#06B6D4', gradient: 'radial-gradient(circle at 30% 30%, #06B6D4, #0891B2)' },
  { id: 'nature', name: 'Naturaleza', icon: '🌿', color: '#22C55E', gradient: 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)' },
  { id: 'relationships', name: 'Relaciones', icon: '❤️', color: '#F43F5E', gradient: 'radial-gradient(circle at 30% 30%, #F43F5E, #E11D48)' },
];

// Generate hundreds of realistic topics
const generateTopicNodes = (): TopicNode[] => {
  const nodes: TopicNode[] = [];
  let nodeIdCounter = 1;

  const topicTemplates = [
    { category: 'basics', topics: ['Saludos', 'Presentarse', 'Números', 'Colores', 'Tiempo', 'Días', 'Meses', 'Alfabeto', 'Pronunciación', 'Acentos'] },
    { category: 'food', topics: ['Restaurantes', 'Recetas', 'Ingredientes', 'Bebidas', 'Postres', 'Vinos', 'Quesos', 'Panadería', 'Mercados', 'Dieta'] },
    { category: 'travel', topics: ['Aeropuertos', 'Hoteles', 'Transporte', 'Direcciones', 'Turismo', 'Playas', 'Montañas', 'Ciudades', 'Museos', 'Aduanas'] },
    { category: 'business', topics: ['Reuniones', 'Negociaciones', 'Presentaciones', 'Emails', 'CV', 'Entrevistas', 'Networking', 'Proyectos', 'Presupuestos', 'Jefatura'] },
    { category: 'health', topics: ['Doctor', 'Farmacia', 'Hospital', 'Seguros', 'Síntomas', 'Ejercicio', 'Nutrición', 'Salud Mental', 'Emergencias', 'Tratamientos'] },
    { category: 'culture', topics: ['Cine', 'Música', 'Arte', 'Literatura', 'Historia', 'Monumentos', 'Festivales', 'Gastronomía', 'Moda', 'Religión'] },
    { category: 'sports', topics: ['Fútbol', 'Tenis', 'Rugby', 'Ciclismo', 'Natación', 'Esquí', 'Atletismo', 'Gimnasio', 'Yoga', 'Meditación'] },
    { category: 'technology', topics: ['Software', 'Hardware', 'Internet', 'Apps', 'Redes', 'Programación', 'IA', 'Smartphones', 'Gadgets', 'Seguridad'] },
    { category: 'nature', topics: ['Animales', 'Plantas', 'Clima', 'Ecología', 'Jardín', 'Parques', 'Montañas', 'Ríos', 'Desiertos', 'Bosques'] },
    { category: 'relationships', topics: ['Familia', 'Amigos', 'Pareja', 'Amor', 'Bodas', 'Divorcio', 'Hijos', 'Padres', 'Abuelos', 'Vecinos'] },
  ];

  const levels: Array<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'> = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  topicTemplates.forEach(({ category, topics }) => {
    const categoryInfo = TOPIC_CATEGORIES.find(c => c.id === category);
    if (!categoryInfo) return;

    topics.forEach((topic, index) => {
      levels.forEach((level, levelIndex) => {
        // First A1 of each category is unlocked, others are progressively locked
        const isFirstA1 = level === 'A1' && index === 0;
        const isProgressivelyUnlocked = levelIndex === 0 || Math.random() > 0.6;

        nodes.push({
          id: `node-${nodeIdCounter++}`,
          icon: categoryInfo.icon,
          title: topic, // Remove level from title for cleaner display
          category,
          subcategory: topic,
          level,
          progress: isFirstA1 ? Math.floor(Math.random() * 30) : 0,
          isLocked: !isFirstA1 && !isProgressivelyUnlocked,
          isCompleted: isFirstA1 && Math.random() > 0.9,
          xpReward: (levels.indexOf(level) + 1) * 50,
          color: categoryInfo.color,
          gradient: categoryInfo.gradient,
        });
      });
    });
  });

  return nodes;
};

interface InfiniteCourseMapProps {
  translations: TranslationKeys;
  userProgress?: Record<string, any>; // Accept any progress format
}

export function InfiniteCourseMap({ translations, userProgress }: InfiniteCourseMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [visibleNodes, setVisibleNodes] = useState(50); // Load nodes in batches
  const [isLoading, setIsLoading] = useState(false);
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(true);

  const allNodes = useMemo(() => generateTopicNodes(), []);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter nodes based on search and filters
  const filteredNodes = useMemo(() => {
    return allNodes.filter(node => {
      const matchesSearch = searchQuery === '' ||
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || node.category === selectedCategory;
      const matchesLevel = !selectedLevel || node.level === selectedLevel;
      const matchesLocked = !showOnlyUnlocked || !node.isLocked;

      return matchesSearch && matchesCategory && matchesLevel && matchesLocked;
    });
  }, [allNodes, searchQuery, selectedCategory, selectedLevel, showOnlyUnlocked]);

  // Stats
  const stats = useMemo(() => {
    const total = allNodes.length;
    const completed = allNodes.filter(n => n.isCompleted).length;
    const inProgress = allNodes.filter(n => !n.isCompleted && !n.isLocked).length;
    const locked = allNodes.filter(n => n.isLocked).length;
    const totalXP = allNodes.reduce((acc, n) => acc + (n.isCompleted ? n.xpReward : 0), 0);

    return { total, completed, inProgress, locked, totalXP };
  }, [allNodes]);

  // Load more nodes on scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.8 && visibleNodes < filteredNodes.length) {
      setIsLoading(true);
      // Simulate loading delay
      setTimeout(() => {
        setVisibleNodes(prev => Math.min(prev + 20, filteredNodes.length));
        setIsLoading(false);
      }, 500);
    }
  }, [filteredNodes.length, visibleNodes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const displayedNodes = filteredNodes.slice(0, visibleNodes);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold text-white mb-2">
          {translations.learn?.title || 'Aprende Francés'}
        </h2>
        <p className="text-sm text-lf-muted mb-4">
          {stats.total} temas disponibles • {stats.completed} completados • {stats.totalXP} XP ganado
        </p>

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300">
            {stats.completed} ✓
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300">
            {stats.inProgress} 📚
          </div>
          <div className="px-3 py-1 rounded-full bg-gray-500/20 border border-gray-500/30 text-gray-300">
            {stats.locked} 🔒
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 mb-6"
      >
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar temas (ej. restaurantes, viajes, salud...)"
            className="w-full px-6 py-4 pl-14 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-lf-accent focus:border-transparent"
          />
          <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
              !selectedCategory
                ? 'bg-lf-accent text-lf-dark'
                : 'bg-glass-surface backdrop-blur-aaa border border-white/20 text-white hover:bg-white/10'
            }`}
          >
            Todos ({stats.total})
          </button>
          {TOPIC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-lf-accent text-lf-dark'
                  : 'bg-glass-surface backdrop-blur-aaa border border-white/20 text-white hover:bg-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Level Filters */}
        <div className="flex gap-2">
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedLevel === level
                  ? 'bg-lf-primary text-white'
                  : 'bg-glass-surface backdrop-blur-aaa border border-white/20 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Show Only Unlocked Toggle */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-glass-surface backdrop-blur-aaa border border-white/20">
          <span className="text-sm text-white font-semibold">Mostrar solo disponibles</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
              showOnlyUnlocked ? 'bg-lf-primary' : 'bg-white/20'
            }`}
            aria-label={showOnlyUnlocked ? 'Mostrar todos' : 'Mostrar solo disponibles'}
          >
            <motion.div
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
              animate={{ left: showOnlyUnlocked ? 'calc(100% - 28px)' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Results count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-sm text-lf-muted"
      >
        {searchQuery || selectedCategory || selectedLevel
          ? `Mostrando ${displayedNodes.length} de ${filteredNodes.length} temas`
          : `Mostrando ${Math.min(visibleNodes, filteredNodes.length)} de ${filteredNodes.length} temas (desliza para más)`
        }
      </motion.div>

      {/* Infinite Scroll Grid */}
      <div
        ref={containerRef}
        className="relative max-h-[60vh] overflow-y-auto pr-2"
        style={{
          scrollbarColor: 'rgba(99, 102, 241, 0.3) rgba(99, 102, 241, 0.1)',
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-8">
          {displayedNodes.map((node, index) => (
            <TopicOrb
              key={node.id}
              node={node}
              index={index}
              delay={index % 20}
            />
          ))}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <motion.div
              className="w-12 h-12 rounded-full border-4 border-lf-accent border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {/* End of results */}
        {!isLoading && displayedNodes.length >= filteredNodes.length && filteredNodes.length > 0 && (
          <div className="text-center py-8 text-lf-muted">
            <p className="text-4xl mb-2">🎉</p>
            <p>¡Has visto todos los {filteredNodes.length} temas!</p>
          </div>
        )}

        {/* No results */}
        {filteredNodes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-white/60">No se encontraron temas para &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSelectedLevel(null);
              }}
              className="mt-4 px-6 py-3 rounded-aaa-xl bg-lf-accent text-lf-dark font-bold"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Topic Orb Component
interface TopicOrbProps {
  node: TopicNode;
  index: number;
  delay: number;
}

function TopicOrb({ node, index, delay }: TopicOrbProps) {
  const isLocked = node.isLocked;
  const isCompleted = node.isCompleted;
  const isInProgress = !isLocked && !isCompleted && node.progress > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: (delay % 20) * 0.03,
        type: 'spring',
        stiffness: 150,
      }}
      className="relative"
    >
      <Link
        href={isLocked ? '#' : `/learn/node/${node.id}`}
        className={`block ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label={`${node.title} - ${node.level}${isLocked ? ' (bloqueado)' : ''}${isCompleted ? ' (completado)' : ''}`}
      >
        {/* Compact Topic Card */}
        <div className="relative group">
          {/* Lock overlay for locked nodes */}
          {isLocked && (
            <div className="absolute inset-0 rounded-xl bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center">
              <span className="text-xl">🔒</span>
            </div>
          )}

          {/* Card with glass effect */}
          <motion.div
            className={`
              rounded-xl p-3 border transition-all duration-300
              ${isLocked
                ? 'bg-lf-dark/50 border-white/10'
                : isCompleted
                ? 'bg-green-500/10 border-green-500/30'
                : isInProgress
                ? 'bg-orange-500/10 border-orange-500/30'
                : 'bg-glass-surface backdrop-blur-aaa border-white/20'
              }
            `}
            whileHover={!isLocked ? { scale: 1.02, borderColor: isCompleted ? '#22C55E' : isInProgress ? '#F59E0B' : node.color } : {}}
            transition={{ duration: 0.2 }}
          >
            {/* Icon + Title Row */}
            <div className="flex items-start gap-2 mb-2">
              {/* Compact icon circle */}
              <div className="relative w-10 h-10 flex-shrink-0">
                {/* Progress ring */}
                {!isLocked && (
                  <svg className="absolute inset-0 rotate-[-90deg]" style={{ width: '100%', height: '100%' }}>
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="2"
                    />
                    <motion.circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke={isCompleted ? '#22C55E' : '#FDE047'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: node.progress / 100 }}
                      transition={{ duration: 1, delay: delay * 0.05 }}
                      style={{
                        strokeDasharray: '282.74',
                        strokeDashoffset: '0',
                      }}
                    />
                  </svg>
                )}

                {/* Icon background */}
                <motion.div
                  className="absolute inset-0 rounded-lg flex items-center justify-center text-lg"
                  style={{
                    background: isLocked
                      ? 'radial-gradient(circle at 30% 30%, #334155, #1E293B)'
                      : isCompleted
                      ? 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)'
                      : isInProgress
                      ? 'radial-gradient(circle at 30% 30%, #F59E0B, #D97706)'
                      : node.gradient,
                  }}
                >
                  {node.icon}
                </motion.div>
              </div>

              {/* Title and level */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                  {node.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/80">
                    {node.level}
                  </span>
                  {!isLocked && (
                    <span className="text-xs text-white/60">
                      {isCompleted ? '✓ Completado' : `${node.progress}%`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* XP Reward for completed nodes */}
            {isCompleted && (
              <motion.div
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-lf-accent text-lf-dark text-xs font-bold flex items-center justify-center shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: delay * 0.1 }}
              >
                +{node.xpReward}
              </motion.div>
            )}

            {/* Glow effect on hover */}
            {!isLocked && (
              <motion.div
                className="absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity"
                style={{
                  background: isInProgress || isCompleted
                    ? `radial-gradient(circle, ${isCompleted ? 'rgba(34, 197, 94, 0.6)' : 'rgba(245, 158, 11, 0.6)'}, transparent)`
                    : `radial-gradient(circle, ${node.color}66, transparent)`,
                }}
              />
            )}
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}
