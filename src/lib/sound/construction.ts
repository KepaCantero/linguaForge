/**
 * Sistema de Sonido Ambiental para Construcción 3D
 * Audio espacializado, ASMR de materiales y música adaptativa
 *
 * TAREA 2.8.9.9: Sonido ambiental de construcción
 */

import { z } from 'zod';
import { type MaterialTexture } from '@/schemas/construction';

// ============================================
// TIPOS Y SCHEMAS
// ============================================

export const ConstructionSoundCategorySchema = z.enum([
  'ambient',       // Sonidos ambientales de fondo
  'material',      // Sonidos de interacción con materiales
  'action',        // Acciones de construcción
  'ui',            // Interfaz de usuario
  'celebration',   // Celebraciones y logros
  'asmr',          // Sonidos ASMR satisfactorios
  'music',         // Música de fondo adaptativa
]);

export type ConstructionSoundCategory = z.infer<typeof ConstructionSoundCategorySchema>;

export const ConstructionSoundTypeSchema = z.enum([
  // Material sounds (15)
  'wood_tap', 'wood_place', 'wood_scrape', 'wood_creak', 'wood_polish',
  'stone_tap', 'stone_place', 'stone_grind', 'stone_crack', 'stone_polish',
  'metal_tap', 'metal_place', 'metal_clang', 'metal_scrape', 'metal_ring',
  'glass_tap', 'glass_place', 'glass_chime', 'glass_shatter', 'glass_polish',
  'crystal_tap', 'crystal_place', 'crystal_hum', 'crystal_resonance', 'crystal_sparkle',
  // Action sounds (15)
  'build_start', 'build_progress', 'build_complete',
  'element_place', 'element_remove', 'element_rotate',
  'unlock_element', 'unlock_material', 'unlock_milestone',
  'upgrade_start', 'upgrade_complete',
  'craft_start', 'craft_complete',
  'collect_material', 'collect_reward',
  // UI sounds (10)
  'ui_click', 'ui_hover', 'ui_select', 'ui_back',
  'ui_open', 'ui_close', 'ui_toggle',
  'ui_error', 'ui_success', 'ui_notification',
  // Celebration sounds (8)
  'milestone_complete', 'streak_increase', 'streak_break',
  'level_up', 'prestige_up', 'theme_complete',
  'event_start', 'achievement_unlock',
  // Ambient sounds (8)
  'ambient_workshop', 'ambient_nature', 'ambient_wind',
  'ambient_birds', 'ambient_water', 'ambient_fire',
  'ambient_rain', 'ambient_night',
  // Music (4)
  'music_calm', 'music_building', 'music_celebration', 'music_event',
]);

export type ConstructionSoundType = z.infer<typeof ConstructionSoundTypeSchema>;

export interface ConstructionSoundConfig {
  id: ConstructionSoundType;
  category: ConstructionSoundCategory;
  baseFrequency: number;
  harmonics: number[];
  duration: number;
  volume: number;
  oscillatorType: OscillatorType;
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  spatial: boolean;
  loop: boolean;
}

export interface SpatialPosition {
  x: number;
  y: number;
  z: number;
}

export interface AdaptiveMusicState {
  currentTrack: string | null;
  intensity: number;  // 0-1
  mood: 'calm' | 'active' | 'celebration' | 'event';
  layersActive: number;
}

// ============================================
// CONFIGURACIÓN DE SONIDOS (50+)
// ============================================

