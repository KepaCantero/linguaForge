/**
 * Motor de Sonido Contextual para Memory Bank AAA
 * Audio 3D spatializado con contextos de aprendizaje
 *
 * TAREA 2.8.3: ContextualSoundEngine
 */

import { z } from 'zod';
import { type TextureType } from './textures';

// ============================================
// TIPOS Y SCHEMAS
// ============================================

export const SoundCategorySchema = z.enum([
  'ambient',      // Sonidos ambientales de fondo
  'interaction',  // Feedback de interacción
  'success',      // Sonidos de éxito
  'error',        // Sonidos de error
  'transition',   // Transiciones entre estados
  'celebration',  // Celebraciones y logros
]);

export type SoundCategory = z.infer<typeof SoundCategorySchema>;

export const SoundProfileSchema = z.enum(['soft', 'solid', 'resonant', 'crisp', 'deep']);
export type SoundProfile = z.infer<typeof SoundProfileSchema>;

export interface SoundConfig {
  id: string;
  category: SoundCategory;
  profile: SoundProfile;
  volume: number;
  pitch: number;
  duration: number;
  loop: boolean;
  spatial: boolean;
  description: string;
}

export interface AudioContextState {
  initialized: boolean;
  muted: boolean;
  masterVolume: number;
  categoryVolumes: Record<SoundCategory, number>;
}

// ============================================
// CONFIGURACIÓN DE SONIDOS POR TEXTURA
// ============================================

const TEXTURE_SOUND_PROFILES: Record<TextureType, SoundProfile> = {
  paper: 'soft',
  wood: 'solid',
  stone: 'deep',
  glass: 'crisp',
  metal: 'resonant',
  crystal: 'crisp',
};

// ============================================
// FRECUENCIAS BASE POR PERFIL
// ============================================

const PROFILE_FREQUENCIES: Record<SoundProfile, { base: number; harmonics: number[] }> = {
  soft: { base: 440, harmonics: [1, 0.5, 0.25] },
  solid: { base: 220, harmonics: [1, 0.7, 0.4, 0.2] },
  resonant: { base: 330, harmonics: [1, 0.8, 0.6, 0.4, 0.2] },
  crisp: { base: 880, harmonics: [1, 0.3, 0.1] },
  deep: { base: 110, harmonics: [1, 0.9, 0.7, 0.5, 0.3] },
};

// ============================================
// CLASE SOUND ENGINE
// ============================================

class ContextualSoundEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private categoryGains: Map<SoundCategory, GainNode> = new Map();
  private activeOscillators: Set<OscillatorNode> = new Set();
  private state: AudioContextState = {
    initialized: false,
    muted: false,
    masterVolume: 0.5,
    categoryVolumes: {
      ambient: 0.3,
      interaction: 0.6,
      success: 0.7,
      error: 0.5,
      transition: 0.4,
      celebration: 0.8,
    },
  };

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  /**
   * Inicializa el contexto de audio (requiere interacción del usuario)
   */
  async initialize(): Promise<boolean> {
    if (this.state.initialized) return true;

    try {
      // Crear AudioContext
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('[SoundEngine] Web Audio API not supported');
        return false;
      }

      this.audioContext = new AudioContextClass();

      // Crear nodo de ganancia master
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.state.masterVolume;
      this.masterGain.connect(this.audioContext.destination);

      // Crear nodos de ganancia por categoría
      const categories: SoundCategory[] = ['ambient', 'interaction', 'success', 'error', 'transition', 'celebration'];
      for (const category of categories) {
        const gain = this.audioContext.createGain();
        gain.gain.value = this.state.categoryVolumes[category];
        gain.connect(this.masterGain);
        this.categoryGains.set(category, gain);
      }

      // Resumir contexto si está suspendido
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.state.initialized = true;
      return true;
    } catch (error) {
      console.error('[SoundEngine] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Verifica si el engine está inicializado
   */
  isInitialized(): boolean {
    return this.state.initialized;
  }

  // ============================================
  // CONTROL DE VOLUMEN
  // ============================================

  /**
   * Establece el volumen master
   */
  setMasterVolume(volume: number): void {
    this.state.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.state.masterVolume,
        this.audioContext?.currentTime || 0
      );
    }
  }

  /**
   * Establece el volumen de una categoría
   */
  setCategoryVolume(category: SoundCategory, volume: number): void {
    this.state.categoryVolumes[category] = Math.max(0, Math.min(1, volume));
    const gain = this.categoryGains.get(category);
    if (gain) {
      gain.gain.setValueAtTime(
        this.state.categoryVolumes[category],
        this.audioContext?.currentTime || 0
      );
    }
  }

  /**
   * Silencia/activa el audio
   */
  setMuted(muted: boolean): void {
    this.state.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        muted ? 0 : this.state.masterVolume,
        this.audioContext?.currentTime || 0
      );
    }
  }

  /**
   * Obtiene el estado de mute
   */
  isMuted(): boolean {
    return this.state.muted;
  }

  // ============================================
  // GENERACIÓN DE SONIDOS
  // ============================================

  /**
   * Genera un tono simple
   */
  private createTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.5
  ): OscillatorNode | null {
    if (!this.audioContext || !this.masterGain) return null;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      volume,
      this.audioContext.currentTime + 0.01
    );
    gainNode.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    this.activeOscillators.add(oscillator);

    oscillator.onended = () => {
      this.activeOscillators.delete(oscillator);
    };

    return oscillator;
  }

  /**
   * Reproduce un sonido basado en perfil de textura
   */
  playTextureSound(
    textureType: TextureType,
    category: SoundCategory = 'interaction'
  ): void {
    if (this.state.muted || !this.state.initialized) return;

    const profile = TEXTURE_SOUND_PROFILES[textureType];
    const frequencies = PROFILE_FREQUENCIES[profile];
    const categoryGain = this.categoryGains.get(category);

    if (!this.audioContext || !categoryGain) return;

    const duration = 0.15;
    const baseVolume = 0.3;

    // Crear armónicos
    frequencies.harmonics.forEach((harmonic, index) => {
      const freq = frequencies.base * (index + 1);
      const volume = baseVolume * harmonic;
      const osc = this.createTone(freq, duration, 'sine', volume);

      if (osc) {
        osc.start(this.audioContext!.currentTime);
        osc.stop(this.audioContext!.currentTime + duration);
      }
    });
  }

  // ============================================
  // SONIDOS CONTEXTUALES
  // ============================================

  /**
   * Sonido de éxito (respuesta correcta)
   */
  playSuccess(): void {
    if (this.state.muted || !this.state.initialized) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (acorde mayor)
    const duration = 0.2;

    notes.forEach((freq, index) => {
      const osc = this.createTone(freq, duration, 'sine', 0.3);
      if (osc && this.audioContext) {
        osc.start(this.audioContext.currentTime + index * 0.05);
        osc.stop(this.audioContext.currentTime + duration + index * 0.05);
      }
    });
  }

  /**
   * Sonido de error (respuesta incorrecta)
   */
  playError(): void {
    if (this.state.muted || !this.state.initialized) return;

    const notes = [311.13, 293.66]; // Eb4, D4 (tensión)
    const duration = 0.3;

    notes.forEach((freq, index) => {
      const osc = this.createTone(freq, duration, 'triangle', 0.25);
      if (osc && this.audioContext) {
        osc.start(this.audioContext.currentTime + index * 0.1);
        osc.stop(this.audioContext.currentTime + duration + index * 0.1);
      }
    });
  }

  /**
   * Sonido de tap/click
   */
  playTap(): void {
    if (this.state.muted || !this.state.initialized) return;

    const osc = this.createTone(800, 0.05, 'sine', 0.2);
    if (osc && this.audioContext) {
      osc.start(this.audioContext.currentTime);
      osc.stop(this.audioContext.currentTime + 0.05);
    }
  }

  /**
   * Sonido de voltear tarjeta
   */
  playCardFlip(): void {
    if (this.state.muted || !this.state.initialized) return;

    const notes = [400, 600];
    const duration = 0.08;

    notes.forEach((freq, index) => {
      const osc = this.createTone(freq, duration, 'sine', 0.15);
      if (osc && this.audioContext) {
        osc.start(this.audioContext.currentTime + index * 0.03);
        osc.stop(this.audioContext.currentTime + duration + index * 0.03);
      }
    });
  }

  /**
   * Sonido de celebración (logro)
   */
  playCelebration(): void {
    if (this.state.muted || !this.state.initialized) return;

    // Fanfarria ascendente
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880]; // C5 a A5
    const duration = 0.15;

    notes.forEach((freq, index) => {
      const osc = this.createTone(freq, duration * 1.5, 'sine', 0.25);
      if (osc && this.audioContext) {
        osc.start(this.audioContext.currentTime + index * 0.08);
        osc.stop(this.audioContext.currentTime + duration * 1.5 + index * 0.08);
      }
    });
  }

  /**
   * Sonido de transición
   */
  playTransition(): void {
    if (this.state.muted || !this.state.initialized) return;

    const osc = this.createTone(440, 0.2, 'sine', 0.15);
    if (osc && this.audioContext) {
      // Sweep de frecuencia
      osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
      osc.frequency.linearRampToValueAtTime(
        660,
        this.audioContext.currentTime + 0.2
      );
      osc.start(this.audioContext.currentTime);
      osc.stop(this.audioContext.currentTime + 0.2);
    }
  }

  /**
   * Sonido de nivel completado
   */
  playLevelUp(): void {
    if (this.state.muted || !this.state.initialized) return;

    // Acorde mayor ascendente
    const chords = [
      [261.63, 329.63, 392.00], // C4
      [329.63, 415.30, 493.88], // E4
      [392.00, 493.88, 587.33], // G4
      [523.25, 659.25, 783.99], // C5
    ];

    chords.forEach((chord, chordIndex) => {
      chord.forEach((freq) => {
        const osc = this.createTone(freq, 0.3, 'sine', 0.2);
        if (osc && this.audioContext) {
          osc.start(this.audioContext.currentTime + chordIndex * 0.15);
          osc.stop(this.audioContext.currentTime + 0.3 + chordIndex * 0.15);
        }
      });
    });
  }

  // ============================================
  // SONIDOS DE MATERIAL
  // ============================================

  /**
   * Sonido de madera
   */
  playWood(): void {
    this.playTextureSound('wood', 'interaction');
  }

  /**
   * Sonido de metal
   */
  playMetal(): void {
    this.playTextureSound('metal', 'interaction');
  }

  /**
   * Sonido de cristal
   */
  playGlass(): void {
    this.playTextureSound('glass', 'interaction');
  }

  /**
   * Sonido de papel
   */
  playPaper(): void {
    this.playTextureSound('paper', 'interaction');
  }

  /**
   * Sonido de piedra
   */
  playStone(): void {
    this.playTextureSound('stone', 'interaction');
  }

  // ============================================
  // LIMPIEZA
  // ============================================

  /**
   * Detiene todos los sonidos activos
   */
  stopAll(): void {
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // Ya detenido
      }
    });
    this.activeOscillators.clear();
  }

  /**
   * Limpia el contexto de audio
   */
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

  /**
   * Obtiene el estado actual
   */
  getState(): AudioContextState {
    return { ...this.state };
  }
}

