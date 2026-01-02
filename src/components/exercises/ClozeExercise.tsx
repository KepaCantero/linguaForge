"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phrase, ClozeOption, ConversationalBlock } from "@/types";
import { useGamificationStore } from "@/store/useGamificationStore";
import { useTTS } from "@/services/ttsService";
import { XP_RULES } from "@/lib/constants";

interface ClozeExerciseProps {
  phrase: Phrase;
  block?: ConversationalBlock; // Bloque completo para contexto
  onComplete: (correct: boolean) => void;
}

export function ClozeExercise({ phrase, block, onComplete }: ClozeExerciseProps) {
  const { addXP } = useGamificationStore();
  const { speak, isSpeaking } = useTTS();
  const [selectedOption, setSelectedOption] = useState<ClozeOption | null>(
    null
  );
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  // Si hay un bloque, mostrar todas las frases del bloque con contexto
  const phrasesToShow = block?.phrases || [phrase];

  // Crear texto con hueco solo para la frase actual
  const textWithGap = phrase.text.replace(phrase.clozeWord, "______");

  // Texto completo del bloque para reproducir
  const fullBlockText = block 
    ? block.phrases.map(p => p.text).join(" ")
    : phrase.text;

  // Reproducir la frase completa o el bloque completo con TTS
  const playPhrase = useCallback(() => {
    speak(fullBlockText);
  }, [speak, fullBlockText]);

  const handleOptionSelect = useCallback(
    (option: ClozeOption) => {
      if (showResult) return;

      // Feedback háptico en móviles
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(10);
      }

      setSelectedOption(option);
      setIsCorrect(option.isCorrect);
      setShowResult(true);

      // Dar XP
      addXP(option.isCorrect ? XP_RULES.clozeCorrect : XP_RULES.clozeIncorrect);

      // Esperar antes de continuar (estandarizado a 2s)
      setTimeout(() => {
        onComplete(option.isCorrect);
      }, 2000);
    },
    [showResult, addXP, onComplete]
  );

  // Atajos de teclado: 1-4 para seleccionar opción, ESPACIO para reproducir audio
  useEffect(() => {
    if (showResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESPACIO para reproducir audio
      if (e.key === " " && !isSpeaking) {
        e.preventDefault();
        playPhrase();
        return;
      }

      // 1-4 para seleccionar opción
      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 4 && phrase.clozeOptions[keyNum - 1]) {
        e.preventDefault();
        handleOptionSelect(phrase.clozeOptions[keyNum - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showResult,
    isSpeaking,
    phrase.clozeOptions,
    playPhrase,
    handleOptionSelect,
  ]);

  // Reproducir automáticamente cuando se muestra el resultado correcto
  useEffect(() => {
    if (showResult && isCorrect) {
      const timer = setTimeout(() => {
        speak(fullBlockText);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showResult, isCorrect, speak, fullBlockText]);

  const correctOption = phrase.clozeOptions.find((o) => o.isCorrect);

  return (
    <div className="space-y-6">
      {/* Instrucción */}
      <div className="text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {block ? "Completa la palabra faltante en el contexto" : "Completa la frase"}
        </span>
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
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-3">
          {phrasesToShow.map((p) => {
            const isCurrentPhrase = p.id === phrase.id;
            const phraseText = isCurrentPhrase 
              ? textWithGap 
              : p.text;
            
            return (
              <div key={p.id} className={isCurrentPhrase ? "bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border-2 border-indigo-200 dark:border-indigo-800" : ""}>
                <p className={`text-lg font-medium text-gray-900 dark:text-white leading-relaxed ${isCurrentPhrase ? "" : "opacity-60"}`}>
                  {phraseText.split("______").map((part, index, array) => (
                    <span key={index}>
                      {part}
                      {index < array.length - 1 && (
                        <motion.span
                          className={`
                          inline-block min-w-24 mx-1 px-3 py-1 rounded-lg font-bold
                          ${
                            showResult
                              ? isCorrect
                                ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                                : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                              : "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                          }
                        `}
                          initial={showResult && isCorrect ? { scale: 0.8 } : {}}
                          animate={showResult && isCorrect ? { scale: [0.8, 1.1, 1] } : {}}
                          transition={showResult && isCorrect ? { duration: 0.4 } : {}}
                        >
                          {showResult
                            ? isCorrect
                              ? selectedOption?.text
                              : correctOption?.text
                            : selectedOption?.text || "?"}
                        </motion.span>
                      )}
                    </span>
                  ))}
                </p>
                {!isCurrentPhrase && showTranslation && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {p.translation}
                    </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Botón para mostrar/ocultar traducción */}
        <div className="mt-4 flex items-center justify-center">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <span>{showTranslation ? "👁️" : "👁️‍🗨️"}</span>
            <span>
              {showTranslation ? "Ocultar traducción" : "Mostrar traducción"}
            </span>
          </button>
        </div>

        {/* Traducción del bloque completo */}
        {showTranslation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-2"
          >
            {block ? (
              <div className="space-y-1">
                {block.phrases.map((p) => (
                  <p key={p.id} className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{p.text}:</span> {p.translation}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {phrase.translation}
              </p>
            )}
          </motion.div>
        )}

        {/* Botón de audio */}
        <button
          onClick={() => speak(fullBlockText)}
          disabled={isSpeaking}
          className={`
            mt-4 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all mx-auto
            ${
              isSpeaking
                ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }
          `}
        >
          <motion.span
            animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            {isSpeaking ? "🔊" : "🔈"}
          </motion.span>
          <span>{isSpeaking ? "Reproduciendo..." : block ? "Escuchar bloque completo" : "Escuchar"}</span>
        </button>
      </motion.div>

      {/* Opciones */}
      <div className="grid grid-cols-2 gap-3">
        {phrase.clozeOptions.map((option, index) => {
          const isSelected = selectedOption?.id === option.id;
          const showCorrect = showResult && option.isCorrect;
          const showIncorrect = showResult && isSelected && !option.isCorrect;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleOptionSelect(option)}
              disabled={showResult}
              className={`
                p-4 rounded-xl font-medium text-center transition-all
                ${
                  showCorrect
                    ? "bg-emerald-500 text-white ring-4 ring-emerald-300"
                    : showIncorrect
                    ? "bg-red-500 text-white ring-4 ring-red-300"
                    : isSelected
                    ? "bg-indigo-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }
                ${showResult ? "cursor-default opacity-50" : "cursor-pointer"}
                border border-gray-200 dark:border-gray-700
              `}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                showCorrect
                  ? { 
                      scale: [1, 1.15, 1], 
                      boxShadow: [
                        "0 0 0px rgba(16, 185, 129, 0)", 
                        "0 0 25px rgba(16, 185, 129, 0.6)", 
                        "0 0 15px rgba(16, 185, 129, 0.4)"
                      ] 
                    }
                  : showIncorrect
                  ? { x: [0, -8, 8, -8, 8, 0] }
                  : { opacity: 1, scale: 1 }
              }
              transition={showCorrect || showIncorrect ? { duration: 0.5 } : { delay: index * 0.1 }}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.95 } : {}}
            >
              {option.text}
              {showCorrect && <span className="ml-2">✓</span>}
              {showIncorrect && <span className="ml-2">✗</span>}
            </motion.button>
          );
        })}
      </div>

      {/* Resultado */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            className={`
              p-4 rounded-xl text-center
              ${
                isCorrect
                  ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                  : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
              }
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-2xl mr-2">{isCorrect ? "🎉" : "💡"}</span>
            <span className="font-medium">
              {isCorrect
                ? `¡Correcto! +${XP_RULES.clozeCorrect} XP`
                : `La respuesta correcta era: ${correctOption?.text}`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
