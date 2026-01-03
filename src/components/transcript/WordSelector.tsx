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

export function WordSelector({
  transcript,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  phrases,
  source,
  onWordsAdded,
}: WordSelectorProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { getNewWords, addWord, isWordStudied } = useWordDictionaryStore();
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
      const sentenceWords = sentence.split(/\s+/).filter(w => w.length > 0);
      sentenceWords.forEach((word, position) => {
        const cleaned = word.replace(/[.,;:!?()\[\]{}'"]/g, '');
        if (cleaned.length >= 3) {
          const normalized = normalizeWord(cleaned);
          const isKeyword = keywordsSet.has(normalized);
          const keywordInfo = allKeywords.find(k => k.normalized === normalized);
          
          words.push({
            word: cleaned,
            normalized,
            sentence: sentence.trim(),
            sentenceIndex,
            position,
            isKeyword,
            wordType: keywordInfo?.type,
          });
        }
      });
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
          source.type === 'video' ? 'video' : source.type === 'audio' ? 'audio' : 'text',
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

      alert(`✓ ${cardsToCreate.length} palabra${cardsToCreate.length !== 1 ? 's' : ''} añadida${cardsToCreate.length !== 1 ? 's' : ''} al deck`);
    } catch (error) {
      console.error('Error creating cards:', error);
      alert('Error al crear las cards');
    } finally {
      setIsCreating(false);
    }
  }, [selectedWords, translations, source, activeLanguage, activeLevel, addCards, addWord, addXP, onWordsAdded]);

  return (
    <div className="space-y-4">
      {/* Texto con palabras clickeables */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {wordsWithContext.map((wordData, index) => {
            const normalized = wordData.normalized;
            const isSelected = selectedWords.has(normalized);
            const isStudied = isWordStudied(normalized);

            // Si no es palabra clave, mostrar normal
            if (!wordData.isKeyword) {
              return <span key={index}>{wordData.word} </span>;
            }

            return (
              <button
                key={index}
                onClick={() => handleWordClick(wordData)}
                disabled={isStudied}
                className={`
                  inline-block px-1 py-0.5 mx-0.5 rounded transition-all
                  ${isSelected
                    ? 'bg-indigo-500 text-white font-medium'
                    : isStudied
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 cursor-pointer'
                  }
                `}
                title={isStudied ? 'Ya estudiada' : isSelected ? 'Click para quitar' : 'Click para añadir'}
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
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Palabras seleccionadas ({selectedWords.size})
            </h3>
            <button
              onClick={() => {
                setSelectedWords(new Map());
                setTranslations({});
              }}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
                className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded border border-indigo-200 dark:border-indigo-700"
              >
                <span className="text-xs font-medium text-indigo-900 dark:text-indigo-100">
                  {word.word}
                </span>
                {translations[word.normalized] && (
                  <span className="text-xs text-indigo-600 dark:text-indigo-400">
                    → {translations[word.normalized]}
                  </span>
                )}
                <button
                  onClick={() => {
                    const newMap = new Map(selectedWords);
                    newMap.delete(word.normalized);
                    setSelectedWords(newMap);
                  }}
                  className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>

          <button
            onClick={handleCreateCards}
            disabled={isCreating}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 font-medium rounded-lg transition-colors"
          >
            {isCreating ? 'Creando...' : `Crear ${selectedWords.size} card${selectedWords.size !== 1 ? 's' : ''}`}
          </button>
        </motion.div>
      )}
    </div>
  );
}

