/**
 * Input System Configuration
 * Centralized configuration for INPUT system to avoid hardcoding
 */

import type { POSType } from '@/schemas/posTagging';
import type { SupportedLanguage } from '@/lib/constants';

// ============================================================
// TYPES
// ============================================================

export interface InputThresholds {
  minSentenceLength: number;
  minWordLength: number;
  maxPhraseLength: number;
  maxPhrasesPerImport: number;
}

export interface InputQualityThresholds {
  minConfidence: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export interface InputPOSConfig {
  beginner: POSType[];
  intermediate: POSType[];
  advanced: POSType[];
}

export interface InputConfig {
  thresholds: InputThresholds;
  quality: InputQualityThresholds;
  posPriorities: Record<string, POSType[]>;
}

// ============================================================
// DEFAULT CONFIGURATION
// ============================================================

export const INPUT_DEFAULTS: InputConfig = {
  thresholds: {
    minSentenceLength: 10,
    minWordLength: 2,
    maxPhraseLength: 200,
    maxPhrasesPerImport: 20,
  },
  quality: {
    minConfidence: {
      beginner: 0.8,
      intermediate: 0.6,
      advanced: 0.4,
    },
  },
  posPriorities: {
    beginner: ['noun', 'verb'],
    intermediate: ['verb', 'adjective', 'noun'],
    advanced: ['verb', 'adjective', 'noun', 'adverb'],
  },
} as const;

// ============================================================
// CONFIG GETTERS
// ============================================================

/**
 * Get configuration for a specific level
 * @param level - Learning level (beginner, intermediate, advanced)
 * @returns Input configuration object
 */
export function getInputConfig(level: string = 'intermediate'): InputConfig {
  return INPUT_DEFAULTS;
}

/**
 * Get POS priorities for a specific level
 * @param level - Learning level (beginner, intermediate, advanced)
 * @returns Array of POS types in priority order
 */
export function getPOSPriorities(level: string = 'intermediate'): POSType[] {
  return INPUT_DEFAULTS.posPriorities[level] || INPUT_DEFAULTS.posPriorities.intermediate;
}

/**
 * Get min confidence for a specific level
 * @param level - Learning level (beginner, intermediate, advanced)
 * @returns Minimum confidence threshold
 */
export function getMinConfidence(level: string = 'intermediate'): number {
  return INPUT_DEFAULTS.quality.minConfidence[level as keyof typeof INPUT_DEFAULTS.quality.minConfidence] || INPUT_DEFAULTS.quality.minConfidence.intermediate;
}

/**
 * Get thresholds configuration
 * @returns Input thresholds object
 */
export function getThresholds(): InputThresholds {
  return INPUT_DEFAULTS.thresholds;
}

/**
 * Get min sentence length threshold
 * @returns Minimum sentence length in characters
 */
export function getMinSentenceLength(): number {
  return INPUT_DEFAULTS.thresholds.minSentenceLength;
}

/**
 * Get min word length threshold
 * @returns Minimum word length in characters
 */
export function getMinWordLength(): number {
  return INPUT_DEFAULTS.thresholds.minWordLength;
}

/**
 * Get max phrases per import threshold
 * @returns Maximum number of phrases to import
 */
export function getMaxPhrasesPerImport(): number {
  return INPUT_DEFAULTS.thresholds.maxPhrasesPerImport;
}

/**
 * Get max phrase length threshold
 * @returns Maximum phrase length in characters
 */
export function getMaxPhraseLength(): number {
  return INPUT_DEFAULTS.thresholds.maxPhraseLength;
}

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

/**
 * Validate if a sentence meets minimum length requirements
 * @param sentence - Sentence text to validate
 * @returns True if sentence meets minimum length
 */
export function isValidSentenceLength(sentence: string): boolean {
  return sentence.trim().length >= INPUT_DEFAULTS.thresholds.minSentenceLength;
}

/**
 * Validate if a word meets minimum length requirements
 * @param word - Word to validate
 * @returns True if word meets minimum length
 */
export function isValidWordLength(word: string): boolean {
  return word.length >= INPUT_DEFAULTS.thresholds.minWordLength;
}

/**
 * Validate if phrase length is within acceptable range
 * @param phrase - Phrase text to validate
 * @returns True if phrase length is acceptable
 */
export function isValidPhraseLength(phrase: string): boolean {
  const length = phrase.trim().length;
  return length >= INPUT_DEFAULTS.thresholds.minSentenceLength && length <= INPUT_DEFAULTS.thresholds.maxPhraseLength;
}

/**
 * Validate if confidence meets minimum requirements for level
 * @param confidence - Confidence value (0-1)
 * @param level - Learning level
 * @returns True if confidence meets minimum
 */
export function isValidConfidence(confidence: number, level: string = 'intermediate'): boolean {
  const minConfidence = getMinConfidence(level);
  return confidence >= minConfidence;
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  INPUT_DEFAULTS,
  getInputConfig,
  getPOSPriorities,
  getMinConfidence,
  getThresholds,
  getMinSentenceLength,
  getMinWordLength,
  getMaxPhrasesPerImport,
  getMaxPhraseLength,
  isValidSentenceLength,
  isValidWordLength,
  isValidPhraseLength,
  isValidConfidence,
};
