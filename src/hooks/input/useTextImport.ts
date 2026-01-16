/**
 * Hook para importación de texto con análisis y procesamiento
 * Provides text analysis, block splitting, phrase extraction, and import functionality
 */

import { useState, useCallback, useMemo } from 'react';
import { useProgressStore } from '@/store/useProgressStore';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { useInputStore } from '@/store/useInputStore';
import {
  extractPhrases,
  calculateWordCount,
  calculatePhraseCount,
  generateSuggestedTitle,
  extractGrammaticalCategoriesFromText,
  getGrammaticalCategoryStats,
  generateClozeExercises,
  type ClozeExercise,
} from '@/services/importFlowService';
import type { ContentSource } from '@/types/srs';
import type { ExtractionResult } from '@/schemas/posTagging';

// ============================================================
// TYPES
// ============================================================

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface TextImportData {
  content: string;
  wordCount: number;
  phraseCount: number;
  language: string;
  difficulty: DifficultyLevel;
  blocks: TextBlock[];
  suggestedTitle: string;
  grammaticalCategories?: ExtractionResult;
}

export interface TextBlock {
  id: string;
  content: string;
  wordRange: [number, number]; // [startIndex, endIndex] en palabras
  wordCount: number;
  estimatedReadingTime: number; // en segundos
}

export interface ImportResult {
  nodeId: string;
  phraseCount: number;
  exerciseCount: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const MAX_TEXT_LENGTH = 10_000;
const MIN_TEXT_LENGTH = 20;
const WORDS_PER_BLOCK = 150; // ~100-200 palabras por bloque
const READING_SPEED_WPM = 200; // palabras por minuto
const FRANCOPHONE_LANGUAGES = ['fr', 'fr-FR', 'french', 'français'];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Detecta si el texto es principalmente francés
 */
function detectLanguage(text: string): string {
  // Palabras francesas características
  const frenchMarkers = [
    'le ', 'la ', 'les ', 'un ', 'une ', 'des ', 'et ', 'ou ', 'mais ',
    'donc ', 'alors ', 'quand ', 'pour ', 'avec ', 'sans ', 'sur ', 'dans ',
    'est ', 'sont ', 'être ', 'avoir ', 'faire ', 'voir ', 'dire ', 'venir ',
    'bonjour ', 'merci ', 's il vous plaît ', "d'accord",
  ];

  const lowerText = text.toLowerCase();
  const matchCount = frenchMarkers.reduce((count, marker) => {
    return count + (lowerText.includes(marker) ? 1 : 0);
  }, 0);

  // Si hay suficientes marcadores franceses, es francés
  if (matchCount > 5) {
    return 'fr';
  }

  // Por defecto, francés (aplicación de aprendizaje de francés)
  return 'fr';
}

/**
 * Estima la dificultad del texto basado en longitud y complejidad
 */
function estimateDifficulty(text: string, wordCount: number): DifficultyLevel {
  // Factor 1: Longitud del texto
  if (wordCount < 100) return 'beginner';
  if (wordCount > 500) return 'advanced';

  // Factor 2: Complejidad de palabras
  const avgWordLength = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / wordCount;
  if (avgWordLength > 6) return 'advanced';
  if (avgWordLength > 5) return 'intermediate';

  // Factor 3: Oraciones complejas (presencia de comas, puntos y coma)
  const complexPunctuation = (text.match(/[,;]/g) || []).length;
  const sentenceCount = (text.match(/[.!?]/g) || []).length;
  if (sentenceCount > 0 && complexPunctuation / sentenceCount > 1) {
    return 'advanced';
  }

  return 'beginner';
}

/**
 * Genera un ID único para un bloque
 */
function generateBlockId(index: number): string {
  return `block-${Date.now()}-${index}`;
}

/**
 * Divide el texto en bloques de tamaño manejable
 */
function splitIntoBlocks(text: string, maxWords: number = WORDS_PER_BLOCK): TextBlock[] {
  const words = text.split(/\s+/);
  const blocks: TextBlock[] = [];
  let currentBlockWords: string[] = [];
  let wordIndex = 0;

  for (const word of words) {
    currentBlockWords.push(word);

    if (currentBlockWords.length >= maxWords) {
      const content = currentBlockWords.join(' ');
      blocks.push({
        id: generateBlockId(blocks.length),
        content,
        wordRange: [wordIndex - currentBlockWords.length + 1, wordIndex],
        wordCount: currentBlockWords.length,
        estimatedReadingTime: Math.ceil((currentBlockWords.length / READING_SPEED_WPM) * 60),
      });

      currentBlockWords = [];
    }

    wordIndex++;
  }

  // Añadir el último bloque si tiene contenido
  if (currentBlockWords.length > 0) {
    const content = currentBlockWords.join(' ');
    blocks.push({
      id: generateBlockId(blocks.length),
      content,
      wordRange: [wordIndex - currentBlockWords.length + 1, wordIndex],
      wordCount: currentBlockWords.length,
      estimatedReadingTime: Math.ceil((currentBlockWords.length / READING_SPEED_WPM) * 60),
    });
  }

  return blocks;
}

/**
 * Extrae frases del texto
 */
function extractPhrasesFromText(text: string): string[] {
  return extractPhrases(text, 50); // máximo 50 frases
}

// ============================================================
// MAIN HOOK
// ============================================================

export interface UseTextImportOptions {
  autoAnalyze?: boolean;
  preGenerateExercises?: boolean; // Generar ejercicios cloze automáticamente
  maxExercisesPerPhrase?: number; // Máximo de ejercicios por frase (default: 2)
}

export interface UseTextImportReturn {
  // Datos
  data: TextImportData | null;
  isAnalyzing: boolean;
  error: string | null;

