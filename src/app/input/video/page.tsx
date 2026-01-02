'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { YouTubePlayer } from '@/components/input/YouTubePlayer';
import { InteractiveTranscript, VocabularySuggestions } from '@/components/input/InteractiveTranscript';
import {
  getVideoInfo,
  getVideoTranscript,
  extractVideoId,
  YouTubeVideoInfo,
  YouTubeTranscript,
  getCuratedVideos,
  CuratedVideo,
} from '@/services/youtubeService';
import { ContentSource } from '@/types/srs';

// ============================================
// COMPONENTE DE BÚSQUEDA
// ============================================

function VideoSearch({
  onSelectVideo,
}: {
  onSelectVideo: (videoId: string) => void;
}) {
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(inputUrl);
    if (videoId) {
      setError('');
      onSelectVideo(videoId);
    } else {
      setError('URL de YouTube no válida');
    }
  };

  const curatedVideos = getCuratedVideos('A1');

  return (
    <div className="space-y-6">
      {/* Búsqueda por URL */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Pegar URL de YouTube
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
          >
            Cargar Video
          </button>
        </form>
      </div>

      {/* Videos curados */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Videos recomendados A1
        </h3>
        <div className="grid gap-4">
          {curatedVideos.map((video) => (
            <motion.button
              key={video.id}
              onClick={() => onSelectVideo(video.id)}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                    (e.target as HTMLImageElement).className = 'hidden';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {video.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {video.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                  </span>
                  {video.hasTranscript && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                      Transcripción
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL (CON SUSPENSE)
// ============================================

function VideoPageContent() {
  const searchParams = useSearchParams();
  const videoIdParam = searchParams.get('v');

  const [videoId, setVideoId] = useState<string | null>(videoIdParam);
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
  const [transcript, setTranscript] = useState<YouTubeTranscript | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar info del video cuando cambia el ID
  useEffect(() => {
    if (!videoId) return;

    const loadVideoData = async () => {
      setIsLoading(true);
      try {
        const [info, trans] = await Promise.all([
          getVideoInfo(videoId),
          getVideoTranscript(videoId),
        ]);
        setVideoInfo(info);
        setTranscript(trans);
      } catch (error) {
        console.error('Error loading video data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideoData();
  }, [videoId]);

  const handleSelectVideo = useCallback((id: string) => {
    setVideoId(id);
    setShowTranscript(false);
    setCurrentTime(0);
    // Actualizar URL sin recargar
    window.history.pushState({}, '', `/input/video?v=${id}`);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handlePause = useCallback(() => {
    setShowTranscript(true);
  }, []);

  const handleSeekTo = useCallback((time: number) => {
    // El YouTubePlayer expone seekTo internamente
    // Por ahora, actualizar el tiempo local
    setCurrentTime(time);
  }, []);

  // Source para el SRS
  const source: ContentSource = {
    type: 'video',
    id: videoId || '',
    title: videoInfo?.title || 'Video de YouTube',
    url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/input"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Video Input
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {!videoId ? (
          // Selector de video
          <VideoSearch onSelectVideo={handleSelectVideo} />
        ) : isLoading ? (
          // Loading
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          // Reproductor de video
          <>
            {/* YouTube Player */}
            <YouTubePlayer
              videoId={videoId}
              title={videoInfo?.title}
              onTimeUpdate={handleTimeUpdate}
              onPause={handlePause}
            />

            {/* Toggle transcripción */}
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full py-3 bg-white dark:bg-gray-800 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>📝</span>
              {showTranscript ? 'Ocultar transcripción' : 'Mostrar transcripción'}
              <svg
                className={`w-4 h-4 transition-transform ${showTranscript ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Transcripción interactiva */}
            {showTranscript && transcript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>📝</span>
                    Transcripción
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                      (Click en una frase para guardarla)
                    </span>
                  </h3>

                  <InteractiveTranscript
                    phrases={transcript.phrases}
                    currentTime={currentTime}
                    source={source}
                    onSeekTo={handleSeekTo}
                    showTranslations={false}
                    autoScroll={true}
                  />
                </div>

                {/* Sugerencias de vocabulario */}
                <VocabularySuggestions
                  phrases={transcript.phrases.slice(0, 5)}
                  source={source}
                />
              </motion.div>
            )}

            {/* Botón para cambiar video */}
            <button
              onClick={() => setVideoId(null)}
              className="w-full py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              ← Elegir otro video
            </button>
          </>
        )}
      </main>
    </div>
  );
}

// ============================================
// PÁGINA CON SUSPENSE
// ============================================

export default function VideoInputPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
        </div>
      }
    >
      <VideoPageContent />
    </Suspense>
  );
}
