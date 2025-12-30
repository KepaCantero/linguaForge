'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputContent, InputType, WeaknessType } from '@/types';
import { useInputStore } from '@/store/useInputStore';
import { useProgressStore } from '@/store/useProgressStore';
import { getMainWeakness } from '@/services/inputTracker';
import { INPUT_CONFIG } from '@/lib/constants';
import { SPRING, staggerDelay } from '@/lib/motion';

// Contenido de ejemplo (en producción vendría de una API)
const SAMPLE_CONTENT: InputContent[] = [
  {
    id: 'audio-1',
    languageCode: 'fr',
    levelCode: 'A1',
    type: 'audio',
    title: 'Saluer son hôte Airbnb',
    description: 'Un dialogue court pour saluer votre hôte',
    url: '/audio/greeting.mp3',
    wordCount: 45,
    durationSeconds: 30,
    transcript: 'Bonjour! Je suis Marie, votre hôte. Bienvenue dans mon appartement.',
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Comment s\'appelle l\'hôte?',
        questionTranslation: '¿Cómo se llama el anfitrión?',
        options: [
          { id: 'a', text: 'Marie', isCorrect: true },
          { id: 'b', text: 'Sophie', isCorrect: false },
          { id: 'c', text: 'Pierre', isCorrect: false },
          { id: 'd', text: 'Jean', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'text-1',
    languageCode: 'fr',
    levelCode: 'A1',
    type: 'text',
    title: 'Instructions de la cuisine',
    description: 'Les règles de la cuisine de votre Airbnb',
    url: '/text/kitchen.html',
    wordCount: 80,
    transcript: 'La cuisine est équipée. Vous pouvez utiliser le réfrigérateur, le micro-ondes et la cafetière.',
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Qu\'est-ce qu\'on peut utiliser?',
        questionTranslation: '¿Qué se puede usar?',
        options: [
          { id: 'a', text: 'Le réfrigérateur', isCorrect: true },
          { id: 'b', text: 'Le lave-vaisselle', isCorrect: false },
          { id: 'c', text: 'Le four', isCorrect: false },
          { id: 'd', text: 'Le grille-pain', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'video-1',
    languageCode: 'fr',
    levelCode: 'A1',
    type: 'video',
    title: 'Visite de l\'appartement',
    description: 'Une vidéo de présentation de l\'appartement',
    url: '/video/tour.mp4',
    wordCount: 120,
    durationSeconds: 90,
    transcript: 'Voici le salon avec un canapé confortable. La chambre est à droite.',
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Où est la chambre?',
        questionTranslation: '¿Dónde está el dormitorio?',
        options: [
          { id: 'a', text: 'À droite', isCorrect: true },
          { id: 'b', text: 'À gauche', isCorrect: false },
          { id: 'c', text: 'En haut', isCorrect: false },
          { id: 'd', text: 'En bas', isCorrect: false },
        ],
      },
    ],
  },
];

interface InputSelectorProps {
  onSelectContent: (content: InputContent) => void;
}

const TYPE_ICONS: Record<InputType, string> = {
  audio: '🎧',
  video: '📺',
  text: '📖',
};

const TYPE_LABELS: Record<InputType, string> = {
  audio: 'Audio',
  video: 'Video',
  text: 'Lectura',
};

const WEAKNESS_SUGGESTIONS: Record<WeaknessType, InputType[]> = {
  listening: ['audio', 'video'],
  reading: ['text'],
  speaking: ['audio', 'video'], // Para shadowing
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING.smooth,
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      ...SPRING.smooth,
      delay: staggerDelay(i, 0.08),
    },
  }),
};

