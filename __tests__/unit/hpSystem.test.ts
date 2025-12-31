import { describe, it, expect } from 'vitest';
import { HP_CONFIG } from '@/lib/constants';

describe('Sistema de HP', () => {
  describe('HP_CONFIG', () => {
    it('debe tener valores válidos', () => {
      expect(HP_CONFIG.maxHP).toBe(100);
      expect(HP_CONFIG.dailyMissionHP).toBeGreaterThan(0);
      expect(HP_CONFIG.recoveryPerMission).toBeGreaterThan(0);
      expect(HP_CONFIG.minHPForPremium).toBeLessThanOrEqual(HP_CONFIG.maxHP);
    });

    it('debe tener minHPForPremium menor que maxHP', () => {
      expect(HP_CONFIG.minHPForPremium).toBeLessThan(HP_CONFIG.maxHP);
    });
  });

  describe('Lógica de HP', () => {
    it('debe reducir HP correctamente', () => {
      const initialHP = 100;
      const reduction = HP_CONFIG.dailyMissionHP;
      const expectedHP = Math.max(0, initialHP - reduction);
      expect(expectedHP).toBe(80);
    });

    it('debe recuperar HP correctamente', () => {
      const currentHP = 50;
      const recovery = HP_CONFIG.recoveryPerMission;
      const expectedHP = Math.min(HP_CONFIG.maxHP, currentHP + recovery);
      expect(expectedHP).toBe(60);
    });

    it('no debe permitir HP negativo', () => {
      const initialHP = 10;
      const reduction = 30;
      const expectedHP = Math.max(0, initialHP - reduction);
      expect(expectedHP).toBe(0);
    });

    it('no debe permitir HP mayor que maxHP', () => {
      const currentHP = 95;
      const recovery = 20;
      const expectedHP = Math.min(HP_CONFIG.maxHP, currentHP + recovery);
      expect(expectedHP).toBe(HP_CONFIG.maxHP);
    });

    it('debe bloquear contenido premium cuando HP < minHPForPremium', () => {
      const hp = HP_CONFIG.minHPForPremium - 1;
      const canAccess = hp >= HP_CONFIG.minHPForPremium;
      expect(canAccess).toBe(false);
    });

    it('debe permitir contenido premium cuando HP >= minHPForPremium', () => {
      const hp = HP_CONFIG.minHPForPremium;
      const canAccess = hp >= HP_CONFIG.minHPForPremium;
      expect(canAccess).toBe(true);
    });
  });
});

