/**
 * Types for Premium TTS Service
 * Tipos para el servicio TTS premium con edge-tts
 */

// ============================================================
// IMPORTS
// ============================================================

import type {
  AAAAudioConfig,
} from './audio';

// ============================================================
// VOICE TYPES
// ============================================================

export type TTSQuality = 'standard' | 'neural' | 'premium';
export type TTSGender = 'male' | 'female' | 'neutral';

export interface TTSVoice {
  id: string;
  name: string;
  shortName: string;
  locale: string;
  gender: TTSGender;
  quality: TTSQuality;
  categories: string[];
  personalities: string[];
  recommendedLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface TTSOptions {
  voice?: string;
  rate?: number;      // 0.5 to 2.0
  pitch?: number;     // 0.0 to 2.0
  volume?: number;    // 0.0 to 1.0
  useIntonation?: boolean; // Enable contextualized intonation
  model?: 'tts-1' | 'tts-1-hd'; // TTS model to use
}

// ============================================================
// INTONATION TYPES
// ============================================================

/**
 * Sentence type classification for intonation
 * Tipo de oración para clasificación de entonación
 */
export type SentenceType = 'statement' | 'question' | 'exclamation' | 'imperative';

/**
 * Intonation profile patterns
 * Perfiles de entonación
 */
export type IntonationProfile = 'flat' | 'rising' | 'falling' | 'rise-fall';

/**
 * Intonation rule mapping sentence type to acoustic features
 * Regla de entonación que mapea tipo de oración a características acústicas
 */
export interface IntonationRule {
  sentenceType: SentenceType;
  intonationProfile: IntonationProfile;
  pitchRange: [number, number]; // [min, max] semitones from baseline
  rateModifier: number;         // Speed multiplier (0.8 = slower, 1.2 = faster)
  volumeBoost: number;          // Volume increase in dB (0-5)
}

/**
 * Language-specific intonation configuration
 * Configuración de entonación específica por idioma
 */
export interface IntonationConfig {
  language: string;
  rules: Record<SentenceType, IntonationRule>;
  questionWords: string[];      // Words that indicate questions
  imperativeVerbs: string[];    // Common imperative verbs
}

/**
 * SSML prosody markup configuration
 * Configuración de marcas prosódicas SSML
 */
export interface SSMLProsodyConfig {
  pitch: string;                // e.g., "+20%" or "-2st"
  rate: string;                 // e.g., "10%" or "0.9x"
  volume: string;               // e.g., "+5dB" or "loud"
}

/**
 * Analyzed sentence with intonation metadata
 * Oración analizada con metadatos de entonación
 */
export interface AnalyzedSentence {
  text: string;
  type: SentenceType;
  startIndex: number;
  endIndex: number;
  intonation: IntonationRule;
  ssmlProsody: SSMLProsodyConfig;
}

// ============================================================
// RESPONSE TYPES
// ============================================================

export interface TTSGenerateResponse {
  audio: string;      // Base64 data URL
  voice: string;
  textLength: number;
  duration: number;   // Estimated in seconds
  ssml?: string;      // Generated SSML if intonation enabled
}

export interface TTSVoicesResponse {
  voices: TTSVoice[];
  total: number;
}

export interface TTSError {
  error: string;
  code?: string;
}

// ============================================================
// PRESETS
// ============================================================

export const TTS_VOICE_PRESETS: Record<string, string> = {
  beginner: 'fr-FR-DeniseNeural',
  intermediate: 'fr-FR-HenriNeural',
  advanced: 'fr-FR-JulieNeural',
} as const;

export const TTS_RATE_PRESETS: Record<string, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.25,
} as const;

// ============================================================
// QUALITY CONFIG PRESETS
// ============================================================

export type TTSQualityLevel = 'beginner' | 'intermediate' | 'advanced';

export interface TTSQualityConfig {
  level: TTSQualityLevel;
  rate: number;
  voice: string;
  model: 'tts-1' | 'tts-1-hd';
}

/**
 * TTS Quality Presets with AAA audio configuration
 * Presets de calidad TTS con configuración de audio AAA
 *
 * Cada nivel define:
 * - Configuración TTS (modelo, velocidad, voz)
 * - Métricas mínimas de calidad AAA
 * - Configuración de post-procesamiento
 * - Formato de salida óptimo
 */
