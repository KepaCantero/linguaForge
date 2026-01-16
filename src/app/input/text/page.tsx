'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TextEditor } from '@/components/input/text/TextEditor';
import { TextPreview } from '@/components/input/text/TextPreview';
import { BlockSelector } from '@/components/input/text/BlockSelector';
import { VoiceSelector } from '@/components/input/text/VoiceSelector';
import { TTSQualitySelector } from '@/components/input/text/TTSQualitySelector';
import { IntonationSelector } from '@/components/input/text/IntonationSelector';
import { useTextImport, type TextImportData, type TextBlock } from '@/hooks/input/useTextImport';
import { useAudioGeneration } from '@/hooks/input/useAudioGeneration';
import { TTS_VOICE_PRESETS, type TTSQualityLevel } from '@/types/tts';
import { useProgressStore } from '@/store/useProgressStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ============================================================
// CONSTANTS
// ============================================================

const TEXT_INPUT_CONFIG = {
  maxLength: 10_000,
  minLength: 20,
  placeholder: 'Pega aquí tu texto en francés para analizar...',
};

// ============================================================
// PAGE
// ============================================================

/**
 * Text Input Page - Página de importación de texto
 *
 * Flujo completo:
 * 1. Usuario pega texto en TextEditor
 * 2. Se muestra análisis en TextPreview
 * 3. Usuario puede seleccionar voz en VoiceSelector
 * 4. Usuario puede escuchar TTS del texto completo
 * 5. Usuario puede seleccionar bloques específicos en BlockSelector
 * 6. Usuario importa todo o solo lo seleccionado
 */
