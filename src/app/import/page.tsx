'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useImportedNodesStore, NODE_ICONS } from '@/store/useImportedNodesStore';
import { getTranslations } from '@/i18n';
import { 
  extractVideoId, 
  getYouTubeTranscript, 
  convertTranscriptToPhrases,
  getVideoInfo,
  type YouTubeTranscript 
} from '@/services/youtubeTranscriptService';

type ImportSource = 'podcast' | 'article' | 'youtube';
type Step = 'source' | 'content' | 'configure' | 'success';

interface Subtopic {
  id: string;
  title: string;
  phrases: string[];
}

function ImportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { appLanguage } = useUserStore();
  const { createNode } = useImportedNodesStore();
  const t = getTranslations(appLanguage);

  // Estado del flujo
  const [step, setStep] = useState<Step>('source');
  const [selectedSource, setSelectedSource] = useState<ImportSource | null>(null);

  // Función helper para obtener transcripción desde videoId
  const handleFetchYouTubeTranscriptFromId = useCallback(async (id: string) => {
    setIsLoadingTranscript(true);
    try {
      setVideoId(id);
      const fetchedTranscript = await getYouTubeTranscript(id);
      
      if (fetchedTranscript && fetchedTranscript.phrases.length > 0) {
        setTranscript(fetchedTranscript);
        const phrases = convertTranscriptToPhrases(fetchedTranscript);
        setContent(phrases.join('\n'));
        
        const videoInfo = await getVideoInfo(id);
        if (videoInfo) {
          setTopicTitle(videoInfo.title);
        }
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
    } finally {
      setIsLoadingTranscript(false);
    }
  }, []);

  // Preseleccionar fuente desde query params
  useEffect(() => {
    const sourceParam = searchParams.get('source');
    const videoIdParam = searchParams.get('videoId');
    
    if (sourceParam && ['podcast', 'article', 'youtube'].includes(sourceParam)) {
      setSelectedSource(sourceParam as ImportSource);
      setStep('content');
      
      // Si hay videoId, prellenar la URL
      if (sourceParam === 'youtube' && videoIdParam) {
        setYoutubeUrl(`https://www.youtube.com/watch?v=${videoIdParam}`);
        setVideoId(videoIdParam);
        // Intentar obtener transcripción automáticamente
        handleFetchYouTubeTranscriptFromId(videoIdParam);
      }
    }
  }, [searchParams, handleFetchYouTubeTranscriptFromId]);
  const [content, setContent] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcript, setTranscript] = useState<YouTubeTranscript | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  // Configuración del nodo
  const [topicTitle, setTopicTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📚');
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');

  // Estado de creación
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [createdNodeId, setCreatedNodeId] = useState<string | null>(null);

  const sources = [
    { id: 'podcast' as const, icon: '🎙️', label: t.import.podcast },
    { id: 'article' as const, icon: '📰', label: t.import.article },
    { id: 'youtube' as const, icon: '▶️', label: t.import.youtube },
  ];

  // Extraer frases del texto (simple: dividir por oraciones)
  const extractPhrases = (text: string): string[] => {
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10 && s.length < 200)
      .slice(0, 20); // Máximo 20 frases
  };

  // Handlers
  const handleSelectSource = (source: ImportSource) => {
    setSelectedSource(source);
    setStep('content');
    // Reset estados
    setContent('');
    setYoutubeUrl('');
    setTranscript(null);
    setVideoId(null);
  };

  // Obtener transcripción de YouTube
  const handleFetchYouTubeTranscript = async () => {
    if (!youtubeUrl.trim()) return;

    setIsLoadingTranscript(true);
    try {
      const extractedId = extractVideoId(youtubeUrl);
      if (!extractedId) {
        alert('URL de YouTube no válida');
        setIsLoadingTranscript(false);
        return;
      }

      setVideoId(extractedId);
      const fetchedTranscript = await getYouTubeTranscript(extractedId);
      
      if (fetchedTranscript && fetchedTranscript.phrases.length > 0) {
        setTranscript(fetchedTranscript);
        // Convertir transcripción a texto plano para mostrar
        const phrases = convertTranscriptToPhrases(fetchedTranscript);
        setContent(phrases.join('\n'));
        
        // Obtener información del video para el título
        const videoInfo = await getVideoInfo(extractedId);
        if (videoInfo) {
          setTopicTitle(videoInfo.title);
        }
      } else {
        // No mostrar alerta, solo dejar que el usuario pegue manualmente
        console.warn('No transcript found for video:', extractedId);
        // No mostrar alerta, solo dejar el campo vacío para que el usuario pegue manualmente
        setContent('');
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Mostrar error específico pero no bloquear
      if (errorMessage.includes('No transcript found') || errorMessage.includes('No transcript available')) {
        // No mostrar alerta, solo dejar que el usuario pegue manualmente
        console.warn('Video has no public captions:', youtubeUrl);
        setContent('');
      } else {
        // Solo mostrar error si es algo crítico
        console.error('Error fetching transcript:', errorMessage);
        alert(`No se pudo obtener la transcripción automáticamente.\n\nPor favor, pega la transcripción manualmente en el campo de texto.`);
      }
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const handleAnalyze = () => {
    if (!content.trim()) return;

    // Extraer frases del contenido
    const phrases = extractPhrases(content);

    // Crear un subtópico por defecto con las frases
    if (phrases.length > 0) {
      setSubtopics([
        {
          id: `subtopic-${Date.now()}`,
          title: 'Contenido principal',
          phrases,
        },
      ]);
    }

    // Sugerir título basado en las primeras palabras
    const suggestedTitle = content.substring(0, 50).split(' ').slice(0, 5).join(' ');
    setTopicTitle(suggestedTitle + '...');

    setStep('configure');
  };

  const handleAddSubtopic = () => {
    if (!newSubtopicTitle.trim()) return;

    setSubtopics([
      ...subtopics,
      {
        id: `subtopic-${Date.now()}`,
        title: newSubtopicTitle.trim(),
        phrases: [],
      },
    ]);
    setNewSubtopicTitle('');
  };

  const handleRemoveSubtopic = (id: string) => {
    setSubtopics(subtopics.filter((s) => s.id !== id));
  };

  const handleCreateNode = () => {
    if (!topicTitle.trim() || !selectedSource) return;

    const nodeId = createNode({
      title: topicTitle.trim(),
      icon: selectedIcon,
      sourceType: selectedSource,
      sourceText: content,
      // Para YouTube, guardar transcripción sincronizada y videoId
      transcript: selectedSource === 'youtube' && transcript ? transcript.phrases.map((p) => ({
        text: p.text,
        start: p.start,
        duration: p.duration,
      })) : undefined,
      videoId: selectedSource === 'youtube' ? videoId || undefined : undefined,
      subtopics: subtopics.map((s) => ({
        id: s.id,
        title: s.title,
        phrases: s.phrases,
      })),
    });

    setCreatedNodeId(nodeId);
    setStep('success');
  };

  const handleGoToLearn = () => {
    router.push('/learn');
  };

  const handleCreateAnother = () => {
    // Reset estado
    setStep('source');
    setSelectedSource(null);
    setContent('');
    setTopicTitle('');
    setSelectedIcon('📚');
    setSubtopics([]);
    setCreatedNodeId(null);
    setYoutubeUrl('');
    setTranscript(null);
    setVideoId(null);
    setIsLoadingTranscript(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/learn"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {t.common.back}
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.import.title}
          </h1>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-6">
          {['source', 'content', 'configure'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s || (step === 'success' && i < 3)
                    ? 'bg-indigo-500 text-white'
                    : i < ['source', 'content', 'configure', 'success'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {i < ['source', 'content', 'configure', 'success'].indexOf(step) ? '✓' : i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    i < ['source', 'content', 'configure', 'success'].indexOf(step)
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Select source */}
          {step === 'source' && (
            <motion.div
              key="source"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                ¿Qué quieres importar?
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {sources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => handleSelectSource(source.id)}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 transition-all"
                  >
                    <div className="text-3xl">{source.icon}</div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {source.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {source.id === 'article' && 'Pega el texto de un artículo'}
                        {source.id === 'podcast' && 'Pega la transcripción del podcast'}
                        {source.id === 'youtube' && 'Pega los subtítulos del video'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Paste content */}
          {step === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setStep('source')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ←
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pega tu contenido
                </h2>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="text-2xl">
                  {sources.find((s) => s.id === selectedSource)?.icon}
                </span>
                <span>{sources.find((s) => s.id === selectedSource)?.label}</span>
              </div>

              {selectedSource === 'youtube' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL del video de YouTube
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        onKeyDown={(e) => e.key === 'Enter' && handleFetchYouTubeTranscript()}
                      />
                      <button
                        onClick={handleFetchYouTubeTranscript}
                        disabled={!youtubeUrl.trim() || isLoadingTranscript}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 font-medium rounded-xl transition-colors whitespace-nowrap"
                      >
                        {isLoadingTranscript ? 'Cargando...' : 'Obtener'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Se intentará obtener automáticamente la transcripción sincronizada del video.
                      Si el video no tiene subtítulos públicos o hay un error, puedes pegar la transcripción manualmente abajo.
                    </p>
                  </div>

                  {transcript && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Transcripción obtenida ({transcript.phrases.length} frases)
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Video: {transcript.title}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Transcripción (puedes editarla)
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={transcript ? 'La transcripción aparecerá aquí...' : 'Pega la URL del video y haz clic en "Obtener" o pega la transcripción manualmente...'}
                      className="w-full h-48 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={isLoadingTranscript}
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Pega aquí el texto en francés que quieres aprender..."
                  className="w-full h-48 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              )}

              <div className="text-sm text-gray-500 dark:text-gray-400">
                {content.length > 0 && (
                  <span>
                    {content.split(/\s+/).filter(Boolean).length} palabras •{' '}
                    {extractPhrases(content).length} frases detectadas
                  </span>
                )}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!content.trim() || content.length < 20}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 font-medium rounded-xl transition-colors"
              >
                Continuar →
              </button>
            </motion.div>
          )}

          {/* Step 3: Configure node */}
          {step === 'configure' && (
            <motion.div
              key="configure"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setStep('content')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ←
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Configura tu nodo
                </h2>
              </div>

              {/* Nombre del tópico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del tópico
                </label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="Ej: En el restaurante, Viaje a París..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Icono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icono
                </label>
                <div className="flex flex-wrap gap-2">
                  {NODE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                        selectedIcon === icon
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500'
                          : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtópicos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtópicos ({subtopics.length})
                </label>

                <div className="space-y-2 mb-3">
                  {subtopics.map((subtopic) => (
                    <div
                      key={subtopic.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {subtopic.title}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          ({subtopic.phrases.length} frases)
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveSubtopic(subtopic.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Agregar subtópico */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtopicTitle}
                    onChange={(e) => setNewSubtopicTitle(e.target.value)}
                    placeholder="Nuevo subtópico..."
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtopic()}
                  />
                  <button
                    onClick={handleAddSubtopic}
                    disabled={!newSubtopicTitle.trim()}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 text-sm font-medium"
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-2">
                  Vista previa del nodo:
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-2xl">
                    {selectedIcon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {topicTitle || 'Sin título'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subtopics.length} subtópicos •{' '}
                      {subtopics.reduce((acc, s) => acc + s.phrases.length, 0)} frases
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateNode}
                disabled={!topicTitle.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 font-medium rounded-xl transition-colors"
              >
                Crear nodo →
              </button>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                className="text-6xl mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                🎉
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Nodo creado!
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Tu contenido &quot;{topicTitle}&quot; está listo para practicar.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleGoToLearn}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                >
                  Ir al mapa →
                </button>

                <button
                  onClick={handleCreateAnother}
                  className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Importar otro contenido
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function ImportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
        </div>
      }
    >
      <ImportPageContent />
    </Suspense>
  );
}
