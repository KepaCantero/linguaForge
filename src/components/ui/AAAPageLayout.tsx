'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AAAPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

/**
 * Wrapper premium para páginas AAA
 * Proporciona título, subtítulo y área de acción con animaciones consistentes
 */
export function AAAPageLayout({ children, title, subtitle, action }: AAAPageLayoutProps) {
  return (
    <div className="max-w-md mx-auto">
      {/* Header de página */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-lf-muted">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {action}
          </motion.div>
        )}
      </motion.div>

      {/* Contenido */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Tarjeta AAA reutilizable para listas y grids
 */
interface AAACardProps {
  icon?: string;
  title: string;
  subtitle?: string;
  description?: string;
  stats?: Array<{ label: string; value: string | number }>;
  onClick?: () => void;
  action?: ReactNode;
  delay?: number;
}

export function AAACard({
  icon,
  title,
  subtitle,
  description,
  stats,
  onClick,
  action,
  delay = 0,
}: AAACardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, type: 'spring', stiffness: 100 }}
      whileHover={onClick ? { y: -4 } : {}}
      onClick={onClick}
      className={`relative group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Glass card container */}
      <div className="relative overflow-hidden rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 shadow-glass-xl">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-lf-primary/20 via-lf-secondary/20 to-lf-accent/20"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: delay * 0.5,
          }}
        />

        {/* Inner glow on hover */}
        {onClick && (
          <motion.div
            className="absolute inset-0 rounded-aaa-xl shadow-inner-glow opacity-0 group-hover:opacity-60 transition-opacity duration-500"
          />
        )}

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, transparent 50%)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {icon && (
              <motion.div
                className="relative w-14 h-14 rounded-aaa-lg bg-gradient-to-br from-lf-primary to-lf-secondary flex items-center justify-center text-3xl shadow-depth-lg"
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-aaa-lg bg-lf-primary blur-md opacity-50"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <span className="relative">{icon}</span>
              </motion.div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 group-hover:text-lf-accent transition-colors">
                {title}
              </h3>
              {subtitle && (
                <div className="text-sm text-lf-muted mb-2">
                  {subtitle}
                </div>
              )}
              {description && (
                <p className="text-sm text-lf-muted/80 line-clamp-2">
                  {description}
                </p>
              )}
            </div>

            {action && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {action}
              </motion.div>
            )}
          </div>

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
              {stats.map((stat, i) => (
                <div key={`aaa-stat-${i}-${stat.label}`} className="flex-1">
                  <div className="text-xs text-lf-muted mb-1">
                    {stat.label}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
