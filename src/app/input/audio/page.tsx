'use client';

import { useCallback, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInputStore } from '@/store/useInputStore';
import { useProgressStore } from '@/store/useProgressStore';
import { AudioPlayer } from '@/components/input/audio/AudioPlayer';
import { WordSelector } from '@/components/transcript/WordSelector';
import { QuickReviewButton } from '@/components/transcript/QuickReviewButton';
import { ContentSource } from '@/types/srs';
import { INPUT_COLORS } from '@/lib/constants';
import type { InputEvent } from '@/types';
import {
  transcribeAudio,
  convertTranscriptionToPhrases,
  validateAudioFile,
  estimateWordCount,
  type AudioTranscriptionResult,
} from '@/services/audioTranscriptionService';
import { AudioTranscriptionError } from '@/services/audioTranscriptionService';

// ============================================================
// TYPES
// ============================================================

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Calculate audio statistics from input events
 */
function calculateAudioStats(events: InputEvent[]) {
  const audioEvents = events.filter(
    (e) => e.type === 'audio' && e.durationSeconds && e.durationSeconds > 0
  );
  const totalSeconds = audioEvents.reduce((acc: number, e) => acc + (e.durationSeconds || 0), 0);
  const totalHours = totalSeconds / 3600;
  const uniqueAudioIds = new Set(audioEvents.map((e) => e.contentId).filter(Boolean));

  return {
    audioCount: uniqueAudioIds.size,
    totalHours: totalHours.toFixed(2),
    totalSeconds,
  };
}

// ============================================================
// PRESENTATION COMPONENTS
// ============================================================

interface AudioStatsSectionProps {
  audioStats: { audioCount: number; totalHours: string };
}

function AudioStatsSection({ audioStats }: AudioStatsSectionProps) {
  const colors = INPUT_COLORS.audio;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4"
    >
      <h1 className="text-3xl font-bold text-calm-text-primary text-center mb-2">Audio Input</h1>
      <p className="text-sm text-calm-text-muted text-center mb-6">Aprende francés con podcasts y audios</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {/* Audio Count Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border-2 bg-calm-bg-secondary border-amber-500/30 p-5"
          whileHover={{ scale: 1.05, y: -4 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <span className="text-xl">🎧</span>
              </div>
              <span className="text-sm text-calm-text-muted font-medium">Audios</span>
            </div>
            <div className="text-3xl font-bold text-calm-text-primary">{audioStats.audioCount}</div>
            <div className="text-xs text-calm-text-muted mt-1">Escuchados</div>
          </div>
        </motion.div>

        {/* Total Hours Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border-2 bg-calm-bg-secondary border-orange-500/30 p-5"
          whileHover={{ scale: 1.05, y: -4 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <span className="text-xl">⏱️</span>
              </div>
              <span className="text-sm text-calm-text-muted font-medium">Horas</span>
            </div>
            <div className="text-3xl font-bold text-calm-text-primary">{audioStats.totalHours}</div>
            <div className="text-xs text-calm-text-muted mt-1">Tiempo total</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface FileUploadSectionProps {
  audioFile: File | null;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (file: File) => void;
  onLoadAudio: () => void;
  isTranscribing: boolean;
  transcriptionError: string | null;
}

function FileUploadSection({
  audioFile,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onLoadAudio,
  isTranscribing,
  transcriptionError,
}: FileUploadSectionProps) {
  const colors = INPUT_COLORS.audio;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="max-w-md mx-auto px-4"
    >
      <div className="space-y-4">
        {/* Drag & Drop Zone */}
        <motion.div
          className={`relative w-full p-8 rounded-2xl border-2 border-dashed transition-all ${
            isDragging
              ? `${colors.borderColor} bg-amber-500/10`
              : 'border-calm-warm-100/20 bg-calm-bg-secondary'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          whileHover={{ scale: isDragging ? 1.02 : 1 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a"
            onChange={handleFileChange}
            className="hidden"
            id="audio-file-input"
          />

          <label
            htmlFor="audio-file-input"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{
                scale: isDragging ? [1, 1.2, 1] : 1,
                rotate: isDragging ? [0, 5, -5, 0] : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              🎵
            </motion.div>

            <p className="text-lg font-semibold text-calm-text-primary mb-2">
              Arrastra tu audio aquí
            </p>

            <p className="text-sm text-calm-text-muted text-center mb-4">
              o haz clic para seleccionar un archivo
            </p>

            <div className="text-xs text-calm-text-muted/60 text-center">
              Formatos soportados: MP3, WAV, M4A
              <br />
              Tamaño máximo: 25MB
            </div>

            {audioFile && (
              <div className={`mt-4 p-3 rounded-xl ${colors.bgLight} border ${colors.borderColor}`}>
                <p className={`text-sm font-medium ${colors.textColor}`}>
                  Archivo seleccionado:
                </p>
                <p className="text-xs text-calm-text-muted mt-1">{audioFile.name}</p>
                <p className="text-xs text-calm-text-muted">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </label>
        </motion.div>

        {/* Error message */}
        {transcriptionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border border-red-500/30 bg-red-500/10`}
          >
            <p className="text-sm text-red-400">⚠️ {transcriptionError}</p>
          </motion.div>
        )}

        {/* Transcription progress */}
        {isTranscribing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-2xl border ${colors.borderColor} ${colors.bgLight}`}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className={`text-sm ${colors.textColor}`}>Transcribiendo audio...</p>
            </div>
          </motion.div>
        )}

        {/* Load Button */}
        {audioFile && !isTranscribing && (
          <motion.div
            className="flex justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={onLoadAudio}
              className="relative w-20 h-20 rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${colors.hex}, ${colors.bgDark.replace('bg-', '')})`,
              }}
            >
              <motion.div
                className={`absolute inset-0 rounded-full blur-lg ${colors.iconGlow}`}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative text-3xl">⚡</span>
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