const SOUND_CONFIGS: Record<ConstructionSoundType, ConstructionSoundConfig> = {
  // ============================================
  // MATERIAL: WOOD (5)
  // ============================================
  wood_tap: {
    id: 'wood_tap',
    category: 'material',
    baseFrequency: 180,
    harmonics: [1, 0.6, 0.3, 0.15],
    duration: 0.12,
    volume: 0.5,
    oscillatorType: 'triangle',
    envelope: { attack: 0.005, decay: 0.08, sustain: 0.2, release: 0.05 },
    spatial: true,
    loop: false,
  },
  wood_place: {
    id: 'wood_place',
    category: 'action',
    baseFrequency: 150,
    harmonics: [1, 0.5, 0.25],
    duration: 0.25,
    volume: 0.6,
    oscillatorType: 'triangle',
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.1 },
    spatial: true,
    loop: false,
  },
  wood_scrape: {
    id: 'wood_scrape',
    category: 'asmr',
    baseFrequency: 220,
    harmonics: [1, 0.8, 0.5, 0.3, 0.1],
    duration: 0.4,
    volume: 0.35,
    oscillatorType: 'sawtooth',
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.15 },
    spatial: true,
    loop: false,
  },
  wood_creak: {
    id: 'wood_creak',
    category: 'ambient',
    baseFrequency: 100,
    harmonics: [1, 0.7, 0.4, 0.2],
    duration: 0.6,
    volume: 0.25,
    oscillatorType: 'triangle',
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.3, release: 0.2 },
    spatial: true,
    loop: false,
  },
  wood_polish: {
    id: 'wood_polish',
    category: 'asmr',
    baseFrequency: 280,
    harmonics: [1, 0.4, 0.15],
    duration: 0.3,
    volume: 0.3,
    oscillatorType: 'sine',
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.5, release: 0.1 },
    spatial: true,
    loop: false,
  },

  // ============================================
  // MATERIAL: STONE (5)
  // ============================================
  stone_tap: {
    id: 'stone_tap',
    category: 'material',
    baseFrequency: 120,
    harmonics: [1, 0.8, 0.6, 0.4, 0.2],
    duration: 0.15,
    volume: 0.55,
    oscillatorType: 'triangle',
    envelope: { attack: 0.002, decay: 0.1, sustain: 0.15, release: 0.04 },
    spatial: true,
    loop: false,
  },
  stone_place: {
    id: 'stone_place',
    category: 'action',
    baseFrequency: 90,
    harmonics: [1, 0.9, 0.7, 0.5, 0.3],
    duration: 0.35,
    volume: 0.65,
    oscillatorType: 'triangle',
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.25, release: 0.1 },
    spatial: true,
    loop: false,
  },
  stone_grind: {
    id: 'stone_grind',
    category: 'asmr',
    baseFrequency: 150,
    harmonics: [1, 0.9, 0.8, 0.6, 0.4, 0.2],
    duration: 0.5,
    volume: 0.4,
    oscillatorType: 'sawtooth',
    envelope: { attack: 0.08, decay: 0.25, sustain: 0.35, release: 0.15 },
    spatial: true,
    loop: false,
  },
  stone_crack: {
    id: 'stone_crack',
    category: 'action',
    baseFrequency: 200,
    harmonics: [1, 0.7, 0.4, 0.15],
    duration: 0.1,
    volume: 0.7,
    oscillatorType: 'square',
    envelope: { attack: 0.001, decay: 0.05, sustain: 0.1, release: 0.04 },
    spatial: true,
    loop: false,
  },
  stone_polish: {
    id: 'stone_polish',
    category: 'asmr',
    baseFrequency: 320,
    harmonics: [1, 0.3, 0.1],
    duration: 0.35,
    volume: 0.3,
    oscillatorType: 'sine',
    envelope: { attack: 0.03, decay: 0.15, sustain: 0.5, release: 0.12 },
    spatial: true,
    loop: false,
  },

  // ============================================
  // MATERIAL: METAL (5)
  // ============================================
  metal_tap: {
    id: 'metal_tap',
    category: 'material',
    baseFrequency: 440,
    harmonics: [1, 0.5, 0.25, 0.12],
    duration: 0.3,
    volume: 0.45,
    oscillatorType: 'sine',
    envelope: { attack: 0.001, decay: 0.15, sustain: 0.3, release: 0.15 },
    spatial: true,
    loop: false,
  },
  metal_place: {
    id: 'metal_place',
    category: 'action',
    baseFrequency: 350,
    harmonics: [1, 0.6, 0.35, 0.2],
    duration: 0.4,
    volume: 0.55,
    oscillatorType: 'sine',
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.35, release: 0.15 },
    spatial: true,
    loop: false,
  },
  metal_clang: {
    id: 'metal_clang',
    category: 'action',
    baseFrequency: 520,
    harmonics: [1, 0.7, 0.45, 0.25, 0.1],
    duration: 0.5,
    volume: 0.65,
    oscillatorType: 'sine',
    envelope: { attack: 0.001, decay: 0.2, sustain: 0.4, release: 0.3 },
    spatial: true,
    loop: false,
  },
  metal_scrape: {
    id: 'metal_scrape',
    category: 'asmr',
    baseFrequency: 600,
    harmonics: [1, 0.8, 0.6, 0.4, 0.2],
    duration: 0.45,
    volume: 0.35,
    oscillatorType: 'sawtooth',
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.2 },
    spatial: true,
    loop: false,
  },
  metal_ring: {
    id: 'metal_ring',
    category: 'celebration',
    baseFrequency: 880,
    harmonics: [1, 0.4, 0.15, 0.05],
    duration: 1.2,
    volume: 0.4,
    oscillatorType: 'sine',
    envelope: { attack: 0.001, decay: 0.3, sustain: 0.5, release: 0.4 },
    spatial: true,
    loop: false,
  },

  // ============================================
  // MATERIAL: GLASS (5)
  // ============================================
  glass_tap: {
    id: 'glass_tap',
    category: 'material',
    baseFrequency: 1200,
    harmonics: [1, 0.3, 0.1],
    duration: 0.2,
    volume: 0.4,
    oscillatorType: 'sine',
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.2, release: 0.1 },
    spatial: true,
    loop: false,
  },
  glass_place: {
    id: 'glass_place',
    category: 'action',
    baseFrequency: 1000,
    harmonics: [1, 0.4, 0.15],
    duration: 0.25,
    volume: 0.5,
    oscillatorType: 'sine',
    envelope: { attack: 0.005, decay: 0.12, sustain: 0.25, release: 0.1 },
    spatial: true,
    loop: false,
  },
  glass_chime: {
    id: 'glass_chime',
    category: 'celebration',
    baseFrequency: 1500,
    harmonics: [1, 0.35, 0.12],
    duration: 0.8,
    volume: 0.45,
    oscillatorType: 'sine',
    envelope: { attack: 0.002, decay: 0.25, sustain: 0.4, release: 0.35 },
    spatial: true,
    loop: false,
  },
  glass_shatter: {
    id: 'glass_shatter',
    category: 'action',
    baseFrequency: 2000,
    harmonics: [1, 0.8, 0.6, 0.4, 0.2],
    duration: 0.15,
    volume: 0.6,
    oscillatorType: 'sawtooth',
    envelope: { attack: 0.001, decay: 0.08, sustain: 0.1, release: 0.06 },
    spatial: true,
    loop: false,
  },
  glass_polish: {
    id: 'glass_polish',
    category: 'asmr',
    baseFrequency: 1100,
    harmonics: [1, 0.25, 0.08],
    duration: 0.35,
    volume: 0.3,
    oscillatorType: 'sine',
    envelope: { attack: 0.03, decay: 0.15, sustain: 0.45, release: 0.12 },
    spatial: true,
    loop: false,
  },

  // ============================================
  // MATERIAL: CRYSTAL (5)
  // ============================================
  crystal_tap: {
    id: 'crystal_tap',
    category: 'material',
    baseFrequency: 1800,
    harmonics: [1, 0.25, 0.08],
    duration: 0.35,
    volume: 0.4,
    oscillatorType: 'sine',
    envelope: { attack: 0.001, decay: 0.15, sustain: 0.3, release: 0.2 },
    spatial: true,
    loop: false,
  },
  crystal_place: {
    id: 'crystal_place',
    category: 'action',
    baseFrequency: 1600,
    harmonics: [1, 0.3, 0.1],
    duration: 0.4,
    volume: 0.5,
    oscillatorType: 'sine',
    envelope: { attack: 0.005, decay: 0.18, sustain: 0.35, release: 0.17 },
    spatial: true,
    loop: false,
  },
  crystal_hum: {
    id: 'crystal_hum',
    category: 'ambient',
    baseFrequency: 528,
    harmonics: [1, 0.5, 0.25],
    duration: 3.0,
    volume: 0.2,
    oscillatorType: 'sine',
    envelope: { attack: 0.5, decay: 1.0, sustain: 0.6, release: 1.5 },
    spatial: true,
    loop: true,
  },
  crystal_resonance: {
    id: 'crystal_resonance',
    category: 'celebration',
    baseFrequency: 2200,
    harmonics: [1, 0.4, 0.15, 0.05],
    duration: 1.5,
    volume: 0.45,
    oscillatorType: 'sine',
    envelope: { attack: 0.01, decay: 0.4, sustain: 0.5, release: 0.6 },
    spatial: true,
    loop: false,
  },
  crystal_sparkle: {
    id: 'crystal_sparkle',
    category: 'asmr',
    baseFrequency: 3000,
    harmonics: [1, 0.2, 0.05],
    duration: 0.15,
    volume: 0.35,
    oscillatorType: 'sine',
    envelope: { attack: 0.001, decay: 0.08, sustain: 0.15, release: 0.06 },
    spatial: true,
    loop: false,
  },

  // ============================================
  // ACTION SOUNDS (15)
  // ============================================
  build_start: {
    id: 'build_start',
    category: 'action',
    baseFrequency: 300,
    harmonics: [1, 0.6, 0.3],
    duration: 0.3,
    volume: 0.5,
    oscillatorType: 'triangle',
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.3, release: 0.1 },
    spatial: false,
    loop: false,
  },
  build_progress: {
    id: 'build_progress',
    category: 'action',
    baseFrequency: 400,
    harmonics: [1, 0.5, 0.2],
    duration: 0.15,
    volume: 0.4,
    oscillatorType: 'sine',
    envelope: { attack: 0.01, decay: 0.08, sustain: 0.2, release: 0.06 },
    spatial: false,
    loop: false,
  },
  build_complete: {
    id: 'build_complete',
    category: 'celebration',
    baseFrequency: 523,
    harmonics: [1, 0.5, 0.25],
    duration: 0.5,
    volume: 0.6,
    oscillatorType: 'sine',
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 },
    spatial: false,
    loop: false,
  },
  element_place: {
    id: 'element_place',
    category: 'action',
    baseFrequency: 250,
    harmonics: [1, 0.7, 0.4, 0.2],
    duration: 0.2,
    volume: 0.55,
    oscillatorType: 'triangle',
    envelope: { attack: 0.005, decay: 0.12, sustain: 0.2, release: 0.08 },
    spatial: true,
    loop: false,
  },
  element_remove: {
    id: 'element_remove',
    category: 'action',
    baseFrequency: 200,
    harmonics: [1, 0.6, 0.3],
    duration: 0.18,
    volume: 0.45,
    oscillatorType: 'triangle',
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.15, release: 0.07 },
    spatial: true,
    loop: false,
  },
  element_rotate: {
    id: 'element_rotate',
    category: 'action',
    baseFrequency: 350,
    harmonics: [1, 0.4, 0.15],
    duration: 0.25,
    volume: 0.4,
    oscillatorType: 'sine',
    envelope: { attack: 0.02, decay: 0.12, sustain: 0.25, release: 0.1 },
    spatial: true,
    loop: false,
  },
  unlock_element: {
    id: 'unlock_element',
    category: 'celebration',
    baseFrequency: 600,
    harmonics: [1, 0.5, 0.25],
    duration: 0.4,
    volume: 0.6,
    oscillatorType: 'sine',
    envelope: { attack: 0.01, decay: 0.18, sustain: 0.35, release: 0.2 },
    spatial: false,
    loop: false,
  },
  unlock_material: {
    id: 'unlock_material',
    category: 'celebration',
    baseFrequency: 700,
    harmonics: [1, 0.45, 0.2],
    duration: 0.35,
    volume: 0.55,
    oscillatorType: 'sine',
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.18 },
    spatial: false,
    loop: false,
  },
  unlock_milestone: {
    id: 'unlock_milestone',
    category: 'celebration',
    baseFrequency: 800,
    harmonics: [1, 0.5, 0.25, 0.1],
    duration: 0.6,
    volume: 0.7,
    oscillatorType: 'sine',
    envelope: { attack: 0.01, decay: 0.25, sustain: 0.4, release: 0.35 },
    spatial: false,
    loop: false,
  },
  upgrade_start: {
    id: 'upgrade_start',
    category: 'action',
    baseFrequency: 450,
    harmonics: [1, 0.55, 0.3],
    duration: 0.25,
    volume: 0.5,
    oscillatorType: 'triangle',
    envelope: { attack: 0.02, decay: 0.12, sustain: 0.25, release: 0.1 },
    spatial: false,
    loop: false,
  },
  upgrade_complete: {
    id: 'upgrade_complete',
    category: 'celebration',
    baseFrequency: 650,
    harmonics: [1, 0.5, 0.25],
    duration: 0.45,
    volume: 0.6,
    oscillatorType: 'sine',
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.35, release: 0.24 },
    spatial: false,
    loop: false,
  },
  craft_start: {
    id: 'craft_start',
    category: 'action',
    baseFrequency: 380,
    harmonics: [1, 0.6, 0.35],
    duration: 0.22,
    volume: 0.5,
    oscillatorType: 'triangle',
    envelope: { attack: 0.015, decay: 0.1, sustain: 0.22, release: 0.08 },
    spatial: false,
    loop: false,
  },
  craft_complete: {
    id: 'craft_complete',
    category: 'celebration',
    baseFrequency: 550,
    harmonics: [1, 0.5, 0.25],
    duration: 0.4,
    volume: 0.55,
    oscillatorType: 'sine',
    envelope: { attack: 0.01, decay: 0.18, sustain: 0.32, release: 0.22 },
    spatial: false,
    loop: false,
  },
  collect_material: {
    id: 'collect_material',
    category: 'action',
    baseFrequency: 500,
    harmonics: [1, 0.4, 0.15],
    duration: 0.18,
    volume: 0.5,
    oscillatorType: 'sine',
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.18, release: 0.07 },
    spatial: false,
    loop: false,
  },
  collect_reward: {
    id: 'collect_reward',
    category: 'celebration',
    baseFrequency: 750,
    harmonics: [1, 0.45, 0.2],
    duration: 0.35,
    volume: 0.6,
    oscillatorType: 'sine',
    envelope: { attack: 0.008, decay: 0.15, sustain: 0.3, release: 0.2 },
    spatial: false,
    loop: false,
  },

  // ============================================
  // UI SOUNDS (10)
  // ============================================
  ui_click: {
    id: 'ui_click',
    category: 'ui',
    baseFrequency: 800,
    harmonics: [1, 0.3],
    duration: 0.05,
    volume: 0.35,
    oscillatorType: 'sine',
    envelope: { attack: 0.001, decay: 0.03, sustain: 0.1, release: 0.02 },
    spatial: false,
    loop: false,
  },
  ui_hover: {
    id: 'ui_hover',
    category: 'ui',
    baseFrequency: 600,
    harmonics: [1, 0.2],
    duration: 0.04,
    volume: 0.2,
    oscillatorType: 'sine',
    envelope: { attack: 0.002, decay: 0.02, sustain: 0.08, release: 0.02 },
    spatial: false,
    loop: false,
  },
  ui_select: {
    id: 'ui_select',
    category: 'ui',
    baseFrequency: 700,
    harmonics: [1, 0.35],
    duration: 0.08,
    volume: 0.4,
    oscillatorType: 'sine',
    envelope: { attack: 0.002, decay: 0.04, sustain: 0.12, release: 0.03 },
    spatial: false,
    loop: false,
  },
  ui_back: {
    id: 'ui_back',
    category: 'ui',
    baseFrequency: 500,
    harmonics: [1, 0.3],
    duration: 0.06,
    volume: 0.35,
    oscillatorType: 'sine',
    envelope: { attack: 0.002, decay: 0.035, sustain: 0.1, release: 0.025 },
    spatial: false,
    loop: false,
  },
  ui_open: {
    id: 'ui_open',
    category: 'ui',
    baseFrequency: 550,
    harmonics: [1, 0.4, 0.15],
    duration: 0.12,
    volume: 0.4,
    oscillatorType: 'sine',
    envelope: { attack: 0.01, decay: 0.06, sustain: 0.15, release: 0.05 },
    spatial: false,
    loop: false,
  },
  ui_close: {
    id: 'ui_close',
    category: 'ui',
    baseFrequency: 450,
    harmonics: [1, 0.35, 0.12],
    duration: 0.1,
    volume: 0.38,
    oscillatorType: 'sine',
    envelope: { attack: 0.008, decay: 0.05, sustain: 0.12, release: 0.04 },
    spatial: false,
    loop: false,
  },
  ui_toggle: {
    id: 'ui_toggle',
    category: 'ui',
    baseFrequency: 650,
    harmonics: [1, 0.3],
    duration: 0.07,
    volume: 0.35,
    oscillatorType: 'sine',
    envelope: { attack: 0.003, decay: 0.04, sustain: 0.1, release: 0.03 },
    spatial: false,
    loop: false,
  },
  ui_error: {
    id: 'ui_error',
    category: 'ui',
    baseFrequency: 300,
    harmonics: [1, 0.6, 0.3],
    duration: 0.2,
    volume: 0.45,
    oscillatorType: 'triangle',
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.15, release: 0.08 },
    spatial: false,
    loop: false,
  },
  ui_success: {
    id: 'ui_success',
    category: 'ui',
    baseFrequency: 900,
    harmonics: [1, 0.4, 0.15],
    duration: 0.15,
    volume: 0.45,
    oscillatorType: 'sine',
    envelope: { attack: 0.005, decay: 0.08, sustain: 0.15, release: 0.06 },
    spatial: false,
    loop: false,
  },
  ui_notification: {
    id: 'ui_notification',
    category: 'ui',
    baseFrequency: 750,
    harmonics: [1, 0.35, 0.12],
    duration: 0.25,
    volume: 0.5,
    oscillatorType: 'sine',
    envelope: { attack: 0.008, decay: 0.12, sustain: 0.2, release: 0.1 },
    spatial: false,
    loop: false,
  },

  // ============================================
  // CELEBRATION SOUNDS (8)
  // ============================================
  milestone_complete: {
    id: 'milestone_complete',
    category: 'celebration',
    baseFrequency: 523,
    harmonics: [1, 0.5, 0.25, 0.12],
    duration: 0.8,
    volume: 0.7,
    oscillatorType: 'sine',
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.5 },
    spatial: false,
    loop: false,
  },
  streak_increase: {
    id: 'streak_increase',
    category: 'celebration',
    baseFrequency: 600,
    harmonics: [1, 0.45, 0.2],
    duration: 0.4,
    volume: 0.55,
    oscillatorType: 'sine',
    envelope: { attack: 0.01, decay: 0.18, sustain: 0.35, release: 0.22 },
    spatial: false,
    loop: false,
  },
  streak_break: {
    id: 'streak_break',
    category: 'ui',
    baseFrequency: 250,
    harmonics: [1, 0.7, 0.4],
    duration: 0.35,
    volume: 0.5,
    oscillatorType: 'triangle',
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.25, release: 0.15 },
    spatial: false,
    loop: false,
  },
  level_up: {
    id: 'level_up',
    category: 'celebration',
    baseFrequency: 700,
    harmonics: [1, 0.5, 0.25, 0.1],
    duration: 1.0,
    volume: 0.75,
    oscillatorType: 'sine',
    envelope: { attack: 0.02, decay: 0.4, sustain: 0.5, release: 0.6 },
    spatial: false,
    loop: false,
  },
  prestige_up: {
    id: 'prestige_up',
    category: 'celebration',
    baseFrequency: 880,
    harmonics: [1, 0.45, 0.2, 0.08],
    duration: 1.5,
    volume: 0.8,
    oscillatorType: 'sine',
    envelope: { attack: 0.03, decay: 0.5, sustain: 0.55, release: 0.95 },
    spatial: false,
    loop: false,
  },
  theme_complete: {
    id: 'theme_complete',
    category: 'celebration',
    baseFrequency: 660,
    harmonics: [1, 0.5, 0.25],
    duration: 0.9,
    volume: 0.7,
    oscillatorType: 'sine',
    envelope: { attack: 0.015, decay: 0.35, sustain: 0.45, release: 0.55 },
    spatial: false,
    loop: false,
  },
  event_start: {
    id: 'event_start',
    category: 'celebration',
    baseFrequency: 550,
    harmonics: [1, 0.55, 0.3, 0.15],
    duration: 1.2,
    volume: 0.65,
    oscillatorType: 'sine',
    envelope: { attack: 0.05, decay: 0.4, sustain: 0.5, release: 0.75 },
    spatial: false,
    loop: false,
  },
  achievement_unlock: {
    id: 'achievement_unlock',
    category: 'celebration',
    baseFrequency: 750,
    harmonics: [1, 0.5, 0.25, 0.1],
    duration: 0.7,
    volume: 0.7,
    oscillatorType: 'sine',
    envelope: { attack: 0.01, decay: 0.28, sustain: 0.45, release: 0.42 },
    spatial: false,
    loop: false,
  },

  // ============================================
  // AMBIENT SOUNDS (8)
  // ============================================
  ambient_workshop: {
    id: 'ambient_workshop',
    category: 'ambient',
    baseFrequency: 80,
    harmonics: [1, 0.8, 0.6, 0.4, 0.2],
    duration: 10.0,
    volume: 0.15,
    oscillatorType: 'sine',
    envelope: { attack: 2.0, decay: 3.0, sustain: 0.8, release: 5.0 },
    spatial: false,
    loop: true,
  },
  ambient_nature: {
    id: 'ambient_nature',
    category: 'ambient',
    baseFrequency: 200,
    harmonics: [1, 0.5, 0.25],
    duration: 8.0,
    volume: 0.12,
    oscillatorType: 'sine',
    envelope: { attack: 1.5, decay: 2.5, sustain: 0.7, release: 4.0 },
    spatial: false,
    loop: true,
  },
  ambient_wind: {
    id: 'ambient_wind',
    category: 'ambient',
    baseFrequency: 150,
    harmonics: [1, 0.6, 0.35, 0.15],
    duration: 6.0,
    volume: 0.1,
    oscillatorType: 'sine',
    envelope: { attack: 1.0, decay: 2.0, sustain: 0.6, release: 3.0 },
    spatial: false,
    loop: true,
  },
  ambient_birds: {
    id: 'ambient_birds',
    category: 'ambient',
    baseFrequency: 1200,
    harmonics: [1, 0.4, 0.15],
    duration: 2.0,
    volume: 0.18,
    oscillatorType: 'sine',
    envelope: { attack: 0.1, decay: 0.5, sustain: 0.4, release: 1.0 },
    spatial: false,
    loop: false,
  },
  ambient_water: {
    id: 'ambient_water',
    category: 'ambient',
    baseFrequency: 300,
    harmonics: [1, 0.6, 0.35, 0.2],
    duration: 5.0,
    volume: 0.15,
    oscillatorType: 'sine',
    envelope: { attack: 0.8, decay: 1.5, sustain: 0.65, release: 2.7 },
    spatial: false,
    loop: true,
  },
  ambient_fire: {
    id: 'ambient_fire',
    category: 'ambient',
    baseFrequency: 180,
    harmonics: [1, 0.7, 0.45, 0.25, 0.1],
    duration: 4.0,
    volume: 0.14,
    oscillatorType: 'triangle',
    envelope: { attack: 0.5, decay: 1.2, sustain: 0.55, release: 2.3 },
    spatial: false,
    loop: true,
  },
  ambient_rain: {
    id: 'ambient_rain',
    category: 'ambient',
    baseFrequency: 400,
    harmonics: [1, 0.5, 0.3, 0.15],
    duration: 7.0,
    volume: 0.12,
    oscillatorType: 'sine',
    envelope: { attack: 1.2, decay: 2.2, sustain: 0.7, release: 3.6 },
    spatial: false,
    loop: true,
  },
  ambient_night: {
    id: 'ambient_night',
    category: 'ambient',
    baseFrequency: 100,
    harmonics: [1, 0.7, 0.5, 0.3],
    duration: 8.0,
    volume: 0.1,
    oscillatorType: 'sine',
    envelope: { attack: 1.5, decay: 2.5, sustain: 0.75, release: 4.0 },
    spatial: false,
    loop: true,
  },

  // ============================================
  // MUSIC (4)
  // ============================================
  music_calm: {
    id: 'music_calm',
    category: 'music',
    baseFrequency: 261.63, // C4
    harmonics: [1, 0.5, 0.25],
    duration: 30.0,
    volume: 0.2,
    oscillatorType: 'sine',
    envelope: { attack: 3.0, decay: 5.0, sustain: 0.8, release: 10.0 },
    spatial: false,
    loop: true,
  },
  music_building: {
    id: 'music_building',
    category: 'music',
    baseFrequency: 329.63, // E4
    harmonics: [1, 0.55, 0.3],
    duration: 25.0,
    volume: 0.25,
    oscillatorType: 'sine',
    envelope: { attack: 2.5, decay: 4.5, sustain: 0.75, release: 8.0 },
    spatial: false,
    loop: true,
  },
  music_celebration: {
    id: 'music_celebration',
    category: 'music',
    baseFrequency: 392.00, // G4
    harmonics: [1, 0.5, 0.25, 0.1],
    duration: 20.0,
    volume: 0.3,
    oscillatorType: 'sine',
    envelope: { attack: 2.0, decay: 4.0, sustain: 0.7, release: 6.0 },
    spatial: false,
    loop: true,
  },
  music_event: {
    id: 'music_event',
    category: 'music',
    baseFrequency: 440.00, // A4
    harmonics: [1, 0.5, 0.3, 0.15],
    duration: 25.0,
    volume: 0.28,
    oscillatorType: 'sine',
    envelope: { attack: 2.5, decay: 4.5, sustain: 0.75, release: 8.0 },
    spatial: false,
    loop: true,
  },
};

