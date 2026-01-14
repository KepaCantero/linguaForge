/**
 * soundEffects - Sistema de efectos de sonido para feedback
 *
 * Proporciona feedback auditivo usando Web Audio API con síntesis de tonos.
 * No requiere archivos externos - todos los sonidos se generan programáticamente.
 *
 * Sonidos implementados:
 * - Respuestas correctas/incorrectas
 * - Subir de nivel
 * - Ganar XP
 * - Mantener racha
 * - Interacciones UI
 */

// ============================================
// TYPES
// ============================================

export type SoundId =
  | 'correct'
  | 'incorrect'
  | 'levelUp'
  | 'xpGain'
  | 'streak'
  | 'click'
  | 'flip'
  | 'complete'
  | 'notification'
  | 'whoosh';

interface SoundConfig {
  volume: number;
  duration: number;
  type: OscillatorType;
  frequency: number;
  decay: number;
  attack: number;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'linguaforge-sound-enabled';
const VOLUME_KEY = 'linguaforge-sound-volume';

// Configuraciones de sonido sintetizado
const SOUND_CONFIGS: Record<SoundId, SoundConfig> = {
  correct: {
    volume: 0.4,
    duration: 0.15,
    type: 'sine',
    frequency: 880, // A5
    attack: 0.01,
    decay: 0.1,
  },
  incorrect: {
    volume: 0.3,
    duration: 0.2,
    type: 'sawtooth',
    frequency: 150, // Bajo grave
    attack: 0.01,
    decay: 0.15,
  },
  levelUp: {
    volume: 0.5,
    duration: 0.6,
    type: 'square',
    frequency: 523.25, // C5
    attack: 0.05,
    decay: 0.3,
  },
  xpGain: {
    volume: 0.3,
    duration: 0.1,
    type: 'sine',
    frequency: 1174.66, // D6
    attack: 0.005,
    decay: 0.08,
  },
  streak: {
    volume: 0.4,
    duration: 0.3,
    type: 'triangle',
    frequency: 659.25, // E5
    attack: 0.02,
    decay: 0.2,
  },
  click: {
    volume: 0.15,
    duration: 0.05,
    type: 'sine',
    frequency: 1200,
    attack: 0.001,
    decay: 0.03,
  },
  flip: {
    volume: 0.25,
    duration: 0.1,
    type: 'triangle',
    frequency: 400,
    attack: 0.01,
    decay: 0.05,
  },
  complete: {
    volume: 0.45,
    duration: 0.5,
    type: 'sine',
    frequency: 659.25, // E5
    attack: 0.03,
    decay: 0.3,
  },
  notification: {
    volume: 0.35,
    duration: 0.2,
    type: 'sine',
    frequency: 783.99, // G5
    attack: 0.02,
    decay: 0.15,
  },
  whoosh: {
    volume: 0.2,
    duration: 0.15,
    type: 'triangle',
    frequency: 300,
    attack: 0.02,
    decay: 0.1,
  },
};

// Frecuencias para arpegios (escala mayor)
const ARPEGGIO_FREQUENCIES = [
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00, // A5
];

// ============================================
// SOUND SYNTHESIS FUNCTIONS
// ============================================

/**
 * Crea un oscilador con envelope ADSR
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createTone(
  audioContext: AudioContext,
  config: SoundConfig,
  startTime: number
): { oscillator: OscillatorNode; gainNode: GainNode } {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = config.type;
  oscillator.frequency.value = config.frequency;

  // Envelope ADSR (solo Attack y Decay para sonidos cortos)
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(config.volume, startTime + config.attack);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    startTime + config.attack + config.decay
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + config.duration);

  return { oscillator, gainNode };
}

/**
 * Sonido de respuesta correcta (tono ascendente alegre)
 */
function playCorrectSound(audioContext: AudioContext, masterGain: GainNode): void {
  const config = SOUND_CONFIGS.correct;
  const now = audioContext.currentTime;

  // Tono principal
  const osc1 = audioContext.createOscillator();
  const gain1 = audioContext.createGain();
  osc1.type = config.type;
  osc1.frequency.setValueAtTime(config.frequency, now);
  osc1.frequency.exponentialRampToValueAtTime(config.frequency * 1.5, now + config.duration);

  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(config.volume, now + config.attack);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + config.duration);

  osc1.connect(gain1);
  gain1.connect(masterGain);
  osc1.start(now);
  osc1.stop(now + config.duration);

