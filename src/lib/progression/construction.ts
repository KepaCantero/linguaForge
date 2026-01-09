/**
 * Sistema de Progreso y Hitos Constructivos
 * TAREA 2.8.9.8: 50+ hitos, rachas, bonus temáticos, eventos, maestría
 */

import { type MaterialRarity, type BuildingElementType } from '@/schemas/construction';

// ============================================
// TIPOS
// ============================================

export type MilestoneCategory =
  | 'building'      // Construcción general
  | 'collection'    // Colección de materiales
  | 'mastery'       // Maestría en elementos
  | 'streak'        // Rachas
  | 'theme'         // Temas temáticos
  | 'event'         // Eventos temporales
  | 'rare'          // Materiales raros
  | 'speed'         // Velocidad de construcción
  | 'exploration';  // Exploración

export interface ConstructionMilestone {
  id: string;
  name: string;
  description: string;
  category: MilestoneCategory;
  icon: string;
  rarity: MaterialRarity;
  requirements: MilestoneRequirement;
  rewards: MilestoneReward;
  hidden: boolean;
  order: number;
}

export interface MilestoneRequirement {
  type: 'count' | 'unique' | 'streak' | 'time' | 'combo' | 'theme' | 'event';
  target: number;
  condition?: string;
  elementType?: BuildingElementType;
  materialRarity?: MaterialRarity;
  themeId?: string;
  eventId?: string;
}

export interface MilestoneReward {
  xp: number;
  coins: number;
  gems: number;
  title?: string;
  badge?: string;
  exclusiveMaterial?: string;
  exclusiveElement?: string;
  multiplierBonus?: number;
}

export interface ConstructionStreak {
  currentDays: number;
  longestStreak: number;
  lastBuildDate: string | null;
  streakBonusLevel: number;
}

export interface ThemeBonus {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredElements: string[];
  bonusMultiplier: number;
  xpBonus: number;
  exclusiveReward?: string;
  isComplete: boolean;
}

export interface TemporalEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  exclusiveMaterials: string[];
  bonusMultiplier: number;
  specialMilestones: string[];
  isActive: boolean;
}

export interface MasteryLevel {
  elementType: BuildingElementType;
  level: number;
  experience: number;
  nextLevelXP: number;
  bonuses: MasteryBonus[];
}

export interface MasteryBonus {
  level: number;
  type: 'speed' | 'cost' | 'quality' | 'xp';
  value: number;
  description: string;
}

export interface ProgressionState {
  milestones: Record<string, boolean>;
  streakData: ConstructionStreak;
  themeBonuses: Record<string, boolean>;
  eventProgress: Record<string, number>;
  masteryLevels: Record<BuildingElementType, MasteryLevel>;
  totalXPEarned: number;
  prestigeLevel: number;
}

// ============================================
// CONSTANTES DE CONFIGURACIÓN
// ============================================

// Bonus por racha de días consecutivos
export const STREAK_BONUSES = [
  { days: 1, multiplier: 1.0, xpBonus: 0 },
  { days: 3, multiplier: 1.1, xpBonus: 25 },
  { days: 7, multiplier: 1.25, xpBonus: 75 },
  { days: 14, multiplier: 1.5, xpBonus: 200 },
  { days: 30, multiplier: 2.0, xpBonus: 500 },
  { days: 60, multiplier: 2.5, xpBonus: 1000 },
  { days: 100, multiplier: 3.0, xpBonus: 2500 },
] as const;

// Niveles de maestría por tipo de elemento
export const MASTERY_LEVELS = [
  { level: 1, xpRequired: 0, title: 'Aprendiz' },
  { level: 2, xpRequired: 100, title: 'Iniciado' },
  { level: 3, xpRequired: 300, title: 'Practicante' },
  { level: 4, xpRequired: 600, title: 'Artesano' },
  { level: 5, xpRequired: 1000, title: 'Experto' },
  { level: 6, xpRequired: 1500, title: 'Maestro' },
  { level: 7, xpRequired: 2500, title: 'Gran Maestro' },
  { level: 8, xpRequired: 4000, title: 'Virtuoso' },
  { level: 9, xpRequired: 6000, title: 'Leyenda' },
  { level: 10, xpRequired: 10000, title: 'Inmortal' },
] as const;

// Bonus por nivel de maestría
export const MASTERY_BONUSES: MasteryBonus[] = [
  { level: 2, type: 'xp', value: 1.05, description: '+5% XP al construir' },
  { level: 3, type: 'cost', value: 0.95, description: '-5% costo de materiales' },
  { level: 4, type: 'speed', value: 1.1, description: '+10% velocidad de construcción' },
  { level: 5, type: 'quality', value: 1.1, description: '+10% calidad de construcción' },
  { level: 6, type: 'xp', value: 1.15, description: '+15% XP al construir' },
  { level: 7, type: 'cost', value: 0.85, description: '-15% costo de materiales' },
  { level: 8, type: 'speed', value: 1.25, description: '+25% velocidad de construcción' },
  { level: 9, type: 'quality', value: 1.25, description: '+25% calidad de construcción' },
  { level: 10, type: 'xp', value: 1.5, description: '+50% XP al construir' },
];

