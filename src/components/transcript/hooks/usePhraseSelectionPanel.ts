import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSRSStore } from '@/store/useSRSStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useWordDictionaryStore } from '@/store/useWordDictionaryStore';
import { translateWords } from '@/services/translationService';
import { SelectedPhrase } from '../TranscriptSelector';
import { ContentSource } from '@/types/srs';
import { extractKeywordsFromPhrases, type ExtractedWord } from '@/services/wordExtractor';

// ============================================================
// TYPES
// ============================================================

export interface PhraseSelectionPanelData {
  translations: Record<string, string>;
  isCreating: boolean;
  isTranslating: boolean;
  showWordExtraction: boolean;
  extractedWords: ExtractedWord[];
  newWords: ExtractedWord[];
  wordsByType: Record<string, ExtractedWord[]>;
  canCreateCards: boolean;
  totalStudiedWords: number;
  newWordsCount: number;
  extractedWordsCount: number;
}

export interface PhraseSelectionPanelActions {
  setShowWordExtraction: (show: boolean) => void;
  handleCreateCards: () => Promise<void>;
}

export interface UsePhraseSelectionPanelParams {
  selectedPhrases: SelectedPhrase[];
  source: ContentSource;
  onPhrasesAdded?: (count: number) => void;
}

// ============================================================
// CONSTANTS
// ============================================================

const CONTEXT_PREFIX = '...';
const CONTEXT_SUFFIX = '...';
const XP_PER_CARD = 15;

// ============================================================
// CUSTOM HOOK
// ============================================================

export function usePhraseSelectionPanel({
  selectedPhrases,
  source,
  onPhrasesAdded,
}: UsePhraseSelectionPanelParams): [PhraseSelectionPanelData, PhraseSelectionPanelActions] {
  // Store hooks
  const { addCards } = useSRSStore();
  const { addXP } = useGamificationStore();
  const { activeLanguage, activeLevel } = useProgressStore();
  const { getNewWords, addWord, isWordStudied } = useWordDictionaryStore();

  // State hooks
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showWordExtraction, setShowWordExtraction] = useState(true);

  // Memoized values: extracted words from selected phrases
  const extractedWords = useMemo(() => {
    const phrases = selectedPhrases.map(p => p.text);
    return extractKeywordsFromPhrases(phrases);
  }, [selectedPhrases]);

  // Memoized values: filter only new (non-studied) words
  const newWords = useMemo(() => {
    const wordStrings = extractedWords.map(w => w.normalized);
    const newWordStrings = getNewWords(wordStrings);
    return extractedWords.filter(w => newWordStrings.includes(w.normalized));
  }, [extractedWords, getNewWords]);

  // Memoized values: group words by type
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

  // Memoized value: key for detecting changes in new words
  const newWordsKeys = useMemo(() =>
    newWords.map(w => w.normalized).sort().join(','),
    [newWords]
  );

  // Effect: translate new words automatically when they change
  useEffect(() => {
    if (newWords.length === 0) return;

    const translateNewWords = async () => {
      setIsTranslating(true);
      try {
        const wordsToTranslate = newWords
          .filter(word => !translations[word.normalized])
          .map(word => word.word);

        if (wordsToTranslate.length === 0) return;

        const newTranslations = await translateWords(wordsToTranslate);

        // Map translations using normalized as key
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
      } catch (error) {
        import('@/services/logger').then(({ logger }) => {
          logger.serviceError('usePhraseSelectionPanel', 'Error translating new words', error);
        });
      } finally {
        setIsTranslating(false);
      }
    };

    translateNewWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newWordsKeys]); // Only when new words change

  // Callback: find original phrase for a word
  const findOriginalPhrase = useCallback((word: ExtractedWord) => {
    return selectedPhrases.find(p =>
      p.text.toLowerCase().includes(word.word.toLowerCase())
    ) || selectedPhrases[0];
  }, [selectedPhrases]);

  // Callback: create card data for a word
  const createCardData = useCallback((word: ExtractedWord) => {
    const originalPhrase = findOriginalPhrase(word);
    const examplePhrase = originalPhrase.text;
    const sourceTypeTag = source.type === 'video' || source.type === 'audio' ? source.type : 'text';

    // Build context in a readable way
    const contextBefore = originalPhrase.contextBefore
      ? `${CONTEXT_PREFIX}${originalPhrase.contextBefore} `
      : '';
    const contextAfter = originalPhrase.contextAfter
      ? ` ${originalPhrase.contextAfter}${CONTEXT_SUFFIX}`
      : '';
    const context = `${contextBefore}[${examplePhrase}]${contextAfter}`;

    return {
      phrase: word.word,
      translation: translations[word.normalized]?.trim() || word.word,
      source: {
        ...source,
        context: `Ejemplo: "${examplePhrase}"`,
        timestamp: originalPhrase.start ?? source.timestamp,
      },
      languageCode: activeLanguage,
      levelCode: activeLevel,
      tags: [sourceTypeTag, 'transcript', 'word', word.type],
      notes: `Tipo: ${word.type}. Contexto: ${context}`,
    };
  }, [findOriginalPhrase, translations, source, activeLanguage, activeLevel]);

  // Callback: handle create cards
  const handleCreateCards = useCallback(async () => {
    if (newWords.length === 0) {
      alert('No hay palabras nuevas para estudiar. Todas las palabras clave ya están en tu diccionario.');
      return;
    }

    setIsCreating(true);

    try {
      const cardsToCreate = newWords.map(createCardData);

      if (cardsToCreate.length === 0) {
        alert('No hay palabras nuevas para crear cards');
        setIsCreating(false);
        return;
      }

      const createdCards = addCards(cardsToCreate);

      createdCards.forEach((card, index) => {
        const word = newWords[index];
        if (word) {
          addWord(word.word, word.type, card.id);
        }
      });

      addXP(cardsToCreate.length * XP_PER_CARD);
      onPhrasesAdded?.(cardsToCreate.length);
      setTranslations({});

      const singular = 'palabra nueva añadida';
      const plural = 'palabras nuevas añadidas';
      alert(`✓ ${cardsToCreate.length} ${cardsToCreate.length === 1 ? singular : plural} al deck`);
    } catch (error) {
      import('@/services/logger').then(({ logger }) => {
        logger.serviceError('usePhraseSelectionPanel', 'Error al crear las cards', error);
      });
      alert('Error al crear las cards. Por favor, intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  }, [newWords, createCardData, addCards, addXP, addWord, onPhrasesAdded]);

  // Computed values
  const canCreateCards = newWords.length > 0 && !isTranslating;
  const totalStudiedWords = extractedWords.filter(w => isWordStudied(w.normalized)).length;

  // Data object
  const data: PhraseSelectionPanelData = {
    translations,
    isCreating,
    isTranslating,
    showWordExtraction,
    extractedWords,
    newWords,
    wordsByType,
    canCreateCards,
    totalStudiedWords,
    newWordsCount: newWords.length,
    extractedWordsCount: extractedWords.length,
  };

  // Actions object
  const actions: PhraseSelectionPanelActions = {
    setShowWordExtraction,
    handleCreateCards,
  };

  return [data, actions];
}