  // Armónico para brillantez
  const osc2 = audioContext.createOscillator();
  const gain2 = audioContext.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(config.frequency * 2, now);
  osc2.frequency.exponentialRampToValueAtTime(config.frequency * 3, now + config.duration);

  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(config.volume * 0.3, now + config.attack);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + config.duration * 0.8);

  osc2.connect(gain2);
  gain2.connect(masterGain);
  osc2.start(now);
  osc2.stop(now + config.duration);
}

/**
 * Sonido de respuesta incorrecta (tono descendente grave)
 */
function playIncorrectSound(audioContext: AudioContext, masterGain: GainNode): void {
  const config = SOUND_CONFIGS.incorrect;
  const now = audioContext.currentTime;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = config.type;
  osc.frequency.setValueAtTime(config.frequency * 2, now);
  osc.frequency.exponentialRampToValueAtTime(config.frequency * 0.5, now + config.duration);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(config.volume, now + config.attack);
  gain.gain.exponentialRampToValueAtTime(0.001, now + config.duration);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + config.duration);
}

/**
 * Sonido de subir de nivel (arpegio ascendente)
 */
function playLevelUpSound(audioContext: AudioContext, masterGain: GainNode): void {
  const config = SOUND_CONFIGS.levelUp;
  const now = audioContext.currentTime;

  // Arpegio de 5 notas
  ARPEGGIO_FREQUENCIES.slice(0, 5).forEach((freq, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = config.type;
    osc.frequency.value = freq;

    const noteTime = now + index * 0.08;
    gain.gain.setValueAtTime(0, noteTime);
    gain.gain.linearRampToValueAtTime(config.volume * 0.4, noteTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(noteTime);
    osc.stop(noteTime + 0.15);
  });
}

/**
 * Sonido de ganar XP (monedas cortitas)
 */
function playXPGainSound(audioContext: AudioContext, masterGain: GainNode): void {
  const config = SOUND_CONFIGS.xpGain;
  const now = audioContext.currentTime;

  // Dos tonos rápidos
  [1, 1.25].forEach((multiplier, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = config.type;
    osc.frequency.setValueAtTime(config.frequency * multiplier, now + index * 0.05);

    gain.gain.setValueAtTime(0, now + index * 0.05);
    gain.gain.linearRampToValueAtTime(config.volume, now + index * 0.05 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.08);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now + index * 0.05);
    osc.stop(now + index * 0.05 + 0.08);
  });
}

/**
 * Sonido de racha (whoosh ascendente)
 */
function playStreakSound(audioContext: AudioContext, masterGain: GainNode): void {
  const config = SOUND_CONFIGS.streak;
  const now = audioContext.currentTime;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  osc.type = config.type;
  osc.frequency.setValueAtTime(config.frequency * 0.8, now);
  osc.frequency.exponentialRampToValueAtTime(config.frequency * 1.5, now + config.duration);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, now);
  filter.frequency.linearRampToValueAtTime(4000, now + config.duration);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(config.volume, now + config.attack);
  gain.gain.exponentialRampToValueAtTime(0.001, now + config.duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + config.duration);
}

/**
 * Sonido de click (tap corto)
 */
function playClickSound(audioContext: AudioContext, masterGain: GainNode): void {
  const config = SOUND_CONFIGS.click;
  const now = audioContext.currentTime;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = config.type;
  osc.frequency.value = config.frequency;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(config.volume, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + config.duration);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + config.duration);
}

/**
 * Sonido de voltear tarjeta (swish)
 */
function playFlipSound(audioContext: AudioContext, masterGain: GainNode): void {
  const config = SOUND_CONFIGS.flip;
  const now = audioContext.currentTime;

  // Ruido blanco filtrado (opcional, simplificado aquí)
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  osc.type = config.type;
  osc.frequency.setValueAtTime(config.frequency, now);
  osc.frequency.exponentialRampToValueAtTime(config.frequency * 2, now + config.duration);

  filter.type = 'bandpass';
  filter.frequency.value = 1000;
  filter.Q.value = 1;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(config.volume, now + config.attack);
  gain.gain.exponentialRampToValueAtTime(0.001, now + config.duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + config.duration);
}

/**
 * Sonido de completar tarea
 */
function playCompleteSound(audioContext: AudioContext, masterGain: GainNode): void {
  const config = SOUND_CONFIGS.complete;
  const now = audioContext.currentTime;

  // Acorde mayor (C, E, G)
  [1, 1.25, 1.5].forEach((multiplier, _index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = config.type;
    osc.frequency.value = config.frequency * multiplier;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(config.volume * 0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + config.duration);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + config.duration);
  });
}

/**
 * Sonido de notificación
 */
