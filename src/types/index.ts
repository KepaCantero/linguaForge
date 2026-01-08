// Re-export all types from schemas
export type {
  LanguageCode,
  LevelCode,
  InputType,
  NodeStatus,
  WeaknessType,
  GrammaticalRole,
  JanusCell,
  JanusColumn,
  JanusMatrix,
  JanusCombination,
  JanusProgress,
  IntoningProgress,
  Variation,
  ClozeOption,
  Phrase,
  MiniTask,
  Matrix,
  World,
  ComprehensionOption,
  ComprehensionQuestion,
  InputContent,
  InputStats,
  InputEvent,
  LevelInfo,
  GamificationState,
  WorldProgress,
  UserProgress,
  Vocabulary,
  VocabularyOption,
  ShardDetection,
  ShardDetectionShard,
  PragmaStrike,
  PragmaStrikeOption,
  ResonancePath,
  EchoStream,
  EchoStreamPowerWord,
  GlyphWeaving,
  GlyphWeavingGlyph,
  GlyphWeavingPattern,
  BlockComponent,
  ConversationalBlock,
  BlockBuilder,
  BlockSwap,
  BlockEcho,
  LessonContent,
  LessonMode,
  AudioTag,
  CulturalNote,
  SurvivalStrategy,
  CommonError,
} from '@/schemas/content';

// Re-export topic tree types
export type {
  TopicLeaf,
  TopicBranch,
  TopicTree,
  TreeProgress,
} from '@/schemas/topicTree';

// Re-export schemas for validation
export {
  LanguageCodeSchema,
  LevelCodeSchema,
  InputTypeSchema,
  NodeStatusSchema,
  WeaknessTypeSchema,
  GrammaticalRoleSchema,
  JanusCellSchema,
  JanusColumnSchema,
  JanusMatrixSchema,
  JanusCombinationSchema,
  JanusProgressSchema,
  IntoningProgressSchema,
  VariationSchema,
  ClozeOptionSchema,
  PhraseSchema,
  MiniTaskSchema,
  MatrixSchema,
  WorldSchema,
  ComprehensionOptionSchema,
  ComprehensionQuestionSchema,
  InputContentSchema,
  InputStatsSchema,
  InputEventSchema,
  LevelInfoSchema,
  GamificationStateSchema,
  WorldProgressSchema,
  UserProgressSchema,
  VocabularySchema,
  ShardDetectionSchema,
  PragmaStrikeSchema,
  ResonancePathSchema,
  EchoStreamSchema,
  GlyphWeavingSchema,
  BlockComponentSchema,
  ConversationalBlockSchema,
  BlockBuilderSchema,
  BlockSwapSchema,
  BlockEchoSchema,
  LessonContentSchema,
  AudioTagSchema,
  CulturalNoteSchema,
  SurvivalStrategySchema,
  CommonErrorSchema,
} from '@/schemas/content';

// Re-export topic tree schemas
export {
  TopicLeafSchema,
  TopicBranchSchema,
  TopicTreeSchema,
  TreeProgressSchema,
} from '@/schemas/topicTree';

// Re-export constants
export {
  SUPPORTED_LANGUAGES,
  SUPPORTED_LEVELS,
  INPUT_TYPES,
  NODE_STATUSES,
  GRAMMATICAL_ROLES,
  LEVEL_THRESHOLDS,
  XP_RULES,
  COIN_RULES,
  GEM_RULES,
  USER_LEVELS,
  JANUS_CONFIG,
  SHADOWING_CONFIG,
  INPUT_CONFIG,
  MINITASK_CONFIG,
  STREAK_CONFIG,
  APP_COLORS,
  BRANCH_COLORS,
  HUNTER_RANKS,
  RANK_UNLOCK_RULES,
  getLevelByXP,
  getXPToNextLevel,
  getLevelProgress,
  getRankByXP,
  getRankProgress,
  canAccessContent,
} from '@/lib/constants';

export type {
  SupportedLanguage,
  SupportedLevel,
  HunterRank,
  HunterRankInfo,
} from '@/lib/constants';

