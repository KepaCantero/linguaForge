import { z } from 'zod';

// ============================================================
// ENUMS Y CONSTANTES
// ============================================================

export const LanguageCodeSchema = z.enum(['fr', 'de', 'es', 'it', 'pt']);
export const LevelCodeSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export const InputTypeSchema = z.enum(['audio', 'video', 'text']);
export const NodeStatusSchema = z.enum(['locked', 'active', 'completed']);
export const WeaknessTypeSchema = z.enum(['listening', 'reading', 'speaking']);
export const GrammaticalRoleSchema = z.enum(['subject', 'modal', 'verb', 'complement']);

// ============================================================
// JANUS MATRIX (Método Janulus)
// ============================================================

export const JanusCellSchema = z.object({
  id: z.string(),
  text: z.string(),
  translation: z.string(),
  audioUrl: z.string().optional(),
});

export const JanusColumnSchema = z.object({
  id: z.string(),
  label: z.string(),
  grammaticalRole: GrammaticalRoleSchema,
  cells: z.array(JanusCellSchema).min(4).max(6),
});

export const JanusMatrixSchema = z.object({
  id: z.string(),
  worldId: z.string(),
  title: z.string(),
  description: z.string(),
  columns: z.tuple([
    JanusColumnSchema,
    JanusColumnSchema,
    JanusColumnSchema,
    JanusColumnSchema,
  ]),
  targetRepetitions: z.number().default(25),
});

export const JanusCombinationSchema = z.object({
  cellIds: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  resultPhrase: z.string(),
  timestamp: z.string(),
});

// ============================================================
// EJERCICIOS CLÁSICOS
// ============================================================

export const VariationSchema = z.object({
  id: z.string(),
  text: z.string(),
  translation: z.string(),
  audioUrl: z.string().optional(),
});

export const ClozeOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

export const PhraseSchema = z.object({
  id: z.string(),
  text: z.string(),
  translation: z.string(),
  audioUrl: z.string().optional(),
  clozeWord: z.string(),
  clozeOptions: z.array(ClozeOptionSchema).length(4),
  variations: z.array(VariationSchema).min(2),
});

export const MiniTaskSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  promptTranslation: z.string(),
  keywords: z.array(z.string()).min(3),
  exampleResponse: z.string(),
  minWords: z.number().default(5),
});

// ============================================================
// ESTRUCTURA DE CONTENIDO
// ============================================================

export const MatrixSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  context: z.string(),
  phrases: z.array(PhraseSchema).min(5).max(10),
  miniTask: MiniTaskSchema,
});

export const WorldSchema = z.object({
  id: z.string(),
  languageCode: LanguageCodeSchema,
  levelCode: LevelCodeSchema,
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  janusMatrix: JanusMatrixSchema,
  matrices: z.array(MatrixSchema).min(3).max(7),
});

// ============================================================
// INPUT COMPRENSIBLE
// ============================================================

export const ComprehensionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

export const ComprehensionQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  questionTranslation: z.string(),
  options: z.array(ComprehensionOptionSchema).length(4),
});

export const InputContentSchema = z.object({
  id: z.string(),
  languageCode: LanguageCodeSchema,
  levelCode: LevelCodeSchema,
  type: InputTypeSchema,
  title: z.string(),
  description: z.string(),
  url: z.string(),
  wordCount: z.number(),
  durationSeconds: z.number().optional(),
  transcript: z.string().optional(),
  comprehensionQuestions: z.array(ComprehensionQuestionSchema).min(1).max(3),
});

// ============================================================
// INPUT STATS (Krashen)
// ============================================================

export const InputStatsSchema = z.object({
  wordsRead: z.number().default(0),
  wordsHeard: z.number().default(0),
  wordsSpoken: z.number().default(0),
  minutesListened: z.number().default(0),
  minutesRead: z.number().default(0),
});

export const InputEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: InputTypeSchema,
  contentId: z.string(),
  wordsCounted: z.number(),
  durationSeconds: z.number().optional(),
  understood: z.boolean(),
});

// ============================================================
// PROGRESO DE JANULUS
// ============================================================

