'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TranscriptPhrase, ContentSource } from '@/types/srs';
import { useSRSStore } from '@/store/useSRSStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { SRS_CONFIG } from '@/types/srs';
import { formatTime } from '@/services/youtubeService';

// ============================================
// TIPOS
// ============================================

interface InteractiveTranscriptProps {
  phrases: TranscriptPhrase[];
  currentTime: number; // Tiempo actual del video/audio en segundos
  source: ContentSource; // Fuente del contenido (video, audio, texto)
  onPhraseClick?: (phrase: TranscriptPhrase) => void;
  onSeekTo?: (time: number) => void;
  showTranslations?: boolean;
  autoScroll?: boolean;
  className?: string;
}

interface PhraseActionsProps {
  phrase: TranscriptPhrase;
  source: ContentSource;
  isOpen: boolean;
  onClose: () => void;
  onPlayPhrase?: () => void;
}

// ============================================
// COMPONENTE DE ACCIONES POR FRASE
// ============================================

function PhraseActions({
  phrase,
  source,
  isOpen,
  onClose,
  onPlayPhrase,
}: PhraseActionsProps) {
  const { addCard, isPhraseSaved } = useSRSStore();
  const { addXP } = useGamificationStore();
  const [saved, setSaved] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isSaved = isPhraseSaved(phrase.text) || saved;

  const handleSaveToSRS = useCallback(() => {
    if (isSaved) return;

    addCard({
      phrase: phrase.text,
      translation: phrase.translation || '',
      audioUrl: phrase.audioUrl,
      source: {
        ...source,
        timestamp: phrase.startTime,
        context: `Frase del ${source.type === 'video' ? 'video' : source.type === 'audio' ? 'audio' : 'texto'}`,
      },
      languageCode: 'fr',
      levelCode: 'A1',
    });

    setSaved(true);
    setShowConfirmation(true);
    addXP(SRS_CONFIG.xp.phraseSaved);

    // Ocultar confirmación después de 2s
    setTimeout(() => {
      setShowConfirmation(false);
      onClose();
    }, 2000);
  }, [phrase, source, isSaved, addCard, addXP, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="absolute left-0 right-0 mt-2 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {/* Confirmación de guardado */}
        {showConfirmation ? (
          <motion.div
            className="bg-emerald-500 text-white rounded-lg p-3 shadow-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <div>
                <p className="font-medium">¡Frase guardada!</p>
                <p className="text-sm opacity-90">+{SRS_CONFIG.xp.phraseSaved} XP</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
            {/* Traducción */}
            {phrase.translation && (
              <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                {phrase.translation}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex items-center gap-1 p-1">
              {/* Reproducir frase */}
              {onPlayPhrase && (
                <button
                  onClick={onPlayPhrase}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Reproducir frase"
                >
                  <span>🔊</span>
                  <span className="hidden sm:inline">Escuchar</span>
                </button>
              )}

              {/* Guardar en SRS */}
              <button
                onClick={handleSaveToSRS}
                disabled={isSaved}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  isSaved
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 cursor-default'
                    : 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                }`}
                title={isSaved ? 'Ya guardada' : 'Guardar en SRS'}
              >
                <span>{isSaved ? '✓' : '💾'}</span>
                <span className="hidden sm:inline">
                  {isSaved ? 'Guardada' : 'Guardar'}
                </span>
              </button>

              {/* Marcar como no entendida */}
              <button
                onClick={() => {
                  // TODO: Implementar lógica de "no entiendo"
                  // Podría: añadir al SRS con tag especial, mostrar explicación, etc.
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 transition-colors"
                title="Marcar como no entendida"
              >
                <span>❓</span>
                <span className="hidden sm:inline">No entiendo</span>
              </button>

              {/* Cerrar */}
              <button
                onClick={onClose}
                className="ml-auto p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function InteractiveTranscript({
  phrases,
  currentTime,
  source,
  onPhraseClick,
  onSeekTo,
  showTranslations = false,
  autoScroll = true,
  className = '',
}: InteractiveTranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPhraseId, setSelectedPhraseId] = useState<string | null>(null);
  const [hoveredPhraseId, setHoveredPhraseId] = useState<string | null>(null);
  const { isPhraseSaved } = useSRSStore();

  // Encontrar frase actual basada en el tiempo
  const currentPhraseIndex = phrases.findIndex(
    (p) => currentTime >= p.startTime && currentTime < p.endTime
  );
  const currentPhrase = currentPhraseIndex >= 0 ? phrases[currentPhraseIndex] : null;

  // Auto-scroll a la frase actual
  useEffect(() => {
    if (!autoScroll || currentPhraseIndex < 0 || !containerRef.current) return;

    const phraseElement = containerRef.current.querySelector(
      `[data-phrase-index="${currentPhraseIndex}"]`
    );

    if (phraseElement) {
      phraseElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentPhraseIndex, autoScroll]);

  const handlePhraseClick = useCallback(
    (phrase: TranscriptPhrase) => {
      if (selectedPhraseId === phrase.id) {
        setSelectedPhraseId(null);
      } else {
        setSelectedPhraseId(phrase.id);
        onPhraseClick?.(phrase);
      }
    },
    [selectedPhraseId, onPhraseClick]
  );

  const handlePlayPhrase = useCallback(
    (phrase: TranscriptPhrase) => {
      onSeekTo?.(phrase.startTime);
    },
    [onSeekTo]
  );

  return (
    <div
      ref={containerRef}
      className={`space-y-2 max-h-96 overflow-y-auto ${className}`}
    >
      {phrases.map((phrase, index) => {
        const isCurrent = currentPhrase?.id === phrase.id;
        const isSelected = selectedPhraseId === phrase.id;
        const isHovered = hoveredPhraseId === phrase.id;
        const isSaved = isPhraseSaved(phrase.text);

        return (
          <div
            key={phrase.id}
            data-phrase-index={index}
            className="relative"
          >
            <motion.div
              onClick={() => handlePhraseClick(phrase)}
              onMouseEnter={() => setHoveredPhraseId(phrase.id)}
              onMouseLeave={() => setHoveredPhraseId(null)}
              className={`
                p-3 rounded-lg cursor-pointer transition-all
                ${isCurrent
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 border-l-4 border-indigo-500'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
                ${isSelected ? 'ring-2 ring-indigo-500' : ''}
                ${isSaved ? 'border-l-4 border-emerald-500' : ''}
              `}
              animate={isCurrent ? { scale: 1.01 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start gap-3">
                {/* Timestamp */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeekTo?.(phrase.startTime);
                  }}
                  className="text-xs text-gray-400 hover:text-indigo-500 transition-colors font-mono min-w-[40px]"
                  title="Ir a este momento"
                >
                  {formatTime(phrase.startTime)}
                </button>

                {/* Contenido */}
                <div className="flex-1">
                  {/* Texto en francés */}
                  <p
                    className={`
                      text-gray-900 dark:text-white
                      ${isCurrent ? 'font-medium' : ''}
                    `}
                  >
                    {phrase.text}
                    {isSaved && (
                      <span className="ml-2 text-emerald-500 text-sm" title="Guardada en SRS">
                        ✓
                      </span>
                    )}
                  </p>

                  {/* Traducción (si está habilitada o en hover) */}
                  {(showTranslations || isHovered || isSelected) && phrase.translation && (
                    <motion.p
                      className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {phrase.translation}
                    </motion.p>
                  )}
                </div>

                {/* Indicador de estado */}
                {isCurrent && (
                  <motion.div
                    className="flex items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Panel de acciones */}
            <PhraseActions
              phrase={phrase}
              source={source}
              isOpen={isSelected}
              onClose={() => setSelectedPhraseId(null)}
              onPlayPhrase={() => handlePlayPhrase(phrase)}
            />
          </div>
        );
      })}

      {/* Mensaje si no hay frases */}
      {phrases.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No hay transcripción disponible para este contenido.</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE DE SUGERENCIAS DE VOCABULARIO
// ============================================

interface VocabularySuggestionsProps {
  phrases: TranscriptPhrase[];
  source: ContentSource;
  className?: string;
}

export function VocabularySuggestions({
  phrases,
  source,
  className = '',
}: VocabularySuggestionsProps) {
  const { addCards, isPhraseSaved } = useSRSStore();
  const { addXP } = useGamificationStore();
  const [savedAll, setSavedAll] = useState(false);

  // Filtrar frases que no están guardadas
  const unsavedPhrases = phrases.filter((p) => !isPhraseSaved(p.text));

  const handleSaveAll = useCallback(() => {
    if (unsavedPhrases.length === 0) return;

    const inputs = unsavedPhrases.map((phrase) => ({
      phrase: phrase.text,
      translation: phrase.translation || '',
      audioUrl: phrase.audioUrl,
      source: {
        ...source,
        timestamp: phrase.startTime,
        context: `Vocabulario sugerido`,
      },
      languageCode: 'fr',
      levelCode: 'A1',
    }));

    addCards(inputs);
    addXP(SRS_CONFIG.xp.phraseSaved * inputs.length);
    setSavedAll(true);
  }, [unsavedPhrases, source, addCards, addXP]);

  if (unsavedPhrases.length === 0 && !savedAll) {
    return null;
  }

  return (
    <div className={`bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <span>💡</span>
          Vocabulario sugerido
        </h4>

        {!savedAll && unsavedPhrases.length > 0 && (
          <button
            onClick={handleSaveAll}
            className="text-sm px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors"
          >
            + Añadir todo ({unsavedPhrases.length})
          </button>
        )}
      </div>

      {savedAll ? (
        <motion.div
          className="text-center py-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-2xl">✅</span>
          <p className="text-amber-700 dark:text-amber-300 mt-2">
            ¡{unsavedPhrases.length} frases guardadas en tu SRS!
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            +{SRS_CONFIG.xp.phraseSaved * unsavedPhrases.length} XP
          </p>
        </motion.div>
      ) : (
        <ul className="space-y-2">
          {unsavedPhrases.slice(0, 5).map((phrase) => (
            <li
              key={phrase.id}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <span className="text-gray-900 dark:text-white font-medium">
                  {phrase.text}
                </span>
                {phrase.translation && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    - {phrase.translation}
                  </span>
                )}
              </div>
            </li>
          ))}
          {unsavedPhrases.length > 5 && (
            <li className="text-sm text-amber-600 dark:text-amber-400">
              +{unsavedPhrases.length - 5} más...
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default InteractiveTranscript;
