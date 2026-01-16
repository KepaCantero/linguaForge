import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock useReducedMotion to disable animations in tests
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}));

// Real localStorage mock that persists data
const localStorageMock = ((): Storage => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => {
      return store[key] ?? null;
    },
    setItem: (key: string, value: string): void => {
      store[key] = value.toString();
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key: (index: number): string | null => {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  root: Document | Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  constructor() {}
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
  unobserve(): void {}
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  constructor() {}
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

global.ResizeObserver = MockResizeObserver;

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock window.YT for YouTube Player tests
class MockYTPlayer {
  element: any;
  config: any;
  state: number;
  currentTimeValue: number;
  durationValue: number;
  volumeValue: number;
  playbackRateValue: number;
  isMutedValue: boolean;

  constructor(element: any, config: any) {
    this.element = element;
    this.config = config;
    this.state = -1; // unstarted
    this.currentTimeValue = 0;
    this.durationValue = 0;
    this.volumeValue = 100;
    this.playbackRateValue = 1;
    this.isMutedValue = false;

    // Simulate onReady callback
    setTimeout(() => {
      config.events?.onReady?.({ target: this });
    }, 0);
  }

  playVideo() {
    this.state = 1; // playing
    this.config.events?.onStateChange?.({
      target: this,
      data: 1,
    });
  }

  pauseVideo() {
    this.state = 2; // paused
    this.config.events?.onStateChange?.({
      target: this,
      data: 2,
    });
  }

  getCurrentTime() {
    return this.currentTimeValue;
  }

  getDuration() {
    return this.durationValue;
  }

  seekTo(time: number, allowSeekAhead: boolean) {
    this.currentTimeValue = time;
  }

  setVolume(volume: number) {
    this.volumeValue = volume;
  }

  mute() {
    this.isMutedValue = true;
  }

  unMute() {
    this.isMutedValue = false;
  }

  setPlaybackRate(rate: number) {
    this.playbackRateValue = rate;
  }

  destroy() {
    // Cleanup
  }
}

global.YT = {
  Player: MockYTPlayer as any,
  PlayerState: {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
  },
};

// Mock fetch API for TTS tests
const mockVoices = [
  {
    id: 'fr-FR-DeniseNeural',
    name: 'Denise',
    shortName: 'DeniseNeural',
    locale: 'fr-FR',
    gender: 'female',
    quality: 'neural',
    categories: ['general'],
    personalities: ['friendly'],
    recommendedLevel: 'beginner',
  },
  {
    id: 'fr-FR-HenriNeural',
    name: 'Henri',
    shortName: 'HenriNeural',
    locale: 'fr-FR',
    gender: 'male',
    quality: 'neural',
    categories: ['general'],
    personalities: ['professional'],
    recommendedLevel: 'intermediate',
  },
];

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ voices: mockVoices }),
  })
) as any;

// Mock Clipboard API
class MockDataTransfer implements DataTransfer {
  dropEffect: DataTransfer['dropEffect'] = 'none';
  effectAllowed: DataTransfer['effectAllowed'] = 'none';
  files: FileList = {} as FileList;
  items: DataTransferItemList = {} as DataTransferItemList;
  types: string[] = [];

  private data: Record<string, string> = {};

  clearData(format?: string): void {
    if (format) {
      delete this.data[format];
    } else {
      this.data = {};
    }
  }

  getData(format: string): string {
    return this.data[format] || '';
  }

  setData(format: string, data: string): void {
    this.data[format] = data;
  }

  setDragImage(image: Element, xOffset: number, yOffset: number): void {}
}

class MockClipboardEvent extends Event implements ClipboardEvent {
  clipboardData: DataTransfer;

  constructor(type: string, eventInitDict?: ClipboardEventInit) {
    super(type, eventInitDict);
    this.clipboardData = eventInitDict?.clipboardData || new MockDataTransfer();
  }
}

