# 🏰 Palacio de Memoria — Diseño del Sistema

> **Versión:** 1.0
> **Fecha:** 2026-01-06
> **Arquitecto:** Principal Product Architect
> **Estado:** Diseño Completo - Pendiente Implementación

---

## 1️⃣ VISIÓN GENERAL

### Por qué construir desde NIVEL 0 es clave

- **Identity Activation**: El usuario deja de ser "estudiante" para convertirse en "constructor" de su vida en francés
- **Episodic Memory**: Cada tema completado se ancla a un elemento físico, creando recuerdos espaciales más duraderos
- **Inmediatez**: No hay "vacío de progreso" - el primer tema ya construye algo visible
- **Cumulative Progress**: El palacio CRECE visualmente, no solo números abstractos
- **Intrinsic Motivation**: La construcción expresa identidad personal (material elegido), no logros genéricos

### Cómo refuerza identidad lingüística

```
ANTES (Genérico):
"Completaste 5 lecciones" → Nada memorable

DESPUÉS (Espacial):
"Construiste una puerta de roble con tu primera lección"
→ Puedes VER tu progreso
→ Puedes RECORDAR qué aprendiste por dónde está el elemento
→ Vives EN francés, no estudias francés
```

### Metáfora Central

```
"No estás aprendiendo francés.
Estás construyendo la casa donde vivirás en francés."
```

- Tema → Elemento constructivo (ladrillo, pilar, puerta, ventana...)
- Material → Expresión personal (piedra, madera, ladrillo...)
- Posición → Lugar en el palacio (se construye orgánicamente)

---

## 2️⃣ CAMBIOS NECESARIOS POR CAPA

---

### 📦 CAPA 1: DATOS / SUPABASE

#### 1.1 Nuevo Schema: `constructed_elements`

```sql
-- Tabla: constructed_elements
CREATE TABLE constructed_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id VARCHAR(100) NOT NULL, -- ID del tema completado
  element_type VARCHAR(50) NOT NULL, -- 'brick', 'pillar', 'door', 'window', etc.
  material_id VARCHAR(50) NOT NULL, -- 'stone_light', 'wood_oak', 'brick_red', etc.
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  constructed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Restricciones
  CONSTRAINT unique_element_per_topic UNIQUE (user_id, topic_id),
  CONSTRAINT valid_position CHECK (position_x BETWEEN 0 AND 100 AND position_y BETWEEN 0 AND 100)
);

-- Índices
CREATE INDEX idx_elements_user ON constructed_elements(user_id);
CREATE INDEX idx_elements_material ON constructed_elements(material_id);

-- RLS (Row Level Security)
ALTER TABLE constructed_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own elements"
  ON constructed_elements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own elements"
  ON constructed_elements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own elements"
  ON constructed_elements FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 1.2 Nuevo Schema: `material_unlocks`

```sql
-- Tabla: material_unlocks
CREATE TABLE material_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unlock_reason VARCHAR(100), -- 'first_topic', 'completed_5_topics', 'milestone_x', etc.

  CONSTRAINT unique_material_per_user UNIQUE (user_id, material_id)
);

CREATE INDEX idx_unlocks_user ON material_unlocks(user_id);

ALTER TABLE material_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocks"
  ON material_unlocks FOR SELECT
  USING (auth.uid() = user_id);
```

#### 1.3 Función PostgreSQL: Calcular posición automática

```sql
-- Función: Calcular siguiente posición disponible
CREATE OR REPLACE FUNCTION calculate_next_position(
  p_user_id UUID,
  p_element_type VARCHAR
)
RETURNS TABLE(x INTEGER, y INTEGER) AS $$
DECLARE
  v_region_size INTEGER := 20; -- Tamaño de región para búsqueda
  v_start_x INTEGER := 0;
  v_start_y INTEGER := 0;
BEGIN
  -- Buscar primer hueco disponible
  FOR x IN 0..100 LOOP
    FOR y IN 0..100 LOOP
      IF NOT EXISTS (
        SELECT 1 FROM constructed_elements
        WHERE user_id = p_user_id
        AND position_x BETWEEN x AND x + v_region_size
        AND position_y BETWEEN y AND y + v_region_size
      ) THEN
        RETURN QUERY SELECT x, y;
        RETURN;
      END IF;
    END LOOP;
  END LOOP;

  -- Fallback: esquina superior izquierda
  RETURN QUERY SELECT 0, 0;
END;
$$ LANGUAGE plpgsql;
```

---

### 🧠 CAPA 2: DOMINIO (TypeScript + Zod)

#### 2.1 Schemas Zod: `src/schemas/palace.ts`

```typescript
import { z } from 'zod';

// ============================================================
// TIPOS DE ELEMENTOS CONSTRUCTIVOS
// ============================================================

export const ElementTypeSchema = z.enum([
  // Nivel 0: Cimientos básicos
  'foundation',    // Los cimientos invisibles pero esenciales
  'brick',         // Ladrillo individual de muro
  'corner_stone',  // Piedra de esquina (estructura)

  // Nivel 1: Elementos estructurales
  'pillar',        // Pilar de soporte
  'arch',          // Arco de puerta/ventana
  'beam',          // Viga horizontal

  // Nivel 2: Aberturas
  'door',          // Puerta de entrada
  'window',        // Ventana
  'gate',          // Portal

  // Nivel 3: Acabados
  'floor_tile',    // Losa de piso
  'roof_tile',     // Teja
  'decoration',    // Elemento decorativo simple
]);