// ============================================
// INSTANCIA SINGLETON
// ============================================

let soundEngineInstance: ContextualSoundEngine | null = null;

/**
 * Obtiene la instancia del motor de sonido
 */
export function getSoundEngine(): ContextualSoundEngine {
  if (!soundEngineInstance) {
    soundEngineInstance = new ContextualSoundEngine();
  }
  return soundEngineInstance;
}

// ============================================
// HOOK PARA REACT
// ============================================

/**
 * Hook para usar el motor de sonido en componentes React
 *
 * Uso:
 * const sound = useSoundEngine();
 * await sound.initialize();
 * sound.playSuccess();
 */
export function useSoundEngine() {
  const engine = getSoundEngine();

  return {
    initialize: () => engine.initialize(),
    isInitialized: () => engine.isInitialized(),
    setMasterVolume: (v: number) => engine.setMasterVolume(v),
    setCategoryVolume: (c: SoundCategory, v: number) => engine.setCategoryVolume(c, v),
    setMuted: (m: boolean) => engine.setMuted(m),
    isMuted: () => engine.isMuted(),
    getState: () => engine.getState(),
    // Sonidos contextuales
    playSuccess: () => engine.playSuccess(),
    playError: () => engine.playError(),
    playTap: () => engine.playTap(),
    playCardFlip: () => engine.playCardFlip(),
    playCelebration: () => engine.playCelebration(),
    playTransition: () => engine.playTransition(),
    playLevelUp: () => engine.playLevelUp(),
    // Sonidos de material
    playWood: () => engine.playWood(),
    playMetal: () => engine.playMetal(),
    playGlass: () => engine.playGlass(),
    playPaper: () => engine.playPaper(),
    playStone: () => engine.playStone(),
    playTextureSound: (t: TextureType, c?: SoundCategory) => engine.playTextureSound(t, c),
    // Control
    stopAll: () => engine.stopAll(),
    dispose: () => engine.dispose(),
  };
}

// ============================================
// EXPORTACIONES
// ============================================

export { ContextualSoundEngine };
export default getSoundEngine;
