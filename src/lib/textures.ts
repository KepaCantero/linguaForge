/**
 * Sistema de Texturas para Memory Bank AAA
 * Texturas contextuales basadas en escenarios de aprendizaje
 *
 * TAREA 2.8.1: Sistema de Texturas (Paper/Wood/Metal)
 */

import { z } from 'zod';

// ============================================
// TIPOS Y SCHEMAS
// ============================================

export const TextureTypeSchema = z.enum(['paper', 'wood', 'stone', 'glass', 'metal', 'crystal']);
export type TextureType = z.infer<typeof TextureTypeSchema>;

export const LearningContextSchema = z.enum([
  'vocabulary',      // Vocabulario diario
  'conversation',    // Frases y conversaciones
  'grammar',         // Conceptos gramaticales
  'culture',         // Contenido cultural
  'advanced',        // Contenido avanzado
]);
export type LearningContext = z.infer<typeof LearningContextSchema>;

export const TexturePropertiesSchema = z.object({
  type: TextureTypeSchema,
  name: z.string(),
  description: z.string(),
  // Propiedades PBR (Physically Based Rendering)
  roughness: z.number().min(0).max(1),
  metalness: z.number().min(0).max(1),
  reflectivity: z.number().min(0).max(1),
  transparency: z.number().min(0).max(1),
  // Colores
  baseColor: z.string(),
  accentColor: z.string(),
  // Propiedades visuales CSS
  gradient: z.string(),
  shadow: z.string(),
  border: z.string(),
  // Contextos de aprendizaje asociados
  learningContexts: z.array(LearningContextSchema),
  // Peso percibido (afecta física de animaciones)
  weight: z.number().min(0.1).max(2),
  // Sonido asociado
  soundProfile: z.enum(['soft', 'solid', 'resonant', 'crisp', 'deep']),
});

export type TextureProperties = z.infer<typeof TexturePropertiesSchema>;

// ============================================
// DEFINICIÓN DE TEXTURAS
// ============================================

export const TEXTURES: Record<TextureType, TextureProperties> = {
  paper: {
    type: 'paper',
    name: 'Papel',
    description: 'Textura suave de papel para vocabulario diario',
    roughness: 0.9,
    metalness: 0,
    reflectivity: 0.1,
    transparency: 0,
    baseColor: '#FEFCF3',
    accentColor: '#E8E4D9',
    gradient: 'linear-gradient(135deg, #FEFCF3 0%, #F5F1E6 50%, #E8E4D9 100%)',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    learningContexts: ['vocabulary'],
    weight: 0.3,
    soundProfile: 'soft',
  },
  wood: {
    type: 'wood',
    name: 'Madera',
    description: 'Textura cálida de madera para conversaciones',
    roughness: 0.7,
    metalness: 0,
    reflectivity: 0.15,
    transparency: 0,
    baseColor: '#8B7355',
    accentColor: '#6B5344',
    gradient: 'linear-gradient(135deg, #A08060 0%, #8B7355 40%, #6B5344 100%)',
    shadow: '0 6px 16px rgba(107, 83, 68, 0.25)',
    border: '1px solid rgba(107, 83, 68, 0.3)',
    learningContexts: ['conversation', 'culture'],
    weight: 0.8,
    soundProfile: 'solid',
  },
  stone: {
    type: 'stone',
    name: 'Piedra',
    description: 'Textura sólida de piedra para fundamentos',
    roughness: 0.85,
    metalness: 0,
    reflectivity: 0.05,
    transparency: 0,
    baseColor: '#8C8C8C',
    accentColor: '#5C5C5C',
    gradient: 'linear-gradient(135deg, #A0A0A0 0%, #8C8C8C 40%, #5C5C5C 100%)',
    shadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(0, 0, 0, 0.15)',
    learningContexts: ['grammar'],
    weight: 1.2,
    soundProfile: 'deep',
  },
  glass: {
    type: 'glass',
    name: 'Cristal',
    description: 'Textura translúcida de cristal para claridad',
    roughness: 0.1,
    metalness: 0.1,
    reflectivity: 0.8,
    transparency: 0.3,
    baseColor: '#E8F4F8',
    accentColor: '#B8D4E3',
    gradient: 'linear-gradient(135deg, rgba(232, 244, 248, 0.9) 0%, rgba(184, 212, 227, 0.8) 100%)',
    shadow: '0 4px 24px rgba(184, 212, 227, 0.4)',
    border: '1px solid rgba(184, 212, 227, 0.5)',
    learningContexts: ['vocabulary', 'culture'],
    weight: 0.5,
    soundProfile: 'crisp',
  },
  metal: {
    type: 'metal',
    name: 'Metal',
    description: 'Textura metálica para conceptos gramaticales permanentes',
    roughness: 0.3,
    metalness: 0.9,
    reflectivity: 0.7,
    transparency: 0,
    baseColor: '#C0C0C0',
    accentColor: '#808080',
    gradient: 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 30%, #A0A0A0 70%, #808080 100%)',
    shadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(128, 128, 128, 0.4)',
    learningContexts: ['grammar', 'advanced'],
    weight: 1.0,
    soundProfile: 'resonant',
  },
  crystal: {
    type: 'crystal',
    name: 'Cristal Mágico',
    description: 'Textura premium de cristal para contenido avanzado',
    roughness: 0.05,
    metalness: 0.2,
    reflectivity: 0.95,
    transparency: 0.2,
    baseColor: '#9B59B6',
    accentColor: '#8E44AD',
    gradient: 'linear-gradient(135deg, #BB8FCE 0%, #9B59B6 40%, #8E44AD 100%)',
    shadow: '0 8px 32px rgba(155, 89, 182, 0.4)',
    border: '1px solid rgba(142, 68, 173, 0.5)',
    learningContexts: ['advanced'],
    weight: 0.6,
    soundProfile: 'crisp',
  },
};

