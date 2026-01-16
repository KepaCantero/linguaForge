'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { INPUT_COLORS } from '@/lib/constants';

// ============================================================
// TYPES
// ============================================================

export interface InputCardData {
  id: string;
  type: 'text' | 'video' | 'audio';
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  color: string;
  stats: Array<{ label: string; value: string | number }>;
  status?: 'empty' | 'loading' | 'ready';
  disabled?: boolean;
}

export interface InputCardProps {
  data: InputCardData;
  index: number;
  shouldAnimate: boolean;
}

// ============================================================
// HELPERS
// ============================================================

// Get centralized color config for input type
function getCardConfig(type: 'text' | 'video' | 'audio') {
  return INPUT_COLORS[type];
}

// ============================================================
// COMPONENT
// ============================================================

export function InputCard({ data, index, shouldAnimate }: InputCardProps) {
  const config = getCardConfig(data.type);

  const getStatusIndicator = () => {
    if (data.disabled) {
      return (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-slate-500" />
      );
    }
    switch (data.status) {
      case 'loading':
        return (
          <motion.div
            className="absolute top-3 right-3 w-2 h-2 rounded-full bg-yellow-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        );
      case 'ready':
        return (
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: shouldAnimate ? index * 0.12 : 0,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      className="relative group"
    >
      <Link
        href={data.href}
        className={`
          block relative overflow-hidden rounded-2xl
          bg-gradient-to-br ${config.gradient}
          border ${config.borderColor} ${config.hoverBorder}
          backdrop-blur-sm
          transition-all duration-300 ease-out
          hover:shadow-xl hover:shadow-black/20
          ${data.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={`${data.title}: ${data.description}`}
        tabIndex={data.disabled ? -1 : 0}
      >
        {/* Status Indicator */}
        {getStatusIndicator()}

        {/* Background Glow Effect */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Icon Section */}
          <div className="flex items-start justify-between mb-4">
            <motion.div
              className={`
                relative w-16 h-16 rounded-xl
                bg-gradient-to-br ${config.gradient}
                border ${config.borderColor}
                flex items-center justify-center
                shadow-lg ${config.iconGlow}
              `}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              aria-hidden="true"
            >
              {/* Animated glow behind icon */}
              <motion.div
                className={`absolute inset-0 rounded-xl blur-xl ${config.textColor} opacity-40`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.3,
                }}
              />
              <span className="text-3xl relative z-10">{data.icon}</span>
            </motion.div>

            {/* Arrow indicator */}
            <motion.span
              className="text-calm-text-muted text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ x: 5 }}
              aria-hidden="true"
            >
              →
            </motion.span>
          </div>

          {/* Title and Description */}
          <div className="mb-4">
            <h3 className={`text-xl font-bold text-white mb-2 group-hover:${config.textColor} transition-colors duration-300`}>
              {data.title}
            </h3>
            <p className="text-sm text-calm-text-muted leading-relaxed">
              {data.description}
            </p>
          </div>

          {/* Stats */}
          {data.stats.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-3 border-t border-white/10">
              {data.stats.map((stat, statIndex) => (
                <motion.div
                  key={`${stat.label}-${statIndex}`}
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: shouldAnimate ? index * 0.12 + statIndex * 0.05 : 0,
                  }}
                >
                  <span className={`text-xs font-medium ${config.textColor}`}>
                    {stat.label}:
                  </span>
                  <span className="text-xs font-bold text-white">
                    {stat.value}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Disabled overlay */}
          {data.disabled && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-sm font-medium text-slate-300">Próximamente</span>
            </div>
          )}
        </div>

        {/* Hover highlight effect */}
        <motion.div
          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${config.gradient}`}
          initial={{ width: 0 }}
          whileHover={{ width: '100%' }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
}