export default function TextInputPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { activeLanguage, activeLevel } = useProgressStore();

  // Hooks
  const textImport = useTextImport({ autoAnalyze: true });
  const audioGen = useAudioGeneration();

  // Estado local
  const [text, setText] = useState('');
  const [importData, setImportData] = useState<TextImportData | null>(null);
  const [selectedBlocks, setSelectedBlocks] = useState<TextBlock[]>([]);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [showIntonationSelector, setShowIntonationSelector] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<TTSQualityLevel>('intermediate');
  const [selectedFormat, setSelectedFormat] = useState<'mp3' | 'wav'>('mp3');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ nodeId: string; message: string } | null>(null);

  // Cargar voces al montar
  useEffect(() => {
    audioGen.fetchVoices();
  }, [audioGen]);

  // Analizar texto automáticamente cuando cambia
  useEffect(() => {
    if (text.length >= TEXT_INPUT_CONFIG.minLength) {
      const result = textImport.analyzeText(text);
      setImportData(result);
    } else {
      setImportData(null);
    }
  }, [text, textImport]);

  // Manejar cambio de texto
  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    setSelectedBlocks([]);
    setImportResult(null);
  }, []);

  // Manejar análisis manual (botón)
  const handleAnalyze = useCallback(() => {
    const result = textImport.analyzeText(text);
    setImportData(result);
  }, [text, textImport]);

  // Manejar cambio de voz
  const handleVoiceChange = useCallback((voice: string) => {
    audioGen.setVoice(voice);
  }, [audioGen]);

  // Manejar cambio de calidad
  const handleQualityChange = useCallback((quality: TTSQualityLevel) => {
    setSelectedQuality(quality);
  }, []);

  // Manejar cambio de formato
  const handleFormatChange = useCallback((format: 'mp3' | 'wav') => {
    setSelectedFormat(format);
  }, []);

  // Manejar preview de voz
  const handleVoicePreview = useCallback(async (voice: string) => {
    // Usar una frase de ejemplo
    const previewText = 'Bonjour, comment allez-vous?';
    await audioGen.generateSpeech(previewText, { voice });
  }, [audioGen]);

  // Manejar preview con configuración de calidad
  const handleQualityPreview = useCallback(async (previewText: string) => {
    await audioGen.generateSpeech(previewText, {
      voice: audioGen.selectedVoice,
      rate: selectedQuality === 'beginner' ? 0.8 : selectedQuality === 'intermediate' ? 1.0 : 1.2,
      useIntonation: audioGen.useIntonation,
    });
  }, [audioGen, selectedQuality]);

  // Manejar cambio de entonación
  const handleIntonationToggle = useCallback((enabled: boolean) => {
    audioGen.setUseIntonation(enabled);
  }, [audioGen]);

  // Manejar preview con entonación
  const handleIntonationPreview = useCallback(async (previewText: string, useIntonation: boolean) => {
    await audioGen.generateSpeech(previewText, {
      voice: audioGen.selectedVoice,
      rate: selectedQuality === 'beginner' ? 0.8 : selectedQuality === 'intermediate' ? 1.0 : 1.2,
      useIntonation,
    });
  }, [audioGen, selectedQuality]);

  // Manejar generación de TTS del texto completo
  const handleGenerateAudio = useCallback(() => {
    if (!text) return;

    // Usar Web Speech API directamente para reproducir
    audioGen.streamToPlayer(text);
  }, [text, audioGen]);

  // Manejar descarga de audio
  // NOTA: Web Speech API no permite capturar el audio generado.
  // Esta función usa generateSpeechDownload del hook con configuración de calidad.
  const handleDownloadAudio = useCallback(async () => {
    if (!text) return;

    try {
      const audioBlob = await audioGen.generateSpeechDownload(text, {
        voice: audioGen.selectedVoice,
        rate: selectedQuality === 'beginner' ? 0.8 : selectedQuality === 'intermediate' ? 1.0 : 1.2,
        quality: selectedQuality,
        format: selectedFormat,
        useIntonation: audioGen.useIntonation,
      });

      if (audioBlob) {
        const filename = `audio_${selectedQuality}_${Date.now()}.${selectedFormat}`;
        audioGen.downloadAudio(audioBlob, filename);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Error al descargar audio. Verifica que el servidor TTS esté configurado.');
    }
  }, [text, audioGen, selectedQuality, selectedFormat]);

  // Manejar cambio de selección de bloques
  const handleSelectionChange = useCallback((blocks: TextBlock[]) => {
    setSelectedBlocks(blocks);
  }, []);

  // Manejar importación de todo
  const handleImportAll = useCallback(async () => {
    if (!importData) return;

    setIsImporting(true);
    try {
      const result = await textImport.importAll(importData);
      setImportResult({
        nodeId: result.nodeId,
        message: `¡Importado! ${result.phraseCount} frases, ${result.exerciseCount} ejercicios creados`,
      });

      // Redirigir a learn después de 2 segundos
      setTimeout(() => {
        router.push(`/learn/node/${result.nodeId}`);
      }, 2000);
    } catch (err) {
      setImportResult({
        nodeId: '',
        message: err instanceof Error ? err.message : 'Error al importar',
      });
    } finally {
      setIsImporting(false);
    }
  }, [importData, textImport, router]);

  // Manejar importación de selección
  const handleImportSelected = useCallback(async () => {
    if (selectedBlocks.length === 0) return;

    setIsImporting(true);
    try {
      const result = await textImport.importBlocks(selectedBlocks);
      setImportResult({
        nodeId: result.nodeId,
        message: `¡Importado! ${result.phraseCount} frases, ${result.exerciseCount} ejercicios creados`,
      });

      // Redirigir a learn después de 2 segundos
      setTimeout(() => {
        router.push(`/learn/node/${result.nodeId}`);
      }, 2000);
    } catch (err) {
      setImportResult({
        nodeId: '',
        message: err instanceof Error ? err.message : 'Error al importar',
      });
    } finally {
      setIsImporting(false);
    }
  }, [selectedBlocks, textImport, router]);

  const canAnalyze = text.length >= TEXT_INPUT_CONFIG.minLength;
  const canImport = importData !== null && !isImporting;
  const hasSelection = selectedBlocks.length > 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold text-white">
          Importar Texto
        </h1>
        <p className="text-calm-text-muted">
          Pega tu texto en francés para analizar, escuchar y estudiar en bloques
        </p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Editor y acciones */}
        <div className="space-y-6">
          {/* Editor de texto */}
          <TextEditor
            value={text}
            onChange={handleTextChange}
            maxLength={TEXT_INPUT_CONFIG.maxLength}
            minLength={TEXT_INPUT_CONFIG.minLength}
            placeholder={TEXT_INPUT_CONFIG.placeholder}
            autoFocus
          />

          {/* Acciones rápidas */}
          <AnimatePresence>
            {text.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-wrap gap-3"
              >
                {/* Generar audio */}
                <button
                  onClick={handleGenerateAudio}
                  disabled={!canAnalyze || audioGen.isGenerating}
                  className="flex-1 min-w-[140px] px-4 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                  {audioGen.isGenerating ? '⏳ Generando...' : '🔊 Escuchar texto'}
                </button>

                {/* Descargar audio */}
                <button
                  onClick={handleDownloadAudio}
                  disabled={!canAnalyze || audioGen.isGenerating}
                  className="flex-1 min-w-[140px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                  💾 Guardar audio
                </button>

                {/* Selector de voz */}
                <button
                  onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                  className="px-4 py-3 bg-calm-bg-elevated hover:bg-calm-warm-200/20 border border-calm-warm-200/50 text-calm-text-primary rounded-xl font-medium transition-colors"
                >
                  🎤 Voz
                </button>

                {/* Selector de calidad TTS */}
                <button
                  onClick={() => setShowQualitySelector(!showQualitySelector)}
                  className="px-4 py-3 bg-calm-bg-elevated hover:bg-calm-warm-200/20 border border-calm-warm-200/50 text-calm-text-primary rounded-xl font-medium transition-colors"
                >
                  ⚙️ Calidad
                </button>

                {/* Selector de entonación */}
                <button
                  onClick={() => setShowIntonationSelector(!showIntonationSelector)}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                    audioGen.useIntonation
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-calm-bg-elevated hover:bg-calm-warm-200/20 border border-calm-warm-200/50 text-calm-text-primary'
                  }`}
                >
                  {audioGen.useIntonation ? '🎵 Entonación ON' : '🎵 Entonación'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selector de voz (desplegable) */}
          <AnimatePresence>
            {showVoiceSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <VoiceSelector
                  selectedVoice={audioGen.selectedVoice}
                  onVoiceChange={handleVoiceChange}
                  onPreview={handleVoicePreview}
                  showPreviewButton
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selector de calidad TTS (desplegable) */}
          <AnimatePresence>
            {showQualitySelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <TTSQualitySelector
                  selectedQuality={selectedQuality}
                  onQualityChange={handleQualityChange}
                  selectedFormat={selectedFormat}
                  onFormatChange={handleFormatChange}
                  selectedVoice={audioGen.selectedVoice}
                  onVoiceChange={handleVoiceChange}
                  availableVoices={audioGen.availableVoices}
                  onPreview={handleQualityPreview}
                  showPreviewButton
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selector de entonación (desplegable) */}
          <AnimatePresence>
            {showIntonationSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <IntonationSelector
                  text={text}
                  isEnabled={audioGen.useIntonation}
                  onToggle={handleIntonationToggle}
                  onPreview={handleIntonationPreview}
                  language="fr"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Columna derecha: Análisis y selección */}
        <div className="space-y-6">
          {/* Previsualización de análisis */}
          <TextPreview
            data={importData}
            isLoading={textImport.isAnalyzing}
            error={textImport.error}
            onAnalyze={handleAnalyze}
            showAnalyzeButton
          />

          {/* Resultado de importación */}
          <AnimatePresence>
            {importResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`
                  p-4 rounded-xl border
                  ${importResult.nodeId
                    ? 'bg-emerald-900/20 border-emerald-500/30'
                    : 'bg-red-900/20 border-red-500/30'
                  }
                `}
              >
                <p className={`font-medium ${importResult.nodeId ? 'text-emerald-400' : 'text-red-400'}`}>
                  {importResult.nodeId ? '✅' : '❌'} {importResult.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Acciones de importación */}
          <AnimatePresence>
            {canImport && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {/* Importar todo */}
                <button
                  onClick={handleImportAll}
                  disabled={isImporting}
                  className="w-full px-6 py-4 bg-accent-600 hover:bg-accent-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors"
                >
                  {isImporting ? '⏳ Importando...' : '🚀 Importar todo'}
                </button>

                <p className="text-center text-sm text-calm-text-muted">
                  O selecciona bloques específicos below
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selector de bloques (ancho completo) */}
      <AnimatePresence>
        {importData && importData.blocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="pt-6 border-t border-calm-warm-200/30"
          >
            <BlockSelector
              blocks={importData.blocks}
              onSelectionChange={handleSelectionChange}
              showExercisePreview
            />

            {/* Importar selección */}
            <AnimatePresence>
              {hasSelection && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6"
                >
                  <button
                    onClick={handleImportSelected}
                    disabled={isImporting}
                    className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors"
                  >
                    {isImporting
                      ? '⏳ Importando...'
                      : `📦 Importar ${selectedBlocks.length} bloque${selectedBlocks.length > 1 ? 's' : ''}`
                    }
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
