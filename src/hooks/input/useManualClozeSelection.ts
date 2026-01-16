/**
 * Hook para crear subtópicos cloze manuales desde selección de palabras
 * Permite a los usuarios seleccionar palabras específicas de una transcripción
 * y crear subtópicos con formato cloze verdadero (oración completa con palabra objetivo oculta)
 */

import { useState, useCallback, useMemo } from 'react';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { useProgressStore } from '@/store/useProgressStore';
import {
  extractWordsWithContext,
  type WordWithContext,
  type SentenceContext,
} from '@/services/contextExtractionService';
import { extractTargetWordIndex } from '@/services/clozeExerciseService';
import type { ContentSource } from '@/types/srs';

// ============================================================
// TYPES
// ============================================================

export interface WordSelectionContext {
  word: WordWithContext;
  sentence: SentenceContext;
  translation?: string;
  isTranslating?: boolean;
}

export interface ManualClozeSelectionData {
  selectedWords: Map<string, WordSelectionContext>;
  translations: Record<string, string>;
  isCreating: boolean;
  isTranslating: boolean;
  selectedCount: number;
  sentencesByWord: Record<string, string>; // wordId -> full sentence
  wordPositionsInSentence: Record<string, number>; // wordId -> position index
}

export interface ManualClozeSelectionActions {
  handleWordClick: (word: WordWithContext, sentence: SentenceContext, sentenceIndex: number) => void;
  handleRemoveWord: (wordId: string) => void;
  handleClearSelection: () => void;
  handleCreateSubtopic: (
    nodeId: string,
    subtopicTitle: string,
    source: ContentSource
  ) => { success: boolean; subtopicId?: string; message: string };
  handleTranslateWord: (word: WordWithContext) => Promise<void>;
  setSelectedWordId: (wordId: string) => void;
  setSelectedSentenceIndex: (index: number) => void;
}

