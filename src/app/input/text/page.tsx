'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useInputStore } from '@/store/useInputStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useTTS } from '@/services/ttsService';
import { WordSelector } from '@/components/transcript/WordSelector';
import { QuickReviewButton } from '@/components/transcript/QuickReviewButton';
import { ContentSource } from '@/types/srs';

// Circular Stat Component
interface TextStatOrbProps {
  value: string | number;
  label: string;
  icon: string;
  color: string;
  angle: number;
  distance: number;
  delay: number;
}

function TextStatOrb({ value, label, icon, color, angle, distance, delay }: TextStatOrbProps) {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * distance;
  const y = Math.sin(radians) * distance;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px - 50px)`,
        top: `calc(50% + ${y}px - 50px)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 200,
      }}
    >
      <motion.div
        className="relative w-24 h-24 rounded-full cursor-pointer"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}DD)`,
        }}
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 3 + delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.15, y: -18 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-lg"
          style={{
            background: `radial-gradient(circle, ${color}CC, transparent)`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity, delay }}
        />

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          {icon}
        </div>

        {/* Value */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-sm font-bold text-white">{value}</div>
          <div className="text-xs text-lf-muted">{label}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TextInputPage() {
  const router = useRouter();
  const inputStore = useInputStore();
  const { activeLanguage, activeLevel } = useProgressStore();
  const { speak, isSpeaking, isAvailable } = useTTS();

  const [textContent, setTextContent] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [textId, setTextId] = useState<string | null>(null);

  const statsKey = `${activeLanguage}-${activeLevel}`;
  const statsData = inputStore.stats[statsKey];

  // Calcular estadísticas de texto
  const textStats = useMemo(() => {
    const textEvents = inputStore.events.filter((e) => e.type === 'text' && e.wordsCounted > 0);
    const uniqueTextIds = new Set(textEvents.map(e => e.contentId).filter(Boolean));
    const textCount = uniqueTextIds.size;
    const wordsRead = statsData?.wordsRead || 0;
    const minutesRead = statsData?.minutesRead || 0;

    return {
      textCount,
      wordsRead,
      minutesRead,
      hoursRead: (minutesRead / 60).toFixed(2),
    };
  }, [inputStore.events, statsData]);

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
    if (!textId || !textContent.trim()) {
      alert('Primero carga un texto');
      return;
    }

    const words = textContent.split(/\s+/).filter(Boolean).length;
    inputStore.markTextAsRead(textId, words, activeLanguage, activeLevel);
    alert('¡Texto marcado como leído!');
  }, [textId, textContent, activeLanguage, activeLevel, inputStore]);

  const handlePlayAudio = useCallback(() => {
    if (!textContent.trim()) return;
    speak(textContent);
  }, [textContent, speak]);

  const wordCount = textContent.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-8 pb-32">
      {/* Stats Orbital HUD */}
      <div className="relative w-full h-[45vh] flex items-center justify-center">
        {/* Outer decorative rings */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: `${200 + i * 40}px`,
              height: `${200 + i * 40}px`,
              borderColor: `rgba(6, 182, 212, ${0.15 - i * 0.03})`,
              borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
            }}
            animate={{
              rotate: i % 2 === 0 ? [0, 360] : [360, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 25 + i * 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        {/* Central Core - Text */}
        <motion.div
          className="relative w-32 h-32 rounded-full z-10"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #06B6D4, #0891B2)',
          }}
          animate={{
            scale: [1, 1.06, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          whileHover={{ scale: 1.12 }}
        >
          {/* Core glow */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.8), transparent)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Core icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.div
              className="text-5xl"
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              📖
            </motion.div>
          </div>
        </motion.div>

        {/* Stat orbs in orbital arrangement */}
        <TextStatOrb
          value={textStats.textCount}
          label="Textos"
          icon="📄"
          color="#06B6D4"
          angle={-90}
          distance={120}
          delay={0}
        />

        <TextStatOrb
          value={textStats.wordsRead.toLocaleString()}
          label="Palabras"
          icon="📝"
          color="#22D3EE"
          angle={30}
          distance={120}
          delay={0.1}
        />

        <TextStatOrb
          value={`${textStats.hoursRead}h`}
          label="Horas"
          icon="⏱️"
          color="#67E8F9"
          angle={150}
          distance={120}
          delay={0.2}
        />

        {/* Floating particles */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-70"
            style={{
              background: i % 2 === 0 ? "#06B6D4" : "#22D3EE",
              left: `${25 + (i * 8) % 50}%`,
              top: `${15 + (i * 10) % 70}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, (i % 2 === 0 ? 30 : -30), 0],
              scale: [1, 0.6, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Input Section with Orbital Design */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-md mx-auto px-4"
      >
        {!textId ? (
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
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Pega aquí el texto en francés que quieres leer..."
                className="w-full h-48 px-6 py-4 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 text-white placeholder:text-white/50 resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              />
            </motion.div>

            {/* Word count display */}
            {textContent && (
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
                onClick={handleLoadText}
                disabled={!textContent.trim()}
                className="relative w-20 h-20 rounded-full"
                style={{
                  background: !textContent.trim()
                    ? 'radial-gradient(circle at 30% 30%, #4B5563, #374151)'
                    : 'radial-gradient(circle at 30% 30%, #06B6D4, #0891B2)',
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full blur-lg"
                  style={{
                    background: !textContent.trim()
                      ? 'transparent'
                      : 'radial-gradient(circle, rgba(6, 182, 212, 0.6), transparent)',
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
            {!textContent && (
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
                  No hay textos disponibles. Haz clic en &quot;Importar&quot; para agregar artículos o textos.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Text Info Orb */}
            <motion.div
              className="relative w-full flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              <div className="relative w-28 h-28 rounded-full"
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
              <p className="text-sm text-white/60">
                {wordCount} palabras
              </p>
            </div>

            {/* Word Selector or Text Display */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/90">
                Contenido
              </label>
              <div className="mb-4">
                <WordSelector
                  transcript={textContent}
                  source={{
                    type: 'text',
                    id: textId || '',
                    title: textTitle || `Texto ${textId}`,
                  } as ContentSource}
                />
              </div>
            </div>

            {/* Play Audio Button */}
            {isAvailable && (
              <motion.button
                onClick={handlePlayAudio}
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
              onClick={handleMarkAsRead}
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
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.6), transparent)',
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

