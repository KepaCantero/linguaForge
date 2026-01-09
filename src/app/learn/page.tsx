'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { useNodeProgressStore } from '@/store/useNodeProgressStore';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { getTranslations } from '@/i18n';
import { InfiniteCourseMap } from '@/components/learn/InfiniteCourseMap';

export default function LearnPage() {
  const router = useRouter();
  const { appLanguage, mode, hasCompletedOnboarding } = useUserStore();
  const { nodes, initGuidedNodes } = useNodeProgressStore();
  const t = getTranslations(appLanguage);

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.push('/onboarding');
    }
  }, [hasCompletedOnboarding, router]);

  useEffect(() => {
    if (hasCompletedOnboarding) {
      initGuidedNodes(['node-1', 'node-2', 'node-3', 'node-4', 'node-5']);
    }
  }, [hasCompletedOnboarding, initGuidedNodes]);

  if (!hasCompletedOnboarding) return null;

  const progress = [
    { nodeId: 'node-1', completed: nodes['node-1']?.percentage ?? 0, isLocked: false },
    { nodeId: 'node-2', completed: nodes['node-2']?.percentage ?? 0, isLocked: false },
    { nodeId: 'node-3', completed: nodes['node-3']?.percentage ?? 0, isLocked: false },
    { nodeId: 'node-4', completed: nodes['node-4']?.percentage ?? 0, isLocked: false },
    { nodeId: 'node-5', completed: nodes['node-5']?.percentage ?? 0, isLocked: false },
  ];

  return (
    <AnimatePresence mode="wait">
      {mode === 'guided' ? (
        <InfiniteCourseMap key="infinite" translations={t} userProgress={nodes} />
      ) : (
        <AutonomousView key="autonomous" translations={t} />
      )}
    </AnimatePresence>
  );
}

function AutonomousView({ translations: t }: { translations: ReturnType<typeof getTranslations> }) {
  const router = useRouter();
  const { nodes, deleteNode } = useImportedNodesStore();
  const hasNodes = nodes.length > 0;

  const handleNodeClick = (nodeId: string) => {
    router.push(`/learn/imported/${nodeId}`);
  };

  const handleDeleteNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este nodo?')) {
      deleteNode(nodeId);
    }
  };

  return (
    <div className="relative">
      {/* Floating Import Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
        className="fixed top-20 right-4 z-50"
      >
        <Link href="/import">
          <motion.div
            className="relative w-20 h-20 rounded-full cursor-pointer"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Outer rotating ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #6366F1, #C026D3, #FDE047, #6366F1)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            {/* Inner glow ring */}
            <motion.div
              className="absolute inset-1 rounded-full bg-lf-dark"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(99, 102, 241, 0.5)',
                  '0 0 40px rgba(192, 38, 211, 0.5)',
                  '0 0 20px rgba(99, 102, 241, 0.5)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                className="text-4xl"
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              >
                ✨
              </motion.span>
            </div>

            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-lf-primary to-lf-secondary opacity-0"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </Link>
      </motion.div>

      {!hasNodes ? (
        <EmptyState translations={t} />
      ) : (
        <NodeOrbitSystem nodes={nodes} onNodeClick={handleNodeClick} onDeleteNode={handleDeleteNode} />
      )}
    </div>
  );
}

// NEW: Orbital node system instead of cards
interface NodeOrbitSystemProps {
  nodes: Array<{
    id: string;
    title: string;
    icon: string;
    sourceType: 'podcast' | 'article' | 'youtube';
    subtopics: Array<{ id: string; title: string }>;
    completedSubtopics: string[];
    percentage: number;
  }>;
  onNodeClick: (nodeId: string) => void;
  onDeleteNode: (e: React.MouseEvent, nodeId: string) => void;
}

function NodeOrbitSystem({ nodes, onNodeClick, onDeleteNode }: NodeOrbitSystemProps) {
  return (
    <div className="relative w-full h-[70vh] flex items-center justify-center">
      {/* Central core */}
      <motion.div
        className="absolute w-32 h-32 rounded-full z-10 cursor-pointer"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        whileHover={{ scale: 1.1 }}
      >
        {/* Core glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8), transparent)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Orbital rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-lf-primary/30"
            animate={{
              scale: [1 + i * 0.3, 1 + i * 0.3 + 0.1, 1 + i * 0.3],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        {/* Core icon */}
        <div className="absolute inset-0 flex items-center justify-center text-5xl">
          ⬡
        </div>
      </motion.div>

      {/* Orbital nodes */}
      {nodes.map((node, index) => {
        const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 140 + (index % 3) * 30;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={node.id}
            className="absolute cursor-pointer group"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: x - 60,
              marginTop: y - 60,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.15,
              type: 'spring',
              stiffness: 150,
            }}
            whileHover={{ scale: 1.15 }}
            onClick={() => onNodeClick(node.id)}
          >
            {/* Node orb */}
            <motion.div
              className="relative w-28 h-28 rounded-full"
              style={{
                background: node.percentage === 100
                  ? 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)'
                  : 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
              }}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full blur-md"
                style={{
                  background: node.percentage === 100
                    ? 'radial-gradient(circle, rgba(34, 197, 94, 0.6), transparent)'
                    : 'radial-gradient(circle, rgba(99, 102, 241, 0.6), transparent)',
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              />

              {/* Progress ring */}
              <svg className="absolute inset-0 rotate-[-90deg]" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke={node.percentage === 100 ? '#22C55E' : '#FDE047'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: node.percentage / 100 }}
                  transition={{ duration: 1.5, delay: index * 0.2 }}
                  style={{
                    strokeDasharray: '289.03',
                    strokeDashoffset: '0',
                  }}
                />
              </svg>

              {/* Icon */}
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                {node.icon}
              </div>

              {/* Percentage label */}
              <motion.div
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-bold text-white"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                {node.percentage}%
              </motion.div>
            </motion.div>

            {/* Hover tooltip */}
            <motion.div
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 px-4 py-2 rounded-xl bg-lf-dark/90 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
              initial={{ y: 10, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
            >
              <p className="text-sm font-semibold text-white">{node.title}</p>
              <p className="text-xs text-lf-muted">
                {node.completedSubtopics.length}/{node.subtopics.length} subtemas
              </p>
            </motion.div>

            {/* Delete button on hover */}
            <motion.button
              onClick={(e) => onDeleteNode(e, node.id)}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </motion.div>
        );
      })}

      {/* Connection lines */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {nodes.map((node, index) => {
          const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 140 + (index % 3) * 30;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.line
              key={`line-${node.id}`}
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${x}px)`}
              y2={`calc(50% + ${y}px)`}
              stroke="url(#gradient-line)"
              strokeWidth="1"
              strokeOpacity="0.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          );
        })}
        <defs>
          <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#C026D3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Empty state with celestial theme
function EmptyState({ translations: t }: { translations: ReturnType<typeof getTranslations> }) {
  return (
    <div className="relative w-full h-[70vh] flex items-center justify-center">
      {/* Pulsing core */}
      <motion.div
        className="relative w-40 h-40 rounded-full cursor-pointer"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #6366F1, #4F46E5)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        onClick={() => {/* Navigate to import */}}
      >
        {/* Expanding rings */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-lf-primary/40"
            animate={{
              scale: [1, 2.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Core glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8), transparent)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <motion.span
            className="text-5xl mb-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            🌌
          </motion.span>
          <p className="text-sm font-bold text-white">Vacío</p>
        </div>
      </motion.div>

      {/* Floating particles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-lf-accent opacity-60"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 2) * 40}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, (i % 2 === 0 ? 20 : -20), 0],
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}
