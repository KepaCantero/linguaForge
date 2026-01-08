/**
 * Esquemas para Sistema de Construcción 3D
 * Define materiales, elementos constructivos y su jerarquía
 */

import { z } from 'zod';

// ============================================
// TIPOS BÁSICOS
// ============================================

export const MaterialRaritySchema = z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']);
export type MaterialRarity = z.infer<typeof MaterialRaritySchema>;

export const MaterialTextureSchema = z.enum(['wood', 'stone', 'glass', 'metal', 'crystal']);
export type MaterialTexture = z.infer<typeof MaterialTextureSchema>;

export const BuildingElementTypeSchema = z.enum([
  'foundation',
  'wall',
  'pillar',
  'roof',
  'tower',
  'garden',
  'bridge',
  'fountain',
  'statue',
  'gate',
  'window',
  'door',
  'stair',
  'balcony',
  'dome'
]);
export type BuildingElementType = z.infer<typeof BuildingElementTypeSchema>;

// ============================================
// MATERIALS
// ============================================

export const MaterialSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  rarity: MaterialRaritySchema,
  texture: MaterialTextureSchema,
  color: z.string(),
  cost: z.number().positive(),
  weight: z.number().positive(),
  durability: z.number().positive(),
  craftingTime: z.number().positive(),
  unlockRequirements: z.object({
    level: z.number().min(1).max(10),
    rank: z.string(),
    requiredMaterials: z.array(z.object({
      materialId: z.string(),
      amount: z.number().positive()
    }))
  }),
  // Propiedades PBR (Physically Based Rendering)
  pbrProperties: z.object({
    roughness: z.number().min(0).max(1),
    metalness: z.number().min(0).max(1),
    reflectivity: z.number().min(0).max(1),
    transparency: z.number().min(0).max(1),
    emission: z.number().min(0).max(1),
  }),
  // Temas de aprendizaje asociados
  learningTopics: z.array(z.string()),
  // Efectos especiales
  specialEffects: z.array(z.string()).optional(),
});

export type Material = z.infer<typeof MaterialSchema>;

// ============================================
// ELEMENTOS CONSTRUCTIVOS
// ============================================

export const BuildingElementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: BuildingElementTypeSchema,
  // Requisitos de materiales
  requiredMaterials: z.array(z.object({
    materialId: z.string(),
    amount: z.number().positive()
  })),
  // Costo de construcción
  constructionCost: z.object({
    xp: z.number().positive(),
    coins: z.number().positive(),
    time: z.number().positive(), // en minutos
  }),
  // Requisitos de desbloqueo
  unlockRequirements: z.object({
    level: z.number().min(1).max(10),
    rank: z.string(),
    prerequisiteElements: z.array(z.string()), // IDs de elementos requeridos
    learningMilestones: z.number().positive(), // temas completados requeridos
  }),
  // Propiedades 3D
  properties: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    depth: z.number().positive(),
    complexity: z.number().min(1).max(10),
    animations: z.array(z.string()),
    interactions: z.array(z.string()),
  }),
  // Temas de aprendizaje asociados
  learningTopics: z.array(z.string()),
  // Rendimiento visual
  performance: z.object({
    lodLevel: z.number().min(0).max(3),
    polygonCount: z.number().positive(),
    textureSize: z.string(), // '512', '1k', '2k', '4k'
  }),
});

export type BuildingElement = z.infer<typeof BuildingElementSchema>;

// ============================================
// PROYECTOS DE CONSTRUCCIÓN
// ============================================

export const ConstructionProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  // Elementos que componen el proyecto
  elements: z.array(z.object({
    elementId: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    }),
    rotation: z.object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    }),
    scale: z.object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    }),
  })),
  // Bonificaciones especiales
  bonuses: z.object({
    xpMultiplier: z.number().min(1),
    coinMultiplier: z.number().min(1),
    materialDiscount: z.number().min(0).max(1),
  }),
  // Tema temático del proyecto
  theme: z.string(),
  // Requisitos para iniciar
  requirements: z.object({
    level: z.number().min(1).max(10),
    rank: z.string(),
    unlockedElements: z.number().positive(),
  }),
});

export type ConstructionProject = z.infer<typeof ConstructionProjectSchema>;

// ============================================
// ESTADO DE CONSTRUCCIÓN
// ============================================

