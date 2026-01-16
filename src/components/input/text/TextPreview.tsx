'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { TextImportData, DifficultyLevel } from '@/hooks/input/useTextImport';
import { DIFFICULTY_COLORS, PROGRESS_COLORS } from '@/lib/constants';
import { INPUT_COLORS } from '@/config/input';

// ============================================================
// TYPES
// ============================================================

export interface TextPreviewProps {
  data: TextImportData | null;
  isLoading: boolean;
  error: string | null;
  onAnalyze?: () => void;
  showAnalyzeButton?: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const READING_SPEED_WPM = 200; // Palabras por minuto

// Helper function to get difficulty config from centralized constants
function getDifficultyConfig(level: DifficultyLevel) {
  return DIFFICULTY_COLORS[level];
}

// ============================================================
// COMPONENTS
// ============================================================

/**
 * TextPreview - Panel de previsualización y análisis de texto
 *
 * Muestra:
 * - Estadísticas del texto (palabras, frases, idioma)
 * - Nivel de dificultad estimado
 * - Tiempo de lectura estimado
 * - Título sugerido
 * - Estado de carga y errores
 */
export function TextPreview({
  data,
  isLoading,
  error,
  onAnalyze,
  showAnalyzeButton = false,
}: TextPreviewProps) {
  const hasData = data !== null;
  const difficulty = data?.difficulty ? getDifficultyConfig(data.difficulty) : null;
  const readingTime = data ? Math.ceil(data.wordCount / READING_SPEED_WPM) : 0;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Análisis del Texto</h2>
        {showAnalyzeButton && onAnalyze && (
          <motion.button
            onClick={onAnalyze}
            disabled={isLoading}
            className={`px-4 py-2 ${INPUT_COLORS.text.bgDark} hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Analizando...' : 'Analizar'}
          </motion.button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <LoadingState />
      )}

      {/* Error State */}
      <AnimatePresence>
        {error && !isLoading && (
          <ErrorState message={error} />
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {!hasData && !isLoading && !error && (
          <EmptyState />
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      <AnimatePresence>
        {hasData && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Main Stats Grid */}
            <StatsGrid
              wordCount={data.wordCount}
              phraseCount={data.phraseCount}
              readingTime={readingTime}
              blockCount={data.blocks.length}
            />

            {/* Difficulty Badge */}
            {difficulty && (
              <DifficultyBadge
                difficulty={data.difficulty}
                config={difficulty}
              />
            )}

            {/* Language and Title */}
            <MetadataSection
              language={data.language}
              suggestedTitle={data.suggestedTitle}
            />

            {/* Blocks Preview */}
            {data.blocks.length > 0 && (
              <BlocksPreview blocks={data.blocks} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-calm-bg-elevated/50 border border-calm-warm-200/50 rounded-xl text-center"
    >
      <div className="inline-flex items-center gap-3 text-calm-text-muted">
        <motion.div
          className={`w-5 h-5 border-2 ${INPUT_COLORS.text.borderColor.replace('/30', '')} border-t-transparent rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <span>Analizando texto...</span>
      </div>
    </motion.div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl"
    >
      <div className="flex items-start gap-3">
        <span className="text-red-400 text-xl">⚠️</span>
        <div>
          <p className="text-red-400 font-medium">Error</p>
          <p className="text-red-300/80 text-sm mt-1">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 bg-calm-bg-elevated/30 border border-dashed border-calm-warm-200/30 rounded-xl text-center"
    >
      <span className="text-4xl mb-3 block opacity-50">📝</span>
      <p className="text-calm-text-muted">
        Pega un texto para ver el análisis aquí
      </p>
      <p className="text-calm-text-muted/70 text-sm mt-1">
        Mínimo 20 caracteres, máximo 10,000
      </p>
    </motion.div>
  );
}

interface StatsGridProps {
  wordCount: number;
  phraseCount: number;
  readingTime: number;
  blockCount: number;
}

function StatsGrid({ wordCount, phraseCount, readingTime, blockCount }: StatsGridProps) {
  // Use centralized colors for stats
  const stats = [
    { label: 'Palabras', value: wordCount.toLocaleString(), icon: '📄', color: INPUT_COLORS.sky[400] },
    { label: 'Frases', value: phraseCount.toLocaleString(), icon: '💬', color: INPUT_COLORS.sky[400] },
    { label: 'Lectura', value: `~${readingTime} min`, icon: '⏱️', color: INPUT_COLORS.amber[400] },
    { label: 'Bloques', value: blockCount.toString(), icon: '📦', color: INPUT_COLORS.purple[400] },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-calm-bg-elevated/50 border border-calm-warm-200/30 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">{stat.icon}</span>
            <span className="text-xs text-calm-text-muted">{stat.label}</span>
          </div>
          <p className={`text-lg font-bold ${stat.color}`}>
            {stat.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function DifficultyBadge({
  difficulty,
  config,
}: {
  difficulty: DifficultyLevel;
  config: typeof DIFFICULTY_COLORS[keyof typeof DIFFICULTY_COLORS];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg border
        ${config.bgColor} ${config.borderColor}
      `}
    >
      <span className="text-lg" aria-hidden="true">{config.icon}</span>
      <div>
        <p className="text-xs text-calm-text-muted">Dificultad estimada</p>
        <p className={`font-semibold ${config.color}`}>{config.label}</p>
      </div>
    </motion.div>
  );
}

function MetadataSection({
  language,
  suggestedTitle,
}: {
  language: string;
  suggestedTitle: string;
}) {
  const languageNames: Record<string, string> = {
    'fr': 'Francés',
    'fr-FR': 'Francés',
    'en': 'Inglés',
    'es': 'Español',
    'de': 'Alemán',
    'it': 'Italiano',
  };

  return (
    <div className="space-y-2">
      <div className="p-3 bg-calm-bg-elevated/30 border border-calm-warm-200/20 rounded-lg">
        <p className="text-xs text-calm-text-muted mb-1">Título sugerido</p>
        <p className="text-white font-medium">{suggestedTitle || 'Sin título'}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-calm-text-muted">
        <span>🌍</span>
        <span>Idioma detectado: <strong className="text-white">{languageNames[language] || language}</strong></span>
      </div>
    </div>
  );
}

function BlocksPreview({ blocks }: { blocks: Array<{ id: string; content: string; wordCount: number }> }) {
  const previewBlocks = blocks.slice(0, 3);
  const hasMore = blocks.length > 3;

  return (
    <div className="space-y-2">
      <p className="text-sm text-calm-text-muted">
        Vista previa de bloques ({blocks.length} total)
      </p>
      <div className="space-y-2">
        {previewBlocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 bg-calm-bg-elevated/30 border border-calm-warm-200/20 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-calm-text-muted">Bloque {index + 1}</span>
              <span className={`text-xs ${INPUT_COLORS.text.textColor}`}>{block.wordCount} palabras</span>
            </div>
            <p className="text-sm text-calm-text-primary line-clamp-2">
              {block.content}
            </p>
          </motion.div>
        ))}
      </div>
      {hasMore && (
        <p className="text-xs text-calm-text-muted text-center">
          ... y {blocks.length - 3} bloques más
        </p>
      )}
    </div>
  );
}
