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
  selections: Record<string, ColumnSelection>;
  canSubmit: boolean;
  canPreview: boolean;
}

/**
 * Processes a keyboard event and returns the navigation action
 */
export function processKeyboardEvent(options: ProcessKeyboardEventOptions): KeyboardNavigationResult {
  const { event, phase, currentFocus, columns, selections, canSubmit, canPreview } = options;
  // Only process in composing phase
  if (phase !== 'composing') {
    return { action: 'none' };
  }

  // Ignore if user is typing in an input
  const target = event.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    return { action: 'none' };
  }

  let newFocus: KeyboardFocusState | undefined;
  let action: KeyboardNavigationResult['action'] = 'none';
  let preventDefault = false;

  switch (event.key) {
    case 'ArrowLeft':
      newFocus = getAdjacentColumnFocus(currentFocus, columns, 'prev');
      preventDefault = true;
      break;

    case 'ArrowRight':
    case 'Tab':
      newFocus = getAdjacentColumnFocus(currentFocus, columns, event.shiftKey ? 'prev' : 'next');
      preventDefault = true;
      break;

    case 'ArrowUp':
      newFocus = getAdjacentOptionFocus(currentFocus, columns, 'prev');
      preventDefault = true;
      break;

    case 'ArrowDown':
      newFocus = getAdjacentOptionFocus(currentFocus, columns, 'next');
      preventDefault = true;
      break;

    case 'Enter':
    case ' ':
      action = 'select_focused';
      preventDefault = true;
      break;

    case 'Backspace':
    case 'Delete':
      action = currentFocus.columnId ? 'clear_column' : 'clear_all';
      break;

    case 'Escape':
      action = 'clear_all';
      break;

    case 'p':
    case 'P':
      if (event.ctrlKey || event.metaKey) {
        action = canPreview ? 'preview' : 'none';
        preventDefault = true;
      }
      break;

    case 'Enter':
      if (event.shiftKey && canSubmit) {
        action = 'submit';
        preventDefault = true;
      }
      break;

    default:
      return { action: 'none' };
  }

  return { newFocus, action, preventDefault };
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
