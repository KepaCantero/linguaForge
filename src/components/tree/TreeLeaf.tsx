'use client';

import { motion } from 'framer-motion';
import type { NodeStatus, TopicLeaf } from '@/types';
import { SPRING, DURATION, EASING, staggerDelay } from '@/lib/motion';

interface TreeLeafProps {
  leaf: TopicLeaf;
  status: NodeStatus;
  index: number;
  branchColor?: string;
  onClick: () => void;
}

const statusConfig = {
  locked: {
    bg: 'bg-lf-muted/50',
    border: 'border-lf-muted/30',
    text: 'text-gray-500',
    iconBg: 'bg-lf-muted',
  },
  active: {
    bg: 'bg-lf-soft',
    border: 'border-lf-primary/50',
    text: 'text-white',
    iconBg: 'bg-lf-primary',
  },
  completed: {
    bg: 'bg-lf-soft',
    border: 'border-emerald-500/50',
    text: 'text-white',
    iconBg: 'bg-emerald-500',
  },
};

// Animation variants
const leafVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...SPRING.smooth,
      delay: staggerDelay(i, 0.08),
    },
  }),
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: (i: number) => ({
    scale: 1,
    rotate: 0,
    transition: {
      ...SPRING.bouncy,
      delay: staggerDelay(i, 0.08) + 0.1,
    },
  }),
};

const badgeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      ...SPRING.snappy,
      delay: staggerDelay(i, 0.08) + 0.2,
    },
  }),
};

export function TreeLeaf({ leaf, status, index, branchColor, onClick }: TreeLeafProps) {
  const config = statusConfig[status];
  const isClickable = status !== 'locked';
  const accentColor = status === 'completed' ? '#22C55E' : branchColor || '#6366F1';  // Green 500 o Indigo 500

  return (
    <motion.button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={`
        relative w-full flex items-center gap-3 p-3 rounded-lg
        ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
        ${config.bg} border ${config.border}
        transition-colors duration-200
      `}
      variants={leafVariants}
      custom={index}
      whileHover={isClickable ? {
        scale: 1.02,
        x: 4,
        transition: { duration: DURATION.fast, ease: EASING.smooth }
      } : undefined}
      whileTap={isClickable ? {
        scale: 0.98,
        transition: { duration: DURATION.instant }
      } : undefined}
      style={{
        opacity: status === 'locked' ? 0.5 : 1,
      }}
    >
      {/* Left accent bar */}
      <motion.div
        className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
        style={{ backgroundColor: accentColor }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: staggerDelay(index, 0.08) + 0.15, duration: DURATION.normal }}
      />

      {/* Icon container */}
      <motion.div
        className="relative flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: status === 'locked' ? '#334155' : `${accentColor}20`,
          border: `1px solid ${status === 'locked' ? '#475569' : `${accentColor}40`}`,
        }}
        variants={iconVariants}
        custom={index}
      >
        <span className="text-lg">
          {status === 'locked' ? '🔒' : leaf.icon || '📄'}
        </span>
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <h4 className={`font-rajdhani text-sm font-semibold ${config.text} truncate`}>
          {leaf.title}
        </h4>
        <p className="font-atkinson text-xs text-gray-400 italic truncate">
          {leaf.titleFr}
        </p>

        {/* Grammar tags - only for active/completed */}
        {status !== 'locked' && leaf.grammar.length > 0 && (
          <motion.div
            className="flex gap-1 mt-1.5 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: staggerDelay(index, 0.08) + 0.25 }}
          >
            {leaf.grammar.slice(0, 2).map((g, i) => (
              <span
                key={i}
                className="text-[10px] px-1.5 py-0.5 rounded bg-lf-dark/50 text-gray-400 border border-lf-muted/30"
              >
                {g}
              </span>
            ))}
            {leaf.grammar.length > 2 && (
              <span className="text-[10px] text-gray-500">+{leaf.grammar.length - 2}</span>
            )}
          </motion.div>
        )}
      </div>

      {/* Right side - status badge and duration */}
      <div className="flex flex-col items-end gap-1">
        {/* Status badge */}
        <motion.div
          className={`
            w-6 h-6 rounded-full flex items-center justify-center
            ${config.iconBg} text-white text-xs font-bold
          `}
          variants={badgeVariants}
          custom={index}
        >
          {status === 'completed' ? '✓' : status === 'locked' ? '' : index + 1}
        </motion.div>

        {/* Duration */}
        <span className="text-[10px] text-gray-500 font-rajdhani">
          {leaf.estimatedMinutes}m
        </span>
      </div>

      {/* Active glow effect */}
      {status === 'active' && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            boxShadow: `0 0 20px ${accentColor}30, inset 0 0 20px ${accentColor}10`,
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Completed checkmark overlay animation */}
      {status === 'completed' && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `linear-gradient(135deg, transparent 40%, ${accentColor}10 100%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: staggerDelay(index, 0.08) + 0.3 }}
        />
      )}

      {/* Arrow indicator for clickable items */}
      {isClickable && (
        <motion.span
          className="text-gray-400 text-sm"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 0.6, x: 0 }}
          transition={{ delay: staggerDelay(index, 0.08) + 0.3 }}
        >
          ›
        </motion.span>
      )}
    </motion.button>
  );
}
