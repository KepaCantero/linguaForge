import { motion } from 'framer-motion';
import { calculatePhraseCount, calculateWordCount, isValidContent } from '@/services/importFlowService';
import type { YouTubeImportActions, YouTubeImportState } from '@/hooks/useYouTubeImport';
import type { ImportSourceOption } from '@/components/import/ImportSourceSelector';

interface YouTubeContentStepProps {
  sources: ImportSourceOption[];
  selectedSource: 'youtube' | null;
  youTubeImport: YouTubeImportState & YouTubeImportActions;
  content: string;
  setContent: (value: string) => void;
  onBack: () => void;
  onAnalyze: () => void;
}

export function YouTubeContentStep({
  sources,
  selectedSource,
  youTubeImport,
  content,
  setContent,
  onBack,
  onAnalyze,
}: YouTubeContentStepProps) {
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

      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
          <label htmlFor="youtube-url" className="block text-sm font-medium text-white mb-2">
            URL del video de YouTube
          </label>
          <div className="flex gap-2">
            <input
              id="youtube-url"
              type="text"
              value={youTubeImport.youtubeUrl}
              onChange={(e) => youTubeImport.setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-3 rounded-xl bg-lf-dark/30 border border-white/20 text-white placeholder:text-lf-muted focus:ring-2 focus:ring-lf-accent focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && youTubeImport.fetchTranscriptFromUrl()}
            />
            <motion.button
              onClick={youTubeImport.fetchTranscriptFromUrl}
              disabled={!youTubeImport.youtubeUrl.trim() || youTubeImport.isLoadingTranscript}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-lf-primary to-lf-secondary text-white font-medium shadow-glass-xl hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              {youTubeImport.isLoadingTranscript ? 'Cargando...' : 'Obtener'}
            </motion.button>
          </div>
          <p className="text-xs text-lf-muted mt-2">
            Se intentará obtener automáticamente la transcripción sincronizada del video.
            Si el video no tiene subtítulos públicos o hay un error, puedes pegar la transcripción manualmente abajo.
          </p>
        </div>

        {youTubeImport.transcript && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl bg-green-500/10 backdrop-blur-md border border-green-500/30 p-4"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative flex items-center gap-2 mb-2">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-green-400"
              >
                ✓
              </motion.span>
              <span className="text-sm font-medium text-green-300">
                Transcripción obtenida ({youTubeImport.transcript.phrases.length} frases)
              </span>
            </div>
            <p className="text-xs text-green-400/80">
              Video: {youTubeImport.transcript.title}
            </p>
          </motion.div>
        )}

        <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
          <label htmlFor="transcript-content" className="block text-sm font-medium text-white mb-2">
            Transcripción (puedes editarla)
          </label>
          <textarea
            id="transcript-content"
            value={youTubeImport.content}
            onChange={(e) => { setContent(e.target.value); youTubeImport.setContent(e.target.value); }}
            placeholder={youTubeImport.transcript ? 'La transcripción aparecerá aquí...' : 'Pega la URL del video y haz clic en "Obtener" o pega la transcripción manualmente...'}
            className="w-full h-48 px-4 py-3 rounded-xl bg-lf-dark/30 border border-white/20 text-white placeholder:text-lf-muted resize-none focus:ring-2 focus:ring-lf-accent focus:border-transparent"
            disabled={youTubeImport.isLoadingTranscript}
          />
        </div>
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
