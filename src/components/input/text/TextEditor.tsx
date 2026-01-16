'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PROGRESS_COLORS } from '@/lib/constants';
import { INPUT_COLORS } from '@/config/input';

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

const CHARACTER_WARNING_THRESHOLDS = {
  nearLimit: 0.9,  // 90% of max length
  atLimit: 1.0,    // 100% of max length
} as const;

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Calcular estadísticas
  const charCount = value.length;
  const charPercentage = charCount / maxLength;
  const isNearLimit = charPercentage >= CHARACTER_WARNING_THRESHOLDS.nearLimit;
  const isAtLimit = charPercentage >= CHARACTER_WARNING_THRESHOLDS.atLimit;
  const isBelowMin = charCount > 0 && charCount < minLength;

  // Actualizar conteo de palabras
  useEffect(() => {
    const words = value.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [value]);

  // Auto focus si se solicita
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Manejar cambio de texto
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  }, [maxLength, onChange]);

  // Manejar paste con limpieza de formato
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain');

    // Limpiar texto: eliminar espacios extras, normalizar líneas
    const cleanedText = pastedText
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n');

    // Insertar en la posición del cursor o al final
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value;
    const newValue =
      currentValue.substring(0, start) + cleanedText + currentValue.substring(end);

    if (newValue.length <= maxLength) {
      onChange(newValue);

      // Mover cursor al final del texto pegado
      requestAnimationFrame(() => {
        const newCursorPos = start + cleanedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });

      // Callback externo si existe
      onPaste?.(cleanedText);
    }
  }, [maxLength, value, onChange, onPaste]);

  // Exponer métodos vía ref
  useEffect(() => {
    if (textareaRef.current) {
      const ref: TextEditorRef = {
        focus: () => textareaRef.current?.focus(),
        selectAll: () => textareaRef.current?.select(),
        insertText: (text: string) => {
          const textarea = textareaRef.current;
          if (!textarea) return;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newValue =
            value.substring(0, start) + text + value.substring(end);
          if (newValue.length <= maxLength) {
            onChange(newValue);
          }
        },
        clear: () => onChange(''),
      };
      // @ts-expect-error - Custom ref attachment
      textareaRef.current.customRef = ref;
    }
  }, [value, maxLength, onChange]);

  // Colores de la línea de progreso - usando constantes centralizadas
  const getLineColor = () => {
    if (isAtLimit) return PROGRESS_COLORS.error;
    if (isNearLimit) return PROGRESS_COLORS.warning;
    return PROGRESS_COLORS.normal;
  };

  return (
    <div className="w-full space-y-3">
      {/* Editor */}
      <div
        className={`
          relative rounded-xl overflow-hidden border-2 transition-all duration-300
          ${isFocused ? `${INPUT_COLORS.text.borderColor.replace('/30', '/50')} shadow-lg ring-2 ring-sky-500/50` : 'border-calm-warm-200/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isBelowMin ? PROGRESS_COLORS.warning.replace('bg-', 'border-').replace('-500', '-500/50') : ''}
        `}
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
          aria-invalid={isBelowMin || isAtLimit}
          aria-required={true}
        />

        {/* Línea de progreso de caracteres */}
        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${getLineColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${charPercentage * 100}%` }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        />
      </div>

      {/* Información de caracteres y palabras */}
      {showCharacterCount && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {/* Contador de caracteres */}
            <motion.span
              className={`
                font-medium tabular-nums
                ${isAtLimit ? PROGRESS_COLORS.textError : isNearLimit ? PROGRESS_COLORS.textWarning : PROGRESS_COLORS.textNormal}
              `}
              animate={isAtLimit ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3, repeat: isAtLimit ? Infinity : 0 }}
              id="char-count"
            >
              {charCount.toLocaleString()} / {maxLength.toLocaleString()} caracteres
            </motion.span>

            {/* Contador de palabras */}
            <span className="text-calm-text-muted tabular-nums">
              {wordCount.toLocaleString()} {wordCount === 1 ? 'palabra' : 'palabras'}
            </span>
          </div>

          {/* Advertencias */}
          {(isBelowMin || isNearLimit || isAtLimit) && (
            <motion.span
              className={`
                text-xs font-medium
                ${isAtLimit ? PROGRESS_COLORS.textError : isBelowMin || isNearLimit ? PROGRESS_COLORS.textWarning : ''}
              `}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {isAtLimit && '⚠️ Límite alcanzado'}
              {isNearLimit && !isAtLimit && '⚠️ Cerca del límite'}
              {isBelowMin && `Mínimo ${minLength} caracteres`}
            </motion.span>
          )}
        </div>
      )}

      {/* Acciones rápidas */}
      {!disabled && value.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-1.5 text-sm text-calm-text-muted hover:text-white hover:bg-calm-warm-200/20 rounded-lg transition-colors"
            aria-label="Limpiar texto"
          >
            🗑️ Limpiar
          </button>
          <button
            type="button"
            onClick={() => {
              if (textareaRef.current) {
                textareaRef.current.select();
                navigator.clipboard.writeText(value);
              }
            }}
            className="px-3 py-1.5 text-sm text-calm-text-muted hover:text-white hover:bg-calm-warm-200/20 rounded-lg transition-colors"
            aria-label="Copiar todo"
          >
            📋 Copiar
          </button>
        </div>
      )}
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
