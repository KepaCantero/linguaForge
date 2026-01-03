'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInputStore } from '@/store/useInputStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useTTS } from '@/services/ttsService';
import { WordSelector } from '@/components/transcript/WordSelector';
import { QuickReviewButton } from '@/components/transcript/QuickReviewButton';
import { ContentSource } from '@/types/srs';

export default function TextInputPage() {
  const router = useRouter();
  const inputStore = useInputStore();
  const { activeLanguage, activeLevel } = useProgressStore();
  const { speak, isSpeaking, isAvailable } = useTTS();
  
  const [textContent, setTextContent] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [textId, setTextId] = useState<string | null>(null);
  
  const statsKey = `${activeLanguage}-${activeLevel}`;
  const statsData = inputStore.stats[statsKey];
  
  // Calcular estadísticas de texto
  const textStats = useMemo(() => {
    const textEvents = inputStore.events.filter((e) => e.type === 'text' && e.wordsCounted > 0);
    // Contar textos únicos (por contentId)
    const uniqueTextIds = new Set(textEvents.map(e => e.contentId).filter(Boolean));
    const textCount = uniqueTextIds.size;
    const wordsRead = statsData?.wordsRead || 0;
    const minutesRead = statsData?.minutesRead || 0;
    
    return {
      textCount,
      wordsRead,
      minutesRead,
      hoursRead: (minutesRead / 60).toFixed(2),
    };
  }, [inputStore.events, statsData]);

  const handleImport = useCallback(() => {
    router.push('/import?source=article');
  }, [router]);

  const handleLoadText = useCallback(() => {
    if (!textContent.trim()) return;
    
    const id = `text-${Date.now()}`;
    setTextId(id);
    setTextTitle(textContent.substring(0, 50) + '...');
  }, [textContent]);

  const handleMarkAsRead = useCallback(() => {
    if (!textId || !textContent.trim()) {
      alert('Primero carga un texto');
      return;
    }

    const words = textContent.split(/\s+/).filter(Boolean).length;
    inputStore.markTextAsRead(textId, words, activeLanguage, activeLevel);
    alert('¡Texto marcado como leído!');
  }, [textId, textContent, activeLanguage, activeLevel, inputStore]);

  const handlePlayAudio = useCallback(() => {
    if (!textContent.trim()) return;
    speak(textContent);
  }, [textContent, speak]);

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
              Texto
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Lecturas con audio generado automáticamente
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Textos leídos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {textStats.textCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Palabras leídas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {textStats.wordsRead.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Horas leídas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {textStats.hoursRead}h
              </p>
            </div>
          </div>
        </div>

        {/* Cargar texto */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cargar Texto
          </h2>
          {textContent ? (
            <div className="mb-4">
              <WordSelector
                transcript={textContent}
                source={{
                  type: 'text',
                  id: textId || '',
                  title: textTitle || `Texto ${textId}`,
                } as ContentSource}
              />
            </div>
          ) : (
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Pega aquí el texto en francés que quieres leer..."
              className="w-full h-48 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
            />
          )}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {textContent.split(/\s+/).filter(Boolean).length} palabras
            </span>
            <button
              onClick={handleLoadText}
              disabled={!textContent.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 font-medium rounded-xl transition-colors"
            >
              Cargar
            </button>
          </div>
          
          {textId && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {textTitle}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {textContent.split(/\s+/).filter(Boolean).length} palabras
              </p>
              
              {/* Audio Player */}
              {isAvailable && (
                <button
                  onClick={handlePlayAudio}
                  disabled={isSpeaking || !textContent.trim()}
                  className="w-full mb-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>{isSpeaking ? '🔊' : '🔈'}</span>
                  <span>{isSpeaking ? 'Reproduciendo audio...' : 'Reproducir audio'}</span>
                </button>
              )}
              
              <button
                onClick={handleMarkAsRead}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>Marcar como leído</span>
              </button>
            </div>
          )}
        </div>

        {/* Text list placeholder */}
        {!textId && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No hay textos disponibles. Haz clic en &quot;Importar&quot; para agregar artículos o textos.
            </p>
          </div>
        )}
      </div>

      {/* Botón Quick Review */}
      {textId && (
        <QuickReviewButton
          source={{
            type: 'text',
            id: textId,
            title: textTitle || `Texto ${textId}`,
          }}
        />
      )}
    </div>
  );
}

