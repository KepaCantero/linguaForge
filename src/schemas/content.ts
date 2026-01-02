import { z } from 'zod';

// ============================================================
// ENUMS Y CONSTANTES
// ============================================================

export const LanguageCodeSchema = z.enum(['fr', 'de', 'es', 'it', 'pt']);
export const LevelCodeSchema = z.enum(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
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
// EJERCICIOS CLÁSICOS (Mantenidos para compatibilidad)
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

// ============================================================
// BLOQUES CONVERSACIONALES (Sistema de aprendizaje por interacción)
// ============================================================

export const BlockComponentSchema = z.object({
  id: z.string(),
  text: z.string(),
  translation: z.string(),
  audioUrl: z.string().optional(),
  speaker: z.enum(['user', 'other']), // Quién dice esta parte
});

// ============================================================
// ÁREA 0 - BASE ABSOLUTA (Campos adicionales)
// ============================================================

export const AudioTagSchema = z.enum(['slow', 'fast', 'office_background', 'street_background', 'quiet', 'noisy']);

export const CulturalNoteSchema = z.object({
  id: z.string(),
  text: z.string(),
  context: z.string().optional(), // Cuándo aplicar esta nota
});

export const SurvivalStrategySchema = z.object({
  id: z.string(),
  phrase: z.string(), // Frase de recuperación
  whenToUse: z.string(), // Cuándo usar esta estrategia
  translation: z.string(),
});

export const CommonErrorSchema = z.object({
  id: z.string(),
  error: z.string(), // Error común que se comete
  correct: z.string(), // Forma correcta
  explanation: z.string().optional(),
});

export const ConversationalBlockSchema = z.object({
  id: z.string(),
  title: z.string(), // Título descriptivo del bloque
  context: z.string(), // Situación donde ocurre
  blockType: z.enum(['emergency', 'routine', 'courtesy']), // Tipo de bloque
  // Frases dentro del bloque (cada frase tiene sus ejercicios Cloze y Variations)
  phrases: z.array(PhraseSchema).min(2), // Mínimo 2 frases por bloque
  audioUrl: z.string().optional(), // Audio completo del bloque
  durationSeconds: z.number().optional(),
  // Campos adicionales para ÁREA 0 (Base Absoluta)
  audioTags: z.array(AudioTagSchema).optional(), // Tags para audio (slow, office_background, etc.)
  culturalNotes: z.array(CulturalNoteSchema).optional(), // Notas culturales importantes
  survivalStrategies: z.array(SurvivalStrategySchema).optional(), // Estrategias de supervivencia
  commonErrors: z.array(CommonErrorSchema).optional(), // Errores comunes a evitar
  pronunciationTips: z.array(z.string()).optional(), // Tips de pronunciación específicos
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
// EJERCICIOS CORE v2.0 (GDD)
// ============================================================

export const ShardDetectionSchema = z.object({
  id: z.string(),
  audioUrl: z.string(),
  audioDuration: z.number(), // 3-8 segundos
  shards: z
    .array(
      z.object({
        id: z.string(),
        imageUrl: z.string(),
        isCorrect: z.boolean(),
      })
    )
    .length(3),
  phrase: z.string(),
  translation: z.string(),
});

export const VocabularySchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  word: z.string(), // Palabra correcta en francés
  translation: z.string(), // Traducción al español
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        isCorrect: z.boolean(),
      })
    )
    .length(4), // Exactamente 4 opciones
});

export const PragmaStrikeSchema = z.object({
  id: z.string(),
  situationImage: z.string(),
  situationDescription: z.string(),
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        isCorrect: z.boolean(),
        explanation: z.string(), // Por qué es más/menos cortés
      })
    )
    .min(3)
    .max(4),
  timeLimit: z.number().default(5), // segundos
});

export const ResonancePathSchema = z.object({
  id: z.string(),
  phrase: z.string(),
  audioUrl: z.string(),
  nativeIntonation: z.array(z.number()), // Array de valores de frecuencia (0-100 normalizados)
  targetAccuracy: z.number().default(80), // 0-100
});

