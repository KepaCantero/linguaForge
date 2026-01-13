import { motion } from 'framer-motion';

// Constants from main component
const COLUMN_COLORS: Record<string, string> = {
  subject: 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800',
  verb: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  complement: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
  time: 'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800',
};

const COLUMN_HEADER_COLORS: Record<string, string> = {
  subject: 'text-rose-700 dark:text-rose-400',
  verb: 'text-amber-700 dark:text-amber-400',
  complement: 'text-emerald-700 dark:text-emerald-400',
  time: 'text-sky-700 dark:text-sky-400',
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

export interface KeyboardFocus {
  columnId: string | null;
  optionId: string | null;
}

interface ComposingPhaseProps {
  columns: ComposingColumn[];
  selections: Record<string, ColumnSelection>;
  generatedPhrase: string | null;
  generatedTranslation: string | null;
  allRequiredSelected: boolean;
  keyboardFocus: KeyboardFocus;
  hoveredTranslation: string | null;
  columnRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  optionRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  onSelectOption: (columnId: string, option: { id: string; text: string; translation?: string }) => void;
  onClearSelection: (columnId: string) => void;
  onReset: () => void;
  onConfirmComposition: () => void;
  onHoverTranslation: (key: string | null) => void;
}

export function ComposingPhase({
  columns,
  selections,
  generatedPhrase,
  generatedTranslation,
  allRequiredSelected,
  keyboardFocus,
  hoveredTranslation,
  columnRefs,
  optionRefs,
  onSelectOption,
  onClearSelection,
  onReset,
  onConfirmComposition,
  onHoverTranslation,
}: ComposingPhaseProps) {
  return (
    <motion.div
      key="composing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Columnas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {columns.map((column) => {
          const colorClass = COLUMN_COLORS[column.type] || 'bg-gray-50';
          const headerColor = COLUMN_HEADER_COLORS[column.type] || 'text-gray-700';
          const selection = selections[column.id];

          return (
            <ColumnSelector
              key={column.id}
              column={column}
              colorClass={colorClass}
              headerColor={headerColor}
              selection={selection}
              keyboardFocus={keyboardFocus}
              hoveredTranslation={hoveredTranslation}
              columnRef={(el) => { columnRefs.current[column.id] = el; }}
              optionRef={(_el) => { /* optionRefs set by parent */ }}
              onSelectOption={onSelectOption}
              onClearSelection={onClearSelection}
              onHoverTranslation={onHoverTranslation}
            />
          );
        })}
      </div>

      {/* Frase generada */}
      <GeneratedPhraseCard
        generatedPhrase={generatedPhrase}
        generatedTranslation={generatedTranslation}
        selections={selections}
        columns={columns}
        onReset={onReset}
      />

      {/* Botón de confirmar */}
      <button
        onClick={onConfirmComposition}
        disabled={!allRequiredSelected || !generatedPhrase}
        className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 dark:disabled:text-gray-400 rounded-aaa-xl font-medium transition-colors"
      >
        {allRequiredSelected && generatedPhrase
          ? 'Confirmar frase →'
          : 'Completa las columnas requeridas'
        }
      </button>
    </motion.div>
  );
}

interface ColumnSelectorProps {
  column: ComposingColumn;
  colorClass: string;
  headerColor: string;
  selection?: ColumnSelection;
  keyboardFocus: KeyboardFocus;
  hoveredTranslation: string | null;
  columnRef: (el: HTMLDivElement | null) => void;
  optionRef: (el: HTMLButtonElement | null) => void;
  onSelectOption: (columnId: string, option: { id: string; text: string; translation?: string }) => void;
  onClearSelection: (columnId: string) => void;
  onHoverTranslation: (key: string | null) => void;
}

function ColumnSelector({
  column,
  colorClass,
  headerColor,
  selection,
  keyboardFocus,
  hoveredTranslation,
  columnRef,
  optionRef,
  onSelectOption,
  onClearSelection,
  onHoverTranslation,
}: ColumnSelectorProps) {
  return (
    <div className="space-y-2">
      {/* Header de columna */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase ${headerColor}`}>
          {column.title || COLUMN_LABELS[column.type]}
          {['subject', 'verb'].includes(column.type) && <span className="text-red-500 ml-0.5">*</span>}
        </span>
        {selection && (
          <button
            onClick={() => onClearSelection(column.id)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Opciones */}
      <div
        ref={columnRef}
        className={`rounded-aaa-xl border-2 p-2 transition-all ${keyboardFocus.columnId === column.id ? 'ring-2 ring-indigo-400 ring-offset-2' : ''} ${colorClass}`}
      >
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {column.options.map((option) => {
            const isSelected = selection?.optionId === option.id;
            const isFocused = keyboardFocus.columnId === column.id && keyboardFocus.optionId === option.id;
            const showTranslation = hoveredTranslation === `${column.id}-${option.id}`;

            return (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={isSelected}
                isFocused={isFocused}
                showTranslation={showTranslation}
                onClick={() => onSelectOption(column.id, {
                  id: option.id,
                  text: option.text,
                  ...(option.translation !== undefined && { translation: option.translation }),
                })}
                onHover={() => onHoverTranslation(`${column.id}-${option.id}`)}
                onLeave={() => onHoverTranslation(null)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface OptionButtonProps {
  option: { id: string; text: string; translation?: string };
  isSelected: boolean;
  isFocused: boolean;
  showTranslation: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function OptionButton({ option, isSelected, isFocused, showTranslation, onClick, onHover, onLeave }: OptionButtonProps) {
  return (
    <motion.button
      ref={(el) => { /* optionRefs set by parent */ }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`
        w-full px-3 py-2 rounded-lg text-sm text-left transition-all relative
        ${isSelected
          ? 'bg-white dark:bg-gray-900 shadow-md ring-2 ring-indigo-500 font-medium'
          : isFocused
          ? 'bg-white dark:bg-gray-900 shadow-sm ring-2 ring-indigo-300'
          : 'bg-white/60 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900'
        }
      `}
      animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
      transition={{ duration: 0.15 }}
    >
      <span className="block text-gray-900 dark:text-white">
        {option.text}
      </span>

      {/* Traducción con hover-to-reveal */}
      {option.translation && (
        <motion.span
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: showTranslation ? 1 : 0.5,
            height: showTranslation ? 'auto' : 0,
          }}
          transition={{ duration: 0.2 }}
          className="block text-xs text-gray-500 dark:text-gray-400 overflow-hidden"
        >
          {option.translation}
        </motion.span>
      )}

      {/* Indicador de foco por teclado */}
      {isFocused && !isSelected && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 text-xs"
        >
          ⌨
        </motion.span>
      )}
    </motion.button>
  );
}

interface GeneratedPhraseCardProps {
  generatedPhrase: string | null;
  generatedTranslation: string | null;
  selections: Record<string, ColumnSelection>;
  columns: ComposingColumn[];
  onReset: () => void;
}

function GeneratedPhraseCard({
  generatedPhrase,
  generatedTranslation,
  selections,
  onReset,
}: GeneratedPhraseCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
          Frase resultante:
        </span>
        {Object.keys(selections).length > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {generatedPhrase ? (
        <div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            &quot;{generatedPhrase}&quot;
          </p>
          {generatedTranslation && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {generatedTranslation}
            </p>
          )}

          {/* Indicador de conjugación automática */}
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
            <span>✓</span>
            <span>Conjugación automática aplicada</span>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 dark:text-gray-500 italic">
          Selecciona opciones de cada columna para crear tu frase...
        </p>
      )}
    </div>
  );
}