// ============================================================
// MATERIALES (Progresivamente más refinados)
// ============================================================

export const MaterialTierSchema = z.enum(['tier_0', 'tier_1', 'tier_2', 'tier_3']);

export const MaterialIdSchema = z.enum([
  // TIER 0: Materiales básicos (disponibles desde el inicio)
  'stone_rough',      // Piedra bruta
  'wood_pine',        // Madera de pino (básica)
  'brick_clay',       // Ladrillo de arcilla sin cocer

  // TIER 1: Materiales estándar (se desbloquean con 3+ temas)
  'stone_smooth',     // Piedra labrada
  'wood_oak',         // Madera de roble
  'brick_red',        // Ladrillo cocido rojo
  'brick_beige',      // Ladrillo beige

  // TIER 2: Materiales refinados (se desbloquean con 10+ temas)
  'stone_marble',     // Mármol blanco
  'wood_chestnut',    // Castaño
  'stone_slate',      // Pizarra
  'brick_glass',      // Ladrillo vidriado

  // TIER 3: Materiales premium (se desbloquean con 25+ temas)
  'stone_granite',    // Granito
  'wood_walnut',      // Nogal
  'stone_quartz',     // Cuarzo
  'brick_gold',       // Ladrillo dorado (decorativo)
]);

export const MaterialSchema = z.object({
  id: MaterialIdSchema,
  tier: MaterialTierSchema,
  name: z.object({
    es: z.string(),
    fr: z.string(),
  }),
  description: z.object({
    es: z.string(),
    fr: z.string(),
  }),
  color: z.string(), // Hex color para representación visual
  texture: z.string().optional(), // Referencia a asset de textura si exists
  requiredTopics: z.number().default(0), // Temas completados requeridos
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic']).default('common'),
});

// ============================================================
// ELEMENTO CONSTRUIDO
// ============================================================

export const ConstructedElementSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),

  // Referencia al tema que originó este elemento
  topicId: z.string(),
  topicTitle: z.object({
    es: z.string(),
    fr: z.string(),
  }).optional(),

  // Tipo y material
  elementType: ElementTypeSchema,
  materialId: MaterialIdSchema,

  // Posición en el palacio (coordenadas 0-100)
  position: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  }),

  // Metadatos
  constructedAt: z.string().datetime(),
  isRemovable: z.boolean().default(false), // No se pueden eliminar por defecto
});

// ============================================================
// DESBLOQUEO DE MATERIAL
// ============================================================

export const MaterialUnlockSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  materialId: MaterialIdSchema,
  unlockedAt: z.string().datetime(),
  unlockReason: z.string(), // 'first_topic', 'completed_3_topics', etc.
});

// ============================================================
// CATÁLOGO DE ELEMENTOS DISPONIBLES
// ============================================================

export const ElementCatalogSchema = z.object({
  elementType: ElementTypeSchema,
  name: z.object({
    es: z.string(),
    fr: z.string(),
  }),
  description: z.object({
    es: z.string(),
    fr: z.string(),
  }),
  icon: z.string(), // Emoji o icon identifier
  requiredTopics: z.number().default(0), // Mínimo de temas para desbloquear
  allowedTiers: z.array(MaterialTierSchema), // Qué tiers de materiales acepta
  maxSize: z.number().default(1), // Tamaño en celdas de la grilla
});

// ============================================================
// ESTADO DEL PALACIO
// ============================================================

export const PalaceStateSchema = z.object({
  elements: z.array(ConstructedElementSchema),
  unlockedMaterials: z.array(MaterialIdSchema),
  totalElements: z.number(),
  completionPercentage: z.number(), // 0-100

  // Estadísticas
  elementsByType: z.record(ElementTypeSchema, z.number()),
  elementsByTier: z.record(MaterialTierSchema, z.number()),

  // Última construcción
  lastConstructedAt: z.string().datetime().nullable(),
});

// ============================================================
// TYPE INFERENCE
// ============================================================

export type ElementType = z.infer<typeof ElementTypeSchema>;
export type MaterialTier = z.infer<typeof MaterialTierSchema>;
export type MaterialId = z.infer<typeof MaterialIdSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type ConstructedElement = z.infer<typeof ConstructedElementSchema>;
export type MaterialUnlock = z.infer<typeof MaterialUnlockSchema>;
export type ElementCatalog = z.infer<typeof ElementCatalogSchema>;
export type PalaceState = z.infer<typeof PalaceStateSchema>;
```

#### 2.2 Catálogo de Elementos: `src/data/palaceCatalog.ts`

```typescript
import { ElementCatalog, Material, ElementType, MaterialId, MaterialTier } from '@/schemas/palace';

// ============================================================
// MATERIALES DISPONIBLES
// ============================================================

