import { motion } from 'framer-motion';

const COLUMN_COLORS: Record<string, string> = {
  subject: 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800',
  verb: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  complement: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
  time: 'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800',
};

const COLUMN_LABELS: Record<string, string> = {
  subject: 'Sujeto',
  verb: 'Verbo',
  complement: 'Complemento',
  time: 'Tiempo',
};

export interface ComposingColumn {
  id: string;
  type: string;
  title?: string;
  options: Array<{
    id: string;
    text: string;
    translation?: string;
  }>;
}

export interface ColumnSelection {
  optionId: string;
  value: string;
}

export interface ConjugationRule {
  subject: string;
  verb: string;
  conjugated: string;
}

interface PreviewPhaseProps {
  generatedPhrase: string | null;
  generatedTranslation: string | null;
  selections: Record<string, ColumnSelection>;
  columns: ComposingColumn[];
  conjugationRules?: ConjugationRule[];
  onNewCombination: () => void;
  onStartPractice: () => void;
}

export function PreviewPhase({
  generatedPhrase,
  generatedTranslation,
  selections,
  columns,
  conjugationRules,
  onNewCombination,
  onStartPractice,
}: PreviewPhaseProps) {
  return (
    <motion.div
      key="preview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="text-4xl mb-3">✨</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ¡Frase creada!
        </h3>
      </div>

      {/* Frase destacada */}
      {generatedPhrase && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-aaa-xl p-6 text-white text-center">
          <p className="text-xl font-medium">&quot;{generatedPhrase}&quot;</p>
          {generatedTranslation && (
            <p className="text-white/80 mt-2">{generatedTranslation}</p>
          )}
        </div>
      )}

      {/* Desglose */}
      <PhraseBreakdown selections={selections} columns={columns} />

      {/* Regla de conjugación */}
      {conjugationRules && conjugationRules.length > 0 && (
        <ConjugationRule rule={conjugationRules[0]} />
      )}

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={onNewCombination}
          className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-aaa-xl font-medium transition-colors"
        >
          ← Nueva combinación
        </button>
        <button
          onClick={onStartPractice}
          className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-aaa-xl font-medium transition-colors"
        >
          Practicar 🎤
        </button>
      </div>
    </motion.div>
  );
}

interface PhraseBreakdownProps {
  selections: Record<string, ColumnSelection>;
  columns: ComposingColumn[];
}

function PhraseBreakdown({ selections, columns }: PhraseBreakdownProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-3">
        Componentes:
      </p>
      <div className="flex flex-wrap gap-2">
        {columns.map((col) => {
          const sel = selections[col.id];
          if (!sel) return null;

          const bgColor = COLUMN_COLORS[col.type]?.replace('border-', 'bg-').replace('-200', '-100') || 'bg-gray-100';
          return (
            <div
              key={col.id}
              className={`px-3 py-1.5 rounded-lg text-sm ${bgColor}`}
            >
              <span className="font-medium text-gray-900 dark:text-white">
                {sel.value}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                ({COLUMN_LABELS[col.type]})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ConjugationRuleProps {
  rule: {
    subject: string;
    verb: string;
    conjugated: string;
  };
}

function ConjugationRule({ rule }: ConjugationRuleProps) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-aaa-xl p-4 border border-blue-200 dark:border-blue-800">
      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
        📚 Regla aplicada:
      </p>
      <p className="text-sm text-blue-700 dark:text-blue-200">
        {rule.subject} + {rule.verb} → {rule.conjugated}
      </p>
    </div>
  );
}
