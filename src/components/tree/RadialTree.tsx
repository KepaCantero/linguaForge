'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TreeBranch } from './TreeBranch';
import { BranchModal } from './BranchModal';
import { TreeProgress } from './TreeProgress';
import { useTreeLayout } from './hooks/useTreeLayout';
import { useTreeProgressStore } from '@/store/useTreeProgressStore';
import { SPRING } from '@/lib/motion';
import type { TopicTree, NodeStatus } from '@/types';

interface RadialTreeProps {
  tree: TopicTree;
}

// Floating particle component
function FloatingParticle({ delay, duration, startX, startY }: {
  delay: number;
  duration: number;
  startX: number;
  startY: number;
}) {
  return (
    <motion.circle
      cx={startX}
      cy={startY}
      r={2}
      fill="#FACC15"
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 0.8, 0],
        y: -60,
        x: Math.random() * 40 - 20,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

export function RadialTree({ tree }: RadialTreeProps) {
  const [isMobile, setIsMobile] = useState(true);
  const { config, viewBox, branchPositions, trunkPath, crownPath } = useTreeLayout(isMobile);

  const {
    expandedBranch,
    expandBranch,
    initTreeProgress,
    getLeafStatus,
    getBranchProgress,
    getOverallProgress,
  } = useTreeProgressStore();

  useEffect(() => {
    initTreeProgress(tree.id);
  }, [tree.id, initTreeProgress]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getBranchStatus = (branchIndex: number): NodeStatus => {
    const allCompleted = [0, 1, 2].every(
      leafIndex => getLeafStatus(tree.id, branchIndex, leafIndex) === 'completed'
    );
    if (allCompleted) return 'completed';

    const anyActive = [0, 1, 2].some(
      leafIndex => getLeafStatus(tree.id, branchIndex, leafIndex) === 'active'
    );
    if (anyActive) return 'active';

    return 'locked';
  };

  const selectedBranch = expandedBranch
    ? tree.branches.find(b => b.id === expandedBranch)
    : null;

  const selectedBranchIndex = selectedBranch
    ? tree.branches.findIndex(b => b.id === expandedBranch)
    : -1;

  const progress = getOverallProgress(tree.id);

  // Generate floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: i * 0.8,
      duration: 3 + Math.random() * 2,
      startX: config.trunkX + (Math.random() * 200 - 100),
      startY: config.trunkY - 100 - Math.random() * 200,
    }));
  }, [config]);

  return (
    <div className="flex flex-col items-center">
      {/* Tree title with gradient */}
      <motion.div
        className="text-center mb-2 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-rajdhani text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lf-primary via-lf-secondary to-fuchsia-400">
          Árbol de Tópicos
        </h1>
        <p className="font-atkinson text-sm text-gray-400 mt-1">
          Francés A1 · {progress.completed}/{progress.total} completados
        </p>
      </motion.div>

      {/* SVG Tree */}
      <div className="relative w-full max-w-lg overflow-visible">
        {/* Background gradient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 70%, rgba(126, 34, 206, 0.15) 0%, transparent 70%)`,
          }}
        />

        <motion.svg
          viewBox={viewBox}
          className="w-full h-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Tree crown gradient */}
            <linearGradient id="crown-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7E22CE" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#D946EF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#7E22CE" stopOpacity="0.05" />
            </linearGradient>

            {/* Trunk gradient */}
            <linearGradient id="trunk-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#7E22CE" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>

            {/* Ground gradient */}
            <linearGradient id="ground-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="tree-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Ground ellipse */}
          <motion.ellipse
            cx={config.trunkX}
            cy={config.trunkY + 20}
            rx={config.width * 0.35}
            ry={25}
            fill="url(#ground-gradient)"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />

          {/* Crown background (decorative) */}
          <motion.path
            d={crownPath}
            fill="url(#crown-gradient)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ transformOrigin: `${config.trunkX}px 60px` }}
          />

          {/* Floating particles */}
          {particles.map(p => (
            <FloatingParticle key={p.id} {...p} />
          ))}

          {/* Main trunk */}
          <motion.path
            d={trunkPath}
            stroke="url(#trunk-gradient)"
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
            filter="url(#tree-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          />

          {/* Trunk highlight */}
          <motion.path
            d={trunkPath}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          />

          {/* Branches */}
          {tree.branches.map((branch, index) => {
            const branchPos = branchPositions[index];
            if (!branchPos) return null;

            const status = getBranchStatus(index);
            const branchProgress = getBranchProgress(tree.id, branch.id);

            return (
              <TreeBranch
                key={branch.id}
                branch={branchPos}
                index={index}
                icon={branch.icon}
                color={branch.color}
                status={status}
                progress={branchProgress}
                onClick={() => expandBranch(branch.id)}
              />
            );
          })}

          {/* Root node (at bottom of trunk) */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...SPRING.bouncy, delay: 0.5 }}
          >
            {/* Root glow */}
            <motion.circle
              cx={config.trunkX}
              cy={config.trunkY}
              r={config.trunkRadius + 15}
              fill="none"
              stroke="rgba(126, 34, 206, 0.4)"
              strokeWidth={4}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Root circle */}
            <circle
              cx={config.trunkX}
              cy={config.trunkY}
              r={config.trunkRadius}
              fill="url(#trunk-gradient)"
            />

            {/* Root highlight */}
            <circle
              cx={config.trunkX - 10}
              cy={config.trunkY - 10}
              r={config.trunkRadius * 0.4}
              fill="rgba(255,255,255,0.2)"
            />

            {/* Root border */}
            <circle
              cx={config.trunkX}
              cy={config.trunkY}
              r={config.trunkRadius}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={2}
            />

            {/* Root icon */}
            <text
              x={config.trunkX}
              y={config.trunkY + 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={config.trunkRadius * 0.7}
            >
              🌱
            </text>
          </motion.g>

          {/* Decorative stars */}
          {[
            { x: 50, y: 40, delay: 1 },
            { x: config.width - 60, y: 60, delay: 1.3 },
            { x: 80, y: 120, delay: 1.6 },
            { x: config.width - 40, y: 150, delay: 1.9 },
          ].map((star, i) => (
            <motion.text
              key={i}
              x={star.x}
              y={star.y}
              fontSize={10}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0.3, 0.8, 0.3], scale: 1 }}
              transition={{
                opacity: { duration: 2, repeat: Infinity, delay: star.delay },
                scale: { duration: 0.5, delay: star.delay },
              }}
            >
              ✦
            </motion.text>
          ))}
        </motion.svg>
      </div>

      {/* Legend */}
      <motion.div
        className="flex justify-center gap-4 mt-4 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-lf-muted"></span>
          <span className="text-gray-500 font-atkinson">Bloqueado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.span
            className="w-3 h-3 rounded-full bg-lf-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-gray-400 font-atkinson">Activo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="text-gray-400 font-atkinson">Completado</span>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-md px-4 mt-4">
        <TreeProgress completed={progress.completed} total={progress.total} />
      </div>

      {/* Trunk message */}
      <motion.div
        className="text-center mt-4 px-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <p className="font-atkinson text-xs text-gray-500 italic">
          &ldquo;{tree.trunk.title}&rdquo;
        </p>
      </motion.div>

      {/* Branch Modal */}
      <BranchModal
        branch={selectedBranch ?? null}
        branchIndex={selectedBranchIndex}
        treeId={tree.id}
        onClose={() => expandBranch(null)}
      />
    </div>
  );
}
