/**
 * Audio Quality Indicator Component
 * Componente indicador de calidad de audio AAA
 *
 * Muestra métricas de calidad de audio de forma visual
 * e indica cumplimiento de estándares AAA
 */

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type {
  AudioQualityMetrics,
  AudioQualityValidation,
} from '@/types/audio';
import { getQualityGrade, QUALITY_RANGES } from '@/types/audio';

// ============================================================
// TYPES
// ============================================================

interface AudioQualityIndicatorProps {
  metrics: AudioQualityMetrics;
  validation?: AudioQualityValidation;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  threshold?: number;
  size: 'sm' | 'md' | 'lg';
}

// ============================================================
// CONSTANTS
// ============================================================

const METRIC_CONFIG = {
  clarity: {
    label: 'Claridad',
    max: 100,
    unit: '%',
    color: 'bg-blue-500',
    threshold: 90,
  },
  prosody: {
    label: 'Prosodia',
    max: 100,
    unit: '%',
    color: 'bg-purple-500',
    threshold: 70,
  },
  snr: {
    label: 'SNR',
    max: 40,
    unit: 'dB',
    color: 'bg-green-500',
    threshold: 25,
  },
  artifacts: {
    label: 'Sin Artefactos',
    max: 100,
    unit: '%',
    color: 'bg-orange-500',
    threshold: 95,
  },
  dynamicRange: {
    label: 'Rango Dinámico',
    max: 40,
    unit: 'dB',
    color: 'bg-pink-500',
    threshold: 20,
  },
} as const;

const SIZE_CLASSES = {
  sm: {
    container: 'text-xs',
    barHeight: 'h-1',
    barGap: 'gap-1',
  },
  md: {
    container: 'text-sm',
    barHeight: 'h-2',
    barGap: 'gap-2',
  },
  lg: {
    container: 'text-base',
    barHeight: 'h-3',
    barGap: 'gap-3',
  },
} as const;

// ============================================================
// SUBCOMPONENTS
// ============================================================

/**
 * MetricBar Component
 * Muestra una barra de progreso para una métrica
 */
function MetricBar({
  label,
  value,
  max,
  unit,
  color,
  threshold,
  size,
}: MetricBarProps) {
  const sizeClasses = SIZE_CLASSES[size];
  const percentage = Math.min((value / max) * 100, 100);
  const isAboveThreshold = threshold !== undefined && value >= threshold;

  return (
    <div className={`${sizeClasses.container} ${sizeClasses.barGap}`}>
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="font-mono text-gray-600 dark:text-gray-400">
          {value.toFixed(1)}
          {unit}
        </span>
      </div>

      <div className={`relative ${sizeClasses.barHeight} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
        <motion.div
          className={`absolute left-0 top-0 h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Threshold marker */}
        {threshold && (
          <div
            className="absolute top-0 h-full w-0.5 bg-red-500 z-10"
            style={{ left: `${(threshold / max) * 100}%` }}
          />
        )}
      </div>

      {threshold && (
        <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Mínimo AAA: {threshold}
          {unit}
          {isAboveThreshold ? ' ✓' : ' ⚠'}
        </div>
      )}
    </div>
  );
}

/**
 * QualityBadge Component
 * Muestra insignia de calificación general
 */