function playNotificationSound(audioContext: AudioContext, masterGain: GainNode): void {
  const config = SOUND_CONFIGS.notification;
  const now = audioContext.currentTime;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = config.type;
  osc.frequency.setValueAtTime(config.frequency, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(config.volume, now + config.attack);
  gain.gain.linearRampToValueAtTime(config.volume * 0.5, now + config.duration * 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, now + config.duration);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + config.duration);
}

/**
 * Sonido whoosh (transición)
 */
function playWhooshSound(audioContext: AudioContext, masterGain: GainNode): void {
  const config = SOUND_CONFIGS.whoosh;
  const now = audioContext.currentTime;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  osc.type = config.type;
  osc.frequency.setValueAtTime(config.frequency * 0.5, now);
  osc.frequency.exponentialRampToValueAtTime(config.frequency * 2, now + config.duration);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, now);
  filter.frequency.linearRampToValueAtTime(3000, now + config.duration);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(config.volume * 0.5, now + config.attack);
  gain.gain.exponentialRampToValueAtTime(0.001, now + config.duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + config.duration);
}

// ============================================
// SOUND PLAYER STRATEGY
// ============================================

type SoundPlayer = (audioContext: AudioContext, masterGain: GainNode) => void;

const SOUND_PLAYERS: Record<SoundId, SoundPlayer> = {
  correct: playCorrectSound,
  incorrect: playIncorrectSound,
  levelUp: playLevelUpSound,
  xpGain: playXPGainSound,
  streak: playStreakSound,
  click: playClickSound,
  flip: playFlipSound,
  complete: playCompleteSound,
  notification: playNotificationSound,
  whoosh: playWhooshSound,
};

// ============================================
// SOUND EFFECTS CLASS
// ============================================

class SoundEffectsManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private volume: number = 1.0;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Cargar preferencias guardadas
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem(STORAGE_KEY);
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === 'true';
      }

      const savedVolume = localStorage.getItem(VOLUME_KEY);
      if (savedVolume !== null) {
        this.volume = Number.parseFloat(savedVolume);
      }
    }
  }

  /**
   * Inicializa el sistema de audio
   * Debe llamarse tras interacción del usuario (política de autoplay)
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._doInit();
    return this.initPromise;
  }

  private async _doInit(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Crear contexto de audio
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Crear nodo de ganancia maestro
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);

      // Si el contexto está suspendido, intentar reanudar
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.initialized = true;
    } catch {
    }
  }

  /**
   * Verifica si el sistema está listo para reproducir sonidos
   */
  private isReady(): boolean {
    return this.enabled &&
           this.audioContext !== null &&
           this.masterGain !== null &&
           this.initialized;
  }

  /**
   * Reproduce un efecto de sonido
   */
  play(soundId: SoundId): void {
    if (!this.isReady()) {
      return;
    }

    try {
      const player = SOUND_PLAYERS[soundId];
      if (player && this.audioContext && this.masterGain) {
        player(this.audioContext, this.masterGain);
      }
    } catch {
    }
  }

  /**
   * Reproduce sonido de respuesta correcta
   */
  playCorrect(): void {
    this.play('correct');
  }

  /**
   * Reproduce sonido de respuesta incorrecta
   */
  playIncorrect(): void {
    this.play('incorrect');
  }

  /**
   * Habilita/deshabilita los sonidos
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    }
  }

  /**
   * Obtiene el estado de habilitación
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Establece el volumen global (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(VOLUME_KEY, String(this.volume));
    }
  }

  /**
   * Obtiene el volumen actual
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Verifica si está inicializado
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const soundEffects = new SoundEffectsManager();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Inicializa el sistema de sonidos
 * Llamar tras primera interacción del usuario
 */
export async function initSoundEffects(): Promise<void> {
  return soundEffects.init();
}

/**
 * Reproduce un efecto de sonido
 */
export function playSound(soundId: SoundId): void {
  soundEffects.play(soundId);
}

/**
 * Reproduce sonido de respuesta correcta
 */
export function playSoundCorrect(): void {
  soundEffects.playCorrect();
}

/**
 * Reproduce sonido de respuesta incorrecta
 */
export function playSoundIncorrect(): void {
  soundEffects.playIncorrect();
}

/**
 * Habilita/deshabilita sonidos
 */
export function setSoundEnabled(enabled: boolean): void {
  soundEffects.setEnabled(enabled);
}

/**
 * Obtiene estado de sonidos
 */
export function isSoundEnabled(): boolean {
  return soundEffects.isEnabled();
}

/**
 * Establece volumen global
 */
export function setSoundVolume(volume: number): void {
  soundEffects.setVolume(volume);
}

/**
 * Obtiene volumen global
 */
export function getSoundVolume(): number {
  return soundEffects.getVolume();
}
