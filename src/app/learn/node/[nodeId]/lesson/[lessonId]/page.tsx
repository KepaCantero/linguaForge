'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLesson } from '@/hooks/useLesson';
import { useGamificationStore } from '@/store/useGamificationStore';
import { WarmupGate } from '@/components/warmups';
import type { MissionType, Difficulty } from '@/schemas/warmup';

// Exercise components
import { ClozeExercise } from '@/components/exercises/ClozeExercise';
import { VocabularyExercise } from '@/components/exercises/VocabularyExercise';
import { VariationsExercise } from '@/components/exercises/VariationsExercise';
import { PragmaStrikeExercise } from '@/components/exercises/PragmaStrikeExercise';
import { ConversationalEchoExercise } from '@/components/exercises/ConversationalEchoExercise';
import { DialogueIntonationExercise } from '@/components/exercises/DialogueIntonationExercise';
import { JanusComposerExercise } from '@/components/exercises/JanusComposerExercise';
import { ShadowingExercise } from '@/components/exercises/ShadowingExercise';

import type {
  LessonContent,
  Phrase,
  Vocabulary,
  PragmaStrike,
  ConversationalEcho,
  DialogueIntonation,
  JanusComposer,
} from '@/types';

// Exercise category with items
interface ExerciseCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: Array<{ id: string; type: string; data: unknown }>;
}

// ============================================
// HELPER FUNCTIONS - Reduce component complexity
// ============================================

/**
 * Map exercise types to their rendering configurations
 * Uses discriminant union to handle different prop types
 */
function renderExerciseByType(
  exerciseType: string,
  exerciseData: unknown,
  onComplete: (correct: boolean) => void
): JSX.Element | null {
  const data = exerciseData;

  switch (exerciseType) {
    case 'cloze':
      return <ClozeExercise phrase={data as Phrase} onComplete={onComplete} />;
    case 'vocabulary':
      return <VocabularyExercise exercise={data as Vocabulary} onComplete={onComplete} />;
    case 'variations':
      return <VariationsExercise phrase={data as Phrase} onComplete={() => onComplete(true)} />;
    case 'pragmaStrike':
      return <PragmaStrikeExercise exercise={data as PragmaStrike} onComplete={onComplete} />;
    case 'conversationalEcho':
      return <ConversationalEchoExercise exercise={data as ConversationalEcho} onComplete={() => onComplete(true)} showHints />;
    case 'dialogueIntonation':
      return <DialogueIntonationExercise exercise={data as DialogueIntonation} onComplete={() => onComplete(true)} />;
    case 'janusComposer':
      return <JanusComposerExercise exercise={data as JanusComposer} onComplete={() => onComplete(true)} />;
    case 'shadowing':
      return <ShadowingExercise phrase={data as Phrase} onComplete={() => onComplete(true)} />;
    default:
      return (
        <div className="text-center p-8 bg-lf-soft/30 rounded-aaa-xl border border-lf-muted/30">
          <p className="text-lf-muted">Tipo no soportado: {exerciseType}</p>
          <button onClick={() => onComplete(true)} className="mt-4 px-6 py-2 bg-lf-primary text-white rounded-xl">
            Continuar
          </button>
        </div>
      );
  }
}

/**
 * Determine warmup mission type based on exercise categories
 */
function determineWarmupMissionType(categories: ExerciseCategory[]): MissionType {
  if (!categories.length) return 'mixed';

  const hasVocab = categories.some(c => ['vocabulary', 'shardDetection'].includes(c.id));
  const hasGrammar = categories.some(c => ['cloze', 'janusComposer', 'glyphWeaving'].includes(c.id));
  const hasPronunciation = categories.some(c => ['shadowing', 'echoStream'].includes(c.id));

  if (hasPronunciation && !hasVocab && !hasGrammar) return 'pronunciation';
  if (hasVocab && !hasGrammar && !hasPronunciation) return 'vocabulary';
  if (hasGrammar && !hasVocab && !hasPronunciation) return 'grammar';
  return 'mixed';
}

