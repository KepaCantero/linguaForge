import { motion } from 'framer-motion';
import { SpeechRecorder } from '@/components/shared/SpeechRecorder';

interface ResponsePhaseProps {
  exercise: any;
  currentStep: any;
  currentStepIndex: number;
  silenceTimer: number | null;
  showHint: boolean;
  showExample: boolean;
  isPlaying: boolean;
  getExpectedResponses: () => string[];
  onRecordingComplete: (recording: any) => void;
  onRecordingStart: () => void;
  onReplay: () => void;
  onSkip: () => void;
}

export function ResponsePhase({
  exercise,
  currentStep,
  currentStepIndex,
  silenceTimer,
  showHint,
  showExample,
  isPlaying,
  getExpectedResponses,
  onRecordingComplete,
  onRecordingStart,
  onReplay,
  onSkip,
}: ResponsePhaseProps) {
  const previousStep = currentStepIndex > 0 ? exercise.conversationFlow[currentStepIndex - 1] : null;

  return (
    <motion.div
      key={`response-${currentStepIndex}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {previousStep?.type === 'system_speak' && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            👤 {previousStep.text}
          </span>
        </div>
      )}

      <ResponseCard
        currentStep={currentStep}
        silenceTimer={silenceTimer}
        showHint={showHint}
        showExample={showExample}
        getExpectedResponses={getExpectedResponses}
        onRecordingComplete={onRecordingComplete}
        onRecordingStart={onRecordingStart}
      />

      <div className="mt-4 flex items-center justify-center gap-3">
        {currentStepIndex > 0 && (
          <button
            onClick={onReplay}
            disabled={isPlaying}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            🔁 Escuchar de nuevo
          </button>
        )}
        <button
          onClick={onSkip}
          className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
        >
          Saltar turno
        </button>
      </div>
    </motion.div>
  );
}

interface ResponseCardProps {
  currentStep: any;
  silenceTimer: number | null;
  showHint: boolean;
  showExample: boolean;
  getExpectedResponses: () => string[];
  onRecordingComplete: (recording: any) => void;
  onRecordingStart: () => void;
}

function ResponseCard({
  currentStep,
  silenceTimer,
  showHint,
  showExample,
  getExpectedResponses,
  onRecordingComplete,
  onRecordingStart,
}: ResponseCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-5 shadow-md border-2 border-emerald-200 dark:border-emerald-800">
      <div className="text-center mb-4">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-sm text-emerald-700 dark:text-emerald-300 font-medium">
          🎤 {currentStep.type === 'closing' ? 'Cierra la conversación' : 'Tu respuesta'}
        </span>
      </div>

      {silenceTimer !== null && silenceTimer > 0 && (
        <p className="text-center text-sm text-amber-600 dark:text-amber-400 mb-4">
          ⏱️ {silenceTimer}s para responder...
        </p>
      )}

      {showHint && !showExample && <HintSection getExpectedResponses={getExpectedResponses} />}
      {showExample && <ExampleSection getExpectedResponses={getExpectedResponses} />}

      <div className="flex justify-center">
        <SpeechRecorder
          onRecordingComplete={onRecordingComplete}
          onRecordingStart={onRecordingStart}
          config={{ maxDuration: 5 }}
          showWaveform
          label="Mantén para hablar"
        />
      </div>
    </div>
  );
}

interface HintSectionProps {
  getExpectedResponses: () => string[];
}

function HintSection({ getExpectedResponses }: HintSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
    >
      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
        💡 ¿Necesitas ayuda? Puedes decir:
      </p>
      <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
        {getExpectedResponses().slice(0, 2).map((resp, i) => (
          <li key={i}>• {resp}</li>
        ))}
      </ul>
    </motion.div>
  );
}

interface ExampleSectionProps {
  getExpectedResponses: () => string[];
}

function ExampleSection({ getExpectedResponses }: ExampleSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
    >
      <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
        🔊 Ejemplo de respuesta:
      </p>
      <p className="text-sm text-amber-700 dark:text-amber-200">
        "{getExpectedResponses()[0]}"
      </p>
      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
        O si no entendiste: "Pardon, pouvez-vous répéter ?"
      </p>
    </motion.div>
  );
}
