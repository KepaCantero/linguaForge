'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TTSVoice, TTSOptions } from '@/types/tts';
import { TTS_VOICE_PRESETS } from '@/types/tts';
import { INPUT_COLORS, TTS_QUALITY_COLORS } from '@/config/input';

// ============================================================
// TYPES
// ============================================================

export interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  onPreview?: (voice: string) => void;
  disabled?: boolean;
  showPreviewButton?: boolean;
}

export interface VoicePreset {
  id: 'beginner' | 'intermediate' | 'advanced';
  label: string;
  description: string;
  icon: string;
  voiceId: string;
  color: string;
  bgColor: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'beginner',
    label: 'Principiante',
    description: 'Lento, claro, ideal para empezar',
    icon: '🌱',
    voiceId: TTS_VOICE_PRESETS.beginner,
    color: INPUT_COLORS.text.textColor,
    bgColor: INPUT_COLORS.text.bg,
  },
  {
    id: 'intermediate',
    label: 'Intermedio',
    description: 'Conversacional, expresión natural',
    icon: '📚',
    voiceId: TTS_VOICE_PRESETS.intermediate,
    color: INPUT_COLORS.amber[400],
    bgColor: INPUT_COLORS.amber[600],
  },
  {
    id: 'advanced',
    label: 'Avanzado',
    description: 'Rápido, expresiones naturales',
    icon: '🚀',
    voiceId: TTS_VOICE_PRESETS.advanced,
    color: TTS_QUALITY_COLORS.neural.color,
    bgColor: TTS_QUALITY_COLORS.neural.bg,
  },
];

const PREVIEW_TEXT = 'Bonjour, comment allez-vous?';

// ============================================================
// COMPONENT
// ============================================================

/**
 * VoiceSelector - Selector de voz TTS con presets por nivel
 *
 * Características:
 * - Presets por nivel (principiante/intermedio/avanzado)
 * - Lista completa de voces francesas
 * - Preview de voz con muestra de audio
 * - Indicadores de calidad (neural/standard)
 * - Filtros por género y categoría
 */
export function VoiceSelector({
  selectedVoice,
  onVoiceChange,
  onPreview,
  disabled = false,
  showPreviewButton = true,
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllVoices, setShowAllVoices] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female' | 'neutral'>('all');

  // Cargar voces desde la API
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/tts/generate');
        if (!response.ok) {
          throw new Error('Failed to fetch voices');
        }

        const data = await response.json();
        // Filtrar solo voces francesas
        const frenchVoices = data.voices?.filter((v: TTSVoice) =>
          v.locale?.startsWith('fr-') || v.locale?.startsWith('fr_FR')
        ) || [];

        setVoices(frenchVoices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load voices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoices();
  }, []);

  // Obtener preset activo
  const activePreset = VOICE_PRESETS.find(p => p.voiceId === selectedVoice);

  // Filtrar voces
  const filteredVoices = voices.filter(voice => {
    if (genderFilter === 'all') return true;
    return voice.gender === genderFilter;
  });

  // Manejar cambio de preset
  const handlePresetClick = useCallback((preset: VoicePreset) => {
    if (disabled) return;
    onVoiceChange(preset.voiceId);
  }, [disabled, onVoiceChange]);

  // Manejar preview de voz
  const handlePreview = useCallback(async (voiceId: string) => {
    if (disabled || previewingVoice) return;

    try {
      setPreviewingVoice(voiceId);

      // Usar callback externo si existe
      if (onPreview) {
        await onPreview(voiceId);
      } else {
        // Preview por defecto usando Web Speech API directamente
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(PREVIEW_TEXT);

          // Configurar voz
          const voices = speechSynthesis.getVoices();
          const selectedVoiceObj = voices.find(v =>
            v.voiceURI.includes(voiceId) || v.name.includes(voiceId)
          );
          if (selectedVoiceObj) {
            utterance.voice = selectedVoiceObj;
          }

          // Esperar a que termine de hablar
          await new Promise<void>((resolve, reject) => {
            utterance.onend = () => resolve();
            utterance.onerror = (e) => reject(e);
            speechSynthesis.speak(utterance);
          });
        } else {
          console.error('Speech synthesis not supported');
        }
      }
    } catch (err) {
      console.error('Preview failed:', err);
    } finally {
      setPreviewingVoice(null);
    }
  }, [disabled, previewingVoice, onPreview]);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">
          Seleccionar Voz
        </h3>
        <p className="text-sm text-calm-text-muted">
          {activePreset
            ? `Preset activo: ${activePreset.label}`
            : 'Elige un preset o selecciona una voz específica'
          }
        </p>
      </div>

      {/* Presets por nivel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {VOICE_PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isActive={selectedVoice === preset.voiceId}
            onClick={() => handlePresetClick(preset)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Toggle para ver todas las voces */}
      <div className="flex items-center justify-between pt-2 border-t border-calm-warm-200/30">
        <button
          onClick={() => setShowAllVoices(!showAllVoices)}
          disabled={isLoading || disabled}
          className={`text-sm ${INPUT_COLORS.text.textColor} ${INPUT_COLORS.text.textHover} disabled:opacity-50 transition-colors`}
        >
          {showAllVoices ? '↑ Ocultar todas las voces' : '↓ Ver todas las voces disponibles'}
        </button>

        {/* Filtro por género */}
        {showAllVoices && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-calm-text-muted">Género:</span>
            {(['all', 'female', 'male'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setGenderFilter(filter)}
                className={`
                  px-2 py-1 text-xs rounded transition-colors
                  ${genderFilter === filter
                    ? 'bg-accent-500/20 text-accent-300'
                    : 'bg-calm-bg-elevated text-calm-text-muted hover:text-white'
                  }
                `}
              >
                {filter === 'all' ? 'Todos' : filter === 'female' ? 'Mujer' : 'Hombre'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista completa de voces */}
      <AnimatePresence>
        {showAllVoices && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 max-h-[400px] overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-calm-text-muted">
                Cargando voces...
              </div>
            ) : error ? (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            ) : filteredVoices.length === 0 ? (
              <div className="p-4 text-center text-calm-text-muted">
                No se encontraron voces
              </div>
            ) : (
              filteredVoices.map((voice) => (
                <VoiceItem
                  key={voice.shortName}
                  voice={voice}
                  isSelected={selectedVoice === voice.shortName}
                  onSelect={() => onVoiceChange(voice.shortName)}
                  onPreview={() => handlePreview(voice.shortName)}
                  isPreviewing={previewingVoice === voice.shortName}
                  disabled={disabled}
                  showPreviewButton={showPreviewButton}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

interface PresetCardProps {
  preset: VoicePreset;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

function PresetCard({ preset, isActive, onClick, disabled }: PresetCardProps) {
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
      {/* Icono */}
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
    </motion.button>
  );
}

interface VoiceItemProps {
  voice: TTSVoice;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  isPreviewing: boolean;
  disabled: boolean;
  showPreviewButton: boolean;
}

function VoiceItem({ voice, isSelected, onSelect, onPreview, isPreviewing, disabled, showPreviewButton }: VoiceItemProps) {
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

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {/* Preview button */}
          {showPreviewButton && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              disabled={disabled || isPreviewing}
              className="p-2 rounded-lg bg-calm-bg-tertiary hover:bg-calm-warm-200/20 text-calm-text-muted hover:text-white transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Escuchar muestra"
            >
              {isPreviewing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                <span>▶️</span>
              )}
            </motion.button>
          )}

          {/* Select button */}
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
            {isSelected ? '✓ Seleccionada' : 'Seleccionar'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
