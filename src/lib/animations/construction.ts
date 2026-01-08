/**
 * Sistema de Animaciones de Construcción
 * Animaciones realistas para el sistema de construcción 3D
 *
 * TAREA 2.8.9.5: Animaciones de construcción realistas
 */

import { type Variants, type Transition } from 'framer-motion';
import * as THREE from 'three';
import { type BuildingElementType } from '@/schemas/construction';

// ============================================
// TIPOS
// ============================================

export interface ConstructionAnimation {
  id: string;
  name: string;
  duration: number;
  stages: AnimationStage[];
  particles: ParticleConfig[];
  sounds: string[];
}

export interface AnimationStage {
  id: string;
  name: string;
  startPercent: number;
  endPercent: number;
  transform: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
  };
  opacity: number;
  easing: string;
}

export interface ParticleConfig {
  type: 'dust' | 'sparks' | 'debris' | 'magic' | 'smoke';
  count: number;
  startTime: number;
  duration: number;
  color: string;
  size: number;
  spread: number;
  gravity: number;
  velocity: { x: number; y: number; z: number };
}

export interface CelebrationConfig {
  type: 'confetti' | 'fireworks' | 'sparkle' | 'glow';
  duration: number;
  intensity: number;
  colors: string[];
}

// ============================================
// CONSTANTES DE EASING
// ============================================

export const EASING = {
  // Construcción (movimiento pesado)
  buildIn: [0.34, 1.56, 0.64, 1] as const,
  buildOut: [0.36, 0, 0.66, -0.56] as const,

  // Materiales (caída con rebote)
  materialDrop: [0.68, -0.55, 0.265, 1.55] as const,
  materialPlace: [0.175, 0.885, 0.32, 1.275] as const,

  // Suave
  smooth: [0.43, 0.13, 0.23, 0.96] as const,
  smoothOut: [0.22, 1, 0.36, 1] as const,

  // Impacto
  impact: [0.87, 0, 0.13, 1] as const,
  bounce: [0.68, -0.6, 0.32, 1.6] as const,
};

// ============================================
// TRANSICIONES FRAMER MOTION
// ============================================

export const CONSTRUCTION_TRANSITIONS: Record<string, Transition> = {
  // Aparición de elemento
  elementAppear: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
    mass: 1.5,
  },

  // Colocación de material
  materialPlace: {
    type: 'spring',
    stiffness: 300,
    damping: 15,
    mass: 0.8,
  },

  // Construcción paso a paso
  buildStep: {
    type: 'tween',
    duration: 0.8,
    ease: EASING.buildIn,
  },

  // Celebración
  celebration: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
    mass: 0.5,
  },

  // Hover
  hover: {
    type: 'spring',
    stiffness: 500,
    damping: 25,
  },
};

// ============================================
// VARIANTES FRAMER MOTION
// ============================================

export const ELEMENT_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    y: -50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: CONSTRUCTION_TRANSITIONS.elementAppear,
  },
  building: {
    opacity: 0.7,
    scale: 0.95,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 0.5,
    },
  },
  complete: {
    opacity: 1,
    scale: 1,
    transition: CONSTRUCTION_TRANSITIONS.celebration,
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: CONSTRUCTION_TRANSITIONS.hover,
  },
};