function QualityBadge({
  grade,
  passed,
}: {
  grade: 'excellent' | 'good' | 'acceptable' | 'poor';
  passed: boolean;
}) {
  const config = {
    excellent: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-300 dark:border-green-700',
      label: 'Excelente',
      icon: '★',
    },
    good: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-800 dark:text-blue-200',
      border: 'border-blue-300 dark:border-blue-700',
      label: 'Bueno',
      icon: '●',
    },
    acceptable: {
      bg: 'bg-yellow-100 dark:bg-yellow-900',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-300 dark:border-yellow-700',
      label: 'Aceptable',
      icon: '◆',
    },
    poor: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-300 dark:border-red-700',
      label: 'Insuficiente',
      icon: '✗',
    },
  }[grade];

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${config.bg} ${config.text} ${config.border}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-lg" aria-hidden="true">
        {config.icon}
      </span>
      <span className="font-semibold">{config.label}</span>
      {passed && (
        <span className="text-xs font-mono bg-green-500 text-white px-2 py-0.5 rounded">
          AAA
        </span>
      )}
    </motion.div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AudioQualityIndicator({
  metrics,
  validation,
  showDetails = true,
  size = 'md',
  className = '',
}: AudioQualityIndicatorProps) {
  const grade = useMemo(() => getQualityGrade(metrics), [metrics]);
  const passed = validation?.passed ?? true;

  if (!showDetails) {
    return (
      <div className={`inline-block ${className}`}>
        <QualityBadge grade={grade} passed={passed} />
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header with grade badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Calidad de Audio
        </h3>
        <QualityBadge grade={grade} passed={passed} />
      </div>

      {/* Validation failures */}
      {validation && validation.failures.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
            Problemas de calidad:
          </p>
          <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
            {validation.failures.map((failure, index) => (
              <li key={index} className="flex items-start gap-2">
                <span aria-hidden="true">✗</span>
                <span>{failure}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation warnings */}
      {validation && validation.warnings.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
            Advertencias:
          </p>
          <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2">
                <span aria-hidden="true">⚠</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metric bars */}
      <div className="space-y-3">
        <MetricBar
          label={METRIC_CONFIG.clarity.label}
          value={metrics.clarity}
          max={METRIC_CONFIG.clarity.max}
          unit={METRIC_CONFIG.clarity.unit}
          color={METRIC_CONFIG.clarity.color}
          threshold={METRIC_CONFIG.clarity.threshold}
          size={size}
        />

        <MetricBar
          label={METRIC_CONFIG.prosody.label}
          value={metrics.prosodyScore}
          max={METRIC_CONFIG.prosody.max}
          unit={METRIC_CONFIG.prosody.unit}
          color={METRIC_CONFIG.prosody.color}
          threshold={METRIC_CONFIG.prosody.threshold}
          size={size}
        />

        <MetricBar
          label={METRIC_CONFIG.snr.label}
          value={metrics.snrRatio}
          max={METRIC_CONFIG.snr.max}
          unit={METRIC_CONFIG.snr.unit}
          color={METRIC_CONFIG.snr.color}
          threshold={METRIC_CONFIG.snr.threshold}
          size={size}
        />

        <MetricBar
          label={METRIC_CONFIG.artifacts.label}
          value={metrics.artifactScore}
          max={METRIC_CONFIG.artifacts.max}
          unit={METRIC_CONFIG.artifacts.unit}
          color={METRIC_CONFIG.artifacts.color}
          threshold={METRIC_CONFIG.artifacts.threshold}
          size={size}
        />

        <MetricBar
          label={METRIC_CONFIG.dynamicRange.label}
          value={metrics.dynamicRange}
          max={METRIC_CONFIG.dynamicRange.max}
          unit={METRIC_CONFIG.dynamicRange.unit}
          color={METRIC_CONFIG.dynamicRange.color}
          threshold={METRIC_CONFIG.dynamicRange.threshold}
          size={size}
        />
      </div>

      {/* Additional metrics (smaller) */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">Centroide Espectral:</span>{' '}
            <span className="font-mono">
              {metrics.spectralCentroid.toFixed(0)} Hz
            </span>
          </div>
          <div>
            <span className="font-medium">Tasa Cruce Cero:</span>{' '}
            <span className="font-mono">
              {metrics.zeroCrossingRate.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* AAA compliance indicator */}
      {validation && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Cumple Estándares AAA:
            </span>
            <span
              className={`font-semibold ${
                validation.passed
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {validation.passed ? 'SÍ' : 'NO'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SIMPLIFIED VERSION
// ============================================================

interface AudioQualityCompactProps {
  metrics: AudioQualityMetrics;
  validation?: AudioQualityValidation;
  className?: string;
}

export function AudioQualityCompact({
  metrics,
  validation,
  className = '',
}: AudioQualityCompactProps) {
  const grade = useMemo(() => getQualityGrade(metrics), [metrics]);
  const passed = validation?.passed ?? true;

  const gradeColors = {
    excellent: 'text-green-600 dark:text-green-400',
    good: 'text-blue-600 dark:text-blue-400',
    acceptable: 'text-yellow-600 dark:text-yellow-400',
    poor: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            passed ? 'bg-green-500' : 'bg-red-500'
          }`}
          aria-hidden="true"
        />
        <span className={`text-sm font-semibold ${gradeColors[grade]}`}>
          {grade.charAt(0).toUpperCase() + grade.slice(1)}
        </span>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400">
        <span className="font-mono">{metrics.clarity.toFixed(0)}% claridad</span>
        <span className="mx-1">•</span>
        <span className="font-mono">{metrics.snrRatio.toFixed(0)}dB SNR</span>
      </div>

      {passed && (
        <span className="text-xs font-mono bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
          AAA
        </span>
      )}
    </div>
  );
}