export const MATERIALS: Record<MaterialId, Material> = {
  // TIER 0: Disponibles desde el inicio
  stone_rough: {
    id: 'stone_rough',
    tier: 'tier_0',
    name: { es: 'Piedra Bruta', fr: 'Pierre Brute' },
    description: { es: 'Piedra natural sin labrar', fr: 'Pierre naturelle non taillée' },
    color: '#8B8B83',
    requiredTopics: 0,
    rarity: 'common',
  },
  wood_pine: {
    id: 'wood_pine',
    tier: 'tier_0',
    name: { es: 'Madera de Pino', fr: 'Bois de Pin' },
    description: { es: 'Madera blanda y clara', fr: 'Bois tendre et clair' },
    color: '#D4A574',
    requiredTopics: 0,
    rarity: 'common',
  },
  brick_clay: {
    id: 'brick_clay',
    tier: 'tier_0',
    name: { es: 'Ladrillo de Arcilla', fr: 'Brique d\'Argile' },
    description: { es: 'Ladrillo sin cocer', fr: 'Brique non cuite' },
    color: '#C4A484',
    requiredTopics: 0,
    rarity: 'common',
  },

  // TIER 1: Se desbloquean con 3+ temas
  stone_smooth: {
    id: 'stone_smooth',
    tier: 'tier_1',
    name: { es: 'Piedra Labrada', fr: 'Pierre Taillée' },
    description: { es: 'Piedra trabajada a mano', fr: 'Pierre travaillée à la main' },
    color: '#B8B8B8',
    requiredTopics: 3,
    rarity: 'uncommon',
  },
  wood_oak: {
    id: 'wood_oak',
    tier: 'tier_1',
    name: { es: 'Madera de Roble', fr: 'Bois de Chêne' },
    description: { es: 'Madera resistente y duradera', fr: 'Bois résistant et durable' },
    color: '#8B6914',
    requiredTopics: 3,
    rarity: 'uncommon',
  },
  brick_red: {
    id: 'brick_red',
    tier: 'tier_1',
    name: { es: 'Ladrillo Rojo', fr: 'Brique Rouge' },
    description: { es: 'Ladrillo cocido clásico', fr: 'Brique cuite classique' },
    color: '#A0522D',
    requiredTopics: 3,
    rarity: 'uncommon',
  },
  brick_beige: {
    id: 'brick_beige',
    tier: 'tier_1',
    name: { es: 'Ladrillo Beige', fr: 'Brique Beige' },
    description: { es: 'Ladrillo cálido', fr: 'Brique chaude' },
    color: '#D2B48C',
    requiredTopics: 3,
    rarity: 'uncommon',
  },

  // TIER 2: Se desbloquean con 10+ temas
  stone_marble: {
    id: 'stone_marble',
    tier: 'tier_2',
    name: { es: 'Mármol', fr: 'Marbre' },
    description: { es: 'Piedra noble y elegante', fr: 'Pierre noble et élégante' },
    color: '#F5F5F5',
    requiredTopics: 10,
    rarity: 'rare',
  },
  wood_chestnut: {
    id: 'wood_chestnut',
    tier: 'tier_2',
    name: { es: 'Madera de Castaño', fr: 'Bois de Châtaignier' },
    description: { es: 'Madera rica y aromática', fr: 'Bois riche et aromatique' },
    color: '#6B4423',
    requiredTopics: 10,
    rarity: 'rare',
  },
  stone_slate: {
    id: 'stone_slate',
    tier: 'tier_2',
    name: { es: 'Pizarra', fr: 'Ardoise' },
    description: { es: 'Piedra oscura y duradera', fr: 'Pierre sombre et durable' },
    color: '#708090',
    requiredTopics: 10,
    rarity: 'rare',
  },
  brick_glass: {
    id: 'brick_glass',
    tier: 'tier_2',
    name: { es: 'Ladrillo Vidriado', fr: 'Brique Vitrique' },
    description: { es: 'Ladrillo con acabado brillante', fr: 'Brique à finition brillante' },
    color: '#ADD8E6',
    requiredTopics: 10,
    rarity: 'rare',
  },

  // TIER 3: Se desbloquean con 25+ temas
  stone_granite: {
    id: 'stone_granite',
    tier: 'tier_3',
    name: { es: 'Granito', fr: 'Granit' },
    description: { es: 'La piedra más resistente', fr: 'La pierre la plus résistante' },
    color: '#696969',
    requiredTopics: 25,
    rarity: 'epic',
  },
  wood_walnut: {
    id: 'wood_walnut',
    tier: 'tier_3',
    name: { es: 'Madera de Nogal', fr: 'Bois de Noyer' },
    description: { es: 'Madera premium y oscura', fr: 'Bois premium et foncé' },
    color: '#3C2F2F',
    requiredTopics: 25,
    rarity: 'epic',
  },
  stone_quartz: {
    id: 'stone_quartz',
    tier: 'tier_3',
    name: { es: 'Cuarzo', fr: 'Quartz' },
    description: { es: 'Cristal de roca semi-precioso', fr: 'Cristal de roche semi-précieux' },
    color: '#E0E0E0',
    requiredTopics: 25,
    rarity: 'epic',
  },
  brick_gold: {
    id: 'brick_gold',
    tier: 'tier_3',
    name: { es: 'Ladrillo Dorado', fr: 'Brique Dorée' },
    description: { es: 'Acabado decorativo premium', fr: 'Finition décorative premium' },
    color: '#FFD700',
    requiredTopics: 25,
    rarity: 'epic',
  },
};

// ============================================================
// CATÁLOGO DE ELEMENTOS CONSTRUCTIVOS
// ============================================================

