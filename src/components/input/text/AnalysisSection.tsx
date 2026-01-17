'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TextPreview } from '@/components/input/text/TextPreview';
import type { TextImportData } from '@/hooks/input/useTextImport';

interface AnalysisSectionProps {
  importData: TextImportData | null;
  importResult: { nodeId: string; message: string } | null;
  isAnalyzing: boolean;
  error: string | null;
  canImport: boolean;
  isImporting: boolean;
  onAnalyze: () => void;
  onImportAll: () => void;
}

export function AnalysisSection({
  importData,
  importResult,
  isAnalyzing,
  error,
  canImport,
  isImporting,
  onAnalyze,
  onImportAll,
}: AnalysisSectionProps) {
  return (
    <div className="space-y-6">
      <TextPreview
        data={importData}
        isLoading={isAnalyzing}
        error={error}
        onAnalyze={onAnalyze}
        showAnalyzeButton
      />

      <AnimatePresence>
        {importResult && <ImportResultMessage result={importResult} />}
      </AnimatePresence>

      <AnimatePresence>
        {canImport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <button
              onClick={onImportAll}
              disabled={isImporting}
              className="w-full px-6 py-4 bg-accent-600 hover:bg-accent-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors"
            >
              {isImporting ? '⏳ Importando...' : '🚀 Importar todo'}
            </button>

            <p className="text-center text-sm text-calm-text-muted">
              O selecciona bloques específicos below
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ImportResultMessageProps {
  result: { nodeId: string; message: string };
}

function ImportResultMessage({ result }: ImportResultMessageProps) {
  const isSuccess = result.nodeId !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        p-4 rounded-xl border
        ${isSuccess
          ? 'bg-emerald-900/20 border-emerald-500/30'
          : 'bg-red-900/20 border-red-500/30'
        }
      `}
    >
      <p className={`font-medium ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
        {isSuccess ? '✅' : '❌'} {result.message}
      </p>
    </motion.div>
  );
}
