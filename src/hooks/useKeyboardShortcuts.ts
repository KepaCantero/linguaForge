/**
 * useKeyboardShortcuts Hook
 *
 * Maneja atajos de teclado para validación SRS y otras acciones comunes
 * - Space: Continuar al siguiente ejercicio
 * - 1-4: Calificar tarjeta SRS (again, hard, good, easy)
 * - Enter: Confirmar selección
 * - Escape: Cancelar o salir
 * - F: Entrar/salir de modo Focus
 */

import { useEffect, useCallback } from 'react';

// ============================================================
// TIPOS
// ============================================================

export type SRSRating = 'again' | 'hard' | 'good' | 'easy';

export interface KeyboardShortcutConfig {
  // SRS shortcuts
  onRateAgain?: () => void;
  onRateHard?: () => void;
  onRateGood?: () => void;
  onRateEasy?: () => void;

  // Navigation shortcuts
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;

  // General shortcuts
  onConfirm?: () => void;
  onCancel?: () => void;
  onToggleFocus?: () => void;
  onShowHint?: () => void;
  onPlayAudio?: () => void;

  // Whether shortcuts are enabled
  enabled?: boolean;
  // Custom key mappings
  customMappings?: Record<string, () => void>;
}

export interface ShortcutDescription {
  key: string;
  description: string;
  category: 'srs' | 'navigation' | 'general';
}

// ============================================================
// CONSTANTES
// ============================================================

const DEFAULT_SHORTCUTS: Record<string, ShortcutDescription> = {
  '1': { key: '1', description: 'Otra vez (Again)', category: 'srs' },
  '2': { key: '2', description: 'Difícil (Hard)', category: 'srs' },
  '3': { key: '3', description: 'Bien (Good)', category: 'srs' },
  '4': { key: '4', description: 'Fácil (Easy)', category: 'srs' },
  ' ': { key: 'Space', description: 'Siguiente ejercicio', category: 'navigation' },
  's': { key: 'S', description: 'Saltar ejercicio', category: 'navigation' },
  'a': { key: 'A', description: 'Repetir audio', category: 'general' },
  'h': { key: 'H', description: 'Mostrar pista', category: 'general' },
  'f': { key: 'F', description: 'Modo Focus', category: 'general' },
  'Enter': { key: 'Enter', description: 'Confirmar', category: 'general' },
  'Escape': { key: 'Esc', description: 'Cancelar/Salir', category: 'general' },
};

// ============================================================
// MAPPER DE SHORTCUTS A ACCIONES
// ============================================================

function getShortcutAction(
  key: string,
  ctrlKey: boolean,
  metaKey: boolean,
  shiftKey: boolean,
  config: KeyboardShortcutConfig
): (() => void) | null {
  if (ctrlKey || metaKey) return null;

  const normalizedKey = key.toLowerCase();
  const hasShift = shiftKey;

  const srsActions = getSRSAction(normalizedKey, config);
  if (srsActions) return srsActions;

  const navActions = getNavigationAction(normalizedKey, hasShift, config);
  if (navActions) return navActions;

  const generalActions = getGeneralAction(normalizedKey, hasShift, config);
  if (generalActions) return generalActions;

  return config.customMappings?.[normalizedKey] || null;
}

function getSRSAction(key: string, config: KeyboardShortcutConfig): (() => void) | null {
  const actions: Partial<Record<keyof KeyboardShortcutConfig, string>> = {
    onRateAgain: '1',
    onRateHard: '2',
    onRateGood: '3',
    onRateEasy: '4',
  };

  for (const [callback, keyName] of Object.entries(actions)) {
    if (key === keyName && config[callback as keyof KeyboardShortcutConfig]) {
      return config[callback as keyof KeyboardShortcutConfig] as () => void;
    }
  }
  return null;
}

function getNavigationAction(key: string, hasShift: boolean, config: KeyboardShortcutConfig): (() => void) | null {
  if (key === ' ' && config.onNext) return config.onNext;
  if (key === 's' && !hasShift && config.onSkip) return config.onSkip;
  if (key === 'arrowleft' && config.onPrevious) return config.onPrevious;
  if (key === 'arrowright' && config.onNext) return config.onNext;
  return null;
}

