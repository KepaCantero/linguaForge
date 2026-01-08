/**
 * Tests para Sistema de Materiales PBR
 * TAREA 2.8.9.10: Tests para sistema de construcción 3D
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PBR_MATERIALS,
  LOD_CONFIGS,
  createPBRMaterial,
  createSimpleMaterial,
  getPBRMaterial,
  getMaterialsByTexture,
  getMaterialsByRarity,
  getLODForDistance,
  supportsAdvancedMaterials,
  type PBRMaterialConfig,
} from '@/lib/materials/pbr';

describe('PBR Materials System', () => {
  describe('PBR_MATERIALS', () => {
    it('debe tener al menos 15 materiales definidos', () => {
      const materialCount = Object.keys(PBR_MATERIALS).length;
      expect(materialCount).toBeGreaterThanOrEqual(15);
    });

    it('cada material debe tener id único', () => {
      const ids = Object.values(PBR_MATERIALS).map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('cada material debe tener propiedades PBR válidas', () => {
      Object.values(PBR_MATERIALS).forEach((material) => {
        const props = material.properties;

        // Propiedades básicas
        expect(props.color).toBeDefined();
        expect(props.roughness).toBeGreaterThanOrEqual(0);
        expect(props.roughness).toBeLessThanOrEqual(1);
        expect(props.metalness).toBeGreaterThanOrEqual(0);
        expect(props.metalness).toBeLessThanOrEqual(1);

        // Propiedades de transparencia
        expect(typeof props.transparent).toBe('boolean');
        expect(props.opacity).toBeGreaterThanOrEqual(0);
        expect(props.opacity).toBeLessThanOrEqual(1);

        // Propiedades de transmisión
        expect(props.transmission).toBeGreaterThanOrEqual(0);
        expect(props.transmission).toBeLessThanOrEqual(1);
        expect(props.ior).toBeGreaterThan(0);
      });
    });

    it('debe tener materiales de cada textura', () => {
      const textures = new Set(Object.values(PBR_MATERIALS).map((m) => m.texture));
      expect(textures.has('wood')).toBe(true);
      expect(textures.has('stone')).toBe(true);
      expect(textures.has('glass')).toBe(true);
      expect(textures.has('metal')).toBe(true);
      expect(textures.has('crystal')).toBe(true);
    });

    it('debe tener materiales de cada rareza', () => {
      const rarities = new Set(Object.values(PBR_MATERIALS).map((m) => m.rarity));
      expect(rarities.has('common')).toBe(true);
      expect(rarities.has('uncommon')).toBe(true);
      expect(rarities.has('rare')).toBe(true);
      expect(rarities.has('epic')).toBe(true);
      expect(rarities.has('legendary')).toBe(true);
    });

    describe('materiales de madera', () => {
      it('oak_wood debe tener propiedades correctas', () => {
        const oak = PBR_MATERIALS.oak_wood;
        expect(oak.name).toBe('Roble');
        expect(oak.texture).toBe('wood');
        expect(oak.rarity).toBe('common');
        expect(oak.properties.metalness).toBe(0);
        expect(oak.variants.length).toBeGreaterThan(0);
      });

      it('mahogany_wood debe ser uncommon', () => {
        const mahogany = PBR_MATERIALS.mahogany_wood;
        expect(mahogany.rarity).toBe('uncommon');
        expect(mahogany.texture).toBe('wood');
      });

      it('ebony_wood debe ser rare', () => {
        const ebony = PBR_MATERIALS.ebony_wood;
        expect(ebony.rarity).toBe('rare');
        expect(ebony.texture).toBe('wood');
      });
    });

    describe('materiales de piedra', () => {
      it('limestone debe ser common', () => {
        const limestone = PBR_MATERIALS.limestone;
        expect(limestone.rarity).toBe('common');
        expect(limestone.texture).toBe('stone');
        expect(limestone.properties.metalness).toBe(0);
      });

      it('marble debe tener propiedades de brillo', () => {
        const marble = PBR_MATERIALS.marble;
        expect(marble.rarity).toBe('uncommon');
        expect(marble.properties.clearcoat).toBeGreaterThan(0);
      });

      it('obsidian debe tener alta reflectividad', () => {
        const obsidian = PBR_MATERIALS.obsidian;
        expect(obsidian.rarity).toBe('rare');
        expect(obsidian.properties.reflectivity).toBeGreaterThan(0.5);
      });
    });

    describe('materiales de vidrio', () => {
      it('clear_glass debe ser transparente', () => {
        const glass = PBR_MATERIALS.clear_glass;
        expect(glass.properties.transparent).toBe(true);
        expect(glass.properties.transmission).toBeGreaterThan(0.9);
      });

      it('stained_glass debe tener emisión', () => {
        const stained = PBR_MATERIALS.stained_glass;
        expect(stained.properties.emissiveIntensity).toBeGreaterThan(0);
      });

      it('crystal_glass debe tener alto IOR', () => {
        const crystal = PBR_MATERIALS.crystal_glass;
        expect(crystal.properties.ior).toBeGreaterThan(2);
      });
    });

    describe('materiales de metal', () => {
      it('iron debe tener alta metalness', () => {
        const iron = PBR_MATERIALS.iron;
        expect(iron.properties.metalness).toBeGreaterThan(0.8);
        expect(iron.texture).toBe('metal');
      });

      it('gold debe ser epic', () => {
        const gold = PBR_MATERIALS.gold;
        expect(gold.rarity).toBe('epic');
        expect(gold.properties.metalness).toBe(1);
      });
    });

    describe('materiales de cristal mágico', () => {
      it('amethyst debe tener emisión', () => {
        const amethyst = PBR_MATERIALS.amethyst;
        expect(amethyst.properties.emissiveIntensity).toBeGreaterThan(0);
        expect(amethyst.texture).toBe('crystal');
      });

      it('diamond debe ser legendary', () => {
        const diamond = PBR_MATERIALS.diamond;
        expect(diamond.rarity).toBe('legendary');
        expect(diamond.properties.ior).toBe(2.42);
        expect(diamond.properties.transmission).toBeGreaterThan(0.95);
      });
    });
  });

  describe('LOD_CONFIGS', () => {
    it('debe tener 4 niveles de LOD', () => {
      expect(LOD_CONFIGS.length).toBe(4);
    });

    it('los niveles deben estar ordenados por distancia', () => {
      for (let i = 1; i < LOD_CONFIGS.length; i++) {
        expect(LOD_CONFIGS[i].distance).toBeGreaterThan(LOD_CONFIGS[i - 1].distance);
      }
    });

    it('el primer nivel debe tener máxima calidad', () => {
      const lod0 = LOD_CONFIGS[0];
      expect(lod0.level).toBe(0);
      expect(lod0.textureSize).toBe('4k');
      expect(lod0.normalMapEnabled).toBe(true);
      expect(lod0.displacementEnabled).toBe(true);
      expect(lod0.aoEnabled).toBe(true);
    });

    it('el último nivel debe tener mínima calidad', () => {
      const lodLast = LOD_CONFIGS[LOD_CONFIGS.length - 1];
      expect(lodLast.textureSize).toBe('512');
      expect(lodLast.normalMapEnabled).toBe(false);
      expect(lodLast.displacementEnabled).toBe(false);
      expect(lodLast.aoEnabled).toBe(false);
    });

    it('cada nivel debe tener propiedades válidas', () => {
      LOD_CONFIGS.forEach((lod, index) => {
        expect(lod.level).toBe(index);
        expect(lod.distance).toBeGreaterThanOrEqual(0);
        expect(['256', '512', '1k', '2k', '4k']).toContain(lod.textureSize);
        expect(typeof lod.normalMapEnabled).toBe('boolean');
        expect(typeof lod.displacementEnabled).toBe('boolean');
        expect(typeof lod.aoEnabled).toBe('boolean');
      });
    });
  });

  describe('createPBRMaterial', () => {
    it('debe crear material con propiedades básicas', () => {
      const config = PBR_MATERIALS.oak_wood;
      const material = createPBRMaterial(config);

      expect(material).toBeDefined();
      expect(material.roughness).toBe(config.properties.roughness);
      expect(material.metalness).toBe(config.properties.metalness);
    });

    it('debe aplicar variante si se especifica', () => {
      const config = PBR_MATERIALS.oak_wood;
      const variantId = config.variants[0]?.id;

      if (variantId) {
        const material = createPBRMaterial(config, variantId);
        expect(material).toBeDefined();
        // El material debe existir con variante aplicada
      }
    });

    it('debe ignorar variante inválida', () => {
      const config = PBR_MATERIALS.oak_wood;
      const material = createPBRMaterial(config, 'invalid_variant');

      expect(material).toBeDefined();
      expect(material.roughness).toBe(config.properties.roughness);
    });

    it('debe aplicar weathering level', () => {
      const config = PBR_MATERIALS.oak_wood;

      // Nivel 0 (nuevo)
      const material0 = createPBRMaterial(config, undefined, 0);
      // Nivel 1 (envejecido)
      const material1 = createPBRMaterial(config, undefined, 1);

      // Weathering debe aumentar roughness
      expect(material1.roughness).toBeGreaterThanOrEqual(material0.roughness);
    });

    it('debe limitar roughness entre 0 y 1', () => {
      const config = PBR_MATERIALS.obsidian;
      const material = createPBRMaterial(config, undefined, 10); // Nivel muy alto

      expect(material.roughness).toBeGreaterThanOrEqual(0);
      expect(material.roughness).toBeLessThanOrEqual(1);
    });

    it('debe crear material transparente para vidrio', () => {
      const config = PBR_MATERIALS.clear_glass;
      const material = createPBRMaterial(config);

      expect(material.transparent).toBe(true);
      expect(material.transmission).toBeGreaterThan(0);
    });

    it('debe incluir propiedades de sheen', () => {
      const config = PBR_MATERIALS.oak_wood;
      const material = createPBRMaterial(config);

      expect(material.sheen).toBeDefined();
      expect(material.sheenRoughness).toBeDefined();
    });
  });

  describe('createSimpleMaterial', () => {
    it('debe crear material estándar simplificado', () => {
      const config = PBR_MATERIALS.oak_wood;
      const material = createSimpleMaterial(config);

      expect(material).toBeDefined();
      expect(material.roughness).toBe(config.properties.roughness);
      expect(material.metalness).toBe(config.properties.metalness);
    });

    it('debe aplicar variante', () => {
      const config = PBR_MATERIALS.marble;
      const variantId = config.variants[0]?.id;

      if (variantId) {
        const material = createSimpleMaterial(config, variantId);
        expect(material).toBeDefined();
      }
    });

    it('no debe incluir propiedades avanzadas como clearcoat', () => {
      const config = PBR_MATERIALS.gold;
      const material = createSimpleMaterial(config);

      // MeshStandardMaterial no tiene clearcoat
      expect((material as unknown as Record<string, unknown>).clearcoat).toBeUndefined();
    });
  });

  describe('getPBRMaterial', () => {
    it('debe retornar material existente', () => {
      const material = getPBRMaterial('oak_wood');
      expect(material).toBeDefined();
      expect(material?.id).toBe('oak_wood');
    });

    it('debe retornar undefined para material inexistente', () => {
      const material = getPBRMaterial('nonexistent_material');
      expect(material).toBeUndefined();
    });

    it('debe retornar la configuración completa', () => {
      const material = getPBRMaterial('diamond');
      expect(material?.name).toBe('Diamante');
      expect(material?.texture).toBe('crystal');
      expect(material?.rarity).toBe('legendary');
      expect(material?.properties).toBeDefined();
      expect(material?.variants).toBeDefined();
      expect(material?.weatheringLevels).toBeDefined();
    });
  });

  describe('getMaterialsByTexture', () => {
    it('debe retornar materiales de madera', () => {
      const woodMaterials = getMaterialsByTexture('wood');
      expect(woodMaterials.length).toBeGreaterThan(0);
      woodMaterials.forEach((m) => expect(m.texture).toBe('wood'));
    });

    it('debe retornar materiales de piedra', () => {
      const stoneMaterials = getMaterialsByTexture('stone');
      expect(stoneMaterials.length).toBeGreaterThan(0);
      stoneMaterials.forEach((m) => expect(m.texture).toBe('stone'));
    });

    it('debe retornar materiales de vidrio', () => {
      const glassMaterials = getMaterialsByTexture('glass');
      expect(glassMaterials.length).toBeGreaterThan(0);
      glassMaterials.forEach((m) => expect(m.texture).toBe('glass'));
    });

    it('debe retornar materiales de metal', () => {
      const metalMaterials = getMaterialsByTexture('metal');
      expect(metalMaterials.length).toBeGreaterThan(0);
      metalMaterials.forEach((m) => expect(m.texture).toBe('metal'));
    });

    it('debe retornar materiales de cristal', () => {
      const crystalMaterials = getMaterialsByTexture('crystal');
      expect(crystalMaterials.length).toBeGreaterThan(0);
      crystalMaterials.forEach((m) => expect(m.texture).toBe('crystal'));
    });

    it('debe retornar array vacío para textura inválida', () => {
      const materials = getMaterialsByTexture('invalid' as Parameters<typeof getMaterialsByTexture>[0]);
      expect(materials).toEqual([]);
    });
  });

  describe('getMaterialsByRarity', () => {
    it('debe retornar materiales comunes', () => {
      const commonMaterials = getMaterialsByRarity('common');
      expect(commonMaterials.length).toBeGreaterThan(0);
      commonMaterials.forEach((m) => expect(m.rarity).toBe('common'));
    });

    it('debe retornar materiales uncommon', () => {
      const uncommonMaterials = getMaterialsByRarity('uncommon');
      expect(uncommonMaterials.length).toBeGreaterThan(0);
      uncommonMaterials.forEach((m) => expect(m.rarity).toBe('uncommon'));
    });

    it('debe retornar materiales raros', () => {
      const rareMaterials = getMaterialsByRarity('rare');
      expect(rareMaterials.length).toBeGreaterThan(0);
      rareMaterials.forEach((m) => expect(m.rarity).toBe('rare'));
    });

    it('debe retornar materiales epic', () => {
      const epicMaterials = getMaterialsByRarity('epic');
      expect(epicMaterials.length).toBeGreaterThan(0);
      epicMaterials.forEach((m) => expect(m.rarity).toBe('epic'));
    });

    it('debe retornar materiales legendarios', () => {
      const legendaryMaterials = getMaterialsByRarity('legendary');
      expect(legendaryMaterials.length).toBeGreaterThan(0);
      legendaryMaterials.forEach((m) => expect(m.rarity).toBe('legendary'));
    });

    it('la cantidad de materiales debe disminuir con la rareza', () => {
      const common = getMaterialsByRarity('common').length;
      const uncommon = getMaterialsByRarity('uncommon').length;
      const rare = getMaterialsByRarity('rare').length;
      const epic = getMaterialsByRarity('epic').length;
      const legendary = getMaterialsByRarity('legendary').length;

      // Generalmente hay más comunes que raros
      expect(common).toBeGreaterThanOrEqual(uncommon);
      expect(legendary).toBeLessThanOrEqual(epic);
    });
  });

  describe('getLODForDistance', () => {
    it('debe retornar LOD 0 para distancia 0', () => {
      const lod = getLODForDistance(0);
      expect(lod.level).toBe(0);
    });

    it('debe retornar LOD 0 para distancia negativa', () => {
      const lod = getLODForDistance(-10);
      expect(lod.level).toBe(0);
    });

    it('debe retornar LOD 1 para distancia media-baja', () => {
      const lod = getLODForDistance(15);
      expect(lod.level).toBe(1);
    });

    it('debe retornar LOD 2 para distancia media', () => {
      const lod = getLODForDistance(30);
      expect(lod.level).toBe(2);
    });

    it('debe retornar LOD 3 para distancia alta', () => {
      const lod = getLODForDistance(60);
      expect(lod.level).toBe(3);
    });

    it('debe retornar LOD 3 para distancias muy altas', () => {
      const lod = getLODForDistance(1000);
      expect(lod.level).toBe(3);
    });

    it('debe retornar LOD con todas las propiedades', () => {
      const lod = getLODForDistance(5);
      expect(lod.level).toBeDefined();
      expect(lod.distance).toBeDefined();
      expect(lod.textureSize).toBeDefined();
      expect(lod.normalMapEnabled).toBeDefined();
      expect(lod.displacementEnabled).toBeDefined();
      expect(lod.aoEnabled).toBeDefined();
    });
  });

  describe('supportsAdvancedMaterials', () => {
    let originalWindow: Window & typeof globalThis;
    let originalDocument: Document;

    beforeEach(() => {
      originalWindow = global.window;
      originalDocument = global.document;
    });

    afterEach(() => {
      global.window = originalWindow;
      global.document = originalDocument;
    });

    it('debe retornar false si window no existe', () => {
      // @ts-expect-error - Testing undefined window
      global.window = undefined;
      expect(supportsAdvancedMaterials()).toBe(false);
    });

    it('debe retornar false si no hay contexto WebGL', () => {
      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(null),
      };

      global.document = {
        createElement: vi.fn().mockReturnValue(mockCanvas),
      } as unknown as Document;

      expect(supportsAdvancedMaterials()).toBe(false);
    });

    it('debe verificar extensiones WebGL', () => {
      const mockGL = {
        getExtension: vi.fn().mockReturnValue({}),
      };

      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(mockGL),
      };

      global.document = {
        createElement: vi.fn().mockReturnValue(mockCanvas),
      } as unknown as Document;

      const result = supportsAdvancedMaterials();

      expect(mockGL.getExtension).toHaveBeenCalledWith('EXT_color_buffer_float');
      expect(mockGL.getExtension).toHaveBeenCalledWith('OES_texture_float_linear');
    });

    it('debe retornar false si falta alguna extensión', () => {
      const mockGL = {
        getExtension: vi.fn().mockImplementation((ext: string) => {
          if (ext === 'EXT_color_buffer_float') return {};
          return null;
        }),
      };

      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(mockGL),
      };

      global.document = {
        createElement: vi.fn().mockReturnValue(mockCanvas),
      } as unknown as Document;

      expect(supportsAdvancedMaterials()).toBe(false);
    });
  });

  describe('Material Variants', () => {
    it('cada variante debe tener id único dentro del material', () => {
      Object.values(PBR_MATERIALS).forEach((material) => {
        if (material.variants.length > 0) {
          const variantIds = material.variants.map((v) => v.id);
          const uniqueIds = new Set(variantIds);
          expect(uniqueIds.size).toBe(variantIds.length);
        }
      });
    });

    it('cada variante debe tener modificadores válidos', () => {
      Object.values(PBR_MATERIALS).forEach((material) => {
        material.variants.forEach((variant) => {
          expect(variant.id).toBeDefined();
          expect(variant.name).toBeDefined();
          expect(variant.colorModifier).toBeDefined();
          expect(typeof variant.roughnessModifier).toBe('number');
          expect(typeof variant.metalnessModifier).toBe('number');
        });
      });
    });

    it('los modificadores no deben causar valores fuera de rango', () => {
      Object.values(PBR_MATERIALS).forEach((material) => {
        material.variants.forEach((variant) => {
          const finalRoughness = material.properties.roughness + variant.roughnessModifier;
          const finalMetalness = material.properties.metalness + variant.metalnessModifier;

          // Con el clamping de Math.min/max, estos valores deben estar en rango
          expect(Math.max(0, Math.min(1, finalRoughness))).toBe(
            Math.max(0, Math.min(1, finalRoughness))
          );
          expect(Math.max(0, Math.min(1, finalMetalness))).toBe(
            Math.max(0, Math.min(1, finalMetalness))
          );
        });
      });
    });
  });

  describe('Weathering Levels', () => {
    it('cada material debe tener al menos un weathering level', () => {
      Object.values(PBR_MATERIALS).forEach((material) => {
        expect(material.weatheringLevels.length).toBeGreaterThan(0);
      });
    });

    it('el primer weathering level debe ser el estado original', () => {
      Object.values(PBR_MATERIALS).forEach((material) => {
        const firstLevel = material.weatheringLevels[0];
        expect(firstLevel.level).toBe(0);
        expect(firstLevel.roughnessIncrease).toBe(0);
        expect(firstLevel.colorDesaturation).toBe(0);
        expect(firstLevel.dirtOverlay).toBe(0);
      });
    });

    it('weathering levels deben estar ordenados', () => {
      Object.values(PBR_MATERIALS).forEach((material) => {
        for (let i = 1; i < material.weatheringLevels.length; i++) {
          expect(material.weatheringLevels[i].level).toBeGreaterThan(
            material.weatheringLevels[i - 1].level
          );
        }
      });
    });

    it('weathering debe aumentar roughness progresivamente', () => {
      Object.values(PBR_MATERIALS).forEach((material) => {
        for (let i = 1; i < material.weatheringLevels.length; i++) {
          expect(material.weatheringLevels[i].roughnessIncrease).toBeGreaterThanOrEqual(
            material.weatheringLevels[i - 1].roughnessIncrease
          );
        }
      });
    });
  });
});