// ============================================
// MAPEO MATERIAL → SONIDOS
// ============================================

const MATERIAL_SOUND_MAP: Record<MaterialTexture, {
  tap: ConstructionSoundType;
  place: ConstructionSoundType;
  asmr: ConstructionSoundType;
}> = {
  wood: { tap: 'wood_tap', place: 'wood_place', asmr: 'wood_scrape' },
  stone: { tap: 'stone_tap', place: 'stone_place', asmr: 'stone_grind' },
  metal: { tap: 'metal_tap', place: 'metal_place', asmr: 'metal_scrape' },
  glass: { tap: 'glass_tap', place: 'glass_place', asmr: 'glass_polish' },
  crystal: { tap: 'crystal_tap', place: 'crystal_place', asmr: 'crystal_sparkle' },
};

// ============================================
// CLASE: CONSTRUCTION SOUND ENGINE
// ============================================

class ConstructionSoundEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private categoryGains: Map<ConstructionSoundCategory, GainNode> = new Map();
  private activeNodes: Set<AudioNode> = new Set();
  private ambientLoops: Map<string, { oscillator: OscillatorNode; gain: GainNode }> = new Map();
  private musicState: AdaptiveMusicState = {
    currentTrack: null,
    intensity: 0.5,
    mood: 'calm',
    layersActive: 1,
  };

  private state = {
    initialized: false,
    muted: false,
    masterVolume: 0.5,
    categoryVolumes: {
      ambient: 0.3,
      material: 0.6,
      action: 0.6,
      ui: 0.5,
      celebration: 0.7,
      asmr: 0.4,
      music: 0.25,
    } as Record<ConstructionSoundCategory, number>,
  };

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  async initialize(): Promise<boolean> {
    if (this.state.initialized) return true;

    try {
      const AudioContextClass = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) {
        return false;
      }

      this.audioContext = new AudioContextClass();

      // Master gain
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.state.masterVolume;
      this.masterGain.connect(this.audioContext.destination);

      // Category gains
      const categories: ConstructionSoundCategory[] = [
        'ambient', 'material', 'action', 'ui', 'celebration', 'asmr', 'music'
      ];

      for (const category of categories) {
        const gain = this.audioContext.createGain();
        gain.gain.value = this.state.categoryVolumes[category];
        gain.connect(this.masterGain);
        this.categoryGains.set(category, gain);
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.state.initialized = true;
      return true;
    } catch {
      return false;
    }
  }

  isInitialized(): boolean {
    return this.state.initialized;
  }

  // ============================================
  // CONTROL DE VOLUMEN
  // ============================================

  setMasterVolume(volume: number): void {
    this.state.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(
        this.state.masterVolume,
        this.audioContext.currentTime
      );
    }
  }

  setCategoryVolume(category: ConstructionSoundCategory, volume: number): void {
    this.state.categoryVolumes[category] = Math.max(0, Math.min(1, volume));
    const gain = this.categoryGains.get(category);
    if (gain && this.audioContext) {
      gain.gain.setValueAtTime(
        this.state.categoryVolumes[category],
        this.audioContext.currentTime
      );
    }
  }

  setMuted(muted: boolean): void {
    this.state.muted = muted;
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(
        muted ? 0 : this.state.masterVolume,
        this.audioContext.currentTime
      );
    }
  }

  isMuted(): boolean {
    return this.state.muted;
  }

  // ============================================
  // GENERACIÓN DE SONIDOS
  // ============================================

  private playSound(config: ConstructionSoundConfig, position?: SpatialPosition): void {
    if (this.state.muted || !this.state.initialized || !this.audioContext || !this.masterGain) {
      return;
    }

    const categoryGain = this.categoryGains.get(config.category);
    if (!categoryGain) return;

    const now = this.audioContext.currentTime;
    const { attack, decay, sustain, release } = config.envelope;

    // Create oscillators for each harmonic
    config.harmonics.forEach((harmonic, index) => {
      const freq = config.baseFrequency * (index + 1);
      const volume = config.volume * harmonic;

      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.type = config.oscillatorType;
      oscillator.frequency.value = freq;

      // ADSR envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + attack);
      gainNode.gain.linearRampToValueAtTime(volume * sustain, now + attack + decay);
      gainNode.gain.setValueAtTime(volume * sustain, now + config.duration - release);
      gainNode.gain.linearRampToValueAtTime(0, now + config.duration);

      // Connect with optional spatial positioning
      if (config.spatial && position) {
        const panner = this.audioContext!.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, position.x / 10));
        oscillator.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(categoryGain);
      } else {
        oscillator.connect(gainNode);
        gainNode.connect(categoryGain);
      }

      this.activeNodes.add(oscillator);

      oscillator.onended = () => {
        this.activeNodes.delete(oscillator);
      };

      oscillator.start(now);
      oscillator.stop(now + config.duration);
    });
  }

  // ============================================
  // API PÚBLICA: MATERIAL SOUNDS
  // ============================================

  playMaterialTap(material: MaterialTexture, position?: SpatialPosition): void {
    const soundType = MATERIAL_SOUND_MAP[material]?.tap;
    if (soundType) {
      this.playSound(SOUND_CONFIGS[soundType], position);
    }
  }

  playMaterialPlace(material: MaterialTexture, position?: SpatialPosition): void {
    const soundType = MATERIAL_SOUND_MAP[material]?.place;
    if (soundType) {
      this.playSound(SOUND_CONFIGS[soundType], position);
    }
  }

  playMaterialASMR(material: MaterialTexture, position?: SpatialPosition): void {
    const soundType = MATERIAL_SOUND_MAP[material]?.asmr;
    if (soundType) {
      this.playSound(SOUND_CONFIGS[soundType], position);
    }
  }

  // ============================================
  // API PÚBLICA: ACTION SOUNDS
  // ============================================

  playBuildStart(): void {
    this.playSound(SOUND_CONFIGS.build_start);
  }

  playBuildProgress(): void {
    this.playSound(SOUND_CONFIGS.build_progress);
  }

  playBuildComplete(): void {
    this.playSound(SOUND_CONFIGS.build_complete);
  }

  playElementPlace(position?: SpatialPosition): void {
    this.playSound(SOUND_CONFIGS.element_place, position);
  }

  playElementRemove(position?: SpatialPosition): void {
    this.playSound(SOUND_CONFIGS.element_remove, position);
  }

  playElementRotate(position?: SpatialPosition): void {
    this.playSound(SOUND_CONFIGS.element_rotate, position);
  }

  playUnlockElement(): void {
    this.playSound(SOUND_CONFIGS.unlock_element);
  }

  playUnlockMaterial(): void {
    this.playSound(SOUND_CONFIGS.unlock_material);
  }

  playUnlockMilestone(): void {
    this.playSound(SOUND_CONFIGS.unlock_milestone);
  }

  playUpgradeStart(): void {
    this.playSound(SOUND_CONFIGS.upgrade_start);
  }

  playUpgradeComplete(): void {
    this.playSound(SOUND_CONFIGS.upgrade_complete);
  }

  playCraftStart(): void {
    this.playSound(SOUND_CONFIGS.craft_start);
  }

  playCraftComplete(): void {
    this.playSound(SOUND_CONFIGS.craft_complete);
  }

  playCollectMaterial(): void {
    this.playSound(SOUND_CONFIGS.collect_material);
  }

  playCollectReward(): void {
    this.playSound(SOUND_CONFIGS.collect_reward);
  }

  // ============================================
  // API PÚBLICA: UI SOUNDS
  // ============================================

  playUIClick(): void {
    this.playSound(SOUND_CONFIGS.ui_click);
  }

  playUIHover(): void {
    this.playSound(SOUND_CONFIGS.ui_hover);
  }

  playUISelect(): void {
    this.playSound(SOUND_CONFIGS.ui_select);
  }

  playUIBack(): void {
    this.playSound(SOUND_CONFIGS.ui_back);
  }

  playUIOpen(): void {
    this.playSound(SOUND_CONFIGS.ui_open);
  }

  playUIClose(): void {
    this.playSound(SOUND_CONFIGS.ui_close);
  }

  playUIToggle(): void {
    this.playSound(SOUND_CONFIGS.ui_toggle);
  }

  playUIError(): void {
    this.playSound(SOUND_CONFIGS.ui_error);
  }

  playUISuccess(): void {
    this.playSound(SOUND_CONFIGS.ui_success);
  }

  playUINotification(): void {
    this.playSound(SOUND_CONFIGS.ui_notification);
  }

  // ============================================
  // API PÚBLICA: CELEBRATION SOUNDS
  // ============================================

  playMilestoneComplete(): void {
    this.playSound(SOUND_CONFIGS.milestone_complete);
  }

  playStreakIncrease(): void {
    this.playSound(SOUND_CONFIGS.streak_increase);
  }

  playStreakBreak(): void {
    this.playSound(SOUND_CONFIGS.streak_break);
  }

  playLevelUp(): void {
    // Play multiple sounds for dramatic effect
    this.playSound(SOUND_CONFIGS.level_up);
    setTimeout(() => {
      if (!this.state.muted) {
        this.playSound(SOUND_CONFIGS.metal_ring);
      }
    }, 200);
  }

  playPrestigeUp(): void {
    this.playSound(SOUND_CONFIGS.prestige_up);
    setTimeout(() => {
      if (!this.state.muted) {
        this.playSound(SOUND_CONFIGS.crystal_resonance);
      }
    }, 300);
  }

  playThemeComplete(): void {
    this.playSound(SOUND_CONFIGS.theme_complete);
  }

  playEventStart(): void {
    this.playSound(SOUND_CONFIGS.event_start);
  }

  playAchievementUnlock(): void {
    this.playSound(SOUND_CONFIGS.achievement_unlock);
  }

  // ============================================
  // API PÚBLICA: AMBIENT SOUNDS
  // ============================================

  startAmbient(type: 'workshop' | 'nature' | 'wind' | 'water' | 'fire' | 'rain' | 'night'): void {
    if (!this.audioContext || !this.state.initialized || this.state.muted) return;

    const soundType = `ambient_${type}` as ConstructionSoundType;
    const config = SOUND_CONFIGS[soundType];
    if (!config) return;

    // Stop existing ambient of same type
    this.stopAmbient(type);

    const categoryGain = this.categoryGains.get('ambient');
    if (!categoryGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = config.oscillatorType;
    oscillator.frequency.value = config.baseFrequency;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      config.volume,
      this.audioContext.currentTime + config.envelope.attack
    );

    oscillator.connect(gainNode);
    gainNode.connect(categoryGain);

    oscillator.start();

    this.ambientLoops.set(type, { oscillator, gain: gainNode });
  }

  stopAmbient(type: string): void {
    const loop = this.ambientLoops.get(type);
    if (loop && this.audioContext) {
      const now = this.audioContext.currentTime;
      loop.gain.gain.linearRampToValueAtTime(0, now + 0.5);
      setTimeout(() => {
        try {
          loop.oscillator.stop();
        } catch {
          // Already stopped
        }
        this.ambientLoops.delete(type);
      }, 600);
    }
  }

  stopAllAmbient(): void {
    this.ambientLoops.forEach((_, type) => {
      this.stopAmbient(type);
    });
  }

  // ============================================
  // API PÚBLICA: ADAPTIVE MUSIC
  // ============================================

  setMusicMood(mood: AdaptiveMusicState['mood']): void {
    this.musicState.mood = mood;
    // Could trigger music transition here
  }

  setMusicIntensity(intensity: number): void {
    this.musicState.intensity = Math.max(0, Math.min(1, intensity));
    const musicGain = this.categoryGains.get('music');
    if (musicGain && this.audioContext) {
      const baseVolume = this.state.categoryVolumes.music;
      musicGain.gain.setValueAtTime(
        baseVolume * this.musicState.intensity,
        this.audioContext.currentTime
      );
    }
  }

  getMusicState(): AdaptiveMusicState {
    return { ...this.musicState };
  }

  // ============================================
  // GENERIC PLAY
  // ============================================

  play(soundType: ConstructionSoundType, position?: SpatialPosition): void {
    const config = SOUND_CONFIGS[soundType];
    if (config) {
      this.playSound(config, position);
    }
  }

  // ============================================
  // LIMPIEZA
  // ============================================

  stopAll(): void {
    this.activeNodes.forEach((node) => {
      try {
        if (node instanceof OscillatorNode) {
          node.stop();
        }
      } catch {
        // Already stopped
      }
    });
    this.activeNodes.clear();
    this.stopAllAmbient();
  }

  dispose(): void {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.masterGain = null;
    this.categoryGains.clear();
    this.state.initialized = false;
  }

  getState() {
    return {
      ...this.state,
      musicState: this.getMusicState(),
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let constructionSoundInstance: ConstructionSoundEngine | null = null;

export function getConstructionSoundEngine(): ConstructionSoundEngine {
  if (!constructionSoundInstance) {
    constructionSoundInstance = new ConstructionSoundEngine();
  }
  return constructionSoundInstance;
}

// ============================================
// REACT HOOK
// ============================================

export function useConstructionSound() {
  const engine = getConstructionSoundEngine();

  return {
    // Initialization
    initialize: () => engine.initialize(),
    isInitialized: () => engine.isInitialized(),

    // Volume control
    setMasterVolume: (v: number) => engine.setMasterVolume(v),
    setCategoryVolume: (c: ConstructionSoundCategory, v: number) => engine.setCategoryVolume(c, v),
    setMuted: (m: boolean) => engine.setMuted(m),
    isMuted: () => engine.isMuted(),
    getState: () => engine.getState(),

    // Material sounds
    playMaterialTap: (m: MaterialTexture, p?: SpatialPosition) => engine.playMaterialTap(m, p),
    playMaterialPlace: (m: MaterialTexture, p?: SpatialPosition) => engine.playMaterialPlace(m, p),
    playMaterialASMR: (m: MaterialTexture, p?: SpatialPosition) => engine.playMaterialASMR(m, p),

    // Action sounds
    playBuildStart: () => engine.playBuildStart(),
    playBuildProgress: () => engine.playBuildProgress(),
    playBuildComplete: () => engine.playBuildComplete(),
    playElementPlace: (p?: SpatialPosition) => engine.playElementPlace(p),
    playElementRemove: (p?: SpatialPosition) => engine.playElementRemove(p),
    playElementRotate: (p?: SpatialPosition) => engine.playElementRotate(p),
    playUnlockElement: () => engine.playUnlockElement(),
    playUnlockMaterial: () => engine.playUnlockMaterial(),
    playUnlockMilestone: () => engine.playUnlockMilestone(),
    playUpgradeStart: () => engine.playUpgradeStart(),
    playUpgradeComplete: () => engine.playUpgradeComplete(),
    playCraftStart: () => engine.playCraftStart(),
    playCraftComplete: () => engine.playCraftComplete(),
    playCollectMaterial: () => engine.playCollectMaterial(),
    playCollectReward: () => engine.playCollectReward(),

    // UI sounds
    playUIClick: () => engine.playUIClick(),
    playUIHover: () => engine.playUIHover(),
    playUISelect: () => engine.playUISelect(),
    playUIBack: () => engine.playUIBack(),
    playUIOpen: () => engine.playUIOpen(),
    playUIClose: () => engine.playUIClose(),
    playUIToggle: () => engine.playUIToggle(),
    playUIError: () => engine.playUIError(),
    playUISuccess: () => engine.playUISuccess(),
    playUINotification: () => engine.playUINotification(),

    // Celebration sounds
    playMilestoneComplete: () => engine.playMilestoneComplete(),
    playStreakIncrease: () => engine.playStreakIncrease(),
    playStreakBreak: () => engine.playStreakBreak(),
    playLevelUp: () => engine.playLevelUp(),
    playPrestigeUp: () => engine.playPrestigeUp(),
    playThemeComplete: () => engine.playThemeComplete(),
    playEventStart: () => engine.playEventStart(),
    playAchievementUnlock: () => engine.playAchievementUnlock(),

    // Ambient sounds
    startAmbient: (t: 'workshop' | 'nature' | 'wind' | 'water' | 'fire' | 'rain' | 'night') =>
      engine.startAmbient(t),
    stopAmbient: (t: string) => engine.stopAmbient(t),
    stopAllAmbient: () => engine.stopAllAmbient(),

    // Music
    setMusicMood: (m: AdaptiveMusicState['mood']) => engine.setMusicMood(m),
    setMusicIntensity: (i: number) => engine.setMusicIntensity(i),
    getMusicState: () => engine.getMusicState(),

    // Generic
    play: (s: ConstructionSoundType, p?: SpatialPosition) => engine.play(s, p),

    // Control
    stopAll: () => engine.stopAll(),
    dispose: () => engine.dispose(),
  };
}

// ============================================
// EXPORTS
// ============================================

export { ConstructionSoundEngine, SOUND_CONFIGS, MATERIAL_SOUND_MAP };
export default getConstructionSoundEngine;
