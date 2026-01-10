'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function ImportedNodePage() {
  const params = useParams();
  const nodeId = params.nodeId as string;
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const { nodes } = useImportedNodesStore();
  const node = nodes.find((n) => n.id === nodeId);

  // Estado para evitar hidratación mismatch
  const [isMounted, setIsMounted] = useState(false);

  // Al montar en el cliente, si hay subtemas, ir directamente al primero
  // NOTA: Este hook debe estar antes de cualquier retorno condicional
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirigir al primer subtema si existe
  useEffect(() => {
    if (isMounted && node && node.subtopics.length > 0) {
      const firstSubtopic = node.subtopics[0];
      router.push(`/learn/imported/${nodeId}/exercises?subtopic=${firstSubtopic.id}&mode=academia`);
    }
  }, [isMounted, node, nodeId, router]);

  if (!node) {
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
            Nodo no encontrado
          </p>
          <Link
            href="/learn"
            className="inline-block px-6 py-3 rounded-aaa-xl font-bold text-white focus:outline-none focus:ring-4 focus:ring-lf-accent focus:ring-offset-2 focus:ring-offset-lf-dark"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            Volver al mapa
          </Link>
        </div>
      </div>
    );
  }

  const handleSubtopicClick = (subtopicId: string) => {
    router.push(`/learn/imported/${nodeId}/exercises?subtopic=${subtopicId}&mode=academia`);
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
            href="/learn"
            className="flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus:ring-4 focus:ring-lf-accent focus:ring-offset-2 focus:ring-offset-lf-dark"
            style={{
              minWidth: '48px',
              minHeight: '48px',
            }}
            aria-label="Volver al mapa de aprendizaje"
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
                background: node.percentage === 100
                  ? 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)'
                  : 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
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
                {node.title}
              </h1>
              <p className="text-xs text-lf-muted">
                {node.percentage}% completado
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative border-b border-white/10 backdrop-blur-md">
        <div className="h-2 bg-white/10">
          <motion.div
            className="h-full"
            style={{
              background: 'linear-gradient(to right, #6366F1, #C026D3)',
              willChange: shouldAnimate ? 'width' : 'auto',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${node.percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="relative max-w-lg mx-auto px-4 pt-6">
        {/* Info del contenido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="flex items-center gap-2 text-sm text-lf-muted mb-2">
            {node.sourceType === 'podcast' && (
              <>
                <span>🎙️</span>
                <span>Podcast</span>
              </>
            )}
            {node.sourceType === 'article' && (
              <>
                <span>📰</span>
                <span>Artículo</span>
              </>
            )}
            {node.sourceType === 'youtube' && (
              <>
                <span>🎬</span>
                <span>Video</span>
              </>
            )}
            <span>•</span>
            <span>{node.subtopics.reduce((acc, s) => acc + s.phrases.length, 0)} frases</span>
          </div>
          <p
            className="text-sm text-gray-300 line-clamp-3"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            {node.sourceText.substring(0, 200)}...
          </p>
        </motion.div>

        {/* Lista de subtópicos */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-white mb-4"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
        >
          Subtemas ({node.completedSubtopics.length}/{node.subtopics.length})
        </motion.h2>

        <div className="space-y-4">
          {node.subtopics.map((subtopic, index) => {
            const isCompleted = node.completedSubtopics.includes(subtopic.id);
            const angle = (index / node.subtopics.length) * Math.PI * 2 - Math.PI / 2;

            return (
              <motion.div
                key={subtopic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSubtopicClick(subtopic.id)}
                className="relative cursor-pointer group focus:outline-none focus:ring-4 focus:ring-lf-accent focus:ring-offset-2 focus:ring-offset-lf-dark rounded-2xl"
                style={{ willChange: shouldAnimate ? 'transform' : 'auto' }}
                whileHover={shouldAnimate ? { scale: 1.02 } : {}}
                whileTap={shouldAnimate ? { scale: 0.98 } : {}}
                tabIndex={0}
                role="button"
                aria-label={`${subtopic.title}: ${subtopic.phrases.length} frases. ${isCompleted ? 'Completado' : 'Pendiente'}`}
              >
                {/* Orb background */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-50 blur-xl"
                  style={{
                    background: isCompleted
                      ? 'radial-gradient(circle, rgba(34, 197, 94, 0.4), transparent)'
                      : 'radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent)',
                  }}
                />

                {/* Card content */}
                <div
                  className="relative backdrop-blur-md rounded-2xl p-4 border-2 transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: isCompleted
                      ? 'rgba(34, 197, 94, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Progress orb */}
                    <motion.div
                      className="relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                      style={{
                        background: isCompleted
                          ? 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)'
                          : 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
                        willChange: shouldAnimate ? 'transform' : 'auto',
                      }}
                      animate={shouldAnimate ? {
                        scale: [1, 1.05, 1],
                      } : {}}
                      transition={{
                        duration: 2 + index * 0.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-bold truncate ${
                          isCompleted
                            ? 'text-green-400'
                            : 'text-white'
                        }`}
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                      >
                        {subtopic.title}
                      </h3>
                      <p className="text-sm text-lf-muted">
                        {subtopic.phrases.length} frases
                      </p>
                    </div>

                    <motion.span
                      className="text-2xl flex-shrink-0"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                      animate={shouldAnimate ? {
                        x: [0, 4, 0],
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.1,
                      }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Si no hay subtópicos */}
        {node.subtopics.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent)',
                }}
                animate={shouldAnimate ? {
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <span className="relative text-4xl">📭</span>
            </div>
            <p
              className="text-lf-muted"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              No hay subtemas en este nodo
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