function getGeneralAction(key: string, hasShift: boolean, config: KeyboardShortcutConfig): (() => void) | null {
  if (key === 'enter' && config.onConfirm) return config.onConfirm;
  if (key === 'escape' && config.onCancel) return config.onCancel;
  if (key === 'f' && !hasShift && config.onToggleFocus) return config.onToggleFocus;
  if (key === 'h' && !hasShift && config.onShowHint) return config.onShowHint;
  if (key === 'a' && !hasShift && config.onPlayAudio) return config.onPlayAudio;
  return null;
}

// ============================================================
// HOOK PRINCIPAL
// ============================================================

/**
 * Hook para manejar atajos de teclado
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   onRateAgain: () => handleRating('again'),
 *   onRateGood: () => handleRating('good'),
 *   onNext: () => goToNextExercise(),
 *   onToggleFocus: () => toggleFocusMode(),
 *   enabled: true,
 * });
 * ```
 */
export function useKeyboardShortcuts(config: KeyboardShortcutConfig = {}) {
  const {
    enabled = true,
    customMappings = {},
    ...callbacks
  } = config;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignorar si el usuario está escribiendo en un input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const action = getShortcutAction(
        event.key,
        event.ctrlKey,
        event.metaKey,
        event.shiftKey,
        { ...callbacks, customMappings }
      );

      if (action) {
        event.preventDefault();
        event.stopPropagation();
        action();
      }
    },
    [enabled, callbacks, customMappings]
  );

  useEffect(() => {
    if (!enabled) return;

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    enabled,
    shortcuts: DEFAULT_SHORTCUTS,
  };
}

// ============================================================
// HOOK PARA SHORTCUTS ESPECÍFICOS DE SRS
// ============================================================

export interface SRSShortcutsConfig {
  onRate: (rating: SRSRating) => void;
  enabled?: boolean;
  useNumberKeys?: boolean;
}

/**
 * Hook simplificado para shortcuts de SRS
 *
 * @example
 * ```tsx
 * useSRSShortcuts({
 *   onRate: (rating) => submitRating(rating),
 *   enabled: true,
 * });
 * ```
 */
export function useSRSShortcuts(config: SRSShortcutsConfig) {
  const { onRate, enabled = true, useNumberKeys = true } = config;

  useKeyboardShortcuts({
    enabled,
    ...(useNumberKeys && {
      onRateAgain: () => onRate('again'),
      onRateHard: () => onRate('hard'),
      onRateGood: () => onRate('good'),
      onRateEasy: () => onRate('easy'),
    }),
  });

  return { enabled, onRate };
}

// ============================================================
// UTILS
// ============================================================

/**
 * Obtiene la descripción de todos los shortcuts disponibles
 */
export function getShortcutDescriptions(
  categories?: Array<'srs' | 'navigation' | 'general'>
): ShortcutDescription[] {
  const all = Object.values(DEFAULT_SHORTCUTS);

  if (!categories) return all;

  return all.filter((s) => categories.includes(s.category));
}

/**
 * Formatea una tecla para mostrarla en UI
 */
export function formatKeyDisplay(key: string): string {
  const displayNames: Record<string, string> = {
    ' ': 'Space',
    'arrowleft': '←',
    'arrowright': '→',
    'arrowup': '↑',
    'arrowdown': '↓',
    'enter': 'Enter',
    'escape': 'Esc',
  };

  return displayNames[key.toLowerCase()] || key.toUpperCase();
}

/**
 * Obtiene shortcuts disponibles para un callback específico
 */
export function getShortcutsForAction(
  action: keyof Omit<KeyboardShortcutConfig, 'enabled' | 'customMappings'>
): string[] {
  const keyMap: Record<typeof action, string[]> = {
    onRateAgain: ['1'],
    onRateHard: ['2'],
    onRateGood: ['3'],
    onRateEasy: ['4'],
    onNext: [' ', 'ArrowRight'],
    onPrevious: ['ArrowLeft'],
    onSkip: ['S'],
    onConfirm: ['Enter'],
    onCancel: ['Escape'],
    onToggleFocus: ['F'],
    onShowHint: ['H'],
    onPlayAudio: ['A'],
  };

  return keyMap[action] || [];
}
