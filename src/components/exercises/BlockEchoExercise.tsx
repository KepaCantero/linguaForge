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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                🎤 Escucha el Bloque Completo
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Escucha toda la conversación completa
              </p>
            </div>

            {/* Bloque completo visualizado */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-6 space-y-4">
              {/* Mostrar todas las frases del bloque */}
              {block.phrases.map((phrase, idx) => {
                const borderColors = [
                  "border-indigo-500",
                  "border-purple-500",
                  "border-emerald-500",
                  "border-amber-500",
                ];
                const textColors = [
                  "text-indigo-600 dark:text-indigo-400",
                  "text-purple-600 dark:text-purple-400",
                  "text-emerald-600 dark:text-emerald-400",
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
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {phrase.text}
                    </p>
                    {showTranslation && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
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
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-500 text-white hover:bg-indigo-600"
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                🎤 Repite el Bloque Completo
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Repite toda la conversación con la misma entonación
              </p>
            </div>

            {/* Bloque para repetir */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-aaa-xl p-6 space-y-3">
              {block.phrases.map((phrase) => (
                <p
                  key={phrase.id}
                  className="text-center text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {phrase.text}
                </p>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-aaa-xl shadow-lg hover:shadow-xl transition-all"
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
            className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-aaa-xl p-8 text-center"
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