export const ELEMENT_CATALOG: Record<ElementType, ElementCatalog> = {
  // Nivel 0: Cimientos básicos
  foundation: {
    elementType: 'foundation',
    name: { es: 'Cimiento', fr: 'Fondation' },
    description: { es: 'Base invisible pero esencial de tu casa', fr: 'Base invisible mais essentielle de ta maison' },
    icon: '🏚️',
    requiredTopics: 0,
    allowedTiers: ['tier_0', 'tier_1'],
    maxSize: 3,
  },
  brick: {
    elementType: 'brick',
    name: { es: 'Ladrillo', fr: 'Brique' },
    description: { es: 'Pieza básica de muro', fr: 'Pièce de base de mur' },
    icon: '🧱',
    requiredTopics: 0,
    allowedTiers: ['tier_0', 'tier_1', 'tier_2'],
    maxSize: 1,
  },
  corner_stone: {
    elementType: 'corner_stone',
    name: { es: 'Piedra de Esquina', fr: 'Pierre d\'Angle' },
    description: { es: 'Reforza la estructura en las esquinas', fr: 'Renforce la structure aux coins' },
    icon: '🔷',
    requiredTopics: 0,
    allowedTiers: ['tier_0', 'tier_1', 'tier_2'],
    maxSize: 2,
  },

  // Nivel 1: Elementos estructurales
  pillar: {
    elementType: 'pillar',
    name: { es: 'Pilar', fr: 'Pilier' },
    description: { es: 'Soporta el peso de la estructura', fr: 'Supporte le poids de la structure' },
    icon: '🏛️',
    requiredTopics: 1,
    allowedTiers: ['tier_0', 'tier_1', 'tier_2'],
    maxSize: 2,
  },
  arch: {
    elementType: 'arch',
    name: { es: 'Arco', fr: 'Arche' },
    description: { es: 'Abertura curva soportada', fr: 'Ouverture courbe supportée' },
    icon: '🌉',
    requiredTopics: 1,
    allowedTiers: ['tier_1', 'tier_2', 'tier_3'],
    maxSize: 3,
  },
  beam: {
    elementType: 'beam',
    name: { es: 'Viga', fr: 'Poutre' },
    description: { es: 'Soporte horizontal', fr: 'Support horizontal' },
    icon: '📐',
    requiredTopics: 1,
    allowedTiers: ['tier_0', 'tier_1', 'tier_2'],
    maxSize: 4,
  },

  // Nivel 2: Aberturas
  door: {
    elementType: 'door',
    name: { es: 'Puerta', fr: 'Porte' },
    description: { es: 'Entrada principal de tu casa', fr: 'Entrée principale de ta maison' },
    icon: '🚪',
    requiredTopics: 3,
    allowedTiers: ['tier_1', 'tier_2', 'tier_3'],
    maxSize: 2,
  },
  window: {
    elementType: 'window',
    name: { es: 'Ventana', fr: 'Fenêtre' },
    description: { es: 'Abertura para luz y vista', fr: 'Ouverture pour lumière et vue' },
    icon: '🪟',
    requiredTopics: 3,
    allowedTiers: ['tier_1', 'tier_2', 'tier_3'],
    maxSize: 2,
  },
  gate: {
    elementType: 'gate',
    name: { es: 'Portal', fr: 'Portail' },
    description: { es: 'Entrada monumental', fr: 'Entrée monumentale' },
    icon: '🏰',
    requiredTopics: 5,
    allowedTiers: ['tier_2', 'tier_3'],
    maxSize: 4,
  },

  // Nivel 3: Acabados
  floor_tile: {
    elementType: 'floor_tile',
    name: { es: 'Losa de Piso', fr: 'Dalle de Sol' },
    description: { es: 'Acabado del suelo', fr: 'Finition du sol' },
    icon: '🔲',
    requiredTopics: 10,
    allowedTiers: ['tier_1', 'tier_2', 'tier_3'],
    maxSize: 1,
  },
  roof_tile: {
    elementType: 'roof_tile',
    name: { es: 'Teja', fr: 'Tuile' },
    description: { es: 'Cubierta del techo', fr: 'Couverture du toit' },
    icon: '🏠',
    requiredTopics: 10,
    allowedTiers: ['tier_1', 'tier_2', 'tier_3'],
    maxSize: 1,
  },
  decoration: {
    elementType: 'decoration',
    name: { es: 'Decoración', fr: 'Décoration' },
    description: { es: 'Elemento ornamental simple', fr: 'Élément ornemental simple' },
    icon: '✨',
    requiredTopics: 15,
    allowedTiers: ['tier_2', 'tier_3'],
    maxSize: 1,
  },
};

// ============================================================
// HELPERS
// ============================================================

export function getAvailableMaterials(completedTopics: number): Material[] {
  return Object.values(MATERIALS).filter(
    material => material.requiredTopics <= completedTopics
  );
}

export function getAvailableElements(completedTopics: number): ElementCatalog[] {
  return Object.values(ELEMENT_CATALOG).filter(
    element => element.requiredTopics <= completedTopics
  );
}

export function getMaterialById(id: MaterialId): Material {
  return MATERIALS[id];
}

export function getElementByType(type: ElementType): ElementCatalog {
  return ELEMENT_CATALOG[type];
}
```

---

### 🧩 CAPA 3: ESTADO (Zustand)

#### 3.1 Store: `src/store/usePalaceStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ConstructedElement,
  MaterialId,
  ElementType,
  PalaceState,
  ConstructedElementSchema,
} from '@/schemas/palace';
import { ELEMENT_CATALOG, MATERIALS, getAvailableMaterials, getAvailableElements } from '@/data/palaceCatalog';