// ============================================
// HITOS DE CONSTRUCCIÓN (50+)
// ============================================

export const CONSTRUCTION_MILESTONES: ConstructionMilestone[] = [
  // ============================================
  // HITOS DE CONSTRUCCIÓN GENERAL (15)
  // ============================================
  {
    id: 'first_build',
    name: 'Primer Cimiento',
    description: 'Construye tu primer elemento',
    category: 'building',
    icon: '🏗️',
    rarity: 'common',
    requirements: { type: 'count', target: 1 },
    rewards: { xp: 50, coins: 25, gems: 0, title: 'Constructor' },
    hidden: false,
    order: 1,
  },
  {
    id: 'builder_5',
    name: 'Constructor Novato',
    description: 'Construye 5 elementos',
    category: 'building',
    icon: '🔨',
    rarity: 'common',
    requirements: { type: 'count', target: 5 },
    rewards: { xp: 100, coins: 50, gems: 0 },
    hidden: false,
    order: 2,
  },
  {
    id: 'builder_10',
    name: 'Arquitecto Aprendiz',
    description: 'Construye 10 elementos',
    category: 'building',
    icon: '📐',
    rarity: 'uncommon',
    requirements: { type: 'count', target: 10 },
    rewards: { xp: 200, coins: 100, gems: 1, title: 'Arquitecto Aprendiz' },
    hidden: false,
    order: 3,
  },
  {
    id: 'builder_25',
    name: 'Maestro Constructor',
    description: 'Construye 25 elementos',
    category: 'building',
    icon: '🏛️',
    rarity: 'uncommon',
    requirements: { type: 'count', target: 25 },
    rewards: { xp: 500, coins: 250, gems: 2 },
    hidden: false,
    order: 4,
  },
  {
    id: 'builder_50',
    name: 'Arquitecto Real',
    description: 'Construye 50 elementos',
    category: 'building',
    icon: '👑',
    rarity: 'rare',
    requirements: { type: 'count', target: 50 },
    rewards: { xp: 1000, coins: 500, gems: 5, title: 'Arquitecto Real' },
    hidden: false,
    order: 5,
  },
  {
    id: 'builder_100',
    name: 'Leyenda del Oficio',
    description: 'Construye 100 elementos',
    category: 'building',
    icon: '🏆',
    rarity: 'epic',
    requirements: { type: 'count', target: 100 },
    rewards: { xp: 2500, coins: 1000, gems: 10, title: 'Leyenda del Oficio', badge: 'legendary_builder' },
    hidden: false,
    order: 6,
  },
  {
    id: 'builder_250',
    name: 'Arquitecto Inmortal',
    description: 'Construye 250 elementos',
    category: 'building',
    icon: '⭐',
    rarity: 'legendary',
    requirements: { type: 'count', target: 250 },
    rewards: { xp: 5000, coins: 2500, gems: 25, title: 'Arquitecto Inmortal', exclusiveElement: 'celestial_spire' },
    hidden: false,
    order: 7,
  },
  {
    id: 'builder_500',
    name: 'Constructor Eterno',
    description: 'Construye 500 elementos',
    category: 'building',
    icon: '🌟',
    rarity: 'legendary',
    requirements: { type: 'count', target: 500 },
    rewards: { xp: 10000, coins: 5000, gems: 50, multiplierBonus: 0.1 },
    hidden: true,
    order: 8,
  },
  // Tipos específicos
  {
    id: 'foundation_master',
    name: 'Maestro de Cimientos',
    description: 'Construye 20 cimientos',
    category: 'building',
    icon: '🧱',
    rarity: 'uncommon',
    requirements: { type: 'count', target: 20, elementType: 'foundation' },
    rewards: { xp: 300, coins: 150, gems: 2 },
    hidden: false,
    order: 10,
  },
  {
    id: 'wall_master',
    name: 'Maestro de Muros',
    description: 'Construye 30 muros',
    category: 'building',
    icon: '🧱',
    rarity: 'uncommon',
    requirements: { type: 'count', target: 30, elementType: 'wall' },
    rewards: { xp: 350, coins: 175, gems: 2 },
    hidden: false,
    order: 11,
  },
  {
    id: 'tower_builder',
    name: 'Ascensor de Torres',
    description: 'Construye 10 torres',
    category: 'building',
    icon: '🗼',
    rarity: 'rare',
    requirements: { type: 'count', target: 10, elementType: 'tower' },
    rewards: { xp: 500, coins: 250, gems: 5 },
    hidden: false,
    order: 12,
  },
  {
    id: 'dome_architect',
    name: 'Arquitecto de Cúpulas',
    description: 'Construye 5 cúpulas',
    category: 'building',
    icon: '🕌',
    rarity: 'epic',
    requirements: { type: 'count', target: 5, elementType: 'dome' },
    rewards: { xp: 750, coins: 400, gems: 8, title: 'Arquitecto de Cúpulas' },
    hidden: false,
    order: 13,
  },
  {
    id: 'garden_creator',
    name: 'Jardinero Real',
    description: 'Construye 15 jardines',
    category: 'building',
    icon: '🌳',
    rarity: 'uncommon',
    requirements: { type: 'count', target: 15, elementType: 'garden' },
    rewards: { xp: 400, coins: 200, gems: 3 },
    hidden: false,
    order: 14,
  },
  {
    id: 'fountain_master',
    name: 'Maestro de Fuentes',
    description: 'Construye 10 fuentes',
    category: 'building',
    icon: '⛲',
    rarity: 'rare',
    requirements: { type: 'count', target: 10, elementType: 'fountain' },
    rewards: { xp: 600, coins: 300, gems: 5 },
    hidden: false,
    order: 15,
  },

  // ============================================
  // HITOS DE COLECCIÓN (10)
  // ============================================
  {
    id: 'collector_100',
    name: 'Coleccionista',
    description: 'Acumula 100 materiales',
    category: 'collection',
    icon: '📦',
    rarity: 'common',
    requirements: { type: 'count', target: 100 },
    rewards: { xp: 150, coins: 75, gems: 1 },
    hidden: false,
    order: 20,
  },
  {
    id: 'collector_500',
    name: 'Gran Coleccionista',
    description: 'Acumula 500 materiales',
    category: 'collection',
    icon: '🗃️',
    rarity: 'uncommon',
    requirements: { type: 'count', target: 500 },
    rewards: { xp: 400, coins: 200, gems: 3 },
    hidden: false,
    order: 21,
  },
  {
    id: 'collector_1000',
    name: 'Tesorero',
    description: 'Acumula 1000 materiales',
    category: 'collection',
    icon: '💎',
    rarity: 'rare',
    requirements: { type: 'count', target: 1000 },
    rewards: { xp: 800, coins: 400, gems: 8, title: 'Tesorero' },
    hidden: false,
    order: 22,
  },
  {
    id: 'wood_lover',
    name: 'Amante de la Madera',
    description: 'Colecciona 200 materiales de madera',
    category: 'collection',
    icon: '🪵',
    rarity: 'uncommon',
    requirements: { type: 'count', target: 200, condition: 'wood' },
    rewards: { xp: 300, coins: 150, gems: 2 },
    hidden: false,
    order: 23,
  },
  {
    id: 'stone_collector',
    name: 'Coleccionista de Piedra',
    description: 'Colecciona 200 materiales de piedra',
    category: 'collection',
    icon: '🪨',
    rarity: 'uncommon',
    requirements: { type: 'count', target: 200, condition: 'stone' },
    rewards: { xp: 300, coins: 150, gems: 2 },
    hidden: false,
    order: 24,
  },
  {
    id: 'metal_hoarder',
    name: 'Acumulador de Metales',
    description: 'Colecciona 150 materiales de metal',
    category: 'collection',
    icon: '⚙️',
    rarity: 'rare',
    requirements: { type: 'count', target: 150, condition: 'metal' },
    rewards: { xp: 450, coins: 225, gems: 4 },
    hidden: false,
    order: 25,
  },
  {
    id: 'glass_artist',
    name: 'Artista del Cristal',
    description: 'Colecciona 100 materiales de vidrio',
    category: 'collection',
    icon: '🔮',
    rarity: 'rare',
    requirements: { type: 'count', target: 100, condition: 'glass' },
    rewards: { xp: 400, coins: 200, gems: 4 },
    hidden: false,
    order: 26,
  },
  {
    id: 'crystal_keeper',
    name: 'Guardián de Cristales',
    description: 'Colecciona 50 cristales mágicos',
    category: 'collection',
    icon: '💠',
    rarity: 'epic',
    requirements: { type: 'count', target: 50, condition: 'crystal' },
    rewards: { xp: 700, coins: 350, gems: 10, title: 'Guardián de Cristales' },
    hidden: false,
    order: 27,
  },
  {
    id: 'all_materials',
    name: 'Completista',
    description: 'Obtén todos los tipos de materiales',
    category: 'collection',
    icon: '🌈',
    rarity: 'epic',
    requirements: { type: 'unique', target: 15 },
    rewards: { xp: 1000, coins: 500, gems: 15, badge: 'completionist' },
    hidden: false,
    order: 28,
  },
  {
    id: 'rare_collector',
    name: 'Cazador de Rarezas',
    description: 'Colecciona 20 materiales épicos o legendarios',
    category: 'collection',
    icon: '🦄',
    rarity: 'legendary',
    requirements: { type: 'count', target: 20, materialRarity: 'epic' },
    rewards: { xp: 2000, coins: 1000, gems: 25, exclusiveMaterial: 'prismatic_crystal' },
    hidden: false,
    order: 29,
  },

  // ============================================
  // HITOS DE RACHA (8)
  // ============================================
  {
    id: 'streak_3',
    name: 'Constancia',
    description: 'Construye 3 días seguidos',
    category: 'streak',
    icon: '🔥',
    rarity: 'common',
    requirements: { type: 'streak', target: 3 },
    rewards: { xp: 100, coins: 50, gems: 1 },
    hidden: false,
    order: 30,
  },
  {
    id: 'streak_7',
    name: 'Semana Productiva',
    description: 'Construye 7 días seguidos',
    category: 'streak',
    icon: '🔥',
    rarity: 'uncommon',
    requirements: { type: 'streak', target: 7 },
    rewards: { xp: 300, coins: 150, gems: 3, title: 'Constructor Dedicado' },
    hidden: false,
    order: 31,
  },
  {
    id: 'streak_14',
    name: 'Dos Semanas de Fuego',
    description: 'Construye 14 días seguidos',
    category: 'streak',
    icon: '🔥🔥',
    rarity: 'rare',
    requirements: { type: 'streak', target: 14 },
    rewards: { xp: 700, coins: 350, gems: 7 },
    hidden: false,
    order: 32,
  },
  {
    id: 'streak_30',
    name: 'Mes Legendario',
    description: 'Construye 30 días seguidos',
    category: 'streak',
    icon: '🔥🔥🔥',
    rarity: 'epic',
    requirements: { type: 'streak', target: 30 },
    rewards: { xp: 1500, coins: 750, gems: 15, title: 'Constructor Imparable', badge: 'month_streak' },
    hidden: false,
    order: 33,
  },
  {
    id: 'streak_60',
    name: 'Dos Meses de Gloria',
    description: 'Construye 60 días seguidos',
    category: 'streak',
    icon: '🌟🔥',
    rarity: 'epic',
    requirements: { type: 'streak', target: 60 },
    rewards: { xp: 3000, coins: 1500, gems: 30, multiplierBonus: 0.05 },
    hidden: false,
    order: 34,
  },
  {
    id: 'streak_100',
    name: 'Centenario',
    description: 'Construye 100 días seguidos',
    category: 'streak',
    icon: '💯🔥',
    rarity: 'legendary',
    requirements: { type: 'streak', target: 100 },
    rewards: { xp: 5000, coins: 2500, gems: 50, title: 'Constructor Centenario', exclusiveElement: 'eternal_flame_tower' },
    hidden: false,
    order: 35,
  },
  {
    id: 'streak_365',
    name: 'Año Perfecto',
    description: 'Construye 365 días seguidos',
    category: 'streak',
    icon: '🌟💯🔥',
    rarity: 'legendary',
    requirements: { type: 'streak', target: 365 },
    rewards: { xp: 25000, coins: 10000, gems: 200, title: 'Constructor Anual', badge: 'year_streak', multiplierBonus: 0.25 },
    hidden: true,
    order: 36,
  },
  {
    id: 'streak_recovery',
    name: 'Fénix',
    description: 'Recupera una racha perdida',
    category: 'streak',
    icon: '🔄',
    rarity: 'rare',
    requirements: { type: 'combo', target: 1, condition: 'streak_recovery' },
    rewards: { xp: 200, coins: 100, gems: 2 },
    hidden: true,
    order: 37,
  },

  // ============================================
  // HITOS TEMÁTICOS - FRANCIA (7)
  // ============================================
  {
    id: 'paris_starter',
    name: 'Visitante de París',
    description: 'Construye tu primer elemento parisino',
    category: 'theme',
    icon: '🗼',
    rarity: 'common',
    requirements: { type: 'theme', target: 1, themeId: 'paris' },
    rewards: { xp: 100, coins: 50, gems: 1 },
    hidden: false,
    order: 40,
  },
  {
    id: 'paris_architect',
    name: 'Arquitecto de París',
    description: 'Construye 10 elementos parisinos',
    category: 'theme',
    icon: '🏛️',
    rarity: 'uncommon',
    requirements: { type: 'theme', target: 10, themeId: 'paris' },
    rewards: { xp: 400, coins: 200, gems: 4, title: 'Arquitecto de París' },
    hidden: false,
    order: 41,
  },
  {
    id: 'eiffel_replica',
    name: 'Mini Torre Eiffel',
    description: 'Construye una réplica de la Torre Eiffel',
    category: 'theme',
    icon: '🗼',
    rarity: 'rare',
    requirements: { type: 'combo', target: 1, condition: 'eiffel_tower' },
    rewards: { xp: 1000, coins: 500, gems: 10, exclusiveElement: 'mini_eiffel' },
    hidden: false,
    order: 42,
  },
  {
    id: 'versailles_garden',
    name: 'Jardines de Versalles',
    description: 'Crea un jardín estilo Versalles',
    category: 'theme',
    icon: '🌹',
    rarity: 'epic',
    requirements: { type: 'combo', target: 1, condition: 'versailles' },
    rewards: { xp: 1500, coins: 750, gems: 15, badge: 'versailles' },
    hidden: false,
    order: 43,
  },
  {
    id: 'notre_dame',
    name: 'Constructor de Catedrales',
    description: 'Construye una catedral estilo Notre-Dame',
    category: 'theme',
    icon: '⛪',
    rarity: 'epic',
    requirements: { type: 'combo', target: 1, condition: 'notre_dame' },
    rewards: { xp: 2000, coins: 1000, gems: 20, title: 'Maestro de Catedrales' },
    hidden: false,
    order: 44,
  },
  {
    id: 'louvre_gallery',
    name: 'Galería del Louvre',
    description: 'Crea una galería de arte francesa',
    category: 'theme',
    icon: '🖼️',
    rarity: 'rare',
    requirements: { type: 'combo', target: 1, condition: 'louvre' },
    rewards: { xp: 800, coins: 400, gems: 8 },
    hidden: false,
    order: 45,
  },
  {
    id: 'french_chateau',
    name: 'Castillo Francés',
    description: 'Construye un château completo',
    category: 'theme',
    icon: '🏰',
    rarity: 'legendary',
    requirements: { type: 'combo', target: 1, condition: 'french_chateau' },
    rewards: { xp: 5000, coins: 2500, gems: 50, title: 'Señor del Château', exclusiveElement: 'royal_crown_dome' },
    hidden: false,
    order: 46,
  },

  // ============================================
  // HITOS DE MAESTRÍA (8)
  // ============================================
  {
    id: 'first_mastery',
    name: 'Primera Maestría',
    description: 'Alcanza nivel 5 de maestría en cualquier tipo',
    category: 'mastery',
    icon: '⚔️',
    rarity: 'uncommon',
    requirements: { type: 'count', target: 5, condition: 'any_mastery' },
    rewards: { xp: 500, coins: 250, gems: 5, title: 'Maestro Artesano' },
    hidden: false,
    order: 50,
  },
  {
    id: 'double_mastery',
    name: 'Doble Maestría',
    description: 'Alcanza nivel 5 en dos tipos diferentes',
    category: 'mastery',
    icon: '⚔️⚔️',
    rarity: 'rare',
    requirements: { type: 'count', target: 2, condition: 'mastery_5' },
    rewards: { xp: 1000, coins: 500, gems: 10 },
    hidden: false,
    order: 51,
  },
  {
    id: 'triple_mastery',
    name: 'Triple Maestría',
    description: 'Alcanza nivel 5 en tres tipos diferentes',
    category: 'mastery',
    icon: '⚔️⚔️⚔️',
    rarity: 'epic',
    requirements: { type: 'count', target: 3, condition: 'mastery_5' },
    rewards: { xp: 2000, coins: 1000, gems: 20 },
    hidden: false,
    order: 52,
  },
  {
    id: 'grand_master',
    name: 'Gran Maestro',
    description: 'Alcanza nivel 10 de maestría en cualquier tipo',
    category: 'mastery',
    icon: '👑',
    rarity: 'legendary',
    requirements: { type: 'count', target: 10, condition: 'any_mastery' },
    rewards: { xp: 5000, coins: 2500, gems: 50, title: 'Gran Maestro Constructor', badge: 'grand_master' },
    hidden: false,
    order: 53,
  },
  {
    id: 'polymath',
    name: 'Polímata',
    description: 'Alcanza nivel 5 en todos los tipos',
    category: 'mastery',
    icon: '🎓',
    rarity: 'legendary',
    requirements: { type: 'count', target: 15, condition: 'all_mastery_5' },
    rewards: { xp: 10000, coins: 5000, gems: 100, title: 'Polímata de la Construcción', multiplierBonus: 0.15 },
    hidden: false,
    order: 54,
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Construye 10 elementos con calidad perfecta',
    category: 'mastery',
    icon: '✨',
    rarity: 'rare',
    requirements: { type: 'count', target: 10, condition: 'perfect_quality' },
    rewards: { xp: 600, coins: 300, gems: 6 },
    hidden: false,
    order: 55,
  },
  {
    id: 'speed_demon',
    name: 'Demonio de la Velocidad',
    description: 'Construye 20 elementos en tiempo récord',
    category: 'mastery',
    icon: '⚡',
    rarity: 'rare',
    requirements: { type: 'count', target: 20, condition: 'speed_build' },
    rewards: { xp: 500, coins: 250, gems: 5 },
    hidden: false,
    order: 56,
  },
  {
    id: 'efficiency_expert',
    name: 'Experto en Eficiencia',
    description: 'Ahorra 500 materiales en total',
    category: 'mastery',
    icon: '📊',
    rarity: 'epic',
    requirements: { type: 'count', target: 500, condition: 'materials_saved' },
    rewards: { xp: 800, coins: 400, gems: 8 },
    hidden: false,
    order: 57,
  },

  // ============================================
  // HITOS DE EVENTOS (5)
  // ============================================
  {
    id: 'event_participant',
    name: 'Participante de Evento',
    description: 'Participa en tu primer evento temporal',
    category: 'event',
    icon: '🎪',
    rarity: 'common',
    requirements: { type: 'event', target: 1 },
    rewards: { xp: 100, coins: 50, gems: 1 },
    hidden: false,
    order: 60,
  },
  {
    id: 'event_veteran',
    name: 'Veterano de Eventos',
    description: 'Completa 5 eventos temporales',
    category: 'event',
    icon: '🎭',
    rarity: 'rare',
    requirements: { type: 'event', target: 5 },
    rewards: { xp: 750, coins: 375, gems: 8 },
    hidden: false,
    order: 61,
  },
  {
    id: 'event_master',
    name: 'Maestro de Eventos',
    description: 'Completa 10 eventos temporales',
    category: 'event',
    icon: '🏅',
    rarity: 'epic',
    requirements: { type: 'event', target: 10 },
    rewards: { xp: 2000, coins: 1000, gems: 20, title: 'Maestro de Eventos' },
    hidden: false,
    order: 62,
  },
  {
    id: 'exclusive_collector',
    name: 'Coleccionista Exclusivo',
    description: 'Obtén 10 materiales exclusivos de eventos',
    category: 'event',
    icon: '🌟',
    rarity: 'epic',
    requirements: { type: 'count', target: 10, condition: 'exclusive_materials' },
    rewards: { xp: 1500, coins: 750, gems: 15 },
    hidden: false,
    order: 63,
  },
  {
    id: 'seasonal_champion',
    name: 'Campeón de Temporada',
    description: 'Alcanza el top 10 en un evento',
    category: 'event',
    icon: '🏆',
    rarity: 'legendary',
    requirements: { type: 'event', target: 1, condition: 'top_10' },
    rewards: { xp: 5000, coins: 2500, gems: 50, badge: 'seasonal_champion', exclusiveMaterial: 'champion_crystal' },
    hidden: false,
    order: 64,
  },

  // ============================================
  // HITOS OCULTOS / SECRETOS (5)
  // ============================================
  {
    id: 'night_builder',
    name: 'Constructor Nocturno',
    description: 'Construye a medianoche',
    category: 'exploration',
    icon: '🌙',
    rarity: 'rare',
    requirements: { type: 'time', target: 1, condition: 'midnight' },
    rewards: { xp: 300, coins: 150, gems: 3 },
    hidden: true,
    order: 70,
  },
  {
    id: 'lucky_7',
    name: 'Suerte Siete',
    description: 'Construye 7 elementos el día 7',
    category: 'exploration',
    icon: '🍀',
    rarity: 'rare',
    requirements: { type: 'combo', target: 1, condition: 'lucky_7' },
    rewards: { xp: 777, coins: 77, gems: 7 },
    hidden: true,
    order: 71,
  },
  {
    id: 'rainbow_builder',
    name: 'Constructor Arcoíris',
    description: 'Usa materiales de todos los colores en un día',
    category: 'exploration',
    icon: '🌈',
    rarity: 'epic',
    requirements: { type: 'combo', target: 1, condition: 'rainbow' },
    rewards: { xp: 1000, coins: 500, gems: 10 },
    hidden: true,
    order: 72,
  },
  {
    id: 'palindrome_day',
    name: 'Día Palíndromo',
    description: 'Construye en un día palíndromo',
    category: 'exploration',
    icon: '🔄',
    rarity: 'rare',
    requirements: { type: 'time', target: 1, condition: 'palindrome' },
    rewards: { xp: 500, coins: 250, gems: 5 },
    hidden: true,
    order: 73,
  },
  {
    id: 'secret_master',
    name: 'Maestro de Secretos',
    description: 'Descubre todos los hitos ocultos',
    category: 'exploration',
    icon: '🔐',
    rarity: 'legendary',
    requirements: { type: 'count', target: 5, condition: 'hidden_milestones' },
    rewards: { xp: 3000, coins: 1500, gems: 30, title: 'Maestro de Secretos', badge: 'secret_master' },
    hidden: true,
    order: 74,
  },
];

