"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Vocabulary, VocabularyOption } from "@/types";
import { useGamificationStore } from "@/store/useGamificationStore";
import { XP_RULES } from "@/lib/constants";
import Image from "next/image";
import { COLORS } from "@/constants/colors";

interface VocabularyExerciseProps {
  exercise: Vocabulary;
  onComplete: (correct: boolean) => void;
}

export function VocabularyExercise({
  exercise,
  onComplete,
}: VocabularyExerciseProps) {
  const { addXP } = useGamificationStore();
  const [selectedOption, setSelectedOption] = useState<VocabularyOption | null>(
    null
  );
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionSelect = useCallback(
    (option: VocabularyOption) => {
      if (showResult) return;

      // Feedback háptico en móviles
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(10);
      }

      setSelectedOption(option);
      setIsCorrect(option.isCorrect);
      setShowResult(true);

      // Dar XP
      addXP(
        option.isCorrect
          ? XP_RULES.vocabularyCorrect
          : XP_RULES.vocabularyIncorrect
      );

      // Esperar antes de continuar
      setTimeout(() => {
        onComplete(option.isCorrect);
      }, 2000);
    },
    [showResult, addXP, onComplete]
  );

  const correctOption = exercise.options.find(
    (o: VocabularyOption) => o.isCorrect
  );

  return (
    <div className="space-y-6">
      {/* Instrucción */}
      <div className="text-center">
        <span className="text-sm text-calm-text-muted dark:text-calm-text-muted">
          Selecciona la palabra que corresponde a la imagen
        </span>
      </div>

      {/* Imagen */}
      <motion.div
        className="relative w-full h-64 rounded-2xl overflow-hidden bg-calm-bg-secondary dark:bg-calm-bg-elevated border-2 border-calm-warm-100 dark:border-calm-warm-200"
        initial={{ opacity: 0, y: -30, rotateX: 15 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <Image
          src={exercise.imageUrl}
          alt={exercise.word}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </motion.div>

      {/* Opciones */}
      <div className="grid grid-cols-2 gap-3">
        {exercise.options.map((option: VocabularyOption, index: number) => {
          const isSelected = selectedOption?.id === option.id;
          const showCorrect = showResult && option.isCorrect;
          const showIncorrect = showResult && isSelected && !option.isCorrect;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleOptionSelect(option)}
              disabled={showResult}
              className={`
                p-4 rounded-2xl font-medium text-center transition-all
                ${
                  showCorrect
                    ? "bg-accent-500 text-white ring-4 ring-emerald-300"
                    : showIncorrect
                    ? "bg-semantic-error text-white ring-4 ring-red-300"
                    : isSelected
                    ? "bg-accent-500 text-white"
                    : "bg-white dark:bg-calm-bg-elevated text-calm-text-primary dark:text-white hover:bg-calm-bg-primary dark:hover:bg-calm-bg-tertiary"
                }
                ${showResult ? "cursor-default opacity-50" : "cursor-pointer"}
                border border-calm-warm-100 dark:border-calm-warm-200
              `}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={
                showCorrect
                  ? {
                      scale: [1, 1.08, 1.03],
                      boxShadow: [
                        COLORS.transparent.accent,
                        "0 0 30px COLORS.accent[60]",
                        "0 0 20px var(--accent-500)/40",
                      ],
                    }
                  : { opacity: 1, x: 0 }
              }
              transition={
                showCorrect
                  ? { duration: 0.5 }
                  : { delay: 0.3 + index * 0.15, type: "spring" }
              }
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
              p-4 rounded-2xl text-center
              ${
                isCorrect
                  ? "bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300"
                  : "bg-semantic-error-bg dark:bg-semantic-error-bg text-semantic-error-text dark:text-semantic-error-text"
              }
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.span
              className="text-2xl mr-2"
              animate={{ rotate: isCorrect ? [0, 15, -15, 0] : [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              {isCorrect ? "🎉" : "💡"}
            </motion.span>
            <span className="font-medium">
              {isCorrect
                ? `¡Correcto! "${exercise.word}" = "${exercise.translation}" (+${XP_RULES.vocabularyCorrect} XP)`
                : `La respuesta correcta es: "${correctOption?.text}" = "${exercise.translation}" (+${XP_RULES.vocabularyIncorrect} XP)`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
