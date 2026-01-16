/**
 * Enhanced Text Import Hook with Theme Integration
 *
 * Extends useTextImport to automatically create Themes when importing content.
 * Users can choose to create a new Theme or add to an existing one.
 *
 * Location: src/hooks/input/useTextImportWithTheme.ts
 */

import { useState, useCallback } from 'react';
import { useProgressStore } from '@/store/useProgressStore';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { useLearningThemeStore } from '@/store/useLearningThemeStore';
import { useInputStore } from '@/store/useInputStore';
import {
  extractPhrases,
  calculateWordCount,
  calculatePhraseCount,
  generateSuggestedTitle,
} from '@/services/importFlowService';
import { generateThemeFromNodes } from '@/services/themeService';
import type { ContentSource } from '@/types/srs';
import type { ThemeCategory, CEFRLevel } from '@/types/theme';
import type { TextImportData, TextBlock } from './useTextImport';

// ============================================================
// TYPES
// ============================================================

export interface ThemeImportOptions {
  // Estrategia de theme
  strategy: 'create' | 'add-to-existing' | 'no-theme';

  // Para crear nuevo theme
  themeTitle?: string;
  themeDescription?: string;
  themeCategory?: ThemeCategory;
  themeLevel?: CEFRLevel;

  // Para añadir a existente
  existingThemeId?: string;
}

