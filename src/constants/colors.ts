/**
 * LINGUAFORGE COLOR SYSTEM
 * ========================
 * Centralized color constants for the entire application.
 *
 * WHY THIS FILE EXISTS:
 * - Single source of truth for all color values
 * - Easy theme updates across the entire app
 * - Type-safe color references
 * - Supports both static (Tailwind) and dynamic (JS) use cases
 *
 * USAGE:
 * - Static styles: Use Tailwind classes (bg-accent-500, text-sky-500/60)
 * - Dynamic styles: Use constants from this file
 * - Framer Motion: Use constants for animations
 *
 * MAINTENANCE:
 * - To change colors: Update globals.css CSS variables FIRST
 * - Then update the HEX values below to match
 * - Tailwind classes will automatically use the new CSS variables
 */

// ============================================
// CSS VARIABLE REFERENCES (for inline styles)
// ============================================

/**
 * CSS Variables - use these for inline styles that need theme support
 * These automatically support light/dark mode
 */
export const CSS_VARS = {
  // Backgrounds
  bgPrimary: 'var(--bg-primary)',
  bgSecondary: 'var(--bg-secondary)',
  bgTertiary: 'var(--bg-tertiary)',
  bgElevated: 'var(--bg-elevated)',

  // Text
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textTertiary: 'var(--text-tertiary)',
  textMuted: 'var(--text-muted)',

  // Accent (Emerald/Green - Success/Growth)
  accent50: 'var(--accent-50)',
  accent100: 'var(--accent-100)',
  accent200: 'var(--accent-200)',
  accent300: 'var(--accent-300)',
  accent400: 'var(--accent-400)',
  accent500: 'var(--accent-500)',
  accent600: 'var(--accent-600)',
  accent700: 'var(--accent-700)',

  // Sky Blue (Secondary - Info/Calm)
  sky50: 'var(--sky-50)',
  sky100: 'var(--sky-100)',
  sky200: 'var(--sky-200)',
  sky300: 'var(--sky-300)',
  sky400: 'var(--sky-400)',
  sky500: 'var(--sky-500)',
  sky600: 'var(--sky-600)',
  sky700: 'var(--sky-700)',

  // Amber (Warning/Energy)
  amber50: 'var(--amber-50)',
  amber100: 'var(--amber-100)',
  amber200: 'var(--amber-200)',
  amber300: 'var(--amber-300)',
  amber400: 'var(--amber-400)',
  amber500: 'var(--amber-500)',
  amber600: 'var(--amber-600)',

  // Semantic
  semanticSuccess: 'var(--semantic-success)',
  semanticSuccessBg: 'var(--semantic-success-bg)',
  semanticError: 'var(--semantic-error)',
  semanticErrorBg: 'var(--semantic-error-bg)',
  semanticWarning: 'var(--semantic-warning)',
  semanticWarningBg: 'var(--semantic-warning-bg)',
  semanticInfo: 'var(--semantic-info)',
  semanticInfoBg: 'var(--semantic-info-bg)',

  // Borders
  borderSubtle: 'var(--border-subtle)',
  borderDefault: 'var(--border-default)',
  borderStrong: 'var(--border-strong)',

  // Shadows
  shadowSoftSm: 'var(--shadow-soft-sm)',
  shadowSoftMd: 'var(--shadow-soft-md)',
  shadowSoftLg: 'var(--shadow-soft-lg)',
  shadowSoftXl: 'var(--shadow-soft-xl)',
  shadowInnerSoft: 'var(--shadow-inner-soft)',
} as const;

// ============================================
// RGBA COLOR CONSTANTS (for dynamic opacity)
// ============================================

/**
 * RGBA color builders for dynamic opacity
 * Use these when you need to compute opacity at runtime
 *
 * @example
 * ```tsx
 * // Dynamic opacity based on progress
 * backgroundColor: `${COLORS.accent.alpha(value)}`
 * ```
 */