// Build exercise categories from lesson content
function buildExerciseCategories(lessonContent: LessonContent): ExerciseCategory[] {
  const categories: ExerciseCategory[] = [];

  // Vocabulary
  if (lessonContent.coreExercises?.vocabulary?.length) {
    categories.push({
      id: 'vocabulary',
      title: 'Vocabulario',
      icon: '📚',
      description: 'Aprende palabras nuevas con imágenes',
      items: lessonContent.coreExercises.vocabulary.map((ex, i) => ({
        id: `vocab-${i}`,
        type: 'vocabulary',
        data: ex,
      })),
    });
  }

  // Cloze from conversational blocks
  const clozeItems: Array<{ id: string; type: string; data: unknown }> = [];
  if (lessonContent.conversationalBlocks) {
    lessonContent.conversationalBlocks.forEach((block) => {
      block.phrases.forEach((phrase, i) => {
        if (phrase.clozeWord && phrase.clozeOptions) {
          clozeItems.push({ id: `cloze-${block.id}-${i}`, type: 'cloze', data: phrase });
        }
      });
    });
  }
  if (clozeItems.length > 0) {
    categories.push({
      id: 'cloze',
      title: 'Cloze',
      icon: '✏️',
      description: 'Completa las frases con la palabra correcta',
      items: clozeItems,
    });
  }

  // PragmaStrike
  if (lessonContent.coreExercises?.pragmaStrike?.length) {
    categories.push({
      id: 'pragmaStrike',
      title: 'Pragma Strike',
      icon: '⚡',
      description: 'Elige la respuesta correcta bajo presión',
      items: lessonContent.coreExercises.pragmaStrike.map((ex, i) => ({
        id: `pragma-${i}`,
        type: 'pragmaStrike',
        data: ex,
      })),
    });
  }

  if (lessonContent.coreExercises?.glyphWeaving?.length) {
    categories.push({
      id: 'glyphWeaving',
      title: 'Glyph Weaving',
      icon: '🔀',
      description: 'Conecta los glifos en el orden correcto',
      items: lessonContent.coreExercises.glyphWeaving.map((ex, i) => ({
        id: `glyph-${i}`,
        type: 'glyphWeaving',
        data: ex,
      })),
    });
  }

  // ConversationalEcho
  if (lessonContent.coreExercises?.conversationalEcho?.length) {
    categories.push({
      id: 'conversationalEcho',
      title: 'Echo Conversacional',
      icon: '💬',
      description: 'Responde en contexto conversacional',
      items: lessonContent.coreExercises.conversationalEcho.map((ex, i) => ({
        id: `convEcho-${i}`,
        type: 'conversationalEcho',
        data: ex,
      })),
    });
  }

  // DialogueIntonation
  if (lessonContent.coreExercises?.dialogueIntonation?.length) {
    categories.push({
      id: 'dialogueIntonation',
      title: 'Entonación de Diálogo',
      icon: '🎤',
      description: 'Practica el ritmo y entonación',
      items: lessonContent.coreExercises.dialogueIntonation.map((ex, i) => ({
        id: `dialogue-${i}`,
        type: 'dialogueIntonation',
        data: ex,
      })),
    });
  }

  // JanusComposer (Matriz Janus)
  if (lessonContent.coreExercises?.janusComposer?.length) {
    categories.push({
      id: 'janusComposer',
      title: 'Matriz Janus',
      icon: '🧩',
      description: 'Construye frases combinando columnas',
      items: lessonContent.coreExercises.janusComposer.map((ex, i) => ({
        id: `janus-${i}`,
        type: 'janusComposer',
        data: ex,
      })),
    });
  }

  // Shadowing from conversational blocks
  const shadowingItems: Array<{ id: string; type: string; data: unknown }> = [];
  if (lessonContent.conversationalBlocks) {
    lessonContent.conversationalBlocks.forEach((block) => {
      block.phrases.forEach((phrase, i) => {
        if (phrase.audioUrl) {
          shadowingItems.push({ id: `shadow-${block.id}-${i}`, type: 'shadowing', data: phrase });
        }
      });
    });
  }
  // Variations
  const variationItems: Array<{ id: string; type: string; data: unknown }> = [];
  if (lessonContent.conversationalBlocks) {
    lessonContent.conversationalBlocks.forEach((block) => {
      block.phrases.forEach((phrase, i) => {
        if (phrase.variations && phrase.variations.length > 0) {
          variationItems.push({ id: `var-${block.id}-${i}`, type: 'variations', data: phrase });
        }
      });
    });
  }
  if (variationItems.length > 0) {
    categories.push({
      id: 'variations',
      title: 'Variaciones',
      icon: '🔄',
      description: 'Aprende diferentes formas de decir lo mismo',
      items: variationItems,
    });
  }

  return categories;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const nodeId = params.nodeId as string;
  const lessonId = params.lessonId as string;

  // Load lesson content
  const level = lessonId.startsWith('nodo-0-') ? 'A0' : 'A1';
  const { lessonContent, leaf, loading, error } = useLesson(lessonId, 'fr', level);
  const { addXP } = useGamificationStore();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showWarmupGate, setShowWarmupGate] = useState(false);
  const [warmupCompleted, setWarmupCompleted] = useState(false);

  // Build exercise categories
  const categories = useMemo(() => {
    if (!lessonContent) return [];
    return buildExerciseCategories(lessonContent);
  }, [lessonContent]);

  // Determinar tipo de warmup según ejercicios disponibles - using helper
  const warmupMissionType: MissionType = useMemo(
    () => determineWarmupMissionType(categories),
    [categories]
  );

  // Dificultad basada en el nivel
  const warmupDifficulty: Difficulty = level === 'A0' ? 'low' : 'medium';

  // Get current category and exercise
  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const currentExercise = currentCategory?.items[currentIndex];
  const totalInCategory = currentCategory?.items.length || 0;

  const handleExerciseComplete = useCallback((correct: boolean) => {
    if (correct) {
      addXP(10);
    } else {
      addXP(5);
    }

    // Move to next exercise or back to menu
    if (currentIndex < totalInCategory - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Category completed
      setSelectedCategory(null);
      setCurrentIndex(0);
    }
  }, [currentIndex, totalInCategory, addXP]);

  const handleBack = useCallback(() => {
    if (selectedCategory) {
      setSelectedCategory(null);
      setCurrentIndex(0);
    } else {
      router.push(`/learn/node/${nodeId}`);
    }
  }, [selectedCategory, router, nodeId]);

  const handleSelectCategory = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentIndex(0);
  }, []);

  // Warmup handlers
  const handleStartWarmup = useCallback(() => {
    setShowWarmupGate(true);
  }, []);

  const handleWarmupComplete = useCallback((score: number) => {
    console.log(`Warmup completado con puntuación: ${score}`);
    setWarmupCompleted(true);
  }, []);

  const handleWarmupSkip = useCallback(() => {
    console.log('Warmup saltado');
  }, []);

  const handleWarmupDone = useCallback(() => {
    setShowWarmupGate(false);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lf-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-lf-primary border-t-transparent mx-auto mb-4" />
          <p className="text-lf-muted">Cargando lección...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !lessonContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lf-dark">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-white mb-2">
            No se pudo cargar la lección
          </h2>
          <p className="text-lf-muted mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-lf-primary text-white rounded-aaa-xl hover:bg-lf-primary/90"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Exercise Menu (no category selected) - AAA Design without cards
  if (!selectedCategory) {
    const totalExercises = categories.reduce((sum, cat) => sum + cat.items.length, 0);

    return (
      <>
        {/* WarmupGate Modal */}
        <AnimatePresence>
          {showWarmupGate && (
            <WarmupGate
              lessonId={lessonId}
              missionType={warmupMissionType}
              missionTitle={leaf?.title || lessonContent?.title || 'Lección'}
              difficulty={warmupDifficulty}
              userLevel={1}
              onWarmupComplete={handleWarmupComplete}
              onWarmupSkip={handleWarmupSkip}
              onStartMission={handleWarmupDone}
              startButtonText="Comenzar Ejercicios"
            />
          )}
        </AnimatePresence>

        <div className="min-h-screen bg-lf-dark pb-20">
        {/* Header */}
        <header className="bg-lf-soft/80 border-b border-lf-muted/40 backdrop-blur-aaa sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-3">
            {/* Top row: Back button + Title */}
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-9 h-9 rounded-full text-lf-muted hover:text-white transition-colors"
              >
                <span className="text-lg">←</span>
              </button>
              <div className="flex-1">
                <h1 className="font-semibold text-white line-clamp-1">
                  {leaf?.title || lessonContent.title}
                </h1>
                <p className="text-xs text-lf-muted/70">
                  {totalExercises} ejercicios disponibles
                </p>
              </div>
            </div>

            {/* Action buttons row */}
            <div className="flex items-center gap-2">
              {/* Calentamiento button */}
              <motion.button
                onClick={handleStartWarmup}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all
                  ${warmupCompleted
                    ? 'bg-green-500/30 border-green-500/50 text-green-400'
                    : 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{warmupCompleted ? '✅' : '🧠'}</span>
                <span>Calentamiento</span>
              </motion.button>

              {/* Academia button */}
              <motion.button
                onClick={() => {/* Scroll to exercises */}}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold hover:bg-green-500/30 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>📚</span>
                <span>Academia</span>
              </motion.button>

              {/* Ejercicios button */}
              <motion.button
                onClick={() => {/* Scroll to exercises */}}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-lf-primary/30 border border-lf-primary/50 text-lf-primary text-sm font-semibold hover:bg-lf-primary/40 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>✏️</span>
                <span>Ejercicios</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Exercise Menu - AAA Design without cards */}
        <main className="max-w-lg mx-auto px-4 pt-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Ejercicios
            </h2>
            <p className="text-lf-muted">
              Elige el tipo de ejercicio que quieres practicar
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center p-8 bg-lf-soft/30 rounded-aaa-xl border border-lf-muted/30">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-lf-muted">
                No hay ejercicios disponibles en esta lección
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Separator */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-lf-muted/20" />
                <span className="text-xs text-lf-muted/60 uppercase tracking-wider">Ejercicios</span>
                <div className="flex-1 h-px bg-lf-muted/20" />
              </div>

              {/* Exercise items - AAA list design (no cards) */}
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  onClick={() => handleSelectCategory(category.id)}
                  className="relative w-full overflow-hidden group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-lf-primary/20 via-lf-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />

                  {/* Content */}
                  <div className="relative flex items-center justify-between p-4 border-b border-lf-muted/20 hover:border-lf-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      {/* Icon with animated background */}
                      <div className="relative">
                        <motion.div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-lf-primary/20"
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: index * 0.2,
                          }}
                        >
                          {category.icon}
                        </motion.div>
                      </div>

                      {/* Title and info */}
                      <div className="text-left">
                        <h3 className="font-semibold text-white">
                          {category.title}
                        </h3>
                        <p className="text-sm text-lf-muted/70">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-lf-primary bg-lf-primary/10 px-2 py-0.5 rounded-md">
                            {category.items.length} ejercicio{category.items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <motion.span
                      className="text-lf-muted/50 text-xl group-hover:text-lf-primary group-hover:translate-x-1 transition-all"
                      animate={{
                        x: [0, 4, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.1,
                      }}
                    >
                      →
                    </motion.span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </main>
      </div>
      </>
    );
  }

  // Render Exercise - simplified using helper function
  const renderExercise = () => {
    if (!currentExercise) return null;
    return renderExerciseByType(currentExercise.type, currentExercise.data, handleExerciseComplete);
  };

  return (
    <div className="min-h-screen bg-lf-dark flex flex-col">
      {/* Header */}
      <header className="bg-glass-surface dark:bg-lf-soft/50 border-b border-lf-muted/20 backdrop-blur-aaa sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleBack}
              className="text-lf-muted hover:text-white transition-colors"
            >
              ←
            </button>
            <div className="text-center">
              <span className="text-sm font-medium text-white">
                {currentCategory?.icon} {currentCategory?.title}
              </span>
              <span className="text-xs text-lf-muted/70 block">
                {currentIndex + 1} / {totalInCategory}
              </span>
            </div>
            <div className="w-6" />
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-lf-muted/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-lf-primary to-lf-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / totalInCategory) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      {/* Exercise content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise?.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderExercise()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
