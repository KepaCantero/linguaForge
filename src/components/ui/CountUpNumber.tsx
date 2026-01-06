'use client';

import { useMemo, useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

interface CountUpNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  onComplete?: () => void;
  formatValue?: (value: number) => string;
}

/**
 * Componente wrapper para react-countup con animaciones suaves
 * Usado para XP, coins, gems, stats, etc.
 * Compatible con SSR - evita errores de hidratación
 */
export function CountUpNumber({
  value,
  duration = 1.5,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  onComplete,
  formatValue,
}: CountUpNumberProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  // Evitar error de hidratación: mostrar valor estático en servidor
  useEffect(() => {
    setIsMounted(true);
    setDisplayValue(value);
  }, [value]);

  const formattedValue = useMemo(() => {
    if (formatValue) {
      return formatValue(value);
    }
    return value.toLocaleString('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [value, decimals, formatValue]);

  // En el servidor o antes de montar, mostrar valor estático
  if (!isMounted) {
    return (
      <span className={className}>
        {prefix}
        {formattedValue}
        {suffix}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      key={value}
    >
      <CountUp
        start={displayValue}
        end={value}
        duration={duration}
        decimals={decimals}
        prefix={prefix}
        suffix={suffix}
        separator="."
        decimal=","
        {...(onComplete !== undefined && { onEnd: onComplete })}
        {...(formatValue !== undefined && { formattingFn: formatValue })}
      />
    </motion.span>
  );
}

/**
 * Formateador para números grandes (25.5K → 26K)
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