interface AudioPlayerSectionProps {
  audioFile: File;
  currentTime: number;
  duration: number;
  onTimeUpdate: (current: number, total: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onEnd: () => void;
  onMarkAsListened: () => void;
}

function AudioPlayerSection({
  audioFile,
  currentTime,
  duration,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnd,
  onMarkAsListened,
}: AudioPlayerSectionProps) {
  const colors = INPUT_COLORS.audio;

  return (
    <div className="rounded-2xl p-4 bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/20 mb-6">
      <AudioPlayer
        audioFile={audioFile}
        startTime={currentTime}
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnd}
      />

      {/* Botón de marcar como escuchado */}
      <motion.button
        onClick={onMarkAsListened}
        disabled={duration === 0}
        className="w-full mt-4 py-4 rounded-2xl font-bold text-calm-text-primary flex items-center justify-center gap-3"
        style={{
          background: duration === 0
            ? 'radial-gradient(circle at 30% 30%, #4B5563, #374151)'
            : `radial-gradient(circle at 30% 30%, ${colors.hex}, ${colors.bgDark.replace('bg-', '')})`,
        }}
        whileHover={{ scale: duration === 0 ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-2xl">✓</span>
        <span>Marcar como escuchado</span>
      </motion.button>
    </div>
  );
}

interface TranscriptSectionProps {
  transcript: string;
  audioFile: File;
  audioId: string;
  showManualTranscript: boolean;
  onToggleManual: () => void;
  onTranscriptChange: (text: string) => void;
  transcriptionResult: AudioTranscriptionResult | null;
}

function TranscriptSection({
  transcript,
  audioFile,
  audioId,
  showManualTranscript,
  onToggleManual,
  onTranscriptChange,
  transcriptionResult,
}: TranscriptSectionProps) {
  const colors = INPUT_COLORS.audio;

  // Convertir transcripción a frases para WordSelector
  const phrases = useMemo(() => {
    if (!transcriptionResult) return [];
    return convertTranscriptionToPhrases(transcriptionResult);
  }, [transcriptionResult]);

  const source: ContentSource = {
    type: 'audio',
    id: audioId,
    title: audioFile.name,
    url: '',
  };

  return (
    <div className="mt-4">
      {transcript && phrases.length > 0 ? (
        <WordSelector
          transcript={transcript}
          phrases={phrases}
          source={source}
          onWordsAdded={() => {}}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="audio-transcript" className={`block text-sm font-medium ${colors.textColor}`}>
              Transcripción
            </label>
            <button
              onClick={onToggleManual}
              className={`text-xs ${colors.textHover} underline`}
            >
              {showManualTranscript ? 'Ocultar' : 'Ingresar manualmente'}
            </button>
          </div>

          {showManualTranscript ? (
            <textarea
              id="audio-transcript"
              value={transcript}
              onChange={(e) => onTranscriptChange(e.target.value)}
              placeholder="Pega aquí la transcripción del audio..."
              className="w-full h-32 px-4 py-3 rounded-2xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/20 text-calm-text-primary placeholder:text-calm-text-primary/50 resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            />
          ) : (
            <div className={`p-4 rounded-xl ${colors.bgLight} border ${colors.borderColor}`}>
              <p className={`text-sm ${colors.textColor}`}>
                La transcripción automática se generará al cargar el audio.
              </p>
              <p className="text-xs text-calm-text-muted mt-2">
                Si la transcripción falla, puedes ingresarla manualmente.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function AudioInputPage() {
  const inputStore = useInputStore();
  const { activeLanguage, activeLevel } = useProgressStore();

  // State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioId, setAudioId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [transcriptionResult, setTranscriptionResult] = useState<AudioTranscriptionResult | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [showManualTranscript, setShowManualTranscript] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  // Calcular estadísticas
  const inputEvents = inputStore.events;
  const audioStats = useMemo(() => calculateAudioStats(inputEvents), [inputEvents]);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find((f) => f.type.startsWith('audio/'));

    if (audioFile) {
      try {
        validateAudioFile(audioFile);
        setAudioFile(audioFile);
        setTranscriptionError(null);
        // Reset state when new file is dropped
        setAudioId(null);
        setTranscript('');
        setTranscriptionResult(null);
      } catch (error) {
        if (error instanceof AudioTranscriptionError) {
          setTranscriptionError(error.message);
        }
      }
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    try {
      validateAudioFile(file);
      setAudioFile(file);
      setTranscriptionError(null);
      // Reset state when new file is selected
      setAudioId(null);
      setTranscript('');
      setTranscriptionResult(null);
    } catch (error) {
      if (error instanceof AudioTranscriptionError) {
        setTranscriptionError(error.message);
      }
    }
  }, []);

  // Cargar audio y transcribir
  const handleLoadAudio = useCallback(async () => {
    if (!audioFile) return;

    const id = `audio-${Date.now()}`;
    setAudioId(id);
    setIsTranscribing(true);
    setTranscriptionError(null);

    try {
      // Transcribir audio automáticamente
      const result = await transcribeAudio(audioFile, {
        language: 'fr',
        responseFormat: 'verbose_json',
      });

      setTranscriptionResult(result);
      setTranscript(result.transcript);
      setDuration(result.duration);
      setShowManualTranscript(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setTranscriptionError(`Error en la transcripción: ${errorMessage}`);
      setShowManualTranscript(true);
    } finally {
      setIsTranscribing(false);
      startTimeRef.current = Date.now();
    }
  }, [audioFile]);

  // Audio player handlers
  const handleTimeUpdate = useCallback((current: number, total: number) => {
    setCurrentTime(current);
    setDuration(total);
  }, []);

  const handlePlay = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const handlePause = useCallback(() => {
    if (startTimeRef.current && audioId) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      (inputStore as unknown as { addEvent: (event: unknown) => void }).addEvent({
        id: `audio-${audioId}-${Date.now()}`,
        type: 'audio',
        contentId: audioId,
        durationSeconds: elapsed,
        timestamp: new Date().toISOString(),
        wordsCounted: 0,
        understood: true,
      });
      startTimeRef.current = null;
    }
  }, [audioId, inputStore]);

  const handleEnd = useCallback(() => {
    handlePause();
  }, [handlePause]);

  // Marcar como escuchado
  const handleMarkAsListened = useCallback(() => {
    if (!audioId || duration === 0) {
      alert('Primero carga un audio');
      return;
    }

    const words = transcript ? estimateWordCount(transcript) : Math.floor((duration / 60) * 150);

    inputStore.markAudioAsListened(
      audioId,
      duration,
      words,
      activeLanguage,
      activeLevel
    );
    alert('¡Audio marcado como escuchado!');
  }, [audioId, duration, transcript, activeLanguage, activeLevel, inputStore]);

  return (
    <div className="space-y-6 pb-32">
      {/* Stats Section */}
      <AudioStatsSection audioStats={audioStats} />

      {/* Input Section */}
      {!audioId ? (
        <FileUploadSection
          audioFile={audioFile}
          isDragging={false}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileSelect={handleFileSelect}
          onLoadAudio={handleLoadAudio}
          isTranscribing={isTranscribing}
          transcriptionError={transcriptionError}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto px-4"
        >
          {/* Audio Info Orb */}
          <div className="relative w-full flex justify-center mb-6">
            <motion.div
              className="relative w-28 h-28 rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${INPUT_COLORS.audio.hex}, #D97706)`,
              }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div
                className="absolute inset-0 rounded-full blur-xl"
                style={{
                  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.4), transparent)',
                }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-5xl">
                🎧
              </div>
            </motion.div>
          </div>

          {/* Audio Player */}
          {audioFile && (
            <AudioPlayerSection
              audioFile={audioFile}
              currentTime={currentTime}
              duration={duration}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnd={handleEnd}
              onMarkAsListened={handleMarkAsListened}
            />
          )}

          {/* Transcripción */}
          {audioFile && (
            <TranscriptSection
              transcript={transcript}
              audioFile={audioFile}
              audioId={audioId}
              showManualTranscript={showManualTranscript}
              onToggleManual={() => setShowManualTranscript(!showManualTranscript)}
              onTranscriptChange={setTranscript}
              transcriptionResult={transcriptionResult}
            />
          )}
        </motion.div>
      )}

      {/* Import Button */}
      {audioId && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed top-20 right-4 z-50"
        >
          <motion.button
            onClick={() => window.location.href = '/import?source=podcast'}
            className="relative w-16 h-16 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${INPUT_COLORS.audio.hex}, #D97706)`,
            }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full blur-lg"
              style={{
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.4), transparent)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="relative text-3xl">✨</span>
          </motion.button>
        </motion.div>
      )}

      {/* Quick Review Button */}
      {audioId && audioFile && (
        <QuickReviewButton
          source={{
            type: 'audio',
            id: audioId,
            title: audioFile.name,
            url: '',
          }}
        />
      )}
    </div>
  );
}
