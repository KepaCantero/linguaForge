/**
 * Audio Quality Types and Metrics
 * Tipos y métricas de calidad de audio AAA
 */

// ============================================================
// AUDIO QUALITY METRICS
// ============================================================

/**
 * Métricas objetivas de calidad de audio
 * Valores cuantificables para medir calidad AAA
 */
export interface AudioQualityMetrics {
  clarity: number;          // 0-100: % de sílabas claras
  prosodyScore: number;     // 0-100: variación tonal natural
  snrRatio: number;         // dB: signal-to-noise ratio (25+ es bueno)
  artifactScore: number;    // 0-100: % sin artefactos (100 = ninguno)
  dynamicRange: number;    // dB: rango dinámico (20+ es bueno)
  spectralCentroid: number; // Hz: centroide espectral (brillo)
  zeroCrossingRate: number; // Tasa de cruce por cero (energía)
}

/**
 * Resultado de validación AAA
 */
export interface AudioQualityValidation {
  passed: boolean;
  metrics: AudioQualityMetrics;
  thresholds: AudioQualityThresholds;
  failures: string[];
  warnings: string[];
}

/**
 * Umbrales mínimos para calidad AAA
 */
export interface AudioQualityThresholds {
  minClarity: number;          // ≥90% sílabas claras
  minProsody: number;          // ≥70% variación tonal
  minSNR: number;              // ≥25dB signal-to-noise
  maxArtifacts: number;        // ≤5% artefactos (o ≥95% artifactScore)
  minDynamicRange: number;     // ≥20dB rango dinámico
}

// ============================================================
// AUDIO POST-PROCESSING CONFIG
// ============================================================

/**
 * Configuración de post-procesamiento de audio
 */
export interface AudioPostProcessConfig {
  normalize: boolean;        // Normalizar volumen a -3dB
  compression: 'none' | 'lossy';
  highPassFilter: number;    // Hz - Low cut (eliminar rumble)
  lowPassFilter: number;     // Hz - High cut (eliminar highs)
  preEmphasis: boolean;      // Pre-énfasis para claridad
  deEssing: boolean;         // Reducir sibilancia
}

/**
 * Configuración de formato de salida
 */
export interface AudioOutputFormat {
  bitDepth: 16 | 24;
  sampleRate: 22050 | 44100 | 48000;
  channels: 1 | 2;
}

// ============================================================
// AAA AUDIO CONFIG
// ============================================================

/**
 * Configuración completa de audio AAA
 * Incluye TTS, métricas mínimas, post-procesamiento y formato de salida
 */
export interface AAAAudioConfig {
  // Configuración TTS
  voice: string;              // Voz a usar (OpenAI voice ID o edge-tts voice)
  model: 'tts-1' | 'tts-1-hd';
  rate: number;
  pitch: number;
  volume: number;

  // Métricas AAA mínimas requeridas
  minClarity: number;          // ≥90% sílabas claras
  minProsody: number;          // ≥70% variación tonal
  minSNR: number;              // ≥25dB signal-to-noise
  maxArtifacts: number;        // ≤5% artefactos
  minDynamicRange: number;     // ≥20dB rango dinámico

  // Post-procesamiento
  postProcess: AudioPostProcessConfig;

  // Calidad de exportación
  outputFormat: AudioOutputFormat;
}

// ============================================================
// AUDIO ANALYSIS RESULTS
// ============================================================

/**
 * Resultado completo del análisis de audio
 */
export interface AudioAnalysisResult {
  metrics: AudioQualityMetrics;
  validation: AudioQualityValidation;
  recommendations: string[];
  processingTime: number; // ms
}

/**
 * Configuración de análisis de audio
 */
export interface AudioAnalysisConfig {
  fftSize: number;           // Tamaño de FFT (2048 por defecto)
  smoothing: number;         // Suavizado (0-1)
  minSyllableDuration: number; // ms - duración mínima de sílaba
  maxSyllableDuration: number; // ms - duración máxima de sílaba
}

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Valores constantes para análisis de audio
 */
export const AUDIO_ANALYSIS_DEFAULTS: AudioAnalysisConfig = {
  fftSize: 2048,
  smoothing: 0.8,
  minSyllableDuration: 50,  // 50ms mínimo
  maxSyllableDuration: 500, // 500ms máximo
} as const;

