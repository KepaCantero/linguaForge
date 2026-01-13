'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { extractKeywords, normalizeWord, type ExtractedWord } from '@/services/wordExtractor';
import { translateWords } from '@/services/translationService';
import { useWordDictionaryStore } from '@/store/useWordDictionaryStore';
import { useSRSStore } from '@/store/useSRSStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useProgressStore } from '@/store/useProgressStore';
import { ContentSource } from '@/types/srs';

interface WordSelectorProps {
  transcript: string;
  phrases?: Array<{ text: string; start: number; duration: number }>;
  source: ContentSource;
  onWordsAdded?: (count: number) => void;
}

interface SelectedWord extends ExtractedWord {
  contextPhrase: string;
  translation?: string;
  isTranslating?: boolean;
}

// Helper functions for button styling
function getWordButtonClassName(isSelected: boolean, isStudied: boolean): string {
  const baseClasses = 'inline-block px-1 py-0.5 mx-0.5 rounded transition-all';

  if (isSelected) {
    return `${baseClasses} bg-accent-500 text-white font-medium`;
  }

  if (isStudied) {
    return `${baseClasses} text-calm-text-muted dark:text-calm-text-secondary cursor-not-allowed`;
  }

  return `${baseClasses} hover:bg-accent-100 dark:hover:bg-accent-900/30 text-accent-700 dark:text-accent-300 cursor-pointer`;
}

function getWordButtonTitle(isStudied: boolean, isSelected: boolean): string {
  if (isStudied) return 'Ya estudiada';
  if (isSelected) return 'Click para quitar';
  return 'Click para añadir';
}

function pluralizeCards(count: number): string {
  return count === 1 ? 'card' : 'cards';
}

