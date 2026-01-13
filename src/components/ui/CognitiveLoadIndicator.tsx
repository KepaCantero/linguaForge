'use client';

import { useCognitiveLoad } from '@/store/useCognitiveLoadStore';
import { motion } from 'framer-motion';

interface CognitiveLoadIndicatorProps {
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

/**
 * CognitiveLoadIndicator - Indicador compacto de carga cognitiva
 *
 * Muestra el estado actual de carga cognitiva con colores codificados:
 * - Verde: Baja (≤40%) - Óptimo para aprender
 * - Azul: Óptima (41-70%) - Zona de flujo
 * - Ambar: Alta (71-85%) - Cuidado
 * - Rojo: Sobrecarga (>85%) - Tomar descanso
 */
export function CognitiveLoadIndicator({
  showLabel = false,
  size = 'sm',
}: CognitiveLoadIndicatorProps) {
  const { load, status } = useCognitiveLoad();

  // Color según estado
  const getColor = () => {
    switch (status) {
      case 'low':
        return {
          bg: 'bg-accent-500',
          text: 'text-accent-400',
          bgLight: 'bg-accent-500/10',
          border: 'border-accent-500/20',
          label: 'Baja',
        };
      case 'optimal':
        return {
          bg: 'bg-sky-500',
          text: 'text-sky-400',
          bgLight: 'bg-sky-500/10',
          border: 'border-sky-500/20',
          label: 'Óptima',
        };
      case 'high':
        return {
          bg: 'bg-amber-500',
          text: 'text-amber-400',
          bgLight: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          label: 'Alta',
        };
      case 'overload':
        return {
          bg: 'bg-semantic-error',
          text: 'text-semantic-error',
          bgLight: 'bg-semantic-error/10',
          border: 'border-semantic-error/20',
          label: 'Sobrecarga',
        };
    }
  };

  const colors = getColor();
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <output
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${colors.bgLight} ${colors.border} border`}
      aria-label={`Carga cognitiva: ${Math.round(load.total)}%, ${colors.label}`}
      title={`Carga cognitiva: ${Math.round(load.total)}% - ${colors.label}`}
    >
      {/* Icono de cerebro */}
      <div className={`${sizeClasses} ${colors.bgLight} rounded-full flex items-center justify-center`}>
        <motion.div
          className={`w-2 h-2 ${colors.bg} rounded-full`}
          animate={{
            scale: status === 'overload' ? [1, 1.2, 1] : 1,
            opacity: status === 'overload' ? [1, 0.7, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: status === 'overload' ? Infinity : 0,
          }}
        />
      </div>

      {/* Valor numérico */}
      <span className={`font-rajdhani font-medium ${colors.text} text-xs`}>
        {Math.round(load.total)}%
      </span>

      {/* Label opcional */}
      {showLabel && (
        <span className={`text-[10px] uppercase tracking-wide ${colors.text} hidden sm:inline`}>
          {colors.label}
        </span>
      )}
    </output>
  );
}
