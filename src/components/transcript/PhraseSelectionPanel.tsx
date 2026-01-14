'use client';

import { motion } from 'framer-motion';
import { usePhraseSelectionPanel } from './hooks/usePhraseSelectionPanel';
import { SelectedPhrase } from './TranscriptSelector';
import { ContentSource } from '@/types/srs';
import { useWordDictionaryStore } from '@/store/useWordDictionaryStore';
import type { ExtractedWord } from '@/services/wordExtractor';

// Iconos simples usando emojis y símbolos
const IconX = () => <span>✕</span>;
const IconPlus = () => <span>+</span>;

interface PhraseSelectionPanelProps {
  selectedPhrases: SelectedPhrase[];
  source: ContentSource;
  onClose?: () => void;
  onPhrasesAdded?: (count: number) => void;
}

// ============================================================
// CONSTANTS & HELPERS
// ============================================================

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    verb: 'Verbos',
    noun: 'Sustantivos',
    adverb: 'Adverbios',
    adjective: 'Adjetivos',
    other: 'Otras',
  };
  return labels[type] || type;
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    verb: 'bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700',
    noun: 'bg-accent-100 dark:bg-accent-900/30 border-accent-300 dark:border-accent-700',
    adverb: 'bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700',
    adjective: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-800',
    other: 'bg-calm-bg-secondary dark:bg-calm-bg-tertiary/50 border-calm-warm-200 dark:border-calm-warm-200',
  };
  return colors[type] || colors.other;
}

function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