global.ClipboardEvent = MockClipboardEvent as any;
global.DataTransfer = MockDataTransfer as any;

// Mock requestFullscreen for tests
Element.prototype.requestFullscreen = vi.fn(() => Promise.resolve()) as any;
Element.prototype.requestPointerLock = vi.fn(() => Promise.resolve()) as any;
document.exitFullscreen = vi.fn(() => Promise.resolve()) as any;

// Define fullscreenElement as writable
Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

// ============================================================
// Mock AudioContext for Web Speech API tests
// ============================================================

/**
 * Mock AudioBuffer for testing
 * Note: TypeScript strict mode has issues with Float32Array<ArrayBufferLike> vs Float32Array<ArrayBuffer>
 * This is a known limitation when mocking Web Audio API types in test environments
 */
// We use a partial interface to avoid type conflicts with Float32Array
class MockAudioBuffer {
  numberOfChannels: number;
  length: number;
  sampleRate: number;
  duration: number;
  private _channelData: Float32Array[];

  constructor(numberOfChannels: number, length: number, sampleRate: number) {
    this.numberOfChannels = numberOfChannels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.duration = length / sampleRate;
    this._channelData = [];

    for (let i = 0; i < numberOfChannels; i++) {
      this._channelData.push(new Float32Array(length));
    }
  }

  /**
   * Set channel data from external source (e.g., decoded WAV)
   */
  setChannelDataFromArray(channel: number, data: Float32Array): void {
    if (channel < 0 || channel >= this.numberOfChannels) {
      throw new Error(`Channel ${channel} out of range`);
    }
    this._channelData[channel] = data;
  }

  getChannelData(channel: number): Float32Array {
    if (channel < 0 || channel >= this.numberOfChannels) {
      throw new Error(`Channel ${channel} out of range`);
    }
    return this._channelData[channel];
  }

  copyFromChannel(destination: Float32Array, channelNumber: number, bufferOffset?: number): void {
    const source = this.getChannelData(channelNumber);
    const offset = bufferOffset || 0;
    for (let i = 0; i < destination.length; i++) {
      if (offset + i < source.length) {
        destination[i] = source[offset + i];
      }
    }
  }

  copyToChannel(source: Float32Array, channelNumber: number, bufferOffset?: number): void {
    const destination = this.getChannelData(channelNumber);
    const offset = bufferOffset || 0;
    for (let i = 0; i < source.length; i++) {
      if (offset + i < destination.length) {
        destination[offset + i] = source[i];
      }
    }
  }
}

/**
 * Mock AudioParam for AudioNode parameters
 */
class MockAudioParam implements AudioParam {
  automationRate: 'a-rate' | 'k-rate' = 'a-rate';
  defaultValue: number = 0;
  maxValue: number = 3.4028234663852886e38;
  minValue: number = -3.4028234663852886e38;
  value: number = 0;

  setValueAtTime(value: number, startTime: number): AudioParam { return this; }
  linearRampToValueAtTime(value: number, endTime: number): AudioParam { return this; }
  exponentialRampToValueAtTime(value: number, endTime: number): AudioParam { return this; }
  setTargetAtTime(target: number, startTime: number, timeConstant: number): AudioParam { return this; }
  setValueCurveAtTime(values: number[], startTime: number, duration: number): AudioParam { return this; }
  cancelScheduledValues(startTime: number): AudioParam { return this; }
  cancelAndHoldAtTime(cancelTime: number): AudioParam { return this; }
}

/**
 * Mock BiquadFilterNode
 */
class MockBiquadFilterNode implements BiquadFilterNode {
  readonly context: BaseAudioContext;
  readonly numberOfInputs = 1;
  readonly numberOfOutputs = 1;
  readonly channelCount: number;
  readonly channelCountMode: ChannelCountMode;
  readonly channelInterpretation: ChannelInterpretation;