export const TTS_QUALITY_PRESETS: Record<TTSQualityLevel, AAAAudioConfig> = {
  /**
   * Beginner: Enfoque en claridad y velocidad reducida
   * - Menor variación prosódica para facilitar comprensión
   * - Filtrado agresivo para eliminar distracciones
   * - Alta claridad de sílabas
   */
  beginner: {
    // Configuración TTS
    voice: 'alloy',
    model: 'tts-1',
    rate: 0.8,
    pitch: 1.0,
    volume: 1.0,

    // Métricas AAA mínimas requeridas
    minClarity: 90,
    minProsody: 60,        // Menos variación para principiantes
    minSNR: 25,
    maxArtifacts: 5,
    minDynamicRange: 20,

    // Post-procesamiento
    postProcess: {
      normalize: true,
      compression: 'none',
      highPassFilter: 80,   // Remove rumble
      lowPassFilter: 8000,  // Focus on vocals
      preEmphasis: true,
      deEssing: true,
    },

    // Calidad de exportación
    outputFormat: {
      bitDepth: 16,
      sampleRate: 44100,
      channels: 1,
    },
  },

  /**
   * Intermediate: Balance entre naturalidad y claridad
   * - Mayor variación prosódica para aprendizaje
   * - Rango de frecuencia ampliado
   * - Mejor rango dinámico
   */
  intermediate: {
    // Configuración TTS
    voice: 'nova',
    model: 'tts-1',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,

    // Métricas AAA mínimas requeridas
    minClarity: 92,
    minProsody: 70,        // Mayor variación tonal
    minSNR: 28,
    maxArtifacts: 3,
    minDynamicRange: 22,

    // Post-procesamiento
    postProcess: {
      normalize: true,
      compression: 'none',
      highPassFilter: 80,
      lowPassFilter: 12000, // Más highs
      preEmphasis: true,
      deEssing: true,
    },

    // Calidad de exportación
    outputFormat: {
      bitDepth: 16,
      sampleRate: 44100,
      channels: 1,
    },
  },

  /**
   * Advanced: Máxima calidad y naturalidad
   * - Modelo HD para mejor fidelidad
   * - Métricas más exigentes
   * - Mayor rango dinámico y frecuencia
   */
  advanced: {
    // Configuración TTS
    voice: 'shimmer',
    model: 'tts-1-hd',
    rate: 1.2,
    pitch: 1.0,
    volume: 1.0,

    // Métricas AAA mínimas requeridas
    minClarity: 95,
    minProsody: 80,        // Máxima variación tonal
    minSNR: 30,
    maxArtifacts: 2,
    minDynamicRange: 25,

    // Post-procesamiento
    postProcess: {
      normalize: true,
      compression: 'none',
      highPassFilter: 60,   // Menos corte
      lowPassFilter: 16000, // Full range
      preEmphasis: true,
      deEssing: true,
    },

    // Calidad de exportación
    outputFormat: {
      bitDepth: 24,         // Mayor resolución
      sampleRate: 48000,    // Mayor sample rate
      channels: 1,
    },
  },
} as const;

/**
 * TTS Quality Config (legacy compatibility)
 * @deprecated Use AAAAudioConfig from TTS_QUALITY_PRESETS instead
 */
export interface TTSQualityConfig {
  level: TTSQualityLevel;
  rate: number;
  voice: string;
  model: 'tts-1' | 'tts-1-hd';
}

// ============================================================
// DOWNLOAD REQUEST TYPES
// ============================================================

export interface TTSDownloadRequest {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  format?: 'mp3' | 'wav';
  model?: 'tts-1' | 'tts-1-hd';
  quality?: TTSQualityLevel;
  useIntonation?: boolean;  // Enable contextualized intonation
  language?: string;         // Language code for intonation rules
  ssml?: string;             // Optional pre-generated SSML
}

export interface TTSDownloadResponse {
  success: boolean;
  audioUrl?: string;
  filename?: string;
  duration?: number;
  size?: number;
  error?: string;
  ssml?: string;            // Generated SSML if intonation enabled
}

// ============================================================
// CACHE TYPES
// ============================================================

export interface TTSCacheEntry {
  blob: Blob;
  timestamp: number;
  text: string;
  voice: string;
  options: TTSOptions;
}

export interface TTSCacheKey {
  text: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  useIntonation?: boolean;
}

// ============================================================
// GENERATION STATE
// ============================================================

export interface TTSGenerationState {
  isGenerating: boolean;
  progress: number;
  currentBlock?: number;
  totalBlocks?: number;
  error?: string;
}

// ============================================================
// AUDIO BLOB TYPES
// ============================================================

export type AudioBlobMap = Map<string, Blob>; // key = hash(text + voice + options)

export interface GeneratedAudioMetadata {
  url: string;
  blob: Blob;
  duration: number;
  size: number;
  createdAt: number;
}

export interface GeneratedAudioMap {
  byId: Map<string, GeneratedAudioMetadata>;
  byText: Map<string, string>; // text -> id
}
