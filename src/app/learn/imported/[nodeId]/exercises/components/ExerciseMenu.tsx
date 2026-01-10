'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { LessonMode, ExerciseType } from '../page';
import type { Phrase, ConversationalEcho, DialogueIntonation, JanusComposer } from '@/types';

// Los tipos son en realidad arrays de objetos específicos de cada ejercicio
type ClozeData = Phrase[];
type EchoData = ConversationalEcho[];
type IntonationData = DialogueIntonation[];
type JanusData = JanusComposer[];
type VariationsData = Phrase[];

interface ExerciseMenuProps {
  nodeId: string;
  subtopicId: string | null;
  mode: LessonMode;
  onModeChange: (mode: LessonMode) => void;
  exerciseData: {
    cloze: ClozeData;
    variations: VariationsData;
    conversationalEcho: EchoData;
    dialogueIntonation: IntonationData;
    janusComposer: JanusData;
  };
  onSelectExercise: (type: ExerciseType) => void;
}

export function ExerciseMenu({
  nodeId,
  subtopicId,
  mode,
  onModeChange,
  exerciseData,
  onSelectExercise
}: ExerciseMenuProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const totalExercises =
    (exerciseData.cloze?.length || 0) +
    (exerciseData.variations?.length || 0) +
    (exerciseData.conversationalEcho?.length || 0) +
    (exerciseData.dialogueIntonation?.length || 0) +
    (exerciseData.janusComposer?.length || 0);

  const exercises = [
    {
      type: 'cloze',
      icon: '✏️',
      title: 'Cloze',
      description: 'Rellena los espacios vacíos',
      length: exerciseData.cloze?.length || 0,
      color: '#6366F1',
      gradient: 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
    },
    {
      type: 'variations',
      icon: '🔄',
      title: 'Variations',
      description: 'Encuentra las variaciones correctas',
      length: exerciseData.variations?.length || 0,
      color: '#EC4899',
      gradient: 'radial-gradient(circle at 30% 30%, #EC4899, #DB2777)',
    },
    {
      type: 'conversationalEcho',
      icon: '💬',
      title: 'Echo Conversacional',
      description: 'Repete y responde en conversaciones',
      length: exerciseData.conversationalEcho?.length || 0,
      color: '#10B981',
      gradient: 'radial-gradient(circle at 30% 30%, #10B981, #059669)',
    },
    {
      type: 'dialogueIntonation',
      icon: '🎤',
      title: 'Entonación de Diálogo',
      description: 'Practica la entonación en diálogos',
      length: exerciseData.dialogueIntonation?.length || 0,
      color: '#F59E0B',
      gradient: 'radial-gradient(circle at 30% 30%, #F59E0B, #D97706)',
    },
    {
      type: 'janusComposer',
      icon: '🧩',
      title: 'Matriz Janus',
      description: 'Combina palabras en estructuras',
      length: exerciseData.janusComposer?.length || 0,
      color: '#8B5CF6',
      gradient: 'radial-gradient(circle at 30% 30%, #8B5CF6, #7C3AED)',
    }
  ].filter(ex => ex.length > 0);

  return (
    <div className="relative min-h-screen bg-lf-dark pb-20">
      {/* Animated background */}
      {shouldAnimate && (
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, #6366F1 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, #C026D3 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, #6366F1 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-md">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push(`/learn/imported/${nodeId}`)}
            className="flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus:ring-4 focus:ring-lf-accent focus:ring-offset-2 focus:ring-offset-lf-dark"
            style={{
              minWidth: '48px',
              minHeight: '48px',
            }}
            aria-label="Volver al nodo"
          >
            <motion.span
              className="text-2xl"
              whileHover={shouldAnimate ? { x: -4 } : {}}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              ←
            </motion.span>
          </button>
          <div className="flex-1 flex items-center gap-3">
            <div>
              <h1 className="font-bold text-white line-clamp-1">
                Ejercicios
              </h1>
              <p className="text-xs text-lf-muted">
                {totalExercises} disponibles
              </p>
            </div>
          </div>

          {/* Mode toggle buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onModeChange('academia')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                mode === 'academia'
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-lf-dark/30 border border-white/10 text-lf-muted hover:text-white hover:bg-lf-dark/50'
              }`}
              whileHover={shouldAnimate ? { scale: 1.05 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
              aria-label="Modo Academia: Entrenamiento sin límite de tiempo"
            >
              <span>📚</span>
              <span className="hidden sm:inline">Academia</span>
            </motion.button>
            <motion.button
              onClick={() => onModeChange('desafio')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                mode === 'desafio'
                  ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                  : 'bg-lf-dark/30 border border-white/10 text-lf-muted hover:text-white hover:bg-lf-dark/50'
              }`}
              whileHover={shouldAnimate ? { scale: 1.05 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
              aria-label="Modo Desafío: Competitivo con límite de tiempo"
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Desafío</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative max-w-lg mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            ¡Elige tu ejercicio!
          </h2>
          <p className="text-lf-muted">
            Practica de diferentes formas
          </p>
        </motion.div>

        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <motion.button
              key={exercise.type}
              onClick={() => onSelectExercise(exercise.type as ExerciseType)}
              className={`relative w-full focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-lf-dark rounded-2xl`}
              style={{
                willChange: shouldAnimate ? 'transform' : 'auto',
              }}
              whileHover={shouldAnimate ? { scale: 1.02 } : {}}
              whileTap={shouldAnimate ? { scale: 0.98 } : {}}
              aria-label={`${exercise.title}: ${exercise.description}. ${exercise.length} ejercicios disponibles.`}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl blur-xl"
                style={{
                  background: `radial-gradient(circle, ${exercise.color}66, transparent)`,
                }}
                animate={shouldAnimate ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                } : {}}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              />

              {/* Card content */}
              <div
                className="relative backdrop-blur-md rounded-2xl p-4 border-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: `${exercise.color}4D`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                      style={{
                        background: exercise.gradient,
                        willChange: shouldAnimate ? 'transform' : 'auto',
                      }}
                      animate={shouldAnimate ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      } : {}}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.5,
                      }}
                    >
                      {exercise.icon}
                    </motion.div>
                    <div>
                      <h3
                        className="font-bold text-white"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                      >
                        {exercise.title}
                      </h3>
                      <p className="text-sm text-lf-muted">
                        {exercise.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {exercise.length} ejercicios
                      </p>
                    </div>
                  </div>
                  <motion.span
                    className="text-2xl"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                    animate={shouldAnimate ? {
                      x: [0, 4, 0],
                    } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.2,
                    }}
                  >
                    →
                  </motion.span>
                </div>
              </div>
            </motion.button>
          ))}

          {/* Mode switch section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 pt-6 border-t border-white/10"
          >
            <h3 className="text-lg font-bold text-white mb-4 text-center">
              Cambiar modo de práctica
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Switch to opposite mode card */}
              <motion.button
                onClick={() => onModeChange(mode === 'academia' ? 'desafio' : 'academia')}
                className={`relative overflow-hidden rounded-2xl p-4 border-2 text-left transition-all ${
                  mode === 'academia'
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : 'bg-green-500/10 border-green-500/30'
                }`}
                whileHover={shouldAnimate ? { scale: 1.02 } : {}}
                whileTap={shouldAnimate ? { scale: 0.98 } : {}}
                aria-label={`Cambiar a ${mode === 'academia' ? 'Desafío' : 'Academia'}`}
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl blur-xl"
                  style={{
                    background: mode === 'academia'
                      ? 'radial-gradient(circle, rgba(168, 85, 247, 0.4), transparent)'
                      : 'radial-gradient(circle, rgba(34, 197, 94, 0.4), transparent)',
                  }}
                  animate={shouldAnimate ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="relative">
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                    style={{
                      background: mode === 'academia'
                        ? 'radial-gradient(circle at 30% 30%, #A855F7, #9333EA)'
                        : 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)',
                      willChange: shouldAnimate ? 'transform' : 'auto',
                    }}
                    animate={shouldAnimate ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    } : {}}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    {mode === 'academia' ? '⚡' : '📚'}
                  </motion.div>
                  <h4 className="font-bold text-white text-center mb-1">
                    {mode === 'academia' ? 'Desafío' : 'Academia'}
                  </h4>
                  <p className="text-xs text-lf-muted text-center">
                    {mode === 'academia' ? 'Competitivo • XP 1.5x' : 'Entrenamiento • XP 1.0x'}
                  </p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
