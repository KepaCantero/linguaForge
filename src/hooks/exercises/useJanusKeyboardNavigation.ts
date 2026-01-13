'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { JanusComposerColumn } from '@/schemas/content';
import {
  getAdjacentColumnFocus,
  getAdjacentOptionFocus,
  processKeyboardEvent,
  initializeKeyboardFocus,
  type KeyboardFocusState,
} from '@/services/janusKeyboardNavigationService';

// ============================================
// TYPES
// ============================================

export interface UseJanusKeyboardNavigationParams {
  columns: JanusComposerColumn[];
  selections: Record<string, {
    columnId: string;
    optionId: string;
    value: string;
    translation?: string;
  }>;
  phase: string;
  generatedPhrase: string | null;
  onColumnClear?: (columnId: string) => void;
  onReset?: () => void;
  onConfirm?: () => void;
  onSelectFocused?: () => void;
}

export interface UseJanusKeyboardNavigationResult {
  keyboardFocus: KeyboardFocusState;
  columnRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
  optionRefs: React.RefObject<Record<string, HTMLButtonElement | null>>;
  moveFocusToColumn: (direction: 'next' | 'prev') => void;
  moveFocusToOption: (direction: 'next' | 'prev') => void;
  selectFocusedOption: () => void;
}

// ============================================
// HOOK
// ============================================

/**
 * Custom hook for keyboard navigation in Janus Composer exercise
 * Handles arrow key navigation, focus management, and keyboard shortcuts
 */
export function useJanusKeyboardNavigation({
  columns,
  selections,
  phase,
  generatedPhrase,
  onColumnClear,
  onReset,
  onConfirm,
  onSelectFocused,
}: UseJanusKeyboardNavigationParams): UseJanusKeyboardNavigationResult {
  const [keyboardFocus, setKeyboardFocus] = useState<KeyboardFocusState>({
    columnId: null,
    optionId: null,
  });

  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Move focus to adjacent column
  const moveFocusToColumn = useCallback((direction: 'next' | 'prev') => {
    const newFocus = getAdjacentColumnFocus(keyboardFocus, columns, direction);

    if (newFocus.columnId && newFocus.optionId) {
      setKeyboardFocus(newFocus);

      // Scroll to element
      setTimeout(() => {
        optionRefs.current[`${newFocus.columnId}-${newFocus.optionId}`]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 0);
    }
  }, [keyboardFocus, columns]);

  // Move focus within current column
  const moveFocusToOption = useCallback((direction: 'next' | 'prev') => {
    const newFocus = getAdjacentOptionFocus(keyboardFocus, columns, direction);

    if (newFocus.optionId && newFocus.columnId) {
      setKeyboardFocus(newFocus);

      // Scroll to element
      setTimeout(() => {
        optionRefs.current[`${newFocus.columnId}-${newFocus.optionId}`]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 0);
    }
  }, [keyboardFocus, columns]);

  // Select the currently focused option
  const selectFocusedOption = useCallback(() => {
    if (!keyboardFocus.columnId || !keyboardFocus.optionId) return;
    onSelectFocused?.();
  }, [keyboardFocus.columnId, keyboardFocus.optionId, onSelectFocused]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const result = processKeyboardEvent({
      event,
      phase,
      currentFocus: keyboardFocus,
      columns,
      canSubmit: !!generatedPhrase,
      canPreview: false,
    });

    if (result.preventDefault) {
      event.preventDefault();
    }

    if (result.newFocus) {
      setKeyboardFocus(result.newFocus);
    }

    switch (result.action) {
      case 'select_focused':
        selectFocusedOption();
        break;
      case 'clear_column':
        if (result.newFocus?.columnId) {
          onColumnClear?.(result.newFocus.columnId);
        }
        break;
      case 'clear_all':
        onReset?.();
        break;
      case 'submit':
        onConfirm?.();
        break;
    }
  }, [phase, keyboardFocus, columns, selections, generatedPhrase, selectFocusedOption, onColumnClear, onReset, onConfirm]);

  // Register keyboard event listeners
  useEffect(() => {
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Initialize focus on first column when entering composing phase
  useEffect(() => {
    if (phase === 'composing' && !keyboardFocus.columnId && columns.length > 0) {
      setKeyboardFocus(initializeKeyboardFocus(columns));
    }
  }, [phase, keyboardFocus.columnId, columns]);

  return {
    keyboardFocus,
    columnRefs,
    optionRefs,
    moveFocusToColumn,
    moveFocusToOption,
    selectFocusedOption,
  };
}

export default useJanusKeyboardNavigation;
