import { z } from 'zod';

// ============================================
// ENUMS Y CONSTANTES
// ============================================

export const ReviewResponseValues = ['again', 'hard', 'good', 'easy'] as const;
export type ReviewResponse = (typeof ReviewResponseValues)[number];

export const ContentSourceTypeValues = ['video', 'audio', 'text'] as const;
export type ContentSourceType = (typeof ContentSourceTypeValues)[number];

export const CardStatusValues = ['new', 'learning', 'review', 'graduated'] as const;
export type CardStatus = (typeof CardStatusValues)[number];

// ============================================
// SCHEMAS ZOD
// ============================================

// Fuente del contenido (de dónde viene la frase)
export const ContentSourceSchema = z.object({
  type: z.enum(ContentSourceTypeValues),
  id: z.string(), // ID del video/audio/texto
  title: z.string(), // Título del contenido
  timestamp: z.number().optional(), // Segundo donde aparece (para video/audio)
  context: z.string().optional(), // Descripción del contexto/escena
  url: z.string().optional(), // URL del contenido original
});

export type ContentSource = z.infer<typeof ContentSourceSchema>;

// Historial de un repaso individual
export const ReviewHistoryEntrySchema = z.object({
  date: z.string(), // ISO date string
  response: z.enum(ReviewResponseValues),
  timeSpentMs: z.number(), // Tiempo que tardó en responder
});

export type ReviewHistoryEntry = z.infer<typeof ReviewHistoryEntrySchema>;

// Estado FSRS v6 (opcional, para migración gradual)
export const FSRSStateSchema = z.object({
  due: z.string(), // ISO date
  stability: z.number(),
  difficulty: z.number(),
  elapsed_days: z.number(),
  scheduled_days: z.number(),
  reps: z.number(),
  lapses: z.number(),
  state: z.enum(['New', 'Learning', 'Review', 'Relearning']),
  last_review: z.string().optional(), // ISO date
});

export type FSRSState = z.infer<typeof FSRSStateSchema>;

// Tarjeta SRS individual
export const SRSCardSchema = z.object({
  id: z.string(),

  // Contenido de la tarjeta
  phrase: z.string(), // Frase en francés
  translation: z.string(), // Traducción en español
  audioUrl: z.string().optional(), // URL del audio de la frase

  // Fuente y contexto
  source: ContentSourceSchema,

  // Metadatos de creación
  createdAt: z.string(), // ISO date
  languageCode: z.string().default('fr'),
  levelCode: z.string().default('A1'),

  // Estado SM-2 (legacy, mantener para compatibilidad)
  status: z.enum(CardStatusValues).default('new'),
  easeFactor: z.number().default(2.5), // Factor de facilidad (2.5 default SM-2)
  interval: z.number().default(0), // Intervalo actual en días
  repetitions: z.number().default(0), // Número de repeticiones consecutivas correctas

  // Próximo repaso
  nextReviewDate: z.string(), // ISO date del próximo repaso

  // Estado FSRS v6 (nuevo, migración gradual)
  fsrs: FSRSStateSchema.optional(),

  // Algoritmo usado para esta tarjeta
  algorithm: z.enum(['sm2', 'fsrs']).default('fsrs'),

  // Historial
  reviewHistory: z.array(ReviewHistoryEntrySchema).default([]),

  // Tags opcionales
  tags: z.array(z.string()).default([]),

  // Notas del usuario
  notes: z.string().optional(),
});

export type SRSCard = z.infer<typeof SRSCardSchema>;

// Estadísticas del SRS
export const SRSStatsSchema = z.object({
  totalCards: z.number(),
  newCards: z.number(),
  learningCards: z.number(),
  reviewCards: z.number(),
  graduatedCards: z.number(),

  // Estadísticas de hoy
  reviewedToday: z.number(),
  correctToday: z.number(),
  incorrectToday: z.number(),

  // Estadísticas generales
  averageEaseFactor: z.number(),
  retentionRate: z.number(), // Porcentaje de aciertos
  totalReviews: z.number(),

  // Racha
  streakDays: z.number(),
  lastReviewDate: z.string().nullable(),
});

export type SRSStats = z.infer<typeof SRSStatsSchema>;

// Input para crear una nueva tarjeta
export const CreateSRSCardInputSchema = z.object({
  phrase: z.string().min(1),
  translation: z.string().min(1),
  audioUrl: z.string().optional(),
  source: ContentSourceSchema,
  languageCode: z.string().default('fr'),
  levelCode: z.string().default('A1'),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type CreateSRSCardInput = z.infer<typeof CreateSRSCardInputSchema>;

// Resultado de una sesión de repaso
export const ReviewSessionResultSchema = z.object({
  cardsReviewed: z.number(),
  correctCount: z.number(),
  incorrectCount: z.number(),
  averageTimeMs: z.number(),
  xpEarned: z.number(),
  sessionDurationMs: z.number(),
});

export type ReviewSessionResult = z.infer<typeof ReviewSessionResultSchema>;

// Frase del transcript para guardar
export const TranscriptPhraseSchema = z.object({
  id: z.string(),
  text: z.string(), // Texto en francés
  translation: z.string().optional(), // Traducción
  startTime: z.number(), // Segundo de inicio
  endTime: z.number(), // Segundo de fin
  audioUrl: z.string().optional(), // Audio aislado de la frase
});

export type TranscriptPhrase = z.infer<typeof TranscriptPhraseSchema>;

// Transcript completo
export const TranscriptSchema = z.object({
  contentId: z.string(),
  languageCode: z.string(),
  phrases: z.array(TranscriptPhraseSchema),
});

export type Transcript = z.infer<typeof TranscriptSchema>;

// Palabra detectada como nueva
export const DetectedWordSchema = z.object({
  word: z.string(),
  lemma: z.string(), // Forma base
  translation: z.string(),
  frequency: z.number(), // Frecuencia en el idioma (1-10)
  isNew: z.boolean(), // Si el usuario no la ha visto
  phraseContext: z.string(), // Frase donde aparece
});

export type DetectedWord = z.infer<typeof DetectedWordSchema>;

// ============================================
// CONFIGURACIÓN SRS
// ============================================

export const SRS_CONFIG = {
  // Límites diarios sugeridos
  maxNewCardsPerDay: 10,
  maxReviewsPerDay: 50,

  // Intervalos SM-2 (en días)
  initialInterval: 1,
  graduationInterval: 21, // Días para considerar "graduada"

  // Factores de facilidad
  minEaseFactor: 1.3,
  maxEaseFactor: 3.0,
  defaultEaseFactor: 2.5,

  // Modificadores por respuesta
  easeModifiers: {
    again: -0.2,
    hard: -0.15,
    good: 0,
    easy: 0.15,
  } as const,

  // Intervalos por respuesta para cards nuevas
  newCardIntervals: {
    again: 0, // Repetir inmediatamente (en minutos, 0 = mismo día)
    hard: 1, // 1 día
    good: 3, // 3 días
    easy: 7, // 7 días
  } as const,

  // XP por acciones
  xp: {
    cardReviewed: 5,
    cardCorrect: 10,
    cardEasy: 15,
    cardGraduated: 50,
    phraseSaved: 15,
    sessionCompleted: 25,
  } as const,
} as const;

export type SRSConfig = typeof SRS_CONFIG;
