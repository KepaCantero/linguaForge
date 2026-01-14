'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phrase, Variation, ConversationalBlock } from '@/types';
import { useTTS } from '@/services/ttsService';
import { XP_RULES } from '@/lib/constants';
import {
  useExerciseGamification,
  useExerciseUI,
  useExerciseSteps,
  useExerciseAudio,
} from './hooks';

interface VariationsExerciseProps {
  phrase: Phrase;
  block?: ConversationalBlock; // Bloque completo para contexto
  onComplete: () => void;
}

export function VariationsExercise({ phrase, block, onComplete }: VariationsExerciseProps) {
  // Use shared hooks
  const { grantReward } = useExerciseGamification();
  const { showTranslation, toggleTranslation } = useExerciseUI();
  const { isPlaying, play } = useExerciseAudio();

  // Calculate all variations
  const allVariations: Variation[] = [
    {
      id: 'original',
      text: phrase.text,
      translation: phrase.translation,
      audioUrl: phrase.audioUrl,
    },
    ...phrase.variations,
  ];

  // Use shared steps hook for navigation
  const {
    currentIndex,
    goToStep,
    markStepComplete,
    completedSteps,
  } = useExerciseSteps(allVariations.length);

  // Local state
  const [readVariations, setReadVariations] = useState<Set<string>>(new Set());

  const currentVariation = allVariations[currentIndex];

  // Si hay un bloque, mostrar todas las frases del bloque con contexto
  const phrasesToShow = block?.phrases || [phrase];

  // Texto completo del bloque para reproducir
  const fullBlockText = block
    ? block.phrases.map(p => p.text).join(" ")
    : phrase.text;

  // Reproducir audio usando shared hook
  const playAudio = useCallback(() => {
    play(currentVariation.text);
  }, [play, currentVariation.text]);

  // Reproducir bloque completo
  const playBlockAudio = useCallback(() => {
    play(fullBlockText);
  }, [play, fullBlockText]);

  const markAsRead = useCallback(() => {
    setReadVariations(prev => new Set([...Array.from(prev), currentVariation.id]));
    markStepComplete(currentIndex);

    // Grant rewards using shared hook
    grantReward({
      baseXP: XP_RULES.variationRead,
    });

    if (currentIndex < allVariations.length - 1) {
      goToStep(currentIndex + 1);
    } else if (readVariations.size + 1 >= allVariations.length) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [currentVariation.id, currentIndex, allVariations.length, readVariations.size, grantReward, onComplete, markStepComplete, goToStep]);

  const goToVariation = useCallback((index: number) => {
    goToStep(index);
  }, [goToStep]);

  return (
    <div className="space-y-6">
      <VariationsHeader
        hasBlock={!!block}
        allVariations={allVariations}
        currentIndex={currentIndex}
        readVariations={readVariations}
        onGoToVariation={goToVariation}
      />
      {block && <BlockContext block={block} />}
      {block && <BlockPhrases phrases={phrasesToShow} currentPhraseId={phrase.id} />}
      <VariationCard
        currentVariation={currentVariation}
        currentIndex={currentIndex}
        readVariations={readVariations}
        showTranslation={showTranslation}
        isSpeaking={isPlaying}
        onToggleTranslation={toggleTranslation}
        onPlayAudio={playAudio}
        onPlayBlockAudio={playBlockAudio}
        hasBlock={!!block}
      />
      <NavigationButtons
        currentIndex={currentIndex}
        totalVariations={allVariations.length}
        currentVariationId={currentVariation.id}
        readVariations={readVariations}
        onPrevious={() => goToVariation(Math.max(0, currentIndex - 1))}
        onMarkAsRead={markAsRead}
        onNext={() => goToVariation(currentIndex + 1)}
      />
      <ProgressTracker
        readCount={readVariations.size}
        totalCount={allVariations.length}
      />
    </div>
  );
}

// ============================================
// SUBCOMPONENTES
// ============================================

interface VariationsHeaderProps {
  hasBlock: boolean;
  allVariations: Variation[];
  currentIndex: number;
  readVariations: Set<string>;
  onGoToVariation: (index: number) => void;
}

function VariationsHeader({
  hasBlock,
  allVariations,
  currentIndex,
  readVariations,
  onGoToVariation,
}: VariationsHeaderProps) {
  return (
    <div className="text-center">
      <span className="text-sm text-calm-text-muted dark:text-calm-text-muted/70">
        {hasBlock ? "Explora las variaciones en contexto" : "Explora las variaciones"}
      </span>
      <VariationDots
        allVariations={allVariations}
        currentIndex={currentIndex}
        readVariations={readVariations}
        onGoToVariation={onGoToVariation}
      />
    </div>
  );
}

interface VariationDotsProps {
  allVariations: Variation[];
  currentIndex: number;
  readVariations: Set<string>;
  onGoToVariation: (index: number) => void;
}

function VariationDots({ allVariations, currentIndex, readVariations, onGoToVariation }: VariationDotsProps) {
  return (
    <div className="flex justify-center gap-2 mt-3">
      {allVariations.map((variation, index) => {
        const dotClass = getVariationDotClass(index, currentIndex, readVariations.has(variation.id));
        return (
          <motion.button
            key={variation.id}
            onClick={() => onGoToVariation(index)}
            className={dotClass}
            animate={index === currentIndex ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.2 }}
          />
        );
      })}
    </div>
  );
}