export function InputSelector({ onSelectContent }: InputSelectorProps) {
  const { activeLanguage, activeLevel } = useProgressStore();
  const { getStats, recentContentIds } = useInputStore();

  const stats = getStats(activeLanguage, activeLevel);
  const weakness = getMainWeakness(stats, activeLevel);

  const [selectedType, setSelectedType] = useState<InputType | null>(null);

  // Filtrar contenido disponible
  const availableContent = useMemo(() => {
    return SAMPLE_CONTENT.filter((content) => {
      if (content.languageCode !== activeLanguage || content.levelCode !== activeLevel) {
        return false;
      }
      if (recentContentIds.slice(0, INPUT_CONFIG.historyToAvoid).includes(content.id)) {
        return false;
      }
      if (selectedType && content.type !== selectedType) {
        return false;
      }
      return true;
    });
  }, [activeLanguage, activeLevel, recentContentIds, selectedType]);

  // Contenido recomendado basado en debilidad
  const recommendedContent = useMemo(() => {
    const preferredTypes = WEAKNESS_SUGGESTIONS[weakness];
    return availableContent.filter((c) => preferredTypes.includes(c.type));
  }, [availableContent, weakness]);

  const handleQuickSelect = useCallback(() => {
    const content = recommendedContent[0] || availableContent[0];
    if (content) {
      onSelectContent(content);
    }
  }, [recommendedContent, availableContent, onSelectContent]);

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Botón "Input para mí" */}
      <motion.button
        onClick={handleQuickSelect}
        className="w-full py-8 bg-gradient-to-r from-lf-primary via-lf-secondary to-fuchsia-500 text-white font-bold rounded-2xl shadow-xl shadow-lf-primary/25 relative overflow-hidden group"
        variants={itemVariants}
        whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(126,34,206,0.4)' }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Animated shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        />

        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('/patterns/crystal-cracks.svg')",
            backgroundSize: '100px 100px',
          }}
        />

        <div className="relative">
          <motion.span
            className="text-4xl block mb-2"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            ✨
          </motion.span>
          <span className="font-rajdhani text-2xl">Input para mí</span>
          <p className="font-atkinson text-sm text-white/80 mt-1">
            Recomendación basada en tu perfil
          </p>
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-6 bg-lf-accent/80 transform rotate-45 translate-x-8 -translate-y-2" />
        </div>
      </motion.button>

      {/* Indicador de debilidad */}
      <motion.div
        className="bg-lf-soft rounded-xl p-4 border border-lf-muted/30"
        variants={itemVariants}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="w-12 h-12 bg-lf-primary/20 rounded-xl flex items-center justify-center border border-lf-primary/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <span className="text-2xl">
              {weakness === 'listening' ? '👂' : weakness === 'reading' ? '👀' : '🗣️'}
            </span>
          </motion.div>
          <div>
            <p className="font-atkinson text-xs text-gray-500 uppercase tracking-wider">Tu área de mejora</p>
            <p className="font-rajdhani font-bold text-white">
              {weakness === 'listening' ? 'Comprensión auditiva' : weakness === 'reading' ? 'Lectura' : 'Producción oral'}
            </p>
          </div>
          <motion.div
            className="ml-auto w-2 h-2 rounded-full bg-lf-accent"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Filtros por tipo */}
      <motion.div variants={itemVariants}>
        <p className="font-rajdhani text-xs text-lf-muted uppercase tracking-wider mb-3">
          O elige por tipo:
        </p>
        <div className="flex gap-3">
          {(['audio', 'video', 'text'] as InputType[]).map((type, index) => (
            <motion.button
              key={type}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              className={`
                flex-1 py-4 rounded-xl flex flex-col items-center gap-2 transition-all
                ${selectedType === type
                  ? 'bg-gradient-to-br from-lf-primary to-lf-secondary text-white shadow-lg shadow-lf-primary/25'
                  : 'bg-lf-soft text-gray-400 hover:text-white border border-lf-muted/30 hover:border-lf-primary/50'
                }
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: staggerDelay(index, 0.1) }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="text-2xl"
                animate={selectedType === type ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                {TYPE_ICONS[type]}
              </motion.span>
              <span className="font-rajdhani text-sm font-medium">{TYPE_LABELS[type]}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Lista de contenido */}
      <motion.div className="space-y-3" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <p className="font-rajdhani text-xs text-lf-muted uppercase tracking-wider">
            Contenido disponible
          </p>
          <span className="font-rajdhani text-sm text-lf-secondary font-bold">
            {availableContent.length}
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          {availableContent.length === 0 ? (
            <motion.div
              className="bg-lf-soft rounded-xl p-8 text-center border border-lf-muted/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <span className="text-4xl mb-3 block">📚</span>
              <p className="font-atkinson text-gray-400">
                No hay contenido disponible con estos filtros
              </p>
            </motion.div>
          ) : (
            availableContent.map((content, index) => (
              <motion.button
                key={content.id}
                onClick={() => onSelectContent(content)}
                className="w-full bg-lf-soft rounded-xl p-4 text-left border border-lf-muted/30 hover:border-lf-primary/50 transition-colors group"
                variants={cardVariants}
                custom={index}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ x: 4, boxShadow: '0 4px 20px rgba(126,34,206,0.2)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-lf-primary/30 to-lf-secondary/30 rounded-xl flex items-center justify-center text-2xl border border-lf-primary/20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {TYPE_ICONS[content.type]}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-rajdhani font-bold text-white group-hover:text-lf-secondary transition-colors truncate">
                      {content.title}
                    </h3>
                    <p className="font-atkinson text-sm text-gray-400 mt-0.5 line-clamp-1">
                      {content.description}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <span className="font-rajdhani text-xs text-gray-500 flex items-center gap-1">
                        <span className="text-lf-accent">◆</span>
                        {content.wordCount} palabras
                      </span>
                      {content.durationSeconds && (
                        <span className="font-rajdhani text-xs text-gray-500 flex items-center gap-1">
                          <span className="text-lf-secondary">◉</span>
                          {Math.ceil(content.durationSeconds / 60)} min
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recommended badge */}
                  {recommendedContent.includes(content) && (
                    <motion.span
                      className="px-2.5 py-1 bg-lf-accent/20 text-lf-accent text-xs font-rajdhani font-bold rounded-full border border-lf-accent/30"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={SPRING.bouncy}
                    >
                      ★ Top
                    </motion.span>
                  )}

                  {/* Arrow */}
                  <motion.span
                    className="text-gray-500 group-hover:text-lf-secondary transition-colors"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    ›
                  </motion.span>
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
