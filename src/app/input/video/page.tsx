'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInputStore } from '@/store/useInputStore';
import { useProgressStore } from '@/store/useProgressStore';
import { YouTubePlayer } from '@/components/input/YouTubePlayer';
import { extractVideoId, getYouTubeTranscript, convertTranscriptToPhrases, type YouTubeTranscript } from '@/services/youtubeTranscriptService';
import { WordSelector } from '@/components/transcript/WordSelector';
import { QuickReviewButton } from '@/components/transcript/QuickReviewButton';
import { ContentSource } from '@/types/srs';

// ============================================
// HELPER FUNCTIONS - Reduce component complexity
// ============================================

/**
 * Fetch and process YouTube transcript
 */
async function fetchAndProcessTranscript(
  videoId: string
): Promise<{ transcript: YouTubeTranscript | null; transcriptText: string; error: string | null }> {
  try {
    console.log('[Video Page] Fetching transcript for video:', videoId);
    const fetchedTranscript = await getYouTubeTranscript(videoId);
    console.log('[Video Page] Received transcript:', fetchedTranscript);

    if (fetchedTranscript && fetchedTranscript.phrases && fetchedTranscript.phrases.length > 0) {
      const phrases = convertTranscriptToPhrases(fetchedTranscript);
      const transcriptText = phrases.join('\n');
      console.log('[Video Page] Transcript loaded successfully:', phrases.length, 'phrases');
      return { transcript: fetchedTranscript, transcriptText, error: null };
    }

    console.warn('[Video Page] No transcript found or empty phrases');
    return { transcript: null, transcriptText: '', error: 'No se encontró transcripción para este video' };
  } catch (error) {
    console.error('[Video Page] Error fetching transcript:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { transcript: null, transcriptText: '', error: `Error: ${errorMessage}` };
  }
}

/**
 * Calculate video statistics from input events
 */
function calculateVideoStats(events: import('@/types').InputEvent[]) {
  const videoEvents = events.filter(
    (e): e is import('@/types').InputEvent & { durationSeconds: number } =>
      e.type === 'video' && e.durationSeconds !== undefined && e.durationSeconds > 0
  );
  const totalSeconds = videoEvents.reduce((acc: number, e) => acc + (e.durationSeconds || 0), 0);
  const totalHours = totalSeconds / 3600;
  const uniqueVideoIds = new Set(videoEvents.map((e) => e.contentId).filter(Boolean));

  return {
    viewCount: uniqueVideoIds.size,
    totalHours: totalHours.toFixed(2),
    totalSeconds,
  };
}

/**
 * Create a video event tracking function
 */
function createVideoTracker(
  inputStore: ReturnType<typeof useInputStore>,
  startTimeRef: React.MutableRefObject<number | null>,
  videoId: string | null
) {
  return () => {
    if (startTimeRef.current && videoId) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      (inputStore as unknown as { addEvent: (event: unknown) => void }).addEvent({
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
  };
}

// ============================================
// PRESENTATION COMPONENTS - Reduce main component complexity
// ============================================

interface VideoPlayerSectionProps {
  videoId: string;
  videoTitle: string;
  youtubeUrl: string;
  currentTime: number;
  duration: number;
  onTimeUpdate: (current: number, total: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onEnd: () => void;
  onMarkAsWatched: () => void;
}

function VideoPlayerSection({
  videoId,
  videoTitle,
  youtubeUrl,
  currentTime,
  duration,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnd,
  onMarkAsWatched,
}: VideoPlayerSectionProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-aaa-xl p-6 bg-glass-surface backdrop-blur-aaa border border-white/20 mb-6">
      <YouTubePlayer
        videoId={videoId}
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onEnd={onEnd}
      />
      {videoTitle && (
        <p className="text-sm text-white/70 mt-4">{videoTitle}</p>
      )}
      {duration > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-white/60 mb-4">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
      <motion.button
        onClick={onMarkAsWatched}
        disabled={duration === 0}
        className="w-full py-4 rounded-aaa-xl font-bold text-white flex items-center justify-center gap-3"
        style={{
          background: duration === 0
            ? 'radial-gradient(circle at 30% 30%, #4B5563, #374151)'
            : 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)',
        }}
        whileHover={{ scale: duration === 0 ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-2xl">✓</span>
        <span>Marcar como visto</span>
      </motion.button>
    </div>
  );
}

interface TranscriptSectionProps {
  isLoadingTranscript: boolean;
  transcriptError: string | null;
  showManualTranscript: boolean;
  transcript: YouTubeTranscript | null;
  transcriptText: string;
  videoId: string;
  videoTitle: string;
  youtubeUrl: string;
  onToggleManual: () => void;
  onTranscriptChange: (text: string) => void;
}

function TranscriptSection({
  isLoadingTranscript,
  transcriptError,
  showManualTranscript,
  transcript,
  transcriptText,
  videoId,
  videoTitle,
  youtubeUrl,
  onToggleManual,
  onTranscriptChange,
}: TranscriptSectionProps) {
  return (
    <>
      {isLoadingTranscript && (
        <div className="mt-4 p-4 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20">
          <p className="text-sm text-white/60 text-center">Cargando transcripción...</p>
        </div>
      )}

      {transcriptError && !isLoadingTranscript && (
        <div className="mt-4 p-4 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-yellow-500/30">
          <p className="text-sm text-yellow-200 mb-2">⚠️ {transcriptError}</p>
          <button
            onClick={onToggleManual}
            className="text-sm text-yellow-300 hover:underline"
          >
            {showManualTranscript ? 'Ocultar' : 'Pegar transcripción manualmente'}
          </button>
        </div>
      )}

      {showManualTranscript && !transcript && (
        <div className="mt-4 p-4 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20">
          <label className="block text-sm font-medium text-white/90 mb-2">
            Transcripción manual
          </label>
          <textarea
            value={transcriptText}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder="Pega aquí la transcripción del video..."
            className="w-full h-48 px-4 py-3 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 text-white placeholder:text-white/50 resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
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
              id: videoId,
              title: videoTitle || `Video ${videoId}`,
              url: youtubeUrl,
            } as ContentSource}
            onWordsAdded={() => {}}
          />
        </div>
      )}
    </>
  );
}

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

  // Calcular estadísticas de video - using helper function
  const videoStats = useMemo(() => calculateVideoStats((inputStore as unknown as { events: unknown[] }).events as import('@/types').InputEvent[]), [(inputStore as unknown as { events: unknown[] }).events]);

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

    // Fetch transcript using helper function
    setIsLoadingTranscript(true);
    setTranscriptError(null);

    const { transcript, transcriptText, error } = await fetchAndProcessTranscript(extractedId);

    setTranscript(transcript);
    setTranscriptText(transcriptText);

    if (error) {
      setTranscriptError(error);
      setShowManualTranscript(true);
    }

    setIsLoadingTranscript(false);
    startTimeRef.current = Date.now();
  }, [youtubeUrl]);

  const handleTimeUpdate = useCallback((current: number, total: number) => {
    setCurrentTime(current);
    setDuration(total);
  }, []);

  const handlePlay = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const handlePause = useCallback(() => {
    createVideoTracker(inputStore, startTimeRef, videoId)();
  }, [videoId, inputStore]);

  const handleEnd = useCallback(() => {
    createVideoTracker(inputStore, startTimeRef, videoId)();
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
    <div className="space-y-8 pb-32">
      {/* Stats Orbital HUD */}
      <div className="relative w-full h-[45vh] flex items-center justify-center">
        {/* Outer decorative rings */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: `${200 + i * 40}px`,
              height: `${200 + i * 40}px`,
              borderColor: `rgba(236, 72, 153, ${0.15 - i * 0.03})`,
              borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
            }}
            animate={{
              rotate: i % 2 === 0 ? [0, 360] : [360, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 25 + i * 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        {/* Central Core - Video */}
        <motion.div
          className="relative w-32 h-32 rounded-full z-10"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #EC4899, #DB2777)',
          }}
          animate={{
            scale: [1, 1.06, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          whileHover={{ scale: 1.12 }}
        >
          {/* Core glow */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.8), transparent)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Core icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.div
              className="text-5xl"
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🎬
            </motion.div>
          </div>
        </motion.div>

        {/* Stat orbs in orbital arrangement */}
        <motion.div
          className="absolute"
          style={{
            left: 'calc(50% - 50px)',
            top: 'calc(50% - 120px)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0, type: 'spring', stiffness: 200 }}
        >
          <motion.div
            className="relative w-24 h-24 rounded-full cursor-pointer"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #EC4899, #DB2777)',
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.15, y: -18 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full blur-lg"
              style={{ background: 'radial-gradient(circle, #EC4899CC, transparent)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">📺</div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-sm font-bold text-white">{videoStats.viewCount}</div>
              <div className="text-xs text-lf-muted">Videos</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute"
          style={{
            left: 'calc(50% + 70px)',
            top: 'calc(50%)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <motion.div
            className="relative w-24 h-24 rounded-full cursor-pointer"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #F472B6, #EC4899)',
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.15, y: -18 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full blur-lg"
              style={{ background: 'radial-gradient(circle, #F472B6CC, transparent)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">⏱️</div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-sm font-bold text-white">{videoStats.totalHours}h</div>
              <div className="text-xs text-lf-muted">Horas</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-70"
            style={{
              background: i % 2 === 0 ? "#EC4899" : "#F472B6",
              left: `${25 + (i * 8) % 50}%`,
              top: `${15 + (i * 10) % 70}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, (i % 2 === 0 ? 30 : -30), 0],
              scale: [1, 0.6, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Input Section with Orbital Design */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-md mx-auto px-4"
      >
        {!videoId ? (
          <div className="space-y-4">
            {/* URL Input */}
            <motion.div
              className="relative w-full flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-6 py-4 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo()}
                />
              </div>
            </motion.div>

            {/* Load Button Orb */}
            <motion.div
              className="flex justify-center mt-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={handleLoadVideo}
                disabled={!youtubeUrl.trim()}
                className="relative w-20 h-20 rounded-full"
                style={{
                  background: !youtubeUrl.trim()
                    ? 'radial-gradient(circle at 30% 30%, #4B5563, #374151)'
                    : 'radial-gradient(circle at 30% 30%, #EC4899, #DB2777)',
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full blur-lg"
                  style={{
                    background: !youtubeUrl.trim()
                      ? 'transparent'
                      : 'radial-gradient(circle, rgba(236, 72, 153, 0.6), transparent)',
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="relative text-3xl">⚡</span>
              </button>
            </motion.div>

            {/* Empty State */}
            <div className="text-center py-8">
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🎥
              </motion.div>
              <p className="text-sm text-white/60">
                Pega una URL de YouTube para cargar un video con transcripción
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Video Info Orb */}
            <motion.div
              className="relative w-full flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              <div className="relative w-28 h-28 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #EC4899, #DB2777)',
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{
                    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.7), transparent)',
                  }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-5xl">
                  🎬
                </div>
              </div>
            </motion.div>

            {/* Video Player */}
            <VideoPlayerSection
              videoId={videoId}
              videoTitle={videoTitle}
              youtubeUrl={youtubeUrl}
              currentTime={currentTime}
              duration={duration}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnd={handleEnd}
              onMarkAsWatched={handleMarkAsWatched}
            />

            {/* Transcripción */}
            <TranscriptSection
              isLoadingTranscript={isLoadingTranscript}
              transcriptError={transcriptError}
              showManualTranscript={showManualTranscript}
              transcript={transcript}
              transcriptText={transcriptText}
              videoId={videoId}
              videoTitle={videoTitle}
              youtubeUrl={youtubeUrl}
              onToggleManual={() => setShowManualTranscript(!showManualTranscript)}
              onTranscriptChange={setTranscriptText}
            />
          </div>
        )}
      </motion.div>

      {/* Import Button - Fixed */}
      {videoId && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed top-20 right-4 z-50"
        >
          <motion.button
            onClick={handleImport}
            className="relative w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #EC4899, #DB2777)',
            }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full blur-lg"
              style={{
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6), transparent)',
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

