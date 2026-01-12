/**
 * ColorPaletteSystem - Sistema de Paletas de Colores LinguaForge
 *
 * Sistema de gestión de colores basado en:
 * - Neurodiseño: Colores que activan zonas cerebrales específicas
 * - Psicología del color: Colores que evocan estados emocionales deseados
 * - Accesibilidad: Contraste WCAG AA compliant
 * - Tema oscuro/claro: Soporte para ambos modos
 *
 * Paletas disponibles:
 * - Learning: Colores que facilitan el aprendizaje
 * - Focus: Colores para concentración
 * - Calm: Colores para relajación
 * - Energy: Colores para energía y motivación
 * - Creativity: Colores para estimular la creatividad
 */

'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

// ============================================================
// TIPOS
// ============================================================

export type ColorPalette = 'learning' | 'focus' | 'calm' | 'energy' | 'creativity';
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface PaletteColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
}

export interface ColorTheme {
  name: string;
  description: string;
  colors: PaletteColors;
  psychologicalEffect: string;
  recommendedFor: string[];
  brainZones: string[];
}

// ============================================================
// PALETAS DE COLORES
// ============================================================

export const COLOR_PALETTES: Record<ColorPalette, ColorTheme> = {
  learning: {
    name: 'Learning',
    description: 'Colores que facilitan el aprendizaje y la retención',
    colors: {
      primary: '#6366F1',     // Indigo 500 - Estimula cognición
      secondary: '#8B5CF6',   // Purple 500 - Creatividad
      accent: '#FDE047',       // Yellow 300 - Atención y foco
      background: '#0F172A',   // Slate 900
      surface: '#1E293B',      // Slate 800
      text: '#F8FAFC',         // Slate 50
      textSecondary: '#94A3B8', // Slate 400
      success: '#22C55E',      // Green 500
      warning: '#F59E0B',      // Amber 500
      error: '#EF4444',        // Red 500
    },
    psychologicalEffect: 'El índigo estimula el pensamiento lógico y la calma, facilitando la concentración necesaria para el aprendizaje.',
    recommendedFor: ['Ejercicios de gramática', 'Lectura', 'Estudio de vocabulario'],
    brainZones: ['Prefrontal', 'Parietal'],
  },

  focus: {
    name: 'Focus',
    description: 'Colores para máxima concentración',
    colors: {
      primary: '#3B82F6',      // Blue 500 - Enfoque mental
      secondary: '#0EA5E9',    // Sky 500 - Claridad
      accent: '#22C55E',       // Green 500 - Productividad
      background: '#0C1929',   // Azul muy oscuro
      surface: '#1A3A52',      // Azul oscuro
      text: '#F0F9FF',         // Sky 50
      textSecondary: '#7DD3FC', // Sky 300
      success: '#22C55E',      // Green 500
      warning: '#F59E0B',      // Amber 500
      error: '#EF4444',        // Red 500
    },
    psychologicalEffect: 'El azul reduce la ansiedad y mejora la concentración, ideal para sesiones de estudio intensas.',
    recommendedFor: ['Sesiones de enfoque', 'Práctica intensiva', 'Exámenes'],
    brainZones: ['Prefrontal', 'Parietal'],
  },

  calm: {
    name: 'Calm',
    description: 'Colores para relajación y reducción de ansiedad',
    colors: {
      primary: '#14B8A6',      // Teal 500 - Calma
      secondary: '#22C55E',    // Green 500 - Relajación
      accent: '#A78BFA',       // Purple 400 - Serenidad
      background: '#0F172A',   // Slate 900
      surface: '#1E293B',      // Slate 800
      text: '#F0FDFA',         // Teal 50
      textSecondary: '#99F6E4', // Teal 200
      success: '#22C55E',      // Green 500
      warning: '#F59E0B',      // Amber 500
      error: '#EF4444',        // Red 500
    },
    psychologicalEffect: 'Los verdes y teales evocan la naturaleza, reduciendo el estrés y creando un ambiente de aprendizaje relajado.',
    recommendedFor: ['Input comprensible', 'Escucha pasiva', 'Repaso'],
    brainZones: ['Temporal', 'Occipital'],
  },

  energy: {
    name: 'Energy',
    description: 'Colores para energía y motivación',
    colors: {
      primary: '#F59E0B',      // Amber 500 - Energía
      secondary: '#EC4899',    // Pink 500 - Entusiasmo
      accent: '#F97316',       // Orange 500 - Motivación
      background: '#1C1917',   // Stone 900
      surface: '#292524',      // Stone 800
      text: '#FEF3C7',         // Amber 50
      textSecondary: '#FDBA74', // Orange 300
      success: '#22C55E',      // Green 500
      warning: '#F59E0B',      // Amber 500
      error: '#EF4444',        // Red 500
    },
    psychologicalEffect: 'Los tonos cálidos (ámbar, naranja) estimulan la energía y la motivación, ideales para mantener el engagement.',
    recommendedFor: ['Gamificación', 'Desafíos', 'Sesiones de alta energía'],
    brainZones: ['Cerebelo', 'Temporal'],
  },

  creativity: {
    name: 'Creativity',
    description: 'Colores para estimular la creatividad',
    colors: {
      primary: '#8B5CF6',      // Purple 500 - Imaginación
      secondary: '#EC4899',    // Pink 500 - Expresión
      accent: '#06B6D4',       // Cyan 500 - Innovación
      background: '#1A1033',   // Púrpura oscuro
      surface: '#2A1B4E',      // Púrpura medio
      text: '#FAF5FF',         // Purple 50
      textSecondary: '#D8B4FE', // Purple 300
      success: '#22C55E',      // Green 500
      warning: '#F59E0B',      // Amber 500
      error: '#EF4444',        // Red 500
    },
    psychologicalEffect: 'El púrpura se asocia con la creatividad y la imaginación, ideal para ejercicios de producción lingüística.',
    recommendedFor: ['Ejercicios de escritura', 'Conversación', 'Role-playing'],
    brainZones: ['Broca', 'Wernicke', 'Prefrontal'],
  },
};

