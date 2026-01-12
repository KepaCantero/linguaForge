import { motion } from 'framer-motion';
import { calculatePhraseCount, calculateWordCount, isValidContent } from '@/services/importFlowService';
import type { ImportSourceOption } from '@/components/import/ImportSourceSelector';

interface GenericContentStepProps {
  sources: ImportSourceOption[];
  selectedSource: 'podcast' | 'article' | null;
  content: string;
  setContent: (value: string) => void;
  onBack: () => void;
  onAnalyze: () => void;
}

export function GenericContentStep({
  sources,
  selectedSource,
  content,
  setContent,
  onBack,
  onAnalyze,
}: GenericContentStepProps) {
  return (
    <motion.div
      key="content"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <motion.button
          onClick={onBack}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-lf-muted hover:text-white transition-all"
        >
          ←
        </motion.button>
        <h2 className="text-2xl font-bold text-white">
          Pega tu contenido
        </h2>
      </div>

      <div className="flex items-center gap-2 text-sm text-lf-muted px-2">
        <span className="text-2xl">
          {sources.find((s) => s.id === selectedSource)?.icon}
        </span>
        <span>{sources.find((s) => s.id === selectedSource)?.label}</span>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Pega aquí el texto en francés que quieres aprender..."
          className="w-full h-48 px-4 py-3 rounded-xl bg-lf-dark/30 border border-white/20 text-white placeholder:text-lf-muted resize-none focus:ring-2 focus:ring-lf-accent focus:border-transparent"
          autoFocus
        />
      </div>

      {content.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-lf-muted px-2"
        >
          <span>
            {calculateWordCount(content)} palabras •{' '}
            {calculatePhraseCount(content)} frases detectadas
          </span>
        </motion.div>
      )}

      <motion.button
        onClick={onAnalyze}
        disabled={!isValidContent(content)}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-lf-primary to-lf-secondary text-white font-bold shadow-glass-xl hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Continuar →
      </motion.button>
    </motion.div>
  );
}
