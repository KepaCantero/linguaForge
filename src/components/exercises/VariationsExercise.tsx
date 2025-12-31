'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phrase, Variation, ConversationalBlock } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useTTS } from '@/services/ttsService';
import { XP_RULES } from '@/lib/constants';

interface VariationsExerciseProps {
  phrase: Phrase;
  block?: ConversationalBlock; // Bloque completo para contexto
  onComplete: () => void;
}

export function VariationsExercise({ phrase, block, onComplete }: VariationsExerciseProps) {
  const { addXP } = useGamificationStore();
  const { speak, isSpeaking } = useTTS();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [readVariations, setReadVariations] = useState<Set<string>>(new Set());
  const [showTranslation, setShowTranslation] = useState(false);

  const allVariations: Variation[] = [
    // La frase original como primera variación
    {
      id: 'original',
      text: phrase.text,
      translation: phrase.translation,
      audioUrl: phrase.audioUrl,
    },
    ...phrase.variations,
  ];

  const currentVariation = allVariations[currentIndex];
  
  // Si hay un bloque, mostrar todas las frases del bloque con contexto
  const phrasesToShow = block?.phrases || [phrase];
  const currentPhraseIndex = block?.phrases.findIndex(p => p.id === phrase.id) ?? 0;
  
  // Texto completo del bloque para reproducir
  const fullBlockText = block 
    ? block.phrases.map(p => p.text).join(" ")
    : phrase.text;

  // Reproducir audio con TTS
  const playAudio = useCallback(() => {
    speak(currentVariation.text);
  }, [speak, currentVariation.text]);
  
  // Reproducir bloque completo
  const playBlockAudio = useCallback(() => {
    speak(fullBlockText);
  }, [speak, fullBlockText]);

  const markAsRead = useCallback(() => {
    setReadVariations(prev => new Set([...Array.from(prev), currentVariation.id]));
    addXP(XP_RULES.variationRead);

    if (currentIndex < allVariations.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (readVariations.size + 1 >= allVariations.length) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [currentVariation.id, currentIndex, allVariations.length, readVariations.size, addXP, onComplete]);

  const goToVariation = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {block ? "Explora las variaciones en contexto" : "Explora las variaciones"}
        </span>
        <div className="flex justify-center gap-2 mt-3">
          {allVariations.map((variation, index) => (
            <button
              key={variation.id}
              onClick={() => goToVariation(index)}
              className={`
                w-3 h-3 rounded-full transition-all
                ${index === currentIndex
                  ? 'bg-indigo-500 scale-125'
                  : readVariations.has(variation.id)
                    ? 'bg-emerald-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
            />
          ))}
        </div>
      </div>

      {/* Contexto del bloque si existe */}
      {block && (
        <motion.div
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
            {block.title}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            {block.context}
          </div>
        </motion.div>
      )}

      {/* Bloque completo con todas las frases */}
      {block && (
        <motion.div
          className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Contexto completo:
          </div>
          <div className="space-y-2">
            {phrasesToShow.map((p, idx) => {
              const isCurrentPhrase = p.id === phrase.id;
              return (
                <div key={p.id} className={isCurrentPhrase ? "bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2 border border-indigo-200 dark:border-indigo-800" : ""}>
                  <p className={`text-sm text-gray-700 dark:text-gray-300 ${isCurrentPhrase ? "font-medium" : "opacity-60"}`}>
                    {p.text}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Tarjeta de variación */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVariation.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          {/* Etiqueta */}
          <div className="flex justify-between items-center mb-4">
            <span className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${currentIndex === 0
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
              }
            `}>
              {currentIndex === 0 ? 'Original' : `Variación ${currentIndex}`}
            </span>
            {readVariations.has(currentVariation.id) && (
              <span className="text-emerald-500">✓ Leída</span>
            )}
          </div>

          {/* Texto */}
          <p className="text-xl font-medium text-gray-900 dark:text-white mb-3 leading-relaxed">
            {currentVariation.text}
          </p>

          {/* Botón para mostrar/ocultar traducción */}
          <div className="mb-3 flex items-center justify-center">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <span>{showTranslation ? "👁️" : "👁️‍🗨️"}</span>
              <span>{showTranslation ? "Ocultar traducción" : "Mostrar traducción"}</span>
            </button>
          </div>

          {/* Traducción */}
          {showTranslation && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-500 dark:text-gray-400 mb-6"
            >
              {currentVariation.translation}
            </motion.p>
          )}

          {/* Botones de audio */}
          <div className="space-y-2">
            <button
              onClick={playAudio}
              disabled={isSpeaking}
              className={`
                w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all
                ${isSpeaking
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              <motion.span
                animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                {isSpeaking ? '🔊' : '🔈'}
              </motion.span>
              <span>{isSpeaking ? 'Reproduciendo...' : 'Escuchar variación'}</span>
            </button>
            {block && (
              <button
                onClick={playBlockAudio}
                disabled={isSpeaking}
                className={`
                  w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm
                  ${isSpeaking
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  }
                `}
              >
                <span>🔊</span>
                <span>{isSpeaking ? 'Reproduciendo...' : 'Escuchar bloque completo'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navegación */}
      <div className="flex gap-3">
        <button
          onClick={() => goToVariation(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className={`
            flex-1 py-3 rounded-xl font-medium transition-all
            ${currentIndex === 0
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }
          `}
        >
          ← Anterior
        </button>

        {!readVariations.has(currentVariation.id) ? (
          <button
            onClick={markAsRead}
            className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Entendido (+{XP_RULES.variationRead} XP)
          </button>
        ) : currentIndex < allVariations.length - 1 ? (
          <button
            onClick={() => goToVariation(currentIndex + 1)}
            className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Siguiente →
          </button>
        ) : (
          <div className="flex-1 py-3 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-center font-medium">
            ✓ Todas leídas
          </div>
        )}
      </div>

      {/* Progreso */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Variaciones leídas
          </span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {readVariations.size}/{allVariations.length}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(readVariations.size / allVariations.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
