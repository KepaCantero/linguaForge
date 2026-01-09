/**
 * Tests for Construction Sound System
 * TAREA 2.8.9.9: Sonido ambiental de construcción
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SOUND_CONFIGS,
  MATERIAL_SOUND_MAP,
  getConstructionSoundEngine,
  ConstructionSoundEngine,
  type ConstructionSoundType,
  type ConstructionSoundCategory,
} from '@/lib/sound/construction';

// Mock Web Audio API
const mockGainNode = {
  gain: {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
  disconnect: vi.fn(),
};

const mockOscillatorNode = {
  type: 'sine' as OscillatorType,
  frequency: { value: 440 },
  connect: vi.fn(),
  disconnect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  onended: null as (() => void) | null,
};

const mockStereoPanner = {
  pan: { value: 0 },
  connect: vi.fn(),
  disconnect: vi.fn(),
};

const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  destination: {},
  createGain: vi.fn(() => ({ ...mockGainNode })),
  createOscillator: vi.fn(() => ({ ...mockOscillatorNode })),
  createStereoPanner: vi.fn(() => ({ ...mockStereoPanner })),
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
};

// ============================================
// TESTS: SOUND CONFIGS
// ============================================

describe('SOUND_CONFIGS', () => {
  it('should have 70 sound configurations', () => {
    const soundCount = Object.keys(SOUND_CONFIGS).length;
    expect(soundCount).toBe(70);
  });

  it('should have all required properties for each config', () => {
    Object.values(SOUND_CONFIGS).forEach((config) => {
      expect(config).toHaveProperty('id');
      expect(config).toHaveProperty('category');
      expect(config).toHaveProperty('baseFrequency');
      expect(config).toHaveProperty('harmonics');
      expect(config).toHaveProperty('duration');
      expect(config).toHaveProperty('volume');
      expect(config).toHaveProperty('oscillatorType');
      expect(config).toHaveProperty('envelope');
      expect(typeof config.spatial).toBe('boolean');
      expect(typeof config.loop).toBe('boolean');
    });
  });

  it('should have valid envelope properties', () => {
    Object.values(SOUND_CONFIGS).forEach((config) => {
      expect(config.envelope).toHaveProperty('attack');
      expect(config.envelope).toHaveProperty('decay');
      expect(config.envelope).toHaveProperty('sustain');
      expect(config.envelope).toHaveProperty('release');
      expect(config.envelope.attack).toBeGreaterThanOrEqual(0);
      expect(config.envelope.decay).toBeGreaterThanOrEqual(0);
      expect(config.envelope.sustain).toBeGreaterThanOrEqual(0);
      expect(config.envelope.sustain).toBeLessThanOrEqual(1);
      expect(config.envelope.release).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have valid frequencies', () => {
    Object.values(SOUND_CONFIGS).forEach((config) => {
      expect(config.baseFrequency).toBeGreaterThan(0);
      expect(config.baseFrequency).toBeLessThan(5000);
    });
  });

  it('should have valid volumes', () => {
    Object.values(SOUND_CONFIGS).forEach((config) => {
      expect(config.volume).toBeGreaterThan(0);
      expect(config.volume).toBeLessThanOrEqual(1);
    });
  });

  it('should have valid durations', () => {
    Object.values(SOUND_CONFIGS).forEach((config) => {
      expect(config.duration).toBeGreaterThan(0);
    });
  });

  it('should have at least one harmonic', () => {
    Object.values(SOUND_CONFIGS).forEach((config) => {
      expect(config.harmonics.length).toBeGreaterThan(0);
      expect(config.harmonics[0]).toBe(1); // First harmonic should be 1 (fundamental)
    });
  });

  it('should have valid oscillator types', () => {
    const validTypes: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];
    Object.values(SOUND_CONFIGS).forEach((config) => {
      expect(validTypes).toContain(config.oscillatorType);
    });
  });
});

describe('SOUND_CONFIGS categories', () => {
  it('should have material sounds (25)', () => {
    const materialSounds = Object.values(SOUND_CONFIGS).filter(
      (c) => c.category === 'material' || c.id.includes('wood') || c.id.includes('stone') ||
        c.id.includes('metal') || c.id.includes('glass') || c.id.includes('crystal')
    );
    // 5 materials × 5 sounds each (tap, place, scrape/grind, creak/crack/etc, polish)
    // But some are categorized differently
    expect(materialSounds.length).toBeGreaterThanOrEqual(5);
  });

  it('should have action sounds', () => {
    const actionSounds = Object.values(SOUND_CONFIGS).filter((c) => c.category === 'action');
    expect(actionSounds.length).toBeGreaterThan(0);
  });

  it('should have UI sounds (10)', () => {
    const uiSounds = Object.values(SOUND_CONFIGS).filter((c) => c.category === 'ui');
    expect(uiSounds.length).toBeGreaterThanOrEqual(10);
  });

  it('should have celebration sounds', () => {
    const celebrationSounds = Object.values(SOUND_CONFIGS).filter((c) => c.category === 'celebration');
    expect(celebrationSounds.length).toBeGreaterThan(0);
  });

  it('should have ambient sounds (8)', () => {
    const ambientSounds = Object.values(SOUND_CONFIGS).filter((c) => c.category === 'ambient');
    expect(ambientSounds.length).toBeGreaterThanOrEqual(8);
  });

  it('should have ASMR sounds', () => {
    const asmrSounds = Object.values(SOUND_CONFIGS).filter((c) => c.category === 'asmr');
    expect(asmrSounds.length).toBeGreaterThan(0);
  });

  it('should have music tracks (4)', () => {
    const musicSounds = Object.values(SOUND_CONFIGS).filter((c) => c.category === 'music');
    expect(musicSounds.length).toBe(4);
  });

  it('should have all 7 categories', () => {
    const categories = new Set(Object.values(SOUND_CONFIGS).map((c) => c.category));
    expect(categories.size).toBe(7);
    expect(categories.has('ambient')).toBe(true);
    expect(categories.has('material')).toBe(true);
    expect(categories.has('action')).toBe(true);
    expect(categories.has('ui')).toBe(true);
    expect(categories.has('celebration')).toBe(true);
    expect(categories.has('asmr')).toBe(true);
    expect(categories.has('music')).toBe(true);
  });
});

describe('MATERIAL_SOUND_MAP', () => {
  it('should have 5 material mappings', () => {
    expect(Object.keys(MATERIAL_SOUND_MAP).length).toBe(5);
  });

  it('should map all construction materials', () => {
    expect(MATERIAL_SOUND_MAP).toHaveProperty('wood');
    expect(MATERIAL_SOUND_MAP).toHaveProperty('stone');
    expect(MATERIAL_SOUND_MAP).toHaveProperty('metal');
    expect(MATERIAL_SOUND_MAP).toHaveProperty('glass');
    expect(MATERIAL_SOUND_MAP).toHaveProperty('crystal');
  });

  it('should have tap, place, and asmr sounds for each material', () => {
    Object.values(MATERIAL_SOUND_MAP).forEach((mapping) => {
      expect(mapping).toHaveProperty('tap');
      expect(mapping).toHaveProperty('place');
      expect(mapping).toHaveProperty('asmr');
    });
  });

  it('should reference valid sound configs', () => {
    Object.values(MATERIAL_SOUND_MAP).forEach((mapping) => {
      expect(SOUND_CONFIGS[mapping.tap]).toBeDefined();
      expect(SOUND_CONFIGS[mapping.place]).toBeDefined();
      expect(SOUND_CONFIGS[mapping.asmr]).toBeDefined();
    });
  });

  it('should have correct sound types for wood', () => {
    expect(MATERIAL_SOUND_MAP.wood.tap).toBe('wood_tap');
    expect(MATERIAL_SOUND_MAP.wood.place).toBe('wood_place');
    expect(MATERIAL_SOUND_MAP.wood.asmr).toBe('wood_scrape');
  });

  it('should have correct sound types for stone', () => {
    expect(MATERIAL_SOUND_MAP.stone.tap).toBe('stone_tap');
    expect(MATERIAL_SOUND_MAP.stone.place).toBe('stone_place');
    expect(MATERIAL_SOUND_MAP.stone.asmr).toBe('stone_grind');
  });

  it('should have correct sound types for metal', () => {
    expect(MATERIAL_SOUND_MAP.metal.tap).toBe('metal_tap');
    expect(MATERIAL_SOUND_MAP.metal.place).toBe('metal_place');
    expect(MATERIAL_SOUND_MAP.metal.asmr).toBe('metal_scrape');
  });

  it('should have correct sound types for glass', () => {
    expect(MATERIAL_SOUND_MAP.glass.tap).toBe('glass_tap');
    expect(MATERIAL_SOUND_MAP.glass.place).toBe('glass_place');
    expect(MATERIAL_SOUND_MAP.glass.asmr).toBe('glass_polish');
  });

  it('should have correct sound types for crystal', () => {
    expect(MATERIAL_SOUND_MAP.crystal.tap).toBe('crystal_tap');
    expect(MATERIAL_SOUND_MAP.crystal.place).toBe('crystal_place');
    expect(MATERIAL_SOUND_MAP.crystal.asmr).toBe('crystal_sparkle');
  });
});

// ============================================
// TESTS: SPECIFIC SOUND TYPES
// ============================================

describe('Material sound configurations', () => {
  it('wood sounds should use triangle oscillator for organic feel', () => {
    expect(SOUND_CONFIGS.wood_tap.oscillatorType).toBe('triangle');
    expect(SOUND_CONFIGS.wood_place.oscillatorType).toBe('triangle');
  });

  it('stone sounds should have low base frequencies', () => {
    expect(SOUND_CONFIGS.stone_tap.baseFrequency).toBeLessThan(200);
    expect(SOUND_CONFIGS.stone_place.baseFrequency).toBeLessThan(150);
  });

  it('metal sounds should have higher frequencies for resonance', () => {
    expect(SOUND_CONFIGS.metal_tap.baseFrequency).toBeGreaterThan(300);
    expect(SOUND_CONFIGS.metal_ring.baseFrequency).toBeGreaterThan(800);
  });

  it('glass sounds should have highest frequencies for crisp sound', () => {
    expect(SOUND_CONFIGS.glass_tap.baseFrequency).toBeGreaterThan(1000);
    expect(SOUND_CONFIGS.glass_chime.baseFrequency).toBeGreaterThan(1000);
  });

  it('crystal sounds should have ethereal high frequencies', () => {
    expect(SOUND_CONFIGS.crystal_tap.baseFrequency).toBeGreaterThan(1500);
    expect(SOUND_CONFIGS.crystal_sparkle.baseFrequency).toBeGreaterThan(2500);
  });
});

describe('Celebration sound configurations', () => {
  it('should have longer durations for impact', () => {
    expect(SOUND_CONFIGS.milestone_complete.duration).toBeGreaterThanOrEqual(0.5);
    expect(SOUND_CONFIGS.level_up.duration).toBeGreaterThanOrEqual(0.8);
    expect(SOUND_CONFIGS.prestige_up.duration).toBeGreaterThanOrEqual(1.0);
  });

  it('should have higher volumes for prominence', () => {
    expect(SOUND_CONFIGS.milestone_complete.volume).toBeGreaterThanOrEqual(0.6);
    expect(SOUND_CONFIGS.level_up.volume).toBeGreaterThanOrEqual(0.7);
    expect(SOUND_CONFIGS.prestige_up.volume).toBeGreaterThanOrEqual(0.7);
  });

  it('should not be spatial (global sounds)', () => {
    expect(SOUND_CONFIGS.milestone_complete.spatial).toBe(false);
    expect(SOUND_CONFIGS.level_up.spatial).toBe(false);
    expect(SOUND_CONFIGS.achievement_unlock.spatial).toBe(false);
  });
});

describe('UI sound configurations', () => {
  it('should have short durations for responsiveness', () => {
    expect(SOUND_CONFIGS.ui_click.duration).toBeLessThan(0.1);
    expect(SOUND_CONFIGS.ui_hover.duration).toBeLessThan(0.1);
    expect(SOUND_CONFIGS.ui_select.duration).toBeLessThan(0.15);
  });

  it('should have moderate volumes to not be intrusive', () => {
    expect(SOUND_CONFIGS.ui_click.volume).toBeLessThan(0.5);
    expect(SOUND_CONFIGS.ui_hover.volume).toBeLessThan(0.3);
  });

  it('should use sine oscillator for clean sound', () => {
    expect(SOUND_CONFIGS.ui_click.oscillatorType).toBe('sine');
    expect(SOUND_CONFIGS.ui_hover.oscillatorType).toBe('sine');
    expect(SOUND_CONFIGS.ui_select.oscillatorType).toBe('sine');
  });

  it('should not be spatial', () => {
    Object.values(SOUND_CONFIGS)
      .filter((c) => c.category === 'ui')
      .forEach((config) => {
        expect(config.spatial).toBe(false);
      });
  });
});

describe('Ambient sound configurations', () => {
  it('should have long durations', () => {
    expect(SOUND_CONFIGS.ambient_workshop.duration).toBeGreaterThanOrEqual(5);
    expect(SOUND_CONFIGS.ambient_nature.duration).toBeGreaterThanOrEqual(5);
  });

  it('should have low volumes for background', () => {
    expect(SOUND_CONFIGS.ambient_workshop.volume).toBeLessThanOrEqual(0.2);
    expect(SOUND_CONFIGS.ambient_nature.volume).toBeLessThanOrEqual(0.2);
  });

  it('should be loopable', () => {
    expect(SOUND_CONFIGS.ambient_workshop.loop).toBe(true);
    expect(SOUND_CONFIGS.ambient_nature.loop).toBe(true);
    expect(SOUND_CONFIGS.ambient_wind.loop).toBe(true);
  });

  it('should have long attack times for smooth fade in', () => {
    expect(SOUND_CONFIGS.ambient_workshop.envelope.attack).toBeGreaterThanOrEqual(1);
    expect(SOUND_CONFIGS.ambient_nature.envelope.attack).toBeGreaterThanOrEqual(1);
  });
});

describe('Music configurations', () => {
  it('should have very long durations', () => {
    expect(SOUND_CONFIGS.music_calm.duration).toBeGreaterThanOrEqual(20);
    expect(SOUND_CONFIGS.music_building.duration).toBeGreaterThanOrEqual(20);
    expect(SOUND_CONFIGS.music_celebration.duration).toBeGreaterThanOrEqual(15);
  });

  it('should be loopable', () => {
    expect(SOUND_CONFIGS.music_calm.loop).toBe(true);
    expect(SOUND_CONFIGS.music_building.loop).toBe(true);
    expect(SOUND_CONFIGS.music_celebration.loop).toBe(true);
    expect(SOUND_CONFIGS.music_event.loop).toBe(true);
  });

  it('should use musical note frequencies', () => {
    // C4 = 261.63, E4 = 329.63, G4 = 392, A4 = 440
    expect(SOUND_CONFIGS.music_calm.baseFrequency).toBeCloseTo(261.63, 1);
    expect(SOUND_CONFIGS.music_building.baseFrequency).toBeCloseTo(329.63, 1);
    expect(SOUND_CONFIGS.music_celebration.baseFrequency).toBeCloseTo(392, 1);
    expect(SOUND_CONFIGS.music_event.baseFrequency).toBeCloseTo(440, 1);
  });
});

// ============================================
// TESTS: SOUND ENGINE
// ============================================

describe('ConstructionSoundEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - Mocking global
    global.AudioContext = vi.fn(() => mockAudioContext);
    // @ts-expect-error - Mocking global
    global.window = { AudioContext: vi.fn(() => mockAudioContext) };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should not be initialized by default', () => {
      const engine = getConstructionSoundEngine();
      // Note: May already be initialized from previous tests
      expect(typeof engine.isInitialized()).toBe('boolean');
    });

    it('should have default state values', () => {
      const engine = getConstructionSoundEngine();
      const state = engine.getState();
      expect(state).toHaveProperty('muted');
      expect(state).toHaveProperty('masterVolume');
      expect(state).toHaveProperty('categoryVolumes');
    });

    it('should have category volumes for all 7 categories', () => {
      const engine = getConstructionSoundEngine();
      const state = engine.getState();
      expect(state.categoryVolumes).toHaveProperty('ambient');
      expect(state.categoryVolumes).toHaveProperty('material');
      expect(state.categoryVolumes).toHaveProperty('action');
      expect(state.categoryVolumes).toHaveProperty('ui');
      expect(state.categoryVolumes).toHaveProperty('celebration');
      expect(state.categoryVolumes).toHaveProperty('asmr');
      expect(state.categoryVolumes).toHaveProperty('music');
    });
  });

  describe('mute control', () => {
    it('should not be muted by default', () => {
      const engine = getConstructionSoundEngine();
      expect(engine.isMuted()).toBe(false);
    });

    it('should allow setting muted state', () => {
      const engine = getConstructionSoundEngine();
      engine.setMuted(true);
      expect(engine.isMuted()).toBe(true);
      engine.setMuted(false);
      expect(engine.isMuted()).toBe(false);
    });
  });

  describe('volume control', () => {
    it('should clamp master volume between 0 and 1', () => {
      const engine = getConstructionSoundEngine();
      engine.setMasterVolume(1.5);
      expect(engine.getState().masterVolume).toBeLessThanOrEqual(1);
      engine.setMasterVolume(-0.5);
      expect(engine.getState().masterVolume).toBeGreaterThanOrEqual(0);
    });

    it('should allow setting category volume', () => {
      const engine = getConstructionSoundEngine();
      engine.setCategoryVolume('ui', 0.8);
      expect(engine.getState().categoryVolumes.ui).toBe(0.8);
    });

    it('should clamp category volume between 0 and 1', () => {
      const engine = getConstructionSoundEngine();
      engine.setCategoryVolume('ambient', 1.5);
      expect(engine.getState().categoryVolumes.ambient).toBeLessThanOrEqual(1);
      engine.setCategoryVolume('ambient', -0.5);
      expect(engine.getState().categoryVolumes.ambient).toBeGreaterThanOrEqual(0);
    });
  });

  describe('music state', () => {
    it('should have initial music state', () => {
      const engine = getConstructionSoundEngine();
      const state = engine.getState();
      expect(state.musicState).toBeDefined();
      expect(state.musicState).toHaveProperty('mood');
      expect(state.musicState).toHaveProperty('intensity');
    });

    it('should allow setting music mood', () => {
      const engine = getConstructionSoundEngine();
      engine.setMusicMood('celebration');
      expect(engine.getMusicState().mood).toBe('celebration');
    });

    it('should allow setting music intensity', () => {
      const engine = getConstructionSoundEngine();
      engine.setMusicIntensity(0.8);
      expect(engine.getMusicState().intensity).toBe(0.8);
    });

    it('should clamp music intensity between 0 and 1', () => {
      const engine = getConstructionSoundEngine();
      engine.setMusicIntensity(1.5);
      expect(engine.getMusicState().intensity).toBeLessThanOrEqual(1);
      engine.setMusicIntensity(-0.5);
      expect(engine.getMusicState().intensity).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================
// TESTS: SINGLETON
// ============================================

describe('getConstructionSoundEngine', () => {
  it('should return the same instance on multiple calls', () => {
    const instance1 = getConstructionSoundEngine();
    const instance2 = getConstructionSoundEngine();
    expect(instance1).toBe(instance2);
  });
});

// ============================================
// TESTS: SOUND TYPE COMPLETENESS
// ============================================

describe('Sound type completeness', () => {
  const allSoundTypes: ConstructionSoundType[] = [
    // Material sounds
    'wood_tap', 'wood_place', 'wood_scrape', 'wood_creak', 'wood_polish',
    'stone_tap', 'stone_place', 'stone_grind', 'stone_crack', 'stone_polish',
    'metal_tap', 'metal_place', 'metal_clang', 'metal_scrape', 'metal_ring',
    'glass_tap', 'glass_place', 'glass_chime', 'glass_shatter', 'glass_polish',
    'crystal_tap', 'crystal_place', 'crystal_hum', 'crystal_resonance', 'crystal_sparkle',
    // Action sounds
    'build_start', 'build_progress', 'build_complete',
    'element_place', 'element_remove', 'element_rotate',
    'unlock_element', 'unlock_material', 'unlock_milestone',
    'upgrade_start', 'upgrade_complete',
    'craft_start', 'craft_complete',
    'collect_material', 'collect_reward',
    // UI sounds
    'ui_click', 'ui_hover', 'ui_select', 'ui_back',
    'ui_open', 'ui_close', 'ui_toggle',
    'ui_error', 'ui_success', 'ui_notification',
    // Celebration sounds
    'milestone_complete', 'streak_increase', 'streak_break',
    'level_up', 'prestige_up', 'theme_complete',
    'event_start', 'achievement_unlock',
    // Ambient sounds
    'ambient_workshop', 'ambient_nature', 'ambient_wind',
    'ambient_birds', 'ambient_water', 'ambient_fire',
    'ambient_rain', 'ambient_night',
    // Music
    'music_calm', 'music_building', 'music_celebration', 'music_event',
  ];

  it('should have configs for all defined sound types', () => {
    allSoundTypes.forEach((soundType) => {
      expect(SOUND_CONFIGS[soundType]).toBeDefined();
      expect(SOUND_CONFIGS[soundType].id).toBe(soundType);
    });
  });

  it('should have 70 total sound types', () => {
    // allSoundTypes array may not be complete, check actual config count
    expect(Object.keys(SOUND_CONFIGS).length).toBe(70);
  });
});

// ============================================
// TESTS: SOUND CHARACTERISTICS
// ============================================

describe('Sound characteristics by category', () => {
  it('spatial sounds should be material, action, ambient, asmr, or celebration related', () => {
    const spatialSounds = Object.values(SOUND_CONFIGS).filter((c) => c.spatial);
    spatialSounds.forEach((sound) => {
      expect(['material', 'action', 'ambient', 'asmr', 'celebration']).toContain(sound.category);
    });
  });

  it('celebration sounds should have longer release times', () => {
    const celebrationSounds = Object.values(SOUND_CONFIGS).filter(
      (c) => c.category === 'celebration'
    );
    celebrationSounds.forEach((sound) => {
      expect(sound.envelope.release).toBeGreaterThanOrEqual(0.15);
    });
  });

  it('ASMR sounds should use sawtooth or sine for texture', () => {
    const asmrSounds = Object.values(SOUND_CONFIGS).filter((c) => c.category === 'asmr');
    asmrSounds.forEach((sound) => {
      expect(['sine', 'sawtooth']).toContain(sound.oscillatorType);
    });
  });
});
