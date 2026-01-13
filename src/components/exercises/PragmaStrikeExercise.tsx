'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PragmaStrike, PragmaStrikeOption } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { XP_RULES } from '@/lib/constants';
import Image from 'next/image';
import { COLORS } from '@/constants/colors';

interface PragmaStrikeExerciseProps {
  exercise: PragmaStrike;
  onComplete: (correct: boolean, timeSpent: number) => void;
  mode?: 'academia' | 'desafio';
}

export function PragmaStrikeExercise({ exercise, onComplete, mode = 'desafio' }: PragmaStrikeExerciseProps) {
  const { addXP } = useGamificationStore();
  const [selectedOption, setSelectedOption] = useState<PragmaStrikeOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const timerEnabled = mode === 'desafio';
  const [timeRemaining, setTimeRemaining] = useState(timerEnabled ? exercise.timeLimit : 0);
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const calculateXPEarned = useCallback((isCorrect: boolean, finalTime: number): number => {
    if (!isCorrect) return XP_RULES.pragmaStrikeIncorrect;
    return finalTime < 3 ? XP_RULES.pragmaStrikeFast : XP_RULES.pragmaStrikeNormal;
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const handleOptionSelect = useCallback((option: PragmaStrikeOption) => {
    if (showResult) return;

    const finalTime = (Date.now() - startTimeRef.current) / 1000;
    const xpEarned = calculateXPEarned(option.isCorrect, finalTime);

    setSelectedOption(option);
    setIsCorrect(option.isCorrect);
    setShowResult(true);
    setTimeSpent(finalTime);
    setTimeRemaining(0);
    stopTimer();
    addXP(xpEarned);

    setTimeout(() => {
      onComplete(option.isCorrect, finalTime);
    }, 2000);
  }, [showResult, calculateXPEarned, stopTimer, addXP, onComplete]);

  // Timer countdown (solo en modo desafío)
  useEffect(() => {
    if (showResult) return;

    startTimeRef.current = Date.now();

    // Maneja el tick del timer en modo desafío
    const tickChallengeTimer = () => {
      setTimeRemaining((prev) => {
        const shouldAutoSelect = prev <= 0.1 && !selectedOption;
        if (shouldAutoSelect) {
          handleOptionSelect(exercise.options[0]);
        }
        return prev <= 0.1 ? 0 : prev - 0.1;
      });
      setTimeSpent((Date.now() - startTimeRef.current) / 1000);
    };

    // Maneja el tick del timer en modo academia
    const tickAcademiaTimer = () => {
      setTimeSpent((Date.now() - startTimeRef.current) / 1000);
    };

    const startTimer = timerEnabled ? tickChallengeTimer : tickAcademiaTimer;
    timerRef.current = setInterval(startTimer, 100);

    return stopTimer;
  }, [showResult, exercise.options, selectedOption, handleOptionSelect, timerEnabled, stopTimer]);

  const correctOption = exercise.options.find(o => o.isCorrect);

  // Presión visual del timer (solo en modo desafío)
  const timerPressure = timerEnabled ? timeRemaining / exercise.timeLimit : 1;
  const isUrgent = timerEnabled && timerPressure < 0.3;

  return (
    <motion.div
      className="space-y-6"
      animate={isUrgent ? { borderColor: [COLORS.transparent.error, COLORS.error[50], COLORS.transparent.error] } : {}}
      style={{ borderWidth: isUrgent ? 2 : 0, borderRadius: 16, padding: isUrgent ? 8 : 0 }}
      transition={{ duration: 0.5, repeat: Infinity }}
    >
      <ExerciseInstruction />
      {timerEnabled && (
        <TimerDisplay
          timeRemaining={timeRemaining}
          timerPressure={timerPressure}
          showResult={showResult}
          timeSpent={timeSpent}
        />
      )}
      <SituationImage exercise={exercise} />
      <SituationDescription exercise={exercise} />
      <OptionsList
        options={exercise.options}
        selectedOption={selectedOption}
        showResult={showResult}
        onOptionSelect={handleOptionSelect}
      />
      <AnimatePresence>
        {showResult && selectedOption && (
          <ExplanationPanel
            isCorrect={isCorrect}
            selectedOption={selectedOption}
            correctOption={correctOption}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showResult && (
          <ResultBanner isCorrect={isCorrect} timeSpent={timeSpent} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// SUBCOMPONENTES
// ============================================

function ExerciseInstruction() {
  return (
    <div className="text-center">
      <span className="text-sm text-calm-text-muted dark:text-calm-text-muted">
        Selecciona la frase más cortés para esta situación
      </span>
    </div>
  );
}

interface TimerDisplayProps {
  timeRemaining: number;
  timerPressure: number;
  showResult: boolean;
  timeSpent: number;
}

function TimerDisplay({ timeRemaining, timerPressure, showResult, timeSpent }: TimerDisplayProps) {
  const isUrgent = timerPressure < 0.3;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full max-w-xs h-3 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isUrgent ? "bg-semantic-error" : "bg-accent-500"
          }`}
          initial={{ width: "100%" }}
          animate={isUrgent ? {
            width: `${timerPressure * 100}%`,
            opacity: [1, 0.6, 1]
          } : { width: `${timerPressure * 100}%` }}
          transition={isUrgent ? { duration: 0.3, repeat: Infinity } : { duration: 0.1, ease: "linear" }}
        />
      </div>
      <motion.div
        className={`text-2xl font-bold ${
          isUrgent ? "text-semantic-error" : "text-calm-text-secondary dark:text-calm-text-tertiary"
        }`}
        animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
        transition={isUrgent ? { duration: 0.3, repeat: Infinity } : {}}
      >
        {timeRemaining.toFixed(1)}s
      </motion.div>
      {showResult && timeSpent < 3 && (
        <motion.div
          className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          ⚡ RÁPIDO
        </motion.div>
      )}
    </div>
  );
}

interface SituationImageProps {
  exercise: PragmaStrike;
}

function SituationImage({ exercise }: SituationImageProps) {
  return (
    <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-calm-bg-secondary dark:bg-calm-bg-elevated">
      <Image
        src={exercise.situationImage}
        alt={exercise.situationDescription}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 600px"
      />
    </div>
  );
}

interface SituationDescriptionProps {
  exercise: PragmaStrike;
}

function SituationDescription({ exercise }: SituationDescriptionProps) {
  return (
    <div className="bg-white dark:bg-calm-bg-elevated rounded-2xl p-4">
      <p className="text-sm text-calm-text-secondary dark:text-calm-text-muted text-center">
        {exercise.situationDescription}
      </p>
    </div>
  );
}

interface OptionsListProps {
  options: PragmaStrikeOption[];
  selectedOption: PragmaStrikeOption | null;
  showResult: boolean;
  onOptionSelect: (option: PragmaStrikeOption) => void;
}

function OptionsList({ options, selectedOption, showResult, onOptionSelect }: OptionsListProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {options.map((option, index) => {
        const isSelected = selectedOption?.id === option.id;
        const showCorrect = showResult && option.isCorrect;
        const showIncorrect = showResult && isSelected && !option.isCorrect;

        return (
          <OptionButton
            key={option.id}
            option={option}
            index={index}
            isSelected={isSelected}
            showCorrect={showCorrect}
            showIncorrect={showIncorrect}
            showResult={showResult}
            onSelect={() => onOptionSelect(option)}
          />
        );
      })}
    </div>
  );
}

interface OptionButtonProps {
  option: PragmaStrikeOption;
  index: number;
  isSelected: boolean;
  showCorrect: boolean;
  showIncorrect: boolean;
  showResult: boolean;
  onSelect: () => void;
}

function OptionButton({ option, index, isSelected, showCorrect, showIncorrect, showResult, onSelect }: OptionButtonProps) {
  const buttonClass = getOptionButtonClass(showCorrect, showIncorrect, isSelected, showResult);

  return (
    <motion.button
      onClick={onSelect}
      disabled={showResult}
      className={buttonClass}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!showResult ? { scale: 1.02 } : {}}
      whileTap={!showResult ? { scale: 0.98 } : {}}
    >
      {option.text}
      {showCorrect && <span className="ml-2">✓</span>}
      {showIncorrect && <span className="ml-2">✗</span>}
    </motion.button>
  );
}

function getOptionButtonClass(showCorrect: boolean, showIncorrect: boolean, isSelected: boolean, _showResult: boolean): string {
  if (showCorrect) {
    return 'p-4 rounded-2xl font-medium text-left transition-all bg-accent-500 text-white ring-4 ring-emerald-300 cursor-default border border-calm-warm-100 dark:border-calm-warm-200';
  }
  if (showIncorrect) {
    return 'p-4 rounded-2xl font-medium text-left transition-all bg-semantic-error text-white ring-4 ring-red-300 cursor-default border border-calm-warm-100 dark:border-calm-warm-200';
  }
  if (isSelected) {
    return 'p-4 rounded-2xl font-medium text-left transition-all bg-accent-500 text-white cursor-pointer border border-calm-warm-100 dark:border-calm-warm-200';
  }
  return 'p-4 rounded-2xl font-medium text-left transition-all bg-white dark:bg-calm-bg-elevated text-calm-text-primary dark:text-white hover:bg-calm-bg-primary dark:hover:bg-calm-bg-tertiary cursor-pointer border border-calm-warm-100 dark:border-calm-warm-200';
}

interface ExplanationPanelProps {
  isCorrect: boolean;
  selectedOption: PragmaStrikeOption;
  correctOption: PragmaStrikeOption | undefined;
}

function ExplanationPanel({ isCorrect, selectedOption, correctOption }: ExplanationPanelProps) {
  const panelClass = isCorrect
    ? 'bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-emerald-800'
    : 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800';

  return (
    <motion.div
      className={`p-4 rounded-2xl ${panelClass}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">
          {isCorrect ? '✅' : '💡'}
        </span>
        <div className="flex-1">
          <p className="font-semibold text-calm-text-primary dark:text-white mb-2">
            {isCorrect ? '¡Correcto!' : 'Explicación'}
          </p>
          <p className="text-sm text-calm-text-secondary dark:text-calm-text-tertiary">
            {selectedOption.explanation}
          </p>
          {!isCorrect && correctOption && (
            <p className="text-sm text-accent-700 dark:text-accent-300 mt-2 font-medium">
              La respuesta más cortés es: &ldquo;{correctOption.text}&rdquo;
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface ResultBannerProps {
  isCorrect: boolean;
  timeSpent: number;
}

function ResultBanner({ isCorrect, timeSpent }: ResultBannerProps) {
  const bannerClass = isCorrect
    ? 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300'
    : 'bg-semantic-error-bg dark:bg-semantic-error-bg text-semantic-error-text dark:text-semantic-error-text';

  const xpEarned = isCorrect
    ? (timeSpent < 3 ? XP_RULES.pragmaStrikeFast : XP_RULES.pragmaStrikeNormal)
    : XP_RULES.pragmaStrikeIncorrect;

  const message = isCorrect
    ? `¡Correcto! +${xpEarned} XP`
    : `Aprendiste algo nuevo! +${xpEarned} XP`;

  const icon = isCorrect ? '🎉' : '📚';

  return (
    <motion.div
      className={`p-4 rounded-2xl text-center ${bannerClass}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <span className="text-2xl mr-2">{icon}</span>
      <span className="font-medium">{message}</span>
    </motion.div>
  );
}

