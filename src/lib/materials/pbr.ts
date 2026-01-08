/**
 * Sistema de Materiales PBR (Physically Based Rendering)
 * Proporciona materiales realistas para el sistema de construcción 3D
 *
 * TAREA 2.8.9.4: Sistema de materiales y texturas PBR
 */

import * as THREE from 'three';
import { type MaterialTexture, type MaterialRarity } from '@/schemas/construction';

// ============================================
// TIPOS
// ============================================

export interface PBRMaterialProperties {
  // Propiedades básicas
  color: string;
  roughness: number;
  metalness: number;

  // Mapas de textura
  normalScale: number;
  displacementScale: number;
  aoIntensity: number;

  // Emisión
  emissive: string;
  emissiveIntensity: number;

  // Transparencia
  transparent: boolean;
  opacity: number;

  // Reflexión
  envMapIntensity: number;
  reflectivity: number;

  // Efectos especiales
  clearcoat: number;
  clearcoatRoughness: number;
  sheen: number;
  sheenRoughness: number;
  sheenColor: string;

  // Subsurface scattering (para materiales translúcidos)
  transmission: number;
  thickness: number;
  ior: number;
}

export interface PBRMaterialConfig {
  id: string;
  name: string;
  texture: MaterialTexture;
  rarity: MaterialRarity;
  properties: PBRMaterialProperties;
  variants: PBRMaterialVariant[];
  weatheringLevels: WeatheringLevel[];
}

export interface PBRMaterialVariant {
  id: string;
  name: string;
  colorModifier: string;
  roughnessModifier: number;
  metalnessModifier: number;
}

export interface WeatheringLevel {
  level: number;
  name: string;
  roughnessIncrease: number;
  colorDesaturation: number;
  dirtOverlay: number;
}

export interface LODConfig {
  level: number;
  distance: number;
  textureSize: '256' | '512' | '1k' | '2k' | '4k';
  normalMapEnabled: boolean;
  displacementEnabled: boolean;
  aoEnabled: boolean;
}

// ============================================
// CONFIGURACIÓN DE LOD
// ============================================

export const LOD_CONFIGS: LODConfig[] = [
  { level: 0, distance: 0, textureSize: '4k', normalMapEnabled: true, displacementEnabled: true, aoEnabled: true },
  { level: 1, distance: 10, textureSize: '2k', normalMapEnabled: true, displacementEnabled: true, aoEnabled: true },
  { level: 2, distance: 25, textureSize: '1k', normalMapEnabled: true, displacementEnabled: false, aoEnabled: true },
  { level: 3, distance: 50, textureSize: '512', normalMapEnabled: false, displacementEnabled: false, aoEnabled: false },
];

// ============================================
// MATERIALES PBR PREDEFINIDOS
// ============================================