export interface ImportResultWithTheme {
  nodeId: string;
  themeId?: string;
  phraseCount: number;
  exerciseCount: number;
  themeCreated?: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const READING_SPEED_WPM = 200; // palabras por minuto

/**
 * Divide el texto en bloques de tamaño manejable
 */
function splitIntoBlocks(text: string, maxWords: number = 150): TextBlock[] {
  const words = text.split(/\s+/);
  const blocks: TextBlock[] = [];
  let currentBlockWords: string[] = [];
  let wordIndex = 0;

  for (const word of words) {
    currentBlockWords.push(word);

    if (currentBlockWords.length >= maxWords) {
      const content = currentBlockWords.join(' ');
      blocks.push({
        id: `block-${Date.now()}-${blocks.length}`,
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
      id: `block-${Date.now()}-${blocks.length}`,
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

export interface UseTextImportWithThemeOptions {
  autoCreateTheme?: boolean;
  defaultCategory?: ThemeCategory;
  defaultLevel?: CEFRLevel;
}

export interface UseTextImportWithThemeReturn {
  // Estado
  isImporting: boolean;
  error: string | null;

  // Import con theme
  importWithTheme: (
    text: string,
    themeOptions: ThemeImportOptions
  ) => Promise<ImportResultWithTheme>;

  // Import múltiple en theme
  importMultipleToTheme: (
    imports: Array<{ text: string; title?: string }>,
    themeOptions: Omit<ThemeImportOptions, 'strategy'>
  ) => Promise<ImportResultWithTheme>;

  // Helpers
  suggestThemeCategory: (text: string) => ThemeCategory;
  suggestThemeLevel: (text: string) => CEFRLevel;
  generateThemeTitle: (texts: string[]) => string;
  generateThemeDescription: (texts: string[]) => string;
}

export function useTextImportWithTheme(
  options: UseTextImportWithThemeOptions = {}
): UseTextImportWithThemeReturn {
  const { autoCreateTheme = false, defaultCategory = 'daily_life', defaultLevel = 'A1' } = options;

  // Stores
  const { activeLanguage, activeLevel } = useProgressStore();
  const { createNode } = useImportedNodesStore();
  const { createTheme, addNodeToTheme } = useLearningThemeStore();
  const { markTextAsRead } = useInputStore();

  // Estado
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Importa texto creando o añadiendo a un Theme
   */
  const importWithTheme = useCallback(
    async (text: string, themeOptions: ThemeImportOptions): Promise<ImportResultWithTheme> => {
      try {
        setIsImporting(true);
        setError(null);

        // Análisis del texto
        const wordCount = calculateWordCount(text);
        const phraseCount = calculatePhraseCount(text);
        const suggestedTitle = generateSuggestedTitle(text);
        const phrases = extractPhrasesFromText(text);

        // Crear source para las cards
        const source: ContentSource = {
          type: 'text',
          id: `text-import-${Date.now()}`,
          title: suggestedTitle,
          url: '',
          timestamp: Date.now(),
        };

        // Crear nodo
        const nodeId = createNode({
          title: suggestedTitle,
          icon: '📝',
          sourceType: 'article',
          sourceText: text,
          subtopics: [
            {
              id: `subtopic-${Date.now()}`,
              title: 'Contenido completo',
              phrases: phrases.slice(0, 10),
            },
          ],
        });

        // Marcar como leído
        const textId = `text-${Date.now()}`;
        markTextAsRead(textId, wordCount, activeLanguage, activeLevel);

        // Manejar theme según estrategia
        let themeId: string | undefined;
        let themeCreated = false;

        if (themeOptions.strategy === 'create') {
          // Crear nuevo theme con este nodo
          const themeTitle = themeOptions.themeTitle || suggestedTitle;
          const themeDescription = themeOptions.themeDescription || `Contenido importado: ${suggestedTitle}`;
          const themeCategory = themeOptions.themeCategory || defaultCategory;
          const themeLevel = themeOptions.themeLevel || defaultLevel;

          // Obtener nodo completo para generar theme
          const node = useImportedNodesStore.getState().getNode(nodeId);
          if (node) {
            const theme = generateThemeFromNodes(
              [node],
              themeTitle,
              themeDescription,
              themeCategory,
              themeLevel
            );
            themeId = createTheme(theme);
            themeCreated = true;
          }
        } else if (themeOptions.strategy === 'add-to-existing' && themeOptions.existingThemeId) {
          // Añadir nodo a theme existente
          addNodeToTheme(themeOptions.existingThemeId, nodeId);
          themeId = themeOptions.existingThemeId;
        }

        return {
          nodeId,
          themeId,
          phraseCount: phrases.length,
          exerciseCount: phrases.length * 2,
          themeCreated,
        };

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Import failed: ${errorMessage}`);
        throw err;
      } finally {
        setIsImporting(false);
      }
    },
    [
      activeLanguage,
      activeLevel,
      createNode,
      createTheme,
      addNodeToTheme,
      markTextAsRead,
      defaultCategory,
      defaultLevel,
    ]
  );

  /**
   * Importa múltiples textos en un solo theme
   */
  const importMultipleToTheme = useCallback(
    async (
      imports: Array<{ text: string; title?: string }>,
      themeOptions: Omit<ThemeImportOptions, 'strategy'>
    ): Promise<ImportResultWithTheme> => {
      try {
        setIsImporting(true);
        setError(null);

        const themeTitle = themeOptions.themeTitle || 'Colección de Contenidos';
        const themeDescription = themeOptions.themeDescription || `${imports.length} contenidos importados`;
        const themeCategory = themeOptions.themeCategory || defaultCategory;
        const themeLevel = themeOptions.themeLevel || defaultLevel;

        // Importar cada texto
        const nodeIds: string[] = [];
        let totalPhraseCount = 0;

        for (const importItem of imports) {
          const result = await importWithTheme(importItem.text, { strategy: 'no-theme' });
          nodeIds.push(result.nodeId);
          totalPhraseCount += result.phraseCount;
        }

        // Crear theme con todos los nodos
        const nodes = nodeIds
          .map((id) => useImportedNodesStore.getState().getNode(id))
          .filter((n) => n !== undefined);

        if (nodes.length > 0) {
          const theme = generateThemeFromNodes(
            nodes,
            themeTitle,
            themeDescription,
            themeCategory,
            themeLevel
          );
          const themeId = createTheme(theme);

          // Añadir nodos al theme
          nodeIds.forEach((nodeId) => {
            addNodeToTheme(themeId, nodeId);
          });

          return {
            nodeId: nodeIds[0], // Retornar primer nodo
            themeId,
            phraseCount: totalPhraseCount,
            exerciseCount: totalPhraseCount * 2,
            themeCreated: true,
          };
        }

        throw new Error('No nodes were created');

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Batch import failed: ${errorMessage}`);
        throw err;
      } finally {
        setIsImporting(false);
      }
    },
    [importWithTheme, createTheme, addNodeToTheme, defaultCategory, defaultLevel]
  );

  /**
   * Sugiere una categoría de theme basada en el contenido del texto
   */
  const suggestThemeCategory = useCallback((text: string): ThemeCategory => {
    const lowerText = text.toLowerCase();

    // Palabras clave por categoría
    const categoryKeywords: Record<ThemeCategory, string[]> = {
      basics: ['bonjour', 'salut', 'au revoir', 'merci', 'alphabet', 'nombre', 'oui', 'non'],
      travel: ['voyage', 'avion', 'train', 'hôtel', 'réservation', 'destination', 'touriste', 'airport'],
      food: ['restaurant', 'menu', 'plat', 'boisson', 'déjeuner', 'dîner', 'cuisine', 'recette'],
      culture: ['art', 'musée', 'histoire', 'culture', 'tradition', 'fête', 'cinéma', 'littérature'],
      business: ['réunion', 'présentation', 'email', 'client', 'entreprise', 'travail', 'bureau', 'collègue'],
      daily_life: ['maison', 'famille', 'routine', 'quotidien', 'week-end', 'voisin', 'amis', 'loisirs'],
      health: ['médecin', 'hôpital', 'santé', 'médicament', 'pharmacie', 'malade', 'douleur', 'symptôme'],
      shopping: ['magasin', 'achat', 'prix', 'soldes', 'boutique', 'caisse', 'remboursement', 'produit'],
    };

    // Buscar coincidencias
    const scores: Record<ThemeCategory, number> = {
      basics: 0,
      travel: 0,
      food: 0,
      culture: 0,
      business: 0,
      daily_life: 0,
      health: 0,
      shopping: 0,
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          scores[category as ThemeCategory]++;
        }
      }
    }

    // Retornar categoría con mayor puntuación
    const maxCategory = Object.entries(scores).reduce((max, [cat, score]) =>
      score > max.score ? { category: cat as ThemeCategory, score } : max
    , { category: defaultCategory, score: 0 });

    return maxCategory.score > 0 ? maxCategory.category : defaultCategory;
  }, [defaultCategory]);

  /**
   * Sugiere un nivel CEFR basado en la complejidad del texto
   */
  const suggestThemeLevel = useCallback((text: string): CEFRLevel => {
    const wordCount = calculateWordCount(text);
    const avgWordLength = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / wordCount;

    // Reglas heurísticas
    if (wordCount < 100 && avgWordLength < 5) return 'A0';
    if (wordCount < 200 && avgWordLength < 5) return 'A1';
    if (wordCount < 400 && avgWordLength < 6) return 'A2';
    if (wordCount < 600 && avgWordLength < 7) return 'B1';
    if (wordCount < 800 && avgWordLength < 8) return 'B2';
    if (wordCount < 1000 && avgWordLength < 9) return 'C1';

    return 'C2';
  }, []);

  /**
   * Genera un título para un theme basado en múltiples textos
   */
  const generateThemeTitle = useCallback((texts: string[]): string => {
    if (texts.length === 0) return 'Nuevo Theme';

    if (texts.length === 1) {
      return generateSuggestedTitle(texts[0]);
    }

    // Analizar palabras comunes
    const allWords = texts.flatMap((text) =>
      text.toLowerCase().split(/\s+/).filter((w) => w.length > 4)
    );

    // Contar frecuencias
    const wordFreq: Record<string, number> = {};
    allWords.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Obtener palabras más frecuentes
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word)
      .join(', ');

    return `Colección: ${topWords || 'Varios'}`;
  }, []);

  /**
   * Genera una descripción para un theme basado en múltiples textos
   */
  const generateThemeDescription = useCallback((texts: string[]): string => {
    const wordCount = texts.reduce((sum, text) => sum + calculateWordCount(text), 0);
    const textCount = texts.length;

    return `Colección de ${textCount} texto${textCount > 1 ? 's' : ''} con aproximadamente ${wordCount} palabras para práctica de comprensión y vocabulario.`;
  }, []);

  return {
    // Estado
    isImporting,
    error,

    // Import con theme
    importWithTheme,
    importMultipleToTheme,

    // Helpers
    suggestThemeCategory,
    suggestThemeLevel,
    generateThemeTitle,
    generateThemeDescription,
  };
}
