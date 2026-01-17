/**
 * useTextInputPage - Custom hook for text input page logic
 *
 * Extracts complex state management and handler logic from TextInputPage
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTextImport, type TextImportData, type TextBlock } from '@/hooks/input/useTextImport';
import { useAudioGeneration } from '@/hooks/input/useAudioGeneration';
import type { TTSQualityLevel } from '@/types/tts';

// ============================================================
// CONSTANTS
// ============================================================

const TEXT_INPUT_CONFIG = {
  maxLength: 10_000,
  minLength: 20,
  placeholder: 'Pega aquí tu texto en francés para analizar...',
} as const;

const NAVIGATION_DELAY_MS = 2000;
const PREVIEW_TEXT = 'Bonjour, comment allez-vous?';

// ============================================================
// TYPES
// ============================================================

export interface TextInputPageState {
  text: string;
  importData: TextImportData | null;
  selectedBlocks: TextBlock[];
  showVoiceSelector: boolean;
  showQualitySelector: boolean;
  showIntonationSelector: boolean;
  selectedQuality: TTSQualityLevel;
  selectedFormat: 'mp3' | 'wav';
  isImporting: boolean;
  importResult: { nodeId: string; message: string } | null;
}

export interface TextInputPageHandlers {
  handleTextChange: (newText: string) => void;
  handleAnalyze: () => void;
  handleVoiceChange: (voice: string) => void;
  handleQualityChange: (quality: TTSQualityLevel) => void;
  handleFormatChange: (format: 'mp3' | 'wav') => void;
  handleVoicePreview: (voice: string) => Promise<void>;
  handleQualityPreview: (previewText: string) => Promise<void>;
  handleIntonationToggle: (enabled: boolean) => void;
  handleIntonationPreview: (previewText: string, useIntonation: boolean) => Promise<void>;
  handleGenerateAudio: () => void;
  handleDownloadAudio: () => Promise<void>;
  handleSelectionChange: (blocks: TextBlock[]) => void;
  handleImportAll: () => Promise<void>;
  handleImportSelected: () => Promise<void>;
  toggleVoiceSelector: () => void;
  toggleQualitySelector: () => void;
  toggleIntonationSelector: () => void;
}

export interface TextInputPageComputed {
  canAnalyze: boolean;
  canImport: boolean;
  hasSelection: boolean;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getRateForQuality(quality: TTSQualityLevel): number {
  switch (quality) {
    case 'beginner':
      return 0.8;
    case 'intermediate':
      return 1.0;
    case 'advanced':
      return 1.2;
  }
}

async function navigateAfterDelay(router: ReturnType<typeof useRouter>, nodeId: string) {
  setTimeout(() => {
    router.push(`/learn/node/${nodeId}`);
  }, NAVIGATION_DELAY_MS);
}

function createImportResult(nodeId: string, phraseCount: number, exerciseCount: number) {
  return {
    nodeId,
    message: `¡Importado! ${phraseCount} frases, ${exerciseCount} ejercicios creados`,
  };
}

function createErrorResult(error: unknown) {
  return {
    nodeId: '',
    message: error instanceof Error ? error.message : 'Error al importar',
  };
}

// ============================================================
// CUSTOM HOOK
// ============================================================

export function useTextInputPage() {
  const router = useRouter();
  const textImport = useTextImport({ autoAnalyze: true });
  const audioGen = useAudioGeneration();

  // State
  const [state, setState] = useState<TextInputPageState>({
    text: '',
    importData: null,
    selectedBlocks: [],
    showVoiceSelector: false,
    showQualitySelector: false,
    showIntonationSelector: false,
    selectedQuality: 'intermediate',
    selectedFormat: 'mp3',
    isImporting: false,
    importResult: null,
  });

  // Load voices on mount
  useEffect(() => {
    audioGen.fetchVoices();
  }, [audioGen]);

  // Auto-analyze text when it changes
  useEffect(() => {
    if (state.text.length >= TEXT_INPUT_CONFIG.minLength) {
      const result = textImport.analyzeText(state.text);
      setState(prev => ({ ...prev, importData: result }));
    } else {
      setState(prev => ({ ...prev, importData: null }));
    }
  }, [state.text, textImport]);

  // Handlers
  const handleTextChange = useCallback((newText: string) => {
    setState(prev => ({
      ...prev,
      text: newText,
      selectedBlocks: [],
      importResult: null,
    }));
  }, []);

  const handleAnalyze = useCallback(() => {
    const result = textImport.analyzeText(state.text);
    setState(prev => ({ ...prev, importData: result }));
  }, [state.text, textImport]);

  const handleVoiceChange = useCallback((voice: string) => {
    audioGen.setVoice(voice);
  }, [audioGen]);

  const handleQualityChange = useCallback((quality: TTSQualityLevel) => {
    setState(prev => ({ ...prev, selectedQuality: quality }));
  }, []);

  const handleFormatChange = useCallback((format: 'mp3' | 'wav') => {
    setState(prev => ({ ...prev, selectedFormat: format }));
  }, []);

  const handleVoicePreview = useCallback(async (voice: string) => {
    await audioGen.generateSpeech(PREVIEW_TEXT, { voice });
  }, [audioGen]);

  const handleQualityPreview = useCallback(async (previewText: string) => {
    await audioGen.generateSpeech(previewText, {
      voice: audioGen.selectedVoice,
      rate: getRateForQuality(state.selectedQuality),
      useIntonation: audioGen.useIntonation,
    });
  }, [audioGen, state.selectedQuality]);

  const handleIntonationToggle = useCallback((enabled: boolean) => {
    audioGen.setUseIntonation(enabled);
  }, [audioGen]);

  const handleIntonationPreview = useCallback(async (previewText: string, useIntonation: boolean) => {
    await audioGen.generateSpeech(previewText, {
      voice: audioGen.selectedVoice,
      rate: getRateForQuality(state.selectedQuality),
      useIntonation,
    });
  }, [audioGen, state.selectedQuality]);

  const handleGenerateAudio = useCallback(() => {
    if (!state.text) return;
    audioGen.streamToPlayer(state.text);
  }, [state.text, audioGen]);

  const handleDownloadAudio = useCallback(async () => {
    if (!state.text) return;

    try {
      const audioBlob = await audioGen.generateSpeechDownload(state.text, {
        voice: audioGen.selectedVoice,
        rate: getRateForQuality(state.selectedQuality),
        quality: state.selectedQuality,
        format: state.selectedFormat,
        useIntonation: audioGen.useIntonation,
      });

      if (audioBlob) {
        const filename = `audio_${state.selectedQuality}_${Date.now()}.${state.selectedFormat}`;
        audioGen.downloadAudio(audioBlob, filename);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Error al descargar audio. Verifica que el servidor TTS esté configurado.');
    }
  }, [state.text, state.selectedQuality, state.selectedFormat, audioGen]);

  const handleSelectionChange = useCallback((blocks: TextBlock[]) => {
    setState(prev => ({ ...prev, selectedBlocks: blocks }));
  }, []);

  const handleImportAll = useCallback(async () => {
    if (!state.importData) return;

    setState(prev => ({ ...prev, isImporting: true }));

    try {
      const result = await textImport.importAll(state.importData);
      const importResult = createImportResult(result.nodeId, result.phraseCount, result.exerciseCount);
      setState(prev => ({ ...prev, importResult }));
      navigateAfterDelay(router, result.nodeId);
    } catch (err) {
      setState(prev => ({ ...prev, importResult: createErrorResult(err) }));
    } finally {
      setState(prev => ({ ...prev, isImporting: false }));
    }
  }, [state.importData, textImport, router]);

  const handleImportSelected = useCallback(async () => {
    if (state.selectedBlocks.length === 0) return;

    setState(prev => ({ ...prev, isImporting: true }));

    try {
      const result = await textImport.importBlocks(state.selectedBlocks);
      const importResult = createImportResult(result.nodeId, result.phraseCount, result.exerciseCount);
      setState(prev => ({ ...prev, importResult }));
      navigateAfterDelay(router, result.nodeId);
    } catch (err) {
      setState(prev => ({ ...prev, importResult: createErrorResult(err) }));
    } finally {
      setState(prev => ({ ...prev, isImporting: false }));
    }
  }, [state.selectedBlocks, textImport, router]);

  const toggleVoiceSelector = useCallback(() => {
    setState(prev => ({ ...prev, showVoiceSelector: !prev.showVoiceSelector }));
  }, []);

  const toggleQualitySelector = useCallback(() => {
    setState(prev => ({ ...prev, showQualitySelector: !prev.showQualitySelector }));
  }, []);

  const toggleIntonationSelector = useCallback(() => {
    setState(prev => ({ ...prev, showIntonationSelector: !prev.showIntonationSelector }));
  }, []);

  // Computed values
  const computed: TextInputPageComputed = {
    canAnalyze: state.text.length >= TEXT_INPUT_CONFIG.minLength,
    canImport: state.importData !== null && !state.isImporting,
    hasSelection: state.selectedBlocks.length > 0,
  };

  return {
    state,
    handlers: {
      handleTextChange,
      handleAnalyze,
      handleVoiceChange,
      handleQualityChange,
      handleFormatChange,
      handleVoicePreview,
      handleQualityPreview,
      handleIntonationToggle,
      handleIntonationPreview,
      handleGenerateAudio,
      handleDownloadAudio,
      handleSelectionChange,
      handleImportAll,
      handleImportSelected,
      toggleVoiceSelector,
      toggleQualitySelector,
      toggleIntonationSelector,
    },
    computed,
    textImport,
    audioGen,
    config: TEXT_INPUT_CONFIG,
  };
}

export type UseTextInputPageReturn = ReturnType<typeof useTextInputPage>;