  type: BiquadFilterType = 'lowpass';
  frequency: AudioParam = new MockAudioParam();
  detune: AudioParam = new MockAudioParam();
  Q: AudioParam = new MockAudioParam();
  gain: AudioParam = new MockAudioParam();

  constructor(context: BaseAudioContext) {
    this.context = context;
    this.channelCount = 2;
    this.channelCountMode = 'max';
    this.channelInterpretation = 'speakers';
  }

  connect: any = () => {};
  disconnect(): void {}
  getFrequencyResponse(): void {}

  // EventTarget methods
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }
}

/**
 * Mock AudioBufferSourceNode
 */
class MockAudioBufferSourceNode implements AudioBufferSourceNode {
  readonly context: BaseAudioContext;
  readonly numberOfInputs = 0;
  readonly numberOfOutputs = 1;
  readonly channelCount: number;
  readonly channelCountMode: ChannelCountMode;
  readonly channelInterpretation: ChannelInterpretation;

  buffer: AudioBuffer | null = null;
  detune: AudioParam = new MockAudioParam();
  loop: boolean = false;
  loopEnd: number = 0;
  loopStart: number = 0;
  playbackRate: AudioParam = new MockAudioParam();

  // EventTarget properties
  onended: any = null;

  constructor(context: BaseAudioContext) {
    this.context = context;
    this.channelCount = 2;
    this.channelCountMode = 'max';
    this.channelInterpretation = 'speakers';
  }

  start(when?: number, offset?: number, duration?: number): void {}
  stop(when?: number): void {}
  connect: any = () => {};
  disconnect(): void {}

  // EventTarget methods
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }
}

class MockAudioContext implements AudioContext {
  readonly baseLatency: number = 0;
  readonly outputLatency: number = 0;
  readonly currentTime: number = 0;
  readonly sampleRate: number = 44100;
  readonly state: AudioContextState = 'running';
  readonly audioWorklet: AudioWorklet;
  readonly destination: AudioDestinationNode;
  readonly listener: AudioListener;

  constructor() {
    this.destination = {} as AudioDestinationNode;
    this.listener = {} as AudioListener;
    this.audioWorklet = {} as AudioWorklet;
  }

  close(): Promise<void> {
    return Promise.resolve();
  }

  createBuffer(numberOfChannels: number, length: number, sampleRate: number): AudioBuffer {
    return new MockAudioBuffer(numberOfChannels, length, sampleRate) as unknown as AudioBuffer;
  }

  createBufferSource(): AudioBufferSourceNode {
    return new MockAudioBufferSourceNode(this);
  }

  createMediaStreamDestination(): MediaStreamAudioDestinationNode {
    return {
      stream: new MediaStream(),
    } as MediaStreamAudioDestinationNode;
  }

  createScriptProcessor(bufferSize?: number, numberOfInputChannels?: number, numberOfOutputChannels?: number): ScriptProcessorNode {
    return {} as ScriptProcessorNode;
  }

  suspend(): Promise<void> {
    return Promise.resolve();
  }

  resume(): Promise<void> {
    return Promise.resolve();
  }

  // Add other required methods
  createAnalyser(): AnalyserNode { return {} as AnalyserNode; }
  createBiquadFilter(): BiquadFilterNode { return new MockBiquadFilterNode(this); }
  createChannelMerger(numberOfInputs?: number): ChannelMergerNode { return {} as ChannelMergerNode; }
  createChannelSplitter(numberOfOutputs?: number): ChannelSplitterNode { return {} as ChannelSplitterNode; }
  createConvolver(): ConvolverNode { return {} as ConvolverNode; }
  createConstantSource(): ConstantSourceNode { return {} as ConstantSourceNode; }
  createDelay(maxDelayTime?: number): DelayNode { return {} as DelayNode; }
  createDynamicsCompressor(): DynamicsCompressorNode { return {} as DynamicsCompressorNode; }
  createGain(): GainNode { return {} as GainNode; }
  createIIRFilter(feedforward: number[], feedback: number[]): IIRFilterNode { return {} as IIRFilterNode; }
  createMediaElementSource(): MediaElementAudioSourceNode { return {} as MediaElementAudioSourceNode; }
  createMediaStreamSource(): MediaStreamAudioSourceNode { return {} as MediaStreamAudioSourceNode; }
  createOscillator(): OscillatorNode { return {} as OscillatorNode; }
  createPanner(): PannerNode { return {} as PannerNode; }
  createPeriodicWave(real: number[], imag: number[], constraints?: PeriodicWaveConstraints): PeriodicWave { return {} as PeriodicWave; }
  createStereoPanner(): StereoPannerNode { return {} as StereoPannerNode; }
  createWaveShaper(): WaveShaperNode { return {} as WaveShaperNode; }