export const JanusProgressSchema = z.object({
  matrixId: z.string(),
  cellUsage: z.record(z.string(), z.number()),
  combinations: z.array(JanusCombinationSchema),
  totalCombinations: z.number().default(0),
  uniqueCombinations: z.number().default(0),
  isComplete: z.boolean().default(false),
});

export const IntoningProgressSchema = z.object({
  matrixId: z.string(),
  columnId: z.string(),
  cyclesCompleted: z.number().default(0),
  isComplete: z.boolean().default(false),
});

// ============================================================
// GAMIFICACIÓN
// ============================================================

export const LevelInfoSchema = z.object({
  level: z.number(),
  xpRequired: z.number(),
  title: z.string(),
});

export const GamificationStateSchema = z.object({
  xp: z.number().default(0),
  level: z.number().default(1),
  coins: z.number().default(0),
  gems: z.number().default(0),
  streak: z.number().default(0),
  lastActiveDate: z.string().nullable(),
  longestStreak: z.number().default(0),
});

// ============================================================
// WORLD PROGRESS
// ============================================================

export const WorldProgressSchema = z.object({
  janusProgress: JanusProgressSchema.optional(),
  intoningProgress: z.array(IntoningProgressSchema).optional(),
  completedMatrices: z.array(z.string()),
  currentMatrixId: z.string().nullable(),
  isComplete: z.boolean().default(false),
});

// ============================================================
// PROGRESO GLOBAL DEL USUARIO
// ============================================================