// Re-export new exercise types
export type {
  ConversationalEcho,
  ConversationalEchoResponse,
  DialogueIntonation,
  DialogueIntonationTurn,
  InteractiveSpeech,
  InteractiveSpeechNode,
  JanusComposer,
  JanusComposerColumn,
} from '@/schemas/content';

export {
  ConversationalEchoSchema,
  DialogueIntonationSchema,
  InteractiveSpeechSchema,
  JanusComposerSchema,
} from '@/schemas/content';

// ============================================================
// EVALUATION RESULT TYPES (for new exercises)
// ============================================================

// Conversational Echo evaluation
export interface EchoEvaluationResult {
  isValid: boolean;
  matchedResponse: string | null;
  scores: {
    intention: number; // 0-100: ¿La respuesta tiene sentido?
    keywords: number; // 0-100: ¿Contiene palabras clave?
    rhythm: number; // 0-100: ¿Fluye naturalmente?
  };
  feedback: {
    type: 'perfect' | 'acceptable' | 'poor' | 'out_of_context' | 'timeout';
    message: string;
    tip?: string;
  };
  xpEarned: number;
}

// Dialogue Intonation evaluation
export interface RhythmAnalysis {
  pattern: number[]; // Duración de cada segmento en ms
  pauses: number[]; // Duración de pausas en ms
  overallSimilarity: number; // 0-100 comparado con nativo
  feedback?: string;
}

export interface IntonationEvaluationResult {
  turnIndex: number;
  rhythmAnalysis: RhythmAnalysis;
  isAcceptable: boolean; // >= 70% similarity
  xpEarned: number;
}

// Interactive Speech evaluation
export interface SpeechTurnResult {
  turnIndex: number;
  responseTime: number; // ms
  detectedText: string;
  isValidResponse: boolean;
  fluencyScore: number; // 0-100
}

export interface InteractiveSpeechResult {
  completedTurns: number;
  totalTurns: number;
  averageResponseTime: number;
  overallFluency: number;
  xpEarned: number;
}

// Janus Composer evaluation
export interface JanusCompositionResult {
  selectedOptions: Record<string, string>; // columnId -> optionId
  generatedPhrase: string;
  conjugatedPhrase: string; // Con conjugación automática
  translation: string;
  audioUrl?: string;
  isGrammaticallyCorrect: boolean;
}

// Speech Recording types
export interface SpeechRecordingResult {
  audioBlob: Blob;
  duration: number; // ms
  transcript?: string; // Si se usa Web Speech API
  confidence?: number; // 0-1
}

export interface SpeechRecorderConfig {
  maxDuration: number; // segundos
  silenceThreshold: number; // 0-1
  silenceTimeout: number; // ms antes de auto-stop
  autoStart: boolean;
}

// Re-export SRS types
export type {
  ReviewResponse,
  ContentSourceType,
  CardStatus,
  ContentSource,
  ReviewHistoryEntry,
  SRSCard,
  SRSStats,
  CreateSRSCardInput,
  ReviewSessionResult,
  TranscriptPhrase,
  Transcript,
  DetectedWord,
  SRSConfig,
} from './srs';

export {
  ReviewResponseValues,
  ContentSourceTypeValues,
  CardStatusValues,
  ContentSourceSchema,
  ReviewHistoryEntrySchema,
  SRSCardSchema,
  SRSStatsSchema,
  CreateSRSCardInputSchema,
  ReviewSessionResultSchema,
  TranscriptPhraseSchema,
  TranscriptSchema,
  DetectedWordSchema,
  SRS_CONFIG,
} from './srs';

// Re-export Supabase types and schemas
export type {
  Profile,
  LessonProgress,
  UserStats,
  Achievement,
  UserAchievement,
  StudySession,
  UserTime,
  FavoriteResource,
  NotificationSettings,
} from '@/schemas/supabase';

export {
  ProfileSchema,
  LessonProgressSchema,
  UserStatsSchema,
  AchievementSchema,
  UserAchievementSchema,
  StudySessionSchema,
  UserTimeSchema,
  FavoriteResourceSchema,
  NotificationSettingsSchema,
} from '@/schemas/supabase';

// Re-export database types
export type { Database } from './database.types';