// ============================================
// TEMAS TEMÁTICOS
// ============================================

export const THEME_BONUSES: ThemeBonus[] = [
  {
    id: 'paris',
    name: 'París Monumental',
    description: 'Construye monumentos parisinos',
    icon: '🗼',
    requiredElements: ['stone_tower', 'marble_pillar', 'stained_window'],
    bonusMultiplier: 1.25,
    xpBonus: 500,
    isComplete: false,
  },
  {
    id: 'french_garden',
    name: 'Jardín Francés',
    description: 'Crea un jardín estilo francés',
    icon: '🌹',
    requiredElements: ['flower_garden', 'marble_fountain', 'stone_foundation'],
    bonusMultiplier: 1.2,
    xpBonus: 400,
    isComplete: false,
  },
  {
    id: 'chateau',
    name: 'Château Real',
    description: 'Construye un château completo',
    icon: '🏰',
    requiredElements: ['marble_foundation', 'stone_wall', 'wooden_roof', 'glass_window', 'marble_pillar'],
    bonusMultiplier: 1.5,
    xpBonus: 1000,
    exclusiveReward: 'royal_banner',
    isComplete: false,
  },
  {
    id: 'cathedral',
    name: 'Catedral Gótica',
    description: 'Construye una catedral gótica',
    icon: '⛪',
    requiredElements: ['stone_foundation', 'stone_wall', 'marble_pillar', 'stained_window', 'stone_tower'],
    bonusMultiplier: 1.4,
    xpBonus: 800,
    isComplete: false,
  },
  {
    id: 'medieval_castle',
    name: 'Castillo Medieval',
    description: 'Construye un castillo medieval',
    icon: '🏯',
    requiredElements: ['stone_foundation', 'stone_wall', 'stone_tower', 'wooden_door', 'golden_gate'],
    bonusMultiplier: 1.6,
    xpBonus: 1200,
    exclusiveReward: 'medieval_banner',
    isComplete: false,
  },
];

