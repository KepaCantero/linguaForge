import { z } from 'zod';

// ============================================
// TIPOS BASE
// ============================================

/**
 * Tipo de calentamiento según zona cerebral a activar
 */
export const WarmupTypeSchema = z.enum([
  'rhythmSequence',    // Gramática → Ganglios Basales
  'visualMatch',       // Vocabulario → Lóbulo Temporal
  'voiceImitation',    // Pronunciación → Cerebelo
]);

export type WarmupType = z.infer<typeof WarmupTypeSchema>;

/**
 * Tipo de misión asociada
 */
export const MissionTypeSchema = z.enum([
  'grammar',
  'vocabulary',
  'pronunciation',
  'mixed',
]);

export type MissionType = z.infer<typeof MissionTypeSchema>;

/**
 * Nivel de dificultad
 */
export const DifficultySchema = z.enum(['low', 'medium', 'high']);

export type Difficulty = z.infer<typeof DifficultySchema>;

/**
 * Estilo visual para Rhythm Sequence
 */
export const VisualStyleSchema = z.enum(['geometric', 'wave', 'particles']);

export type VisualStyle = z.infer<typeof VisualStyleSchema>;

/**
 * Tipo de acción táctil
 */
export const TouchActionSchema = z.enum(['tap', 'hold', 'swipe']);

export type TouchAction = z.infer<typeof TouchActionSchema>;

/**
 * Guía visual para Voice Imitation
 */
export const VisualGuideSchema = z.enum(['line', 'wave', 'ball']);

export type VisualGuide = z.infer<typeof VisualGuideSchema>;

// ============================================
// CONFIGURACIONES ESPECÍFICAS
// ============================================

/**
 * Patrón de secuencia rítmica
 */
export const RhythmPatternSchema = z.object({
  pattern: z.array(TouchActionSchema),
  duration: z.number().positive(), // ms
  bpm: z.number().min(60).max(140),
});

export type RhythmPattern = z.infer<typeof RhythmPatternSchema>;

/**
 * Configuración de Rhythm Sequence Warmup
 */
export const RhythmSequenceConfigSchema = z.object({
  sequences: z.array(RhythmPatternSchema).min(3).max(5),
  visualStyle: VisualStyleSchema.default('geometric'),
  soundEnabled: z.boolean().default(true),
});

export type RhythmSequenceConfig = z.infer<typeof RhythmSequenceConfigSchema>;

/**
 * Imagen para Visual Match
 */
export const VisualMatchImageSchema = z.object({
  url: z.string().url(),
  category: z.string(),
  blurLevel: z.number().min(0).max(10),
  correctAnswer: z.string().optional(), // Para validación
});

export type VisualMatchImage = z.infer<typeof VisualMatchImageSchema>;

/**
 * Configuración de Visual Match Warmup
 */
export const VisualMatchConfigSchema = z.object({
  images: z.array(VisualMatchImageSchema).min(5).max(10),
  focusSpeed: z.number().min(200).max(1000), // ms
  recognitionThreshold: z.number().min(0.3).max(0.9),
  speedIncrease: z.number().min(0.05).max(0.2).default(0.1), // Incremento por imagen
});

export type VisualMatchConfig = z.infer<typeof VisualMatchConfigSchema>;

/**
 * Patrón de frecuencia para Voice Imitation
 */
export const FrequencyPatternSchema = z.object({
  frequency: z.number().positive(), // Hz
  duration: z.number().positive(), // ms
});

export type FrequencyPattern = z.infer<typeof FrequencyPatternSchema>;

/**
 * Configuración de Voice Imitation Warmup
 */
export const VoiceImitationConfigSchema = z.object({
  pattern: z.array(FrequencyPatternSchema).min(3).max(8),
  visualGuide: VisualGuideSchema.default('line'),
  tolerance: z.number().min(0.1).max(0.5).default(0.2), // % de desviación aceptada
  minFrequency: z.number().positive().default(100), // Hz
  maxFrequency: z.number().positive().default(500), // Hz
});

export type VoiceImitationConfig = z.infer<typeof VoiceImitationConfigSchema>;

// ============================================
// SCHEMA PRINCIPAL
// ============================================

/**
 * Schema principal de Warmup usando discriminated union
 */
export const WarmupSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('rhythmSequence'),
    title: z.string(),
    description: z.string(),
    duration: z.number().min(30).max(90), // segundos
    config: RhythmSequenceConfigSchema,
    missionType: MissionTypeSchema,
    difficulty: DifficultySchema.default('medium'),
    adaptive: z.boolean().default(true),
  }),
  z.object({
    id: z.string(),
    type: z.literal('visualMatch'),
    title: z.string(),
    description: z.string(),
    duration: z.number().min(30).max(90),
    config: VisualMatchConfigSchema,
    missionType: MissionTypeSchema,
    difficulty: DifficultySchema.default('medium'),
    adaptive: z.boolean().default(true),
  }),
  z.object({
    id: z.string(),
    type: z.literal('voiceImitation'),
    title: z.string(),
    description: z.string(),
    duration: z.number().min(30).max(90),
    config: VoiceImitationConfigSchema,
    missionType: MissionTypeSchema,
    difficulty: DifficultySchema.default('medium'),
    adaptive: z.boolean().default(true),
  }),
]);

export type Warmup = z.infer<typeof WarmupSchema>;

// ============================================
// RESULTADOS Y MÉTRICAS
// ============================================

/**
 * Resultado de un calentamiento completado
 */
export const WarmupResultSchema = z.object({
  warmupId: z.string(),
  missionId: z.string(),
  score: z.number().min(0).max(100),
  timeSpent: z.number().positive(), // segundos
  completedAt: z.string().datetime(),
  skipped: z.boolean().default(false),
});

export type WarmupResult = z.infer<typeof WarmupResultSchema>;

/**
 * Métricas de rendimiento en calentamiento
 */
export const WarmupMetricsSchema = z.object({
  averageScore: z.number().min(0).max(100),
  averageTime: z.number().positive(),
  completionRate: z.number().min(0).max(1),
  skipRate: z.number().min(0).max(1),
  lastCompleted: z.string().datetime().nullable(),
});

export type WarmupMetrics = z.infer<typeof WarmupMetricsSchema>;

