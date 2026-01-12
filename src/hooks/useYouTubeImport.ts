import { useState, useCallback } from 'react';
import {
  extractVideoId,
  getYouTubeTranscript,
  convertTranscriptToPhrases,
  getVideoInfo,
  type YouTubeTranscript,
} from '@/services/youtubeTranscriptService';

export interface YouTubeImportState {
  youtubeUrl: string;
  videoId: string | null;
  transcript: YouTubeTranscript | null;
  isLoadingTranscript: boolean;
  content: string;
  topicTitle: string;
}

export interface YouTubeImportActions {
  setYoutubeUrl: (url: string) => void;
  setVideoId: (id: string | null) => void;
  setTranscript: (transcript: YouTubeTranscript | null) => void;
  setContent: (content: string) => void;
  setTopicTitle: (title: string) => void;
  fetchTranscriptFromUrl: () => Promise<void>;
  fetchTranscriptFromId: (id: string) => Promise<void>;
  reset: () => void;
}

const initialState: YouTubeImportState = {
  youtubeUrl: '',
  videoId: null,
  transcript: null,
  isLoadingTranscript: false,
  content: '',
  topicTitle: '',
};

/**
 * Custom hook for YouTube import functionality
 * Isolates YouTube transcript fetching and state management logic
 * Reduces complexity of import page component
 */
export function useYouTubeImport(): YouTubeImportState & YouTubeImportActions {
  const [state, setState] = useState<YouTubeImportState>(initialState);

  const setYoutubeUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, youtubeUrl: url }));
  }, []);

  const setVideoId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, videoId: id }));
  }, []);

  const setTranscript = useCallback((transcript: YouTubeTranscript | null) => {
    setState((prev) => ({ ...prev, transcript }));
  }, []);

  const setContent = useCallback((content: string) => {
    setState((prev) => ({ ...prev, content }));
  }, []);

  const setTopicTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, topicTitle: title }));
  }, []);

  const fetchTranscriptFromId = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoadingTranscript: true }));
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
      setState((prev) => ({ ...prev, isLoadingTranscript: false }));
    }
  }, [setVideoId, setTranscript, setContent, setTopicTitle]);

  const fetchTranscriptFromUrl = useCallback(async () => {
    const { youtubeUrl } = state;
    if (!youtubeUrl.trim()) return;

    setState((prev) => ({ ...prev, isLoadingTranscript: true }));
    try {
      const extractedId = extractVideoId(youtubeUrl);
      if (!extractedId) {
        alert('URL de YouTube no válida');
        setState((prev) => ({ ...prev, isLoadingTranscript: false }));
        return;
      }

      setVideoId(extractedId);
      const fetchedTranscript = await getYouTubeTranscript(extractedId);

      if (fetchedTranscript && fetchedTranscript.phrases.length > 0) {
        setTranscript(fetchedTranscript);
        const phrases = convertTranscriptToPhrases(fetchedTranscript);
        setContent(phrases.join('\n'));

        const videoInfo = await getVideoInfo(extractedId);
        if (videoInfo) {
          setTopicTitle(videoInfo.title);
        }
      } else {
        console.warn('No transcript found for video:', extractedId);
        setContent('');
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      if (errorMessage.includes('No transcript found') || errorMessage.includes('No transcript available')) {
        console.warn('Video has no public captions:', youtubeUrl);
        setContent('');
      } else {
        console.error('Error fetching transcript:', errorMessage);
        alert(`No se pudo obtener la transcripción automáticamente.\n\nPor favor, pega la transcripción manualmente en el campo de texto.`);
      }
    } finally {
      setState((prev) => ({ ...prev, isLoadingTranscript: false }));
    }
  }, [state.youtubeUrl, setVideoId, setTranscript, setContent, setTopicTitle]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    setYoutubeUrl,
    setVideoId,
    setTranscript,
    setContent,
    setTopicTitle,
    fetchTranscriptFromUrl,
    fetchTranscriptFromId,
    reset,
  };
}
