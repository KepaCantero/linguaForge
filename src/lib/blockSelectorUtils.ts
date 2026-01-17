/**
 * Block Selector Utility Functions
 *
 * Extracts complex selection logic from BlockSelector component.
 */

import type { TextBlock } from '@/hooks/input/useTextImport';

// ============================================================
// TYPES
// ============================================================

export interface SelectionState {
  [blockId: string]: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_DISPLAY_LIMIT = 5;
const EXERCISES_PER_WORDS = 10; // ~1 exercise every 10 words

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Filter selected blocks from all blocks based on selection state
 */
export function getSelectedBlocks(blocks: TextBlock[], selection: SelectionState): TextBlock[] {
  return blocks.filter(block => selection[block.id]);
}

/**
 * Check if all blocks are selected
 */
export function isAllSelected(blocks: TextBlock[], selection: SelectionState): boolean {
  return blocks.length > 0 && getSelectedBlocks(blocks, selection).length === blocks.length;
}

/**
 * Check if some but not all blocks are selected
 */
export function isSomeSelected(blocks: TextBlock[], selection: SelectionState): boolean {
  const selectedCount = getSelectedBlocks(blocks, selection).length;
  return selectedCount > 0 && selectedCount < blocks.length;
}

/**
 * Check if more blocks can be selected
 */
export function canSelectMoreBlocks(blocks: TextBlock[], selection: SelectionState, maxSelectable?: number): boolean {
  const selectedCount = getSelectedBlocks(blocks, selection).length;
  return !maxSelectable || selectedCount < maxSelectable;
}

/**
 * Calculate total exercise count from selected blocks
 */
export function calculateTotalExercises(selectedBlocks: TextBlock[]): number {
  return selectedBlocks.reduce((sum, block) => {
    return sum + Math.ceil(block.wordCount / EXERCISES_PER_WORDS);
  }, 0);
}

/**
 * Calculate total word count from selected blocks
 */
export function calculateTotalWords(selectedBlocks: TextBlock[]): number {
  return selectedBlocks.reduce((sum, block) => sum + block.wordCount, 0);
}

/**
 * Calculate exercise count for a single block
 */
export function calculateBlockExerciseCount(block: TextBlock): number {
  return Math.ceil(block.wordCount / EXERCISES_PER_WORDS);
}

/**
 * Get blocks to display based on showAll flag
 */
export function getDisplayedBlocks(blocks: TextBlock[], showAll: boolean): TextBlock[] {
  return showAll ? blocks : blocks.slice(0, DEFAULT_DISPLAY_LIMIT);
}

/**
 * Check if there are more blocks to display
 */
export function hasMoreBlocks(blocks: TextBlock[], showAll: boolean): boolean {
  return !showAll && blocks.length > DEFAULT_DISPLAY_LIMIT;
}

/**
 * Create selection state for selecting all blocks (with optional limit)
 */
export function createSelectAllSelection(blocks: TextBlock[], maxSelectable: number | undefined): SelectionState {
  const limit = maxSelectable || blocks.length;
  const selection: SelectionState = {};
  blocks.slice(0, limit).forEach(block => {
    selection[block.id] = true;
  });
  return selection;
}

/**
 * Toggle a single block selection
 */
export function toggleBlockSelection(
  blocks: TextBlock[],
  selection: SelectionState,
  blockId: string,
  maxSelectable: number | undefined
): { newSelection: SelectionState; newSelectedBlocks: TextBlock[] } {
  const wasSelected = selection[blockId];

  if (wasSelected) {
    // Deselect
    const newSelection = { ...selection, [blockId]: false };
    const newSelectedBlocks = getSelectedBlocks(blocks, newSelection);
    return { newSelection, newSelectedBlocks };
  } else {
    // Select if allowed
    if (canSelectMoreBlocks(blocks, selection, maxSelectable)) {
      const newSelection = { ...selection, [blockId]: true };
      const newSelectedBlocks = getSelectedBlocks(blocks, newSelection);
      return { newSelection, newSelectedBlocks };
    }
    return { newSelection: selection, newSelectedBlocks: getSelectedBlocks(blocks, selection) };
  }
}

/**
 * Toggle all blocks selection
 */
export function toggleAllSelection(
  blocks: TextBlock[],
  selection: SelectionState,
  maxSelectable: number | undefined
): { newSelection: SelectionState; newSelectedBlocks: TextBlock[] } {
  const allSelected = isAllSelected(blocks, selection);
  const someSelected = isSomeSelected(blocks, selection);

  if (allSelected || someSelected) {
    // Deselect all
    return { newSelection: {}, newSelectedBlocks: [] };
  } else {
    // Select all (with limit)
    const newSelection = createSelectAllSelection(blocks, maxSelectable);
    const newSelectedBlocks = getSelectedBlocks(blocks, newSelection);
    return { newSelection, newSelectedBlocks };
  }
}

/**
 * Get select all button text
 */
export function getSelectAllText(allSelected: boolean, someSelected: boolean): string {
  if (allSelected) return '✓ Todos';
  if (someSelected) return '✓ Algunos';
  return 'Seleccionar todos';
}

/**
 * Get selection summary text
 */
export function getSelectionSummaryText(selectedCount: number, totalCount: number): string {
  if (selectedCount > 0) {
    return `${selectedCount} de ${totalCount} bloques seleccionados`;
  }
  return `${totalCount} bloques disponibles`;
}

/**
 * Get import button text for selected blocks
 */
export function getImportSelectedText(selectedCount: number, isImporting: boolean): string {
  if (isImporting) return '⏳ Importando...';
  return `📦 Importar ${selectedCount} bloque${selectedCount > 1 ? 's' : ''}`;
}