  // Acciones
  analyzeText: (text: string) => TextImportData | null;
  splitIntoBlocks: (text: string, maxWords?: number) => TextBlock[];
  extractPhrases: (text: string) => string[];

  // Import
  importAll: (data: TextImportData) => Promise<ImportResult>;
  importBlocks: (blocks: TextBlock[]) => Promise<ImportResult>;

  // Validación
  isValidText: (text: string) => boolean;
}

export function useTextImport(options: UseTextImportOptions = {}): UseTextImportReturn {
  const { autoAnalyze = true, preGenerateExercises = false, maxExercisesPerPhrase = 2 } = options;

  // Stores
  const { activeLanguage, activeLevel } = useProgressStore();
  const { createNode } = useImportedNodesStore();
  const { markTextAsRead } = useInputStore();

  // Estado
  const [data, setData] = useState<TextImportData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Analiza el texto y extrae información
   */
  const analyzeText = useCallback((text: string): TextImportData | null => {
    // Validaciones
    if (!text || text.trim().length < MIN_TEXT_LENGTH) {
      setError(`Text must be at least ${MIN_TEXT_LENGTH} characters`);
      return null;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      setError(`Text cannot exceed ${MAX_TEXT_LENGTH} characters`);
      return null;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      // Análisis básico
      const wordCount = calculateWordCount(text);
      const phraseCount = calculatePhraseCount(text);
      const language = detectLanguage(text);
      const difficulty = estimateDifficulty(text, wordCount);
      const suggestedTitle = generateSuggestedTitle(text);

      // Dividir en bloques
      const blocks = splitIntoBlocks(text);

      // Extraer categorías gramaticales
      const grammaticalCategories = extractGrammaticalCategoriesFromText(text, language as any);

      const result: TextImportData = {
        content: text,
        wordCount,
        phraseCount,
        language,
        difficulty,
        blocks,
        suggestedTitle,
        grammaticalCategories,
      };

      setData(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Analysis failed: ${errorMessage}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Divide el texto en bloques
   */
  const splitIntoBlocksCallback = useCallback((text: string, maxWords?: number): TextBlock[] => {
    return splitIntoBlocks(text, maxWords);
  }, []);

  /**
   * Extrae frases del texto
   */
  const extractPhrasesCallback = useCallback((text: string): string[] => {
    return extractPhrasesFromText(text);
  }, []);

  /**
   * Importa todo el contenido como un nuevo nodo
   */
  const importAll = useCallback(async (importData: TextImportData): Promise<ImportResult> => {
    try {
      setIsAnalyzing(true);
      setError(null);

      // Extraer frases
      const phrases = extractPhrasesFromText(importData.content);

      // Pre-generar ejercicios si está habilitado
      let clozeExercises: ClozeExercise[] = [];
      let totalExerciseCount = phrases.length * 2; // Estimación default

      if (preGenerateExercises && phrases.length > 0) {
        try {
          clozeExercises = generateClozeExercises(phrases, {
            maxExercisesPerPhrase,
            language: importData.language as any,
          });
          totalExerciseCount = clozeExercises.length;
        } catch (error) {
          console.warn('Failed to pre-generate exercises:', error);
          // Continuar sin ejercicios pre-generados
        }
      }

      // Crear source para las cards
      const source: ContentSource = {
        type: 'text',
        id: `text-import-${Date.now()}`,
        title: importData.suggestedTitle,
        url: '',
        timestamp: Date.now(),
      };

      // Crear nodo usando createNode
      const nodeId = createNode({
        title: importData.suggestedTitle,
        icon: '📝',
        sourceType: 'article',
        sourceText: importData.content,
        subtopics: [
          {
            id: `subtopic-${Date.now()}`,
            title: 'Contenido completo',
            phrases: phrases.slice(0, 10), // Limitar a 10 frases para el primer subtópico
          },
        ],
      });

      // Marcar como leído
      const textId = `text-${Date.now()}`;
      markTextAsRead(textId, importData.wordCount, activeLanguage, activeLevel);

      return {
        nodeId,
        phraseCount: phrases.length,
        exerciseCount: totalExerciseCount,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Import failed: ${errorMessage}`);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeLanguage, activeLevel, createNode, markTextAsRead, preGenerateExercises, maxExercisesPerPhrase]);

  /**
   * Importa bloques de texto
   */
  const importBlocks = useCallback(async (blocks: TextBlock[]): Promise<ImportResult> => {
    if (blocks.length === 0) {
      setError('No blocks to import');
      throw new Error('No blocks to import');
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      // Extraer frases de todos los bloques
      const allPhrases: string[] = [];
      blocks.forEach(block => {
        const blockPhrases = extractPhrasesFromText(block.content);
        allPhrases.push(...blockPhrases);
      });

      // Crear source
      const source: ContentSource = {
        type: 'text',
        id: `text-import-${Date.now()}`,
        title: data?.suggestedTitle || 'Text Blocks',
        url: '',
        timestamp: Date.now(),
      };

      // Crear nodo
      const nodeId = createNode({
        title: data?.suggestedTitle || 'Text Blocks',
        icon: '📝',
        sourceType: 'article',
        sourceText: blocks.map(b => b.content).join('\n\n'),
        subtopics: blocks.map((block, index) => ({
          id: `subtopic-${Date.now()}-${index}`,
          title: `Bloque ${index + 1}`,
          phrases: extractPhrasesFromText(block.content),
        })),
      });

      // Marcar como leído
      const textId = `text-${Date.now()}`;
      const totalWords = blocks.reduce((sum, b) => sum + b.wordCount, 0);
      markTextAsRead(textId, totalWords, activeLanguage, activeLevel);

      return {
        nodeId,
        phraseCount: allPhrases.length,
        exerciseCount: allPhrases.length * 2,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Import failed: ${errorMessage}`);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeLanguage, activeLevel, createNode, markTextAsRead, data]);

  /**
   * Valida si el texto es válido para importar
   */
  const isValidText = useCallback((text: string): boolean => {
    return text.trim().length >= MIN_TEXT_LENGTH && text.length <= MAX_TEXT_LENGTH;
  }, []);

  return {
    // Datos
    data,
    isAnalyzing,
    error,

    // Acciones
    analyzeText,
    splitIntoBlocks: splitIntoBlocksCallback,
    extractPhrases: extractPhrasesCallback,

    // Import
    importAll,
    importBlocks,

    // Validación
    isValidText,
  };
}