// ============================================================
// COMPONENTES
// ============================================================

/**
 * ColorPaletteSelector - Selector de paleta de colores
 */
export function ColorPaletteSelector({
  currentPalette,
  onPaletteChange,
  className = '',
}: {
  currentPalette: ColorPalette;
  onPaletteChange: (palette: ColorPalette) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {(Object.keys(COLOR_PALETTES) as ColorPalette[]).map((palette) => (
        <PaletteButton
          key={palette}
          palette={palette}
          isActive={currentPalette === palette}
          onClick={() => onPaletteChange(palette)}
        />
      ))}
    </div>
  );
}

/**
 * PaletteButton - Botón de paleta individual
 */
function PaletteButton({
  palette,
  isActive,
  onClick,
}: {
  palette: ColorPalette;
  isActive: boolean;
  onClick: () => void;
}) {
  const theme = COLOR_PALETTES[palette];

  return (
    <motion.button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-lg border-2 transition-all ${
        isActive
          ? ''
          : 'opacity-60 hover:opacity-100'
      }`}
      style={{
        backgroundColor: isActive ? theme.colors.surface : 'transparent',
        borderColor: theme.colors.primary,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <span className="font-quicksand font-medium text-sm" style={{ color: theme.colors.text }}>
          {theme.name}
        </span>
      </div>

      {isActive && (
        <motion.div
          layoutId="activePalette"
          className="absolute inset-0 rounded-lg"
          style={{ backgroundColor: theme.colors.primary }}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 0.1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

/**
 * ColorSwatch - Muestra de color interactivo
 */
export function ColorSwatch({
  color,
  name,
  onClick,
  className = '',
}: {
  color: string;
  name?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative rounded-lg overflow-hidden cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-16 h-16" style={{ backgroundColor: color }} />
      {name && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
          <span className="font-inter text-xs text-white">{name}</span>
        </div>
      )}
    </motion.div>
  );
}

/**
 * PalettePreview - Vista previa de paleta completa
 */
export function PalettePreview({
  palette,
  showLabels = true,
  className = '',
}: {
  palette: ColorPalette;
  showLabels?: boolean;
  className?: string;
}) {
  const theme = COLOR_PALETTES[palette];

  return (
    <div
      className={`rounded-xl overflow-hidden border-2 ${className}`}
      style={{
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.primary,
      }}
    >
      {/* Header con nombre */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: theme.colors.surface, backgroundColor: theme.colors.surface }}
      >
        <h3 className="font-quicksand font-semibold text-lg" style={{ color: theme.colors.text }}>
          {theme.name}
        </h3>
        {showLabels && (
          <p className="font-inter text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
            {theme.description}
          </p>
        )}
      </div>

      {/* Muestra de colores */}
      <div className="p-4 grid grid-cols-5 gap-2">
        {Object.entries(theme.colors).map(([key, value]) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <div
              className="w-full aspect-square rounded-lg shadow-sm"
              style={{ backgroundColor: value }}
            />
            {showLabels && (
              <span className="font-inter text-xs text-center" style={{ color: theme.colors.textSecondary }}>
                {key}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Efecto psicológico */}
      {showLabels && (
        <div className="px-4 py-3 border-t" style={{ borderColor: theme.colors.surface }}>
          <p className="font-inter text-sm" style={{ color: theme.colors.text }}>
            <span className="font-semibold">Efecto:</span> {theme.psychologicalEffect}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * AdaptiveBackground - Fondo adaptativo basado en paleta
 */
export function AdaptiveBackground({
  palette,
  children,
  intensity = 1,
  className = '',
}: {
  palette: ColorPalette;
  children: React.ReactNode;
  intensity?: number; // 0-1
  className?: string;
}) {
  const theme = COLOR_PALETTES[palette];

  return (
    <div
      className={className}
      style={{
        backgroundColor: theme.colors.background,
        backgroundImage: `radial-gradient(circle at 50% 0%, ${theme.colors.primary}${Math.round(intensity * 20).toString(16)}, transparent)`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * ContrastChecker - Verificador de contraste WCAG
 */
export function ContrastChecker({
  foreground,
  background,
}: {
  foreground: string;
  background: string;
}) {
  const ratio = useMemo(() => {
    const getLuminance = (hex: string): number => {
      const rgb = hex
        .replace('#', '')
        .match(/.{2}/g)
        ?.map((x) => Number.parseInt(x, 16)) || [0, 0, 0];

      const [r, g, b] = rgb.map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });

      return r * 0.2126 + g * 0.7152 + b * 0.0722;
    };

    const lum1 = getLuminance(foreground);
    const lum2 = getLuminance(background);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }, [foreground, background]);

  const compliance = useMemo(() => {
    if (ratio >= 7) return { level: 'AAA', size: 'Normal', pass: true };
    if (ratio >= 4.5) return { level: 'AA', size: 'Normal', pass: true };
    if (ratio >= 3) return { level: 'AA', size: 'Large', pass: true };
    return { level: 'Fail', size: 'N/A', pass: false };
  }, [ratio]);

  return (
    <div className="flex items-center gap-2">
      <div
        className="px-2 py-1 rounded text-xs font-semibold"
        style={{
          backgroundColor: compliance.pass ? '#22C55E' : '#EF4444',
          color: 'white',
        }}
      >
        {compliance.level}
      </div>
      <span className="font-inter text-sm text-gray-400">
        Ratio: {ratio.toFixed(2)}:1
      </span>
    </div>
  );
}

/**
 * PaletteGenerator - Generador de paletas personalizadas
 */
export function PaletteGenerator({
  baseColor,
  scheme = 'analogous',
  onPaletteGenerated,
}: {
  baseColor: string; // Hex
  scheme?: 'analogous' | 'complementary' | 'triadic' | 'split-complementary';
  onPaletteGenerated?: (palette: Partial<PaletteColors>) => void;
}) {
  const colors = useMemo(() => {
    // Convertir hex a HSL
    const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
      const rgb = hex
        .replace('#', '')
        .match(/.{2}/g)
        ?.map((x) => Number.parseInt(x, 16)) || [0, 0, 0];

      const [r, g, b] = rgb.map((v) => v / 255);

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;

      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (delta !== 0) {
        s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

        if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / delta + 2) / 6;
        else h = ((r - g) / delta + 4) / 6;
      }

      return { h: h * 360, s: s * 100, l: l * 100 };
    };

    const hslToHex = (h: number, s: number, l: number): string => {
      s /= 100;
      l /= 100;

      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, '0');
      };

      return `#${f(0)}${f(8)}${f(4)}`;
    };

    const baseHSL = hexToHSL(baseColor);

    // Generar paleta según esquema
    const generatePalette = () => {
      switch (scheme) {
        case 'analogous':
          return {
            primary: baseColor,
            secondary: hslToHex((baseHSL.h + 30) % 360, baseHSL.s, baseHSL.l),
            accent: hslToHex((baseHSL.h + 330) % 360, baseHSL.s, baseHSL.l),
          };
        case 'complementary':
          return {
            primary: baseColor,
            secondary: hslToHex((baseHSL.h + 180) % 360, baseHSL.s, baseHSL.l),
            accent: hslToHex((baseHSL.h + 90) % 360, baseHSL.s * 0.7, baseHSL.l),
          };
        case 'triadic':
          return {
            primary: baseColor,
            secondary: hslToHex((baseHSL.h + 120) % 360, baseHSL.s, baseHSL.l),
            accent: hslToHex((baseHSL.h + 240) % 360, baseHSL.s, baseHSL.l),
          };
        case 'split-complementary':
          return {
            primary: baseColor,
            secondary: hslToHex((baseHSL.h + 150) % 360, baseHSL.s, baseHSL.l),
            accent: hslToHex((baseHSL.h + 210) % 360, baseHSL.s, baseHSL.l),
          };
        default:
          return {
            primary: baseColor,
            secondary: baseColor,
            accent: baseColor,
          };
      }
    };

    return generatePalette();
  }, [baseColor, scheme]);

  // Notificar cuando se genera la paleta
  useMemo(() => {
    onPaletteGenerated?.(colors);
  }, [colors, onPaletteGenerated]);

  return (
    <div className="flex gap-2">
      <ColorSwatch color={colors.primary} name="Primary" />
      <ColorSwatch color={colors.secondary} name="Secondary" />
      <ColorSwatch color={colors.accent} name="Accent" />
    </div>
  );
}

export default COLOR_PALETTES;
