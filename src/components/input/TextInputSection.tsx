'use client';

import { motion } from 'framer-motion';

interface TextInputSectionProps {
  textContent: string;
  onTextChange: (value: string) => void;
  onLoad: () => void;
  wordCount: number;
}

/**
 * Text input section component with orbital design button
 * Reduces parent component complexity by isolating input logic
 */
export function TextInputSection({
  textContent,
  onTextChange,
  onLoad,
  wordCount,
}: TextInputSectionProps) {
  const hasText = textContent.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Text Input */}
      <motion.div
        className="relative w-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 150 }}
      >
        <textarea
          value={textContent}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Pega aquí el texto en francés que quieres leer..."
          className="w-full h-48 px-6 py-4 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 text-white placeholder:text-white/50 resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
        />
      </motion.div>

      {/* Word count display */}
      {hasText && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="text-sm text-white/70">{wordCount} palabras</span>
        </motion.div>
      )}

      {/* Load Button Orb */}
      <motion.div
        className="flex justify-center mt-4"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={onLoad}
          disabled={!hasText}
          className="relative w-20 h-20 rounded-full"
          style={{
            background: hasText
              ? 'radial-gradient(circle at 30% 30%, #06B6D4, #0891B2)'
              : 'radial-gradient(circle at 30% 30%, #4B5563, #374151)',
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full blur-lg"
            style={{
              background: hasText
                ? 'radial-gradient(circle, rgba(6, 182, 212, 0.6), transparent)'
                : 'transparent',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="relative text-3xl">⚡</span>
        </button>
      </motion.div>

      {/* Empty State */}
      {!hasText && (
        <div className="text-center py-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            📚
          </motion.div>
          <p className="text-sm text-white/60">
            No hay textos disponibles. Haz clic en &quot;Importar&quot; para agregar
            artículos o textos.
          </p>
        </div>
      )}
    </div>
  );
}
