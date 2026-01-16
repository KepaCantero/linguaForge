'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WordWithContext, SentenceContext } from '@/types/word';

// ============================================================
// INTERFACES
// ============================================================

interface SentenceHighlighterProps {
  sentence: SentenceContext;
  selectedWordId?: string;
  onWordClick?: (word: WordWithContext) => void;
  disabledWordIds?: string[];
  className?: string;
}

interface WordRenderProps {
  word: WordWithContext;
  isSelected: boolean;
  isDisabled: boolean;
  onClick?: () => void;
}

// ============================================================
// CONSTANTES
// ============================================================

const WORD_VARIANT_HIGHLIGHT = 'highlight' as const;
const WORD_VARIANT_SELECTED = 'selected' as const;
const WORD_VARIANT_DISABLED = 'disabled' as const;
const WORD_VARIANT_NORMAL = 'normal' as const;

type WordVariant = typeof WORD_VARIANT_HIGHLIGHT
  | typeof WORD_VARIANT_SELECTED
  | typeof WORD_VARIANT_DISABLED
  | typeof WORD_VARIANT_NORMAL;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Determina la variante de estilo para una palabra
 */
function getWordVariant(
  word: WordWithContext,
  selectedWordId?: string,
  disabledWordIds?: string[]
): WordVariant {
  // Si está deshabilitada
  if (disabledWordIds?.includes(word.id)) {
    return WORD_VARIANT_DISABLED;
  }

  // Si está seleccionada
  if (word.id === selectedWordId) {
    return WORD_VARIANT_SELECTED;
  }

  return WORD_VARIANT_NORMAL;
}

/**
 * Obtiene las clases CSS para una palabra según su variante
 */
function getWordClassName(variant: WordVariant): string {
  const baseClasses = 'inline-block transition-all duration-200 cursor-default ';

  switch (variant) {
    case WORD_VARIANT_SELECTED:
      return baseClasses + 'bg-accent-500 text-white font-semibold rounded px-1.5 py-0.5 scale-105 shadow-md';
    case WORD_VARIANT_DISABLED:
      return baseClasses + 'text-calm-text-muted dark:text-calm-text-muted opacity-60';
    case WORD_VARIANT_NORMAL:
      return baseClasses + 'text-calm-text-primary dark:text-calm-text-secondary hover:bg-accent-100 dark:hover:bg-accent-900/30 rounded px-1 transition-colors cursor-pointer';
    default:
      return baseClasses;
  }
}

/**
 * Obtiene el título para una palabra
 */
function getWordTitle(word: WordWithContext, variant: WordVariant): string {
  const posLabel = {
    noun: 'Sustantivo',
    verb: 'Verbo',
    adverb: 'Adverbio',
    adjective: 'Adjetivo',
    other: 'Otro',
  }[word.pos];

  const confidencePercent = Math.round(word.confidence * 100);

  if (variant === WORD_VARIANT_DISABLED) {
    return `${posLabel} - Ya estudiada`;
  }

  if (variant === WORD_VARIANT_SELECTED) {
    return `${posLabel} - Seleccionada (Confianza: ${confidencePercent}%)`;
  }

  return `${posLabel} - Click para seleccionar (Confianza: ${confidencePercent}%)`;
}

/**
 * Obtiene el color del badge POS
 */
function getPosBadgeColor(pos: WordWithContext['pos']): string {
  const colors = {
    noun: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    verb: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    adverb: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    adjective: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  };

  return colors[pos] || colors.other;
}

/**
 * Calcula índices de palabras para resaltado de contexto
 */
function calculateContextIndices(
  selectedIndex: number,
  totalWords: number,
  contextRadius: number = 3
): { startIndex: number; endIndex: number } {
  const startIndex = Math.max(0, selectedIndex - contextRadius);
  const endIndex = Math.min(totalWords - 1, selectedIndex + contextRadius);

  return { startIndex, endIndex };
}

// ============================================================
// WORD RENDER COMPONENT
// ============================================================

