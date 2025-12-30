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
  getLevelByXP,
  getXPToNextLevel,
  getLevelProgress,
} from '@/lib/constants';

export type {
  SupportedLanguage,
  SupportedLevel,
} from '@/lib/constants';