export const MaterialInventorySchema = z.record(z.string(), z.number());
export type MaterialInventory = z.infer<typeof MaterialInventorySchema>;

export const ElementProgressSchema = z.record(z.string(), z.number().min(0).max(100));
export type ElementProgress = z.infer<typeof ElementProgressSchema>;

export const ConstructionStateSchema = z.object({
  unlockedElements: z.array(z.string()),
  currentProject: z.string().nullable(),
  elementProgress: ElementProgressSchema,
  materialInventory: MaterialInventorySchema,
  completedProjects: z.array(z.string()),
  totalBuilds: z.number().min(0),
  constructionMilestones: z.array(z.number()),
  lastBuildDate: z.string().nullable(),
});

export type ConstructionState = z.infer<typeof ConstructionStateSchema>;

// ============================================
// COMERCIALIZACIÓN Y CRAFTING
// ============================================

export const CraftRecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['material', 'element']),
  inputs: z.array(z.object({
    itemId: z.string(),
    amount: z.number().positive()
  })),
  output: z.object({
    itemId: z.string(),
    amount: z.number().positive()
  }),
  craftingTime: z.number().positive(),
  requiredLevel: z.number().min(1).max(10),
  specialRequirements: z.array(z.string()).optional(),
});

export type CraftRecipe = z.infer<typeof CraftRecipeSchema>;

export const TradeOfferSchema = z.object({
  id: z.string(),
  offering: z.array(z.object({
    itemId: z.string(),
    amount: z.number().positive()
  })),
  requesting: z.array(z.object({
    itemId: z.string(),
    amount: z.number().positive()
  })),
  expiration: z.string(),
  offeredBy: z.string(),
  status: z.enum(['active', 'accepted', 'expired', 'cancelled']),
});

export type TradeOffer = z.infer<typeof TradeOfferSchema>;

// ============================================
// MÉTRICAS Y LOGROS
// ============================================

export const ConstructionAchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  rarity: MaterialRaritySchema,
  requirements: z.object({
    buildsCompleted: z.number().positive(),
    uniqueElements: z.number().positive(),
    materialsCollected: z.number().positive(),
    projectsCompleted: z.number().positive(),
    specialCombos: z.array(z.string()),
  }),
  rewards: z.object({
    xp: z.number().positive(),
    coins: z.number().positive(),
    gems: z.number().positive(),
    title: z.string(),
    exclusiveItem: z.string().optional(),
  }),
});

export type ConstructionAchievement = z.infer<typeof ConstructionAchievementSchema>;

// ============================================
// ESTADO DE SESIÓN DE CONSTRUCCIÓN
// ============================================

export const ConstructionSessionSchema = z.object({
  isActive: z.boolean(),
  currentProject: z.string().nullable(),
  startTime: z.string().nullable(),
  timeSpent: z.number().min(0),
  elementsBuilt: z.array(z.string()),
  materialsUsed: z.record(z.string(), z.number()),
  progress: z.number().min(0).max(100),
  // Métricas de la sesión
  sessionMetrics: z.object({
    efficiency: z.number().min(0).max(100),
    quality: z.number().min(0).max(100),
    creativity: z.number().min(0).max(100),
    learningBonus: z.number().min(1).max(2),
  }),
});

export type ConstructionSession = z.infer<typeof ConstructionSessionSchema>;

// ============================================
// VALIDACIÓN RUNTIME
// ============================================

// Validadores para uso en runtime
export const validateMaterial = (material: unknown): Material => {
  return MaterialSchema.parse(material);
};

export const validateBuildingElement = (element: unknown): BuildingElement => {
  return BuildingElementSchema.parse(element);
};

export const validateConstructionState = (state: unknown): ConstructionState => {
  return ConstructionStateSchema.parse(state);
};

export const validateCraftRecipe = (recipe: unknown): CraftRecipe => {
  return CraftRecipeSchema.parse(recipe);
};

export const validateConstructionAchievement = (achievement: unknown): ConstructionAchievement => {
  return ConstructionAchievementSchema.parse(achievement);
};

// ============================================
// ALIAS DE EXPORTACIÓN
// ============================================

// Alias para MaterialSchema (ya exportado como MaterialSchema)
export { MaterialSchema as ConstructionMaterialSchema };