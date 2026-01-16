'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export interface TTSQualitySelectorProps {
  selectedQuality: TTSQualityLevel;
  onQualityChange: (quality: TTSQualityLevel) => void;
  selectedFormat: 'mp3' | 'wav';
  onFormatChange: (format: 'mp3' | 'wav') => void;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  availableVoices: TTSVoice[];
  disabled?: boolean;
  showPreviewButton?: boolean;
  onPreview?: (text: string) => void;
}

interface QualityPreset {
  id: TTSQualityLevel;
  label: string;
  description: string;
  icon: string;
  config: TTSQualityConfig;
  color: string;
  bgColor: string;
}

interface AudioFormat {
  id: 'mp3' | 'wav';
  label: string;
  description: string;
  extension: string;
  quality: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const QUALITY_PRESETS: QualityPreset[] = [
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

const AUDIO_FORMATS: AudioFormat[] = [
  {
    id: 'mp3',
    label: 'MP3',
    description: 'Compresión estándar, tamaño reducido',
    extension: '.mp3',
    quality: '128kbps',
  },
  {
    id: 'wav',
    label: 'WAV',
    description: 'Sin pérdida, máxima calidad',
    extension: '.wav',
    quality: 'Lossless',
  },
];

const PREVIEW_TEXT = 'Bonjour, comment allez-vous?';

// ============================================================
// COMPONENT
// ============================================================

/**
 * TTSQualitySelector - Selector de calidad TTS con configuración avanzada
 *
 * Características:
 * - Presets de calidad (beginner/intermediate/advanced)
 * - Selector de formato de audio (MP3/WAV)
 * - Selector de voz con lista filtrada
 * - Preview de configuración con texto de ejemplo
 * - Indicadores visuales de calidad y modelo
 */
export function TTSQualitySelector({
  selectedQuality,
  onQualityChange,
  selectedFormat,
  onFormatChange,
  selectedVoice,
  onVoiceChange,
  availableVoices,
  disabled = false,
  showPreviewButton = true,
  onPreview,
}: TTSQualitySelectorProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showVoiceList, setShowVoiceList] = useState(false);

  // Obtener preset activo
  const activePreset = QUALITY_PRESETS.find(p => p.id === selectedQuality);
  const activeFormat = AUDIO_FORMATS.find(f => f.id === selectedFormat);

  // Filtrar voces francesas
  const frenchVoices = availableVoices.filter(voice =>
    voice.locale?.startsWith('fr-') || voice.locale?.startsWith('fr_FR')
  );

  // Manejar cambio de calidad
  const handleQualityChange = useCallback((preset: QualityPreset) => {
    if (disabled) return;
    onQualityChange(preset.id);
  }, [disabled, onQualityChange]);

  // Manejar cambio de formato
  const handleFormatChange = useCallback((format: AudioFormat) => {
    if (disabled) return;
    onFormatChange(format.id);
  }, [disabled, onFormatChange]);

  // Manejar cambio de voz
  const handleVoiceChange = useCallback((voiceId: string) => {
    if (disabled) return;
    onVoiceChange(voiceId);
  }, [disabled, onVoiceChange]);

  // Manejar preview
  const handlePreview = useCallback(async () => {
    if (disabled || isPreviewing) return;

    try {
      setIsPreviewing(true);

      if (onPreview) {
        await onPreview(PREVIEW_TEXT);
      }
    } catch (err) {
      console.error('Preview failed:', err);
    } finally {
      setIsPreviewing(false);
    }
  }, [disabled, isPreviewing, onPreview]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">
          Configuración de Calidad TTS
        </h3>
        <p className="text-sm text-calm-text-muted">
          {activePreset
            ? `Nivel: ${activePreset.label} | Formato: ${activeFormat?.label?.toUpperCase()} | Modelo: ${activePreset.config.model}`
            : 'Selecciona la calidad y formato del audio'
          }
        </p>
      </div>

      {/* Selector de calidad */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-calm-text-muted">
          Nivel de calidad
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {QUALITY_PRESETS.map((preset) => (
            <QualityPresetCard
              key={preset.id}
              preset={preset}
              isActive={selectedQuality === preset.id}
              onClick={() => handleQualityChange(preset)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Selector de formato */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-calm-text-muted">
          Formato de audio
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AUDIO_FORMATS.map((format) => (
            <FormatCard
              key={format.id}
              format={format}
              isActive={selectedFormat === format.id}
              onClick={() => handleFormatChange(format)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Selector de voz */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-calm-text-muted">
            Voz seleccionada
          </label>
          <button
            onClick={() => setShowVoiceList(!showVoiceList)}
            className={`text-xs ${INPUT_COLORS.text.textColor} ${INPUT_COLORS.text.textHover} transition-colors`}
          >
            {showVoiceList ? '↑ Ocultar voces' : '↓ Ver todas las voces'}
          </button>
        </div>

        {/* Voz actual */}
        <div className={`p-4 rounded-xl border ${INPUT_COLORS.text.bgSubtle} ${INPUT_COLORS.text.borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white mb-1">
                {frenchVoices.find(v => v.shortName === selectedVoice)?.name || selectedVoice}
              </div>
              <div className="text-xs text-calm-text-muted">
                {frenchVoices.find(v => v.shortName === selectedVoice)?.locale || 'Francés'}
              </div>
            </div>
            <div className="text-xs px-2 py-1 rounded bg-calm-bg-tertiary text-calm-text-muted">
              {selectedQuality}
            </div>
          </div>
        </div>

        {/* Lista de voces */}
        <AnimatePresence>
          {showVoiceList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 max-h-[300px] overflow-y-auto"
            >
              {frenchVoices.length === 0 ? (
                <div className="p-4 text-center text-calm-text-muted">
                  No hay voces francesas disponibles
                </div>
              ) : (
                frenchVoices.map((voice) => (
                  <VoiceListItem
                    key={voice.shortName}
                    voice={voice}
                    isSelected={selectedVoice === voice.shortName}
                    onSelect={() => handleVoiceChange(voice.shortName)}
                    disabled={disabled}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botón de preview */}
      {showPreviewButton && (
        <motion.button
          onClick={handlePreview}
          disabled={disabled || isPreviewing}
          className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
            disabled || isPreviewing
              ? 'bg-calm-bg-elevated text-calm-text-muted cursor-not-allowed'
              : `${INPUT_COLORS.text.bgDark} ${INPUT_COLORS.text.textColor} hover:scale-[1.02] active:scale-[0.98]`
          }`}
          whileHover={{ scale: disabled || isPreviewing ? 1 : 1.02 }}
          whileTap={{ scale: disabled || isPreviewing ? 1 : 0.98 }}
        >
          {isPreviewing ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              />
              Generando preview...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🔊 Escuchar muestra de ejemplo
            </span>
          )}
        </motion.button>
      )}

      {/* Resumen de configuración */}
      <div className={`p-4 rounded-xl border ${INPUT_COLORS.text.bgSubtle} ${INPUT_COLORS.text.borderColor}`}>
        <h4 className="text-sm font-semibold text-white mb-3">Resumen de configuración</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-calm-text-muted">Calidad:</span>
            <span className={`ml-2 font-medium ${activePreset?.color || 'text-white'}`}>
              {activePreset?.label || '-'}
            </span>
          </div>
          <div>
            <span className="text-calm-text-muted">Modelo:</span>
            <span className="ml-2 font-medium text-white">
              {activePreset?.config.model || '-'}
            </span>
          </div>
          <div>
            <span className="text-calm-text-muted">Rate:</span>
            <span className="ml-2 font-medium text-white">
              {activePreset?.config.rate || '-'}x
            </span>
          </div>
          <div>
            <span className="text-calm-text-muted">Formato:</span>
            <span className="ml-2 font-medium text-white">
              {activeFormat?.label?.toUpperCase() || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-calm-text-muted">Preview:</span>
            <span className="ml-2 font-medium text-white italic">
              &quot;{PREVIEW_TEXT}&quot;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

interface QualityPresetCardProps {
  preset: QualityPreset;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

function QualityPresetCard({ preset, isActive, onClick, disabled }: QualityPresetCardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-4 rounded-xl border-2 text-left transition-all duration-200
        ${isActive
          ? `${preset.bgColor} ${preset.color} border-current shadow-lg`
          : 'bg-calm-bg-elevated/50 border-calm-warm-200/50 hover:border-calm-warm-200 text-calm-text-primary'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Icono y check */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{preset.icon}</span>
        {isActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-lg"
          >
            ✓
          </motion.span>
        )}
      </div>

      {/* Label y descripción */}
      <h4 className={`font-semibold mb-1 ${isActive ? preset.color : 'text-white'}`}>
        {preset.label}
      </h4>
      <p className="text-xs text-calm-text-muted">
        {preset.description}
      </p>

      {/* Modelo TTS */}
      <div className="mt-2 pt-2 border-t border-calm-warm-200/20">
        <span className="text-xs font-mono bg-calm-bg-tertiary px-2 py-1 rounded">
          {preset.config.model}
        </span>
      </div>
    </motion.button>
  );
}

interface FormatCardProps {
  format: AudioFormat;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

function FormatCard({ format, isActive, onClick, disabled }: FormatCardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-4 rounded-xl border-2 text-left transition-all duration-200
        ${isActive
          ? `${INPUT_COLORS.text.bg} ${INPUT_COLORS.text.textColor} border-current shadow-lg`
          : 'bg-calm-bg-elevated/50 border-calm-warm-200/50 hover:border-calm-warm-200 text-calm-text-primary'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Icono y check */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{format.id === 'mp3' ? '🎵' : '🎼'}</span>
        {isActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-lg"
          >
            ✓
          </motion.span>
        )}
      </div>

      {/* Label y descripción */}
      <h4 className={`font-semibold mb-1 ${isActive ? INPUT_COLORS.text.textColor : 'text-white'}`}>
        {format.label}
      </h4>
      <p className="text-xs text-calm-text-muted mb-2">
        {format.description}
      </p>

      {/* Calidad y extensión */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono bg-calm-bg-tertiary px-2 py-1 rounded">
          {format.quality}
        </span>
        <span className="text-xs text-calm-text-muted">
          {format.extension}
        </span>
      </div>
    </motion.button>
  );
}

interface VoiceListItemProps {
  voice: TTSVoice;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}

function VoiceListItem({ voice, isSelected, onSelect, disabled }: VoiceListItemProps) {
  const quality = voice.quality || 'standard';
  const qualityColor = quality === 'neural' ? TTS_QUALITY_COLORS.neural.color : 'text-calm-text-muted';

  return (
    <motion.div
      className={`
        p-3 rounded-lg border transition-all duration-200
        ${isSelected
          ? `${INPUT_COLORS.text.bgSubtle} ${INPUT_COLORS.text.borderColor.replace('/30', '/50')}`
          : 'bg-calm-bg-elevated/30 border-calm-warm-200/30'
        }
      `}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Nombre de voz */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">
              {voice.name || voice.shortName}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${qualityColor} bg-calm-bg-tertiary`}>
              {quality}
            </span>
            {voice.recommendedLevel && (
              <span className="text-xs text-calm-text-muted">
                ({voice.recommendedLevel})
              </span>
            )}
          </div>

          {/* Metadatos */}
          <div className="flex items-center gap-3 text-xs text-calm-text-muted">
            <span>{voice.gender}</span>
            <span>{voice.locale}</span>
          </div>
        </div>

        {/* Botón de selección */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          disabled={disabled}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${isSelected
              ? `${INPUT_COLORS.text.bgDark} text-white`
              : 'bg-calm-bg-elevated text-calm-text-primary hover:bg-calm-warm-200/20'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isSelected ? '✓ Activa' : 'Seleccionar'}
        </button>
      </div>
    </motion.div>
  );
}
