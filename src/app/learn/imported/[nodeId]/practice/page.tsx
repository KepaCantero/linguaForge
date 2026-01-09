'use client';

import { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type LessonMode = 'academia' | 'desafio';

function PracticeModeSelection() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nodeId = params.nodeId as string;
  const subtopicId = searchParams.get('subtopic');
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const { nodes } = useImportedNodesStore();
  const node = nodes.find((n) => n.id === nodeId);
  const subtopic = node?.subtopics.find((s) => s.id === subtopicId);

  if (!node || !subtopic) {
    return (
      <div className="relative min-h-screen bg-lf-dark flex items-center justify-center">
        {/* Animated background */}
        {shouldAnimate && (
          <motion.div
            className="absolute inset-0 opacity-20"
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

        <div className="relative text-center p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative w-32 h-32 mx-auto mb-6 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #EF4444, #DC2626)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              404
            </div>
          </motion.div>
          <p
            className="text-lg mb-4"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
          >
            Subtema no encontrado
          </p>
          <Link
            href={`/learn/imported/${nodeId}`}
            className="inline-block px-6 py-3 rounded-aaa-xl font-bold text-white focus:outline-none focus:ring-4 focus:ring-lf-accent focus:ring-offset-2 focus:ring-offset-lf-dark"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            Volver al nodo
          </Link>
        </div>
      </div>
    );
  }

  const handleModeSelect = (mode: LessonMode) => {
    router.push(`/learn/imported/${nodeId}/exercises?subtopic=${subtopicId}&mode=${mode}`);
  };

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
          <Link
            href={`/learn/imported/${nodeId}`}
            className="flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus:ring-4 focus:ring-lf-accent focus:ring-offset-2 focus:ring-offset-lf-dark"
            style={{
              minWidth: '48px',
              minHeight: '48px',
            }}
            aria-label="Volver al nodo"
          >
            <motion.span
              className="text-2xl"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              whileHover={shouldAnimate ? { x: -4 } : {}}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              ←
            </motion.span>
          </Link>
          <div className="flex-1 flex items-center gap-3">
            <motion.div
              className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
                willChange: shouldAnimate ? 'transform' : 'auto',
              }}
              animate={shouldAnimate ? {
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              } : {}}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {node.icon}
            </motion.div>
            <div>
              <h1
                className="font-bold text-white line-clamp-1"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
              >
                {subtopic.title}
              </h1>
              <p className="text-xs text-lf-muted">
                {subtopic.phrases.length} frases
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative max-w-lg mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl font-bold text-white mb-3"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
          >
            Elige tu modo de práctica
          </h2>
          <p
            className="text-lf-muted"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            Selecciona cómo quieres practicar estas frases
          </p>
        </motion.div>

        {/* Mode selection */}
        <div className="space-y-6">
          {/* Academia Mode */}
          <motion.button
            onClick={() => handleModeSelect('academia')}
            className="relative w-full focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-lf-dark rounded-2xl"
            style={{ willChange: shouldAnimate ? 'transform' : 'auto' }}
            whileHover={shouldAnimate ? { scale: 1.02 } : {}}
            whileTap={shouldAnimate ? { scale: 0.98 } : {}}
            aria-label="Modo Academia: Entrenamiento sin límite de tiempo, con pistas y explicaciones, reintentos ilimitados. XP 1.0x. Recomendado para aprendizaje."
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl blur-xl"
              style={{
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4), transparent)',
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
                background: 'rgba(34, 197, 94, 0.1)',
                borderColor: 'rgba(34, 197, 94, 0.3)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)',
                      willChange: shouldAnimate ? 'transform' : 'auto',
                    }}
                    animate={shouldAnimate ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    } : {}}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    📚
                  </motion.div>
                  <div>
                    <h3
                      className="text-xl font-bold text-green-400"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                    >
                      Academia
                    </h3>
                    <p className="text-sm text-lf-muted">
                      Modo de entrenamiento
                    </p>
                  </div>
                </div>
                <span
                  className="px-3 py-1 text-xs font-bold rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  Recomendado
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { icon: '✓', text: 'Sin límite de tiempo' },
                  { icon: '✓', text: 'Con pistas y explicaciones' },
                  { icon: '✓', text: 'Reintentos ilimitados' },
                  { icon: '⭐', text: 'XP 1.0x' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 text-sm text-gray-300"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <span className="text-green-400">{feature.icon}</span>
                    <span>{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.button>

          {/* Desafío Mode */}
          <motion.button
            onClick={() => handleModeSelect('desafio')}
            className="relative w-full focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-lf-dark rounded-2xl"
            style={{ willChange: shouldAnimate ? 'transform' : 'auto' }}
            whileHover={shouldAnimate ? { scale: 1.02 } : {}}
            whileTap={shouldAnimate ? { scale: 0.98 } : {}}
            aria-label="Modo Desafío: Competitivo con límite de tiempo de 15 minutos, sin pistas ni explicaciones, sin reintentos. XP 1.5x + Gemas. Difícil."
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl blur-xl"
              style={{
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4), transparent)',
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
                background: 'rgba(168, 85, 247, 0.1)',
                borderColor: 'rgba(168, 85, 247, 0.3)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #A855F7, #9333EA)',
                      willChange: shouldAnimate ? 'transform' : 'auto',
                    }}
                    animate={shouldAnimate ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    } : {}}
                    transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                  >
                    ⚡
                  </motion.div>
                  <div>
                    <h3
                      className="text-xl font-bold text-purple-400"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                    >
                      Desafío
                    </h3>
                    <p className="text-sm text-lf-muted">
                      Modo competitivo
                    </p>
                  </div>
                </div>
                <span
                  className="px-3 py-1 text-xs font-bold rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #A855F7, #9333EA)',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  Difícil
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { icon: '⏱️', text: 'Límite de tiempo: 15 minutos' },
                  { icon: '🚫', text: 'Sin pistas ni explicaciones' },
                  { icon: '🚫', text: 'Sin reintentos' },
                  { icon: '💎', text: 'XP 1.5x + Gemas' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 text-sm text-gray-300"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <span className="text-purple-400">{feature.icon}</span>
                    <span>{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.button>
        </div>
      </main>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen bg-lf-dark flex items-center justify-center">
          {typeof window !== 'undefined' && (
            <motion.div
              className="absolute inset-0 opacity-20"
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
          <motion.div
            className="relative w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
              border: '4px solid transparent',
              borderTopColor: '#FDE047',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      }
    >
      <PracticeModeSelection />
    </Suspense>
  );
}