  /**
   * Mock decodeAudioData that actually decodes WAV files
   */
  async decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer> {
    try {
      const view = new DataView(audioData);

      // Verify WAV format
      const riff = String.fromCharCode(
        view.getUint8(0),
        view.getUint8(1),
        view.getUint8(2),
        view.getUint8(3)
      );
      const wave = String.fromCharCode(
        view.getUint8(8),
        view.getUint8(9),
        view.getUint8(10),
        view.getUint8(11)
      );

      if (riff !== 'RIFF' || wave !== 'WAVE') {
        console.warn('Not a valid WAV file, returning empty buffer');
        return new MockAudioBuffer(1, 0, this.sampleRate) as unknown as AudioBuffer;
      }

      // Extract WAV parameters
      const numChannels = view.getUint16(22, true);
      const sampleRate = view.getUint32(24, true);
      const bitsPerSample = view.getUint16(34, true);

      // Find data chunk
      let dataOffset = 12;
      while (dataOffset < view.byteLength - 8) {
        const chunkId = String.fromCharCode(
          view.getUint8(dataOffset),
          view.getUint8(dataOffset + 1),
          view.getUint8(dataOffset + 2),
          view.getUint8(dataOffset + 3)
        );

        if (chunkId === 'data') {
          break;
        }

        const chunkSize = view.getUint32(dataOffset + 4, true);
        dataOffset += 8 + chunkSize;
      }

      if (dataOffset >= view.byteLength - 8) {
        console.warn('Data chunk not found in WAV');
        return new MockAudioBuffer(1, 0, this.sampleRate) as AudioBuffer;
      }

      const dataSize = view.getUint32(dataOffset + 4, true);
      const numSamples = dataSize / (numChannels * (bitsPerSample / 8));

      // Create AudioBuffer
      const audioBuffer = new MockAudioBuffer(numChannels, numSamples, sampleRate);

      // Read PCM data
      const bytesPerSample = bitsPerSample / 8;

      for (let channel = 0; channel < numChannels; channel++) {
        const channelData = new Float32Array(numSamples);
        let offset = dataOffset + 8 + (channel * bytesPerSample);

        for (let i = 0; i < numSamples; i++) {
          let sample = 0;

          if (bytesPerSample === 1) {
            // 8-bit unsigned
            sample = (view.getUint8(offset) - 128) / 128;
          } else if (bytesPerSample === 2) {
            // 16-bit signed
            sample = view.getInt16(offset, true) / 32768;
          } else if (bytesPerSample === 3) {
            // 24-bit signed
            const byte1 = view.getUint8(offset);
            const byte2 = view.getUint8(offset + 1);
            const byte3 = view.getUint8(offset + 2);
            const value = (byte3 << 16) | (byte2 << 8) | byte1;
            sample = (value >= 8388608 ? value - 16777216 : value) / 8388608;
          }

          channelData[i] = sample;
          offset += bytesPerSample * numChannels;
        }

        (audioBuffer as MockAudioBuffer).setChannelDataFromArray(channel, channelData);
      }

      return audioBuffer as unknown as AudioBuffer;
    } catch (error) {
      console.error('Failed to decode audio data in mock:', error);
      return new MockAudioBuffer(1, 0, this.sampleRate) as unknown as AudioBuffer;
    }
  }
  getOutputTimestamp(): AudioTimestamp { return { contextTime: 0, performanceTime: 0 }; }
  onstatechange: ((this: BaseAudioContext, ev: Event) => any) | null = null;

