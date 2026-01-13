import { motion } from 'framer-motion';
import type { SpeechRecordingResult } from '@/types';
import { SpeechRecorder } from '@/components/shared/SpeechRecorder';
import type { ConversationalEcho } from '@/schemas/content';

interface RespondingPhaseProps {
  exercise: ConversationalEcho;
  silenceTimer: number | null;
  showHint: boolean;
  showHints: boolean;
  config: {
    maxRecordingTime: number;
    silenceTimeout: number;
    showHint: boolean;
  };
  onRecordingStart: () => void;
  onRecordingComplete: (recording: SpeechRecordingResult) => void;
  onToggleHint: () => void;
}

export function RespondingPhase({
  exercise,
  silenceTimer,
  showHint,
  showHints,
  config,
  onRecordingStart,
  onRecordingComplete,
  onToggleHint,
}: RespondingPhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center">
        <p className="text-lg font-medium text-calm-text-primary dark:text-white mb-2">
          💬 ¿Cómo responderías?
        </p>

        {silenceTimer !== null && silenceTimer > 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            ⏱️ {silenceTimer}s para responder...
          </p>
        )}
      </div>

      {showHints && config.showHint && <HintsSection exercise={exercise} showHint={showHint} onToggle={onToggleHint} />}

      <div className="flex justify-center pt-4">
        <SpeechRecorder
          onRecordingComplete={onRecordingComplete}
          onRecordingStart={onRecordingStart}
          config={{ maxDuration: config.maxRecordingTime }}
          showWaveform
        />
      </div>
    </motion.div>
  );
}

interface HintsSectionProps {
  exercise: ConversationalEcho;
  showHint: boolean;
  onToggle: () => void;
}

function HintsSection({ exercise, showHint, onToggle }: HintsSectionProps) {
  return (
    <div className="space-y-2">
      {!showHint ? (
        <button
          onClick={onToggle}
          className="w-full text-sm text-accent-600 dark:text-accent-400 hover:underline"
        >
          💡 Mostrar pistas
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-calm-bg-primary dark:bg-calm-bg-elevated/50 rounded-lg p-4"
        >
          <p className="text-sm text-calm-text-muted dark:text-calm-text-muted mb-2">
            Respuestas posibles:
          </p>
          <ul className="space-y-1">
            {exercise.expectedResponses.map((resp, i) => (
              <li
                key={`expected-response-${i}-${resp.text.slice(0, 10)}`}
                className={`text-sm ${
                  resp.isOptimal
                    ? 'text-accent-600 dark:text-accent-400 font-medium'
                    : 'text-calm-text-secondary dark:text-calm-text-tertiary'
                }`}
              >
                • {resp.text}
                {resp.isOptimal && <span className="ml-1">⭐</span>}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