export const EchoStreamSchema = z.object({
  id: z.string(),
  audioUrl: z.string(),
  audioDuration: z.number(),
  powerWords: z.array(
    z.object({
      word: z.string(),
      timestamp: z.number(), // Segundos desde inicio
      tolerance: z.number().default(0.5), // Tolerancia en segundos
    })
  ),
  phrase: z.string(),
  translation: z.string(),
});

export const GlyphWeavingSchema = z.object({
  id: z.string(),
  audioUrl: z.string(),
  bpm: z.number(), // Beats per minute
  pattern: z.array(
    z.object({
      fromGlyph: z.string(), // ID del glifo origen
      toGlyph: z.string(), // ID del glifo destino
      beat: z.number(), // Beat número (1, 2, 3, 4...)
    })
  ),
  glyphs: z.array(
    z.object({
      id: z.string(),
      symbol: z.string(), // Carácter Unicode o emoji
      position: z.object({ x: z.number(), y: z.number() }),
    })
  ),
});

// ============================================================
// EJERCICIOS DE BLOQUES CONVERSACIONALES
// ============================================================

// Block Builder: Construir un bloque válido uniendo componentes
export const BlockBuilderSchema = z.object({
  id: z.string(),
  blockId: z.string(), // ID del bloque conversacional de referencia
  components: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      translation: z.string(),
      componentType: z.enum(['inicio', 'desarrollo', 'resolucion', 'cierre']),
      isCorrect: z.boolean(), // Si pertenece al bloque correcto
      position: z.number(), // Posición correcta en el bloque (0, 1, 2, 3...)
    })
  ).min(4), // Mínimo 4 componentes (inicio, desarrollo, resolución, cierre)
  distractors: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      translation: z.string(),
      componentType: z.enum(['inicio', 'desarrollo', 'resolucion', 'cierre']),
    })
  ).optional(), // Componentes distractores de otros bloques
});

// Block Swap: Cambiar un componente para crear una nueva situación
export const BlockSwapSchema = z.object({
  id: z.string(),
  blockId: z.string(), // ID del bloque base
  componentToSwap: z.enum(['inicio', 'desarrollo', 'resolucion', 'cierre']),
  swapOptions: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      translation: z.string(),
      createsValidBlock: z.boolean(), // Si crea un bloque válido
      newContext: z.string().optional(), // Nueva situación creada
    })
  ).min(2).max(4),
});