export const RGBA = {
  // Primary theme colors
  accent: {
    r: 16, g: 185, b: 129, // Emerald 500
    alpha: (opacity: number) => `rgba(16, 185, 129, ${opacity})`,
  },
  sky: {
    r: 14, g: 165, b: 233, // Sky 500
    alpha: (opacity: number) => `rgba(14, 165, 233, ${opacity})`,
  },
  amber: {
    r: 245, g: 158, b: 11, // Amber 500
    alpha: (opacity: number) => `rgba(245, 158, 11, ${opacity})`,
  },
  error: {
    r: 220, g: 38, b: 38, // Red 600
    alpha: (opacity: number) => `rgba(220, 38, 38, ${opacity})`,
  },
  // Calm theme colors (softer, nurturing palette)
  sage: {
    r: 114, g: 168, b: 125, // Soft sage green
    alpha: (opacity: number) => `rgba(114, 168, 125, ${opacity})`,
  },
  blueGray: {
    r: 130, g: 154, b: 177, // Calm blue-gray
    alpha: (opacity: number) => `rgba(130, 154, 177, ${opacity})`,
  },
  coral: {
    r: 232, g: 144, b: 124, // Soft coral
    alpha: (opacity: number) => `rgba(232, 144, 124, ${opacity})`,
  },
  // Neutral colors
  slate: {
    r: 45, g: 55, b: 72, // Slate gray for shadows
    alpha: (opacity: number) => `rgba(45, 55, 72, ${opacity})`,
  },
  white: {
    r: 255, g: 255, b: 255,
    alpha: (opacity: number) => `rgba(255, 255, 255, ${opacity})`,
  },
  black: {
    r: 0, g: 0, b: 0,
    alpha: (opacity: number) => `rgba(0, 0, 0, ${opacity})`,
  },
} as const;

// ============================================
// PREDEFINED RGBA COLORS (common opacities)
// ============================================

/**
 * Predefined rgba colors for common use cases
 * Use these for Framer Motion animations, inline styles, etc.
 */
