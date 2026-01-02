"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInputStore } from "@/store/useInputStore";
import { useProgressStore } from "@/store/useProgressStore";
import { WordSelector } from "@/components/transcript/WordSelector";
import { QuickReviewButton } from "@/components/transcript/QuickReviewButton";
import { ContentSource } from "@/types/srs";

export default function AudioInputPage() {
  const router = useRouter();
  const inputStore = useInputStore();
  const { activeLanguage, activeLevel } = useProgressStore();

  const [audioUrl, setAudioUrl] = useState("");
  const [audioTitle, setAudioTitle] = useState("");
  const [audioId, setAudioId] = useState<string | null>(null);
  const [wordsCount, setWordsCount] = useState(0);
  const [duration, setDuration] = useState(300); // Duración por defecto: 5 minutos
  const [transcriptText, setTranscriptText] = useState("");

  const statsKey = `${activeLanguage}-${activeLevel}`;
  const statsData = inputStore.stats[statsKey];

  // Calcular estadísticas de audio
  const audioStats = useMemo(() => {
    const audioEvents = inputStore.events.filter(
      (e) => e.type === "audio" && (e.durationSeconds || 0) > 0
    );
    // Contar audios únicos (por contentId)
    const uniqueAudioIds = new Set(
      audioEvents.map((e) => e.contentId).filter(Boolean)
    );
    const audioCount = uniqueAudioIds.size;
    const minutesListened = statsData?.minutesListened || 0;
    const totalHours = (minutesListened / 60).toFixed(2);
    const wordsHeard = statsData?.wordsHeard || 0;

    return {
      audioCount,
      totalHours,
      minutesListened,
      wordsHeard,
    };
  }, [inputStore.events, statsData]);

  const handleImport = useCallback(() => {
    router.push("/import?source=podcast");
  }, [router]);

  const handleLoadAudio = useCallback(() => {
    if (!audioUrl.trim()) return;

    const id = `audio-${Date.now()}`;
    setAudioId(id);
    setAudioTitle(audioUrl);
    // Estimar palabras basado en duración (promedio 150 palabras/minuto)
    setWordsCount(Math.floor((duration / 60) * 150));
  }, [audioUrl, duration]);

  const handleMarkAsListened = useCallback(() => {
    if (!audioId || duration === 0) {
      alert("Primero carga y reproduce un audio");
      return;
    }

    const words = wordsCount || Math.floor((duration / 60) * 150);
    inputStore.markAudioAsListened(
      audioId,
      duration,
      words,
      activeLanguage,
      activeLevel
    );
    alert("¡Audio marcado como escuchado!");
  }, [audioId, duration, wordsCount, activeLanguage, activeLevel, inputStore]);

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
              Audio
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Podcasts y diálogos con texto sincronizado
            </p>
          </div>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Importar
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estadísticas
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Audios escuchados
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {audioStats.audioCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Horas totales
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {audioStats.totalHours}h
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Palabras escuchadas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {audioStats.wordsHeard.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Cargar audio */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cargar Audio
          </h2>
          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="URL del audio o nombre del podcast..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyDown={(e) => e.key === "Enter" && handleLoadAudio()}
              />
              <button
                onClick={handleLoadAudio}
                disabled={!audioUrl.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 font-medium rounded-xl transition-colors whitespace-nowrap"
              >
                Cargar
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Duración (segundos):
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                min="0"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="300"
              />
            </div>
          </div>

          {audioId && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {audioTitle}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>
                  Duración:{" "}
                  {duration > 0
                    ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60)
                        .toString()
                        .padStart(2, "0")}`
                    : "N/A"}
                </span>
                <span>
                  Palabras:{" "}
                  {wordsCount > 0 ? wordsCount.toLocaleString() : "N/A"}
                </span>
              </div>

              {/* Campo de transcripción */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transcripción
                </label>
                {transcriptText ? (
                  <WordSelector
                    transcript={transcriptText}
                    source={
                      {
                        type: "audio",
                        id: audioId || "",
                        title: audioTitle || `Audio ${audioId}`,
                        url: audioUrl,
                      } as ContentSource
                    }
                  />
                ) : (
                  <textarea
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    placeholder="Pega aquí la transcripción del audio..."
                    className="w-full h-32 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                )}
              </div>

              <button
                onClick={handleMarkAsListened}
                disabled={duration === 0}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>Marcar como escuchado</span>
              </button>
            </div>
          )}
        </div>

        {/* Audio list placeholder */}
        {!audioId && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No hay audios disponibles. Haz clic en &quot;Importar&quot; para
              agregar podcasts o audios.
            </p>
          </div>
        )}
      </div>

      {/* Botón Quick Review */}
      {audioId && (
        <QuickReviewButton
          source={{
            type: "audio",
            id: audioId,
            title: audioTitle || `Audio ${audioId}`,
            url: audioUrl,
          }}
        />
      )}
    </div>
  );
}
