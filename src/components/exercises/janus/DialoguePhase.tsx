import { motion } from 'framer-motion';

export interface PracticeDialogue {
  prompt: string;
  response?: string;
}

interface DialoguePhaseProps {
  currentDialogue: PracticeDialogue;
  currentDialogueIndex: number;
  totalDialogues: number;
  generatedPhrase: string | null;
  generatedTranslation: string | null;
  onCompleteDialogue: () => void;
}

export function DialoguePhase({
  currentDialogue,
  currentDialogueIndex,
  totalDialogues,
  generatedPhrase,
  generatedTranslation,
  onCompleteDialogue,
}: DialoguePhaseProps) {
  const isLastDialogue = currentDialogueIndex >= totalDialogues - 1;

  return (
    <motion.div
      key={`dialogue-${currentDialogueIndex}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-sm text-emerald-700 dark:text-emerald-300">
          💬 Mini-diálogo {currentDialogueIndex + 1}/{totalDialogues}
        </span>
      </div>

      {/* Diálogo simple: prompt y respuesta */}
      <div className="space-y-3">
        {/* Prompt del sistema */}
        <DialogueBubble
          speaker="system"
          text={currentDialogue.prompt}
          delay={0}
        />

        {/* Respuesta del usuario */}
        <DialogueBubble
          speaker="user"
          text={generatedPhrase}
          subtext={generatedTranslation}
          delay={0.2}
          isUserPhrase
        />

        {/* Respuesta esperada */}
        {currentDialogue.response && (
          <DialogueBubble
            speaker="system"
            text={currentDialogue.response}
            delay={0.4}
          />
        )}
      </div>

      <button
        onClick={onCompleteDialogue}
        className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-aaa-xl font-medium transition-colors"
      >
        {isLastDialogue ? 'Completar →' : 'Siguiente diálogo →'}
      </button>
    </motion.div>
  );
}

interface DialogueBubbleProps {
  speaker: 'system' | 'user';
  text: string | null;
  subtext?: string | null;
  delay: number;
  isUserPhrase?: boolean;
}

function DialogueBubble({ speaker, text, subtext, delay, isUserPhrase }: DialogueBubbleProps) {
  const isSystem = speaker === 'system';

  return (
    <motion.div
      initial={{ opacity: 0, x: isSystem ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`flex gap-3 ${isSystem ? '' : 'flex-row-reverse'}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${isSystem ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-emerald-100 dark:bg-emerald-900/50'}`}>
        {isSystem ? '🎭' : '👤'}
      </div>
      <div className={`flex-1 p-3 rounded-aaa-xl max-w-[80%] ${isUserPhrase ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
        <p className="text-gray-900 dark:text-white">
          &quot;{text || ''}&quot;
        </p>
        {subtext && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
}