export function WordSelector({
  transcript,
  source,
  onWordsAdded,
}: WordSelectorProps) {
  const { addWord, isWordStudied } = useWordDictionaryStore();
  const { addCards } = useSRSStore();
  const { addXP } = useGamificationStore();
  const { activeLanguage, activeLevel } = useProgressStore();
  
  const [selectedWords, setSelectedWords] = useState<Map<string, SelectedWord>>(new Map());
  const [isCreating, setIsCreating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Dividir texto en palabras clickeables y detectar keywords
  const wordsWithContext = useMemo(() => {
    // Dividir en frases primero
    const sentenceEndings = /[.!?]\s+/;
    const sentences = transcript.split(sentenceEndings);

    // Extraer keywords de todas las frases
    const allKeywords = extractKeywords(transcript);
    const keywordsSet = new Set(allKeywords.map(k => k.normalized));

    const createWordData = (
      word: string,
      normalized: string,
      sentence: string,
      sentenceIndex: number,
      position: number
    ): typeof wordsWithContext[0] | null => {
      const isKeyword = keywordsSet.has(normalized);
      const keywordInfo = allKeywords.find(k => k.normalized === normalized);

      return {
        word,
        normalized,
        sentence: sentence.trim(),
        sentenceIndex,
        position,
        isKeyword,
        ...(keywordInfo?.type !== undefined && { wordType: keywordInfo.type }),
      };
    };

    const processSentence = (sentence: string, sentenceIndex: number) => {
      const sentenceWords = sentence.split(/\s+/).filter(w => w.length > 0);
      return sentenceWords.map((word, position) => {
        const cleaned = word.replace(/[.,;:!?()[\]{}'"]/g, '');
        if (cleaned.length < 3) return null;

        const normalized = normalizeWord(cleaned);
        return createWordData(cleaned, normalized, sentence, sentenceIndex, position);
      }).filter((w): w is typeof wordsWithContext[0] => w !== null);
    };

    const words: Array<{
      word: string;
      normalized: string;
      sentence: string;
      sentenceIndex: number;
      position: number;
      isKeyword: boolean;
      wordType?: ExtractedWord['type'];
    }> = [];

    sentences.forEach((sentence, sentenceIndex) => {
      words.push(...processSentence(sentence, sentenceIndex));
    });

    return words;
  }, [transcript]);

  // Manejar click en palabra
  const handleWordClick = useCallback((wordData: typeof wordsWithContext[0]) => {
    const normalized = wordData.normalized;
    
    // Si ya está seleccionada, quitarla
    if (selectedWords.has(normalized)) {
      const newMap = new Map(selectedWords);
      newMap.delete(normalized);
      setSelectedWords(newMap);
      return;
    }

    // Verificar si ya está estudiada
    if (isWordStudied(normalized)) {
      return; // No añadir palabras ya estudiadas
    }

    // Extraer tipo de palabra
    const extracted = extractKeywords(wordData.sentence);
    const wordInfo = extracted.find(w => w.normalized === normalized);

    if (!wordInfo) return;

    // Añadir palabra seleccionada
    const newWord: SelectedWord = {
      ...wordInfo,
      contextPhrase: wordData.sentence,
    };

    setSelectedWords(prev => {
      const newMap = new Map(prev);
      newMap.set(normalized, newWord);
      return newMap;
    });

    // Traducir automáticamente
    translateWords([wordData.word]).then(trans => {
      if (trans[wordData.word]) {
        setTranslations(prev => ({
          ...prev,
          [normalized]: trans[wordData.word],
        }));
      }
    });
  }, [selectedWords, isWordStudied]);

  // Crear cards
  const handleCreateCards = useCallback(async () => {
    if (selectedWords.size === 0) return;

    setIsCreating(true);
    try {
      const wordsArray = Array.from(selectedWords.values());
      
      const cardsToCreate = wordsArray.map(word => ({
        phrase: word.word,
        translation: translations[word.normalized] || word.word,
        source: {
          ...source,
          context: `Ejemplo: "${word.contextPhrase}"`,
        },
        languageCode: activeLanguage,
        levelCode: activeLevel,
        tags: [
          source.type === 'video' || source.type === 'audio' ? source.type : 'text',
          'transcript',
          'word',
          word.type,
        ],
        notes: `Tipo: ${word.type}. Contexto: "${word.contextPhrase}"`,
      }));

      const createdCards = addCards(cardsToCreate);

      // Actualizar diccionario
      wordsArray.forEach((word, index) => {
        if (createdCards[index]) {
          addWord(word.word, word.type, createdCards[index].id);
        }
      });

      addXP(cardsToCreate.length * 15);
      onWordsAdded?.(cardsToCreate.length);

      // Limpiar selección
      setSelectedWords(new Map());
      setTranslations({});

      alert(`✓ ${cardsToCreate.length} ${cardsToCreate.length === 1 ? 'palabra añadida' : 'palabras añadidas'} al deck`);
    } catch (_error) {
      // TODO: Add proper logging service for card creation errors
      alert('Error al crear las cards');
    } finally {
      setIsCreating(false);
    }
  }, [selectedWords, translations, source, activeLanguage, activeLevel, addCards, addWord, addXP, onWordsAdded]);

  return (
    <div className="space-y-4">
      {/* Texto con palabras clickeables */}
      <div className="bg-white dark:bg-calm-bg-elevated rounded-lg p-4 border border-calm-warm-100 dark:border-calm-warm-200">
        <p className="text-sm text-calm-text-secondary dark:text-calm-text-tertiary leading-relaxed">
          {wordsWithContext.map((wordData, index) => {
            const normalized = wordData.normalized;
            const isSelected = selectedWords.has(normalized);
            const isStudied = isWordStudied(normalized);
            const uniqueKey = `${wordData.sentenceIndex}-${wordData.position}-${wordData.normalized}`;

            // Si no es palabra clave, mostrar normal
            if (!wordData.isKeyword) {
              return <span key={uniqueKey}>{wordData.word} </span>;
            }

            return (
              <button
                key={uniqueKey}
                onClick={() => handleWordClick(wordData)}
                disabled={isStudied}
                className={getWordButtonClassName(isSelected, isStudied)}
                title={getWordButtonTitle(isStudied, isSelected)}
              >
                {wordData.word}
              </button>
            );
          })}
        </p>
      </div>

      {/* Lista de palabras seleccionadas - Compacta en la parte inferior */}
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
              }}
              className="text-xs text-calm-text-muted dark:text-calm-text-muted hover:text-calm-text-secondary dark:hover:text-calm-text-tertiary"
            >
              Limpiar
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from(selectedWords.values()).map((word) => (
              <motion.div
                key={word.normalized}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 bg-sky-50 dark:bg-accent-900/30 rounded border border-accent-200 dark:border-accent-700"
              >
                <span className="text-xs font-medium text-accent-900 dark:text-accent-100">
                  {word.word}
                </span>
                {translations[word.normalized] && (
                  <span className="text-xs text-accent-600 dark:text-accent-400">
                    → {translations[word.normalized]}
                  </span>
                )}
                <button
                  onClick={() => {
                    const newMap = new Map(selectedWords);
                    newMap.delete(word.normalized);
                    setSelectedWords(newMap);
                  }}
                  className="ml-1 text-accent-600 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-200"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>

          <button
            onClick={handleCreateCards}
            disabled={isCreating}
            className="w-full py-2 bg-accent-600 hover:bg-accent-700 disabled:bg-calm-warm-100 dark:disabled:bg-calm-bg-tertiary text-white disabled:text-calm-text-muted font-medium rounded-lg transition-colors"
          >
            {isCreating ? 'Creando...' : `Crear ${selectedWords.size} ${pluralizeCards(selectedWords.size)}`}
          </button>
        </motion.div>
      )}
    </div>
  );
}

