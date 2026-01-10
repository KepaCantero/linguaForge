'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [extractedPhrases, setExtractedPhrases] = useState<string[]>([]);

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

    // No crear subtópico por defecto - el usuario debe crear los suyos
    // Las frases se almacenarán temporalmente para usarlas al crear subtópicos
    setExtractedPhrases(phrases);

    // Sugerir título basado en las primeras palabras
    const suggestedTitle = content.substring(0, 50).split(' ').slice(0, 5).join(' ');
    setTopicTitle(suggestedTitle + '...');

    setStep('configure');
  };

  const handleAddSubtopic = () => {
    if (!newSubtopicTitle.trim()) return;

    // Al primer subtópico se le asignan todas las frases extraídas
    const phrasesToAdd = subtopics.length === 0 ? extractedPhrases : [];

    setSubtopics([
      ...subtopics,
      {
        id: `subtopic-${Date.now()}`,
        title: newSubtopicTitle.trim(),
        phrases: phrasesToAdd,
      },
    ]);
    setNewSubtopicTitle('');
  };

  const handleRemoveSubtopic = (id: string) => {
    setSubtopics(subtopics.filter((s) => s.id !== id));
  };

  const handleCreateNode = () => {
    if (!topicTitle.trim() || !selectedSource) return;
    if (subtopics.length === 0) {
      alert('Debes crear al menos un subtópico antes de continuar.');
      return;
    }

    createNode({
      title: topicTitle.trim(),
      icon: selectedIcon,
      sourceType: selectedSource,
      sourceText: content,
      // Para YouTube, guardar transcripción sincronizada y videoId
      ...(selectedSource === 'youtube' && transcript && {
        transcript: transcript.phrases.map((p) => ({
          text: p.text,
          start: p.start,
          duration: p.duration,
        })),
      }),
      ...(selectedSource === 'youtube' && videoId && { videoId }),
      subtopics: subtopics.map((s) => ({
        id: s.id,
        title: s.title,
        phrases: s.phrases,
      })),
    });

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
    setExtractedPhrases([]);
    setYoutubeUrl('');
    setTranscript(null);
    setVideoId(null);
    setIsLoadingTranscript(false);
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-lf-primary/10 to-lf-secondary/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="relative flex items-center justify-between">
          {['source', 'content', 'configure'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  step === s || (step === 'success' && i < 3)
                    ? 'bg-gradient-to-r from-lf-primary to-lf-secondary border-lf-primary text-white shadow-glow-accent'
                    : i < ['source', 'content', 'configure', 'success'].indexOf(step)
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white'
                    : 'bg-lf-dark/30 border-white/20 text-lf-muted'
                }`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {i < ['source', 'content', 'configure', 'success'].indexOf(step) ? '✓' : i + 1}
              </motion.div>
              {i < 2 && (
                <motion.div
                  className={`flex-1 h-1 mx-2 rounded-full ${
                    i < ['source', 'content', 'configure', 'success'].indexOf(step)
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-lf-dark/30'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Select source */}
        {step === 'source' && (
          <motion.div
            key="source"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white"
            >
              ¿Qué quieres importar?
            </motion.h2>
            <div className="grid grid-cols-1 gap-4">
              {sources.map((source, index) => (
                <motion.button
                  key={source.id}
                  onClick={() => handleSelectSource(source.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group overflow-hidden rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 shadow-glass-xl p-5 text-left"
                >
                  {/* Animated gradient background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-lf-primary/20 via-lf-secondary/20 to-lf-accent/20"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.5,
                    }}
                  />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, transparent 50%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />

                  {/* Content */}
                  <div className="relative flex items-center gap-4">
                    <motion.div
                      className="text-4xl"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {source.icon}
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-white mb-1">
                        {source.label}
                      </div>
                      <div className="text-sm text-lf-muted">
                        {source.id === 'article' && 'Pega el texto de un artículo'}
                        {source.id === 'podcast' && 'Pega la transcripción del podcast'}
                        {source.id === 'youtube' && 'Pega los subtítulos del video'}
                      </div>
                    </div>
                    <motion.span
                      className="text-lf-accent text-2xl"
                      whileHover={{ x: 5 }}
                    >
                      →
                    </motion.span>
                  </div>
                </motion.button>
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
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setStep('source')}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-lf-muted hover:text-white transition-all"
              >
                ←
              </motion.button>
              <h2 className="text-2xl font-bold text-white">
                Pega tu contenido
              </h2>
            </div>

            <div className="flex items-center gap-2 text-sm text-lf-muted px-2">
              <span className="text-2xl">
                {sources.find((s) => s.id === selectedSource)?.icon}
              </span>
              <span>{sources.find((s) => s.id === selectedSource)?.label}</span>
            </div>

            {selectedSource === 'youtube' ? (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
                  <label className="block text-sm font-medium text-white mb-2">
                    URL del video de YouTube
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 px-4 py-3 rounded-xl bg-lf-dark/30 border border-white/20 text-white placeholder:text-lf-muted focus:ring-2 focus:ring-lf-accent focus:border-transparent"
                      onKeyDown={(e) => e.key === 'Enter' && handleFetchYouTubeTranscript()}
                    />
                    <motion.button
                      onClick={handleFetchYouTubeTranscript}
                      disabled={!youtubeUrl.trim() || isLoadingTranscript}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-lf-primary to-lf-secondary text-white font-medium shadow-glass-xl hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                    >
                      {isLoadingTranscript ? 'Cargando...' : 'Obtener'}
                    </motion.button>
                  </div>
                  <p className="text-xs text-lf-muted mt-2">
                    Se intentará obtener automáticamente la transcripción sincronizada del video.
                    Si el video no tiene subtítulos públicos o hay un error, puedes pegar la transcripción manualmente abajo.
                  </p>
                </div>

                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-xl bg-green-500/10 backdrop-blur-md border border-green-500/30 p-4"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
                      animate={{ opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="relative flex items-center gap-2 mb-2">
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-green-400"
                      >
                        ✓
                      </motion.span>
                      <span className="text-sm font-medium text-green-300">
                        Transcripción obtenida ({transcript.phrases.length} frases)
                      </span>
                    </div>
                    <p className="text-xs text-green-400/80">
                      Video: {transcript.title}
                    </p>
                  </motion.div>
                )}

                <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
                  <label className="block text-sm font-medium text-white mb-2">
                    Transcripción (puedes editarla)
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={transcript ? 'La transcripción aparecerá aquí...' : 'Pega la URL del video y haz clic en "Obtener" o pega la transcripción manualmente...'}
                    className="w-full h-48 px-4 py-3 rounded-xl bg-lf-dark/30 border border-white/20 text-white placeholder:text-lf-muted resize-none focus:ring-2 focus:ring-lf-accent focus:border-transparent"
                    disabled={isLoadingTranscript}
                  />
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Pega aquí el texto en francés que quieres aprender..."
                  className="w-full h-48 px-4 py-3 rounded-xl bg-lf-dark/30 border border-white/20 text-white placeholder:text-lf-muted resize-none focus:ring-2 focus:ring-lf-accent focus:border-transparent"
                  autoFocus
                />
              </div>
            )}

            {content.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-lf-muted px-2"
              >
                <span>
                  {content.split(/\s+/).filter(Boolean).length} palabras •{' '}
                  {extractPhrases(content).length} frases detectadas
                </span>
              </motion.div>
            )}

            <motion.button
              onClick={handleAnalyze}
              disabled={!content.trim() || content.length < 20}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-lf-primary to-lf-secondary text-white font-bold shadow-glass-xl hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continuar →
            </motion.button>
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
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setStep('content')}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-lf-muted hover:text-white transition-all"
              >
                ←
              </motion.button>
              <h2 className="text-2xl font-bold text-white">
                Configura tu nodo
              </h2>
            </div>

            {/* Nombre del tópico */}
            <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-lf-primary/10 to-lf-secondary/10"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="relative">
                <label className="block text-sm font-medium text-white mb-2">
                  Nombre del tópico
                </label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="Ej: En el restaurante, Viaje a París..."
                  className="w-full px-4 py-3 rounded-xl bg-lf-dark/30 border border-white/20 text-white placeholder:text-lf-muted focus:ring-2 focus:ring-lf-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* Icono */}
            <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-lf-secondary/10 to-lf-accent/10"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              />
              <div className="relative">
                <label className="block text-sm font-medium text-white mb-3">
                  Icono
                </label>
                <div className="flex flex-wrap gap-2">
                  {NODE_ICONS.map((icon) => (
                    <motion.button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all border-2 ${
                        selectedIcon === icon
                          ? 'bg-gradient-to-br from-lf-primary to-lf-secondary border-lf-primary shadow-glow-accent'
                          : 'bg-glass-surface backdrop-blur-md border-white/20 hover:border-white/40'
                      }`}
                    >
                      {icon}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtópicos */}
            <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-lf-accent/10 to-lf-primary/10"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, delay: 2 }}
              />
              <div className="relative">
                <label className="block text-sm font-medium text-white mb-2">
                  Subtópicos ({subtopics.length})
                </label>
                {extractedPhrases.length > 0 && subtopics.length === 0 && (
                  <p className="text-xs text-lf-accent mb-3">
                    ✓ {extractedPhrases.length} frases extraídas listas para asignar
                  </p>
                )}
                {subtopics.length > 0 && (
                  <p className="text-xs text-lf-muted mb-3">
                    {subtopics.reduce((acc, s) => acc + s.phrases.length, 0)} de {extractedPhrases.length} frases asignadas
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {subtopics.map((subtopic) => (
                    <motion.div
                      key={subtopic.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-lf-dark/20 border border-white/10"
                    >
                      <div>
                        <span className="font-medium text-white">
                          {subtopic.title}
                        </span>
                        <span className="text-sm text-lf-muted ml-2">
                          ({subtopic.phrases.length} frases)
                        </span>
                      </div>
                      <motion.button
                        onClick={() => handleRemoveSubtopic(subtopic.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        ✕
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                {/* Agregar subtópico */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtopicTitle}
                    onChange={(e) => setNewSubtopicTitle(e.target.value)}
                    placeholder={subtopics.length === 0 ? "Ej: Vocabulario, Gramática..." : "Nuevo subtópico..."}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-lf-dark/30 border border-white/20 text-white placeholder:text-lf-muted focus:ring-2 focus:ring-lf-accent focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtopic()}
                  />
                  <motion.button
                    onClick={handleAddSubtopic}
                    disabled={!newSubtopicTitle.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-lf-secondary to-lf-accent text-white font-medium shadow-glass-xl hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    + Agregar
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="relative overflow-hidden rounded-xl bg-lf-accent/10 backdrop-blur-md border border-lf-accent/30 p-4">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-lf-accent/10 to-lf-primary/10"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="relative">
                <p className="text-sm font-medium text-lf-accent mb-3">
                  Vista previa del nodo:
                </p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20">
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-lf-primary to-lf-secondary flex items-center justify-center text-2xl shadow-depth-lg"
                    whileHover={{ rotate: 5, scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {selectedIcon}
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {topicTitle || 'Sin título'}
                    </p>
                    <p className="text-sm text-lf-muted">
                      {subtopics.length} subtópicos •{' '}
                      {subtopics.reduce((acc, s) => acc + s.phrases.length, 0)} frases
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              onClick={handleCreateNode}
              disabled={!topicTitle.trim() || subtopics.length === 0}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-lf-primary to-lf-secondary text-white font-bold shadow-glass-xl hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {subtopics.length === 0 ? 'Crea al menos un subtópico' : 'Crear nodo →'}
            </motion.button>
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
              className="text-7xl mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
            >
              🎉
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-3">
              ¡Nodo creado!
            </h2>

            <p className="text-lf-muted mb-8">
              Tu contenido &quot;{topicTitle}&quot; está listo para practicar.
            </p>

            <div className="space-y-3">
              <motion.button
                onClick={handleGoToLearn}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-lf-primary to-lf-secondary text-white font-bold shadow-glass-xl hover:shadow-glow-accent transition-all"
              >
                Ir al mapa →
              </motion.button>

              <motion.button
                onClick={handleCreateAnother}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-white font-medium hover:bg-lf-dark/30 transition-all"
              >
                Importar otro contenido
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ImportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-lf-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      }
    >
      <ImportPageContent />
    </Suspense>
  );
}