// Block Echo: Repetición de bloques completos (no frases)
export const BlockEchoSchema = z.object({
  id: z.string(),
  blockId: z.string(), // ID del bloque a repetir
  audioUrl: z.string(),
  audioDuration: z.number(),
  targetAccuracy: z.number().default(75), // Precisión objetivo (0-100)
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
// LESSON CONTENT (Topic Tree Leaves)
// ============================================================

export const LessonModeSchema = z.enum(['academia', 'desafio']);

export const LessonContentSchema = z.object({
  leafId: z.string(), // ID del leaf del topic-tree
  languageCode: LanguageCodeSchema,
  levelCode: LevelCodeSchema,
  title: z.string(),
  titleFr: z.string(),
  // Bloques conversacionales (nuevo sistema - cada bloque contiene múltiples frases)
  conversationalBlocks: z.array(ConversationalBlockSchema).optional(),
  // Frases con ejercicios clásicos (cloze, variations) - DEPRECATED pero mantenido para compatibilidad
  phrases: z.array(PhraseSchema).min(3).max(10).optional(),
  // Ejercicios core v2.0 (según architectureStrategy.md)
  coreExercises: z.object({
    vocabulary: z.array(VocabularySchema).optional(),
    shardDetection: z.array(ShardDetectionSchema).optional(),
    pragmaStrike: z.array(PragmaStrikeSchema).optional(),
    echoStream: z.array(EchoStreamSchema).optional(),
    glyphWeaving: z.array(GlyphWeavingSchema).optional(),
    resonancePath: z.array(ResonancePathSchema).optional(),
  }).optional(),
  // Input comprensible (diálogos)
  inputContent: z.array(InputContentSchema).min(1).max(3),
  // Mini-test al final
  miniTest: z.object({
    id: z.string(),
    questions: z.array(ComprehensionQuestionSchema).min(3).max(5),
  }),
  // Mini-task de producción
  miniTask: MiniTaskSchema.optional(),
  // Configuración de modos
  modeConfig: z.object({
    academia: z.object({
      timeLimit: z.number().nullable().optional(), // Sin límite por defecto (null o undefined)
      showHints: z.boolean().default(true),
      showExplanations: z.boolean().default(true),
      allowRetries: z.boolean().default(true),
      xpMultiplier: z.number().default(1.0),
    }),
    desafio: z.object({
      timeLimit: z.number().default(15), // Minutos totales
      showHints: z.boolean().default(false),
      showExplanations: z.boolean().default(false),
      allowRetries: z.boolean().default(false),
      xpMultiplier: z.number().default(1.5),
      gemsReward: z.number().default(10), // Gems adicionales por completar
    }),
  }).optional(),
}).refine(
  (data) => {
    // Debe tener al menos bloques conversacionales, phrases o algún ejercicio core
    const hasBlocks = data.conversationalBlocks && data.conversationalBlocks.length > 0;
    const hasPhrases = data.phrases && data.phrases.length > 0;
    const hasCoreExercises = data.coreExercises && (
      (data.coreExercises.shardDetection && data.coreExercises.shardDetection.length > 0) ||
      (data.coreExercises.pragmaStrike && data.coreExercises.pragmaStrike.length > 0) ||
      (data.coreExercises.echoStream && data.coreExercises.echoStream.length > 0) ||
      (data.coreExercises.glyphWeaving && data.coreExercises.glyphWeaving.length > 0) ||
      (data.coreExercises.resonancePath && data.coreExercises.resonancePath.length > 0)
    );
    return hasBlocks || hasPhrases || hasCoreExercises;
  },
  {
    message: "Lesson must have at least conversational blocks, phrases or core exercises",
  }
);

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

// Ejercicios Core v2.0
export type ShardDetection = z.infer<typeof ShardDetectionSchema>;
export type ShardDetectionShard = z.infer<typeof ShardDetectionSchema>['shards'][number];
export type PragmaStrike = z.infer<typeof PragmaStrikeSchema>;
export type PragmaStrikeOption = z.infer<typeof PragmaStrikeSchema>['options'][number];
export type Vocabulary = z.infer<typeof VocabularySchema>;
export type VocabularyOption = z.infer<typeof VocabularySchema>['options'][number];
export type ResonancePath = z.infer<typeof ResonancePathSchema>;
export type EchoStream = z.infer<typeof EchoStreamSchema>;
export type EchoStreamPowerWord = z.infer<typeof EchoStreamSchema>['powerWords'][number];
export type GlyphWeaving = z.infer<typeof GlyphWeavingSchema>;
export type GlyphWeavingGlyph = z.infer<typeof GlyphWeavingSchema>['glyphs'][number];
export type GlyphWeavingPattern = z.infer<typeof GlyphWeavingSchema>['pattern'][number];

// Bloques Conversacionales
export type BlockComponent = z.infer<typeof BlockComponentSchema>;
export type ConversationalBlock = z.infer<typeof ConversationalBlockSchema>;
export type BlockBuilder = z.infer<typeof BlockBuilderSchema>;
export type BlockSwap = z.infer<typeof BlockSwapSchema>;
export type BlockEcho = z.infer<typeof BlockEchoSchema>;

// ÁREA 0 - Base Absoluta
export type AudioTag = z.infer<typeof AudioTagSchema>;
export type CulturalNote = z.infer<typeof CulturalNoteSchema>;
export type SurvivalStrategy = z.infer<typeof SurvivalStrategySchema>;
export type CommonError = z.infer<typeof CommonErrorSchema>;

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

// Lesson Content
export type LessonMode = z.infer<typeof LessonModeSchema>;
export type LessonContent = z.infer<typeof LessonContentSchema>;
