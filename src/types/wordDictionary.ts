import { z } from 'zod';
import type { SRSCard } from './srs';

// SRSCard se importa para referencia de tipos en la documentación
export type { SRSCard };

/**
 * Diccionario de palabras estudiadas
 * Almacena información sobre palabras que el usuario ya ha aprendido
 */

export const WordInfoSchema = z.object({
  word: z.string(), // Palabra en francés (normalizada: lowercase, sin acentos para comparación)
  wordOriginal: z.string(), // Palabra original con acentos
  type: z.enum(['verb', 'noun', 'adverb', 'adjective', 'other']), // Tipo de palabra
  cardId: z.string().optional(), // ID de la card SRS asociada (si existe)
  firstSeen: z.string(), // ISO date - primera vez que se vio
  lastSeen: z.string(), // ISO date - última vez que se vio
  timesSeen: z.number().default(1), // Número de veces que se ha visto
  isStudied: z.boolean().default(false), // Si ya se estudió (card creada)
  isMastered: z.boolean().default(false), // Si está dominada (card graduada)
  languageCode: z.string().default('fr'),
  levelCode: z.string().default('A1'),
});

export type WordInfo = z.infer<typeof WordInfoSchema>;

export interface WordDictionaryStore {
  words: Record<string, WordInfo>; // Key: word (normalized), Value: WordInfo
  
  // Acciones
  addWord: (word: string, type: WordInfo['type'], cardId?: string) => void;
  markAsStudied: (word: string, cardId: string) => void;
  markAsMastered: (word: string) => void;
  updateWordSeen: (word: string) => void;
  
  // Getters
  isWordStudied: (word: string) => boolean;
  isWordMastered: (word: string) => boolean;
  getWordInfo: (word: string) => WordInfo | undefined;
  getStudiedWords: () => WordInfo[];
  getNewWords: (words: string[]) => string[]; // Filtra palabras no estudiadas
  
  // Utilidades
  resetDictionary: () => void;
}

