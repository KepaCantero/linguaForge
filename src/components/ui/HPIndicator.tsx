'use client';

import { motion } from 'framer-motion';
import { HP_CONFIG } from '@/lib/constants';

interface HPIndicatorProps {
  hp: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-2 text-xs',
  md: 'h-3 text-sm',
  lg: 'h-4 text-base',
};

export function HPIndicator({ hp, showLabel = true, size = 'md' }: HPIndicatorProps) {
  const hpPercentage = (hp / HP_CONFIG.maxHP) * 100;
  const isLow = hp < HP_CONFIG.minHPForPremium;
  const isCritical = hp < 30;

  const getHPColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isLow) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Salud</span>
          <span className={`font-medium ${isCritical ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-emerald-500'}`}>
            {hp}/{HP_CONFIG.maxHP}
          </span>
        </div>
      )}
      <div className={`w-full ${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${getHPColor()} rounded-full transition-colors`}
          initial={{ width: 0 }}
          animate={{ width: `${hpPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {isLow && (
        <motion.p
          className="text-xs text-orange-600 dark:text-orange-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {hp < HP_CONFIG.minHPForPremium && '⚠️ Contenido premium bloqueado'}
        </motion.p>
      )}
    </div>
  );
}

