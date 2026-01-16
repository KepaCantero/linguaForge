'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalyzedSentence, SentenceType } from '@/types/tts';
import { intonationService } from '@/services/intonationService';
import { INTONATION_COLORS, INPUT_COLORS } from '@/config/input';
import { DEFAULT_LANGUAGE } from '@/config/languages';

// ============================================================
// TYPES
// ============================================================

export interface IntonationSelectorProps {
  text: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onPreview?: (text: string, useIntonation: boolean) => void;
  disabled?: boolean;
  language?: string;
}

interface SentenceTypeCard {
  type: SentenceType;
  description: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const SENTENCE_TYPE_CARDS: SentenceTypeCard[] = [
  {
    type: 'question',
    description: 'Entonación ascendente (+6 semitonos)',
  },
  {
    type: 'statement',
    description: 'Entonación descendente (-2 a +2 semitonos)',
  },
  {
    type: 'exclamation',
    description: 'Rango amplio (0 a +8 semitonos)',
  },
  {
    type: 'imperative',
    description: 'Tono grave autoritativo (-3 a +1 semitonos)',
  },
];

const EXAMPLE_TEXTS = {
  question: 'Comment allez-vous?',
  statement: 'Je vais très bien.',
  exclamation: 'C\'est magnifique!',
  imperative: 'Écoutez attentivement.',
} as const;

// ============================================================
// COMPONENT
// ============================================================

/**
 * IntonationSelector - Componente para habilitar/deshabilitar entonación contextualizada
 *
 * Características:
 * - Toggle para activar/desactivar entonación
 * - Vista previa de análisis de oraciones
 * - Demo de cada tipo de entonación
 * - Indicadores visuales de detección
 */
export function IntonationSelector({
  text,
  isEnabled,
  onToggle,
  onPreview,
  disabled = false,
  language = DEFAULT_LANGUAGE,
}: IntonationSelectorProps) {
  const [analyzedSentences, setAnalyzedSentences] = useState<AnalyzedSentence[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Analizar texto cuando cambia
  useEffect(() => {
    if (!text || text.trim().length === 0) {
      setAnalyzedSentences([]);
      return;
    }

    setIsAnalyzing(true);

    // Debounce análisis
    const timer = setTimeout(() => {
      try {
        const analyzed = intonationService.analyzeText(text, language);
        setAnalyzedSentences(analyzed);
      } catch (err) {
        console.error('Intonation analysis error:', err);
        setAnalyzedSentences([]);
      } finally {
        setIsAnalyzing(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [text, language]);

  // Manejar toggle de entonación
  const handleToggle = useCallback(() => {
    if (disabled) return;
    onToggle(!isEnabled);
  }, [disabled, isEnabled, onToggle]);

  // Manejar preview de texto completo
  const handlePreview = useCallback(async () => {
    if (disabled || isPreviewing || !text) return;

    try {
      setIsPreviewing(true);
      await onPreview?.(text, isEnabled);
    } catch (err) {
      console.error('Preview failed:', err);
    } finally {
      setIsPreviewing(false);
    }
  }, [disabled, isPreviewing, text, isEnabled, onPreview]);

  // Manejar preview de tipo de oración específico
  const handleTypePreview = useCallback(async (type: SentenceType) => {
    if (disabled || isPreviewing) return;

    try {
      setIsPreviewing(true);
      const exampleText = EXAMPLE_TEXTS[type];
      await onPreview?.(exampleText, true);
    } catch (err) {
      console.error('Type preview failed:', err);
    } finally {
      setIsPreviewing(false);
    }
  }, [disabled, isPreviewing, onPreview]);

  // Contar oraciones por tipo
  const typeCounts = analyzedSentences.reduce((acc, sentence) => {
    acc[sentence.type] = (acc[sentence.type] || 0) + 1;
    return acc;
  }, {} as Record<SentenceType, number>);

  const totalSentences = analyzedSentences.length;
  const hasContent = text.trim().length > 0;

  return (
    <div className="w-full space-y-4">
      {/* Header con toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">
            Entonación Contextualizada
          </h3>
          {hasContent && totalSentences > 0 && (
            <span className="text-sm text-calm-text-muted">
              {totalSentences} oración{totalSentences > 1 ? 'es' : ''} detectada{totalSentences > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <motion.button
          onClick={handleToggle}
          disabled={disabled}
          className={`
            relative px-6 py-2 rounded-full font-semibold transition-all duration-200
            ${disabled
              ? 'bg-calm-bg-elevated/50 text-calm-text-muted cursor-not-allowed'
              : isEnabled
                ? `${INPUT_COLORS.text.bg} ${INPUT_COLORS.text.textColor} shadow-lg`
                : 'bg-calm-bg-elevated/50 text-calm-text-primary hover:bg-calm-warm-200/20'
            }
          `}
          whileHover={disabled ? {} : { scale: 1.02 }}
          whileTap={disabled ? {} : { scale: 0.98 }}
        >
          {isEnabled ? '✓ Activada' : 'Desactivada'}
        </motion.button>
      </div>

      {/* Descripción */}
      <p className="text-sm text-calm-text-muted">
        {isEnabled
          ? 'La entonación se ajustará automáticamente según el tipo de oración (pregunta, declarativo, exclamación, imperativo).'
          : 'El audio se generará con entonación plana (sin variaciones).'
        }
      </p>

      {/* Análisis de oraciones */}
      <AnimatePresence>
        {isEnabled && hasContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Resumen de tipos detectados */}
            {totalSentences > 0 && (
              <div className={`p-4 rounded-xl border ${INPUT_COLORS.text.bgSubtle} ${INPUT_COLORS.text.borderColor}`}>
                <h4 className="text-sm font-semibold text-white mb-3">
                  Tipos de oración detectados
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SENTENCE_TYPE_CARDS.map((card) => {
                    const colorConfig = INTONATION_COLORS[card.type];
                    const count = typeCounts[card.type] || 0;
                    const percentage = totalSentences > 0 ? (count / totalSentences) * 100 : 0;

                    return (
                      <div
                        key={card.type}
                        className={`
                          p-3 rounded-lg border transition-all duration-200
                          ${count > 0
                            ? `${colorConfig.bg} ${colorConfig.color} border-current`
                            : 'bg-calm-bg-elevated/30 border-calm-warm-200/30 opacity-50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{colorConfig.icon}</span>
                          <span className="text-xs font-medium">
                            {colorConfig.label}
                          </span>
                        </div>
                        <div className="text-xs text-calm-text-muted">
                          {count > 0 ? `${count} (${percentage.toFixed(0)}%)` : '0%'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lista de oraciones analizadas */}
            {totalSentences > 0 && (
              <div className={`p-4 rounded-xl border ${INPUT_COLORS.text.bgSubtle} ${INPUT_COLORS.text.borderColor}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white">
                    Análisis detallado
                  </h4>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className={`text-xs ${INPUT_COLORS.text.textColor} ${INPUT_COLORS.text.textHover} transition-colors`}
                  >
                    {showDetails ? '↑ Ocultar' : '↓ Ver detalles'}
                  </button>
                </div>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 max-h-[300px] overflow-y-auto"
                    >
                      {analyzedSentences.map((sentence, index) => {
                        const colorConfig = INTONATION_COLORS[sentence.type];

                        return (
                          <div
                            key={index}
                            className={`
                              p-3 rounded-lg border transition-all duration-200
                              ${colorConfig.bg} ${colorConfig.color} border-current
                            `}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span>{colorConfig.icon}</span>
                                  <span className="text-xs font-medium">
                                    {intonationService.getSentenceTypeName(sentence.type)}
                                  </span>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-calm-bg-tertiary text-calm-text-muted">
                                    {intonationService.getProfileName(sentence.intonation.intonationProfile)}
                                  </span>
                                </div>
                                <p className="text-sm text-calm-text-primary line-clamp-2">
                                  {sentence.text}
                                </p>
                                <p className="text-xs text-calm-text-muted mt-1">
                                  Pitch: {sentence.ssmlProsody.pitch} | Rate: {sentence.ssmlProsody.rate} | Volume: {sentence.ssmlProsody.volume}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Previews de cada tipo */}
            <div className={`p-4 rounded-xl border ${INPUT_COLORS.text.bgSubtle} ${INPUT_COLORS.text.borderColor}`}>
              <h4 className="text-sm font-semibold text-white mb-3">
                Previsualizar tipos de entonación
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SENTENCE_TYPE_CARDS.map((card) => {
                  const colorConfig = INTONATION_COLORS[card.type];

                  return (
                    <motion.button
                      key={card.type}
                      onClick={() => handleTypePreview(card.type)}
                      disabled={disabled || isPreviewing}
                      className={`
                        p-3 rounded-lg border text-left transition-all duration-200
                        ${disabled || isPreviewing
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                        }
                        ${colorConfig.bg} ${colorConfig.color} border-current
                    `}
                    whileHover={disabled || isPreviewing ? {} : { scale: 1.02 }}
                    whileTap={disabled || isPreviewing ? {} : { scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{colorConfig.icon}</span>
                      <span className="text-xs font-medium">
                        {colorConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-calm-text-primary mb-1">
                      {EXAMPLE_TEXTS[card.type]}
                    </p>
                    <p className="text-xs text-calm-text-muted">
                      {card.description}
                    </p>
                  </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Botón de preview del texto completo */}
            <motion.button
              onClick={handlePreview}
              disabled={disabled || isPreviewing || !text}
              className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                disabled || isPreviewing || !text
                  ? 'bg-calm-bg-elevated text-calm-text-muted cursor-not-allowed'
                  : `${INPUT_COLORS.text.bgDark} ${INPUT_COLORS.text.textColor} hover:scale-[1.02] active:scale-[0.98]`
              }`}
              whileHover={disabled || isPreviewing || !text ? undefined : { scale: 1.02 }}
              whileTap={disabled || isPreviewing || !text ? undefined : { scale: 0.98 }}
            >
              {isPreviewing ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  />
                  Generando preview con entonación...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🔊 Escuchar texto completo con entonación
                </span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de análisis en curso */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-calm-text-muted"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
          Analizando entonación...
        </motion.div>
      )}
    </div>
  );
}
