/**
 * Mock Audio Generator for Testing
 * Generates valid WAV audio buffers for testing audio quality validation
 *
 * This helper creates minimal valid WAV files with proper headers and audio data
 * that can be decoded by Web Audio API's decodeAudioData() method.
 */

/**
 * Generates a valid WAV format ArrayBuffer with sine wave audio
 * @param durationSeconds - Duration of audio in seconds
 * @param sampleRate - Sample rate in Hz (default: 24000 for OpenAI TTS)
 * @param frequency - Frequency of sine wave in Hz (default: 440Hz - A4 note)
 * @param amplitude - Amplitude of sine wave (0.0 to 1.0, default: 0.5)
 * @returns Valid WAV ArrayBuffer
 */
export function generateMockAudioBuffer(
  durationSeconds: number = 1.0,
  sampleRate: number = 24000,
  frequency: number = 440,
  amplitude: number = 0.5
): ArrayBuffer {
  // Validate inputs
  const duration = Math.max(0.1, Math.min(durationSeconds, 5.0)); // 0.1s to 5s
  const rate = Math.max(8000, Math.min(sampleRate, 48000)); // 8kHz to 48kHz
  const amp = Math.max(0.0, Math.min(amplitude, 1.0)); // 0.0 to 1.0

  // Calculate audio data size
  const numChannels = 1; // Mono
  const bitsPerSample = 16; // 16-bit PCM
  const bytesPerSample = bitsPerSample / 8;
  const numSamples = Math.floor(duration * rate);
  const dataSize = numSamples * numChannels * bytesPerSample;

  // WAV file size = header (44 bytes) + data
  const fileSize = 44 + dataSize;

  // Create buffer
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // ============================================================
  // WAV HEADER (44 bytes)
  // ============================================================

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF'); // ChunkID
  view.setUint32(4, fileSize - 8, true); // ChunkSize (file size - 8)
  writeString(view, 8, 'WAVE'); // Format

  // fmt sub-chunk
  writeString(view, 12, 'fmt '); // Subchunk1ID
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, rate, true); // SampleRate
  view.setUint32(28, rate * numChannels * bytesPerSample, true); // ByteRate
  view.setUint16(32, numChannels * bytesPerSample, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data'); // Subchunk2ID
  view.setUint32(40, dataSize, true); // Subchunk2Size

  // ============================================================
  // AUDIO DATA (16-bit PCM samples)
  // ============================================================

  let offset = 44; // Start of audio data

  for (let i = 0; i < numSamples; i++) {
    // Generate sine wave sample
    const t = i / rate;
    const sample = amp * Math.sin(2 * Math.PI * frequency * t);

    // Convert to 16-bit signed integer
    const intSample = Math.floor(sample * 32767);

    // Write little-endian 16-bit sample
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return buffer;
}

/**
 * Generates a more complex WAV with multiple frequencies
 * Simulates speech-like audio with varying frequencies
 * Optimized to pass AAA quality validation
 */
export function generateMockSpeechBuffer(
  durationSeconds: number = 1.5,
  sampleRate: number = 24000
): ArrayBuffer {
  const duration = Math.max(0.1, Math.min(durationSeconds, 5.0));
  const rate = Math.max(8000, Math.min(sampleRate, 48000));

  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const numSamples = Math.floor(duration * rate);
  const dataSize = numSamples * numChannels * bytesPerSample;
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // Write WAV header (same as above)
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Generate speech-like audio with enhanced prosody characteristics
  let offset = 44;
  const baseFrequency = 150;
  const amplitude = 0.7;

  for (let i = 0; i < numSamples; i++) {
    const t = i / rate;

    // Create speech-like variation with multiple frequencies
    const fundamental = Math.sin(2 * Math.PI * baseFrequency * t);
    const harmonic2 = Math.sin(2 * Math.PI * baseFrequency * 2 * t) * 0.5;
    const harmonic3 = Math.sin(2 * Math.PI * baseFrequency * 3 * t) * 0.3;

    // Add formant-like characteristics
    const formant1 = Math.sin(2 * Math.PI * 800 * t) * 0.25;
    const formant2 = Math.sin(2 * Math.PI * 1200 * t) * 0.2;
    const formant3 = Math.sin(2 * Math.PI * 2500 * t) * 0.15;

    // Enhanced amplitude modulation for better prosody score
    // Use slower modulation (2-3 Hz) to simulate speech intonation patterns
    const slowModulation = 0.6 + 0.4 * Math.sin(2 * Math.PI * 2.5 * t);
    const fastModulation = 0.9 + 0.1 * Math.sin(2 * Math.PI * 8 * t);
    const modulation = slowModulation * fastModulation;

    // Add frequency modulation to simulate pitch variations
    const pitchVariation = Math.sin(2 * Math.PI * 3 * t) * 0.1;
    const freqModFundamental = Math.sin(2 * Math.PI * (baseFrequency + pitchVariation * 50) * t);

    // Combine all components
    const sample = amplitude * modulation * (
      freqModFundamental +
      harmonic2 +
      harmonic3 +
      formant1 +
      formant2 +
      formant3
    );

    // Convert to 16-bit signed integer
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));

    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return buffer;
}

/**
 * Generates WAV with specific quality characteristics for testing
 * @param quality - 'high' | 'medium' | 'low'
 */
export function generateQualityTestBuffer(
  quality: 'high' | 'medium' | 'low',
  durationSeconds: number = 1.0
): ArrayBuffer {
  const sampleRate = 24000;
  const duration = Math.max(0.1, Math.min(durationSeconds, 5.0));

  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const numSamples = Math.floor(duration * sampleRate);
  const dataSize = numSamples * numChannels * bytesPerSample;
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Generate audio with quality-specific characteristics
  let offset = 44;
  const frequency = 440;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample: number;

    switch (quality) {
      case 'high':
        // Clean sine wave with high amplitude
        sample = 0.8 * Math.sin(2 * Math.PI * frequency * t);
        break;

      case 'medium':
        // Sine wave with moderate noise
        const noise = (Math.random() - 0.5) * 0.1;
        sample = 0.6 * Math.sin(2 * Math.PI * frequency * t) + noise;
        break;

      case 'low':
        // Sine wave with high noise and distortion
        const highNoise = (Math.random() - 0.5) * 0.3;
        const distortion = Math.sin(2 * Math.PI * frequency * t) ** 3;
        sample = 0.4 * Math.sin(2 * Math.PI * frequency * t) + highNoise + distortion * 0.2;
        break;

      default:
        sample = 0.5 * Math.sin(2 * Math.PI * frequency * t);
    }

    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return buffer;
}

/**
 * Helper function to write strings to DataView
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Validates if a buffer is a valid WAV file
 */
export function isValidWAV(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 44) return false;

  const view = new DataView(buffer);
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

  return riff === 'RIFF' && wave === 'WAVE';
}
