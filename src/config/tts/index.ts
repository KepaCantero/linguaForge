/**
 * TTS Configuration
 * Configuración centralizada para Text-to-Speech
 *
 * Este archivo centraliza todas las constantes hardcodeadas relacionadas con TTS:
 * - Voces por idioma
 * - Presets de calidad
 * - Límites de texto
 * - Configuraciones de entonación
 */

import type { TTSVoice, TTSQualityLevel } from '@/types/tts';

// ============================================================
// TTS VOICES BY LANGUAGE
// ============================================================

/**
 * French TTS Voices (Microsoft Azure Neural Voices)
 * Voces TTS francesas (Microsoft Azure Neural Voices)
 *
 * These voices are available through:
 * - Microsoft Azure Cognitive Services
 * - edge-tts (unofficial)
 * - browser speechSynthesis API (limited)
 */
export const FRENCH_VOICES: TTSVoice[] = [
  {
    id: 'fr-FR-DeniseNeural',
    name: 'Denise',
    shortName: 'DeniseNeural',
    locale: 'fr-FR',
    gender: 'female',
    quality: 'neural',
    categories: ['general'],
    personalities: ['friendly'],
    recommendedLevel: 'beginner',
  },
  {
    id: 'fr-FR-HenriNeural',
    name: 'Henri',
    shortName: 'HenriNeural',
    locale: 'fr-FR',
    gender: 'male',
    quality: 'neural',
    categories: ['general'],
    personalities: ['professional'],
    recommendedLevel: 'intermediate',
  },
  {
    id: 'fr-FR-JulieNeural',
    name: 'Julie',
    shortName: 'JulieNeural',
    locale: 'fr-FR',
    gender: 'female',
    quality: 'neural',
    categories: ['general'],
    personalities: ['expressive'],
    recommendedLevel: 'advanced',
  },
  {
    id: 'fr-FR-AlainNeural',
    name: 'Alain',
    shortName: 'AlainNeural',
    locale: 'fr-FR',
    gender: 'male',
    quality: 'neural',
    categories: ['general'],
    personalities: ['professional'],
    recommendedLevel: 'beginner',
  },
  {
    id: 'fr-FR-PaulNeural',
    name: 'Paul',
    shortName: 'PaulNeural',
    locale: 'fr-FR',
    gender: 'male',
    quality: 'neural',
    categories: ['general'],
    personalities: ['casual'],
    recommendedLevel: 'intermediate',
  },
  {
    id: 'fr-FR-CherelleNeural',
    name: 'Cherelle',
    shortName: 'CherelleNeural',
    locale: 'fr-FR',
    gender: 'female',
    quality: 'neural',
    categories: ['conversation'],
    personalities: ['warm'],
    recommendedLevel: 'intermediate',
  },
] as const;

/**
 * Spanish TTS Voices
 * Voces TTS españolas
 */
export const SPANISH_VOICES: TTSVoice[] = [
  {
    id: 'es-ES-ElviraNeural',
    name: 'Elvira',
    shortName: 'ElviraNeural',
    locale: 'es-ES',
    gender: 'female',
    quality: 'neural',
    categories: ['general'],
    personalities: ['friendly'],
    recommendedLevel: 'beginner',
  },
  {
    id: 'es-ES-AlvaroNeural',
    name: 'Álvaro',
    shortName: 'AlvaroNeural',
    locale: 'es-ES',
    gender: 'male',
    quality: 'neural',
    categories: ['general'],
    personalities: ['professional'],
    recommendedLevel: 'intermediate',
  },
] as const;

/**
 * English TTS Voices
 * Voces TTS inglesas
 */
export const ENGLISH_VOICES: TTSVoice[] = [
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny',
    shortName: 'JennyNeural',
    locale: 'en-US',
    gender: 'female',
    quality: 'neural',
    categories: ['general'],
    personalities: ['friendly'],
    recommendedLevel: 'beginner',
  },
  {
    id: 'en-GB-SoniaNeural',
    name: 'Sonia',
    shortName: 'SoniaNeural',
    locale: 'en-GB',
    gender: 'female',
    quality: 'neural',
    categories: ['general'],
    personalities: ['professional'],
    recommendedLevel: 'intermediate',
  },
] as const;

/**
 * All TTS voices by language code
 * Todas las voces TTS por código de idioma
 */
