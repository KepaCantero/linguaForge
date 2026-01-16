/**
 * Audio Decoder Utility
 * Decodes audio buffers using Web Audio API for quality analysis
 *
 * This utility provides server-side audio decoding capabilities
 * for analyzing audio quality metrics in TTS workflows.
 */

import type { AudioQualityMetrics } from '@/types/audio';
import { calculateMetrics } from '@/services/audioPostProcessService';

/**
 * Decodes an audio buffer (MP3/WAV) to AudioBuffer for analysis
 * Uses Web Audio API's decodeAudioData method
 *
 * @param audioBuffer - Raw audio buffer from TTS API
 * @param format - Audio format ('mp3' or 'wav')
 * @returns Decoded AudioBuffer or null if decoding fails
 */
export async function decodeAudioBuffer(
  audioBuffer: ArrayBuffer,
  format: 'mp3' | 'wav' = 'mp3'
): Promise<AudioBuffer | null> {
  try {
    // Check if we're in a browser environment with Web Audio API
    type AudioContextConstructor = typeof window.AudioContext;
    const AudioContextClass = typeof window !== 'undefined'
      ? (window.AudioContext || (window as unknown as Record<string, AudioContextConstructor>).webkitAudioContext)
      : null;

    if (AudioContextClass) {
      const audioContext = new AudioContextClass();
      const decodedBuffer = await audioContext.decodeAudioData(audioBuffer.slice(0));
      await audioContext.close();
      return decodedBuffer;
    }

    // Node.js environment - try to decode WAV manually
    if (format === 'wav') {
      return decodeWAVManually(audioBuffer);
    }

    // For MP3 in Node.js, we need an external library
    console.warn('MP3 decoding not available in Node.js environment without external library');
    return null;
  } catch (error) {
    console.error('Failed to decode audio buffer:', error);
    return null;
  }
}

/**
 * Manually decodes a WAV file to AudioBuffer
 * This works in Node.js environment for WAV files
 */
function decodeWAVManually(arrayBuffer: ArrayBuffer): AudioBuffer | null {
  try {
    const view = new DataView(arrayBuffer);

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
      console.error('Invalid WAV format');
      return null;
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
      console.error('Data chunk not found');
      return null;
    }

    const dataSize = view.getUint32(dataOffset + 4, true);
    const numSamples = dataSize / (numChannels * (bitsPerSample / 8));

    // Create AudioBuffer using global AudioContext if available
    type AudioContextConstructor = typeof window.AudioContext;
    const AudioContextClass = typeof window !== 'undefined'
      ? (window.AudioContext || (window as unknown as Record<string, AudioContextConstructor>).webkitAudioContext)
      : null;

    if (!AudioContextClass) {
      console.warn('AudioContext not available for manual WAV decoding');
      return null;
    }

    const audioContext = new AudioContextClass();
    const audioBuffer = audioContext.createBuffer(numChannels, numSamples, sampleRate);

    // Read PCM data
    const bytesPerSample = bitsPerSample / 8;

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
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
    }

    return audioBuffer;
  } catch (error) {
    console.error('Failed to decode WAV manually:', error);
    return null;
  }
}

/**
 * Analyzes audio quality from raw audio buffer
 * Combines decoding and metrics calculation
 *
 * @param audioBuffer - Raw audio buffer from TTS API
 * @param format - Audio format ('mp3' or 'wav')
 * @returns Audio quality metrics or null if analysis fails
 */
export async function analyzeAudioQuality(
  audioBuffer: ArrayBuffer,
  format: 'mp3' | 'wav' = 'mp3'
): Promise<AudioQualityMetrics | null> {
  try {
    // Decode the audio buffer
    const decodedAudio = await decodeAudioBuffer(audioBuffer, format);

    if (!decodedAudio) {
      console.warn('Failed to decode audio, cannot analyze quality');
      return null;
    }

    // Calculate metrics using the audioPostProcessService
    const metrics = await calculateMetrics(decodedAudio);
    return metrics;
  } catch (error) {
    console.error('Failed to analyze audio quality:', error);
    return null;
  }
}

/**
 * Creates a fallback AudioBuffer from raw PCM data
 * Useful when decodeAudioData is not available
 *
 * @param pcmData - Float32Array with PCM samples
 * @param sampleRate - Sample rate in Hz
 * @param numberOfChannels - Number of audio channels (default: 1)
 * @returns AudioBuffer or null if creation fails
 */
export function createAudioBufferFromPCM(
  pcmData: Float32Array,
  sampleRate: number,
  numberOfChannels: number = 1
): AudioBuffer | null {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new window.AudioContext();
      const audioBuffer = audioContext.createBuffer(
        numberOfChannels,
        pcmData.length,
        sampleRate
      );

      // Copy PCM data to the audio buffer
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        channelData.set(pcmData);
      }

      return audioBuffer;
    }

    return null;
  } catch (error) {
    console.error('Failed to create AudioBuffer from PCM:', error);
    return null;
  }
}

/**
 * Extracts basic audio information without full decoding
 * Provides quick access to duration and format info
 *
 * @param audioBuffer - Raw audio buffer
 * @param format - Audio format
 * @returns Basic audio info
 */
export function getAudioInfo(
  audioBuffer: ArrayBuffer,
  format: 'mp3' | 'wav'
): {
  size: number;
  format: string;
  estimatedDuration?: number;
} {
  const info = {
    size: audioBuffer.byteLength,
    format,
  } as { size: number; format: string; estimatedDuration?: number };

  // For WAV, we can extract actual duration from headers
  if (format === 'wav' && audioBuffer.byteLength >= 44) {
    try {
      const view = new DataView(audioBuffer);
      const sampleRate = view.getUint32(24, true);
      const byteRate = view.getUint32(28, true);
      const dataSize = view.getUint32(40, true);

      if (byteRate > 0) {
        info.estimatedDuration = dataSize / byteRate;
      }
    } catch {
      // If header parsing fails, estimate based on size
      info.estimatedDuration = estimateDuration(audioBuffer.byteLength, format);
    }
  } else {
    // For MP3, estimate based on bitrate (assume 128kbps for TTS)
    info.estimatedDuration = estimateDuration(audioBuffer.byteLength, format);
  }

  return info;
}

/**
 * Estimates audio duration based on file size and format
 */
function estimateDuration(byteSize: number, format: 'mp3' | 'wav'): number {
  // Assume 128kbps for MP3, 384kbps for WAV (24kHz, 16-bit, mono)
  const bitrate = format === 'mp3' ? 128000 : 384000;
  return (byteSize * 8) / bitrate;
}
