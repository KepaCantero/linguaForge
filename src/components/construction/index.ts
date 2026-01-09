/**
 * Construction System - Exports
 *
 * Sistema de Construcción 3D con Three.js para gamificación visual
 * FASE 2.8.9: Sistema de Construcción 3D - AAA Level
 */

// ============================================
// COMPONENTES 3D
// ============================================

export {
  Construction3D,
  Construction3DPreview,
  type Construction3DElement,
  type Construction3DProps,
  type Construction3DPreviewProps,
} from './Construction3D';

// ============================================
// COMPONENTES UI
// ============================================

export {
  BuilderInventory,
} from './BuilderInventory';

export {
  MaterialGallery,
  Material3DPreview,
} from './MaterialGallery';

export { ConstructionMilestones } from './ConstructionMilestones';

// ============================================
// TIPOS DEL SCHEMA
// ============================================

export type {
  BuildingElementType,
  MaterialTexture,
  MaterialRarity,
  Material,
  BuildingElement,
  ConstructionState,
  ConstructionProject,
  CraftRecipe,
  TradeOffer,
  ConstructionAchievement,
  ConstructionSession,
} from '@/schemas/construction';

// ============================================
// STORE DE CONSTRUCCIÓN
// ============================================

export {
  useConstructionStore,
  MATERIALS,
  ELEMENTS,
  CONSTRUCTION_MILESTONES,
  useMaterialsByRarity,
  getElementsByType,
  useCanBuildElement,
  type MaterialDefinition,
  type ElementDefinition,
} from '@/store/useConstructionStore';

// ============================================
// SISTEMA PBR
// ============================================

export {
  PBR_MATERIALS,
  LOD_CONFIGS,
  createPBRMaterial,
  createSimpleMaterial,
  getPBRMaterial,
  getMaterialsByTexture,
  getMaterialsByRarity,
  getLODForDistance,
  supportsAdvancedMaterials,
  type PBRMaterialProperties,
  type PBRMaterialConfig,
  type PBRMaterialVariant,
  type WeatheringLevel,
  type LODConfig,
} from '@/lib/materials/pbr';

// ============================================
// ANIMACIONES
// ============================================

export {
  EASING,
  CONSTRUCTION_TRANSITIONS,
  ELEMENT_VARIANTS,
  MATERIAL_VARIANTS,
  PROGRESS_VARIANTS,
  ELEMENT_ANIMATIONS,
  CELEBRATION_CONFIGS,
  createParticleSystem,
  updateParticleSystem,
  getAnimationForElement,
  getAnimationState,
  type ConstructionAnimation,
  type AnimationStage,
  type ParticleConfig,
  type CelebrationConfig,
  type ParticleSystem,
} from '@/lib/animations/construction';

// ============================================
// INTEGRACIÓN CON RECOMPENSAS
// ============================================

export {
  calculateTopicRewards,
  calculateBuildRewards,
  calculateBuildCost,
  canUnlockElement,
  getUnlockableElements,
  checkMilestones,
  convertXPToMaterials,
  convertCoinsToMaterials,
  calculateCollectionValue,
  generateEventRewards,
  type ConstructionReward,
  type MaterialReward,
  type BonusReward,
  type TopicToMaterialMapping,
  type ElementUnlockRequirement,
} from '@/services/constructionIntegration';

// ============================================
// SISTEMA DE PROGRESIÓN
// ============================================

export {
  // Constants
  CONSTRUCTION_MILESTONES as PROGRESSION_MILESTONES,
  STREAK_BONUSES,
  MASTERY_LEVELS,
  MASTERY_BONUSES,
  THEME_BONUSES,
  TEMPORAL_EVENTS,
  // Functions
  getStreakBonus,
  getMasteryLevel,
  getMasteryBonuses,
  checkMilestoneCompletion,
  getPendingMilestones,
  getNextMilestone,
  calculateMilestoneReward,
  checkThemeCompletion,
  isEventActive,
  getActiveEvents,
  calculatePrestige,
  // Types
  type MilestoneCategory,
  type ConstructionMilestone,
  type MilestoneRequirement,
  type MilestoneReward,
  type ConstructionStreak,
  type MasteryLevel,
  type MasteryBonus,
  type ThemeBonus,
  type TemporalEvent,
  type ProgressionState,
} from '@/lib/progression/construction';
