'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  extractWordsWithContext,
  groupWordsByPOS,
  type WordWithContext,
  type SentenceContext,
  type ContextExtractionResult,
} from '@/services/contextExtractionService';
import { translateWords } from '@/services/translationService';
import { useWordDictionaryStore } from '@/store/useWordDictionaryStore';
import { useSRSStore } from '@/store/useSRSStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useProgressStore } from '@/store/useProgressStore';
import { ContentSource } from '@/types/srs';
import { SentenceHighlighter } from './SentenceHighlighter';

// ============================================================
// INTERFACES
// ============================================================

interface WordSelectorWithContextProps {
  transcript: string;
  phrases?: Array<{ text: string; start: number; duration: number }>;
  source: ContentSource;
  onWordsAdded?: (count: number) => void;
  mode?: 'sentence' | 'compact';
}

interface WordSelectionContext {
  word: WordWithContext;
  sentence: SentenceContext;
  translation?: string;
  isTranslating?: boolean;
}

// ============================================================
// CONSTANTES
// ============================================================

const SELECTION_MODE_SENTENCE = 'sentence' as const;
const SELECTION_MODE_COMPACT = 'compact' as const;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function pluralizeCards(count: number): string {
  return count === 1 ? 'card' : 'cards';
}

function getSelectionModeLabel(mode: 'sentence' | 'compact'): string {
  return mode === 'sentence' ? 'Oración completa' : 'Compacto';
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function WordSelectorWithContext({
  transcript,
  source,
  onWordsAdded,
  mode = 'sentence',
}: WordSelectorWithContextProps) {
  // Stores
  const { addWord, isWordStudied } = useWordDictionaryStore();
  const { addCards } = useSRSStore();
  const { addXP } = useGamificationStore();
  const { activeLanguage, activeLevel } = useProgressStore();

  // Estado local
  const [selectedWords, setSelectedWords] = useState<Map<string, WordSelectionContext>>(new Map());
  const [isCreating, setIsCreating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number>(-1);
  const [selectedWordId, setSelectedWordId] = useState<string>('');

  // Extraer palabras con contexto (memoizado)
  const extractionResult = useMemo(() => {
    return extractWordsWithContext(transcript, activeLanguage);
  }, [transcript, activeLanguage]);

  // Agrupar palabras por POS para estadísticas
  const wordsByPOS = useMemo(() => {
    return groupWordsByPOS(extractionResult.allWords);
  }, [extractionResult.allWords]);

  // Obtener IDs de palabras ya estudiadas
  const studiedWordIds = useMemo(() => {
    const studied = new Set<string>();
    extractionResult.allWords.forEach(word => {
      if (isWordStudied(word.word)) {
        studied.add(word.id);
      }
    });
    return studied;
  }, [extractionResult.allWords, isWordStudied]);

  // Manejar click en palabra
  const handleWordClick = useCallback((word: WordWithContext, sentence: SentenceContext, sentenceIndex: number) => {
    // Si ya está seleccionada, quitarla
    if (selectedWords.has(word.id)) {
      const newMap = new Map(selectedWords);
      newMap.delete(word.id);
      setSelectedWords(newMap);

      // Si era la palabra seleccionada actualmente, limpiar selección
      if (selectedWordId === word.id) {
        setSelectedWordId('');
      }
      return;
    }

    // Verificar si ya está estudiada
    if (isWordStudied(word.word)) {
      return;
    }

    // Añadir palabra seleccionada
    const newSelection: WordSelectionContext = {
      word,
      sentence,
    };

    setSelectedWords(prev => {
      const newMap = new Map(prev);
      newMap.set(word.id, newSelection);
      return newMap;
    });

    // Establecer como palabra seleccionada
    setSelectedWordId(word.id);
    setSelectedSentenceIndex(sentenceIndex);

    // Traducir automáticamente
    translateWords([word.word]).then(trans => {
      if (trans[word.word]) {
        setTranslations(prev => ({
          ...prev,
          [word.id]: trans[word.word],
        }));
      }
    });
  }, [selectedWords, selectedWordId, isWordStudied]);

  // Crear cards
  const handleCreateCards = useCallback(async () => {
    if (selectedWords.size === 0) return;

    setIsCreating(true);
    try {
      const wordsArray = Array.from(selectedWords.values());

      const cardsToCreate = wordsArray.map(selection => {
        const { word, sentence } = selection;

        return {
          phrase: word.word,
          translation: translations[word.id] || word.word,
          source: {
            ...source,
            context: `Ejemplo: "${sentence.text}"`,
          },
          languageCode: activeLanguage,
          levelCode: activeLevel,
          tags: [
            source.type === 'video' || source.type === 'audio' ? source.type : 'text',
            'transcript',
            'word',
            word.pos,
            'with-context',
          ],
          notes: `Tipo: ${word.pos}. Lemma: ${word.lemma}. Contexto: "${sentence.text}"`,
        };
      });

      const createdCards = addCards(cardsToCreate);

      // Actualizar diccionario
      wordsArray.forEach((selection, index) => {
        if (createdCards[index]) {
          addWord(selection.word.word, selection.word.pos, createdCards[index].id);
        }
      });

      addXP(cardsToCreate.length * 15);
      onWordsAdded?.(cardsToCreate.length);

      // Limpiar selección
      setSelectedWords(new Map());
      setTranslations({});
      setSelectedWordId('');
      setSelectedSentenceIndex(-1);

      alert(`✓ ${cardsToCreate.length} ${cardsToCreate.length === 1 ? 'palabra añadida' : 'palabras añadidas'} al deck con contexto completo`);
    } catch (_error) {
      alert('Error al crear las cards');
    } finally {
      setIsCreating(false);
    }
  }, [selectedWords, translations, source, activeLanguage, activeLevel, addCards, addWord, addXP, onWordsAdded]);

  // Renderizar lista de oraciones
  const renderSentencesList = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-calm-text-primary dark:text-white">
            Oraciones ({extractionResult.sentences.length})
          </h3>
          <div className="text-xs text-calm-text-muted dark:text-calm-text-muted">
            {extractionResult.allWords.length} palabras analizadas
          </div>
        </div>

        {extractionResult.sentences.map((sentence, index) => {
          const isSelectedSentence = index === selectedSentenceIndex;
          const hasSelectedWords = Array.from(selectedWords.values()).some(
            s => s.sentence.id === sentence.id
          );

          return (
            <motion.div
              key={sentence.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border rounded-lg transition-all ${
                isSelectedSentence || hasSelectedWords
                  ? 'border-accent-300 dark:border-accent-700 bg-accent-50 dark:bg-accent-900/20'
                  : 'border-calm-warm-100 dark:border-calm-warm-200 bg-white dark:bg-calm-bg-elevated'
              }`}
            >
              {/* Header de oración */}
              <div
                className="px-4 py-2 border-b border-calm-warm-100 dark:border-calm-warm-200 cursor-pointer"
                onClick={() => setSelectedSentenceIndex(isSelectedSentence ? -1 : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-calm-text-secondary dark:text-calm-text-tertiary">
                      Oración #{index + 1}
                    </span>
                    <span className="text-xs text-calm-text-muted dark:text-calm-text-muted">
                      ({sentence.wordCount} palabras)
                    </span>
                  </div>
                  {hasSelectedWords && (
                    <span className="text-xs text-accent-600 dark:text-accent-400 font-medium">
                      {Array.from(selectedWords.values()).filter(s => s.sentence.id === sentence.id).length} seleccionadas
                    </span>
                  )}
                </div>
              </div>

              {/* Contenido de oración (expandible) */}
              <AnimatePresence>
                {isSelectedSentence && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4">
                      <SentenceHighlighter
                        sentence={sentence}
                        selectedWordId={selectedWordId}
                        onWordClick={(word) => handleWordClick(word, sentence, index)}
                        disabledWordIds={Array.from(studiedWordIds)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Renderizar vista compacta
  const renderCompactView = () => {
    return (
      <div className="space-y-4">
        {extractionResult.sentences.map((sentence, index) => (
          <motion.div
            key={sentence.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="bg-white dark:bg-calm-bg-elevated rounded-lg p-3 border border-calm-warm-100 dark:border-calm-warm-200"
          >
            <SentenceHighlighter
              sentence={sentence}
              selectedWordId={selectedWordId}
              onWordClick={(word) => handleWordClick(word, sentence, index)}
              disabledWordIds={Array.from(studiedWordIds)}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Panel de control */}
      <div className="bg-white dark:bg-calm-bg-elevated rounded-lg p-4 border border-calm-warm-100 dark:border-calm-warm-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-calm-text-primary dark:text-white">
            Selección de palabras con contexto
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-calm-text-muted dark:text-calm-text-muted">
              {getSelectionModeLabel(mode)}
            </span>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
            {wordsByPOS.noun.length} sustantivos
          </span>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded">
            {wordsByPOS.verb.length} verbos
          </span>
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded">
            {wordsByPOS.adverb.length} adverbios
          </span>
          <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded">
            {wordsByPOS.adjective.length} adjetivos
          </span>
        </div>

        {/* Lista de oraciones o vista compacta */}
        {mode === 'sentence' ? renderSentencesList() : renderCompactView()}
      </div>

      {/* Panel de palabras seleccionadas */}
      {selectedWords.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white dark:bg-calm-bg-elevated rounded-lg p-4 border border-calm-warm-100 dark:border-calm-warm-200"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-calm-text-primary dark:text-white">
              Palabras seleccionadas ({selectedWords.size})
            </h3>
            <button
              onClick={() => {
                setSelectedWords(new Map());
                setTranslations({});
                setSelectedWordId('');
                setSelectedSentenceIndex(-1);
              }}
              className="text-xs text-calm-text-muted dark:text-calm-text-muted hover:text-calm-text-secondary dark:hover:text-calm-text-tertiary"
            >
              Limpiar todo
            </button>
          </div>

          {/* Lista de palabras seleccionadas */}
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
            {Array.from(selectedWords.values()).map((selection) => {
              const { word, sentence } = selection;

              return (
                <motion.div
                  key={word.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-between p-2 bg-sky-50 dark:bg-accent-900/30 rounded border border-accent-200 dark:border-accent-700"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-accent-900 dark:text-accent-100">
                        {word.word}
                      </span>
                      {translations[word.id] && (
                        <span className="text-xs text-accent-600 dark:text-accent-400">
                          → {translations[word.id]}
                        </span>
                      )}
                      <span className="text-xs text-accent-600 dark:text-accent-400">
                        ({word.pos})
                      </span>
                    </div>
                    <p className="text-xs text-accent-700 dark:text-accent-300 truncate mt-1">
                      &ldquo;{sentence.text}&rdquo;
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const newMap = new Map(selectedWords);
                      newMap.delete(word.id);
                      setSelectedWords(newMap);

                      if (selectedWordId === word.id) {
                        setSelectedWordId('');
                      }
                    }}
                    className="ml-2 text-accent-600 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-200"
                  >
                    ×
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Botón de creación */}
          <button
            onClick={handleCreateCards}
            disabled={isCreating}
            className="w-full py-2 bg-accent-600 hover:bg-accent-700 disabled:bg-calm-warm-100 dark:disabled:bg-calm-bg-tertiary text-white disabled:text-calm-text-muted font-medium rounded-lg transition-colors"
          >
            {isCreating
              ? 'Creando...'
              : `Crear ${selectedWords.size} ${pluralizeCards(selectedWords.size)} con contexto`
            }
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================
// EXPORTS
// ============================================================

export default WordSelectorWithContext;
