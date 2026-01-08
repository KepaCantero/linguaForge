/**
 * Tests para Sistema de Feedback Háptico Memory Bank AAA
 * TAREA 2.8.7: Tests para componentes Memory Bank
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  HAPTIC_PATTERNS,
  isHapticSupported,
  prefersReducedMotion,
  setHapticEnabled,
  isHapticEnabled,
  vibrate,
  stopVibration,
  triggerHaptic,
  triggerHapticWithIntensity,
  hapticSuccess,
  hapticError,
  hapticTap,
  hapticSelect,
  hapticMilestone,
  hapticCardFlip,
  hapticDragStart,
  hapticDragEnd,
  hapticLevelUp,
  visualFeedback,
  hapticWithFallback,
  useHaptic,
  HAPTIC_PATTERN_TYPES,
  type HapticPatternType,
} from '@/lib/haptic';

describe('haptic', () => {
  // Mock navigator.vibrate
  const mockVibrate = vi.fn(() => true);

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      configurable: true,
      writable: true,
    });

    // Reset haptic state
    setHapticEnabled(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('HAPTIC_PATTERNS', () => {
    it('debe tener 12 patrones definidos', () => {
      expect(Object.keys(HAPTIC_PATTERNS)).toHaveLength(12);
    });

    it('cada patrón debe tener estructura válida', () => {
      Object.values(HAPTIC_PATTERNS).forEach(pattern => {
        expect(pattern.type).toBeDefined();
        expect(pattern.pattern).toBeInstanceOf(Array);
        expect(pattern.pattern.length).toBeGreaterThan(0);
        expect(pattern.intensity).toMatch(/^(light|medium|heavy)$/);
        expect(pattern.description).toBeDefined();
      });
    });

    it('los patrones deben tener duraciones positivas', () => {
      Object.values(HAPTIC_PATTERNS).forEach(pattern => {
        pattern.pattern.forEach(duration => {
          expect(duration).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('HAPTIC_PATTERN_TYPES', () => {
    it('debe exportar todos los tipos de patrones', () => {
      expect(HAPTIC_PATTERN_TYPES).toHaveLength(12);
      const expectedTypes: HapticPatternType[] = [
        'success', 'error', 'tap', 'select', 'milestone', 'notification',
        'warning', 'confirm', 'card_flip', 'drag_start', 'drag_end', 'level_up'
      ];
      expectedTypes.forEach(type => {
        expect(HAPTIC_PATTERN_TYPES).toContain(type);
      });
    });
  });

  describe('isHapticSupported', () => {
    it('debe retornar true si vibrate está disponible', () => {
      expect(isHapticSupported()).toBe(true);
    });

    it('debe retornar false si vibrate no está disponible', () => {
      // Guardar referencia original
      const originalVibrate = navigator.vibrate;
      // Eliminar vibrate temporalmente
      // @ts-expect-error - Testing undefined vibrate
      delete navigator.vibrate;

      const result = isHapticSupported();

      // Restaurar
      Object.defineProperty(navigator, 'vibrate', {
        value: originalVibrate,
        configurable: true,
        writable: true,
      });

      expect(result).toBe(false);
    });
  });

  describe('setHapticEnabled / isHapticEnabled', () => {
    it('debe habilitar/deshabilitar el feedback háptico', () => {
      setHapticEnabled(true);
      expect(isHapticEnabled()).toBe(true);

      setHapticEnabled(false);
      expect(isHapticEnabled()).toBe(false);
    });
  });

  describe('vibrate', () => {
    it('debe llamar a navigator.vibrate con el patrón correcto', () => {
      vibrate([50, 30, 50]);
      expect(mockVibrate).toHaveBeenCalledWith([50, 30, 50]);
    });

    it('debe retornar false si háptico está deshabilitado', () => {
      setHapticEnabled(false);
      const result = vibrate([50]);
      expect(result).toBe(false);
      expect(mockVibrate).not.toHaveBeenCalled();
    });
  });

  describe('stopVibration', () => {
    it('debe llamar a vibrate(0) para detener vibración', () => {
      stopVibration();
      expect(mockVibrate).toHaveBeenCalledWith(0);
    });
  });

  describe('triggerHaptic', () => {
    it('debe ejecutar el patrón success correctamente', () => {
      triggerHaptic('success');
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.success.pattern);
    });

    it('debe ejecutar el patrón error correctamente', () => {
      triggerHaptic('error');
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.error.pattern);
    });

    it('debe retornar false para patrón desconocido', () => {
      const result = triggerHaptic('unknown' as HapticPatternType);
      expect(result).toBe(false);
    });
  });

  describe('triggerHapticWithIntensity', () => {
    it('debe ajustar duración según multiplicador', () => {
      triggerHapticWithIntensity('tap', 2);
      // tap pattern es [10], con multiplicador 2 debería ser [20]
      expect(mockVibrate).toHaveBeenCalledWith([20]);
    });

    it('debe reducir duración con multiplicador menor a 1', () => {
      triggerHapticWithIntensity('tap', 0.5);
      expect(mockVibrate).toHaveBeenCalledWith([5]);
    });
  });

  describe('funciones de feedback específicas', () => {
    it('hapticSuccess debe ejecutar patrón success', () => {
      hapticSuccess();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.success.pattern);
    });

    it('hapticError debe ejecutar patrón error', () => {
      hapticError();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.error.pattern);
    });

    it('hapticTap debe ejecutar patrón tap', () => {
      hapticTap();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.tap.pattern);
    });

    it('hapticSelect debe ejecutar patrón select', () => {
      hapticSelect();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.select.pattern);
    });

    it('hapticMilestone debe ejecutar patrón milestone', () => {
      hapticMilestone();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.milestone.pattern);
    });

    it('hapticCardFlip debe ejecutar patrón card_flip', () => {
      hapticCardFlip();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.card_flip.pattern);
    });

    it('hapticDragStart debe ejecutar patrón drag_start', () => {
      hapticDragStart();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.drag_start.pattern);
    });

    it('hapticDragEnd debe ejecutar patrón drag_end', () => {
      hapticDragEnd();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.drag_end.pattern);
    });

    it('hapticLevelUp debe ejecutar patrón level_up', () => {
      hapticLevelUp();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.level_up.pattern);
    });
  });

  describe('visualFeedback', () => {
    it('debe animar elemento con tipo shake', () => {
      const mockElement = {
        animate: vi.fn(),
      } as unknown as HTMLElement;

      visualFeedback({ element: mockElement, type: 'shake' });

      expect(mockElement.animate).toHaveBeenCalled();
    });

    it('debe animar elemento con tipo pulse', () => {
      const mockElement = {
        animate: vi.fn(),
      } as unknown as HTMLElement;

      visualFeedback({ element: mockElement, type: 'pulse' });

      expect(mockElement.animate).toHaveBeenCalled();
    });

    it('debe animar elemento con tipo flash', () => {
      const mockElement = {
        animate: vi.fn(),
      } as unknown as HTMLElement;

      visualFeedback({ element: mockElement, type: 'flash' });

      expect(mockElement.animate).toHaveBeenCalled();
    });

    it('debe respetar duración personalizada', () => {
      const mockElement = {
        animate: vi.fn(),
      } as unknown as HTMLElement;

      visualFeedback({ element: mockElement, type: 'shake', duration: 500 });

      expect(mockElement.animate).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ duration: 500 })
      );
    });
  });

  describe('hapticWithFallback', () => {
    it('debe usar vibración si está soportada', () => {
      hapticWithFallback('tap');
      expect(mockVibrate).toHaveBeenCalled();
    });

    it('debe usar fallback visual si vibración no está soportada', () => {
      setHapticEnabled(false);
      const mockElement = {
        animate: vi.fn(),
      } as unknown as HTMLElement;

      hapticWithFallback('error', mockElement);

      expect(mockElement.animate).toHaveBeenCalled();
    });
  });

  describe('useHaptic hook', () => {
    it('debe retornar todas las funciones necesarias', () => {
      const haptic = useHaptic();

      expect(haptic.isSupported).toBeDefined();
      expect(haptic.isEnabled).toBeDefined();
      expect(haptic.setEnabled).toBeDefined();
      expect(haptic.trigger).toBeDefined();
      expect(haptic.success).toBeDefined();
      expect(haptic.error).toBeDefined();
      expect(haptic.tap).toBeDefined();
      expect(haptic.select).toBeDefined();
      expect(haptic.milestone).toBeDefined();
      expect(haptic.cardFlip).toBeDefined();
      expect(haptic.dragStart).toBeDefined();
      expect(haptic.dragEnd).toBeDefined();
      expect(haptic.levelUp).toBeDefined();
      expect(haptic.stop).toBeDefined();
      expect(haptic.withFallback).toBeDefined();
      expect(haptic.visualFeedback).toBeDefined();
    });

    it('las funciones del hook deben funcionar correctamente', () => {
      const haptic = useHaptic();

      haptic.success();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.success.pattern);
    });
  });
});
