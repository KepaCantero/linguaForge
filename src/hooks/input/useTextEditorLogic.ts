/**
 * useTextEditorLogic - Custom hook for TextEditor component
 *
 * Extracts complex logic for text handling, statistics calculation,
 * and text formatting operations.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================
// TYPES
// ============================================================

export interface TextEditorStats {
  charCount: number;
  charPercentage: number;
  wordCount: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
  isBelowMin: boolean;
}

export interface UseTextEditorLogicOptions {
  maxLength: number;
  minLength: number;
  value: string;
  onChange: (value: string) => void;
  onPaste?: (text: string) => void;
}

export interface TextEditorRef {
  focus: () => void;
  selectAll: () => void;
  insertText: (text: string) => void;
  clear: () => void;
}

// ============================================================
// CONSTANTS
// ============================================================

const CHARACTER_WARNING_THRESHOLDS = {
  nearLimit: 0.9,  // 90% of max length
  atLimit: 1.0,    // 100% of max length
} as const;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Calculate word count from text
 */
export function calculateWordCount(text: string): number {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

/**
 * Calculate text editor statistics
 */
export function calculateEditorStats(
  value: string,
  maxLength: number,
  minLength: number
): TextEditorStats {
  const charCount = value.length;
  const charPercentage = charCount / maxLength;

  return {
    charCount,
    charPercentage,
    wordCount: calculateWordCount(value),
    isNearLimit: charPercentage >= CHARACTER_WARNING_THRESHOLDS.nearLimit,
    isAtLimit: charPercentage >= CHARACTER_WARNING_THRESHOLDS.atLimit,
    isBelowMin: charCount > 0 && charCount < minLength,
  };
}

/**
 * Clean pasted text by removing extra spaces and normalizing line breaks
 */
export function cleanPastedText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
}

/**
 * Insert text at cursor position or at the end
 */
export function insertTextAtPosition(
  currentValue: string,
  textToInsert: string,
  selectionStart: number,
  selectionEnd: number
): string {
  return (
    currentValue.substring(0, selectionStart) +
    textToInsert +
    currentValue.substring(selectionEnd)
  );
}

// ============================================================
// CUSTOM HOOK
// ============================================================

export function useTextEditorLogic(options: UseTextEditorLogicOptions) {
  const { maxLength, minLength, value, onChange, onPaste } = options;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wordCount, setWordCount] = useState(0);

  // Update word count when value changes
  useEffect(() => {
    setWordCount(calculateWordCount(value));
  }, [value]);

  // Handle text change with max length validation
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  }, [maxLength, onChange]);

  // Handle paste with text cleaning
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain');
    const cleanedText = cleanPastedText(pastedText);

    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = insertTextAtPosition(value, cleanedText, start, end);

    if (newValue.length <= maxLength) {
      onChange(newValue);

      // Move cursor to end of pasted text
      requestAnimationFrame(() => {
        const newCursorPos = start + cleanedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });

      onPaste?.(cleanedText);
    }
  }, [maxLength, value, onChange, onPaste]);

  // Create ref methods
  const refMethods = useCallback((): TextEditorRef => ({
    focus: () => textareaRef.current?.focus(),
    selectAll: () => textareaRef.current?.select(),
    insertText: (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = insertTextAtPosition(value, text, start, end);
      if (newValue.length <= maxLength) {
        onChange(newValue);
      }
    },
    clear: () => onChange(''),
  }), [value, maxLength, onChange]);

  return {
    textareaRef,
    wordCount,
    handleChange,
    handlePaste,
    refMethods,
  };
}

// ============================================================
// REFINITON HELPERS
// ============================================================

export function getWarningMessage(
  isAtLimit: boolean,
  isNearLimit: boolean,
  isBelowMin: boolean,
  minLength: number
): string | null {
  if (isAtLimit) return '⚠️ Límite alcanzado';
  if (isNearLimit) return '⚠️ Cerca del límite';
  if (isBelowMin) return `Mínimo ${minLength} caracteres`;
  return null;
}

export function shouldShowWarning(
  isBelowMin: boolean,
  isNearLimit: boolean,
  isAtLimit: boolean
): boolean {
  return isBelowMin || isNearLimit || isAtLimit;
}
