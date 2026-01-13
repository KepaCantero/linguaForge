import { motion } from 'framer-motion';
import type { SpeechRecordingResult } from '@/types';
import { SpeechRecorder } from '@/components/shared/SpeechRecorder';

interface PracticePhaseProps {
  generatedPhrase: string | null;
  generatedTranslation: string | null;
  onRecordingComplete: (recording: SpeechRecordingResult) => void;
}

export function PracticePhase({
  generatedPhrase,
  generatedTranslation,
  onRecordingComplete,
}: PracticePhaseProps) {
  return (
    <motion.div
      key="practice"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-calm-text-primary dark:text-white">
          🎤 Repite la frase
        </h3>
      </div>

      <div className="bg-gradient-to-r from-accent-500 to-sky-600 rounded-2xl p-6 text-white text-center">
        <p className="text-xl font-medium">&quot;{generatedPhrase || ''}&quot;</p>
        {generatedTranslation && (
          <p className="text-white/80 mt-2">{generatedTranslation}</p>
        )}
      </div>

      <div className="flex justify-center">
        <SpeechRecorder
          onRecordingComplete={onRecordingComplete}
          config={{ maxDuration: 5 }}
          showWaveform
          label="Mantén para grabar"
        />
      </div>
    </motion.div>
  );
}