  // EventTarget methods
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }

  // OfflineAudioContext specific methods (we're mocking regular AudioContext)
  startRendering(): Promise<AudioBuffer> { return Promise.resolve({} as AudioBuffer); }
}

class MockOfflineAudioContext extends MockAudioContext implements OfflineAudioContext {
  _numberOfChannels: number;
  _length: number;
  _sampleRate: number;

  // OfflineAudioContext properties
  readonly length: number;
  oncomplete: ((this: OfflineAudioContext, ev: OfflineAudioCompletionEvent) => any) | null = null;

  constructor(numberOfChannels: number, length: number, sampleRate: number) {
    super();
    this._numberOfChannels = numberOfChannels;
    this._length = length;
    this._sampleRate = sampleRate;
    this.length = length;
  }

  createBufferSource(): AudioBufferSourceNode {
    return new MockAudioBufferSourceNode(this);
  }

  startRendering(): Promise<AudioBuffer> {
    return Promise.resolve(
      new MockAudioBuffer(this._numberOfChannels, this._length, this._sampleRate) as unknown as AudioBuffer
    );
  }

  // EventTarget methods (already in parent but required by interface)
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }
}

// Define AudioContext constructors
global.AudioContext = MockAudioContext as any;
global.OfflineAudioContext = MockOfflineAudioContext as any;

// Export AudioBuffer globally for tests
global.AudioBuffer = MockAudioBuffer as any;

// Mock MediaStream for Web Audio API
class MockMediaStream implements MediaStream {
  id: string = '';
  active: boolean = true;

  getAudioTracks(): MediaStreamTrack[] { return []; }
  getVideoTracks(): MediaStreamTrack[] { return []; }
  getTracks(): MediaStreamTrack[] { return []; }
  getTrackById(id: string): MediaStreamTrack | null { return null; }
  addTrack(track: MediaStreamTrack): void {}
  removeTrack(track: MediaStreamTrack): void {}
  clone(): MediaStream { return new MockMediaStream(); }

  // EventTarget methods
  addEventListener(): void {}
  dispatchEvent(): boolean { return true; }
  removeEventListener(): void {}
  onaddtrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null = null;
  onremovetrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null = null;
}

global.MediaStream = MockMediaStream as any;

// Mock MediaRecorder for audio capture
class MockMediaRecorder implements MediaRecorder {
  stream: MediaStream;
  mimeType: string = 'audio/webm';
  state: RecordingState = 'inactive';
  videoBitsPerSecond: number = 0;
  audioBitsPerSecond: number = 0;
  ondataavailable: ((this: MediaRecorder, event: BlobEvent) => void) | null = null;
  onerror: ((this: MediaRecorder, event: Event) => void) | null = null;
  onpause: ((this: MediaRecorder, event: Event) => void) | null = null;
  onresume: ((this: MediaRecorder, event: Event) => void) | null = null;
  onstart: ((this: MediaRecorder, event: Event) => void) | null = null;
  onstop: ((this: MediaRecorder, event: Event) => void) | null = null;

  constructor(stream: MediaStream) {
    this.stream = stream;
  }

  pause(): void {}
  resume(): void {}
  start(timeslice?: number): void {}
  stop(): void {}
  requestData(): void {}
  isTypeSupported(mimeType: string): boolean { return true; }
  static isTypeSupported(mimeType: string): boolean { return true; }

  // EventTarget methods
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }
}

global.MediaRecorder = MockMediaRecorder as any;
