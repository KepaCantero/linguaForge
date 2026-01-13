'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useInputStore } from '@/store/useInputStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useTTS } from '@/services/ttsService';
import { QuickReviewButton } from '@/components/transcript/QuickReviewButton';
import { TextInputOrbitalHUD } from '@/components/input/TextInputOrbitalHUD';
import { radialGlow } from '@/constants/colors';
import { TextInputSection } from '@/components/input/TextInputSection';
import { LoadedTextView } from '@/components/input/LoadedTextView';
import { useTextStats } from '@/hooks/useTextStats';

export default function TextInputPage() {
  const router = useRouter();
  const inputStore = useInputStore();
  const { activeLanguage, activeLevel } = useProgressStore();
  const { speak, isSpeaking, isAvailable } = useTTS();

  // Use custom hook for text statistics
  const textStats = useTextStats();

  const [textContent, setTextContent] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [textId, setTextId] = useState<string | null>(null);
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;

  const handleImport = useCallback(() => {
    router.push('/import?source=article');
  }, [router]);

  const handleLoadText = useCallback(() => {
    if (!textContent.trim()) return;
    const id = `text-${Date.now()}`;
    setTextId(id);
    setTextTitle(textContent.substring(0, 50) + '...');
  }, [textContent]);

  const handleMarkAsRead = useCallback(() => {
    if (!textId || !textContent.trim()) return alert('Primero carga un texto');
    const words = textContent.split(/\s+/).filter(Boolean).length;
    inputStore.markTextAsRead(textId, words, activeLanguage, activeLevel);
    alert('¡Texto marcado como leído!');
  }, [textId, textContent, activeLanguage, activeLevel, inputStore]);

  const handlePlayAudio = useCallback(() => {
    if (!textContent.trim()) return;
    speak(textContent);
  }, [textContent, speak]);

  return (
    <div className="space-y-8 pb-32">
      {/* Stats Orbital HUD */}
      <TextInputOrbitalHUD
        textStats={textStats}
        icon="📖"
        colorStart="#06B6D4"
        colorEnd="#0891B2"
      />

      {/* Input Section with Orbital Design */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-md mx-auto px-4"
      >
        {!textId ? (
          <TextInputSection
            textContent={textContent}
            onTextChange={setTextContent}
            onLoad={handleLoadText}
            wordCount={wordCount}
          />
        ) : (
          <LoadedTextView
            textId={textId}
            textTitle={textTitle}
            textContent={textContent}
            wordCount={wordCount}
            onPlayAudio={handlePlayAudio}
            onMarkAsRead={handleMarkAsRead}
            isSpeaking={isSpeaking}
            isTTSAvailable={isAvailable}
          />
        )}
      </motion.div>

      {/* Import Button - Fixed */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed top-20 right-4 z-50"
      >
        <motion.button
          onClick={handleImport}
          className="relative w-16 h-16 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #06B6D4, #0891B2)',
          }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full blur-lg"
            style={{
              background: radialGlow('sky', 0.6),
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="relative text-3xl">✨</span>
        </motion.button>
      </motion.div>

      {/* Quick Review Button */}
      {textId && (
        <QuickReviewButton
          source={{
            type: 'text',
            id: textId,
            title: textTitle || `Texto ${textId}`,
          }}
        />
      )}
    </div>
  );
}

