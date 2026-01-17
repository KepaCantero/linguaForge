'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PROGRESS_COLORS } from '@/lib/constants';
import { INPUT_COLORS } from '@/config/input';
import {
  useTextEditorLogic,
  calculateEditorStats,
  getWarningMessage,
  shouldShowWarning,
} from '@/hooks/input/useTextEditorLogic';

// ============================================================
// TYPES
// ============================================================

export interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  showCharacterCount?: boolean;
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

const DEFAULT_MAX_LENGTH = 10_000;
const DEFAULT_MIN_LENGTH = 20;

// ============================================================
// COMPONENT
// ============================================================

/**
 * TextEditor - Editor de texto con línea de caracteres
 *
 * Características:
 * - Límite de caracteres configurable (default: 10,000)
 * - Línea visual de progreso de caracteres
 * - Contador de caracteres y palabras
 * - Soporte para paste con limpieza de formato
 * - Indicadores de advertencia (cerca/at del límite)
 * - Accesibilidad con ARIA
 */
export function TextEditor({
  value,
  onChange,
  maxLength = DEFAULT_MAX_LENGTH,
  minLength = DEFAULT_MIN_LENGTH,
  placeholder = 'Pega aquí tu texto en francés para analizar...',
  disabled = false,
  autoFocus = false,
  showCharacterCount = true,
  onPaste,
}: TextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Use custom hook for complex logic
  const {
    textareaRef,
    wordCount,
    handleChange,
    handlePaste,
    refMethods,
  } = useTextEditorLogic({
    maxLength,
    minLength,
    value,
    onChange,
    onPaste,
  });

  // Calculate statistics
  const stats = calculateEditorStats(value, maxLength, minLength);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus, textareaRef]);

  // Expose methods via ref
  useEffect(() => {
    if (textareaRef.current) {
      // @ts-expect-error - Custom ref attachment
      textareaRef.current.customRef = refMethods();
    }
  }, [refMethods, textareaRef]);

  const warningMessage = getWarningMessage(
    stats.isAtLimit,
    stats.isNearLimit,
    stats.isBelowMin,
    minLength
  );

  const showWarning = shouldShowWarning(
    stats.isBelowMin,
    stats.isNearLimit,
    stats.isAtLimit
  );

  const lineColor = getLineColor(stats.isAtLimit, stats.isNearLimit);

  return (
    <div className="w-full space-y-3">
      <TextEditorContainer
        isFocused={isFocused}
        disabled={disabled}
        isBelowMin={stats.isBelowMin}
        lineColor={lineColor}
        charPercentage={stats.charPercentage}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`
            w-full min-h-[300px] p-4 bg-calm-bg-elevated/50
            text-calm-text-primary placeholder:text-calm-text-muted
            resize-y focus:outline-none transition-colors
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          aria-label="Editor de texto para importar contenido"
          aria-describedby="char-count"
          aria-invalid={stats.isBelowMin || stats.isAtLimit}
          aria-required={true}
        />
      </TextEditorContainer>

      {showCharacterCount && (
        <CharacterCountSection
          charCount={stats.charCount}
          maxLength={maxLength}
          wordCount={wordCount}
          isAtLimit={stats.isAtLimit}
          isNearLimit={stats.isNearLimit}
          warningMessage={warningMessage}
          showWarning={showWarning}
        />
      )}

      {!disabled && value.length > 0 && (
        <ActionButtons
          onClear={() => onChange('')}
          onCopy={() => {
            if (textareaRef.current) {
              textareaRef.current.select();
              navigator.clipboard.writeText(value);
            }
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getLineColor(isAtLimit: boolean, isNearLimit: boolean): string {
  if (isAtLimit) return PROGRESS_COLORS.error;
  if (isNearLimit) return PROGRESS_COLORS.warning;
  return PROGRESS_COLORS.normal;
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

interface TextEditorContainerProps {
  isFocused: boolean;
  disabled: boolean;
  isBelowMin: boolean;
  lineColor: string;
  charPercentage: number;
  children: React.ReactNode;
}

function TextEditorContainer({
  isFocused,
  disabled,
  isBelowMin,
  lineColor,
  charPercentage,
  children,
}: TextEditorContainerProps) {
  return (
    <div
      className={`
        relative rounded-xl overflow-hidden border-2 transition-all duration-300
        ${isFocused ? `${INPUT_COLORS.text.borderColor.replace('/30', '/50')} shadow-lg ring-2 ring-sky-500/50` : 'border-calm-warm-200/50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isBelowMin ? PROGRESS_COLORS.warning.replace('bg-', 'border-').replace('-500', '-500/50') : ''}
      `}
    >
      {children}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 ${lineColor}`}
        initial={{ width: 0 }}
        animate={{ width: `${charPercentage * 100}%` }}
        transition={{ duration: 0.2 }}
        aria-hidden="true"
      />
    </div>
  );
}

interface CharacterCountSectionProps {
  charCount: number;
  maxLength: number;
  wordCount: number;
  isAtLimit: boolean;
  isNearLimit: boolean;
  warningMessage: string | null;
  showWarning: boolean;
}

function CharacterCountSection({
  charCount,
  maxLength,
  wordCount,
  isAtLimit,
  isNearLimit,
  warningMessage,
  showWarning,
}: CharacterCountSectionProps) {
  const charCountColor = isAtLimit
    ? PROGRESS_COLORS.textError
    : isNearLimit
    ? PROGRESS_COLORS.textWarning
    : PROGRESS_COLORS.textNormal;

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <motion.span
          className={`font-medium tabular-nums ${charCountColor}`}
          animate={isAtLimit ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3, repeat: isAtLimit ? Infinity : 0 }}
          id="char-count"
        >
          {charCount.toLocaleString()} / {maxLength.toLocaleString()} caracteres
        </motion.span>

        <span className="text-calm-text-muted tabular-nums">
          {wordCount.toLocaleString()} {wordCount === 1 ? 'palabra' : 'palabras'}
        </span>
      </div>

      {showWarning && warningMessage && (
        <motion.span
          className={`
            text-xs font-medium
            ${isAtLimit ? PROGRESS_COLORS.textError : isNearLimit ? PROGRESS_COLORS.textWarning : PROGRESS_COLORS.textWarning}
          `}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {warningMessage}
        </motion.span>
      )}
    </div>
  );
}

interface ActionButtonsProps {
  onClear: () => void;
  onCopy: () => void;
}

function ActionButtons({ onClear, onCopy }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClear}
        className="px-3 py-1.5 text-sm text-calm-text-muted hover:text-white hover:bg-calm-warm-200/20 rounded-lg transition-colors"
        aria-label="Limpiar texto"
      >
        🗑️ Limpiar
      </button>
      <button
        type="button"
        onClick={onCopy}
        className="px-3 py-1.5 text-sm text-calm-text-muted hover:text-white hover:bg-calm-warm-200/20 rounded-lg transition-colors"
        aria-label="Copiar todo"
      >
        📋 Copiar
      </button>
    </div>
  );
}

// ============================================================
// FORWARD REF HELPER
// ============================================================

/**
 * useTextEditorRef - Hook para acceder a métodos del editor
 *
 * @example
 * const editorRef = useTextEditorRef();
 * <TextEditor ref={editorRef} ... />
 * <button onClick={() => editorRef.current?.focus()}>Focus</button>
 */
export function useTextEditorRef() {
  const ref = useRef<TextEditorRef>(null);
  return ref;
}
