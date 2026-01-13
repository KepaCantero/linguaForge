export interface KeyboardFocusState {
  columnId: string | null;
  optionId: string | null;
}

export interface Column {
  id: string;
  type: string;
  options: Array<{ id: string; text: string; translation?: string }>;
}

export interface ColumnSelection {
  columnId: string;
  optionId: string;
  value: string;
  translation?: string;
}

/**
 * Moves focus between columns
 */
export function getAdjacentColumnIndex(
  currentIndex: number,
  direction: 'prev' | 'next',
  totalColumns: number
): number {
  if (direction === 'prev') {
    return currentIndex > 0 ? currentIndex - 1 : totalColumns - 1;
  }
  return (currentIndex + 1) % totalColumns;
}

/**
 * Gets the focus state for an adjacent column
 */
export function getAdjacentColumnFocus(
  currentFocus: KeyboardFocusState,
  columns: Column[],
  direction: 'prev' | 'next'
): KeyboardFocusState {
  if (!currentFocus.columnId) {
    // Focus first column if no focus
    return { columnId: columns[0]?.id || null, optionId: columns[0]?.options[0]?.id || null };
  }

  const currentIndex = columns.findIndex(c => c.id === currentFocus.columnId);
  if (currentIndex === -1) {
    return currentFocus;
  }

  const nextIndex = getAdjacentColumnIndex(currentIndex, direction, columns.length);
  const nextColumn = columns[nextIndex];

  return {
    columnId: nextColumn?.id || null,
    optionId: nextColumn?.options[0]?.id || null,
  };
}

/**
 * Moves focus between options within a column
 */
export function getAdjacentOptionFocus(
  currentFocus: KeyboardFocusState,
  columns: Column[],
  direction: 'prev' | 'next'
): KeyboardFocusState {
  if (!currentFocus.columnId || !currentFocus.optionId) {
    return currentFocus;
  }

  const column = columns.find(c => c.id === currentFocus.columnId);
  if (!column || column.options.length === 0) {
    return currentFocus;
  }

  const currentOptionIndex = column.options.findIndex(o => o.id === currentFocus.optionId);
  if (currentOptionIndex === -1) {
    return currentFocus;
  }

  let nextOptionIndex: number;
  if (direction === 'prev') {
    nextOptionIndex = currentOptionIndex > 0 ? currentOptionIndex - 1 : column.options.length - 1;
  } else {
    nextOptionIndex = (currentOptionIndex + 1) % column.options.length;
  }

  return {
    ...currentFocus,
    optionId: column.options[nextOptionIndex]?.id || null,
  };
}

/**
 * Handles keyboard navigation for the exercise
 */
export interface KeyboardNavigationResult {
  newFocus?: KeyboardFocusState;
  action?: 'select_focused' | 'clear_column' | 'clear_all' | 'submit' | 'preview' | 'skip' | 'none';
  preventDefault?: boolean;
}

export interface ProcessKeyboardEventOptions {
  event: KeyboardEvent;
  phase: string;
  currentFocus: KeyboardFocusState;
  columns: Column[];
  canSubmit: boolean;
  canPreview: boolean;
}

/**
 * Verifica si el evento debe ser ignorado (fase incorrecta o input enfocado)
 */
function shouldIgnoreEvent(event: KeyboardEvent, phase: string): boolean {
  if (phase !== 'composing') {
    return true;
  }

  const target = event.target as HTMLElement;
  const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

  return isInputElement;
}

/**
 * Maneja navegación horizontal entre columnas
 */
function handleHorizontalNavigation(
  key: string,
  shiftKey: boolean,
  currentFocus: KeyboardFocusState,
  columns: Column[]
): Pick<KeyboardNavigationResult, 'newFocus' | 'preventDefault'> {
  const direction = key === 'ArrowLeft' ? 'prev' : shiftKey ? 'prev' : 'next';

  return {
    newFocus: getAdjacentColumnFocus(currentFocus, columns, direction),
    preventDefault: true,
  };
}

/**
 * Maneja navegación vertical entre opciones
 */
function handleVerticalNavigation(
  key: string,
  currentFocus: KeyboardFocusState,
  columns: Column[]
): Pick<KeyboardNavigationResult, 'newFocus' | 'preventDefault'> {
  const direction = key === 'ArrowUp' ? 'prev' : 'next';

  return {
    newFocus: getAdjacentOptionFocus(currentFocus, columns, direction),
    preventDefault: true,
  };
}

/**
 * Maneja tecla Enter (selección o submit)
 */
function handleEnterKey(
  shiftKey: boolean,
  canSubmit: boolean,
  _currentFocus: KeyboardFocusState
): Pick<KeyboardNavigationResult, 'action' | 'preventDefault'> {
  if (shiftKey && canSubmit) {
    return { action: 'submit', preventDefault: true };
  }

  return { action: 'select_focused', preventDefault: true };
}

/**
 * Maneja teclas de borrado (Backspace, Delete, Escape)
 */
function handleDeletionKeys(
  key: string,
  currentFocus: KeyboardFocusState
): Pick<KeyboardNavigationResult, 'action' | 'preventDefault'> {
  if (key === 'Escape') {
    return { action: 'clear_all', preventDefault: false };
  }

  const action = currentFocus.columnId ? 'clear_column' : 'clear_all';
  return { action, preventDefault: false };
}

/**
 * Maneja atajo de teclado para preview
 */
function handlePreviewShortcut(
  ctrlKey: boolean,
  metaKey: boolean,
  canPreview: boolean
): Pick<KeyboardNavigationResult, 'action' | 'preventDefault'> {
  if (!ctrlKey && !metaKey) {
    return { action: 'none', preventDefault: false };
  }

  return {
    action: canPreview ? 'preview' : 'none',
    preventDefault: true,
  };
}

/**
 * Processes a keyboard event and returns the navigation action
 */
export function processKeyboardEvent(options: ProcessKeyboardEventOptions): KeyboardNavigationResult {
  const { event, phase, currentFocus, columns, canSubmit, canPreview } = options;

  if (shouldIgnoreEvent(event, phase)) {
    return { action: 'none' };
  }

  const { key, shiftKey, ctrlKey, metaKey } = event;

  switch (key) {
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'Tab':
      return handleHorizontalNavigation(key, shiftKey, currentFocus, columns);

    case 'ArrowUp':
    case 'ArrowDown':
      return handleVerticalNavigation(key, currentFocus, columns);

    case 'Enter':
      return handleEnterKey(shiftKey, canSubmit, currentFocus);

    case 'Backspace':
    case 'Delete':
    case 'Escape':
      return handleDeletionKeys(key, currentFocus);

    case 'p':
    case 'P':
      return handlePreviewShortcut(ctrlKey, metaKey, canPreview);

    default:
      return { action: 'none' };
  }
}

/**
 * Initializes keyboard focus on first column
 */
export function initializeKeyboardFocus(columns: Column[]): KeyboardFocusState {
  if (columns.length === 0) {
    return { columnId: null, optionId: null };
  }

  const firstColumn = columns[0];
  return {
    columnId: firstColumn.id,
    optionId: firstColumn.options[0]?.id || null,
  };
}
