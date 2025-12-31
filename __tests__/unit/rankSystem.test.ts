import { describe, it, expect } from 'vitest';
import {
  HUNTER_RANKS,
  RANK_UNLOCK_RULES,
  getRankByXP,
  getRankProgress,
  canAccessContent,
  type HunterRank,
  type SupportedLevel,
} from '@/lib/constants';

describe('Sistema de Rangos Solo Leveling', () => {
  describe('HUNTER_RANKS', () => {
    it('debe tener 6 rangos (E, D, C, B, A, S)', () => {
      expect(HUNTER_RANKS).toHaveLength(6);
      expect(HUNTER_RANKS.map(r => r.rank)).toEqual(['E', 'D', 'C', 'B', 'A', 'S']);
    });

    it('debe tener rangos ordenados por XP requerido ascendente', () => {
      for (let i = 1; i < HUNTER_RANKS.length; i++) {
        expect(HUNTER_RANKS[i].xpRequired).toBeGreaterThan(HUNTER_RANKS[i - 1].xpRequired);
      }
    });

    it('debe tener colores únicos para cada rango', () => {
      const colors = HUNTER_RANKS.map(r => r.color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });
  });

  describe('getRankByXP', () => {
    it('debe retornar rango E para XP = 0', () => {
      const rank = getRankByXP(0);
      expect(rank.rank).toBe('E');
      expect(rank.xpRequired).toBe(0);
    });

    it('debe retornar rango E para XP < 500', () => {
      const rank = getRankByXP(499);
      expect(rank.rank).toBe('E');
    });

    it('debe retornar rango D para XP = 500', () => {
      const rank = getRankByXP(500);
      expect(rank.rank).toBe('D');
    });

    it('debe retornar rango D para XP entre 500 y 1499', () => {
      expect(getRankByXP(750).rank).toBe('D');
      expect(getRankByXP(1499).rank).toBe('D');
    });

    it('debe retornar rango C para XP = 1500', () => {
      const rank = getRankByXP(1500);
      expect(rank.rank).toBe('C');
    });

    it('debe retornar rango B para XP = 3000', () => {
      const rank = getRankByXP(3000);
      expect(rank.rank).toBe('B');
    });

    it('debe retornar rango A para XP = 5000', () => {
      const rank = getRankByXP(5000);
      expect(rank.rank).toBe('A');
    });

    it('debe retornar rango S para XP = 8000', () => {
      const rank = getRankByXP(8000);
      expect(rank.rank).toBe('S');
    });

    it('debe retornar rango S para XP > 8000', () => {
      const rank = getRankByXP(10000);
      expect(rank.rank).toBe('S');
    });
  });

  describe('getRankProgress', () => {
    it('debe retornar 0% para XP en el inicio del rango', () => {
      expect(getRankProgress(0)).toBe(0);
      expect(getRankProgress(500)).toBe(0);
      expect(getRankProgress(1500)).toBe(0);
    });

    it('debe retornar 50% para XP en el medio del rango', () => {
      // Rango E (0-500): 250 XP = 50%
      expect(getRankProgress(250)).toBe(50);
      // Rango D (500-1500): 1000 XP = 50%
      expect(getRankProgress(1000)).toBe(50);
    });

    it('debe retornar 100% para XP en el final del rango', () => {
      // Rango E: 499 XP = casi 100%
      expect(getRankProgress(499)).toBeGreaterThan(99);
      // Rango D: 1499 XP = casi 100%
      expect(getRankProgress(1499)).toBeGreaterThan(99);
    });

    it('debe retornar 100% para rango S (máximo)', () => {
      expect(getRankProgress(8000)).toBe(100);
      expect(getRankProgress(10000)).toBe(100);
    });

    it('debe calcular progreso correctamente para todos los rangos', () => {
      // Rango E: 100 XP de 500 = 20%
      expect(getRankProgress(100)).toBe(20);
      // Rango D: 1000 XP de 1000 = 50%
      expect(getRankProgress(1000)).toBe(50);
      // Rango C: 2000 XP de 1500 = 33.33% (redondeado)
      expect(getRankProgress(2000)).toBe(33);
    });
  });

  describe('canAccessContent', () => {
    it('debe permitir acceso a A1 para rango E', () => {
      expect(canAccessContent('E', 'A1')).toBe(true);
    });

    it('debe denegar acceso a A2 para rango E', () => {
      expect(canAccessContent('E', 'A2')).toBe(false);
    });

    it('debe permitir acceso a A1 y A2 para rango D', () => {
      expect(canAccessContent('D', 'A1')).toBe(true);
      expect(canAccessContent('D', 'A2')).toBe(true);
      expect(canAccessContent('D', 'B1')).toBe(false);
    });

    it('debe permitir acceso a A1, A2, B1 para rango C', () => {
      expect(canAccessContent('C', 'A1')).toBe(true);
      expect(canAccessContent('C', 'A2')).toBe(true);
      expect(canAccessContent('C', 'B1')).toBe(true);
      expect(canAccessContent('C', 'B2')).toBe(false);
    });

    it('debe permitir acceso completo para rango S', () => {
      const levels: SupportedLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      levels.forEach(level => {
        expect(canAccessContent('S', level)).toBe(true);
      });
    });

    it('debe seguir las reglas de RANK_UNLOCK_RULES', () => {
      Object.entries(RANK_UNLOCK_RULES).forEach(([rank, rules]) => {
        rules.contentLevels.forEach(level => {
          expect(canAccessContent(rank as HunterRank, level as SupportedLevel)).toBe(true);
        });
      });
    });
  });

  describe('RANK_UNLOCK_RULES', () => {
    it('debe tener reglas para todos los rangos', () => {
      HUNTER_RANKS.forEach(rankInfo => {
        expect(RANK_UNLOCK_RULES[rankInfo.rank]).toBeDefined();
        expect(RANK_UNLOCK_RULES[rankInfo.rank].contentLevels).toBeInstanceOf(Array);
        expect(RANK_UNLOCK_RULES[rankInfo.rank].contentLevels.length).toBeGreaterThan(0);
      });
    });

    it('debe tener más niveles desbloqueados para rangos superiores', () => {
      const eLevels = RANK_UNLOCK_RULES.E.contentLevels.length;
      const dLevels = RANK_UNLOCK_RULES.D.contentLevels.length;
      const cLevels = RANK_UNLOCK_RULES.C.contentLevels.length;
      const bLevels = RANK_UNLOCK_RULES.B.contentLevels.length;
      const aLevels = RANK_UNLOCK_RULES.A.contentLevels.length;
      const sLevels = RANK_UNLOCK_RULES.S.contentLevels.length;

      expect(dLevels).toBeGreaterThan(eLevels);
      expect(cLevels).toBeGreaterThan(dLevels);
      expect(bLevels).toBeGreaterThan(cLevels);
      expect(aLevels).toBeGreaterThan(bLevels);
      expect(sLevels).toBeGreaterThan(aLevels);
    });

    it('debe incluir A1 en todos los rangos', () => {
      Object.values(RANK_UNLOCK_RULES).forEach(rules => {
        expect(rules.contentLevels).toContain('A1');
      });
    });
  });
});

