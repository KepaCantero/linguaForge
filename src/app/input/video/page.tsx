'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useInputStore } from '@/store/useInputStore';
import { useProgressStore } from '@/store/useProgressStore';
import { YouTubePlayer } from '@/components/input/YouTubePlayer';
import { extractVideoId, getYouTubeTranscript, convertTranscriptToPhrases, type YouTubeTranscript } from '@/services/youtubeTranscriptService';
import { WordSelector } from '@/components/transcript/WordSelector';
import { QuickReviewButton } from '@/components/transcript/QuickReviewButton';
import { ContentSource } from '@/types/srs';

export default function VideoInputPage() {
  const inputStore = useInputStore();
  const { activeLanguage, activeLevel } = useProgressStore();

  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<YouTubeTranscript | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [showManualTranscript, setShowManualTranscript] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  // Calcular estadísticas de video
  const videoStats = useMemo(() => {
    const videoEvents = inputStore.events.filter(
      (e): e is typeof e & { durationSeconds: number } =>
        e.type === 'video' && e.durationSeconds !== undefined && e.durationSeconds > 0
    );
    const totalSeconds = videoEvents.reduce((acc, e) => acc + (e.durationSeconds || 0), 0);
    const totalHours = totalSeconds / 3600;
    // Contar videos únicos (por contentId)
    const uniqueVideoIds = new Set(videoEvents.map(e => e.contentId).filter(Boolean));
    const viewCount = uniqueVideoIds.size;

    return {
      viewCount,
      totalHours: totalHours.toFixed(2),
      totalSeconds,
    };
  }, [inputStore.events]);

  // El tracking de tiempo se hace en el componente YouTubePlayer

  const handleLoadVideo = useCallback(async () => {
    if (!youtubeUrl.trim()) return;

    const extractedId = extractVideoId(youtubeUrl);
    if (!extractedId) {
      alert('URL de YouTube no válida');
      return;
    }

    setVideoId(extractedId);
    setVideoTitle(youtubeUrl);
    setCurrentTime(0);
    setDuration(0);
    setTranscript(null);
    setTranscriptText('');
    setTranscriptError(null);
    setShowManualTranscript(false);

    // Intentar obtener transcripción automáticamente
    setIsLoadingTranscript(true);
    setTranscriptError(null);
    try {
      console.log('[Video Page] Fetching transcript for video:', extractedId);
      const fetchedTranscript = await getYouTubeTranscript(extractedId);
      console.log('[Video Page] Received transcript:', fetchedTranscript);

      if (fetchedTranscript && fetchedTranscript.phrases && fetchedTranscript.phrases.length > 0) {
        setTranscript(fetchedTranscript);
        const phrases = convertTranscriptToPhrases(fetchedTranscript);
        setTranscriptText(phrases.join('\n'));
        setTranscriptError(null);
        console.log('[Video Page] Transcript loaded successfully:', phrases.length, 'phrases');
      } else {
        console.warn('[Video Page] No transcript found or empty phrases');
        setTranscriptError('No se encontró transcripción para este video');
        setShowManualTranscript(true);
      }
    } catch (error) {
      console.error('[Video Page] Error fetching transcript:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setTranscriptError(`Error: ${errorMessage}`);
      setShowManualTranscript(true);
    } finally {
      setIsLoadingTranscript(false);
    }

    // No crear evento aquí, solo cuando se marque como visto
    startTimeRef.current = Date.now();
  }, [youtubeUrl, inputStore]);

  const handleTimeUpdate = useCallback((current: number, total: number) => {
    setCurrentTime(current);
    setDuration(total);
  }, []);

  const handlePlay = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const handlePause = useCallback(() => {
    if (startTimeRef.current && videoId) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      inputStore.addEvent({
        id: `video-${videoId}-${Date.now()}`,
        type: 'video',
        contentId: videoId,
        durationSeconds: elapsed,
        timestamp: new Date().toISOString(),
        wordsCounted: 0,
        understood: true,
      });
      startTimeRef.current = null;
    }
  }, [videoId, inputStore]);

  const handleEnd = useCallback(() => {
    if (startTimeRef.current && videoId) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      inputStore.addEvent({
        id: `video-${videoId}-${Date.now()}`,
        type: 'video',
        contentId: videoId,
        durationSeconds: elapsed,
        timestamp: new Date().toISOString(),
        wordsCounted: 0,
        understood: true,
      });
      startTimeRef.current = null;
    }
  }, [videoId, inputStore]);

  const handleImport = useCallback(() => {
    if (!videoId) {
      alert('Primero carga un video');
      return;
    }

    // Redirigir a importar con el videoId prellenado
    window.location.href = `/import?source=youtube&videoId=${videoId}`;
  }, [videoId]);

  const handleMarkAsWatched = useCallback(() => {
    if (!videoId || duration === 0) {
      alert('Primero carga y reproduce un video');
      return;
    }

    inputStore.markVideoAsWatched(videoId, duration, activeLanguage, activeLevel);
    alert('¡Video marcado como visto!');
  }, [videoId, duration, activeLanguage, activeLevel, inputStore]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/input"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <span className="text-xl">←</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Video
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Videos de YouTube con transcripción sincronizada
            </p>
          </div>
          {videoId && (
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Importar
            </button>
          )}
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estadísticas
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Visualizaciones</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {videoStats.viewCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Horas totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {videoStats.totalHours}h
              </p>
            </div>
          </div>
        </div>

        {/* Cargar video */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cargar Video
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo()}
            />
            <button
              onClick={handleLoadVideo}
              disabled={!youtubeUrl.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 font-medium rounded-xl transition-colors whitespace-nowrap"
            >
              Cargar
            </button>
          </div>
        </div>

        {/* Video Player */}
        {videoId && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <YouTubePlayer
              videoId={videoId}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnd={handleEnd}
            />
            {videoTitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                {videoTitle}
              </p>
            )}
            {duration > 0 && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>
                  {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                </span>
                <span>
                  {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            <button
              onClick={handleMarkAsWatched}
              disabled={duration === 0}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <span>✓</span>
              <span>Marcar como visto</span>
            </button>

            {/* Transcripción */}
            {isLoadingTranscript && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Cargando transcripción...
                </p>
              </div>
            )}

            {transcriptError && !isLoadingTranscript && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ {transcriptError}
                </p>
                <button
                  onClick={() => setShowManualTranscript(!showManualTranscript)}
                  className="text-sm text-yellow-700 dark:text-yellow-300 hover:underline"
                >
                  {showManualTranscript ? 'Ocultar' : 'Pegar transcripción manualmente'}
                </button>
              </div>
            )}

            {showManualTranscript && !transcript && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transcripción manual
                </label>
                <textarea
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="Pega aquí la transcripción del video..."
                  className="w-full h-48 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
            )}

            {transcript && transcriptText && (
              <div className="mt-4">
                <WordSelector
                  transcript={transcriptText}
                  phrases={transcript.phrases}
                  source={{
                    type: 'video',
                    id: videoId || '',
                    title: videoTitle || `Video ${videoId}`,
                    url: youtubeUrl,
                  } as ContentSource}
                  onWordsAdded={() => {
                    // Opcional: mostrar notificación
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón Quick Review */}
      {videoId && (
        <QuickReviewButton
          source={{
            type: 'video',
            id: videoId,
            title: videoTitle || `Video ${videoId}`,
            url: youtubeUrl,
          }}
        />
      )}
    </div>
  );
}

