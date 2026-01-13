'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ClozeExercise } from '@/components/exercises/ClozeExercise';
import { VariationsExercise } from '@/components/exercises/VariationsExercise';
import { ConversationalEchoExercise } from '@/components/exercises/ConversationalEchoExercise';
import { DialogueIntonationExercise } from '@/components/exercises/DialogueIntonationExercise';
import { JanusComposerExercise } from '@/components/exercises/JanusComposerExercise';
import { FocusMode } from '@/components/focus/FocusMode';
import type {
  ConversationalEcho,
  DialogueIntonation,
  JanusComposer,
  Phrase,
} from '@/types';
import type { ExerciseType, LessonMode } from '@/hooks/useExerciseFlow';

interface ExerciseRendererProps {
  selectedExerciseType: ExerciseType;
  exerciseIndices: Record<string, number>;
  exerciseData: {
    cloze: Phrase[];
    variations: Phrase[];
    conversationalEcho: ConversationalEcho[];
    dialogueIntonation: DialogueIntonation[];
    janusComposer: JanusComposer[];
  };
  mode: LessonMode;
  focusModeActive: boolean;
  setFocusModeActive: (active: boolean) => void;
  onComplete: () => void;
  onSkip?: () => void;
}

export function ExerciseRenderer({
  selectedExerciseType,
  exerciseIndices,
  exerciseData,
  mode,
  focusModeActive,
  setFocusModeActive,
  onComplete,
  onSkip
}: ExerciseRendererProps) {
  const currentIndex = exerciseIndices[selectedExerciseType!];
  const exercises = exerciseData[selectedExerciseType!];
  const currentExercise = exercises?.[currentIndex];

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-calm-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-calm-text-secondary mb-4">
            No hay ejercicios disponibles para este tipo.
          </p>
          <button
            onClick={onSkip}
            className="text-accent-500 hover:text-accent-600"
          >
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  const renderExercise = () => {
    switch (selectedExerciseType) {
      case 'cloze':
        return (
          <ClozeExercise
            phrase={currentExercise as Phrase}
            onComplete={(_correct) => {
              onComplete();
            }}
          />
        );
      case 'variations':
        return (
          <VariationsExercise
            phrase={currentExercise as Phrase}
            onComplete={() => onComplete()}
          />
        );
      case 'conversationalEcho':
        return (
          <ConversationalEchoExercise
            exercise={currentExercise as ConversationalEcho}
            onComplete={() => onComplete()}
            {...(mode === 'academia' && { onSkip })}
            showHints={mode === 'academia'}
          />
        );
      case 'dialogueIntonation':
        return (
          <DialogueIntonationExercise
            exercise={currentExercise as DialogueIntonation}
            onComplete={() => onComplete()}
            {...(mode === 'academia' && { onSkip })}
          />
        );
      case 'janusComposer':
        return (
          <JanusComposerExercise
            exercise={currentExercise as JanusComposer}
            onComplete={() => onComplete()}
            {...(mode === 'academia' && { onSkip })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FocusMode
      isActive={focusModeActive}
      onToggle={setFocusModeActive}
      config={{
        showTimer: true,
        allowBreak: mode === 'academia',
        autoHideCursor: true,
        dimBackground: true,
      }}
    >
      <div className="min-h-screen pb-20">
        <main className="max-w-lg mx-auto px-4 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedExerciseType}-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderExercise()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </FocusMode>
  );
}