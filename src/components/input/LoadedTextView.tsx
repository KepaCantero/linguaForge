'use client';

import { motion } from 'framer-motion';
import { WordSelector } from '@/components/transcript/WordSelector';
import type { ContentSource } from '@/types/srs';

interface LoadedTextViewProps {
  textId: string;
  textTitle: string;
  textContent: string;
  wordCount: number;
  onPlayAudio: () => void;
  onMarkAsRead: () => void;
  isSpeaking: boolean;
  isTTSAvailable: boolean;
}

/**
 * Loaded text view component with WordSelector integration
 * Reduces parent component complexity by isolating loaded text logic
 */
export function LoadedTextView({
  textId,
  textTitle,
  textContent,
  wordCount,
  onPlayAudio,
  onMarkAsRead,
  isSpeaking,
  isTTSAvailable,
}: LoadedTextViewProps) {
  return (
    <div className="space-y-6">
      {/* Text Info Orb */}
      <motion.div
        className="relative w-full flex justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 150 }}
      >
        <div
          className="relative w-28 h-28 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #06B6D4, #0891B2)',
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.7), transparent)',
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-5xl">
            📖
          </div>
        </div>
      </motion.div>

      {/* Text Details */}
      <div className="text-center">
        <p className="text-lg font-bold text-white mb-2">{textTitle}</p>
        <p className="text-sm text-white/60">{wordCount} palabras</p>
      </div>

      {/* Word Selector or Text Display */}
      <div className="space-y-2">
        <h3 id="content-heading" className="block text-sm font-medium text-white/90">
          Contenido
        </h3>
        <div role="region" aria-labelledby="content-heading" className="mb-4">
          <WordSelector
            transcript={textContent}
            source={{
              type: 'text',
              id: textId,
              title: textTitle || `Texto ${textId}`,
            } as ContentSource}
          />
        </div>
      </div>

      {/* Play Audio Button */}
      {isTTSAvailable && (
        <motion.button
          onClick={onPlayAudio}
          disabled={isSpeaking || !textContent.trim()}
          className="w-full py-4 rounded-aaa-xl font-bold text-white flex items-center justify-center gap-3"
          style={{
            background: isSpeaking || !textContent.trim()
              ? 'radial-gradient(circle at 30% 30%, #4B5563, #374151)'
              : 'radial-gradient(circle at 30% 30%, #06B6D4, #0891B2)',
          }}
          whileHover={{ scale: isSpeaking || !textContent.trim() ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-2xl">{isSpeaking ? '🔊' : '🔈'}</span>
          <span>{isSpeaking ? 'Reproduciendo audio...' : 'Reproducir audio'}</span>
        </motion.button>
      )}

      {/* Mark as Read Button */}
      <motion.button
        onClick={onMarkAsRead}
        className="w-full py-4 rounded-aaa-xl font-bold text-white flex items-center justify-center gap-3"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-2xl">✓</span>
        <span>Marcar como leído</span>
      </motion.button>
    </div>
  );
}
