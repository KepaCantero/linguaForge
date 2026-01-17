/**
 * Speech Service
 * Análisis de voz para ejercicios conversacionales
 * Evalúa ritmo, fluidez y patrón de entonación general
 * NO evalúa pronunciación fonética estricta
 */

import { analyzeIntonation, calculateIntonationSimilarity } from "@/lib/audioAnalysis";

export interface RhythmPattern {
  segments: number[]; // Duración de cada segmento en ms
  pauses: number[]; // Duración de pausas entre segmentos
}

export interface RhythmAnalysis {
  pattern: RhythmPattern;
  overallSimilarity: number; // 0-100 comparado con nativo
}

export interface KeywordDetection {
  detected: string[]; // Palabras detectadas
  confidence: number; // 0-100
  missing: string[]; // Palabras esperadas no detectadas
}

export interface IntentionScore {
  isValid: boolean;
  score: number; // 0-100
  matchedResponse: string | null;
  feedback: {
    type: "perfect" | "acceptable" | "poor" | "out_of_context";
    message: string;
    tip?: string;
  };
}

/**
 * Analiza el ritmo de un audio grabado
 */
export async function analyzeRhythm(
  audioBlob: Blob,
  nativePattern?: RhythmPattern
): Promise<RhythmAnalysis> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioContext = new AudioContextClass();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const pattern = detectRhythmPattern(channelData, sampleRate);

  // Calcular similitud si hay patrón nativo
  const overallSimilarity = nativePattern
    ? calculateRhythmSimilarity(pattern, nativePattern)
    : 50;

  return { pattern, overallSimilarity };
}

/**
 * Detecta patrones de ritmo (segmentos y pausas) en datos de audio
 */
function detectRhythmPattern(channelData: Float32Array, sampleRate: number): RhythmPattern {
  const WINDOW_SIZE_MS = 50;
  const THRESHOLD = 0.01;
  const MS_MULTIPLIER = 1000;

  const windowSize = Math.floor(sampleRate * (WINDOW_SIZE_MS / 1000));
  const segments: number[] = [];
  const pauses: number[] = [];

  let currentSegment = 0;
  let currentPause = 0;
  let inSpeech = false;

  for (let i = 0; i < channelData.length; i += windowSize) {
    const window = channelData.slice(i, Math.min(i + windowSize, channelData.length));
    const energy = calculateWindowEnergy(window);

    if (energy > THRESHOLD) {
      const result = handleSpeechSegment({
        inSpeech,
        currentPause,
        currentSegment,
        windowSize,
        sampleRate,
        pauses,
      });
      inSpeech = result.inSpeech;
      currentPause = result.currentPause;
      currentSegment = result.currentSegment;
    } else {
      // Transitioning from speech to silence
      if (inSpeech && currentSegment > 0) {
        segments.push((currentSegment / sampleRate) * 1000);
      }
      inSpeech = false;
      currentPause = currentPause + windowSize;
      currentSegment = 0;
    }
  }

  // Agregar último segmento si existe
  if (inSpeech && currentSegment > 0) {
    segments.push((currentSegment / sampleRate) * MS_MULTIPLIER);
  }

  return { segments, pauses };
}

/**
 * Calcula energía promedio de una ventana de audio
 */
function calculateWindowEnergy(window: Float32Array): number {
  return window.reduce((sum, sample) => sum + Math.abs(sample), 0) / window.length;
}

/**
 * Opciones para manejar un segmento de habla
 */
interface HandleSpeechSegmentOptions {
  inSpeech: boolean;
  currentPause: number;
  currentSegment: number;
  windowSize: number;
  sampleRate: number;
  pauses: number[];
}

/**
 * Maneja un segmento de habla
 */
function handleSpeechSegment(
  options: HandleSpeechSegmentOptions
): { inSpeech: boolean; currentPause: number; currentSegment: number } {
  if (options.inSpeech) {
    return {
      inSpeech: true,
      currentPause: options.currentPause,
      currentSegment: options.currentSegment + options.windowSize
    };
  }

  if (options.currentPause > 0) {
    options.pauses.push((options.currentPause / options.sampleRate) * 1000);
  }

  return { inSpeech: true, currentPause: 0, currentSegment: options.windowSize };
}

/**
 * Calcula similitud entre dos patrones de ritmo
 */