export const COLORS = {
  // Accent colors with common opacities
  accent: {
    full: 'rgba(16, 185, 129, 1)',
    90: 'rgba(16, 185, 129, 0.9)',
    80: 'rgba(16, 185, 129, 0.8)',
    70: 'rgba(16, 185, 129, 0.7)',
    60: 'rgba(16, 185, 129, 0.6)',
    50: 'rgba(16, 185, 129, 0.5)',
    40: 'rgba(16, 185, 129, 0.4)',
    30: 'rgba(16, 185, 129, 0.3)',
    20: 'rgba(16, 185, 129, 0.2)',
    15: 'rgba(16, 185, 129, 0.15)',
    10: 'rgba(16, 185, 129, 0.1)',
    0: 'rgba(16, 185, 129, 0)',
  },
  // Sky colors with common opacities
  sky: {
    full: 'rgba(14, 165, 233, 1)',
    90: 'rgba(14, 165, 233, 0.9)',
    80: 'rgba(14, 165, 233, 0.8)',
    70: 'rgba(14, 165, 233, 0.7)',
    60: 'rgba(14, 165, 233, 0.6)',
    50: 'rgba(14, 165, 233, 0.5)',
    40: 'rgba(14, 165, 233, 0.4)',
    30: 'rgba(14, 165, 233, 0.3)',
    20: 'rgba(14, 165, 233, 0.2)',
    15: 'rgba(14, 165, 233, 0.15)',
    10: 'rgba(14, 165, 233, 0.1)',
    0: 'rgba(14, 165, 233, 0)',
  },
  // Amber colors with common opacities
  amber: {
    full: 'rgba(245, 158, 11, 1)',
    60: 'rgba(245, 158, 11, 0.6)',
    0: 'rgba(245, 158, 11, 0)',
  },
  // Error colors
  error: {
    full: 'rgba(220, 38, 38, 1)',
    60: 'rgba(220, 38, 38, 0.6)',
    50: 'rgba(220, 38, 38, 0.5)',
    30: 'rgba(220, 38, 38, 0.3)',
    0: 'rgba(220, 38, 38, 0)',
  },
  // Calm theme colors (softer, nurturing palette)
  sage: {
    full: 'rgba(114, 168, 125, 1)',
    40: 'rgba(114, 168, 125, 0.4)',
    30: 'rgba(114, 168, 125, 0.3)',
    20: 'rgba(114, 168, 125, 0.2)',
    15: 'rgba(114, 168, 125, 0.15)',
    10: 'rgba(114, 168, 125, 0.1)',
    0: 'rgba(114, 168, 125, 0)',
  },
  blueGray: {
    full: 'rgba(130, 154, 177, 1)',
    20: 'rgba(130, 154, 177, 0.2)',
    15: 'rgba(130, 154, 177, 0.15)',
    10: 'rgba(130, 154, 177, 0.1)',
    0: 'rgba(130, 154, 177, 0)',
  },
  coral: {
    full: 'rgba(232, 144, 124, 1)',
    20: 'rgba(232, 144, 124, 0.2)',
    15: 'rgba(232, 144, 124, 0.15)',
    0: 'rgba(232, 144, 124, 0)',
  },
  // Neutral slate (for shadows)
  slate: {
    full: 'rgba(45, 55, 72, 1)',
    20: 'rgba(45, 55, 72, 0.2)',
    15: 'rgba(45, 55, 72, 0.15)',
    10: 'rgba(45, 55, 72, 0.1)',
    8: 'rgba(45, 55, 72, 0.08)',
    6: 'rgba(45, 55, 72, 0.06)',
    5: 'rgba(45, 55, 72, 0.05)',
    4: 'rgba(45, 55, 72, 0.04)',
    3: 'rgba(45, 55, 72, 0.03)',
    2: 'rgba(45, 55, 72, 0.02)',
    1: 'rgba(45, 55, 72, 0.01)',
    0: 'rgba(45, 55, 72, 0)',
  },
  // Grayscale
  white: {
    full: 'rgba(255, 255, 255, 1)',
    70: 'rgba(255, 255, 255, 0.7)',
    50: 'rgba(255, 255, 255, 0.5)',
    40: 'rgba(255, 255, 255, 0.4)',
    30: 'rgba(255, 255, 255, 0.3)',
    20: 'rgba(255, 255, 255, 0.2)',
    15: 'rgba(255, 255, 255, 0.15)',
    10: 'rgba(255, 255, 255, 0.1)',
    5: 'rgba(255, 255, 255, 0.05)',
    0: 'rgba(255, 255, 255, 0)',
  },
  // Transparent (for animations)
  transparent: {
    accent: 'rgba(16, 185, 129, 0)',
    sky: 'rgba(14, 165, 233, 0)',
    amber: 'rgba(245, 158, 11, 0)',
    error: 'rgba(220, 38, 38, 0)',
  },
  black: {
    full: 'rgba(0, 0, 0, 1)',
    95: 'rgba(0, 0, 0, 0.95)',
    80: 'rgba(0, 0, 0, 0.8)',
    70: 'rgba(0, 0, 0, 0.7)',
    60: 'rgba(0, 0, 0, 0.6)',
    50: 'rgba(0, 0, 0, 0.5)',
    40: 'rgba(0, 0, 0, 0.4)',
    30: 'rgba(0, 0, 0, 0.3)',
    20: 'rgba(0, 0, 0, 0.2)',
    10: 'rgba(0, 0, 0, 0.1)',
    5: 'rgba(0, 0, 0, 0.05)',
    0: 'rgba(0, 0, 0, 0)',
  },
  // Visual effects (text shadows, glows, shines)
  effects: {
    // Text shadows
    textShadowSm: '0 1px 2px rgba(0, 0, 0, 0.5)',
    textShadowMd: '0 2px 4px rgba(0, 0, 0, 0.5)',
    textShadowLg: '0 2px 8px rgba(0, 0, 0, 0.6)',
    // White glows/shines
    whiteGlowSm: '0 0 10px rgba(255, 255, 255, 0.5)',
    whiteGlowMd: '0 0 20px rgba(255, 255, 255, 0.8)',
    whiteShine: 'rgba(255, 255, 255, 0.2)',
    // Amber shine
    amberShine: 'rgba(251, 191, 36, 0.1)',
  },
} as const;

// ============================================
// GRADIENT CONSTANTS
// ============================================

/**
 * Predefined gradient strings for common use cases
 */
export const GRADIENTS = {
  accent: {
    primary: 'radial-gradient(circle at 30% 30%, var(--accent-500), var(--accent-600))',
    glow: 'radial-gradient(circle, rgba(16, 185, 129, 0.8), transparent)',
    soft: 'radial-gradient(circle, rgba(16, 185, 129, 0.4), transparent)',
  },
  sky: {
    primary: 'radial-gradient(circle at 30% 30%, var(--sky-500), var(--sky-600))',
    glow: 'radial-gradient(circle, rgba(14, 165, 233, 0.8), transparent)',
    soft: 'radial-gradient(circle, rgba(14, 165, 233, 0.4), transparent)',
  },
  amber: {
    primary: 'radial-gradient(circle at 30% 30%, var(--amber-500), var(--amber-600))',
  },
  mixed: {
    accentToSky: 'radial-gradient(circle at 30% 30%, var(--accent-500), var(--sky-500))',
    skyToAccent: 'radial-gradient(circle at 30% 30%, var(--sky-500), var(--accent-500))',
  },
} as const;

