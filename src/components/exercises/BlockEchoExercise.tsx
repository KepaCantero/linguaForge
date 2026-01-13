"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";
import { BlockEcho, ConversationalBlock } from "@/types";
import { useGamificationStore } from "@/store/useGamificationStore";
import { XP_RULES } from "@/lib/constants";

interface BlockEchoExerciseProps {
  exercise: BlockEcho;
  block: ConversationalBlock; // El bloque completo para mostrar
  onComplete: (accuracy: number) => void;
}

type BlockEchoPhase = "listening" | "repeating" | "complete";

export function BlockEchoExercise({
  exercise,
  block,
  onComplete,
}: BlockEchoExerciseProps) {
  const { addXP } = useGamificationStore();
  const [phase, setPhase] = useState<BlockEchoPhase>("listening");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const soundRef = useRef<Howl | null>(null);

  // Inicializar audio
  useEffect(() => {
    soundRef.current = new Howl({
      src: [exercise.audioUrl],
      format: ["mp3", "ogg", "wav"],
      autoplay: false,
      onplay: () => setIsPlaying(true),
      onend: () => {
        setIsPlaying(false);
        if (phase === "listening") {
          setPhase("repeating");
        }
      },
      onloaderror: () => {
        setIsPlaying(false);
      },
    });

    // Reproducir automáticamente al montar
    setTimeout(() => {
      soundRef.current?.play();
    }, 500);

    return () => {
      soundRef.current?.unload();
    };
  }, [exercise.audioUrl, phase]);

  const handleRepeat = useCallback(() => {
    if (soundRef.current && !isPlaying) {
      soundRef.current.play();
    }
  }, [isPlaying]);

  const handleComplete = useCallback(() => {
    setPhase("complete");
    // Calcular precisión (simplificado - en producción usar análisis de audio real)
    const accuracy = 85; // Placeholder
    addXP(XP_RULES.shadowingComplete || 25);

    setTimeout(() => {
      onComplete(accuracy);
    }, 2000);
  }, [addXP, onComplete]);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Fase: Listening */}
        {phase === "listening" && (
          <motion.div
            key="listening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-calm-text-primary dark:text-white mb-2">
                🎤 Escucha el Bloque Completo
              </h3>
              <p className="text-sm text-calm-text-muted dark:text-calm-text-muted">
                Escucha toda la conversación completa
              </p>
            </div>

            {/* Bloque completo visualizado */}
            <div className="bg-white dark:bg-calm-bg-elevated rounded-2xl p-6 space-y-4">
              {/* Mostrar todas las frases del bloque */}
              {block.phrases.map((phrase, idx) => {
                const borderColors = [
                  "border-accent-500",
                  "border-sky-500",
                  "border-accent-500",
                  "border-amber-500",
                ];
                const textColors = [
                  "text-accent-600 dark:text-accent-400",
                  "text-sky-600 dark:text-sky-400",
                  "text-accent-600 dark:text-accent-400",
                  "text-amber-600 dark:text-amber-400",
                ];
                const labels = ["Inicio", "Desarrollo", "Resolución", "Cierre"];
                const borderColor = borderColors[idx % borderColors.length];
                const textColor = textColors[idx % textColors.length];
                const label =
                  idx < labels.length ? labels[idx] : `Frase ${idx + 1}`;

                return (
                  <div
                    key={phrase.id}
                    className={`border-l-4 ${borderColor} pl-4`}
                  >
                    <div className={`text-xs font-semibold ${textColor} mb-1`}>
                      {label}
                    </div>
                    <p className="text-sm font-medium text-calm-text-primary dark:text-white">
                      {phrase.text}
                    </p>
                    {showTranslation && (
                      <p className="text-xs text-calm-text-muted dark:text-calm-text-muted mt-1">
                        {phrase.translation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Controles */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="px-4 py-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary text-calm-text-secondary dark:text-calm-text-tertiary rounded-lg text-sm font-medium hover:bg-calm-warm-100 dark:hover:bg-calm-bg-tertiary transition-all"
              >
                {showTranslation ? "Ocultar" : "Mostrar"} traducción
              </button>
              <button
                onClick={handleRepeat}
                disabled={isPlaying}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-all
                  ${
                    isPlaying
                      ? "bg-calm-bg-tertiary dark:bg-calm-bg-tertiary text-calm-text-muted cursor-not-allowed"
                      : "bg-accent-500 text-white hover:bg-accent-600"
                  }
                `}
              >
                {isPlaying ? "🔊 Reproduciendo..." : "🔈 Repetir"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Fase: Repeating */}
        {phase === "repeating" && (
          <motion.div
            key="repeating"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-calm-text-primary dark:text-white mb-2">
                🎤 Repite el Bloque Completo
              </h3>
              <p className="text-sm text-calm-text-muted dark:text-calm-text-muted">
                Repite toda la conversación con la misma entonación
              </p>
            </div>

            {/* Bloque para repetir */}
            <div className="bg-gradient-to-br from-sky-50 to-sky-50 dark:from-accent-900/20 dark:to-sky-900/20 rounded-2xl p-6 space-y-3">
              {block.phrases.map((phrase) => (
                <p
                  key={phrase.id}
                  className="text-center text-sm font-medium text-calm-text-secondary dark:text-calm-text-tertiary"
                >
                  {phrase.text}
                </p>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-gradient-to-r from-accent-500 to-sky-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                ✓ Completar
              </button>
            </div>
          </motion.div>
        )}

        {/* Fase: Complete */}
        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-accent-400 to-sky-500 rounded-2xl p-8 text-center"
          >
            <span className="text-6xl mb-4 block">🎉</span>
            <h3 className="text-white text-xl font-bold mb-2">
              ¡Bloque Completado!
            </h3>
            <p className="text-white/90 text-sm">
              Has repetido el bloque conversacional completo
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