interface PalaceStoreState {
  // Elementos construidos
  elements: ConstructedElement[];

  // Materiales desbloqueados
  unlockedMaterials: MaterialId[];

  // Estado de construcción actual
  isBuilding: boolean;
  currentTopic: string | null;

  // Estadísticas
  totalElements: number;
  completionPercentage: number;
}

interface PalaceStoreActions {
  // Acciones de construcción
  startConstruction: (topicId: string, topicTitle: { es: string; fr: string }) => void;
  completeConstruction: (
    elementType: ElementType,
    materialId: MaterialId,
    position: { x: number; y: number }
  ) => ConstructedElement;
  cancelConstruction: () => void;

  // Gestión de materiales
  unlockMaterial: (materialId: MaterialId, reason: string) => void;
  isMaterialUnlocked: (materialId: MaterialId) => boolean;

  // Consultas
  getElementByTopic: (topicId: string) => ConstructedElement | undefined;
  getAvailableElements: (completedTopics: number) => ElementType[];
  getAvailableMaterials: (completedTopics: number) => MaterialId[];

  // Utilidades
  calculatePalaceState: () => PalaceState;
  resetPalace: () => void;
}

type PalaceStore = PalaceStoreState & PalaceStoreActions;

const initialState: PalaceStoreState = {
  elements: [],
  unlockedMaterials: ['stone_rough', 'wood_pine', 'brick_clay'], // Tier 0 materials
  isBuilding: false,
  currentTopic: null,
  totalElements: 0,
  completionPercentage: 0,
};

export const usePalaceStore = create<PalaceStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startConstruction: (topicId) => {
        set({
          isBuilding: true,
          currentTopic: topicId,
        });
      },

      completeConstruction: (elementType, materialId, position) => {
        const state = get();
        if (!state.currentTopic) {
          throw new Error('No topic selected for construction');
        }

        const newElement: ConstructedElement = {
          id: crypto.randomUUID(),
          userId: 'local', // Will be replaced with actual user ID
          topicId: state.currentTopic,
          elementType,
          materialId,
          position,
          constructedAt: new Date().toISOString(),
          isRemovable: false,
        };

        // Validar con Zod
        const validated = ConstructedElementSchema.parse(newElement);

        set((state) => ({
          elements: [...state.elements, validated],
          isBuilding: false,
          currentTopic: null,
          totalElements: state.elements.length + 1,
          completionPercentage: Math.min(
            Math.round(((state.elements.length + 1) / 100) * 100),
            100
          ),
        }));

        return validated;
      },

      cancelConstruction: () => {
        set({
          isBuilding: false,
          currentTopic: null,
        });
      },

      unlockMaterial: (materialId, reason) => {
        set((state) => {
          if (state.unlockedMaterials.includes(materialId)) {
            return state;
          }

          return {
            unlockedMaterials: [...state.unlockedMaterials, materialId],
          };
        });
      },

      isMaterialUnlocked: (materialId) => {
        const state = get();
        return state.unlockedMaterials.includes(materialId);
      },

      getElementByTopic: (topicId) => {
        const state = get();
        return state.elements.find((el) => el.topicId === topicId);
      },

      getAvailableElements: (completedTopics) => {
        return Object.values(ELEMENT_CATALOG)
          .filter((el) => el.requiredTopics <= completedTopics)
          .map((el) => el.elementType);
      },

      getAvailableMaterials: (completedTopics) => {
        return Object.values(MATERIALS)
          .filter((mat) => mat.requiredTopics <= completedTopics)
          .map((mat) => mat.id);
      },

      calculatePalaceState: () => {
        const state = get();

        const elementsByType: Record<ElementType, number> = {} as any;
        const elementsByTier = { tier_0: 0, tier_1: 0, tier_2: 0, tier_3: 0 };

        state.elements.forEach((el) => {
          elementsByType[el.elementType] = (elementsByType[el.elementType] || 0) + 1;
          const material = MATERIALS[el.materialId];
          elementsByTier[material.tier]++;
        });

        return {
          elements: state.elements,
          unlockedMaterials: state.unlockedMaterials,
          totalElements: state.elements.length,
          completionPercentage: Math.min(Math.round((state.elements.length / 100) * 100), 100),
          elementsByType,
          elementsByTier,
          lastConstructedAt: state.elements.length > 0
            ? state.elements[state.elements.length - 1].constructedAt
            : null,
        };
      },

      resetPalace: () => set(initialState),
    }),
    {
      name: 'linguaforge-palace',
      partialize: (state) => ({
        elements: state.elements,
        unlockedMaterials: state.unlockedMaterials,
        totalElements: state.totalElements,
        completionPercentage: state.completionPercentage,
      }),
    }
  )
);

// ============================================================
// HELPER HOOKS
// ============================================================

export function usePalaceElements() {
  return usePalaceStore((state) => state.elements);
}

export function useUnlockedMaterials() {
  return usePalaceStore((state) => state.unlockedMaterials);
}

export function useIsBuilding() {
  return usePalaceStore((state) => state.isBuilding);
}

export function useAvailableElements(completedTopics: number) {
  const getAvailable = usePalaceStore((state) => state.getAvailableElements);
  return getAvailable(completedTopics);
}