// ============================================
// EVENTOS TEMPORALES
// ============================================

export const TEMPORAL_EVENTS: TemporalEvent[] = [
  {
    id: 'bastille_day',
    name: 'Día de la Bastilla',
    description: 'Celebra el 14 de julio construyendo monumentos franceses',
    startDate: '2026-07-14T00:00:00Z',
    endDate: '2026-07-21T23:59:59Z',
    exclusiveMaterials: ['tricolor_glass', 'revolutionary_stone'],
    bonusMultiplier: 2.0,
    specialMilestones: ['bastille_builder', 'liberty_tower'],
    isActive: false,
  },
  {
    id: 'christmas_france',
    name: 'Navidad Francesa',
    description: 'Construye decoraciones navideñas con estilo francés',
    startDate: '2026-12-15T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    exclusiveMaterials: ['festive_gold', 'snow_crystal', 'candy_glass'],
    bonusMultiplier: 1.5,
    specialMilestones: ['christmas_chateau', 'winter_garden'],
    isActive: false,
  },
  {
    id: 'spring_bloom',
    name: 'Floración de Primavera',
    description: 'Crea jardines primaverales',
    startDate: '2026-03-20T00:00:00Z',
    endDate: '2026-04-03T23:59:59Z',
    exclusiveMaterials: ['cherry_blossom_wood', 'spring_crystal'],
    bonusMultiplier: 1.3,
    specialMilestones: ['bloom_garden', 'spring_fountain'],
    isActive: false,
  },
  {
    id: 'halloween_france',
    name: 'Halloween en Francia',
    description: 'Construye estructuras espeluznantes',
    startDate: '2026-10-25T00:00:00Z',
    endDate: '2026-11-01T23:59:59Z',
    exclusiveMaterials: ['shadow_stone', 'ghost_glass', 'pumpkin_wood'],
    bonusMultiplier: 1.4,
    specialMilestones: ['haunted_tower', 'spooky_gate'],
    isActive: false,
  },
];

