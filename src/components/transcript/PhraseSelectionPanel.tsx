'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSRSStore } from '@/store/useSRSStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useWordDictionaryStore } from '@/store/useWordDictionaryStore';
import { translateWords } from '@/services/translationService';
import { SelectedPhrase } from './TranscriptSelector';
import { ContentSource } from '@/types/srs';
import { extractKeywordsFromPhrases, type ExtractedWord } from '@/services/wordExtractor';
// Iconos simples usando emojis y símbolos
const IconX = () => <span>✕</span>;
const IconPlus = () => <span>+</span>;

interface PhraseSelectionPanelProps {
  selectedPhrases: SelectedPhrase[];
  source: ContentSource;
  onClose?: () => void;
  onPhrasesAdded?: (count: number) => void;
}

export function PhraseSelectionPanel({
  selectedPhrases,
  source,
  onClose,
  onPhrasesAdded,
}: PhraseSelectionPanelProps) {
  const { addCards } = useSRSStore();
  const { addXP } = useGamificationStore();
  const { activeLanguage, activeLevel } = useProgressStore();
  const { getNewWords, addWord, isWordStudied } = useWordDictionaryStore();
  
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showWordExtraction, setShowWordExtraction] = useState(true);

  // Extraer palabras clave de las frases seleccionadas
  const extractedWords = useMemo(() => {
    const phrases = selectedPhrases.map(p => p.text);
    return extractKeywordsFromPhrases(phrases);
  }, [selectedPhrases]);

  // Filtrar solo palabras nuevas (no estudiadas)
  const newWords = useMemo(() => {
    const wordStrings = extractedWords.map(w => w.normalized);
    const newWordStrings = getNewWords(wordStrings);
    return extractedWords.filter(w => newWordStrings.includes(w.normalized));
  }, [extractedWords, getNewWords]);

  // Agrupar palabras por tipo
  const wordsByType = useMemo(() => {
    const grouped: Record<string, ExtractedWord[]> = {
      verb: [],
      noun: [],
      adverb: [],
      adjective: [],
      other: [],
    };
    
    newWords.forEach(word => {
      grouped[word.type].push(word);
    });
    
    return grouped;
  }, [newWords]);

  // Traducir automáticamente las palabras nuevas cuando cambian
  const newWordsKeys = useMemo(() => 
    newWords.map(w => w.normalized).sort().join(','), 
    [newWords]
  );

  useEffect(() => {
    if (newWords.length === 0) return;

    const translateNewWords = async () => {
      setIsTranslating(true);
      try {
        const wordsToTranslate = newWords
          .filter(word => !translations[word.normalized])
          .map(word => word.word);
        
        if (wordsToTranslate.length > 0) {
          const newTranslations = await translateWords(wordsToTranslate);
          
          // Mapear traducciones usando normalized como key
          const normalizedTranslations: Record<string, string> = {};
          newWords.forEach(word => {
            if (newTranslations[word.word]) {
              normalizedTranslations[word.normalized] = newTranslations[word.word];
            }
          });
          
          setTranslations(prev => ({
            ...prev,
            ...normalizedTranslations,
          }));
        }
      } catch (error) {
        console.error('Error translating words:', error);
      } finally {
        setIsTranslating(false);
      }
    };

    translateNewWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newWordsKeys]); // Solo cuando cambian las palabras nuevas

  const handleCreateCards = useCallback(async () => {
    if (newWords.length === 0) {
      alert('No hay palabras nuevas para estudiar. Todas las palabras clave ya están en tu diccionario.');
      return;
    }

    setIsCreating(true);
    
    try {
      // Crear cards para palabras individuales (no frases completas)
      // Cada card será para una palabra con su contexto
      // Crear cards para todas las palabras nuevas (ya tienen traducción automática)
      const cardsToCreate = newWords
        .map(word => {
          // Encontrar la frase original donde aparece esta palabra
          const originalPhrase = selectedPhrases.find(p => 
            p.text.toLowerCase().includes(word.word.toLowerCase())
          ) || selectedPhrases[0];

          // Crear frase de ejemplo con la palabra destacada
          const examplePhrase = originalPhrase.text;
          
          return {
            phrase: word.word, // La palabra individual
            translation: translations[word.normalized]?.trim() || word.word, // Usar traducción automática o palabra original como fallback
            source: {
              ...source,
              context: `Ejemplo: "${examplePhrase}"`,
              timestamp: originalPhrase.start ?? source.timestamp,
            },
            languageCode: activeLanguage,
            levelCode: activeLevel,
            tags: [
              source.type === 'video' ? 'video' : source.type === 'audio' ? 'audio' : 'text',
              'transcript',
              'word',
              word.type, // 'verb', 'noun', 'adverb', 'adjective'
            ],
            notes: `Tipo: ${word.type}. Contexto: ${originalPhrase.contextBefore ? `...${originalPhrase.contextBefore}` : ''} [${examplePhrase}] ${originalPhrase.contextAfter ? `${originalPhrase.contextAfter}...` : ''}`,
          };
        });

      if (cardsToCreate.length === 0) {
        alert('No hay palabras nuevas para crear cards');
        setIsCreating(false);
        return;
      }

      // Crear las cards
      const createdCards = addCards(cardsToCreate);
      
      // Actualizar diccionario: marcar palabras como estudiadas
      createdCards.forEach((card, index) => {
        const word = newWords[index];
        if (word) {
          addWord(word.word, word.type, card.id);
        }
      });
      
      // Dar XP por crear cards
      addXP(cardsToCreate.length * 15); // 15 XP por card creado
      
      onPhrasesAdded?.(cardsToCreate.length);
      
      // Limpiar selecciones
      setTranslations({});
      
      alert(`✓ ${cardsToCreate.length} palabra${cardsToCreate.length !== 1 ? 's' : ''} nueva${cardsToCreate.length !== 1 ? 's' : ''} añadida${cardsToCreate.length !== 1 ? 's' : ''} al deck`);
    } catch (error) {
      console.error('Error creating cards:', error);
      alert('Error al crear las cards. Por favor, intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  }, [newWords, selectedPhrases, translations, source, activeLanguage, activeLevel, addCards, addXP, addWord, onPhrasesAdded]);

  // Todas las palabras nuevas tienen traducción automática
  const canCreateCards = newWords.length > 0 && !isTranslating;
  
  const totalStudiedWords = extractedWords.filter(w => isWordStudied(w.normalized)).length;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="fixed right-4 top-20 bottom-24 w-[400px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-xl z-40 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Palabras clave extraídas
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {newWords.length} nuevas • {totalStudiedWords} ya estudiadas • {extractedWords.length} total
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <IconX />
          </button>
        )}
      </div>

      {/* Toggle para mostrar/ocultar extracción de palabras */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setShowWordExtraction(!showWordExtraction)}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {showWordExtraction ? 'Ocultar' : 'Mostrar'} extracción de palabras
        </button>
      </div>

      {/* Lista de palabras extraídas */}
      {showWordExtraction && (
        <div className="space-y-4 flex-1 overflow-y-auto mb-4">
          {/* Palabras nuevas por tipo */}
          {Object.entries(wordsByType).map(([type, words]) => {
            if (words.length === 0) return null;
            
            const typeLabels: Record<string, string> = {
              verb: 'Verbos',
              noun: 'Sustantivos',
              adverb: 'Adverbios',
              adjective: 'Adjetivos',
              other: 'Otras',
            };
            
            const typeColors: Record<string, string> = {
              verb: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
              noun: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
              adverb: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
              adjective: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
              other: 'bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600',
            };
            
            return (
              <div key={type} className={`p-3 rounded-lg border ${typeColors[type]}`}>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {typeLabels[type]} ({words.length})
                </h4>
                <div className="space-y-2">
                  {words.map((word) => {
                    const isStudied = isWordStudied(word.normalized);
                    const originalPhrase = selectedPhrases.find(p => 
                      p.text.toLowerCase().includes(word.word.toLowerCase())
                    );
                    
                    return (
                      <motion.div
                        key={word.normalized}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-2 rounded border ${
                          isStudied 
                            ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isStudied ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                              {word.word}
                            </p>
                            {originalPhrase && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                                &ldquo;{originalPhrase.text.substring(0, 60)}...&rdquo;
                              </p>
                            )}
                          </div>
                          {isStudied && (
                            <span className="text-xs text-green-600 dark:text-green-400">✓ Estudiada</span>
                          )}
                        </div>
                        
                        {!isStudied && (
                          <div className="mt-1">
                            {isTranslating && !translations[word.normalized] ? (
                              <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                                Traduciendo...
                              </div>
                            ) : (
                              <div className="px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                                {translations[word.normalized] || word.word}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {newWords.length === 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ Todas las palabras clave ya están estudiadas
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer con acciones */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isTranslating ? (
            <span>Traduciendo {newWords.length} palabra{newWords.length !== 1 ? 's' : ''}...</span>
          ) : (
            <span>{newWords.length} palabra{newWords.length !== 1 ? 's' : ''} nueva{newWords.length !== 1 ? 's' : ''} lista{newWords.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <button
          onClick={handleCreateCards}
          disabled={!canCreateCards || isCreating}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
            ${canCreateCards && !isCreating
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <IconPlus />
          {isCreating ? 'Creando...' : `Crear ${newWords.length} card${newWords.length !== 1 ? 's' : ''} (Cloze/Detection)`}
        </button>
      </div>
    </motion.div>
  );
}