export const PBR_MATERIALS: Record<string, PBRMaterialConfig> = {
  // ============================================
  // MADERA
  // ============================================
  oak_wood: {
    id: 'oak_wood',
    name: 'Roble',
    texture: 'wood',
    rarity: 'common',
    properties: {
      color: '#8B7355',
      roughness: 0.75,
      metalness: 0,
      normalScale: 1.0,
      displacementScale: 0.02,
      aoIntensity: 1.0,
      emissive: '#000000',
      emissiveIntensity: 0,
      transparent: false,
      opacity: 1,
      envMapIntensity: 0.3,
      reflectivity: 0.1,
      clearcoat: 0,
      clearcoatRoughness: 0,
      sheen: 0.1,
      sheenRoughness: 0.8,
      sheenColor: '#8B7355',
      transmission: 0,
      thickness: 0,
      ior: 1.5,
    },
    variants: [
      { id: 'oak_light', name: 'Roble Claro', colorModifier: '#A89070', roughnessModifier: 0, metalnessModifier: 0 },
      { id: 'oak_dark', name: 'Roble Oscuro', colorModifier: '#5C4A3A', roughnessModifier: 0.05, metalnessModifier: 0 },
    ],
    weatheringLevels: [
      { level: 0, name: 'Nuevo', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
      { level: 1, name: 'Envejecido', roughnessIncrease: 0.1, colorDesaturation: 0.1, dirtOverlay: 0.05 },
      { level: 2, name: 'Antiguo', roughnessIncrease: 0.2, colorDesaturation: 0.2, dirtOverlay: 0.15 },
    ],
  },

  mahogany_wood: {
    id: 'mahogany_wood',
    name: 'Caoba',
    texture: 'wood',
    rarity: 'uncommon',
    properties: {
      color: '#6B3A2A',
      roughness: 0.6,
      metalness: 0,
      normalScale: 0.8,
      displacementScale: 0.015,
      aoIntensity: 1.0,
      emissive: '#000000',
      emissiveIntensity: 0,
      transparent: false,
      opacity: 1,
      envMapIntensity: 0.4,
      reflectivity: 0.15,
      clearcoat: 0.1,
      clearcoatRoughness: 0.3,
      sheen: 0.2,
      sheenRoughness: 0.6,
      sheenColor: '#8B5A4A',
      transmission: 0,
      thickness: 0,
      ior: 1.5,
    },
    variants: [
      { id: 'mahogany_polished', name: 'Caoba Pulida', colorModifier: '#7B4A3A', roughnessModifier: -0.15, metalnessModifier: 0 },
    ],
    weatheringLevels: [
      { level: 0, name: 'Nuevo', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
      { level: 1, name: 'Envejecido', roughnessIncrease: 0.08, colorDesaturation: 0.08, dirtOverlay: 0.03 },
    ],
  },

  ebony_wood: {
    id: 'ebony_wood',
    name: 'Ébano',
    texture: 'wood',
    rarity: 'rare',
    properties: {
      color: '#1C1C1C',
      roughness: 0.45,
      metalness: 0,
      normalScale: 0.6,
      displacementScale: 0.01,
      aoIntensity: 1.2,
      emissive: '#000000',
      emissiveIntensity: 0,
      transparent: false,
      opacity: 1,
      envMapIntensity: 0.5,
      reflectivity: 0.25,
      clearcoat: 0.2,
      clearcoatRoughness: 0.2,
      sheen: 0.3,
      sheenRoughness: 0.4,
      sheenColor: '#2C2C2C',
      transmission: 0,
      thickness: 0,
      ior: 1.5,
    },
    variants: [],
    weatheringLevels: [
      { level: 0, name: 'Nuevo', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
    ],
  },

  // ============================================
  // PIEDRA
  // ============================================
  limestone: {
    id: 'limestone',
    name: 'Caliza',
    texture: 'stone',
    rarity: 'common',
    properties: {
      color: '#D4C4B0',
      roughness: 0.85,
      metalness: 0,
      normalScale: 1.2,
      displacementScale: 0.03,
      aoIntensity: 1.0,
      emissive: '#000000',
      emissiveIntensity: 0,
      transparent: false,
      opacity: 1,
      envMapIntensity: 0.2,
      reflectivity: 0.05,
      clearcoat: 0,
      clearcoatRoughness: 0,
      sheen: 0,
      sheenRoughness: 0,
      sheenColor: '#000000',
      transmission: 0,
      thickness: 0,
      ior: 1.5,
    },
    variants: [
      { id: 'limestone_white', name: 'Caliza Blanca', colorModifier: '#F0E8DC', roughnessModifier: 0, metalnessModifier: 0 },
      { id: 'limestone_yellow', name: 'Caliza Amarilla', colorModifier: '#E8D8B0', roughnessModifier: 0.05, metalnessModifier: 0 },
    ],
    weatheringLevels: [
      { level: 0, name: 'Nuevo', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
      { level: 1, name: 'Erosionado', roughnessIncrease: 0.1, colorDesaturation: 0.15, dirtOverlay: 0.1 },
      { level: 2, name: 'Antiguo', roughnessIncrease: 0.2, colorDesaturation: 0.25, dirtOverlay: 0.25 },
    ],
  },

  marble: {
    id: 'marble',
    name: 'Mármol',
    texture: 'stone',
    rarity: 'uncommon',
    properties: {
      color: '#F5F5F5',
      roughness: 0.35,
      metalness: 0,
      normalScale: 0.5,
      displacementScale: 0.005,
      aoIntensity: 0.8,
      emissive: '#000000',
      emissiveIntensity: 0,
      transparent: false,
      opacity: 1,
      envMapIntensity: 0.6,
      reflectivity: 0.3,
      clearcoat: 0.3,
      clearcoatRoughness: 0.15,
      sheen: 0.1,
      sheenRoughness: 0.3,
      sheenColor: '#FFFFFF',
      transmission: 0.05,
      thickness: 0.5,
      ior: 1.55,
    },
    variants: [
      { id: 'marble_black', name: 'Mármol Negro', colorModifier: '#1A1A1A', roughnessModifier: -0.1, metalnessModifier: 0 },
      { id: 'marble_green', name: 'Mármol Verde', colorModifier: '#2F4F4F', roughnessModifier: 0, metalnessModifier: 0 },
      { id: 'marble_pink', name: 'Mármol Rosa', colorModifier: '#E8D0D0', roughnessModifier: 0.05, metalnessModifier: 0 },
    ],
    weatheringLevels: [
      { level: 0, name: 'Pulido', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
      { level: 1, name: 'Mate', roughnessIncrease: 0.15, colorDesaturation: 0.05, dirtOverlay: 0.02 },
    ],
  },

  obsidian: {
    id: 'obsidian',
    name: 'Obsidiana',
    texture: 'stone',
    rarity: 'rare',
    properties: {
      color: '#0D0D0D',
      roughness: 0.1,
      metalness: 0.1,
      normalScale: 0.3,
      displacementScale: 0.002,
      aoIntensity: 1.0,
      emissive: '#1A0A2E',
      emissiveIntensity: 0.05,
      transparent: false,
      opacity: 1,
      envMapIntensity: 0.9,
      reflectivity: 0.6,
      clearcoat: 0.5,
      clearcoatRoughness: 0.05,
      sheen: 0,
      sheenRoughness: 0,
      sheenColor: '#000000',
      transmission: 0,
      thickness: 0,
      ior: 1.5,
    },
    variants: [
      { id: 'obsidian_rainbow', name: 'Obsidiana Arcoíris', colorModifier: '#1A1A2E', roughnessModifier: 0, metalnessModifier: 0.05 },
    ],
    weatheringLevels: [
      { level: 0, name: 'Pristino', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
    ],
  },

  // ============================================
  // VIDRIO
  // ============================================
  clear_glass: {
    id: 'clear_glass',
    name: 'Vidrio Claro',
    texture: 'glass',
    rarity: 'common',
    properties: {
      color: '#E8F4F8',
      roughness: 0.05,
      metalness: 0,
      normalScale: 0.1,
      displacementScale: 0,
      aoIntensity: 0.5,
      emissive: '#000000',
      emissiveIntensity: 0,
      transparent: true,
      opacity: 0.3,
      envMapIntensity: 1.0,
      reflectivity: 0.5,
      clearcoat: 0,
      clearcoatRoughness: 0,
      sheen: 0,
      sheenRoughness: 0,
      sheenColor: '#000000',
      transmission: 0.95,
      thickness: 0.1,
      ior: 1.52,
    },
    variants: [
      { id: 'glass_tinted', name: 'Vidrio Tintado', colorModifier: '#A8C8D8', roughnessModifier: 0, metalnessModifier: 0 },
      { id: 'glass_frosted', name: 'Vidrio Esmerilado', colorModifier: '#F0F8FF', roughnessModifier: 0.4, metalnessModifier: 0 },
    ],
    weatheringLevels: [
      { level: 0, name: 'Limpio', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
      { level: 1, name: 'Polvoriento', roughnessIncrease: 0.1, colorDesaturation: 0.1, dirtOverlay: 0.1 },
    ],
  },

  stained_glass: {
    id: 'stained_glass',
    name: 'Vitral',
    texture: 'glass',
    rarity: 'uncommon',
    properties: {
      color: '#4169E1',
      roughness: 0.15,
      metalness: 0,
      normalScale: 0.2,
      displacementScale: 0.005,
      aoIntensity: 0.6,
      emissive: '#1E3A8A',
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.6,
      envMapIntensity: 0.8,
      reflectivity: 0.4,
      clearcoat: 0.1,
      clearcoatRoughness: 0.1,
      sheen: 0,
      sheenRoughness: 0,
      sheenColor: '#000000',
      transmission: 0.7,
      thickness: 0.15,
      ior: 1.52,
    },
    variants: [
      { id: 'stained_red', name: 'Vitral Rojo', colorModifier: '#DC143C', roughnessModifier: 0, metalnessModifier: 0 },
      { id: 'stained_green', name: 'Vitral Verde', colorModifier: '#228B22', roughnessModifier: 0, metalnessModifier: 0 },
      { id: 'stained_gold', name: 'Vitral Dorado', colorModifier: '#FFD700', roughnessModifier: 0, metalnessModifier: 0 },
    ],
    weatheringLevels: [
      { level: 0, name: 'Brillante', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
    ],
  },

  crystal_glass: {
    id: 'crystal_glass',
    name: 'Cristal',
    texture: 'glass',
    rarity: 'rare',
    properties: {
      color: '#F0F8FF',
      roughness: 0.02,
      metalness: 0,
      normalScale: 0.05,
      displacementScale: 0,
      aoIntensity: 0.3,
      emissive: '#E0F0FF',
      emissiveIntensity: 0.05,
      transparent: true,
      opacity: 0.2,
      envMapIntensity: 1.2,
      reflectivity: 0.7,
      clearcoat: 0.5,
      clearcoatRoughness: 0.02,
      sheen: 0.2,
      sheenRoughness: 0.1,
      sheenColor: '#FFFFFF',
      transmission: 0.98,
      thickness: 0.05,
      ior: 2.4, // Diamante-like refraction
    },
    variants: [],
    weatheringLevels: [
      { level: 0, name: 'Perfecto', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
    ],
  },

  // ============================================
  // METAL
  // ============================================
  iron: {
    id: 'iron',
    name: 'Hierro',
    texture: 'metal',
    rarity: 'common',
    properties: {
      color: '#71797E',
      roughness: 0.5,
      metalness: 0.9,
      normalScale: 0.8,
      displacementScale: 0.01,
      aoIntensity: 1.0,
      emissive: '#000000',
      emissiveIntensity: 0,
      transparent: false,
      opacity: 1,
      envMapIntensity: 0.7,
      reflectivity: 0.5,
      clearcoat: 0,
      clearcoatRoughness: 0,
      sheen: 0,
      sheenRoughness: 0,
      sheenColor: '#000000',
      transmission: 0,
      thickness: 0,
      ior: 2.95,
    },
    variants: [
      { id: 'iron_polished', name: 'Hierro Pulido', colorModifier: '#91989E', roughnessModifier: -0.25, metalnessModifier: 0 },
      { id: 'iron_wrought', name: 'Hierro Forjado', colorModifier: '#3D3D3D', roughnessModifier: 0.15, metalnessModifier: -0.1 },
    ],
    weatheringLevels: [
      { level: 0, name: 'Nuevo', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
      { level: 1, name: 'Oxidado', roughnessIncrease: 0.2, colorDesaturation: 0.3, dirtOverlay: 0.2 },
      { level: 2, name: 'Corroído', roughnessIncrease: 0.4, colorDesaturation: 0.5, dirtOverlay: 0.4 },
    ],
  },

  bronze: {
    id: 'bronze',
    name: 'Bronce',
    texture: 'metal',
    rarity: 'uncommon',
    properties: {
      color: '#CD7F32',
      roughness: 0.4,
      metalness: 0.85,
      normalScale: 0.6,
      displacementScale: 0.008,
      aoIntensity: 1.0,
      emissive: '#000000',
      emissiveIntensity: 0,
      transparent: false,
      opacity: 1,
      envMapIntensity: 0.75,
      reflectivity: 0.55,
      clearcoat: 0.1,
      clearcoatRoughness: 0.2,
      sheen: 0,
      sheenRoughness: 0,
      sheenColor: '#000000',
      transmission: 0,
      thickness: 0,
      ior: 1.18,
    },
    variants: [
      { id: 'bronze_antique', name: 'Bronce Antiguo', colorModifier: '#8B4513', roughnessModifier: 0.1, metalnessModifier: -0.1 },
      { id: 'bronze_patina', name: 'Bronce Patinado', colorModifier: '#4A7C59', roughnessModifier: 0.2, metalnessModifier: -0.15 },
    ],
    weatheringLevels: [
      { level: 0, name: 'Brillante', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
      { level: 1, name: 'Patinado', roughnessIncrease: 0.15, colorDesaturation: 0.2, dirtOverlay: 0.1 },
    ],
  },

  gold: {
    id: 'gold',
    name: 'Oro',
    texture: 'metal',
    rarity: 'epic',
    properties: {
      color: '#FFD700',
      roughness: 0.2,
      metalness: 1.0,
      normalScale: 0.3,
      displacementScale: 0.003,
      aoIntensity: 0.8,
      emissive: '#FFD700',
      emissiveIntensity: 0.02,
      transparent: false,
      opacity: 1,
      envMapIntensity: 1.0,
      reflectivity: 0.8,
      clearcoat: 0.2,
      clearcoatRoughness: 0.05,
      sheen: 0.1,
      sheenRoughness: 0.2,
      sheenColor: '#FFEC8B',
      transmission: 0,
      thickness: 0,
      ior: 0.47,
    },
    variants: [
      { id: 'gold_rose', name: 'Oro Rosa', colorModifier: '#E8A87C', roughnessModifier: 0, metalnessModifier: 0 },
      { id: 'gold_white', name: 'Oro Blanco', colorModifier: '#E8E8E8', roughnessModifier: -0.05, metalnessModifier: 0 },
    ],
    weatheringLevels: [
      { level: 0, name: 'Pulido', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
    ],
  },

  // ============================================
  // CRISTALES MÁGICOS
  // ============================================
  amethyst: {
    id: 'amethyst',
    name: 'Amatista',
    texture: 'crystal',
    rarity: 'rare',
    properties: {
      color: '#9966CC',
      roughness: 0.1,
      metalness: 0.05,
      normalScale: 0.4,
      displacementScale: 0.01,
      aoIntensity: 0.7,
      emissive: '#6B238E',
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.8,
      envMapIntensity: 1.0,
      reflectivity: 0.5,
      clearcoat: 0.3,
      clearcoatRoughness: 0.05,
      sheen: 0.3,
      sheenRoughness: 0.2,
      sheenColor: '#DDA0DD',
      transmission: 0.6,
      thickness: 0.3,
      ior: 1.54,
    },
    variants: [],
    weatheringLevels: [
      { level: 0, name: 'Puro', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
    ],
  },

  sapphire: {
    id: 'sapphire',
    name: 'Zafiro',
    texture: 'crystal',
    rarity: 'epic',
    properties: {
      color: '#0F52BA',
      roughness: 0.05,
      metalness: 0.05,
      normalScale: 0.2,
      displacementScale: 0.005,
      aoIntensity: 0.6,
      emissive: '#1E3A8A',
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.85,
      envMapIntensity: 1.2,
      reflectivity: 0.6,
      clearcoat: 0.4,
      clearcoatRoughness: 0.02,
      sheen: 0.4,
      sheenRoughness: 0.15,
      sheenColor: '#4169E1',
      transmission: 0.7,
      thickness: 0.25,
      ior: 1.77,
    },
    variants: [
      { id: 'sapphire_star', name: 'Zafiro Estrella', colorModifier: '#1560BD', roughnessModifier: 0.1, metalnessModifier: 0.1 },
    ],
    weatheringLevels: [
      { level: 0, name: 'Perfecto', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
    ],
  },

  diamond: {
    id: 'diamond',
    name: 'Diamante',
    texture: 'crystal',
    rarity: 'legendary',
    properties: {
      color: '#F0F8FF',
      roughness: 0.01,
      metalness: 0,
      normalScale: 0.1,
      displacementScale: 0,
      aoIntensity: 0.4,
      emissive: '#F0FFFF',
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.15,
      envMapIntensity: 1.5,
      reflectivity: 0.9,
      clearcoat: 0.8,
      clearcoatRoughness: 0.01,
      sheen: 0.5,
      sheenRoughness: 0.05,
      sheenColor: '#FFFFFF',
      transmission: 0.99,
      thickness: 0.1,
      ior: 2.42, // Real diamond IOR
    },
    variants: [
      { id: 'diamond_pink', name: 'Diamante Rosa', colorModifier: '#FFB6C1', roughnessModifier: 0, metalnessModifier: 0 },
      { id: 'diamond_blue', name: 'Diamante Azul', colorModifier: '#ADD8E6', roughnessModifier: 0, metalnessModifier: 0 },
      { id: 'diamond_yellow', name: 'Diamante Amarillo', colorModifier: '#FFFACD', roughnessModifier: 0, metalnessModifier: 0 },
    ],
    weatheringLevels: [
      { level: 0, name: 'Perfecto', roughnessIncrease: 0, colorDesaturation: 0, dirtOverlay: 0 },
    ],
  },
};

// ============================================
// FUNCIONES DE CREACIÓN DE MATERIALES
// ============================================

/**
 * Crea un material Three.js MeshPhysicalMaterial a partir de configuración PBR
 */
export function createPBRMaterial(
  config: PBRMaterialConfig,
  variantId?: string,
  weatheringLevel: number = 0
): THREE.MeshPhysicalMaterial {
  const props = config.properties;
  const variant = variantId
    ? config.variants.find((v) => v.id === variantId)
    : undefined;
  const weathering = config.weatheringLevels[weatheringLevel] || config.weatheringLevels[0];

  // Aplicar modificadores de variante
  const color = variant?.colorModifier || props.color;
  const roughness = Math.min(1, Math.max(0, props.roughness + (variant?.roughnessModifier || 0) + (weathering?.roughnessIncrease || 0)));
  const metalness = Math.min(1, Math.max(0, props.metalness + (variant?.metalnessModifier || 0)));

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
    emissive: new THREE.Color(props.emissive),
    emissiveIntensity: props.emissiveIntensity,
    transparent: props.transparent,
    opacity: props.opacity,
    envMapIntensity: props.envMapIntensity,
    clearcoat: props.clearcoat,
    clearcoatRoughness: props.clearcoatRoughness,
    sheen: props.sheen,
    sheenRoughness: props.sheenRoughness,
    sheenColor: new THREE.Color(props.sheenColor),
    transmission: props.transmission,
    thickness: props.thickness,
    ior: props.ior,
  });

  return material;
}

/**
 * Crea un material simplificado para dispositivos de bajo rendimiento
 */
export function createSimpleMaterial(
  config: PBRMaterialConfig,
  variantId?: string
): THREE.MeshStandardMaterial {
  const props = config.properties;
  const variant = variantId
    ? config.variants.find((v) => v.id === variantId)
    : undefined;

  const color = variant?.colorModifier || props.color;
  const roughness = Math.min(1, Math.max(0, props.roughness + (variant?.roughnessModifier || 0)));
  const metalness = Math.min(1, Math.max(0, props.metalness + (variant?.metalnessModifier || 0)));

  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
    emissive: new THREE.Color(props.emissive),
    emissiveIntensity: props.emissiveIntensity,
    transparent: props.transparent,
    opacity: props.opacity,
  });
}

/**
 * Obtiene la configuración PBR para un material por ID
 */
export function getPBRMaterial(materialId: string): PBRMaterialConfig | undefined {
  return PBR_MATERIALS[materialId];
}

/**
 * Obtiene materiales por textura
 */
export function getMaterialsByTexture(texture: MaterialTexture): PBRMaterialConfig[] {
  return Object.values(PBR_MATERIALS).filter((m) => m.texture === texture);
}

/**
 * Obtiene materiales por rareza
 */
export function getMaterialsByRarity(rarity: MaterialRarity): PBRMaterialConfig[] {
  return Object.values(PBR_MATERIALS).filter((m) => m.rarity === rarity);
}

/**
 * Calcula el LOD apropiado basado en la distancia
 */
export function getLODForDistance(distance: number): LODConfig {
  for (let i = LOD_CONFIGS.length - 1; i >= 0; i--) {
    if (distance >= LOD_CONFIGS[i].distance) {
      return LOD_CONFIGS[i];
    }
  }
  return LOD_CONFIGS[0];
}

/**
 * Verifica si el dispositivo soporta materiales avanzados
 */
export function supportsAdvancedMaterials(): boolean {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) return false;

  // Verificar extensiones necesarias para PBR completo
  const extensions = [
    'EXT_color_buffer_float',
    'OES_texture_float_linear',
  ];

  return extensions.every((ext) => gl.getExtension(ext) !== null);
}

// ============================================
// EXPORTACIONES
// ============================================

const pbrMaterialAPI = {
  PBR_MATERIALS,
  LOD_CONFIGS,
  createPBRMaterial,
  createSimpleMaterial,
  getPBRMaterial,
  getMaterialsByTexture,
  getMaterialsByRarity,
  getLODForDistance,
  supportsAdvancedMaterials,
};

export default pbrMaterialAPI;