export const TTS_VOICES_BY_LANGUAGE: Record<string, TTSVoice[]> = {
  'fr': [...FRENCH_VOICES],
  'fr-FR': [...FRENCH_VOICES],
  'french': [...FRENCH_VOICES],
  'es': [...SPANISH_VOICES],
  'es-ES': [...SPANISH_VOICES],
  'spanish': [...SPANISH_VOICES],
  'en': [...ENGLISH_VOICES],
  'en-US': [...ENGLISH_VOICES],
  'en-GB': [...ENGLISH_VOICES],
  'english': [...ENGLISH_VOICES],
} as const;

// ============================================================
// TTS VOICE PRESETS
// ============================================================

/**
 * TTS Voice Presets by learning level
 * Presets de voces TTS por nivel de aprendizaje
 *
 * Maps each learning level to a recommended voice
 */
export const TTS_VOICE_PRESETS: Record<TTSQualityLevel, string> = {
  beginner: 'fr-FR-DeniseNeural',
  intermediate: 'fr-FR-HenriNeural',
  advanced: 'fr-FR-JulieNeural',
} as const;

/**
 * TTS Voice Presets by language
 * Presets de voces TTS por idioma
 */
export const TTS_VOICE_PRESETS_BY_LANGUAGE: Record<string, Record<TTSQualityLevel, string>> = {
  'fr': {
    beginner: 'fr-FR-DeniseNeural',
    intermediate: 'fr-FR-HenriNeural',
    advanced: 'fr-FR-JulieNeural',
  },
  'es': {
    beginner: 'es-ES-ElviraNeural',
    intermediate: 'es-ES-AlvaroNeural',
    advanced: 'es-ES-AlvaroNeural',
  },
  'en': {
    beginner: 'en-US-JennyNeural',
    intermediate: 'en-GB-SoniaNeural',
    advanced: 'en-US-JennyNeural',
  },
} as const;

// ============================================================
// TTS RATE PRESETS
// ============================================================

/**
 * TTS Rate Presets
 * Presets de velocidad TTS
 *
 * Speech rate multipliers for different scenarios
 */
export const TTS_RATE_PRESETS: Record<string, number> = {
  slow: 0.75,     // Slower for beginners
  normal: 1.0,    // Normal speed
  fast: 1.25,     // Faster for advanced learners
  verySlow: 0.5,  // Very slow for careful listening
  veryFast: 1.5,  // Very fast for quick review
} as const;

/**
 * TTS Rate by learning level
 * Velocidad TTS por nivel de aprendizaje
 */
export const TTS_RATE_BY_LEVEL: Record<TTSQualityLevel, number> = {
  beginner: 0.8,      // Slower for clarity
  intermediate: 1.0,  // Normal speed
  advanced: 1.2,      // Faster for natural speech
} as const;

// ============================================================
// TTS TEXT LIMITS
// ============================================================

/**
 * TTS Text Length Limits
 * Límites de longitud de texto TTS
 */
export const TTS_TEXT_LIMITS = {
  MAX_TEXT_LENGTH: 5000,    // Maximum characters per request
  MIN_TEXT_LENGTH: 1,       // Minimum characters per request
  OPTIMAL_TEXT_LENGTH: 500, // Optimal length for best quality
  CHUNK_SIZE: 1000,         // Size for chunking long texts
} as const;

/**
 * TTS Text Limits by model
 * Límites de texto por modelo TTS
 */
export const TTS_LIMITS_BY_MODEL: Record<string, { maxLength: number; chunkSize: number }> = {
  'tts-1': {
    maxLength: 5000,
    chunkSize: 1000,
  },
  'tts-1-hd': {
    maxLength: 5000,
    chunkSize: 1000,
  },
} as const;

// ============================================================
// TTS PARAMETER RANGES
// ============================================================

/**
 * TTS Parameter Ranges
 * Rangos de parámetros TTS
 */
export const TTS_PARAMETER_RANGES = {
  rate: {
    min: 0.5,
    max: 2.0,
    default: 1.0,
    step: 0.05,
  },
  pitch: {
    min: 0.0,
    max: 2.0,
    default: 1.0,
    step: 0.05,
  },
  volume: {
    min: 0.0,
    max: 1.0,
    default: 1.0,
    step: 0.1,
  },
} as const;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get voices for a language
 * Obtiene voces para un idioma
 *
 * @param language - Language code (e.g., 'fr', 'es', 'en')
 * @returns Array of TTS voices for the language
 */