export const MATERIAL_VARIANTS: Variants = {
  idle: {
    scale: 1,
    rotate: 0,
  },
  selected: {
    scale: 1.1,
    rotate: 5,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
  dragging: {
    scale: 1.15,
    opacity: 0.8,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  placed: {
    scale: 1,
    opacity: 1,
    transition: CONSTRUCTION_TRANSITIONS.materialPlace,
  },
};

export const PROGRESS_VARIANTS: Variants = {
  empty: {
    scaleX: 0,
    originX: 0,
  },
  filling: {
    scaleX: 1,
    originX: 0,
    transition: {
      type: 'tween',
      duration: 1.5,
      ease: EASING.smooth,
    },
  },
  complete: {
    scaleX: 1,
    backgroundColor: '#10B981',
    transition: {
      backgroundColor: { duration: 0.3 },
    },
  },
};

// ============================================
// ANIMACIONES POR TIPO DE ELEMENTO
// ============================================

export const ELEMENT_ANIMATIONS: Record<BuildingElementType, ConstructionAnimation> = {
  foundation: {
    id: 'foundation_build',
    name: 'Construcción de Cimiento',
    duration: 2000,
    stages: [
      {
        id: 'appear',
        name: 'Aparición',
        startPercent: 0,
        endPercent: 20,
        transform: { scale: { x: 0, y: 0, z: 0 }, position: { x: 0, y: -2, z: 0 } },
        opacity: 0,
        easing: 'easeOut',
      },
      {
        id: 'rise',
        name: 'Elevación',
        startPercent: 20,
        endPercent: 70,
        transform: { scale: { x: 1, y: 0.3, z: 1 }, position: { x: 0, y: 0, z: 0 } },
        opacity: 0.8,
        easing: 'easeInOut',
      },
      {
        id: 'settle',
        name: 'Asentamiento',
        startPercent: 70,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 }, position: { x: 0, y: 0, z: 0 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'dust', count: 30, startTime: 0, duration: 1000, color: '#A0855A', size: 0.05, spread: 2, gravity: 0.5, velocity: { x: 0, y: 1, z: 0 } },
      { type: 'debris', count: 10, startTime: 500, duration: 800, color: '#8B7355', size: 0.1, spread: 1, gravity: 2, velocity: { x: 0, y: 0.5, z: 0 } },
    ],
    sounds: ['foundation_place', 'stone_settle'],
  },

  wall: {
    id: 'wall_build',
    name: 'Construcción de Muro',
    duration: 1500,
    stages: [
      {
        id: 'slide_in',
        name: 'Deslizamiento',
        startPercent: 0,
        endPercent: 50,
        transform: { position: { x: 2, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: -15 } },
        opacity: 0.5,
        easing: 'easeOut',
      },
      {
        id: 'upright',
        name: 'Enderezamiento',
        startPercent: 50,
        endPercent: 80,
        transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
        opacity: 0.9,
        easing: 'easeInOut',
      },
      {
        id: 'lock',
        name: 'Fijación',
        startPercent: 80,
        endPercent: 100,
        transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'dust', count: 15, startTime: 0, duration: 600, color: '#D4C4B0', size: 0.03, spread: 1.5, gravity: 0.3, velocity: { x: -1, y: 0.5, z: 0 } },
    ],
    sounds: ['wall_slide', 'wall_lock'],
  },

  pillar: {
    id: 'pillar_build',
    name: 'Construcción de Pilar',
    duration: 1800,
    stages: [
      {
        id: 'emerge',
        name: 'Emergencia',
        startPercent: 0,
        endPercent: 60,
        transform: { scale: { x: 1, y: 0.1, z: 1 }, position: { x: 0, y: -1, z: 0 } },
        opacity: 0.7,
        easing: 'easeOut',
      },
      {
        id: 'extend',
        name: 'Extensión',
        startPercent: 60,
        endPercent: 90,
        transform: { scale: { x: 1, y: 1, z: 1 }, position: { x: 0, y: 0, z: 0 } },
        opacity: 0.95,
        easing: 'easeInOut',
      },
      {
        id: 'finish',
        name: 'Finalización',
        startPercent: 90,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 }, position: { x: 0, y: 0, z: 0 } },
        opacity: 1,
        easing: 'linear',
      },
    ],
    particles: [
      { type: 'dust', count: 20, startTime: 0, duration: 1200, color: '#F5F5F5', size: 0.04, spread: 0.8, gravity: 0.4, velocity: { x: 0, y: 0.8, z: 0 } },
    ],
    sounds: ['pillar_rise', 'stone_grind'],
  },

  roof: {
    id: 'roof_build',
    name: 'Construcción de Techo',
    duration: 2200,
    stages: [
      {
        id: 'descend',
        name: 'Descenso',
        startPercent: 0,
        endPercent: 70,
        transform: { position: { x: 0, y: 3, z: 0 }, rotation: { x: 10, y: 0, z: 0 } },
        opacity: 0.6,
        easing: 'easeIn',
      },
      {
        id: 'align',
        name: 'Alineación',
        startPercent: 70,
        endPercent: 90,
        transform: { position: { x: 0, y: 0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
        opacity: 0.9,
        easing: 'easeOut',
      },
      {
        id: 'place',
        name: 'Colocación',
        startPercent: 90,
        endPercent: 100,
        transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'dust', count: 25, startTime: 1500, duration: 500, color: '#8B7355', size: 0.05, spread: 2, gravity: 0.8, velocity: { x: 0, y: -0.5, z: 0 } },
    ],
    sounds: ['roof_descend', 'wood_creak', 'roof_settle'],
  },

  tower: {
    id: 'tower_build',
    name: 'Construcción de Torre',
    duration: 3000,
    stages: [
      {
        id: 'base',
        name: 'Base',
        startPercent: 0,
        endPercent: 30,
        transform: { scale: { x: 1, y: 0.2, z: 1 } },
        opacity: 0.6,
        easing: 'easeOut',
      },
      {
        id: 'grow',
        name: 'Crecimiento',
        startPercent: 30,
        endPercent: 80,
        transform: { scale: { x: 1, y: 0.8, z: 1 } },
        opacity: 0.85,
        easing: 'easeInOut',
      },
      {
        id: 'crown',
        name: 'Corona',
        startPercent: 80,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'dust', count: 40, startTime: 0, duration: 2500, color: '#808080', size: 0.04, spread: 1.5, gravity: 0.3, velocity: { x: 0, y: 1.5, z: 0 } },
      { type: 'sparks', count: 10, startTime: 2500, duration: 500, color: '#FFD700', size: 0.02, spread: 2, gravity: -0.5, velocity: { x: 0, y: 2, z: 0 } },
    ],
    sounds: ['tower_build_loop', 'tower_complete'],
  },

  garden: {
    id: 'garden_build',
    name: 'Creación de Jardín',
    duration: 2500,
    stages: [
      {
        id: 'soil',
        name: 'Tierra',
        startPercent: 0,
        endPercent: 30,
        transform: { scale: { x: 1, y: 0.5, z: 1 } },
        opacity: 0.7,
        easing: 'easeOut',
      },
      {
        id: 'plants',
        name: 'Plantas',
        startPercent: 30,
        endPercent: 70,
        transform: { scale: { x: 1, y: 0.8, z: 1 } },
        opacity: 0.85,
        easing: 'easeInOut',
      },
      {
        id: 'bloom',
        name: 'Floración',
        startPercent: 70,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'magic', count: 20, startTime: 1500, duration: 1000, color: '#90EE90', size: 0.03, spread: 1.5, gravity: -0.2, velocity: { x: 0, y: 0.5, z: 0 } },
    ],
    sounds: ['soil_place', 'plants_grow', 'flowers_bloom'],
  },

  bridge: {
    id: 'bridge_build',
    name: 'Construcción de Puente',
    duration: 2800,
    stages: [
      {
        id: 'supports',
        name: 'Soportes',
        startPercent: 0,
        endPercent: 40,
        transform: { scale: { x: 0.3, y: 1, z: 1 } },
        opacity: 0.6,
        easing: 'easeOut',
      },
      {
        id: 'span',
        name: 'Extensión',
        startPercent: 40,
        endPercent: 80,
        transform: { scale: { x: 0.8, y: 1, z: 1 } },
        opacity: 0.85,
        easing: 'easeInOut',
      },
      {
        id: 'complete',
        name: 'Completar',
        startPercent: 80,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'dust', count: 15, startTime: 0, duration: 2000, color: '#8B7355', size: 0.04, spread: 3, gravity: 0.5, velocity: { x: 1, y: 0, z: 0 } },
    ],
    sounds: ['bridge_extend', 'wood_creak'],
  },

  fountain: {
    id: 'fountain_build',
    name: 'Construcción de Fuente',
    duration: 2000,
    stages: [
      {
        id: 'basin',
        name: 'Estanque',
        startPercent: 0,
        endPercent: 50,
        transform: { scale: { x: 1, y: 0.5, z: 1 } },
        opacity: 0.7,
        easing: 'easeOut',
      },
      {
        id: 'structure',
        name: 'Estructura',
        startPercent: 50,
        endPercent: 85,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 0.9,
        easing: 'easeInOut',
      },
      {
        id: 'water',
        name: 'Agua',
        startPercent: 85,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'magic', count: 30, startTime: 1700, duration: 300, color: '#87CEEB', size: 0.02, spread: 1, gravity: -0.3, velocity: { x: 0, y: 1.5, z: 0 } },
    ],
    sounds: ['stone_place', 'water_flow_start'],
  },

  statue: {
    id: 'statue_build',
    name: 'Escultura de Estatua',
    duration: 2500,
    stages: [
      {
        id: 'rough',
        name: 'Forma Base',
        startPercent: 0,
        endPercent: 40,
        transform: { scale: { x: 0.9, y: 0.9, z: 0.9 } },
        opacity: 0.5,
        easing: 'easeOut',
      },
      {
        id: 'detail',
        name: 'Detalles',
        startPercent: 40,
        endPercent: 80,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 0.8,
        easing: 'easeInOut',
      },
      {
        id: 'polish',
        name: 'Pulido',
        startPercent: 80,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'debris', count: 25, startTime: 0, duration: 1500, color: '#F5F5F5', size: 0.02, spread: 1, gravity: 1.5, velocity: { x: 0, y: 0.3, z: 0 } },
      { type: 'sparks', count: 15, startTime: 2000, duration: 500, color: '#FFFFFF', size: 0.015, spread: 0.5, gravity: -0.2, velocity: { x: 0, y: 0.5, z: 0 } },
    ],
    sounds: ['chisel_work', 'stone_polish'],
  },

  gate: {
    id: 'gate_build',
    name: 'Construcción de Portón',
    duration: 2200,
    stages: [
      {
        id: 'frame',
        name: 'Marco',
        startPercent: 0,
        endPercent: 50,
        transform: { scale: { x: 1, y: 0.7, z: 1 } },
        opacity: 0.6,
        easing: 'easeOut',
      },
      {
        id: 'doors',
        name: 'Puertas',
        startPercent: 50,
        endPercent: 85,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 0.9,
        easing: 'easeInOut',
      },
      {
        id: 'decor',
        name: 'Decoración',
        startPercent: 85,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'sparks', count: 20, startTime: 500, duration: 1500, color: '#FFD700', size: 0.02, spread: 1.5, gravity: 0.5, velocity: { x: 0, y: 0.5, z: 0 } },
    ],
    sounds: ['metal_forge', 'gate_install'],
  },

  window: {
    id: 'window_build',
    name: 'Instalación de Ventana',
    duration: 1200,
    stages: [
      {
        id: 'frame',
        name: 'Marco',
        startPercent: 0,
        endPercent: 50,
        transform: { scale: { x: 1, y: 1, z: 0.5 } },
        opacity: 0.7,
        easing: 'easeOut',
      },
      {
        id: 'glass',
        name: 'Cristal',
        startPercent: 50,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'sparks', count: 10, startTime: 600, duration: 400, color: '#87CEEB', size: 0.02, spread: 0.5, gravity: -0.3, velocity: { x: 0, y: 0.3, z: 0 } },
    ],
    sounds: ['wood_frame', 'glass_place'],
  },

  door: {
    id: 'door_build',
    name: 'Instalación de Puerta',
    duration: 1500,
    stages: [
      {
        id: 'frame',
        name: 'Marco',
        startPercent: 0,
        endPercent: 40,
        transform: { scale: { x: 1, y: 0.8, z: 1 } },
        opacity: 0.6,
        easing: 'easeOut',
      },
      {
        id: 'panel',
        name: 'Panel',
        startPercent: 40,
        endPercent: 80,
        transform: { scale: { x: 1, y: 1, z: 1 }, rotation: { x: 0, y: 30, z: 0 } },
        opacity: 0.9,
        easing: 'easeInOut',
      },
      {
        id: 'close',
        name: 'Cerrar',
        startPercent: 80,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 }, rotation: { x: 0, y: 0, z: 0 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'dust', count: 10, startTime: 0, duration: 800, color: '#8B7355', size: 0.03, spread: 0.8, gravity: 0.5, velocity: { x: 0, y: 0.3, z: 0 } },
    ],
    sounds: ['door_frame', 'door_hang', 'door_close'],
  },

  stair: {
    id: 'stair_build',
    name: 'Construcción de Escalera',
    duration: 2000,
    stages: [
      {
        id: 'base',
        name: 'Base',
        startPercent: 0,
        endPercent: 30,
        transform: { scale: { x: 1, y: 0.3, z: 1 } },
        opacity: 0.6,
        easing: 'easeOut',
      },
      {
        id: 'steps',
        name: 'Escalones',
        startPercent: 30,
        endPercent: 80,
        transform: { scale: { x: 1, y: 0.8, z: 1 } },
        opacity: 0.85,
        easing: 'linear',
      },
      {
        id: 'finish',
        name: 'Acabado',
        startPercent: 80,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'dust', count: 20, startTime: 300, duration: 1500, color: '#D4C4B0', size: 0.03, spread: 1, gravity: 0.4, velocity: { x: 0, y: 0.5, z: 0 } },
    ],
    sounds: ['stone_step', 'stone_step', 'stone_step'],
  },

  balcony: {
    id: 'balcony_build',
    name: 'Construcción de Balcón',
    duration: 1800,
    stages: [
      {
        id: 'supports',
        name: 'Soportes',
        startPercent: 0,
        endPercent: 40,
        transform: { scale: { x: 0.5, y: 1, z: 1 } },
        opacity: 0.6,
        easing: 'easeOut',
      },
      {
        id: 'platform',
        name: 'Plataforma',
        startPercent: 40,
        endPercent: 75,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 0.85,
        easing: 'easeInOut',
      },
      {
        id: 'railing',
        name: 'Barandilla',
        startPercent: 75,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    particles: [
      { type: 'dust', count: 15, startTime: 0, duration: 1200, color: '#71797E', size: 0.03, spread: 1.2, gravity: 0.5, velocity: { x: 0, y: 0.4, z: 0 } },
    ],
    sounds: ['metal_clang', 'stone_place'],
  },

  dome: {
    id: 'dome_build',
    name: 'Construcción de Cúpula',
    duration: 3500,
    stages: [
      {
        id: 'base_ring',
        name: 'Anillo Base',
        startPercent: 0,
        endPercent: 25,
        transform: { scale: { x: 1, y: 0.1, z: 1 } },
        opacity: 0.5,
        easing: 'easeOut',
      },
      {
        id: 'curve',
        name: 'Curva',
        startPercent: 25,
        endPercent: 70,
        transform: { scale: { x: 1, y: 0.7, z: 1 } },
        opacity: 0.8,
        easing: 'easeInOut',
      },
      {
        id: 'apex',
        name: 'Ápice',
        startPercent: 70,
        endPercent: 90,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 0.95,
        easing: 'easeOut',
      },
      {
        id: 'finish',
        name: 'Acabado',
        startPercent: 90,
        endPercent: 100,
        transform: { scale: { x: 1, y: 1, z: 1 } },
        opacity: 1,
        easing: 'linear',
      },
    ],
    particles: [
      { type: 'magic', count: 50, startTime: 3000, duration: 500, color: '#FFD700', size: 0.03, spread: 3, gravity: -0.5, velocity: { x: 0, y: 1, z: 0 } },
      { type: 'sparks', count: 30, startTime: 3200, duration: 300, color: '#FFFFFF', size: 0.02, spread: 2, gravity: -0.3, velocity: { x: 0, y: 1.5, z: 0 } },
    ],
    sounds: ['dome_build_loop', 'dome_complete', 'celebration'],
  },
};

// ============================================
// CONFIGURACIONES DE CELEBRACIÓN
// ============================================

export const CELEBRATION_CONFIGS: Record<string, CelebrationConfig> = {
  element_complete: {
    type: 'sparkle',
    duration: 1000,
    intensity: 0.7,
    colors: ['#FFD700', '#FFA500', '#FFFFFF'],
  },
  project_complete: {
    type: 'fireworks',
    duration: 3000,
    intensity: 1.0,
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#FFFFFF'],
  },
  milestone_reached: {
    type: 'confetti',
    duration: 2500,
    intensity: 0.85,
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
  },
  legendary_item: {
    type: 'glow',
    duration: 2000,
    intensity: 1.0,
    colors: ['#FFD700', '#FFA500', '#FF8C00'],
  },
};

// ============================================
// SISTEMA DE PARTÍCULAS THREE.JS
// ============================================

export interface ParticleSystem {
  points: THREE.Points;
  velocities: THREE.Vector3[];
  lifetimes: number[];
  config: ParticleConfig;
  startTime: number;
}

/**
 * Crea un sistema de partículas para animaciones de construcción
 */
export function createParticleSystem(config: ParticleConfig, position: THREE.Vector3): ParticleSystem {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(config.count * 3);
  const velocities: THREE.Vector3[] = [];
  const lifetimes: number[] = [];

  for (let i = 0; i < config.count; i++) {
    // Posición inicial con spread
    positions[i * 3] = position.x + (Math.random() - 0.5) * config.spread;
    positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * config.spread;
    positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * config.spread;

    // Velocidad inicial
    velocities.push(
      new THREE.Vector3(
        config.velocity.x + (Math.random() - 0.5) * 0.5,
        config.velocity.y + (Math.random() - 0.5) * 0.5,
        config.velocity.z + (Math.random() - 0.5) * 0.5
      )
    );

    // Tiempo de vida aleatorio
    lifetimes.push(config.duration * (0.5 + Math.random() * 0.5));
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: new THREE.Color(config.color),
    size: config.size,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);

  return {
    points,
    velocities,
    lifetimes,
    config,
    startTime: Date.now(),
  };
}

/**
 * Actualiza un sistema de partículas
 */
export function updateParticleSystem(system: ParticleSystem, deltaTime: number): boolean {
  const elapsed = Date.now() - system.startTime;
  if (elapsed > system.config.duration) {
    return false; // Sistema completado
  }

  const positions = system.points.geometry.attributes.position.array as Float32Array;

  for (let i = 0; i < system.config.count; i++) {
    // Aplicar velocidad
    positions[i * 3] += system.velocities[i].x * deltaTime;
    positions[i * 3 + 1] += system.velocities[i].y * deltaTime;
    positions[i * 3 + 2] += system.velocities[i].z * deltaTime;

    // Aplicar gravedad
    system.velocities[i].y -= system.config.gravity * deltaTime;
  }

  system.points.geometry.attributes.position.needsUpdate = true;

  // Actualizar opacidad basada en tiempo de vida
  const progress = elapsed / system.config.duration;
  (system.points.material as THREE.PointsMaterial).opacity = 0.8 * (1 - progress);

  return true; // Sistema activo
}

/**
 * Obtiene la animación para un tipo de elemento
 */
export function getAnimationForElement(type: BuildingElementType): ConstructionAnimation {
  return ELEMENT_ANIMATIONS[type];
}

/**
 * Calcula el estado de animación basado en el progreso
 */
export function getAnimationState(
  animation: ConstructionAnimation,
  progress: number // 0-100
): { transform: AnimationStage['transform']; opacity: number } {
  const normalizedProgress = progress / 100;

  // Encontrar el stage actual
  for (let i = animation.stages.length - 1; i >= 0; i--) {
    const stage = animation.stages[i];
    if (normalizedProgress >= stage.startPercent / 100) {
      return {
        transform: stage.transform,
        opacity: stage.opacity,
      };
    }
  }

  return {
    transform: animation.stages[0].transform,
    opacity: animation.stages[0].opacity,
  };
}

// ============================================
// EXPORTACIONES
// ============================================

const constructionAnimationsAPI = {
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
};

export default constructionAnimationsAPI;
