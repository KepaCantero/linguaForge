'use client';

import { motion } from 'framer-motion';
import type { NodeStatus } from '@/types';
import type { BranchPosition } from './hooks/useTreeLayout';
import { DURATION, EASING, SPRING, staggerDelay } from '@/lib/motion';

interface TreeBranchProps {
  branch: BranchPosition;
  index: number;
  icon: string;
  color: string;
  status: NodeStatus;
  progress: number; // 0-3 leaves completed
  onClick: () => void;
}

const statusConfig = {
  locked: {
    lineColor: '#334155',
    nodeColor: '#1E293B',
    glowColor: 'transparent',
    opacity: 0.4,
  },
  active: {
    lineColor: '#6366F1',  // Indigo 500 - Color primario unificado
    nodeColor: '#6366F1',
    glowColor: 'rgba(99, 102, 241, 0.4)',  // Actualizado a Indigo 500
    opacity: 1,
  },
  completed: {
    lineColor: '#22C55E',  // Green 500 - Success mejorado
    nodeColor: '#16A34A',  // Green 600
    glowColor: 'rgba(34, 197, 94, 0.3)',  // Actualizado a Green 500
    opacity: 1,
  },
};

export function TreeBranch({
  branch,
  index,
  icon,
  color,
  status,
  progress,
  onClick,
}: TreeBranchProps) {
  const config = statusConfig[status];
  const isClickable = status !== 'locked';
  const nodeRadius = 24;

  // Create bezier path for organic branch
  const branchPath = `M ${branch.startX} ${branch.startY}
                      Q ${branch.controlX} ${branch.controlY}
                        ${branch.endX} ${branch.endY}`;

  // Animation variants
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: config.opacity,
      transition: {
        pathLength: {
          delay: staggerDelay(index, 0.08) + 0.3,
          duration: DURATION.slow,
          ease: EASING.decelerate,
        },
        opacity: {
          delay: staggerDelay(index, 0.08) + 0.3,
          duration: DURATION.fast,
        },
      },
    },
  };

  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        ...SPRING.bouncy,
        delay: staggerDelay(index, 0.08) + 0.5,
      },
    },
  };

  // Calculate positions for progress dots along the curve
  const getPointOnCurve = (t: number) => {
    const x = (1-t)*(1-t)*branch.startX + 2*(1-t)*t*branch.controlX + t*t*branch.endX;
    const y = (1-t)*(1-t)*branch.startY + 2*(1-t)*t*branch.controlY + t*t*branch.endY;
    return { x, y };
  };

  return (
    <g
      onClick={isClickable ? onClick : undefined}
      style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
      role="button"
      aria-disabled={!isClickable}
      tabIndex={isClickable ? 0 : -1}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient
          id={`branch-gradient-${index}`}
          x1={branch.startX}
          y1={branch.startY}
          x2={branch.endX}
          y2={branch.endY}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={status === 'locked' ? '#334155' : '#6366F1'} stopOpacity={0.6} />
          <stop offset="100%" stopColor={status === 'completed' ? '#22C55E' : color} />
        </linearGradient>

        {/* Glow filter */}
        <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Branch path (curved line) */}
      <motion.path
        d={branchPath}
        stroke={`url(#branch-gradient-${index})`}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        variants={pathVariants}
        initial="hidden"
        animate="visible"
      />

      {/* Progress dots along the curve */}
      {[0.3, 0.5, 0.7].map((t, i) => {
        const point = getPointOnCurve(t);
        const isCompleted = i < progress;

        return (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={isCompleted ? '#10B981' : '#334155'}
            stroke={isCompleted ? '#10B981' : '#475569'}
            strokeWidth={1}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              ...SPRING.snappy,
              delay: staggerDelay(index, 0.08) + 0.6 + i * 0.1,
            }}
          />
        );
      })}

      {/* Node glow (active/completed states) */}
      {status !== 'locked' && (
        <motion.circle
          cx={branch.endX}
          cy={branch.endY}
          r={nodeRadius + 12}
          fill="none"
          stroke={config.glowColor}
          strokeWidth={status === 'active' ? 6 : 3}
          filter={`url(#glow-${index})`}
          initial={{ opacity: 0 }}
          animate={
            status === 'active'
              ? {
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.15, 1],
                }
              : { opacity: 0.6 }
          }
          transition={
            status === 'active'
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: DURATION.normal }
          }
        />
      )}

      {/* Main node */}
      <motion.g
        variants={nodeVariants}
        initial="hidden"
        animate="visible"
        whileHover={isClickable ? { scale: 1.15 } : undefined}
        whileTap={isClickable ? { scale: 0.92 } : undefined}
        transition={SPRING.snappy}
      >
        {/* Node shadow */}
        <circle
          cx={branch.endX + 2}
          cy={branch.endY + 3}
          r={nodeRadius}
          fill="rgba(0,0,0,0.3)"
        />

        {/* Node background */}
        <circle
          cx={branch.endX}
          cy={branch.endY}
          r={nodeRadius}
          fill={status === 'locked' ? config.nodeColor : color}
          opacity={config.opacity}
        />

        {/* Node inner highlight */}
        <circle
          cx={branch.endX - 6}
          cy={branch.endY - 6}
          r={nodeRadius * 0.5}
          fill="rgba(255,255,255,0.15)"
        />

        {/* Node border */}
        <circle
          cx={branch.endX}
          cy={branch.endY}
          r={nodeRadius}
          fill="none"
          stroke={status === 'locked' ? '#475569' : 'rgba(255,255,255,0.3)'}
          strokeWidth={2}
        />

        {/* Icon or status indicator */}
        <text
          x={branch.endX}
          y={branch.endY + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={status === 'completed' ? 16 : 18}
          fontWeight={600}
          fill="white"
        >
          {status === 'completed' ? '✓' : status === 'locked' ? '🔒' : icon}
        </text>
      </motion.g>

      {/* Level indicator (small badge) */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: staggerDelay(index, 0.08) + 0.7, ...SPRING.bouncy }}
      >
        <circle
          cx={branch.endX + nodeRadius - 4}
          cy={branch.endY - nodeRadius + 4}
          r={10}
          fill={status === 'locked' ? '#334155' : '#0F172A'}
          stroke={status === 'locked' ? '#475569' : color}
          strokeWidth={1.5}
        />
        <text
          x={branch.endX + nodeRadius - 4}
          y={branch.endY - nodeRadius + 5}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fontWeight={700}
          fontFamily="var(--font-rajdhani)"
          fill={status === 'locked' ? '#64748B' : 'white'}
        >
          {String(index + 1).padStart(2, '0')}
        </text>
      </motion.g>
    </g>
  );
}