export function getVoicesForLanguage(language: string): TTSVoice[] {
  // Try exact match first
  if (TTS_VOICES_BY_LANGUAGE[language]) {
    return TTS_VOICES_BY_LANGUAGE[language];
  }

  // Try language code only (e.g., 'fr' from 'fr-FR')
  const langCode = language.split('-')[0];
  if (TTS_VOICES_BY_LANGUAGE[langCode]) {
    return TTS_VOICES_BY_LANGUAGE[langCode];
  }

  // Default to empty array
  return [];
}

/**
 * Get voice preset for a language and level
 * Obtiene preset de voz para un idioma y nivel
 *
 * @param language - Language code
 * @param level - Learning level
 * @returns Voice ID or undefined if not found
 */
export function getVoicePreset(
  language: string,
  level: TTSQualityLevel
): string | undefined {
  if (TTS_VOICE_PRESETS_BY_LANGUAGE[language]) {
    return TTS_VOICE_PRESETS_BY_LANGUAGE[language][level];
  }

  const langCode = language.split('-')[0];
  if (TTS_VOICE_PRESETS_BY_LANGUAGE[langCode]) {
    return TTS_VOICE_PRESETS_BY_LANGUAGE[langCode][level];
  }

  // Fallback to French presets
  return TTS_VOICE_PRESETS[level];
}

/**
 * Get rate preset for a learning level
 * Obtiene preset de velocidad para un nivel
 *
 * @param level - Learning level
 * @returns Rate multiplier
 */
export function getRatePreset(level: TTSQualityLevel): number {
  return TTS_RATE_BY_LEVEL[level] || TTS_RATE_PRESETS.normal;
}

/**
 * Validate TTS parameters
 * Valida parámetros TTS
 *
 * @param params - Parameters to validate
 * @returns Validated parameters or error message
 */
export function validateTTSParams(params: {
  rate?: number;
  pitch?: number;
  volume?: number;
}): { valid: boolean; error?: string } {
  if (params.rate !== undefined) {
    if (params.rate < TTS_PARAMETER_RANGES.rate.min || params.rate > TTS_PARAMETER_RANGES.rate.max) {
      return {
        valid: false,
        error: `Rate must be between ${TTS_PARAMETER_RANGES.rate.min} and ${TTS_PARAMETER_RANGES.rate.max}`,
      };
    }
  }

  if (params.pitch !== undefined) {
    if (params.pitch < TTS_PARAMETER_RANGES.pitch.min || params.pitch > TTS_PARAMETER_RANGES.pitch.max) {
      return {
        valid: false,
        error: `Pitch must be between ${TTS_PARAMETER_RANGES.pitch.min} and ${TTS_PARAMETER_RANGES.pitch.max}`,
      };
    }
  }

  if (params.volume !== undefined) {
    if (params.volume < TTS_PARAMETER_RANGES.volume.min || params.volume > TTS_PARAMETER_RANGES.volume.max) {
      return {
        valid: false,
        error: `Volume must be between ${TTS_PARAMETER_RANGES.volume.min} and ${TTS_PARAMETER_RANGES.volume.max}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Check if a voice exists for a language
 * Verifica si una voz existe para un idioma
 *
 * @param voiceId - Voice ID to check
 * @param language - Language code
 * @returns True if voice exists
 */
export function voiceExists(voiceId: string, language: string): boolean {
  const voices = getVoicesForLanguage(language);
  return voices.some(v => v.id === voiceId || v.shortName === voiceId);
}

/**
 * Get default voice for a language
 * Obtiene la voz por defecto para un idioma
 *
 * @param language - Language code
 * @returns Default voice or undefined
 */
export function getDefaultVoice(language: string): TTSVoice | undefined {
  const voices = getVoicesForLanguage(language);
  return voices.find(v => v.recommendedLevel === 'beginner') || voices[0];
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  FRENCH_VOICES,
  SPANISH_VOICES,
  ENGLISH_VOICES,
  TTS_VOICES_BY_LANGUAGE,
  TTS_VOICE_PRESETS,
  TTS_VOICE_PRESETS_BY_LANGUAGE,
  TTS_RATE_PRESETS,
  TTS_RATE_BY_LEVEL,
  TTS_TEXT_LIMITS,
  TTS_LIMITS_BY_MODEL,
  TTS_PARAMETER_RANGES,
  // Functions
  getVoicesForLanguage,
  getVoicePreset,
  getRatePreset,
  validateTTSParams,
  voiceExists,
  getDefaultVoice,
};
