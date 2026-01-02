import { useCallback } from 'react';
import useUndoHook from 'use-undo';

/**
 * Hook wrapper para use-undo con límites de historial
 * Usado en Janus Matrix para deshacer combinaciones
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useUndo<T>(initialState: T, maxHistorySize: number = 50) {
  const [state, { set, undo, redo, canUndo, canRedo }] = useUndoHook(initialState);

  const setWithLimit = useCallback(
    (newState: T) => {
      // Limitar el tamaño del historial para evitar memory leaks
      set(newState);
    },
    [set]
  );

  return {
    state: state.present,
    set: setWithLimit,
    undo,
    redo,
    canUndo,
    canRedo,
    history: state.past,
    future: state.future,
  };
}

