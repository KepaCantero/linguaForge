'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TextBlock } from '@/hooks/input/useTextImport';
import { INPUT_COLORS, INPUT_TYPE_COLORS } from '@/config/input';

// ============================================================
// TYPES
// ============================================================

export interface BlockSelectorProps {
  blocks: TextBlock[];
  onSelectionChange: (selectedBlocks: TextBlock[]) => void;
  maxSelectable?: number;
  showExercisePreview?: boolean;
  disabled?: boolean;
}

export interface SelectionState {
  [blockId: string]: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

// Exercise config using centralized colors
const EXERCISE_CONFIG = {
  cloze: { label: 'Espacios en blanco', icon: '🔤', color: INPUT_COLORS.sky[400] },
  variations: { label: 'Variaciones', icon: '🔄', color: INPUT_COLORS.sky[400] },
  conversationalEcho: { label: 'Eco conversacional', icon: '🔁', color: INPUT_COLORS.amber[400] },
  janusComposer: { label: 'Constructor de frases', icon: '🧩', color: INPUT_COLORS.purple[400] },
} as const;

// ============================================================
// COMPONENT
// ============================================================

/**
 * BlockSelector - Selector de bloques de texto para importar
 *
 * Características:
 * - Checkbox para cada bloque
 * - Selección individual o "select all"
 * - Vista previa de ejercicios por bloque
 * - Resumen de selección
 * - Límite máximo de selección
 */
export function BlockSelector({
  blocks,
  onSelectionChange,
  maxSelectable,
  showExercisePreview = true,
  disabled = false,
}: BlockSelectorProps) {
  const [selection, setSelection] = useState<SelectionState>({});
  const [showAll, setShowAll] = useState(false);

  // Calcular bloques seleccionados
  const selectedBlocks = useMemo(() => {
    return blocks.filter(block => selection[block.id]);
  }, [blocks, selection]);

  const selectedCount = selectedBlocks.length;
  const isAllSelected = selectedCount === blocks.length && blocks.length > 0;
  const isSomeSelected = selectedCount > 0 && selectedCount < blocks.length;
  const canSelectMore = !maxSelectable || selectedCount < maxSelectable;

  // Calcular ejercicios totales
  const totalExercises = useMemo(() => {
    return selectedBlocks.reduce((sum, block) => {
      return sum + Math.ceil(block.wordCount / 10); // ~1 ejercicio cada 10 palabras
    }, 0);
  }, [selectedBlocks]);

  // Manejar cambio de selección individual
  const handleToggleBlock = (blockId: string) => {
    if (disabled) return;

    const wasSelected = selection[blockId];
    if (wasSelected) {
      // Deseleccionar
      const newSelection = { ...selection, [blockId]: false };
      setSelection(newSelection);
      onSelectionChange(blocks.filter(b => newSelection[b.id]));
    } else if (canSelectMore) {
      // Seleccionar
      const newSelection = { ...selection, [blockId]: true };
      setSelection(newSelection);
      onSelectionChange(blocks.filter(b => newSelection[b.id]));
    }
  };

  // Manejar "select all"
  const handleToggleAll = () => {
    if (disabled) return;

    if (isAllSelected || isSomeSelected) {
      // Deseleccionar todos
      setSelection({});
      onSelectionChange([]);
    } else {
      // Seleccionar todos (respetando maxSelectable)
      const limit = maxSelectable || blocks.length;
      const newSelection: SelectionState = {};
      blocks.slice(0, limit).forEach(block => {
        newSelection[block.id] = true;
      });
      setSelection(newSelection);
      onSelectionChange(blocks.slice(0, limit));
    }
  };

  // Bloques a mostrar (con opción de "ver más")
  const displayedBlocks = showAll ? blocks : blocks.slice(0, 5);
  const hasMoreBlocks = blocks.length > 5;

  return (
    <div className="w-full space-y-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Seleccionar Bloques
          </h3>
          <p className="text-sm text-calm-text-muted">
            {selectedCount > 0
              ? `${selectedCount} de ${blocks.length} bloques seleccionados`
              : `${blocks.length} bloques disponibles`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Select All */}
          {blocks.length > 1 && (
            <motion.button
              onClick={handleToggleAll}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isAllSelected || isSomeSelected
                  ? `${INPUT_COLORS.amber[600]} text-white`
                  : 'bg-calm-bg-elevated hover:bg-calm-warm-200/20 text-calm-text-primary border border-calm-warm-200/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
            >
              {isAllSelected ? '✓ Todos' : isSomeSelected ? '✓ Algunos' : 'Seleccionar todos'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Resumen de selección */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <SelectionSummary
            selectedCount={selectedCount}
            totalWords={selectedBlocks.reduce((sum, b) => sum + b.wordCount, 0)}
            totalExercises={totalExercises}
          />
        )}
      </AnimatePresence>

      {/* Lista de bloques */}
      <div className="space-y-3">
        {displayedBlocks.map((block, index) => (
          <BlockCard
            key={block.id}
            block={block}
            isSelected={selection[block.id] || false}
            onToggle={() => handleToggleBlock(block.id)}
            showExercisePreview={showExercisePreview}
            disabled={disabled || (!selection[block.id] && !canSelectMore)}
            index={index}
          />
        ))}
      </div>

      {/* Botón "ver más" */}
      {hasMoreBlocks && !showAll && (
        <motion.button
          onClick={() => setShowAll(true)}
          className={`w-full py-2 text-sm ${INPUT_COLORS.sky[400]} hover:underline transition-colors`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Ver {blocks.length - 5} bloques más ↓
        </motion.button>
      )}

      {/* Advertencia de límite */}
      {maxSelectable && selectedCount >= maxSelectable && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 ${INPUT_COLORS.amber[900]} border ${INPUT_COLORS.amber.border} rounded-lg`}
        >
          <p className={`text-sm ${INPUT_COLORS.amber[400]}`}>
            ⚠️ Has alcanzado el límite de {maxSelectable} bloques
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

interface SelectionSummaryProps {
  selectedCount: number;
  totalWords: number;
  totalExercises: number;
}

function SelectionSummary({ selectedCount, totalWords, totalExercises }: SelectionSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 ${INPUT_TYPE_COLORS.video.bgDark.replace('bg-sky-500/10', 'bg-sky-900/20')} border ${INPUT_COLORS.sky[500].replace('bg-sky-500', 'border-sky-500/30')} rounded-xl`}
    >
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className={`text-2xl font-bold ${INPUT_COLORS.sky[400]}`}>{selectedCount}</p>
          <p className="text-xs text-sky-300/70">Bloques</p>
        </div>
        <div>
          <p className={`text-2xl font-bold ${INPUT_COLORS.sky[400]}`}>{totalWords.toLocaleString()}</p>
          <p className="text-xs text-sky-300/70">Palabras</p>
        </div>
        <div>
          <p className={`text-2xl font-bold ${INPUT_COLORS.amber[400]}`}>{totalExercises}</p>
          <p className="text-xs text-amber-300/70">Ejercicios</p>
        </div>
      </div>
    </motion.div>
  );
}

interface BlockCardProps {
  block: TextBlock;
  isSelected: boolean;
  onToggle: () => void;
  showExercisePreview: boolean;
  disabled: boolean;
  index: number;
}

function BlockCard({ block, isSelected, onToggle, showExercisePreview, disabled, index }: BlockCardProps) {
  // Estimar ejercicios para este bloque
  const exerciseCount = Math.ceil(block.wordCount / 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200
        ${isSelected
          ? `${INPUT_COLORS.text.bgSubtle} ${INPUT_COLORS.text.borderColor.replace('/30', '/50')}`
          : 'bg-calm-bg-elevated/50 border-calm-warm-200/50 hover:border-calm-warm-200'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={disabled ? undefined : onToggle}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {/* Checkbox */}
      <div className="flex items-start gap-4">
        <div className={`
          flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors
          ${isSelected
            ? `${INPUT_COLORS.text.bgDark} ${INPUT_COLORS.text.borderColor.replace('/30', '')}`
            : 'border-calm-warm-200 bg-calm-bg-tertiary'
          }
        `}>
          {isSelected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-white text-sm"
            >
              ✓
            </motion.span>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white">
              Bloque {index + 1}
            </h4>
            <div className="flex items-center gap-3 text-xs text-calm-text-muted">
              <span>{block.wordCount} palabras</span>
              <span>~{block.estimatedReadingTime}s lectura</span>
            </div>
          </div>

          <p className="text-sm text-calm-text-primary line-clamp-3 mb-3">
            {block.content}
          </p>

          {/* Ejercicios preview */}
          {showExercisePreview && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(EXERCISE_CONFIG).slice(0, 3).map(([key, config]) => {
                const count = Math.ceil(exerciseCount / 4);
                return (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md bg-calm-bg-tertiary ${config.color} text-xs`}
                  >
                    <span>{config.icon}</span>
                    <span>{count}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Glow effect cuando seleccionado */}
      {isSelected && (
        <motion.div
          className={`absolute inset-0 rounded-xl ${INPUT_COLORS.text.bgDark.replace('bg-', 'bg-').replace('-600', '/10')} pointer-events-none`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
}
