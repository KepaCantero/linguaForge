'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputContent, ComprehensionOption } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { XP_RULES, GEM_RULES, COIN_RULES } from '@/lib/constants';
import { SPRING, DURATION, staggerDelay } from '@/lib/motion';

interface ComprehensionTestProps {
  content: InputContent;
  onComplete: (passed: boolean, score: number) => void;
  onBack: () => void;
}

// Animation variants
const questionVariants = {
  enter: { opacity: 0, x: 50, scale: 0.98 },
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: SPRING.smooth,
  },
  exit: {
    opacity: 0,
    x: -50,
    scale: 0.98,
    transition: { duration: DURATION.fast },
  },
};

const optionVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      ...SPRING.smooth,
      delay: staggerDelay(i, 0.08),
    },
  }),
};

const resultVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING.bouncy,
  },
};

const rewardVariants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...SPRING.bouncy,
      delay: 0.3 + i * 0.15,
    },
  }),
};

export function ComprehensionTest({ content, onComplete, onBack }: ComprehensionTestProps) {
  const { addXP, addCoins, addGems } = useGamificationStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<ComprehensionOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const questions = content.comprehensionQuestions;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isPerfect = correctAnswers === totalQuestions;
  const passed = correctAnswers >= Math.ceil(totalQuestions * 0.6);

  const handleOptionSelect = useCallback((option: ComprehensionOption) => {
    if (showResult) return;

    setSelectedAnswer(option);
    setShowResult(true);

    if (option.isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }
  }, [showResult]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);

      if (passed) {
        addXP(XP_RULES.comprehensionPass);
        addCoins(COIN_RULES.inputComplete);
        addGems(isPerfect ? GEM_RULES.perfectComprehension : GEM_RULES.comprehensionPass);
      }

      setTimeout(() => {
        onComplete(passed, correctAnswers);
      }, 2500);
    }
  }, [currentQuestionIndex, totalQuestions, passed, isPerfect, correctAnswers, addXP, addCoins, addGems, onComplete]);

  const correctOption = currentQuestion?.options.find((o) => o.isCorrect);

  // Completion screen
  if (isComplete) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Result card */}
        <motion.div
          className={`
            relative rounded-2xl p-8 text-center overflow-hidden
            ${passed
              ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
              : 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500'
            }
          `}
          variants={resultVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url('/patterns/crystal-cracks.svg')",
              backgroundSize: '80px 80px',
            }}
          />

          {/* Confetti-like elements for success */}
          {passed && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-white"
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                  }}
                  animate={{
                    x: `${20 + i * 12}%`,
                    y: `${10 + (i % 3) * 30}%`,
                    scale: [0, 1, 0.5],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.2 + i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}

          {/* Trophy/Icon */}
          <motion.span
            className="text-7xl mb-4 block relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...SPRING.bouncy, delay: 0.2 }}
          >
            {isPerfect ? '🏆' : passed ? '🎉' : '💪'}
          </motion.span>

          <motion.h2
            className="font-rajdhani text-white text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {isPerfect ? '¡Perfecto!' : passed ? '¡Bien hecho!' : '¡Sigue practicando!'}
          </motion.h2>

          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-white/80 text-lg font-atkinson">
              {correctAnswers}/{totalQuestions} respuestas correctas
            </span>
          </motion.div>

          {/* Progress dots */}
          <motion.div
            className="flex justify-center gap-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {questions.map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${i < correctAnswers ? 'bg-white' : 'bg-white/30'}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + i * 0.05 }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Rewards */}
        {passed && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '⭐', value: XP_RULES.comprehensionPass, label: 'XP', color: 'text-lf-accent' },
              { icon: '💰', value: COIN_RULES.inputComplete, label: 'Monedas', color: 'text-amber-400' },
              { icon: '💎', value: isPerfect ? GEM_RULES.perfectComprehension : GEM_RULES.comprehensionPass, label: 'Gemas', color: 'text-lf-secondary' },
            ].map((reward, i) => (
              <motion.div
                key={reward.label}
                className="bg-lf-soft rounded-xl p-4 text-center border border-lf-muted/30 relative overflow-hidden"
                variants={rewardVariants}
                custom={i}
                initial="hidden"
                animate="visible"
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-lf-primary/10 to-transparent"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                <motion.span
                  className="text-3xl block mb-1 relative"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                >
                  {reward.icon}
                </motion.span>
                <p className={`font-rajdhani text-xl font-bold ${reward.color} relative`}>
                  +{reward.value}
                </p>
                <p className="font-atkinson text-xs text-gray-500 relative">{reward.label}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-lf-soft border border-lf-muted/30 flex items-center justify-center text-gray-400 hover:text-white hover:border-red-500/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>

        <div className="flex items-center gap-2">
          <span className="font-rajdhani text-sm text-lf-muted">Pregunta</span>
          <motion.span
            className="font-rajdhani text-lg font-bold text-white"
            key={currentQuestionIndex}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING.bouncy}
          >
            {currentQuestionIndex + 1}
          </motion.span>
          <span className="font-rajdhani text-sm text-lf-muted">de {totalQuestions}</span>
        </div>

        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="w-full h-2 bg-lf-dark rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-lf-primary to-lf-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + (showResult ? 1 : 0)) / totalQuestions) * 100}%` }}
            transition={{ duration: DURATION.normal, ease: 'easeOut' }}
          />
        </div>

        {/* Progress dots */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-0.5">
          {questions.map((_, i) => (
            <motion.div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < currentQuestionIndex + (showResult ? 1 : 0)
                  ? 'bg-lf-secondary'
                  : i === currentQuestionIndex
                    ? 'bg-white'
                    : 'bg-lf-muted/50'
              }`}
              initial={false}
              animate={{
                scale: i === currentQuestionIndex ? 1.5 : 1,
              }}
              transition={{ duration: DURATION.fast }}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          variants={questionVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="space-y-6"
        >
          {/* Question card */}
          <div className="bg-lf-soft rounded-xl p-6 border border-lf-muted/30 relative overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-16 h-16">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-lf-primary/20 to-transparent" />
              <span className="absolute top-2 right-3 text-lg opacity-50">❓</span>
            </div>

            <p className="font-rajdhani text-lg font-bold text-white mb-2 pr-12">
              {currentQuestion.question}
            </p>
            <p className="font-atkinson text-sm text-gray-400 italic">
              {currentQuestion.questionTranslation}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer?.id === option.id;
              const showCorrect = showResult && option.isCorrect;
              const showIncorrect = showResult && isSelected && !option.isCorrect;

              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  disabled={showResult}
                  className={`
                    w-full p-4 rounded-xl text-left font-medium transition-all relative overflow-hidden
                    ${showCorrect
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 ring-offset-2 ring-offset-lf-dark'
                      : showIncorrect
                        ? 'bg-red-500 text-white ring-2 ring-red-300 ring-offset-2 ring-offset-lf-dark'
                        : isSelected
                          ? 'bg-gradient-to-r from-lf-primary to-lf-secondary text-white'
                          : 'bg-lf-soft text-gray-300 hover:text-white border border-lf-muted/30 hover:border-lf-primary/50'
                    }
                  `}
                  variants={optionVariants}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  whileHover={!showResult ? { scale: 1.02, x: 4 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                >
                  {/* Success/Error animation overlay */}
                  {(showCorrect || showIncorrect) && (
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  <div className="flex items-center gap-3 relative">
                    <motion.span
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${showCorrect
                          ? 'bg-white/30'
                          : showIncorrect
                            ? 'bg-white/30'
                            : isSelected
                              ? 'bg-white/20'
                              : 'bg-lf-dark border border-lf-muted/50'
                        }
                      `}
                      animate={showCorrect ? { scale: [1, 1.3, 1] } : showIncorrect ? { x: [-3, 3, -3, 3, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      {showCorrect ? '✓' : showIncorrect ? '✗' : String.fromCharCode(65 + index)}
                    </motion.span>
                    <span className="font-atkinson">{option.text}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Result feedback */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                className={`
                  p-4 rounded-xl text-center border
                  ${selectedAnswer?.isCorrect
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }
                `}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={SPRING.smooth}
              >
                <motion.span
                  className="text-2xl mr-2 inline-block"
                  animate={selectedAnswer?.isCorrect ? { rotate: [0, 15, -15, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {selectedAnswer?.isCorrect ? '🎉' : '💡'}
                </motion.span>
                <span className="font-atkinson font-medium">
                  {selectedAnswer?.isCorrect
                    ? '¡Correcto!'
                    : `La respuesta correcta es: ${correctOption?.text}`
                  }
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          <AnimatePresence>
            {showResult && (
              <motion.button
                onClick={handleNext}
                className="w-full py-4 bg-gradient-to-r from-lf-primary to-lf-secondary text-white font-rajdhani font-bold text-lg rounded-xl shadow-lg shadow-lf-primary/25 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={SPRING.smooth}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(126,34,206,0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <>
                      Siguiente pregunta
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      >
                        →
                      </motion.span>
                    </>
                  ) : (
                    <>
                      Ver resultado
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      >
                        ✨
                      </motion.span>
                    </>
                  )}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