function WordRender({ word, isSelected, isDisabled, onClick }: WordRenderProps) {
  const variant = isDisabled
    ? WORD_VARIANT_DISABLED
    : isSelected
      ? WORD_VARIANT_SELECTED
      : WORD_VARIANT_NORMAL;

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={isDisabled ? {} : { scale: 1.05 }}
      whileTap={isDisabled ? {} : { scale: 0.95 }}
      className={getWordClassName(variant)}
      onClick={handleClick}
      title={getWordTitle(word, variant)}
    >
      {word.word}
    </motion.span>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SentenceHighlighter({
  sentence,
  selectedWordId,
  onWordClick,
  disabledWordIds = [],
  className = '',
}: SentenceHighlighterProps) {
  // Encontrar índice de palabra seleccionada
  const selectedIndex = useMemo(() => {
    if (!selectedWordId) return -1;
    return sentence.words.findIndex(w => w.id === selectedWordId);
  }, [sentence.words, selectedWordId]);

  // Calcular contexto de palabras vecinas
  const contextIndices = useMemo(() => {
    if (selectedIndex === -1) {
      return { startIndex: 0, endIndex: sentence.words.length - 1 };
    }
    return calculateContextIndices(selectedIndex, sentence.words.length, 3);
  }, [selectedIndex, sentence.words.length]);

  // Renderizar oración con palabras resaltadas
  const renderSentence = () => {
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < sentence.words.length; i++) {
      const word = sentence.words[i];
      const isSelected = word.id === selectedWordId;
      const isDisabled = disabledWordIds.includes(word.id);

      // Añadir espacio entre palabras
      if (i > 0) {
        elements.push(<span key={`space-${i}`}> </span>);
      }

      // Renderizar palabra
      elements.push(
        <WordRender
          key={word.id}
          word={word}
          isSelected={isSelected}
          isDisabled={isDisabled}
          onClick={() => onWordClick?.(word)}
        />
      );
    }

    return elements;
  };

  // Obtener palabra seleccionada para mostrar detalles
  const selectedWord = selectedWordId
    ? sentence.words.find(w => w.id === selectedWordId)
    : undefined;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Oración con palabras resaltadas */}
      <div className="bg-white dark:bg-calm-bg-elevated rounded-lg p-4 border border-calm-warm-100 dark:border-calm-warm-200 shadow-sm">
        <p className="text-base leading-relaxed text-calm-text-primary dark:text-calm-text-secondary">
          <AnimatePresence mode="wait">
            {renderSentence()}
          </AnimatePresence>
        </p>
      </div>

      {/* Detalles de palabra seleccionada */}
      {selectedWord && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-accent-50 dark:bg-accent-900/20 rounded-lg p-4 border border-accent-200 dark:border-accent-800"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Palabra y lemma */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-lg font-bold text-accent-900 dark:text-accent-100">
                  {selectedWord.word}
                </h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPosBadgeColor(selectedWord.pos)}`}
                >
                  {
                    {
                      noun: 'Sustantivo',
                      verb: 'Verbo',
                      adverb: 'Adverbio',
                      adjective: 'Adjetivo',
                      other: 'Otro',
                    }[selectedWord.pos]
                  }
                </span>
              </div>

              {/* Lemma */}
              {selectedWord.lemma !== selectedWord.word.toLowerCase() && (
                <p className="text-sm text-accent-700 dark:text-accent-300 mb-1">
                  <span className="font-medium">Forma base:</span> {selectedWord.lemma}
                </p>
              )}

              {/* Contexto de oración */}
              <div className="mt-3 pt-3 border-t border-accent-200 dark:border-accent-700">
                <p className="text-xs text-accent-600 dark:text-accent-400 mb-1">Contexto:</p>
                <p className="text-sm text-accent-800 dark:text-accent-200 italic">
                  &ldquo;{selectedWord.sentence}&rdquo;
                </p>
              </div>
            </div>

            {/* Métricas */}
            <div className="text-right">
              <div className="mb-2">
                <p className="text-xs text-accent-600 dark:text-accent-400">Confianza</p>
                <p className="text-lg font-bold text-accent-900 dark:text-accent-100">
                  {Math.round(selectedWord.confidence * 100)}%
                </p>
              </div>

              <div className="text-xs text-accent-600 dark:text-accent-400">
                <p>Posición: #{selectedWord.position.word + 1}</p>
                <p>Oración: #{selectedWord.position.sentence + 1}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Estadísticas de la oración */}
      {!selectedWord && (
        <div className="flex items-center justify-between text-xs text-calm-text-muted dark:text-calm-text-muted px-2">
          <span>
            {sentence.wordCount} {sentence.wordCount === 1 ? 'palabra' : 'palabras'}
          </span>
          <span>
            Oración #{sentence.wordCount}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// VARIANTS
// ============================================================

/**
 * Variante compacta para espacios pequeños
 */
export function SentenceHighlighterCompact(props: SentenceHighlighterProps) {
  return (
    <SentenceHighlighter
      {...props}
      className="text-sm"
    />
  );
}

/**
 * Variante con estadísticas detalladas
 */
export function SentenceHighlighterWithStats(props: SentenceHighlighterProps) {
  const { sentence } = props;

  // Calcular distribución POS
  const posDistribution = useMemo(() => {
    const dist: Record<string, number> = {
      noun: 0,
      verb: 0,
      adverb: 0,
      adjective: 0,
      other: 0,
    };

    sentence.words.forEach(word => {
      dist[word.pos]++;
    });

    return dist;
  }, [sentence.words]);

  return (
    <div className="space-y-4">
      <SentenceHighlighter {...props} />

      {/* Estadísticas POS */}
      <div className="bg-white dark:bg-calm-bg-elevated rounded-lg p-3 border border-calm-warm-100 dark:border-calm-warm-200">
        <h5 className="text-xs font-semibold text-calm-text-secondary dark:text-calm-text-tertiary mb-2">
          Distribución gramatical
        </h5>
        <div className="flex flex-wrap gap-2">
          {Object.entries(posDistribution).map(([pos, count]) => (
            count > 0 && (
              <span
                key={pos}
                className={`text-xs px-2 py-1 rounded ${getPosBadgeColor(pos as any)}`}
              >
                {
                  {
                    noun: 'Sustantivos',
                    verb: 'Verbos',
                    adverb: 'Adverbios',
                    adjective: 'Adjetivos',
                    other: 'Otros',
                  }[pos]
                }: {count}
              </span>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