export const UserProgressSchema = z.object({
  id: z.string(),
  activeLanguage: LanguageCodeSchema,
  activeLevel: LevelCodeSchema,
  worldProgress: z.record(z.string(), WorldProgressSchema),
  inputStats: z.record(z.string(), InputStatsSchema),
  gamification: GamificationStateSchema,
  inputEvents: z.array(InputEventSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================
// DIALOGUES (Método Krashen - Input Comprensible)
// ============================================================

export const TopicSchema = z.enum([
  'alojamiento', 'comida', 'transporte', 'saludos',
  'compras', 'emergencias', 'tiempo', 'familia'
]);

export const DialogueLineSchema = z.object({
  id: z.string(),
  speaker: z.string(),
  text: z.string().max(80),
  translation: z.string(),
  audioUrl: z.string().optional(),
  wordsPerMinute: z.number().min(80).max(120).optional(),
});

export const DialogueCharacterSchema = z.object({
  name: z.string(),
  role: z.string(),
  age: z.string().optional(),
});

export const DialogueSchema = z.object({
  id: z.string(),
  topic: TopicSchema,
  subcontext: z.string(),
  scenario: z.string(),
  characters: z.array(DialogueCharacterSchema).min(2).max(3),
  targetStructures: z.array(z.string()).max(4),
  lines: z.array(DialogueLineSchema).min(3).max(6),
  difficulty: z.enum(['beginner', 'elementary', 'pre-intermediate']).default('beginner'),
  estimatedMinutes: z.number().min(1).max(5).default(2),
});

export const DialogueCollectionSchema = z.object({
  topic: z.string(),
  subcontext: z.string(),
  dialogues: z.array(DialogueSchema),
  metadata: z.object({
    totalDialogues: z.number(),
    avgWordsPerDialogue: z.number(),
    targetStructuresCovered: z.array(z.string()),
    lastUpdated: z.string(),
  }),
});

// ============================================================
// MINI-STORIES (Historias Comprensibles)
// ============================================================

export const StorySchema = z.object({
  id: z.string(),
  topic: TopicSchema,
  subcontext: z.string(),
  scenario: z.string(),
  wordCount: z.number().max(100),
  text: z.string(),
  translation: z.string(),
  targetStructures: z.array(z.string()).max(3),
  keyVocabulary: z.array(z.string()),
  audioUrl: z.string().optional(),
  comprehensionQuestions: z.array(ComprehensionQuestionSchema).optional(),
});

export const StoryCollectionSchema = z.object({
  topic: z.string(),
  subcontext: z.string(),
  stories: z.array(StorySchema),
  metadata: z.object({
    totalStories: z.number(),
    avgWordCount: z.number(),
    lastUpdated: z.string(),
  }),
});

// ============================================================
// ACTIVIDADES INTERACTIVAS
// ============================================================

export const ClozeActivitySchema = z.object({
  id: z.string(),
  type: z.literal('cloze'),
  dialogueId: z.string(),
  sentence: z.string(),
  translation: z.string(),
  blanks: z.array(z.object({
    position: z.number(),
    answer: z.string(),
    hint: z.string().optional(),
  })),
  options: z.array(z.string()),
});

export const ShadowingActivitySchema = z.object({
  id: z.string(),
  type: z.literal('shadowing'),
  dialogueId: z.string(),
  audioUrl: z.string(),
  text: z.string(),
  translation: z.string(),
  speed: z.enum(['slow', 'normal', 'fast']),
  pauseDuration: z.number(),
});

export const PermutationActivitySchema = z.object({
  id: z.string(),
  type: z.literal('permutation'),
  matrixId: z.string(),
  baseStructure: z.string(),
  variations: z.array(z.object({
    french: z.string(),
    spanish: z.string(),
    isCorrect: z.boolean(),
  })),
});

export const ActivitySchema = z.discriminatedUnion('type', [
  ClozeActivitySchema,
  ShadowingActivitySchema,
  PermutationActivitySchema,
]);

export const ActivitiesCollectionSchema = z.object({
  topic: z.string(),
  subcontext: z.string(),
  activities: z.array(ActivitySchema),
  metadata: z.object({
    totalActivities: z.number(),
    byType: z.record(z.string(), z.number()),
    lastUpdated: z.string(),
  }),
});

// ============================================================
// TYPE INFERENCE
// ============================================================

export type LanguageCode = z.infer<typeof LanguageCodeSchema>;
export type LevelCode = z.infer<typeof LevelCodeSchema>;
export type InputType = z.infer<typeof InputTypeSchema>;
export type NodeStatus = z.infer<typeof NodeStatusSchema>;
export type WeaknessType = z.infer<typeof WeaknessTypeSchema>;
export type GrammaticalRole = z.infer<typeof GrammaticalRoleSchema>;

export type JanusCell = z.infer<typeof JanusCellSchema>;
export type JanusColumn = z.infer<typeof JanusColumnSchema>;
export type JanusMatrix = z.infer<typeof JanusMatrixSchema>;
export type JanusCombination = z.infer<typeof JanusCombinationSchema>;
export type JanusProgress = z.infer<typeof JanusProgressSchema>;
export type IntoningProgress = z.infer<typeof IntoningProgressSchema>;

export type Variation = z.infer<typeof VariationSchema>;
export type ClozeOption = z.infer<typeof ClozeOptionSchema>;
export type Phrase = z.infer<typeof PhraseSchema>;
export type MiniTask = z.infer<typeof MiniTaskSchema>;
export type Matrix = z.infer<typeof MatrixSchema>;
export type World = z.infer<typeof WorldSchema>;

export type ComprehensionOption = z.infer<typeof ComprehensionOptionSchema>;
export type ComprehensionQuestion = z.infer<typeof ComprehensionQuestionSchema>;
export type InputContent = z.infer<typeof InputContentSchema>;
export type InputStats = z.infer<typeof InputStatsSchema>;
export type InputEvent = z.infer<typeof InputEventSchema>;

export type LevelInfo = z.infer<typeof LevelInfoSchema>;
export type GamificationState = z.infer<typeof GamificationStateSchema>;
export type WorldProgress = z.infer<typeof WorldProgressSchema>;
export type UserProgress = z.infer<typeof UserProgressSchema>;

// Dialogues & Stories
export type Topic = z.infer<typeof TopicSchema>;
export type DialogueLine = z.infer<typeof DialogueLineSchema>;
export type DialogueCharacter = z.infer<typeof DialogueCharacterSchema>;
export type Dialogue = z.infer<typeof DialogueSchema>;
export type DialogueCollection = z.infer<typeof DialogueCollectionSchema>;
export type Story = z.infer<typeof StorySchema>;
export type StoryCollection = z.infer<typeof StoryCollectionSchema>;

// Activities
export type ClozeActivity = z.infer<typeof ClozeActivitySchema>;
export type ShadowingActivity = z.infer<typeof ShadowingActivitySchema>;
export type PermutationActivity = z.infer<typeof PermutationActivitySchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type ActivitiesCollection = z.infer<typeof ActivitiesCollectionSchema>;
