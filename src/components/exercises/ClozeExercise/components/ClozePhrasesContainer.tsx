'use client';

import { motion } from 'framer-motion';
import { Phrase, ConversationalBlock, ClozeOption } from '@/types';
import { ClozePhrase } from './ClozePhrase';
import { ClozeTranslation } from './ClozeTranslation';
import { ClozeAudioButton } from './ClozeAudioButton';

interface ClozePhrasesContainerProps {
  phrase: Phrase;
  block: ConversationalBlock | undefined;
  phrasesToShow: Phrase[];
  textWithGap: string;
  showResult: boolean;
  isCorrect: boolean;
  selectedOption: ClozeOption | null;
  correctOption: ClozeOption | undefined;
  showTranslation: boolean;
  fullBlockText: string;
  isSpeaking: boolean;
  onToggleTranslation: () => void;
}

export function ClozePhrasesContainer({
  phrase,
  block,
  phrasesToShow,
  textWithGap,
  showResult,
  isCorrect,
  selectedOption,
  correctOption,
  showTranslation,
  fullBlockText,
  isSpeaking,
  onToggleTranslation,
}: ClozePhrasesContainerProps) {
  const playAudio = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(fullBlockText);
      utterance.lang = 'fr-FR';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      className="bg-calm-bg-secondary dark:bg-calm-bg-secondary/50 rounded-2xl p-6 shadow-calm-lg backdrop-blur-md border border-calm-warm-100/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-y-3">
        {phrasesToShow.map((p) => (
          <ClozePhrase
            key={p.id}
            phrase={p}
            textWithGap={p.id === phrase.id ? textWithGap : p.text}
            isCurrentPhrase={p.id === phrase.id}
            showResult={showResult}
            isCorrect={isCorrect}
            selectedOption={selectedOption}
            correctOption={correctOption}
            showTranslation={showTranslation}
          />
        ))}
      </div>

      <ClozeTranslation
        phrase={phrase}
        block={block}
        showTranslation={showTranslation}
        onToggle={onToggleTranslation}
      />

      <ClozeAudioButton
        isSpeaking={isSpeaking}
        hasBlock={!!block}
        onPlay={playAudio}
      />
    </motion.div>
  );
}
