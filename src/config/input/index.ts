/**
 * Input UI Configuration
 * Centralized color and styling constants for input components
 *
 * This configuration provides a single source of truth for all colors used
 * across the input system (audio, text, video, and shared components).
 */

// ============================================================
// COLOR PALETTES
// ============================================================

/**
 * Primary color palettes for input components
 * Each color represents a different input type or action state
 */
export const INPUT_COLORS = {
  /** Sky blue - primary action color (e.g., generate, create) */
  sky: {
    50: 'bg-sky-50',
    100: 'bg-sky-100',
    200: 'bg-sky-200',
    300: 'bg-sky-300',
    400: 'text-sky-400',
    500: 'bg-sky-500 border-sky-500 text-sky-500',
    600: 'bg-sky-600 hover:bg-sky-700',
    700: 'bg-sky-700',
    gradient: 'from-sky-500/20 to-sky-600/10',
    gradientFull: 'from-sky-500 to-accent-500',
    border: 'border-sky-500/30',
    textMuted: 'text-sky-300/70',
  },

  /** Emerald green - success/import state color */
  emerald: {
    50: 'bg-emerald-50',
    100: 'bg-emerald-100',
    200: 'bg-emerald-200',
    300: 'bg-emerald-300',
    400: 'text-emerald-400',
    500: 'bg-emerald-500 border-emerald-500 text-emerald-500',
    600: 'bg-emerald-600 hover:bg-emerald-700',
    700: 'bg-emerald-700',
    900: 'bg-emerald-900/20 border-emerald-500/30',
    gradient: 'from-emerald-500/20 to-emerald-600/10',
  },

  /** Purple - creative/advanced feature color */
  purple: {
    400: 'text-purple-400',
    500: 'bg-purple-500',
    600: 'bg-purple-600 hover:bg-purple-700',
    700: 'bg-purple-700',
  },

  /** Amber/yellow - warning/audio loading color */
  amber: {
    200: 'text-amber-200',
    300: 'text-amber-300',
    400: 'text-amber-400',
    500: 'bg-amber-500 border-amber-500 text-amber-500',
    600: 'hover:bg-amber-700',
    700: 'bg-amber-700',
    900: 'bg-amber-900/20',
    gradient: 'from-amber-500/10 to-sky-500/10',
    gradientFull: 'from-amber-500 to-sky-500',
    gradientAlt: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/30',
  },

  /** Rose/red - error/cancel action color */
  rose: {
    400: 'text-rose-400',
    500: 'bg-rose-500',
    600: 'bg-rose-600',
    background: 'bg-rose-500/20',
  },

  /** Accent/brand color */
  accent: {
    400: 'text-accent-400',
    500: 'bg-accent-500 border-accent-500 text-accent-500',
    600: 'bg-accent-600',
  },

  /** Orange - secondary action color */
  orange: {
    500: 'bg-orange-500',
    600: 'bg-orange-600',
    gradient: 'from-orange-500/10 to-amber-500/10',
    gradientFull: 'from-orange-500 to-amber-500',
  },

  /** Slate - neutral/disabled state */
  slate: {
    600: 'bg-slate-600 disabled:bg-slate-600',
  },

  /** Text input specific colors */
  text: {
    bg: 'bg-sky-600',
    bgSubtle: 'bg-calm-bg-elevated/30',
    bgDark: 'bg-sky-600 hover:bg-sky-700',
    borderColor: 'border-calm-warm-200/30',
    textColor: 'text-sky-400',
    textHover: 'hover:underline',
    textMuted: 'text-calm-text-muted',
  },

  /** Calm theme colors */
  calm: {
    bgSecondary: 'bg-calm-bg-secondary',
    warm100: 'border-calm-warm-100/20',
    textPrimary: 'text-calm-text-primary',
    textMuted: 'text-calm-text-muted',
    textMuted50: 'placeholder:text-calm-text-primary/50',
  },
} as const;

// ============================================================
// INPUT TYPE SPECIFIC COLORS
// ============================================================

/**
 * Color mappings for each input type
 */
export const INPUT_TYPE_COLORS = {
  audio: {
    primary: INPUT_COLORS.amber,
    secondary: INPUT_COLORS.orange,
    bgDark: 'bg-amber-500/10',
  },
  text: {
    primary: INPUT_COLORS.sky,
    secondary: INPUT_COLORS.emerald,
    bgDark: 'bg-sky-500/10',
  },
  video: {
    primary: INPUT_COLORS.sky,
    secondary: INPUT_COLORS.accent,
    bgDark: 'bg-sky-500/10',
  },
  youtube: {
    primary: INPUT_COLORS.rose,
    secondary: INPUT_COLORS.amber,
  },
} as const;