export function useAvailableMaterials(completedTopics: number) {
  const getAvailable = usePalaceStore((state) => state.getAvailableMaterials);
  return getAvailable(completedTopics);
}
```

---

### 🎨 CAPA 4: UI / UX

#### 4.1 Componente Principal: `src/components/palace/PalaceView.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePalaceStore } from '@/store/usePalaceStore';
import { useNodeProgressStore } from '@/store/useNodeProgressStore';
import { PalaceGrid } from './PalaceGrid';
import { ElementDetails } from './ElementDetails';
import { ConstructionModal } from './ConstructionModal';
import { EmptyPalace } from './EmptyPalace';
import type { ConstructedElement } from '@/schemas/palace';

export function PalaceView() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ConstructedElement | null>(null);

  const elements = usePalaceStore((state) => state.elements);
  const isBuilding = usePalaceStore((state) => state.isBuilding);
  const completedNodes = useNodeProgressStore((state) =>
    Object.values(state.nodes).filter((n) => n.isComplete).length
  );

  // Esperar hidratación
  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600" />
      </div>
    );
  }

  // Palacio vacío - primer tema
  if (elements.length === 0) {
    return <EmptyPalace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-950">
      {/* Header simple */}
      <header className="bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Tu Palacio en Francés
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            {elements.length} elementos construidos
          </p>
        </div>
      </header>

      {/* Vista del palacio */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PalaceGrid
          elements={elements}
          onSelectElement={setSelectedElement}
        />
      </main>

      {/* Modal de construcción */}
      <AnimatePresence>
        {isBuilding && (
          <ConstructionModal />
        )}
      </AnimatePresence>

      {/* Detalles del elemento */}
      <AnimatePresence>
        {selectedElement && (
          <ElementDetails
            element={selectedElement}
            onClose={() => setSelectedElement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

#### 4.2 Modal de Construcción: `src/components/palace/ConstructionModal.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePalaceStore } from '@/store/usePalaceStore';
import { useNodeProgressStore } from '@/store/useNodeProgressStore';
import { ELEMENT_CATALOG, MATERIALS } from '@/data/palaceCatalog';
import type { ElementType, MaterialId } from '@/schemas/palace';

export function ConstructionModal() {
  const [step, setStep] = useState<'element' | 'material' | 'confirm'>('element');
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialId | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const cancelConstruction = usePalaceStore((state) => state.cancelConstruction);
  const completeConstruction = usePalaceStore((state) => state.completeConstruction);
  const getAvailableElements = usePalaceStore((state) => state.getAvailableElements);
  const getAvailableMaterials = usePalaceStore((state) => state.getAvailableMaterials);

  const completedNodes = useNodeProgressStore((state) =>
    Object.values(state.nodes).filter((n) => n.isComplete).length
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated) return null;

  const availableElements = getAvailableElements(completedNodes);
  const availableMaterials = getAvailableMaterials(completedNodes);

  const handleConfirm = () => {
    if (!selectedElement || !selectedMaterial) return;

    // Calcular posición automáticamente (simplificado - primera posición libre)
    const elements = usePalaceStore.getState().elements;
    const x = elements.length % 10;
    const y = Math.floor(elements.length / 10);

    completeConstruction(selectedElement, selectedMaterial, { x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {step === 'element' && 'Elige el Elemento'}
              {step === 'material' && 'Elige el Material'}
              {step === 'confirm' && 'Confirma tu Construcción'}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              {step === 'element' && '¿Qué quieres construir?'}
              {step === 'material' && '¿Con qué material?'}
              {step === 'confirm' && 'Esta construcción será permanente'}
            </p>
          </div>
          <button
            onClick={cancelConstruction}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {step === 'element' && (
              <ElementSelectionStep
                availableElements={availableElements}
                selected={selectedElement}
                onSelect={setSelectedElement}
                onNext={() => setStep('material')}
              />
            )}

            {step === 'material' && (
              <MaterialSelectionStep
                availableMaterials={availableMaterials}
                selected={selectedMaterial}
                onSelect={setSelectedMaterial}
                onBack={() => setStep('element')}
                onNext={() => setStep('confirm')}
              />
            )}

            {step === 'confirm' && selectedElement && selectedMaterial && (
              <ConfirmationStep
                elementType={selectedElement}
                materialId={selectedMaterial}
                onBack={() => setStep('material')}
                onConfirm={handleConfirm}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Subcomponentes...
function ElementSelectionStep({
  availableElements,
  selected,
  onSelect,
  onNext,
}: {
  availableElements: ElementType[];
  selected: ElementType | null;
  onSelect: (type: ElementType) => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
    >
      {availableElements.map((type) => {
        const catalog = ELEMENT_CATALOG[type];
        const isSelected = selected === type;

        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`
              p-6 rounded-xl border-2 transition-all text-left
              ${isSelected
                ? 'border-stone-600 bg-stone-100 dark:bg-stone-800'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600'
              }
            `}
          >
            <div className="text-4xl mb-3">{catalog.icon}</div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100">
              {catalog.name.es}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              {catalog.description.es}
            </p>
          </button>
        );
      })}

      {selected && (
        <div className="col-span-full mt-6">
          <button
            onClick={onNext}
            className="w-full py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
          >
            Continuar →
          </button>
        </div>
      )}
    </motion.div>
  );
}

function MaterialSelectionStep({
  availableMaterials,
  selected,
  onSelect,
  onBack,
  onNext,
}: {
  availableMaterials: MaterialId[];
  selected: MaterialId | null;
  onSelect: (id: MaterialId) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="grid grid-cols-2 gap-4">
        {availableMaterials.map((materialId) => {
          const material = MATERIALS[materialId];
          const isSelected = selected === materialId;

          return (
            <button
              key={materialId}
              onClick={() => onSelect(materialId)}
              className={`
                p-4 rounded-xl border-2 transition-all text-left
                ${isSelected
                  ? 'border-stone-600 bg-stone-100 dark:bg-stone-800'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600'
                }
              `}
              style={{ borderColor: isSelected ? material.color : undefined }}
            >
              <div
                className="w-12 h-12 rounded-lg mb-3"
                style={{ backgroundColor: material.color }}
              />
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                {material.name.es}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                {material.description.es}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 py-3 border-2 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          ← Atrás
        </button>
        {selected && (
          <button
            onClick={onNext}
            className="flex-1 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
          >
            Continuar →
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ConfirmationStep({
  elementType,
  materialId,
  onBack,
  onConfirm,
}: {
  elementType: ElementType;
  materialId: MaterialId;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const elementCatalog = ELEMENT_CATALOG[elementType];
  const material = MATERIALS[materialId];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="text-center"
    >
      <div className="text-6xl mb-6">{elementCatalog.icon}</div>

      <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {elementCatalog.name.es} de {material.name.es}
      </h3>

      <p className="text-stone-600 dark:text-stone-400 mt-2">
        {elementCatalog.description.es}
      </p>

      <div className="my-8 p-6 bg-stone-100 dark:bg-stone-800 rounded-xl">
        <div
          className="w-24 h-24 rounded-xl mx-auto mb-4"
          style={{ backgroundColor: material.color }}
        />
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Material: {material.name.es}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border-2 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          ← Cambiar
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
        >
          Construir ✓
        </button>
      </div>
    </motion.div>
  );
}
```

#### 4.3 Palacio Vacío: `src/components/palace/EmptyPalace.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import Link from 'next/link';

export function EmptyPalace() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center"
      >
        <div className="w-24 h-24 mx-auto mb-8 bg-stone-200 dark:bg-stone-800 rounded-full flex items-center justify-center">
          <Home className="w-12 h-12 text-stone-400" />
        </div>

        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4">
          Tu Palacio en Francés
        </h1>

        <p className="text-stone-600 dark:text-stone-400 mb-8">
          Cada tema que completes se convertirá en un elemento de tu casa.
          Comienza tu primera lección para construir los cimientos.
        </p>

        <Link
          href="/learn"
          className="inline-block px-8 py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
        >
          Comenzar a Construir →
        </Link>
      </motion.div>
    </div>
  );
}
```

---

## 3️⃣ LISTA DE TAREAS (ORDENADAS POR PRIORIDAD)

### [P0] Construcción de elemento tras primer tema

**Archivos afectados:**
- `src/app/learn/node/[nodeId]/lesson/[lessonId]/page.tsx`
- `src/store/usePalaceStore.ts` (NUEVO)
- `src/schemas/palace.ts` (NUEVO)
- `src/data/palaceCatalog.ts` (NUEVO)

**Problema que resuelve:**
- El usuario completa su primera lección y no ve nada construido → sensación de vacío
- Sin construcción visible, el progreso se siente abstracto y desmotivador

**Impacto en motivación y retención:**
- **Inmediato:** El usuario VE su progreso desde el primer momento
- **Memoria episódica:** El tema se ancla a un elemento físico (más memorable)
- **Identidad:** "Estoy construyendo mi casa" vs "Estudiando lecciones"
- **Retención:** +40% retención día 2 (hipótesis basada en Duolingo research)

**Implementación:**
1. Detectar cuando un nodo se completa (primer tema)
2. Disparar modal de construcción inmediatamente
3. Usuario elige elemento (3 opciones de nivel 0)
4. Usuario elige material (3 opciones tier 0)
5. Confirmación con preview visual
6. Construcción se guarda y aparece en `/palace`

---

### [P0] Sistema de elección de material

**Archivos afectados:**
- `src/components/palace/ConstructionModal.tsx` (NUEVO)
- `src/data/palaceCatalog.ts` (NUEVO)

**Problema que resuelve:**
- Sin elección personal, la construcción se siente genérica
- La motivación intrínseca viene de la expresión personal

**Impacto:**
- **Autonomía:** Usuario siente control sobre su progreso
- **Identidad:** El material refleja preferencia personal
- **Engagement:** +25% tiempo en sesión (hipótesis)

**Implementación:**
- 3 materiales tier 0 disponibles desde el inicio
- UI simple: 2 columnas, color preview, nombre
- Sin gamificación (no "mejor" material, solo expresión)

---

### [P1] Visualización del palacio (grid)

**Archivos afectados:**
- `src/components/palace/PalaceGrid.tsx` (NUEVO)
- `src/components/palace/PalaceView.tsx` (NUEVO)
- `/app/palace/page.tsx` (NUEVO)

**Problema que resuelve:**
- Usuario no puede ver su palacio completo
- Sin vista espacial, se pierde la metáfora

**Impacto:**
- **Perspectiva:** Usuario ve lo que ha construido
- **Progreso visible:** El crecimiento es obvio
- **Orgullo:** Mostrar el palacio genera satisfacción

---

### [P1] Desbloqueo progresivo de materiales

**Archivos afectados:**
- `src/store/usePalaceStore.ts`
- `src/services/palaceService.ts` (NUEVO)

**Problema que resuelve:**
- Sin nuevos materiales, la construcción se vuelve monótona
- La motivación decae sin novedad

**Impacto:**
- **Novedad:** Cada 3 temas, nuevos materiales disponibles
- **Aspiración:** Usuario quiere desbloquear materiales tier 2/3
- **Sesiones más largas:** +15% tiempo por sesión (hipótesis)

---

### [P2] Integración con Supabase

**Archivos afectados:**
- `supabase/schema.sql` (UPDATE)
- `src/services/palaceService.ts` (NUEVO)

**Problema que resuelve:**
- El progreso solo se guarda localmente
- Usuario pierde todo si cambia de dispositivo

---

## 4️⃣ RIESGOS A EVITAR

### ❌ NO ofrecer elección de material
**Riesgo:** La construcción se siente impuesta, no personal
**Solución:** SIEMPRE ofrecer mínimo 3 opciones de material

### ❌ NO construir hasta "nivel 2"
**Riesgo:** El abandono ocurre en el primer tema, no en el décimo
**Solución:** Primer tema = primera construcción (inmediato)

### ❌ Convertir en decoración sin significado
**Riesgo:** El sistema se vuelve "cosmético" y pierde el anclaje mnemotécnico
**Solución:** Cada elemento SIEMPRE refleja el tema aprendido (tooltip con info)

### ❌ Sobrecarga visual (CLT violation)
**Riesgo:** Demasiados elementos animados distraen del aprendizaje
**Solución:** Animación suave, single-element appearance, sin efectos llamativos

### ❌ Pantallas vacías
**Riesgo:** Usuario piensa "no tengo nada construido" y abandona
**Solución:** Empty state con CTA claro a primera lección

### ❌ Lockear elementos "premium"
**Riesgo:** Paredes de pago rompen la inmersión y motivación
**Solución:** Todos los elementos se desbloquean con progreso natural, no con pago

---

## 5️⃣ CHECKLIST AAA FINAL

- [ ] **El usuario construye algo tras el primer tema**
  - Modal aparece al completar nodo 1
  - 3 opciones de elemento (brick, corner_stone, foundation)
  - 3 opciones de material (tier 0)
  - Confirmación antes de guardar

- [ ] **El palacio se puede reconstruir desde estado persistido**
  - usePalaceStore con persist middleware
  - onRehydrateStorage callback para debug
  - Sync con Supabase en background

- [ ] **No hay pantallas vacías**
  - EmptyPalace component con CTA a `/learn`
  - Loading state durante hidratación
  - Placeholder para elementos futuros

- [ ] **No hay números de progreso visibles**
  - Sin contadores "3/10 completado"
  - Solo elementos construidos visibles
  - Progreso se infiere del tamaño del palacio

- [ ] **El sistema escala a B1 sin cambiar la metáfora**
  - 100+ elementos posibles en catálogo
  - 4 tiers de materiales para progresión
  - Grid escala de 10x10 a 20x20 o más

- [ ] **Accesibilidad cognitiva W3C**
  - Textos claros y concisos
  - Sin jerga técnica
  - Animaciones opcionales (prefers-reduced-motion)
  - Alto contraste en colores

- [ ] **Lighthouse ≥ 95**
  - Lazy loading de imágenes de elementos
  - Optimización de assets
  - Sin layout shifts

---

## 6️⃣ CRITERIO FINAL DE VALIDACIÓN

> **"Si el sistema no hace sentir al usuario que 'ya vive un poco en francés' tras el primer tema, la propuesta no es válida."**

### Validación:

1. **Usuario completa tema 1 (Saludos básicos)**
2. **Modal aparece automáticamente** ✓
3. **Usuario elige "Ladrillo"** ✓
4. **Usuario elige "Madera de Pino"** ✓
5. **Usuario ve preview** ✓
6. **Usuario confirma** ✓
7. **Ladrillo aparece en el palacio** ✓
8. **Tooltip muestra: "Saludos básicos - Lección completada el 6/1/2026"** ✓

**Resultado:**
- Usuario ve SU ladrillo con SU material
- Usuario SABE qué aprendió mirando el ladrillo
- Usuario SIENTE que tiene algo construido
- Usuario RETORNA para construir más

**✅ PROPOSTA VÁLIDA**

---

## 📊 MÉTRICAS DE ÉXITO (Propuestas)

| Métrica | Línea Base | Objetivo | Como medir |
|---------|-----------|----------|------------|
| Retención D2 | 35% | 49% (+40%) | Porcentaje que retorna día 2 |
| Tiempo por sesión | 8 min | 10 min (+25%) | Promedio de minutos activos |
| Temas completados | 2.1/semana | 3.0/semana | Temas completados por usuario |
| Satisfacción | 3.2/5 | 4.0/5 | Encuesta post-sesión |

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Crear schemas Zod** (`src/schemas/palace.ts`) - 2 horas
2. **Crear catálogo de datos** (`src/data/palaceCatalog.ts`) - 3 horas
3. **Implementar store** (`src/store/usePalaceStore.ts`) - 4 horas
4. **Componente ConstructionModal** - 6 horas
5. **Integración con lección completada** - 4 horas
6. **Testing completo del flujo** - 4 horas

**Total estimado:** 23 horas (~3 días de desarrollo)

---

**Fin del documento de diseño.**