// ============================================
// FUNCIONES DE PROGRESIÓN
// ============================================

/**
 * Calcula el bonus de racha actual
 */
export function getStreakBonus(currentStreak: number): { multiplier: number; xpBonus: number } {
  for (let i = STREAK_BONUSES.length - 1; i >= 0; i--) {
    if (currentStreak >= STREAK_BONUSES[i].days) {
      return {
        multiplier: STREAK_BONUSES[i].multiplier,
        xpBonus: STREAK_BONUSES[i].xpBonus,
      };
    }
  }
  return { multiplier: 1.0, xpBonus: 0 };
}

/**
 * Calcula el nivel de maestría basado en XP
 */
export function getMasteryLevel(xp: number): { level: number; title: string; progress: number } {
  for (let i = MASTERY_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= MASTERY_LEVELS[i].xpRequired) {
      const currentLevel = MASTERY_LEVELS[i];
      const nextLevel = MASTERY_LEVELS[i + 1];

      const progress = nextLevel
        ? ((xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
        : 100;

      return {
        level: currentLevel.level,
        title: currentLevel.title,
        progress: Math.min(100, progress),
      };
    }
  }
  return { level: 1, title: 'Aprendiz', progress: 0 };
}

/**
 * Obtiene los bonus de maestría aplicables
 */
export function getMasteryBonuses(level: number): MasteryBonus[] {
  return MASTERY_BONUSES.filter((bonus) => bonus.level <= level);
}

/**
 * Verifica si un hito está completado
 */
export function checkMilestoneCompletion(
  milestone: ConstructionMilestone,
  stats: {
    totalBuilds: number;
    uniqueMaterials: number;
    currentStreak: number;
    materialsByType: Record<string, number>;
    buildsByType: Record<string, number>;
    eventsCompleted: number;
    masteryLevels: Record<string, number>;
  }
): boolean {
  const { requirements } = milestone;

  switch (requirements.type) {
    case 'count':
      if (requirements.elementType) {
        return (stats.buildsByType[requirements.elementType] || 0) >= requirements.target;
      }
      if (requirements.condition) {
        return (stats.materialsByType[requirements.condition] || 0) >= requirements.target;
      }
      return stats.totalBuilds >= requirements.target;

    case 'unique':
      return stats.uniqueMaterials >= requirements.target;

    case 'streak':
      return stats.currentStreak >= requirements.target;

    case 'event':
      return stats.eventsCompleted >= requirements.target;

    case 'theme':
    case 'combo':
    case 'time':
      // Estos requieren verificación especial
      return false;

    default:
      return false;
  }
}

/**
 * Obtiene hitos pendientes por categoría
 */
export function getPendingMilestones(
  completedMilestones: string[],
  category?: MilestoneCategory
): ConstructionMilestone[] {
  return CONSTRUCTION_MILESTONES.filter(
    (m) =>
      !completedMilestones.includes(m.id) &&
      !m.hidden &&
      (category ? m.category === category : true)
  ).sort((a, b) => a.order - b.order);
}

/**
 * Obtiene el siguiente hito más cercano a completar
 */
export function getNextMilestone(
  completedMilestones: string[],
  stats: {
    totalBuilds: number;
    uniqueMaterials: number;
    currentStreak: number;
  }
): ConstructionMilestone | null {
  const pending = getPendingMilestones(completedMilestones);

  for (const milestone of pending) {
    const { requirements } = milestone;
    let progress = 0;

    switch (requirements.type) {
      case 'count':
        progress = stats.totalBuilds / requirements.target;
        break;
      case 'unique':
        progress = stats.uniqueMaterials / requirements.target;
        break;
      case 'streak':
        progress = stats.currentStreak / requirements.target;
        break;
    }

    // Retornar el primero que tenga progreso significativo (>25%)
    if (progress >= 0.25 && progress < 1) {
      return milestone;
    }
  }

  // Si no hay ninguno con progreso, retornar el primero pendiente
  return pending[0] || null;
}

/**
 * Calcula la recompensa total de un hito con multiplicadores
 */
export function calculateMilestoneReward(
  milestone: ConstructionMilestone,
  streakMultiplier: number,
  masteryBonus: number
): MilestoneReward {
  const baseReward = milestone.rewards;
  const totalMultiplier = streakMultiplier * (1 + masteryBonus);

  return {
    ...baseReward,
    xp: Math.round(baseReward.xp * totalMultiplier),
    coins: Math.round(baseReward.coins * totalMultiplier),
  };
}

/**
 * Verifica si un tema está completado
 */
export function checkThemeCompletion(
  theme: ThemeBonus,
  unlockedElements: string[]
): boolean {
  return theme.requiredElements.every((elementId) =>
    unlockedElements.includes(elementId)
  );
}

/**
 * Verifica si un evento está activo
 */
export function isEventActive(event: TemporalEvent): boolean {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  return now >= start && now <= end;
}

/**
 * Obtiene eventos activos
 */
export function getActiveEvents(): TemporalEvent[] {
  return TEMPORAL_EVENTS.filter(isEventActive);
}

/**
 * Calcula el prestigio basado en logros
 */
export function calculatePrestige(
  completedMilestones: string[],
  totalXP: number
): { level: number; title: string; nextLevelXP: number } {
  const PRESTIGE_LEVELS = [
    { level: 0, xp: 0, title: 'Nuevo Constructor' },
    { level: 1, xp: 5000, title: 'Constructor Bronce' },
    { level: 2, xp: 15000, title: 'Constructor Plata' },
    { level: 3, xp: 35000, title: 'Constructor Oro' },
    { level: 4, xp: 75000, title: 'Constructor Platino' },
    { level: 5, xp: 150000, title: 'Constructor Diamante' },
    { level: 6, xp: 300000, title: 'Constructor Legendario' },
    { level: 7, xp: 500000, title: 'Constructor Mítico' },
    { level: 8, xp: 1000000, title: 'Constructor Inmortal' },
  ];

  // Bonus XP por hitos completados
  const milestoneBonus = completedMilestones.length * 100;
  const effectiveXP = totalXP + milestoneBonus;

  for (let i = PRESTIGE_LEVELS.length - 1; i >= 0; i--) {
    if (effectiveXP >= PRESTIGE_LEVELS[i].xp) {
      const nextLevel = PRESTIGE_LEVELS[i + 1];
      return {
        level: PRESTIGE_LEVELS[i].level,
        title: PRESTIGE_LEVELS[i].title,
        nextLevelXP: nextLevel?.xp || PRESTIGE_LEVELS[i].xp,
      };
    }
  }

  return { level: 0, title: 'Nuevo Constructor', nextLevelXP: 5000 };
}

// ============================================
// EXPORTACIONES
// ============================================

const progressionAPI = {
  // Constantes
  STREAK_BONUSES,
  MASTERY_LEVELS,
  MASTERY_BONUSES,
  CONSTRUCTION_MILESTONES,
  THEME_BONUSES,
  TEMPORAL_EVENTS,

  // Funciones
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
};

export default progressionAPI;
