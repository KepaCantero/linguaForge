/**
 * Tests para Sistema de Texturas Memory Bank AAA
 * TAREA 2.8.7: Tests para componentes Memory Bank
 */

import { describe, it, expect } from 'vitest';
import {
  TEXTURES,
  getTextureForContext,
  getTextureByType,
  getTextureStyles,
  getPhysicsConfig,
  getTexturesForContext,
  validateTexture,
  TEXTURE_TYPES,
  LEARNING_CONTEXTS,
  type TextureType,
  type LearningContext,
} from '@/lib/textures';

describe('textures', () => {
  describe('TEXTURES constant', () => {
    it('debe tener 6 tipos de texturas definidas', () => {
      expect(Object.keys(TEXTURES)).toHaveLength(6);
    });

    it('debe incluir todas las texturas requeridas', () => {
      const expectedTextures: TextureType[] = ['paper', 'wood', 'stone', 'glass', 'metal', 'crystal'];
      expectedTextures.forEach(type => {
        expect(TEXTURES[type]).toBeDefined();
      });
    });

    it('cada textura debe tener todas las propiedades requeridas', () => {
      Object.values(TEXTURES).forEach(texture => {
        expect(texture.type).toBeDefined();
        expect(texture.name).toBeDefined();
        expect(texture.description).toBeDefined();
        expect(texture.roughness).toBeGreaterThanOrEqual(0);
        expect(texture.roughness).toBeLessThanOrEqual(1);
        expect(texture.metalness).toBeGreaterThanOrEqual(0);
        expect(texture.metalness).toBeLessThanOrEqual(1);
        expect(texture.reflectivity).toBeGreaterThanOrEqual(0);
        expect(texture.reflectivity).toBeLessThanOrEqual(1);
        expect(texture.baseColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(texture.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(texture.gradient).toBeDefined();
        expect(texture.shadow).toBeDefined();
        expect(texture.border).toBeDefined();
        expect(texture.learningContexts).toBeInstanceOf(Array);
        expect(texture.weight).toBeGreaterThan(0);
        expect(texture.soundProfile).toBeDefined();
      });
    });
  });

  describe('getTextureForContext', () => {
    it('debe retornar textura paper para vocabulary', () => {
      const texture = getTextureForContext('vocabulary');
      expect(texture.type).toBe('paper');
    });

    it('debe retornar textura wood para conversation', () => {
      const texture = getTextureForContext('conversation');
      expect(texture.type).toBe('wood');
    });

    it('debe retornar textura metal para grammar', () => {
      const texture = getTextureForContext('grammar');
      expect(texture.type).toBe('metal');
    });

    it('debe retornar textura glass para culture', () => {
      const texture = getTextureForContext('culture');
      expect(texture.type).toBe('glass');
    });

    it('debe retornar textura crystal para advanced', () => {
      const texture = getTextureForContext('advanced');
      expect(texture.type).toBe('crystal');
    });
  });

  describe('getTextureByType', () => {
    it('debe retornar la textura correcta por tipo', () => {
      TEXTURE_TYPES.forEach(type => {
        const texture = getTextureByType(type);
        expect(texture.type).toBe(type);
      });
    });
  });

  describe('getTextureStyles', () => {
    it('debe retornar estilos CSS válidos', () => {
      const texture = TEXTURES.paper;
      const styles = getTextureStyles(texture);

      expect(styles.background).toBe(texture.gradient);
      expect(styles.boxShadow).toBe(texture.shadow);
      expect(styles.border).toBe(texture.border);
    });

    it('debe funcionar para todas las texturas', () => {
      Object.values(TEXTURES).forEach(texture => {
        const styles = getTextureStyles(texture);
        expect(styles).toHaveProperty('background');
        expect(styles).toHaveProperty('boxShadow');
        expect(styles).toHaveProperty('border');
      });
    });
  });

  describe('getPhysicsConfig', () => {
    it('debe retornar configuración de física válida', () => {
      const texture = TEXTURES.paper;
      const config = getPhysicsConfig(texture);

      expect(config.stiffness).toBeGreaterThan(0);
      expect(config.damping).toBeGreaterThan(0);
      expect(config.mass).toBe(texture.weight);
    });

    it('texturas más pesadas deben tener mayor amortiguación', () => {
      const lightTexture = TEXTURES.paper; // weight: 0.3
      const heavyTexture = TEXTURES.stone; // weight: 1.2

      const lightConfig = getPhysicsConfig(lightTexture);
      const heavyConfig = getPhysicsConfig(heavyTexture);

      expect(heavyConfig.damping).toBeGreaterThan(lightConfig.damping);
    });

    it('texturas más ligeras deben tener mayor rigidez', () => {
      const lightTexture = TEXTURES.paper;
      const heavyTexture = TEXTURES.stone;

      const lightConfig = getPhysicsConfig(lightTexture);
      const heavyConfig = getPhysicsConfig(heavyTexture);

      expect(lightConfig.stiffness).toBeGreaterThan(heavyConfig.stiffness);
    });
  });

  describe('getTexturesForContext', () => {
    it('debe retornar texturas que incluyen el contexto vocabulary', () => {
      const textures = getTexturesForContext('vocabulary');
      expect(textures.length).toBeGreaterThan(0);
      textures.forEach(texture => {
        expect(texture.learningContexts).toContain('vocabulary');
      });
    });

    it('debe retornar texturas que incluyen el contexto grammar', () => {
      const textures = getTexturesForContext('grammar');
      expect(textures.length).toBeGreaterThan(0);
      textures.forEach(texture => {
        expect(texture.learningContexts).toContain('grammar');
      });
    });
  });

  describe('validateTexture', () => {
    it('debe validar una textura correcta', () => {
      const validTexture = TEXTURES.paper;
      expect(() => validateTexture(validTexture)).not.toThrow();
    });

    it('debe rechazar una textura inválida', () => {
      const invalidTexture = { type: 'invalid' };
      expect(() => validateTexture(invalidTexture)).toThrow();
    });

    it('debe rechazar textura con propiedades faltantes', () => {
      const incompleteTexture = {
        type: 'paper',
        name: 'Test',
      };
      expect(() => validateTexture(incompleteTexture)).toThrow();
    });
  });

  describe('TEXTURE_TYPES', () => {
    it('debe exportar array de tipos válidos', () => {
      expect(TEXTURE_TYPES).toBeInstanceOf(Array);
      expect(TEXTURE_TYPES).toHaveLength(6);
    });
  });

  describe('LEARNING_CONTEXTS', () => {
    it('debe exportar array de contextos válidos', () => {
      expect(LEARNING_CONTEXTS).toBeInstanceOf(Array);
      expect(LEARNING_CONTEXTS).toHaveLength(5);
    });

    it('debe incluir todos los contextos esperados', () => {
      const expected: LearningContext[] = ['vocabulary', 'conversation', 'grammar', 'culture', 'advanced'];
      expected.forEach(context => {
        expect(LEARNING_CONTEXTS).toContain(context);
      });
    });
  });
});
