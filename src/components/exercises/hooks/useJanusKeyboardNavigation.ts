/**
 * useJanusKeyboardNavigation - Custom hook para manejar navegación por teclado
 * en Janus Composer Exercise
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { KeyboardFocusState } from '@/services/janusKeyboardNavigationService';
import {
  getAdjacentColumnFocus,
  getAdjacentOptionFocus,
  processKeyboardEvent,
  initializeKeyboardFocus,
} from '@/services/janusKeyboardNavigationService';
import type { ComposingColumn } from '../janus/ComposingPhase';

// Tipos compartidos para evitar import circular
export interface ColumnSelection {
  columnId: string;
  optionId: string;
  value: string;
  translation?: string;
}

interface UseJanusKeyboardNavigationProps {
  phase: string;
  columns: ComposingColumn[];
  selections: Record<string, ColumnSelection>;
  generatedPhrase: string | null;
  onSelectOption: (columnId: string, option: { id: string; text: string; translation?: string }) => void;
  onClearSelection: (columnId: string) => void;
  onReset: () => void;
  onConfirmComposition: () => void;
}

export function useJanusKeyboardNavigation({
  phase,
  columns,
  selections,
  generatedPhrase,
  onSelectOption,
  onClearSelection,
  onReset,
  onConfirmComposition,
}: UseJanusKeyboardNavigationProps) {
  const [keyboardFocus, setKeyboardFocus] = useState<KeyboardFocusState>({
    columnId: null,
    optionId: null,
  });
  const [hoveredTranslation, setHoveredTranslation] = useState<string | null>(null);

  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Mover foco a una columna específica
  const moveFocusToColumn = useCallback((direction: 'next' | 'prev') => {
    const newFocus = getAdjacentColumnFocus(keyboardFocus, columns, direction);

    if (newFocus.columnId && newFocus.optionId) {
      setKeyboardFocus(newFocus);

      // Scroll al elemento
      setTimeout(() => {
        optionRefs.current[`${newFocus.columnId}-${newFocus.optionId}`]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 0);
    }
  }, [keyboardFocus, columns]);

  // Mover foco a una opción dentro de la columna actual
  const moveFocusToOption = useCallback((direction: 'next' | 'prev') => {
    const newFocus = getAdjacentOptionFocus(keyboardFocus, columns, direction);

    if (newFocus.optionId && newFocus.columnId) {
      setKeyboardFocus(newFocus);

      // Scroll al elemento
      setTimeout(() => {
        optionRefs.current[`${newFocus.columnId}-${newFocus.optionId}`]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 0);
    }
  }, [keyboardFocus, columns]);

  // Seleccionar la opción enfocada
  const selectFocusedOption = useCallback(() => {
    if (!keyboardFocus.columnId || !keyboardFocus.optionId) return;

    const column = columns.find(col => col.id === keyboardFocus.columnId);
    if (!column) return;

    const option = column.options.find(opt => opt.id === keyboardFocus.optionId);
    if (!option) return;

    onSelectOption(column.id, {
      id: option.id,
      text: option.text,
      ...(option.translation !== undefined && { translation: option.translation }),
    });

    // Auto-mover a la siguiente columna requerida
    const requiredTypes = ['subject', 'verb'];
    const nextRequiredColumn = columns.find((col, index) => {
      const colIndex = columns.findIndex(c => c.id === column.id);
      return index > colIndex && requiredTypes.includes(col.type) && !selections[col.id];
    });

    if (nextRequiredColumn) {
      const firstOption = nextRequiredColumn.options[0];
      setKeyboardFocus({
        columnId: nextRequiredColumn.id,
        optionId: firstOption?.id || null,
      });
    }
  }, [keyboardFocus, columns, selections, onSelectOption]);

  // Manejar teclas de navegación
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const result = processKeyboardEvent({
      event,
      phase,
      currentFocus: keyboardFocus,
      columns,
      selections,
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
          onClearSelection(result.newFocus.columnId);
        }
        break;
      case 'clear_all':
        onReset();
        break;
      case 'submit':
        onConfirmComposition();
        break;
    }
  }, [phase, keyboardFocus, columns, selections, generatedPhrase, selectFocusedOption, onClearSelection, onReset, onConfirmComposition]);

  // Efecto para registrar eventos de teclado
  useEffect(() => {
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Inicializar foco en la primera columna al entrar en composing phase
  useEffect(() => {
    if (phase === 'composing' && !keyboardFocus.columnId && columns.length > 0) {
      setKeyboardFocus(initializeKeyboardFocus(columns));
    }
  }, [phase, keyboardFocus.columnId, columns]);

  return {
    keyboardFocus,
    hoveredTranslation,
    setHoveredTranslation,
    columnRefs,
    optionRefs,
  };
}