function getVariationDotClass(index: number, currentIndex: number, isRead: boolean): string {
  if (index === currentIndex) {
    return 'w-3 h-3 rounded-full transition-all bg-accent-500 scale-125 shadow-resonance';
  }
  if (isRead) {
    return 'w-3 h-3 rounded-full transition-all bg-accent-500';
  }
  return 'w-3 h-3 rounded-full transition-all bg-calm-bg-tertiary/30 dark:bg-calm-bg-tertiary/50';
}

interface BlockContextProps {
  block: ConversationalBlock;
}

function BlockContext({ block }: BlockContextProps) {
  return (
    <motion.div
      className="bg-sky-100/dark:bg-sky-900/20 dark:bg-sky-100/dark:bg-sky-900/30 rounded-2xl p-4 border border-sky-300 dark:border-sky-400 shadow-calm-lg backdrop-blur-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-xs font-semibold text-sky-500 dark:text-sky-500/80 mb-2">
        {block.title}
      </div>
      <div className="text-xs text-sky-500/70 dark:text-sky-500/60">
        {block.context}
      </div>
    </motion.div>
  );
}

interface BlockPhrasesProps {
  phrases: Phrase[];
  currentPhraseId: string;
}

function BlockPhrases({ phrases, currentPhraseId }: BlockPhrasesProps) {
  return (
    <motion.div
      className="bg-calm-bg-secondary/30 dark:bg-calm-bg-secondary/50 rounded-2xl p-4 border border-calm-warm-100/30 shadow-calm-lg backdrop-blur-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-xs font-semibold text-calm-text-muted dark:text-calm-text-muted/80 mb-2">
        Contexto completo:
      </div>
      <div className="space-y-2">
        {phrases.map((p) => (
          <BlockPhraseItem
            key={p.id}
            text={p.text}
            isCurrent={p.id === currentPhraseId}
          />
        ))}
      </div>
    </motion.div>
  );
}

interface BlockPhraseItemProps {
  text: string;
  isCurrent: boolean;
}

