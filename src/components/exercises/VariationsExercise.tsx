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
        <span className="text-sm text-lf-muted dark:text-lf-muted/70">
          {block ? "Explora las variaciones en contexto" : "Explora las variaciones"}
        </span>
        <div className="flex justify-center gap-2 mt-3">
          {allVariations.map((variation, index) => (
            <motion.button
              key={variation.id}
              onClick={() => goToVariation(index)}
              className={`
                w-3 h-3 rounded-full transition-all
                ${index === currentIndex
                  ? 'bg-lf-primary scale-125 shadow-resonance'
                  : readVariations.has(variation.id)
                    ? 'bg-lf-success'
                    : 'bg-lf-muted/30 dark:bg-lf-muted/50'
                }
              `}
              animate={index === currentIndex ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </div>

      {/* Contexto del bloque si existe */}
      {block && (
        <motion.div
          className="bg-lf-info/10 dark:bg-lf-info/20 rounded-aaa-xl p-4 border border-lf-info/30 dark:border-lf-info/40 shadow-glass-xl backdrop-blur-aaa"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs font-semibold text-lf-info dark:text-lf-info/80 mb-2">
            {block.title}
          </div>
          <div className="text-xs text-lf-info/70 dark:text-lf-info/60">
            {block.context}
          </div>
        </motion.div>
      )}

      {/* Bloque completo con todas las frases */}
      {block && (
        <motion.div
          className="bg-lf-soft/30 dark:bg-lf-soft/50 rounded-aaa-xl p-4 border border-lf-muted/30 shadow-glass-xl backdrop-blur-aaa"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs font-semibold text-lf-muted dark:text-lf-muted/80 mb-2">
            Contexto completo:
          </div>
          <div className="space-y-2">
            {phrasesToShow.map((p) => {
              const isCurrentPhrase = p.id === phrase.id;
              return (
                <div key={p.id} className={isCurrentPhrase ? "bg-lf-primary/10 dark:bg-lf-primary/20 rounded-lg p-2 border border-lf-primary/30 dark:border-lf-primary/40" : ""}>
                  <p className={`text-sm text-lf-dark dark:text-lf-muted ${isCurrentPhrase ? "font-medium" : "opacity-60"}`}>
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
          className="bg-glass-surface dark:bg-lf-soft/50 rounded-aaa-xl p-6 shadow-glass-xl backdrop-blur-aaa border border-lf-muted/20"
          initial={{ opacity: 0, x: 100, rotateY: 15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          exit={{ opacity: 0, x: -100, rotateY: -15 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          {/* Etiqueta */}
          <div className="flex justify-between items-center mb-4">
            <span className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${currentIndex === 0
                ? 'bg-lf-primary/20 dark:bg-lf-primary/30 text-lf-primary dark:text-lf-primary'
                : 'bg-lf-secondary/20 dark:bg-lf-secondary/30 text-lf-secondary dark:text-lf-secondary'
              }
            `}>
              {currentIndex === 0 ? 'Original' : `Variación ${currentIndex}`}
            </span>
            {readVariations.has(currentVariation.id) && (
              <span className="text-lf-success">✓ Leída</span>
            )}
          </div>

          {/* Texto */}
          <p className="text-xl font-medium text-lf-dark dark:text-white mb-3 leading-relaxed">
            {currentVariation.text}
          </p>

          {/* Botón para mostrar/ocultar traducción */}
          <div className="mb-3 flex items-center justify-center">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-lf-soft/50 dark:bg-lf-muted/30 text-lf-muted dark:text-lf-muted/80 hover:bg-lf-muted/20 dark:hover:bg-lf-muted/40 border border-lf-muted/30"
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
              className="text-lf-muted dark:text-lf-muted/70 mb-6"
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
                  ? 'bg-lf-primary/20 dark:bg-lf-primary/30 text-lf-primary dark:text-lf-primary'
                  : 'bg-lf-soft/50 dark:bg-lf-muted/30 text-lf-dark dark:text-lf-muted hover:bg-lf-muted/20 dark:hover:bg-lf-muted/40 border border-lf-muted/30'
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
                    ? 'bg-lf-info/20 dark:bg-lf-info/30 text-lf-info dark:text-lf-info'
                    : 'bg-lf-info/10 dark:bg-lf-info/20 text-lf-info dark:text-lf-info/80 hover:bg-lf-info/20 dark:hover:bg-lf-info/30 border border-lf-info/30'
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
            flex-1 py-3 rounded-aaa-xl font-medium transition-all
            ${currentIndex === 0
              ? 'bg-lf-muted/20 dark:bg-lf-soft/30 text-lf-muted/50 cursor-not-allowed'
              : 'bg-glass-surface dark:bg-lf-soft/50 text-lf-dark dark:text-lf-muted hover:bg-lf-muted/20 dark:hover:bg-lf-muted/30 border border-lf-muted/30'
            }
          `}
        >
          ← Anterior
        </button>

        {!readVariations.has(currentVariation.id) ? (
          <motion.button
            onClick={markAsRead}
            className="flex-1 py-3 rounded-aaa-xl font-bold bg-forge-gradient text-white shadow-glass-xl relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            <span className="relative z-10">
              Entendido (+{XP_RULES.variationRead} XP)
            </span>
          </motion.button>
        ) : currentIndex < allVariations.length - 1 ? (
          <button
            onClick={() => goToVariation(currentIndex + 1)}
            className="flex-1 py-3 rounded-aaa-xl font-bold bg-forge-gradient text-white shadow-glass-xl hover:shadow-xl transition-all"
          >
            Siguiente →
          </button>
        ) : (
          <div className="flex-1 py-3 rounded-aaa-xl bg-lf-success/20 dark:bg-lf-success/30 text-lf-success dark:text-lf-success text-center font-medium border border-lf-success/40 shadow-glow-success">
            ✓ Todas leídas
          </div>
        )}
      </div>

      {/* Progreso */}
      <div className="bg-glass-surface dark:bg-lf-soft/50 rounded-lg p-4 shadow-glass-xl backdrop-blur-aaa border border-lf-muted/20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-lf-muted dark:text-lf-muted/80">
            Variaciones leídas
          </span>
          <span className="font-bold text-lf-primary dark:text-lf-primary">
            {readVariations.size}/{allVariations.length}
          </span>
        </div>
        <div className="w-full h-2 bg-lf-muted/20 dark:bg-lf-muted/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-forge-gradient rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${(readVariations.size / allVariations.length) * 100}%`,
              boxShadow:
                readVariations.size === allVariations.length
                  ? "0 0 20px rgba(99, 102, 241, 0.6)"
                  : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