/**
 * Umbrales AAA por defecto
 */
export const AAA_THRESHOLDS_DEFAULT: AudioQualityThresholds = {
  minClarity: 90,      // 90% sílabas claras
  minProsody: 70,      // 70% variación tonal
  minSNR: 25,          // 25dB signal-to-noise
  maxArtifacts: 5,     // 5% artefactos máximos
  minDynamicRange: 20, // 20dB rango dinámico
} as const;

/**
 * Rangos de calidad
 */
export const QUALITY_RANGES = {
  EXCELLENT: {
    clarity: 95,
    prosody: 85,
    snr: 30,
    artifacts: 98,
    dynamicRange: 25,
  },
  GOOD: {
    clarity: 90,
    prosody: 70,
    snr: 25,
    artifacts: 95,
    dynamicRange: 20,
  },
  ACCEPTABLE: {
    clarity: 80,
    prosody: 60,
    snr: 20,
    artifacts: 90,
    dynamicRange: 15,
  },
} as const;

/**
 * Calificación de calidad
 */
export type QualityGrade = 'excellent' | 'good' | 'acceptable' | 'poor';

/**
 * Obtiene calificación basada en métricas
 */
export function getQualityGrade(metrics: AudioQualityMetrics): QualityGrade {
  if (
    metrics.clarity >= QUALITY_RANGES.EXCELLENT.clarity &&
    metrics.prosodyScore >= QUALITY_RANGES.EXCELLENT.prosody &&
    metrics.snrRatio >= QUALITY_RANGES.EXCELLENT.snr &&
    metrics.artifactScore >= QUALITY_RANGES.EXCELLENT.artifacts &&
    metrics.dynamicRange >= QUALITY_RANGES.EXCELLENT.dynamicRange
  ) {
    return 'excellent';
  }

  if (
    metrics.clarity >= QUALITY_RANGES.GOOD.clarity &&
    metrics.prosodyScore >= QUALITY_RANGES.GOOD.prosody &&
    metrics.snrRatio >= QUALITY_RANGES.GOOD.snr &&
    metrics.artifactScore >= QUALITY_RANGES.GOOD.artifacts &&
    metrics.dynamicRange >= QUALITY_RANGES.GOOD.dynamicRange
  ) {
    return 'good';
  }

  if (
    metrics.clarity >= QUALITY_RANGES.ACCEPTABLE.clarity &&
    metrics.prosodyScore >= QUALITY_RANGES.ACCEPTABLE.prosody &&
    metrics.snrRatio >= QUALITY_RANGES.ACCEPTABLE.snr &&
    metrics.artifactScore >= QUALITY_RANGES.ACCEPTABLE.artifacts &&
    metrics.dynamicRange >= QUALITY_RANGES.ACCEPTABLE.dynamicRange
  ) {
    return 'acceptable';
  }

  return 'poor';
}

/**
 * Métricas ideales por nivel de aprendizaje
 */
export const LEARNING_LEVEL_THRESHOLDS: Record<
  'beginner' | 'intermediate' | 'advanced',
  AudioQualityThresholds
> = {
  beginner: {
    minClarity: 90,
    minProsody: 60,  // Menos variación para principiantes
    minSNR: 25,
    maxArtifacts: 5,
    minDynamicRange: 20,
  },
  intermediate: {
    minClarity: 92,
    minProsody: 70,
    minSNR: 28,
    maxArtifacts: 3,
    minDynamicRange: 22,
  },
  advanced: {
    minClarity: 95,
    minProsody: 80,
    minSNR: 30,
    maxArtifacts: 2,
    minDynamicRange: 25,
  },
} as const;

// ============================================================
// HELPER TYPES
// ============================================================

/**
 * Audio buffer extendido con metadatos de análisis
 */
export interface AnalyzedAudioBuffer extends AudioBuffer {
  qualityMetrics?: AudioQualityMetrics;
  analysisTimestamp?: number;
}

/**
 * Opciones de procesamiento
 */
export interface ProcessingOptions {
  applyNormalization: boolean;
  applyEQ: boolean;
  analyzeQuality: boolean;
  returnMetrics: boolean;
}

/**
 * Resultado de procesamiento
 */
export interface ProcessingResult {
  buffer: AudioBuffer;
  metrics?: AudioQualityMetrics;
  validation?: AudioQualityValidation;
  processingTime: number;
}
