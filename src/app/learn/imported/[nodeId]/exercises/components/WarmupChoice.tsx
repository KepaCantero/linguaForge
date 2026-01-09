'use client';

import { motion } from 'framer-motion';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
type WarmupType = 'rhythm' | 'visual' | null;

interface WarmupChoiceProps {
  subtopicId: string | null;
  nodeId: string;
  onSelectWarmup: (warmup: WarmupType) => void;
  onSkipWarmup: () => void;
}

export function WarmupChoice({ subtopicId, nodeId, onSelectWarmup, onSkipWarmup }: WarmupChoiceProps) {
  const { nodes } = useImportedNodesStore();
  const node = nodes.find((n) => n.id === nodeId);
  const subtopic = node?.subtopics.find((s) => s.id === subtopicId);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

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
          <motion.button
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus:ring-4 focus:ring-lf-accent focus:ring-offset-2 focus:ring-offset-lf-dark"
            style={{
              minWidth: '48px',
              minHeight: '48px',
              willChange: shouldAnimate ? 'transform' : 'auto',
            }}
            whileHover={shouldAnimate ? { x: -4 } : {}}
            whileTap={shouldAnimate ? { scale: 0.95 } : {}}
            aria-label="Volver atrás"
          >
            <motion.span
              className="text-2xl"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              ←
            </motion.span>
          </motion.button>
          <div className="flex-1">
            <h1
              className="font-bold text-white line-clamp-1"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
            >
              {subtopic?.title}
            </h1>
            <p className="text-xs text-lf-muted">
              Calentamiento mental (opcional)
            </p>
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
          <h2
            className="text-3xl font-bold text-white mb-3"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
          >
            ¿Quieres calentar tu cerebro?
          </h2>
          <p
            className="text-lf-muted"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            Prepara tu mente con un ejercicio rápido antes de comenzar
          </p>
        </motion.div>

        <div className="space-y-4">
          {/* Ritmo y Memoria */}
          <motion.button
            onClick={() => onSelectWarmup('rhythm')}
            className="relative w-full focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-lf-dark rounded-2xl"
            style={{ willChange: shouldAnimate ? 'transform' : 'auto' }}
            whileHover={shouldAnimate ? { scale: 1.02 } : {}}
            whileTap={shouldAnimate ? { scale: 0.98 } : {}}
            aria-label="Ritmo y Memoria: Repite secuencias rítmicas. Duración: 1-2 minutos. Mejora atención auditiva."
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl blur-xl"
              style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent)',
              }}
              animate={shouldAnimate ? {
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Card content */}
            <div
              className="relative backdrop-blur-md rounded-2xl p-6 border-2 text-left"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
              }}
            >
              <div className="flex items-center gap-4 mb-3">
                <motion.div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
                    willChange: shouldAnimate ? 'transform' : 'auto',
                  }}
                  animate={shouldAnimate ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  } : {}}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  🎵
                </motion.div>
                <div>
                  <h3
                    className="text-lg font-bold text-white"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    Ritmo y Memoria
                  </h3>
                  <p className="text-sm text-lf-muted">
                    Repite secuencias rítmicas
                  </p>
                </div>
              </div>
              <div className="pl-[72px] text-sm text-lf-muted">
                ⏱️ 1-2 minutos • 🧠 Mejora atención auditiva
              </div>
            </div>
          </motion.button>

          {/* Asociación Visual */}
          <motion.button
            onClick={() => onSelectWarmup('visual')}
            className="relative w-full focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-lf-dark rounded-2xl"
            style={{ willChange: shouldAnimate ? 'transform' : 'auto' }}
            whileHover={shouldAnimate ? { scale: 1.02 } : {}}
            whileTap={shouldAnimate ? { scale: 0.98 } : {}}
            aria-label="Asociación Visual: Encuentra las parejas. Duración: 1-2 minutos. Activa visión espacial."
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl blur-xl"
              style={{
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4), transparent)',
              }}
              animate={shouldAnimate ? {
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              } : {}}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            />

            {/* Card content */}
            <div
              className="relative backdrop-blur-md rounded-2xl p-6 border-2 text-left"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(236, 72, 153, 0.3)',
              }}
            >
              <div className="flex items-center gap-4 mb-3">
                <motion.div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #EC4899, #DB2777)',
                    willChange: shouldAnimate ? 'transform' : 'auto',
                  }}
                  animate={shouldAnimate ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  } : {}}
                  transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                >
                  🎯
                </motion.div>
                <div>
                  <h3
                    className="text-lg font-bold text-white"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    Asociación Visual
                  </h3>
                  <p className="text-sm text-lf-muted">
                    Encuentra las parejas
                  </p>
                </div>
              </div>
              <div className="pl-[72px] text-sm text-lf-muted">
                ⏱️ 1-2 minutos • 👁️ Activa visión espacial
              </div>
            </div>
          </motion.button>

          {/* Saltar warmup */}
          <motion.button
            onClick={onSkipWarmup}
            className="relative w-full focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-lf-dark rounded-2xl"
            style={{ willChange: shouldAnimate ? 'transform' : 'auto' }}
            whileHover={shouldAnimate ? { scale: 1.02 } : {}}
            whileTap={shouldAnimate ? { scale: 0.98 } : {}}
            aria-label="Saltar al menú de ejercicios"
          >
            <div
              className="relative backdrop-blur-md rounded-2xl p-6 border-2 text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <motion.span
                  className="text-2xl"
                  animate={shouldAnimate ? {
                    x: [0, 4, 0],
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  ▶️
                </motion.span>
                <span
                  className="font-bold text-gray-300"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                >
                  Saltar al menú de ejercicios
                </span>
              </div>
            </div>
          </motion.button>
        </div>
      </main>
    </div>
  );
}