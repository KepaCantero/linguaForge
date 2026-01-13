'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface SelectedPhrase {
  id: string;
  text: string;
  start?: number;
  end?: number;
  contextBefore?: string;
  contextAfter?: string;
}

interface TranscriptSelectorProps {
  transcript: string;
  phrases?: Array<{ text: string; start: number; duration: number }>; // Frases con timestamps
  onSelectionChange?: (selectedPhrases: SelectedPhrase[]) => void;
  className?: string;
}

export function TranscriptSelector({
  transcript,
  phrases,
  onSelectionChange,
  className = '',
}: TranscriptSelectorProps) {
  const [selectedPhrases, setSelectedPhrases] = useState<SelectedPhrase[]>([]);
  const [selectionMode, setSelectionMode] = useState<'text' | 'phrase'>('text');
  const [isSelecting, setIsSelecting] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

  // Convertir transcripción con timestamps a frases si están disponibles
  const transcriptPhrases = phrases || transcript.split(/[.!?]\s+/).map((text, idx) => ({
    text: text.trim(),
    start: idx * 5, // Estimación si no hay timestamps
    duration: 3,
  }));

  // Manejar selección de texto manual
  const handleTextSelection = useCallback(() => {
    // Pequeño delay para asegurar que la selección está completa
    setTimeout(() => {
      const selection = globalThis.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setIsSelecting(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();

      if (selectedText.length < 3) {
        setIsSelecting(false);
        return;
      }

      setIsSelecting(true);
      selectionRef.current = {
        start: range.startOffset,
        end: range.endOffset,
      };
    }, 50);
  }, []);

  // Confirmar selección de texto
  const confirmTextSelection = useCallback((e?: React.MouseEvent) => {
    // Prevenir el comportamiento por defecto del doble click
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setIsSelecting(false);
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 3) {
      setIsSelecting(false);
      return;
    }

    // Encontrar contexto antes y después
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const textContent = container.textContent || '';
    const startIndex = textContent.indexOf(selectedText);
    
    const contextBefore = textContent.substring(Math.max(0, startIndex - 50), startIndex).trim();
    const contextAfter = textContent.substring(
      startIndex + selectedText.length,
      Math.min(textContent.length, startIndex + selectedText.length + 50)
    ).trim();

    // Encontrar timestamp si está disponible
    let start: number | undefined;
    let end: number | undefined;
    
    if (phrases) {
      const matchingPhrase = phrases.find(p => 
        selectedText.toLowerCase().includes(p.text.toLowerCase().substring(0, 20)) ||
        p.text.toLowerCase().includes(selectedText.toLowerCase().substring(0, 20))
      );
      if (matchingPhrase) {
        start = matchingPhrase.start;
        end = matchingPhrase.start + matchingPhrase.duration;
      }
    }

    const newPhrase: SelectedPhrase = {
      id: `selected-${Date.now()}-${Math.random()}`,
      text: selectedText,
      start: start ?? 0,
      end: end ?? 0,
      ...(contextBefore !== undefined && { contextBefore }),
      ...(contextAfter !== undefined && { contextAfter }),
    };

    setSelectedPhrases(prev => {
      // Evitar duplicados
      if (prev.some(p => p.text === selectedText)) {
        return prev;
      }
      return [...prev, newPhrase];
    });

    // Limpiar selección después de un breve delay
    setTimeout(() => {
      selection.removeAllRanges();
      setIsSelecting(false);
    }, 100);
  }, [phrases]);

  // Seleccionar frase completa por click
  const handlePhraseClick = useCallback((phrase: { text: string; start: number; duration: number }, index: number) => {
    const phraseText = phrase.text.trim();
    if (phraseText.length < 3) return;

    // Obtener contexto
    const contextBefore = index > 0 ? transcriptPhrases[index - 1].text : undefined;
    const contextAfter = index < transcriptPhrases.length - 1 ? transcriptPhrases[index + 1].text : undefined;

    const newPhrase: SelectedPhrase = {
      id: `phrase-${phrase.start}-${index}`,
      text: phraseText,
      start: phrase.start,
      end: phrase.start + phrase.duration,
      ...(contextBefore !== undefined && { contextBefore }),
      ...(contextAfter !== undefined && { contextAfter }),
    };

    setSelectedPhrases(prev => {
      // Toggle: si ya está seleccionada, quitarla
      const existingIndex = prev.findIndex(p => p.id === newPhrase.id);
      if (existingIndex >= 0) {
        return prev.filter((_, idx) => idx !== existingIndex);
      }
      // Añadir nueva frase
      return [...prev, newPhrase];
    });
  }, [transcriptPhrases]);

  // Notificar cambios
  useEffect(() => {
    onSelectionChange?.(selectedPhrases);
  }, [selectedPhrases, onSelectionChange]);

  // Renderizar transcripción con frases clickeables o texto seleccionable
  const renderTranscript = () => {
    if (selectionMode === 'phrase' && phrases) {
      // Modo frase: mostrar cada frase como botón clickeable
      return (
        <div className="space-y-2">
          {transcriptPhrases.map((phrase, index) => {
            const phraseId = `phrase-${phrase.start}-${index}`;
            const isSelected = selectedPhrases.some(p => p.id === phraseId);
            return (
              <button
                key={phraseId}
                onClick={() => handlePhraseClick(phrase, index)}
                className={`
                  w-full text-left p-3 rounded-lg transition-all
                  ${isSelected
                    ? 'bg-accent-100 dark:bg-accent-900/50 border-2 border-accent-500'
                    : 'bg-calm-bg-primary dark:bg-calm-bg-elevated/50 border-2 border-transparent hover:bg-calm-bg-secondary dark:hover:bg-calm-bg-elevated'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-sm ${isSelected ? 'font-medium text-accent-900 dark:text-accent-100' : 'text-calm-text-secondary dark:text-calm-text-tertiary'}`}>
                    {phrase.text}
                  </span>
                  {isSelected && (
                    <span className="text-accent-600 dark:text-accent-400 text-xs">✓</span>
                  )}
                </div>
                {phrase.start !== undefined && (
                  <span className="text-xs text-calm-text-muted dark:text-calm-text-muted mt-1 block">
                    {Math.floor(phrase.start / 60)}:{(Math.floor(phrase.start % 60)).toString().padStart(2, '0')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    // Modo texto: texto seleccionable
    return (
      <section
        ref={textRef}
        aria-label="Selector de transcripción de texto"
        className="select-text cursor-text"
        onMouseUp={handleTextSelection}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          confirmTextSelection(e);
        }}
        onKeyDown={(e) => {
          // Confirmar selección con Enter cuando hay texto seleccionado
          if ((e.key === 'Enter' || e.key === ' ') && isSelecting) {
            e.preventDefault();
            confirmTextSelection();
          }
        }}
        tabIndex={0}
      >
        <p className="text-sm text-calm-text-secondary dark:text-calm-text-tertiary whitespace-pre-wrap leading-relaxed">
          {transcript}
        </p>
        {isSelecting && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-2 bg-sky-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800"
          >
            <p className="text-xs font-medium text-accent-800 dark:text-accent-200 mb-2">
              ✓ Texto seleccionado: &ldquo;{globalThis.getSelection()?.toString().trim().substring(0, 50)}...&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  confirmTextSelection(e);
                }}
                className="text-xs bg-accent-600 hover:bg-accent-700 text-white px-3 py-1.5 rounded font-medium transition-colors"
              >
                Añadir frase
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  globalThis.getSelection()?.removeAllRanges();
                  setIsSelecting(false);
                }}
                className="text-xs bg-calm-bg-tertiary dark:bg-calm-bg-tertiary hover:bg-calm-warm-100 dark:hover:bg-calm-bg-tertiary text-calm-text-secondary dark:text-calm-text-tertiary px-3 py-1.5 rounded font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
            <p className="text-xs text-accent-600 dark:text-accent-400 mt-2">
              También puedes hacer doble clic en el texto seleccionado
            </p>
          </motion.div>
        )}
      </section>
    );
  };

  return (
    <div className={className}>
      {/* Controles de modo */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setSelectionMode('text')}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${selectionMode === 'text'
              ? 'bg-accent-600 text-white'
              : 'bg-calm-bg-tertiary dark:bg-calm-bg-tertiary text-calm-text-secondary dark:text-calm-text-tertiary'
            }
          `}
        >
          Seleccionar texto
        </button>
        {phrases && phrases.length > 0 && (
          <button
            onClick={() => setSelectionMode('phrase')}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${selectionMode === 'phrase'
                ? 'bg-accent-600 text-white'
                : 'bg-calm-bg-tertiary dark:bg-calm-bg-tertiary text-calm-text-secondary dark:text-calm-text-tertiary'
              }
            `}
          >
            Seleccionar frases ({phrases.length})
          </button>
        )}
        {selectedPhrases.length > 0 && (
          <span className="ml-auto text-sm text-calm-text-secondary dark:text-calm-text-muted">
            {selectedPhrases.length} {selectedPhrases.length === 1 ? 'seleccionada' : 'seleccionadas'}
          </span>
        )}
      </div>

      {/* Transcripción */}
      <div className="bg-white dark:bg-calm-bg-elevated rounded-lg p-4 border border-calm-warm-100 dark:border-calm-warm-200 max-h-96 overflow-y-auto">
        {renderTranscript()}
      </div>
    </div>
  );
}

