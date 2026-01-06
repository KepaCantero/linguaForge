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
import { ShardDetectionExercise } from '@/components/exercises/ShardDetectionExercise';
import { EchoStreamExercise } from '@/components/exercises/EchoStreamExercise';
import { GlyphWeavingExercise } from '@/components/exercises/GlyphWeavingExercise';
import { ResonancePathExercise } from '@/components/exercises/ResonancePathExercise';
import { ConversationalEchoExercise } from '@/components/exercises/ConversationalEchoExercise';
import { DialogueIntonationExercise } from '@/components/exercises/DialogueIntonationExercise';
import { JanusComposerExercise } from '@/components/exercises/JanusComposerExercise';
import { ShadowingExercise } from '@/components/exercises/ShadowingExercise';

import type {
  LessonContent,
  Phrase,
  Vocabulary,
  PragmaStrike,
  ShardDetection,
  EchoStream,
  GlyphWeaving,
  ResonancePath,
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

  // Determinar tipo de warmup según ejercicios disponibles
  // Nota: shadowing incluye resonancePath y dialogueIntonation (son lo mismo)
  // Nota: vocabulary incluye shardDetection (son lo mismo)
  const warmupMissionType: MissionType = useMemo(() => {
    if (!categories.length) return 'mixed';

    // Contar tipos de ejercicios
    const hasVocab = categories.some(c =>
      ['vocabulary', 'shardDetection'].includes(c.id)
    );
    const hasGrammar = categories.some(c =>
      ['cloze', 'janusComposer', 'glyphWeaving'].includes(c.id)
    );
    const hasPronunciation = categories.some(c =>
      ['shadowing', 'echoStream'].includes(c.id)
    );

    if (hasPronunciation && !hasVocab && !hasGrammar) return 'pronunciation';
    if (hasVocab && !hasGrammar && !hasPronunciation) return 'vocabulary';
    if (hasGrammar && !hasVocab && !hasPronunciation) return 'grammar';
    return 'mixed';
  }, [categories]);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando lección...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !lessonContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No se pudo cargar la lección
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Exercise Menu (no category selected)
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

        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <span className="text-xl">←</span>
            </button>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                {leaf?.title || lessonContent.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {totalExercises} ejercicios disponibles
              </p>
            </div>
          </div>
        </header>

        {/* Exercise Menu */}
        <main className="max-w-lg mx-auto px-4 pt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Menú de Ejercicios
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Elige el tipo de ejercicio que quieres practicar
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500 dark:text-gray-400">
                No hay ejercicios disponibles en esta lección
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Tarjeta de Calentamiento */}
              <motion.button
                onClick={handleStartWarmup}
                className={`w-full rounded-xl p-4 text-left border-2 transition-all ${
                  warmupCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                    : 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-300 dark:border-indigo-600 hover:border-indigo-400 dark:hover:border-indigo-500'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{warmupCompleted ? '✅' : '🧠'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Calentamiento Cerebral
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {warmupCompleted
                          ? '¡Cerebro listo para aprender!'
                          : 'Activa tu cerebro antes de practicar'}
                      </p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                        ~30-60 segundos
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xl">
                    {warmupCompleted ? '🔄' : '→'}
                  </span>
                </div>
              </motion.button>

              {/* Separador */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400 dark:text-gray-500">EJERCICIOS</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  onClick={() => handleSelectCategory(category.id)}
                  className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 text-left border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{category.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {category.description}
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                          {category.items.length} ejercicio{category.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xl">→</span>
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

  // Render Exercise
  const renderExercise = () => {
    if (!currentExercise) return null;

    switch (currentExercise.type) {
      case 'cloze':
        return (
          <ClozeExercise
            phrase={currentExercise.data as Phrase}
            onComplete={handleExerciseComplete}
          />
        );
      case 'vocabulary':
        return (
          <VocabularyExercise
            exercise={currentExercise.data as Vocabulary}
            onComplete={handleExerciseComplete}
          />
        );
      case 'variations':
        return (
          <VariationsExercise
            phrase={currentExercise.data as Phrase}
            onComplete={() => handleExerciseComplete(true)}
          />
        );
      case 'pragmaStrike':
        return (
          <PragmaStrikeExercise
            exercise={currentExercise.data as PragmaStrike}
            onComplete={handleExerciseComplete}
          />
        );
      case 'shardDetection':
        return (
          <ShardDetectionExercise
            exercise={currentExercise.data as ShardDetection}
            onComplete={handleExerciseComplete}
          />
        );
      case 'echoStream':
        return (
          <EchoStreamExercise
            exercise={currentExercise.data as EchoStream}
            onComplete={() => handleExerciseComplete(true)}
          />
        );
      case 'glyphWeaving':
        return (
          <GlyphWeavingExercise
            exercise={currentExercise.data as GlyphWeaving}
            onComplete={() => handleExerciseComplete(true)}
          />
        );
      case 'resonancePath':
        return (
          <ResonancePathExercise
            exercise={currentExercise.data as ResonancePath}
            onComplete={() => handleExerciseComplete(true)}
          />
        );
      case 'conversationalEcho':
        return (
          <ConversationalEchoExercise
            exercise={currentExercise.data as ConversationalEcho}
            onComplete={() => handleExerciseComplete(true)}
            showHints={true}
          />
        );
      case 'dialogueIntonation':
        return (
          <DialogueIntonationExercise
            exercise={currentExercise.data as DialogueIntonation}
            onComplete={() => handleExerciseComplete(true)}
          />
        );
      case 'janusComposer':
        return (
          <JanusComposerExercise
            exercise={currentExercise.data as JanusComposer}
            onComplete={() => handleExerciseComplete(true)}
          />
        );
      case 'shadowing':
        return (
          <ShadowingExercise
            phrase={currentExercise.data as Phrase}
            onComplete={() => handleExerciseComplete(true)}
          />
        );
      default:
        return (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl">
            <p className="text-gray-500">Tipo no soportado: {currentExercise.type}</p>
            <button
              onClick={() => handleExerciseComplete(true)}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Continuar
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ←
            </button>
            <div className="text-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {currentCategory?.icon} {currentCategory?.title}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">
                {currentIndex + 1} / {totalInCategory}
              </span>
            </div>
            <div className="w-6" />
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
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