function calculateRhythmSimilarity(
  user: RhythmPattern,
  native: RhythmPattern
): number {
  if (native.segments.length === 0) return 50;

  // Comparar duración de segmentos
  const segmentSimilarities: number[] = [];
  const minLength = Math.min(user.segments.length, native.segments.length);

  for (let i = 0; i < minLength; i++) {
    const userDur = user.segments[i];
    const nativeDur = native.segments[i];
    const diff = Math.abs(userDur - nativeDur);
    const similarity = Math.max(0, 100 - (diff / nativeDur) * 100);
    segmentSimilarities.push(similarity);
  }

  // Promedio de similitudes
  const avgSimilarity =
    segmentSimilarities.reduce((sum, s) => sum + s, 0) /
    segmentSimilarities.length;

  return Math.round(avgSimilarity);
}

/**
 * Detecta palabras clave en un audio usando reconocimiento de voz básico
 * Nota: En producción usar Web Speech API o servicio externo
 */
export async function detectKeywords(
  audioBlob: Blob,
  keywords: string[]
): Promise<KeywordDetection> {
  // Placeholder: En producción usar Web Speech API
  // Por ahora retornamos detección simulada basada en duración
  const detected: string[] = [];
  const missing: string[] = [];

  // Simulación: detectar palabras basado en duración del audio
  // En producción, usar SpeechRecognition API
  const arrayBuffer = await audioBlob.arrayBuffer();
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioContext = new AudioContextClass();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const duration = audioBuffer.duration;

  // Simulación simple: si el audio es suficientemente largo, asumimos que contiene palabras
  // En producción, usar reconocimiento de voz real
  const estimatedWords = Math.floor(duration * 2); // ~2 palabras por segundo

  // Simular detección de algunas palabras clave
  if (estimatedWords >= keywords.length * 0.5) {
    detected.push(...keywords.slice(0, Math.floor(keywords.length * 0.7)));
    missing.push(...keywords.slice(Math.floor(keywords.length * 0.7)));
  } else {
    missing.push(...keywords);
  }

  const confidence = detected.length > 0 ? (detected.length / keywords.length) * 100 : 0;

  return {
    detected,
    confidence: Math.round(confidence),
    missing,
  };
}

/**
 * Evalúa la intención de una respuesta conversacional
 */
export async function evaluateIntention(
  audioBlob: Blob,
  expectedResponses: Array<{
    text: string;
    keywords: string[];
    isOptimal: boolean;
  }>
): Promise<IntentionScore> {
  // Extraer todas las palabras clave esperadas
  const allKeywords = expectedResponses.flatMap((r) => r.keywords);
  const keywordDetection = await detectKeywords(audioBlob, allKeywords);

  // Encontrar la respuesta esperada que mejor coincide
  let bestMatch: (typeof expectedResponses)[0] | null = null;
  let bestScore = 0;

  for (const response of expectedResponses) {
    const matchedKeywords = response.keywords.filter((kw) =>
      keywordDetection.detected.some((d) =>
        d.toLowerCase().includes(kw.toLowerCase())
      )
    );
    const score = (matchedKeywords.length / response.keywords.length) * 100;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = response;
    }
  }

  // Determinar tipo de feedback
  let feedbackType: IntentionScore["feedback"]["type"] = "poor";
  let message = "";
  let tip: string | undefined;

  if (bestScore >= 80) {
    feedbackType = bestMatch?.isOptimal ? "perfect" : "acceptable";
    message = bestMatch?.isOptimal
      ? "¡Respuesta perfecta!"
      : "Respuesta adecuada";
  } else if (bestScore >= 50) {
    feedbackType = "acceptable";
    message = "Respuesta aceptable, pero podría mejorar";
    tip = `Intenta incluir: ${bestMatch?.keywords.join(", ")}`;
  } else if (bestScore > 0) {
    feedbackType = "poor";
    message = "La respuesta no es muy clara";
    tip = `Palabras esperadas: ${allKeywords.slice(0, 3).join(", ")}`;
  } else {
    feedbackType = "out_of_context";
    message = "La respuesta no parece relacionada con el contexto";
    tip = "Escucha de nuevo el audio y responde de manera natural";
  }

  return {
    isValid: bestScore >= 50,
    score: Math.round(bestScore),
    matchedResponse: bestMatch?.text || null,
    feedback: {
      type: feedbackType,
      message,
      ...(tip !== undefined && { tip }),
    },
  };
}

