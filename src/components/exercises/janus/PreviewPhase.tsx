import { motion } from 'framer-motion';

const COLUMN_COLORS: Record<string, string> = {
  subject: 'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800',
  verb: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  complement: 'bg-accent-50 border-accent-200 dark:bg-accent-900/20 dark:border-emerald-800',
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
        <h3 className="text-lg font-semibold text-calm-text-primary dark:text-white">
          ¡Frase creada!
        </h3>
      </div>

      {/* Frase destacada */}
      {generatedPhrase && (
        <div className="bg-gradient-to-r from-accent-500 to-sky-600 rounded-2xl p-6 text-white text-center">
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
          className="flex-1 px-4 py-3 bg-calm-bg-secondary dark:bg-calm-bg-elevated hover:bg-calm-bg-tertiary dark:hover:bg-calm-bg-tertiary text-calm-text-secondary dark:text-calm-text-tertiary rounded-2xl font-medium transition-colors"
        >
          ← Nueva combinación
        </button>
        <button
          onClick={onStartPractice}
          className="flex-1 px-4 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl font-medium transition-colors"
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
    <div className="bg-white dark:bg-calm-bg-elevated rounded-2xl p-4">
      <p className="text-xs text-calm-text-muted dark:text-calm-text-muted uppercase font-medium mb-3">
        Componentes:
      </p>
      <div className="flex flex-wrap gap-2">
        {columns.map((col) => {
          const sel = selections[col.id];
          if (!sel) return null;

          const bgColor = COLUMN_COLORS[col.type]?.replace('border-', 'bg-').replace('-200', '-100') || 'bg-calm-bg-secondary';
          return (
            <div
              key={col.id}
              className={`px-3 py-1.5 rounded-lg text-sm ${bgColor}`}
            >
              <span className="font-medium text-calm-text-primary dark:text-white">
                {sel.value}
              </span>
              <span className="text-xs text-calm-text-muted dark:text-calm-text-muted ml-1">
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
    <div className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-4 border border-sky-200 dark:border-sky-800">
      <p className="text-sm font-medium text-sky-800 dark:text-sky-300 mb-1">
        📚 Regla aplicada:
      </p>
      <p className="text-sm text-sky-700 dark:text-sky-200">
        {rule.subject} + {rule.verb} → {rule.conjugated}
      </p>
    </div>
  );
}