export interface UseManualClozeSelectionOptions {
  transcript: string;
  onSubtopicCreated?: (subtopicId: string) => void;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function pluralizeWords(count: number): string {
  return count === 1 ? 'palabra' : 'palabras';
}

// ============================================================
// MAIN HOOK
// ============================================================

export function useManualClozeSelection(
  options: UseManualClozeSelectionOptions
): [ManualClozeSelectionData, ManualClozeSelectionActions] {
  const { transcript, onSubtopicCreated } = options;

  // Stores
  const { addSubtopic } = useImportedNodesStore();
  const { activeLanguage } = useProgressStore();

  // Estado local
  const [selectedWords, setSelectedWords] = useState<Map<string, WordSelectionContext>>(new Map());
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<string>('');
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number>(-1);

  // Extraer palabras con contexto (memoizado)
  const extractionResult = useMemo(() => {
    return extractWordsWithContext(transcript, activeLanguage);
  }, [transcript, activeLanguage]);

  // Manejar click en palabra
  const handleWordClick = useCallback((
    word: WordWithContext,
    sentence: SentenceContext,
    sentenceIndex: number
  ) => {
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
  }, [selectedWords, selectedWordId]);

  // Manejar eliminación de palabra
  const handleRemoveWord = useCallback((wordId: string) => {
    const newMap = new Map(selectedWords);
    newMap.delete(wordId);
    setSelectedWords(newMap);

    if (selectedWordId === wordId) {
      setSelectedWordId('');
    }
  }, [selectedWords, selectedWordId]);

  // Manejar limpieza de selección
  const handleClearSelection = useCallback(() => {
    setSelectedWords(new Map());
    setTranslations({});
    setSelectedWordId('');
    setSelectedSentenceIndex(-1);
  }, []);

  // Traducir una palabra individual
  const handleTranslateWord = useCallback(async (word: WordWithContext) => {
    setIsTranslating(true);
    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { translateWords } = await import('@/services/translationService');
      const trans = await translateWords([word.word]);

      if (trans[word.word]) {
        setTranslations(prev => ({
          ...prev,
          [word.id]: trans[word.word],
        }));
      }
    } catch (error) {
      console.warn('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Crear subtópico cloze manual
  const handleCreateSubtopic = useCallback((
    nodeId: string,
    subtopicTitle: string,
    source: ContentSource
  ) => {
    if (selectedWords.size === 0) {
      return {
        success: false,
        message: 'No hay palabras seleccionadas'
      };
    }

    setIsCreating(true);
    try {
      const wordsArray = Array.from(selectedWords.values());

      // Agrupar palabras por oración para crear frases únicas
      const sentencesMap = new Map<string, WordWithContext[]>();
      for (const selection of wordsArray) {
        const sentenceId = selection.sentence.id;
        if (!sentencesMap.has(sentenceId)) {
          sentencesMap.set(sentenceId, []);
        }
        sentencesMap.get(sentenceId)!.push(selection.word);
      }

      // Crear array de frases (una por oración única)
      const phrases: string[] = [];
      const targetWordIndices: number[][] = [];

      for (const [sentenceId, wordsInSentence] of Array.from(sentencesMap.entries())) {
        // Obtener la primera selección para esta oración
        const firstSelection = wordsArray.find(w => w.sentence.id === sentenceId);
        if (!firstSelection) continue;

        const fullSentence = firstSelection.sentence.text;
        phrases.push(fullSentence);

        // Calcular índices de palabras objetivo en esta oración
        const indices: number[] = [];
        for (const word of wordsInSentence) {
          const wordIndex = extractTargetWordIndex(fullSentence, word.word);
          if (wordIndex !== -1) {
            indices.push(wordIndex);
          }
        }
        targetWordIndices.push(indices);
      }

      // Crear subtópico con formato cloze manual
      addSubtopic(nodeId, {
        title: subtopicTitle,
        phrases,
        language: activeLanguage,
        clozeMetadata: {
          targetWordIndices,
          isManualSelection: true,
        },
      });

      // Traducir todas las palabras
      for (const selection of wordsArray) {
        if (!translations[selection.word.id]) {
          handleTranslateWord(selection.word);
        }
      }

      // Limpiar selección
      handleClearSelection();

      // Notificar callback (sin subtopicId ya que addSubtopic no retorna nada)
      if (onSubtopicCreated) {
        onSubtopicCreated('');
      }

      return {
        success: true,
        subtopicId: undefined,
        message: `✓ ${wordsArray.length} ${pluralizeWords(wordsArray.length)} añadidas al subtópico "${subtopicTitle}" con formato cloze verdadero`
      };
    } catch (error) {
      console.error('Error creating manual cloze subtopic:', error);
      return {
        success: false,
        message: 'Error al crear el subtópico cloze manual'
      };
    } finally {
      setIsCreating(false);
    }
  }, [selectedWords, translations, activeLanguage, addSubtopic, handleClearSelection, handleTranslateWord, onSubtopicCreated]);

  // Datos computados
  const data: ManualClozeSelectionData = useMemo(() => {
    // Crear mapa de oraciones completas por palabra
    const sentencesByWord: Record<string, string> = {};
    const wordPositionsInSentence: Record<string, number> = {};

    for (const [wordId, selection] of Array.from(selectedWords.entries())) {
      sentencesByWord[wordId] = selection.sentence.text;
      wordPositionsInSentence[wordId] = selection.word.position.word;
    }

    return {
      selectedWords,
      translations,
      isCreating,
      isTranslating,
      selectedCount: selectedWords.size,
      sentencesByWord,
      wordPositionsInSentence,
    };
  }, [selectedWords, translations, isCreating, isTranslating]);

  // Acciones
  const actions: ManualClozeSelectionActions = useMemo(() => ({
    handleWordClick,
    handleRemoveWord,
    handleClearSelection,
    handleCreateSubtopic,
    handleTranslateWord,
    setSelectedWordId,
    setSelectedSentenceIndex,
  }), [handleWordClick, handleRemoveWord, handleClearSelection, handleCreateSubtopic, handleTranslateWord]);

  return [data, actions];
}
