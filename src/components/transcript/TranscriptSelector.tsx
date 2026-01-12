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
            const isSelected = selectedPhrases.some(p => p.id === `phrase-${phrase.start}-${index}`);
            return (
              <button
                key={`phrase-${index}`}
                onClick={() => handlePhraseClick(phrase, index)}
                className={`
                  w-full text-left p-3 rounded-lg transition-all
                  ${isSelected
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-500'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-sm ${isSelected ? 'font-medium text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300'}`}>
                    {phrase.text}
                  </span>
                  {isSelected && (
                    <span className="text-indigo-600 dark:text-indigo-400 text-xs">✓</span>
                  )}
                </div>
                {phrase.start !== undefined && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
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
      <div
        ref={textRef}
        role="region"
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
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {transcript}
        </p>
        {isSelecting && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
          >
            <p className="text-xs font-medium text-indigo-800 dark:text-indigo-200 mb-2">
              ✓ Texto seleccionado: &ldquo;{globalThis.getSelection()?.toString().trim().substring(0, 50)}...&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  confirmTextSelection(e);
                }}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded font-medium transition-colors"
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
                className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
              También puedes hacer doble clic en el texto seleccionado
            </p>
          </motion.div>
        )}
      </div>
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
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
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
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }
            `}
          >
            Seleccionar frases ({phrases.length})
          </button>
        )}
        {selectedPhrases.length > 0 && (
          <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
            {selectedPhrases.length} seleccionada{selectedPhrases.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Transcripción */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
        {renderTranscript()}
      </div>
    </div>
  );
}