function BlockPhraseItem({ text, isCurrent }: BlockPhraseItemProps) {
  if (!isCurrent) {
    return (
      <div>
        <p className="text-sm text-calm-text-primary dark:text-calm-text-muted opacity-60">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-accent-500/10 dark:bg-accent-500/20 rounded-lg p-2 border border-accent-500/30 dark:border-accent-500/40">
      <p className="text-sm text-calm-text-primary dark:text-calm-text-muted font-medium">
        {text}
      </p>
    </div>
  );
}

interface VariationCardProps {
  currentVariation: Variation;
  currentIndex: number;
  readVariations: Set<string>;
  showTranslation: boolean;
  isSpeaking: boolean;
  onToggleTranslation: () => void;
  onPlayAudio: () => void;
  onPlayBlockAudio: () => void;
  hasBlock: boolean;
}

function VariationCard({
  currentVariation,
  currentIndex,
  readVariations,
  showTranslation,
  isSpeaking,
  onToggleTranslation,
  onPlayAudio,
  onPlayBlockAudio,
  hasBlock,
}: VariationCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentVariation.id}
        className="bg-calm-bg-secondary dark:bg-calm-bg-secondary/50 rounded-2xl p-6 shadow-calm-lg backdrop-blur-md border border-calm-warm-100/20"
        initial={{ opacity: 0, x: 100, rotateY: 15 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        exit={{ opacity: 0, x: -100, rotateY: -15 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <VariationCardHeader
          currentIndex={currentIndex}
          currentVariationId={currentVariation.id}
          readVariations={readVariations}
        />
        <VariationText text={currentVariation.text} />
        <VariationTranslationToggle
          showTranslation={showTranslation}
          translation={currentVariation.translation}
          onToggle={onToggleTranslation}
        />
        <VariationAudioButtons
          isSpeaking={isSpeaking}
          hasBlock={hasBlock}
          onPlayAudio={onPlayAudio}
          onPlayBlockAudio={onPlayBlockAudio}
        />
      </motion.div>
    </AnimatePresence>
  );
}

interface VariationCardHeaderProps {
  currentIndex: number;
  currentVariationId: string;
  readVariations: Set<string>;
}

function VariationCardHeader({ currentIndex, currentVariationId, readVariations }: VariationCardHeaderProps) {
  const labelClass = currentIndex === 0
    ? 'bg-accent-500/20 dark:bg-accent-500/30 text-calm-text-primary dark:text-calm-text-primary'
    : 'bg-sky-500/20 dark:bg-sky-500/30 text-calm-text-secondary dark:text-calm-text-secondary';

  const labelText = currentIndex === 0 ? 'Original' : `Variación ${currentIndex}`;

  return (
    <div className="flex justify-between items-center mb-4">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${labelClass}`}>
        {labelText}
      </span>
      {readVariations.has(currentVariationId) && (
        <span className="text-accent-500">✓ Leída</span>
      )}
    </div>
  );
}

function VariationText({ text }: { text: string }) {
  return (
    <p className="text-xl font-medium text-calm-text-primary dark:text-white mb-3 leading-relaxed">
      {text}
    </p>
  );
}

interface VariationTranslationToggleProps {
  showTranslation: boolean;
  translation: string;
  onToggle: () => void;
}

function VariationTranslationToggle({ showTranslation, translation, onToggle }: VariationTranslationToggleProps) {
  return (
    <>
      <div className="mb-3 flex items-center justify-center">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-calm-bg-secondary/50 dark:bg-calm-bg-tertiary/30 text-calm-text-muted dark:text-calm-text-muted/80 hover:bg-calm-bg-tertiary/20 dark:hover:bg-calm-bg-tertiary/40 border border-calm-warm-100/30"
        >
          <span>{showTranslation ? "👁️" : "👁️‍🗨️"}</span>
          <span>{showTranslation ? "Ocultar traducción" : "Mostrar traducción"}</span>
        </button>
      </div>
      {showTranslation && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-calm-text-muted dark:text-calm-text-muted/70 mb-6"
        >
          {translation}
        </motion.p>
      )}
    </>
  );
}

interface VariationAudioButtonsProps {
  isSpeaking: boolean;
  hasBlock: boolean;
  onPlayAudio: () => void;
  onPlayBlockAudio: () => void;
}

function VariationAudioButtons({ isSpeaking, hasBlock, onPlayAudio, onPlayBlockAudio }: VariationAudioButtonsProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={onPlayAudio}
        disabled={isSpeaking}
        className={getVariationAudioButtonClass(isSpeaking, false)}
      >
        <motion.span
          animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          {isSpeaking ? '🔊' : '🔈'}
        </motion.span>
        <span>{isSpeaking ? 'Reproduciendo...' : 'Escuchar variación'}</span>
      </button>
      {hasBlock && (
        <button
          onClick={onPlayBlockAudio}
          disabled={isSpeaking}
          className={getVariationAudioButtonClass(isSpeaking, true)}
        >
          <span>🔊</span>
          <span>{isSpeaking ? 'Reproduciendo...' : 'Escuchar bloque completo'}</span>
        </button>
      )}
    </div>
  );
}

function getVariationAudioButtonClass(isSpeaking: boolean, isBlockButton: boolean): string {
  const baseClass = isBlockButton
    ? 'w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm'
    : 'w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all';

  if (isSpeaking) {
    return isBlockButton
      ? `${baseClass} bg-sky-100/dark:bg-sky-900/30 dark:bg-sky-100/dark:bg-sky-900/40 text-sky-500 dark:text-sky-500`
      : `${baseClass} bg-accent-500/20 dark:bg-accent-500/30 text-calm-text-primary dark:text-calm-text-primary`;
  }

  return isBlockButton
    ? `${baseClass} bg-sky-100/dark:bg-sky-900/20 dark:bg-sky-100/dark:bg-sky-900/30 text-sky-500 dark:text-sky-500/80 hover:bg-sky-100/dark:bg-sky-900/30 dark:hover:bg-sky-100/dark:bg-sky-900/40 border border-sky-300`
    : `${baseClass} bg-calm-bg-secondary/50 dark:bg-calm-bg-tertiary/30 text-calm-text-primary dark:text-calm-text-muted hover:bg-calm-bg-tertiary/20 dark:hover:bg-calm-bg-tertiary/40 border border-calm-warm-100/30`;
}

interface NavigationButtonsProps {
  currentIndex: number;
  totalVariations: number;
  currentVariationId: string;
  readVariations: Set<string>;
  onPrevious: () => void;
  onMarkAsRead: () => void;
  onNext: () => void;
}

function NavigationButtons({
  currentIndex,
  totalVariations,
  currentVariationId,
  readVariations,
  onPrevious,
  onMarkAsRead,
  onNext,
}: NavigationButtonsProps) {
  const isCurrentRead = readVariations.has(currentVariationId);
  const isLastVariation = currentIndex === totalVariations - 1;
  const showMarkAsRead = !isCurrentRead;
  const showNextButton = isCurrentRead && !isLastVariation;
  const showCompleteState = isCurrentRead && isLastVariation;

  return (
    <div className="flex gap-3">
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className={getPreviousButtonClass(currentIndex)}
      >
        ← Anterior
      </button>

      {showMarkAsRead && (
        <motion.button
          onClick={onMarkAsRead}
          className="flex-1 py-3 rounded-2xl font-bold bg-forge-gradient text-white shadow-calm-lg relative overflow-hidden"
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
      )}

      {showNextButton && (
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-2xl font-bold bg-forge-gradient text-white shadow-calm-lg hover:shadow-xl transition-all"
        >
          Siguiente →
        </button>
      )}

      {showCompleteState && (
        <div className="flex-1 py-3 rounded-2xl bg-accent-500/20 dark:bg-accent-500/30 text-accent-500 dark:text-accent-500 text-center font-medium border border-accent-500/40 shadow-calm-md">
          ✓ Todas leídas
        </div>
      )}
    </div>
  );
}

function getPreviousButtonClass(currentIndex: number): string {
  return currentIndex === 0
    ? 'flex-1 py-3 rounded-2xl font-medium transition-all bg-calm-bg-tertiary/20 dark:bg-calm-bg-secondary/30 text-calm-text-muted/50 cursor-not-allowed'
    : 'flex-1 py-3 rounded-2xl font-medium transition-all bg-calm-bg-secondary dark:bg-calm-bg-secondary/50 text-calm-text-primary dark:text-calm-text-muted hover:bg-calm-bg-tertiary/20 dark:hover:bg-calm-bg-tertiary/30 border border-calm-warm-100/30';
}

interface ProgressTrackerProps {
  readCount: number;
  totalCount: number;
}

function ProgressTracker({ readCount, totalCount }: ProgressTrackerProps) {
  const progress = (readCount / totalCount) * 100;
  const isComplete = readCount === totalCount;

  return (
    <div className="bg-calm-bg-secondary dark:bg-calm-bg-secondary/50 rounded-lg p-4 shadow-calm-lg backdrop-blur-md border border-calm-warm-100/20">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-calm-text-muted dark:text-calm-text-muted/80">
          Variaciones leídas
        </span>
        <span className="font-bold text-calm-text-primary dark:text-calm-text-primary">
          {readCount}/{totalCount}
        </span>
      </div>
      <div className="w-full h-2 bg-calm-bg-tertiary/20 dark:bg-calm-bg-tertiary/40 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-forge-gradient rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${progress}%`,
            boxShadow: isComplete ? "0 0 20px COLORS.sky[60]" : "none",
          }}
        />
      </div>
    </div>
  );
}