// ============================================
// MAPEO CONTEXTO -> TEXTURA
// ============================================

const CONTEXT_TO_TEXTURE_MAP: Record<LearningContext, TextureType> = {
  vocabulary: 'paper',
  conversation: 'wood',
  grammar: 'metal',
  culture: 'glass',
  advanced: 'crystal',
};

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Obtiene la textura apropiada para un contexto de aprendizaje
 */
export function getTextureForContext(context: LearningContext): TextureProperties {
  const textureType = CONTEXT_TO_TEXTURE_MAP[context];
  return TEXTURES[textureType];
}

/**
 * Obtiene la textura por tipo
 */
export function getTextureByType(type: TextureType): TextureProperties {
  return TEXTURES[type];
}

/**
 * Genera estilos CSS para una textura
 */
export function getTextureStyles(texture: TextureProperties): React.CSSProperties {
  return {
    background: texture.gradient,
    boxShadow: texture.shadow,
    border: texture.border,
  };
}

/**
 * Genera estilos CSS con hover state
 */
export function getTextureHoverStyles(texture: TextureProperties): {
  base: React.CSSProperties;
  hover: React.CSSProperties;
} {
  return {
    base: getTextureStyles(texture),
    hover: {
      boxShadow: texture.shadow.replace(/\d+px/g, (match) => {
        const num = parseInt(match);
        return `${Math.round(num * 1.3)}px`;
      }),
      transform: 'translateY(-2px)',
    },
  };
}

/**
 * Calcula parámetros de física para animaciones basados en el peso de la textura
 */
export function getPhysicsConfig(texture: TextureProperties): {
  stiffness: number;
  damping: number;
  mass: number;
} {
  const weight = texture.weight;

  return {
    stiffness: 300 / weight,       // Más pesado = menos rígido
    damping: 20 + (weight * 10),   // Más pesado = más amortiguación
    mass: weight,                   // Masa directa
  };
}

/**
 * Obtiene todas las texturas para un contexto específico
 */
export function getTexturesForContext(context: LearningContext): TextureProperties[] {
  return Object.values(TEXTURES).filter(
    texture => texture.learningContexts.includes(context)
  );
}

/**
 * Valida una textura en runtime
 */
export function validateTexture(texture: unknown): TextureProperties {
  return TexturePropertiesSchema.parse(texture);
}

// ============================================
// HOOKS PARA REACT
// ============================================

/**
 * Hook para obtener textura basada en contexto
 * Uso: const texture = useTexture('vocabulary');
 */
export function useTexture(context: LearningContext): TextureProperties {
  return getTextureForContext(context);
}

/**
 * Hook para obtener estilos de textura
 * Uso: const styles = useTextureStyles('vocabulary');
 */
export function useTextureStyles(context: LearningContext): React.CSSProperties {
  const texture = getTextureForContext(context);
  return getTextureStyles(texture);
}

// ============================================
// CONSTANTES EXPORTADAS
// ============================================

export const TEXTURE_TYPES = Object.keys(TEXTURES) as TextureType[];
export const LEARNING_CONTEXTS = Object.keys(CONTEXT_TO_TEXTURE_MAP) as LearningContext[];

export default TEXTURES;