// ============================================
// SHADOW CONSTANTS
// ============================================

/**
 * Predefined shadow strings for common use cases
 */
export const SHADOWS = {
  // Colored shadows for glows
  glow: {
    accent: '0 0 20px rgba(16, 185, 129, 0.4)',
    accentSoft: '0 0 10px rgba(16, 185, 129, 0.3)',
    sky: '0 0 20px rgba(14, 165, 233, 0.4)',
    skySoft: '0 0 10px rgba(14, 165, 233, 0.3)',
    error: '0 0 20px rgba(220, 38, 38, 0.4)',
  },
  // Calm theme shadows (soft, nurturing)
  calm: {
    sage: '0 4px 12px rgba(114, 168, 125, 0.15)',
    blueGray: '0 4px 12px rgba(130, 154, 177, 0.15)',
    coral: '0 4px 12px rgba(232, 144, 124, 0.15)',
    slateSm: '0 2px 8px rgba(45, 55, 72, 0.06)',
    slateMd: '0 4px 12px rgba(45, 55, 72, 0.08)',
    slateLg: '0 8px 24px rgba(45, 55, 72, 0.08)',
  },
  // Focus rings
  focus: {
    accent: '0 0 0 3px rgba(16, 185, 129, 0.15)',
    sky: '0 0 0 3px rgba(14, 165, 233, 0.15)',
    sage: '0 0 0 3px rgba(114, 168, 125, 0.15)',
  },
  // Animation keyframes
  pulse: {
    accentStart: '0 0 0 0 rgba(16, 185, 129, 0)',
    accentMid: '0 0 20px rgba(16, 185, 129, 0.3)',
    accentEnd: '0 0 0 0 rgba(16, 185, 129, 0)',
    errorStart: '0 0 0 0 rgba(220, 38, 38, 0)',
    errorMid: '0 0 20px rgba(220, 38, 38, 0.3)',
    errorEnd: '0 0 0 0 rgba(220, 38, 38, 0)',
  },
} as const;

// ============================================
// TYPESCRIPT TYPES
// ============================================

export type ColorName = keyof typeof COLORS;
export type GradientName = keyof typeof GRADIENTS;
export type ShadowName = keyof typeof SHADOWS;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a color with specific opacity for a color family
 * @param colorFamily - The color family (accent, sky, etc.)
 * @param opacity - The opacity value (0-1)
 */
export function getColorOpacity(
  colorFamily: keyof typeof RGBA,
  opacity: number
): string {
  return RGBA[colorFamily].alpha(opacity);
}

/**
 * Get a predefined color with opacity
 * @param colorFamily - The color family
 * @param opacity - The opacity percentage (0, 10, 20, ..., 100)
 */
export function getColor(
  colorFamily: 'accent' | 'sky' | 'amber' | 'error' | 'white' | 'black',
  opacity?: 0 | 5 | 10 | 15 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 'full'
): string {
  if (opacity === undefined || opacity === 'full') {
    return COLORS[colorFamily].full;
  }
  return (COLORS[colorFamily] as any)[opacity] || COLORS[colorFamily].full;
}

/**
 * Default export for convenience
 */
export default {
  CSS_VARS,
  RGBA,
  COLORS,
  GRADIENTS,
  SHADOWS,
  getColorOpacity,
  getColor,
};

// ============================================
// DYNAMIC GRADIENT BUILDERS
// ============================================

/**
 * Create a radial gradient with dynamic opacity
 * @param colorFamily - The color family (accent, sky, amber, error)
 * @param opacity - The opacity (0-1)
 */
export function radialGlow(
  colorFamily: 'accent' | 'sky' | 'amber' | 'error',
  opacity: number
): string {
  return `radial-gradient(circle, ${RGBA[colorFamily].alpha(opacity)}, transparent)`;
}

/**
 * Create a border color with dynamic opacity
 * @param colorFamily - The color family
 * @param opacity - The opacity (0-1)
 */
export function borderAlpha(
  colorFamily: 'accent' | 'sky' | 'amber' | 'error',
  opacity: number
): string {
  return RGBA[colorFamily].alpha(opacity);
}
