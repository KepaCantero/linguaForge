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
        isSpeaking={isSpeaking}
        onToggleTranslation={() => setShowTranslation(!showTranslation)}
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
      <span className="text-sm text-lf-muted dark:text-lf-muted/70">
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
    return 'w-3 h-3 rounded-full transition-all bg-lf-primary scale-125 shadow-resonance';
  }
  if (isRead) {
    return 'w-3 h-3 rounded-full transition-all bg-lf-success';
  }
  return 'w-3 h-3 rounded-full transition-all bg-lf-muted/30 dark:bg-lf-muted/50';
}

interface BlockContextProps {
  block: ConversationalBlock;
}

function BlockContext({ block }: BlockContextProps) {
  return (
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
  );
}

interface BlockPhrasesProps {
  phrases: Phrase[];
  currentPhraseId: string;
}

function BlockPhrases({ phrases, currentPhraseId }: BlockPhrasesProps) {
  return (
    <motion.div
      className="bg-lf-soft/30 dark:bg-lf-soft/50 rounded-aaa-xl p-4 border border-lf-muted/30 shadow-glass-xl backdrop-blur-aaa"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-xs font-semibold text-lf-muted dark:text-lf-muted/80 mb-2">
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
        <p className="text-sm text-lf-dark dark:text-lf-muted opacity-60">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-lf-primary/10 dark:bg-lf-primary/20 rounded-lg p-2 border border-lf-primary/30 dark:border-lf-primary/40">
      <p className="text-sm text-lf-dark dark:text-lf-muted font-medium">
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
        className="bg-glass-surface dark:bg-lf-soft/50 rounded-aaa-xl p-6 shadow-glass-xl backdrop-blur-aaa border border-lf-muted/20"
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
    ? 'bg-lf-primary/20 dark:bg-lf-primary/30 text-lf-primary dark:text-lf-primary'
    : 'bg-lf-secondary/20 dark:bg-lf-secondary/30 text-lf-secondary dark:text-lf-secondary';

  const labelText = currentIndex === 0 ? 'Original' : `Variación ${currentIndex}`;

  return (
    <div className="flex justify-between items-center mb-4">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${labelClass}`}>
        {labelText}
      </span>
      {readVariations.has(currentVariationId) && (
        <span className="text-lf-success">✓ Leída</span>
      )}
    </div>
  );
}

function VariationText({ text }: { text: string }) {
  return (
    <p className="text-xl font-medium text-lf-dark dark:text-white mb-3 leading-relaxed">
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-lf-soft/50 dark:bg-lf-muted/30 text-lf-muted dark:text-lf-muted/80 hover:bg-lf-muted/20 dark:hover:bg-lf-muted/40 border border-lf-muted/30"
        >
          <span>{showTranslation ? "👁️" : "👁️‍🗨️"}</span>
          <span>{showTranslation ? "Ocultar traducción" : "Mostrar traducción"}</span>
        </button>
      </div>
      {showTranslation && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lf-muted dark:text-lf-muted/70 mb-6"
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
      ? `${baseClass} bg-lf-info/20 dark:bg-lf-info/30 text-lf-info dark:text-lf-info`
      : `${baseClass} bg-lf-primary/20 dark:bg-lf-primary/30 text-lf-primary dark:text-lf-primary`;
  }

  return isBlockButton
    ? `${baseClass} bg-lf-info/10 dark:bg-lf-info/20 text-lf-info dark:text-lf-info/80 hover:bg-lf-info/20 dark:hover:bg-lf-info/30 border border-lf-info/30`
    : `${baseClass} bg-lf-soft/50 dark:bg-lf-muted/30 text-lf-dark dark:text-lf-muted hover:bg-lf-muted/20 dark:hover:bg-lf-muted/40 border border-lf-muted/30`;
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
      )}

      {showNextButton && (
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-aaa-xl font-bold bg-forge-gradient text-white shadow-glass-xl hover:shadow-xl transition-all"
        >
          Siguiente →
        </button>
      )}

      {showCompleteState && (
        <div className="flex-1 py-3 rounded-aaa-xl bg-lf-success/20 dark:bg-lf-success/30 text-lf-success dark:text-lf-success text-center font-medium border border-lf-success/40 shadow-glow-success">
          ✓ Todas leídas
        </div>
      )}
    </div>
  );
}

function getPreviousButtonClass(currentIndex: number): string {
  return currentIndex === 0
    ? 'flex-1 py-3 rounded-aaa-xl font-medium transition-all bg-lf-muted/20 dark:bg-lf-soft/30 text-lf-muted/50 cursor-not-allowed'
    : 'flex-1 py-3 rounded-aaa-xl font-medium transition-all bg-glass-surface dark:bg-lf-soft/50 text-lf-dark dark:text-lf-muted hover:bg-lf-muted/20 dark:hover:bg-lf-muted/30 border border-lf-muted/30';
}

interface ProgressTrackerProps {
  readCount: number;
  totalCount: number;
}

function ProgressTracker({ readCount, totalCount }: ProgressTrackerProps) {
  const progress = (readCount / totalCount) * 100;
  const isComplete = readCount === totalCount;

  return (
    <div className="bg-glass-surface dark:bg-lf-soft/50 rounded-lg p-4 shadow-glass-xl backdrop-blur-aaa border border-lf-muted/20">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-lf-muted dark:text-lf-muted/80">
          Variaciones leídas
        </span>
        <span className="font-bold text-lf-primary dark:text-lf-primary">
          {readCount}/{totalCount}
        </span>
      </div>
      <div className="w-full h-2 bg-lf-muted/20 dark:bg-lf-muted/40 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-forge-gradient rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${progress}%`,
            boxShadow: isComplete ? "0 0 20px rgba(99, 102, 241, 0.6)" : "none",
          }}
        />
      </div>
    </div>
  );
}