function formatCountMessage(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

interface WordItemProps {
  word: ExtractedWord;
  selectedPhrases: SelectedPhrase[];
  translations: Record<string, string>;
  isTranslating: boolean;
  isWordStudied: (word: string) => boolean;
}

function WordItem({ word, selectedPhrases, translations, isTranslating, isWordStudied }: WordItemProps) {
  const isStudied = isWordStudied(word.normalized);
  const originalPhrase = selectedPhrases.find(p =>
    p.text.toLowerCase().includes(word.word.toLowerCase())
  );

  return (
    <motion.div
      key={word.normalized}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-2 rounded border ${
        isStudied
          ? 'bg-calm-bg-primary dark:bg-calm-bg-elevated/50 border-calm-warm-100 dark:border-calm-warm-200 opacity-60'
          : 'bg-white dark:bg-calm-bg-elevated border-calm-warm-200 dark:border-calm-warm-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1">
          <p className={`text-sm font-medium ${isStudied ? 'text-calm-text-muted dark:text-calm-text-muted' : 'text-calm-text-primary dark:text-white'}`}>
            {word.word}
          </p>
          {originalPhrase && (
            <p className="text-xs text-calm-text-muted dark:text-calm-text-muted mt-1 italic">
              &ldquo;{originalPhrase.text.substring(0, 60)}...&rdquo;
            </p>
          )}
        </div>
        {isStudied && (
          <span className="text-xs text-accent-600 dark:text-accent-400">✓ Estudiada</span>
        )}
      </div>

      {!isStudied && (
        <div className="mt-1">
          {isTranslating && !translations[word.normalized] ? (
            <div className="px-2 py-1.5 text-xs text-calm-text-muted dark:text-calm-text-muted bg-calm-bg-primary dark:bg-calm-bg-tertiary/50 rounded border border-calm-warm-100 dark:border-calm-warm-200">
              Traduciendo...
            </div>
          ) : (
            <div className="px-2 py-1.5 text-sm text-calm-text-secondary dark:text-calm-text-tertiary bg-calm-bg-primary dark:bg-calm-bg-tertiary/50 rounded border border-calm-warm-100 dark:border-calm-warm-200">
              {translations[word.normalized] || word.word}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

interface WordTypeGroupProps {
  type: string;
  words: ExtractedWord[];
  selectedPhrases: SelectedPhrase[];
  translations: Record<string, string>;
  isTranslating: boolean;
  isWordStudied: (word: string) => boolean;
}

function WordTypeGroup({ type, words, selectedPhrases, translations, isTranslating, isWordStudied }: WordTypeGroupProps) {
  if (words.length === 0) return null;

  const typeLabel = getTypeLabel(type);
  const typeColor = getTypeColor(type);

  return (
    <div className={`p-3 rounded-lg border ${typeColor}`}>
      <h4 className="text-sm font-semibold text-calm-text-primary dark:text-white mb-2">
        {typeLabel} ({words.length})
      </h4>
      <div className="space-y-2">
        {words.map((word) => (
          <WordItem
            key={word.normalized}
            word={word}
            selectedPhrases={selectedPhrases}
            translations={translations}
            isTranslating={isTranslating}
            isWordStudied={isWordStudied}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function PhraseSelectionPanel({
  selectedPhrases,
  source,
  onClose,
  onPhrasesAdded,
}: PhraseSelectionPanelProps) {
  const [data, actions] = usePhraseSelectionPanel({
    selectedPhrases,
    source,
    onPhrasesAdded,
  });

  const { isWordStudied } = useWordDictionaryStore();

  const {
    translations,
    isCreating,
    isTranslating,
    showWordExtraction,
    newWords,
    wordsByType,
    canCreateCards,
    totalStudiedWords,
    newWordsCount,
    extractedWordsCount,
  } = data;

  const { setShowWordExtraction, handleCreateCards } = actions;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="fixed right-4 top-20 bottom-24 w-[400px] max-w-[calc(100vw-2rem)] bg-white dark:bg-calm-bg-elevated rounded-xl p-4 border border-calm-warm-100 dark:border-calm-warm-200 shadow-xl z-40 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-calm-text-primary dark:text-white">
            Palabras clave extraídas
          </h3>
          <p className="text-xs text-calm-text-muted dark:text-calm-text-muted mt-1">
            {newWordsCount} nuevas • {totalStudiedWords} ya estudiadas • {extractedWordsCount} total
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-calm-bg-secondary dark:hover:bg-calm-bg-tertiary text-calm-text-muted dark:text-calm-text-muted"
          >
            <IconX />
          </button>
        )}
      </div>

      {/* Toggle para mostrar/ocultar extracción de palabras */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setShowWordExtraction(!showWordExtraction)}
          className="text-sm text-accent-600 dark:text-accent-400 hover:underline"
        >
          {showWordExtraction ? 'Ocultar' : 'Mostrar'} extracción de palabras
        </button>
      </div>

      {/* Lista de palabras extraídas */}
      {showWordExtraction && (
        <div className="space-y-4 flex-1 overflow-y-auto mb-4">
          {/* Palabras nuevas por tipo */}
          {Object.entries(wordsByType).map(([type, words]) => (
            <WordTypeGroup
              key={type}
              type={type}
              words={words}
              selectedPhrases={selectedPhrases}
              translations={translations}
              isTranslating={isTranslating}
              isWordStudied={isWordStudied}
            />
          ))}

          {newWords.length === 0 && (
            <div className="p-4 bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-lg text-center">
              <p className="text-sm text-accent-800 dark:text-accent-200">
                ✓ Todas las palabras clave ya están estudiadas
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer con acciones */}
      <div className="flex items-center justify-between pt-4 border-t border-calm-warm-100 dark:border-calm-warm-200">
        <div className="text-sm text-calm-text-secondary dark:text-calm-text-muted">
          {isTranslating ? (
            <span>Traduciendo {pluralize('palabra', newWords.length)}...</span>
          ) : (
            <span>{formatCountMessage(newWords.length, 'palabra nueva lista', 'palabras nuevas listas')}</span>
          )}
        </div>
        <button
          onClick={handleCreateCards}
          disabled={!canCreateCards || isCreating}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
            ${canCreateCards && !isCreating
              ? 'bg-accent-600 hover:bg-accent-700 text-white'
              : 'bg-calm-warm-100 dark:bg-calm-bg-tertiary text-calm-text-muted dark:text-calm-text-muted cursor-not-allowed'
            }
          `}
        >
          <IconPlus />
          {isCreating ? 'Creando...' : `Crear ${pluralize('card', newWords.length)} (Cloze/Detection)`}
        </button>
      </div>
    </motion.div>
  );
}
