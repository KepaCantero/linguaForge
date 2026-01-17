/**
 * TTS Presets Utility Functions
 *
 * Extracts complex logic for TTS quality presets, voice filtering,
 * and configuration calculations from TTSQualitySelector component.
 */

import type {
  TTSVoice,
  TTSQualityLevel,
  TTSQualityConfig,
} from '@/types/tts';
import { TTS_QUALITY_PRESETS, TTS_VOICE_PRESETS } from '@/types/tts';
import { INPUT_COLORS, TTS_QUALITY_COLORS } from '@/config/input';

// ============================================================
// TYPES
// ============================================================

export interface QualityPreset {
  id: TTSQualityLevel;
  label: string;
  description: string;
  icon: string;
  config: TTSQualityConfig;
  color: string;
  bgColor: string;
}

export interface AudioFormat {
  id: 'mp3' | 'wav';
  label: string;
  description: string;
  extension: string;
  quality: string;
  icon: string;
}

// ============================================================
// CONSTANTS
// ============================================================

export const QUALITY_PRESETS: QualityPreset[] = [
  {
    id: 'beginner',
    label: 'Principiante',
    description: 'Rate 0.8, tts-1 (lento, claro)',
    icon: '🌱',
    config: {
      level: 'beginner',
      rate: TTS_QUALITY_PRESETS.beginner.rate,
      voice: TTS_VOICE_PRESETS.beginner,
      model: TTS_QUALITY_PRESETS.beginner.model,
    },
    color: INPUT_COLORS.text.textColor,
    bgColor: INPUT_COLORS.text.bg,
  },
  {
    id: 'intermediate',
    label: 'Intermedio',
    description: 'Rate 1.0, tts-1 (normal)',
    icon: '📚',
    config: {
      level: 'intermediate',
      rate: TTS_QUALITY_PRESETS.intermediate.rate,
      voice: TTS_VOICE_PRESETS.intermediate,
      model: TTS_QUALITY_PRESETS.intermediate.model,
    },
    color: INPUT_COLORS.amber[400],
    bgColor: INPUT_COLORS.amber[600],
  },
  {
    id: 'advanced',
    label: 'Avanzado',
    description: 'Rate 1.2, tts-1-hd (rápido, alta calidad)',
    icon: '🚀',
    config: {
      level: 'advanced',
      rate: TTS_QUALITY_PRESETS.advanced.rate,
      voice: TTS_VOICE_PRESETS.advanced,
      model: TTS_QUALITY_PRESETS.advanced.model,
    },
    color: TTS_QUALITY_COLORS.neural.color,
    bgColor: TTS_QUALITY_COLORS.neural.bg,
  },
];

export const AUDIO_FORMATS: AudioFormat[] = [
  {
    id: 'mp3',
    label: 'MP3',
    description: 'Compresión estándar, tamaño reducido',
    extension: '.mp3',
    quality: '128kbps',
    icon: '🎵',
  },
  {
    id: 'wav',
    label: 'WAV',
    description: 'Sin pérdida, máxima calidad',
    extension: '.wav',
    quality: 'Lossless',
    icon: '🎼',
  },
];

export const PREVIEW_TEXT = 'Bonjour, comment allez-vous?';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Filter French voices from available voices
 */
export function filterFrenchVoices(voices: TTSVoice[]): TTSVoice[] {
  return voices.filter(voice =>
    voice.locale?.startsWith('fr-') || voice.locale?.startsWith('fr_FR')
  );
}

/**
 * Find voice by shortName in French voices
 */
export function findFrenchVoice(voices: TTSVoice[], shortName: string): TTSVoice | undefined {
  const frenchVoices = filterFrenchVoices(voices);
  return frenchVoices.find(v => v.shortName === shortName);
}

/**
 * Get quality preset by level
 */
export function getQualityPreset(level: TTSQualityLevel): QualityPreset | undefined {
  return QUALITY_PRESETS.find(p => p.id === level);
}

/**
 * Get audio format by id
 */
export function getAudioFormat(id: 'mp3' | 'wav'): AudioFormat | undefined {
  return AUDIO_FORMATS.find(f => f.id === id);
}

/**
 * Calculate rate from quality level
 */
export function getRateFromQuality(quality: TTSQualityLevel): number {
  const preset = getQualityPreset(quality);
  return preset?.config.rate ?? 1.0;
}

/**
 * Generate header subtitle for TTS configuration
 */
export function generateHeaderSubtitle(
  selectedQuality: TTSQualityLevel,
  selectedFormat: 'mp3' | 'wav'
): string {
  const preset = getQualityPreset(selectedQuality);
  const format = getAudioFormat(selectedFormat);

  if (!preset || !format) {
    return 'Selecciona la calidad y formato del audio';
  }

  return `Nivel: ${preset.label} | Formato: ${format.label.toUpperCase()} | Modelo: ${preset.config.model}`;
}

/**
 * Get voice quality color
 */
export function getVoiceQualityColor(quality: string | undefined): string {
  return quality === 'neural' ? TTS_QUALITY_COLORS.neural.color : 'text-calm-text-muted';
}
