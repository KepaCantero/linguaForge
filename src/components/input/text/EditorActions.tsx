'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface EditorActionsProps {
  children: React.ReactNode;
  text: string;
  canAnalyze: boolean;
  isGenerating: boolean;
  showVoiceSelector: boolean;
  showQualitySelector: boolean;
  showIntonationSelector: boolean;
  useIntonation: boolean;
  onGenerateAudio: () => void;
  onDownloadAudio: () => void;
  onToggleVoice: () => void;
  onToggleQuality: () => void;
  onToggleIntonation: () => void;
}

export function EditorActions({
  children,
  text,
  canAnalyze,
  isGenerating,
  showVoiceSelector,
  showQualitySelector,
  showIntonationSelector,
  useIntonation,
  onGenerateAudio,
  onDownloadAudio,
  onToggleVoice,
  onToggleQuality,
  onToggleIntonation,
}: EditorActionsProps) {
  return (
    <>
      <AnimatePresence>
        {text.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-wrap gap-3"
          >
            <ActionButton
              onClick={onGenerateAudio}
              disabled={!canAnalyze || isGenerating}
              label={isGenerating ? '⏳ Generando...' : '🔊 Escuchar texto'}
              className="flex-1 min-w-[140px] px-4 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600"
            />

            <ActionButton
              onClick={onDownloadAudio}
              disabled={!canAnalyze || isGenerating}
              label="💾 Guardar audio"
              className="flex-1 min-w-[140px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600"
            />

            <ActionButton
              onClick={onToggleVoice}
              disabled={false}
              label="🎤 Voz"
              className="px-4 py-3 bg-calm-bg-elevated hover:bg-calm-warm-200/20 border border-calm-warm-200/50 text-calm-text-primary"
            />

            <ActionButton
              onClick={onToggleQuality}
              disabled={false}
              label="⚙️ Calidad"
              className="px-4 py-3 bg-calm-bg-elevated hover:bg-calm-warm-200/20 border border-calm-warm-200/50 text-calm-text-primary"
            />

            <ActionButton
              onClick={onToggleIntonation}
              disabled={false}
              label={useIntonation ? '🎵 Entonación ON' : '🎵 Entonación'}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                useIntonation
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-calm-bg-elevated hover:bg-calm-warm-200/20 border border-calm-warm-200/50 text-calm-text-primary'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showVoiceSelector || showQualitySelector || showIntonationSelector) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  label: string;
  className: string;
}

function ActionButton({ onClick, disabled, label, className }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors`}
    >
      {label}
    </button>
  );
}