// ============================================================
// BUTTON STYLES
// ============================================================

/**
 * Common button styles for input components
 */
export const INPUT_BUTTON_STYLES = {
  /** Primary action button */
  primary: 'flex-1 min-w-[140px] px-4 py-3 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors',

  /** Submit/import button */
  submit: 'w-full px-6 py-4 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors',

  /** Icon button */
  icon: 'w-10 h-10 rounded-xl flex items-center justify-center',
} as const;

// ============================================================
// LOADING SPINNER STYLES
// ============================================================

/**
 * Loading spinner styles
 */
export const LOADING_SPINNER = {
  /** Standard size spinner */
  default: 'w-12 h-12 border-4 border-t-transparent rounded-full animate-spin',

  /** Small size spinner */
  small: 'w-6 h-6 border-3 border-t-transparent rounded-full animate-spin',

  /** Colors */
  colors: {
    amber: 'border-amber-500',
    sky: 'border-sky-500',
    emerald: 'border-emerald-500',
  },
} as const;

// ============================================================
// CARD/CONTAINER STYLES
// ============================================================

/**
 * Card and container styles for input components
 */
export const CARD_STYLES = {
  /** Standard card container */
  default: 'relative overflow-hidden rounded-2xl border-2 bg-calm-bg-secondary backdrop-blur-md p-5',

  /** With gradient overlay */
  withGradient: 'absolute inset-0 bg-gradient-to-br',

  /** Input field */
  input: 'w-full h-32 px-4 py-3 rounded-2xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/20 text-calm-text-primary placeholder:text-calm-text-primary/50 resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm',

  /** Info/error banner */
  banner: 'mt-4 p-4 rounded-2xl bg-calm-bg-secondary backdrop-blur-md border',
} as const;

// ============================================================
// INTONATION/SENTENCE TYPE COLORS
// ============================================================

/**
 * Color mappings for sentence intonation types
 */
export const INTONATION_COLORS = {
  question: {
    color: INPUT_COLORS.sky[400],
    bg: 'bg-sky-500/20',
    icon: '❓',
    label: 'Pregunta',
  },
  statement: {
    color: INPUT_COLORS.emerald[400],
    bg: 'bg-emerald-500/20',
    icon: '💬',
    label: 'Declarativo',
  },
  exclamation: {
    color: INPUT_COLORS.rose[400],
    bg: 'bg-rose-500/20',
    icon: '❗',
    label: 'Exclamación',
  },
  imperative: {
    color: INPUT_COLORS.amber[400],
    bg: 'bg-amber-500/20',
    icon: '🎯',
    label: 'Imperativo',
  },
} as const;

// ============================================================
// TTS QUALITY COLORS
// ============================================================

/**
 * Color mappings for TTS quality levels
 */
export const TTS_QUALITY_COLORS = {
  standard: {
    color: INPUT_COLORS.rose[400],
    bg: INPUT_COLORS.rose.background,
    label: 'Estándar',
  },
  neural: {
    color: INPUT_COLORS.purple[400],
    bg: 'bg-purple-500/20',
    label: 'Neural',
  },
  premium: {
    color: INPUT_COLORS.emerald[400],
    bg: 'bg-emerald-500/20',
    label: 'Premium',
  },
} as const;

// ============================================================
// IMPORT STATUS COLORS
// ============================================================

/**
 * Color mappings for import status
 */
export const IMPORT_STATUS_COLORS = {
  success: {
    text: INPUT_COLORS.emerald[400],
    bg: INPUT_COLORS.emerald[900],
    border: INPUT_COLORS.emerald[500],
  },
  error: {
    text: 'text-red-400',
    bg: 'bg-red-900/20',
    border: 'border-red-500/30',
  },
  loading: {
    text: INPUT_COLORS.amber[300],
    bg: INPUT_COLORS.amber[900],
  },
} as const;

// ============================================================
// TYPE EXPORTS
// ============================================================

/**
 * Supported input types
 */
export type InputType = keyof typeof INPUT_TYPE_COLORS;

/**
 * Intonation sentence types
 */
export type IntonationType = keyof typeof INTONATION_COLORS;

/**
 * TTS quality levels
 */
export type TTSQualityLevel = keyof typeof TTS_QUALITY_COLORS;

/**
 * Import status types
 */
export type ImportStatus = keyof typeof IMPORT_STATUS_COLORS;
