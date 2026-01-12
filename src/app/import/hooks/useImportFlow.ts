import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { getTranslations } from '@/i18n';
import { useYouTubeImport } from '@/hooks/useYouTubeImport';
import { analyzeContent } from '@/services/importFlowService';
import type { ImportSourceOption } from '@/components/import/ImportSourceSelector';

type ImportSource = 'podcast' | 'article' | 'youtube';
type Step = 'source' | 'content' | 'configure' | 'success';

export interface Subtopic {
  id: string;
  title: string;
  phrases: string[];
}

export function useImportFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { appLanguage } = useUserStore();
  const { createNode } = useImportedNodesStore();
  const t = getTranslations(appLanguage);
  const youTubeImport = useYouTubeImport();

  const [step, setStep] = useState<Step>('source');
  const [selectedSource, setSelectedSource] = useState<ImportSource | null>(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📚');
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');
  const [extractedPhrases, setExtractedPhrases] = useState<string[]>([]);
  const [content, setContent] = useState('');

  const sources: ImportSourceOption[] = [
    { id: 'podcast', icon: '🎙️', label: t.import.podcast },
    { id: 'article', icon: '📰', label: t.import.article },
    { id: 'youtube', icon: '▶️', label: t.import.youtube },
  ];

  // Preselect source from query params
  useEffect(() => {
    const sourceParam = searchParams.get('source');
    const videoIdParam = searchParams.get('videoId');

    if (sourceParam && ['podcast', 'article', 'youtube'].includes(sourceParam)) {
      setSelectedSource(sourceParam as ImportSource);
      setStep('content');

      if (sourceParam === 'youtube' && videoIdParam) {
        youTubeImport.setYoutubeUrl(`https://www.youtube.com/watch?v=${videoIdParam}`);
        youTubeImport.fetchTranscriptFromId(videoIdParam);
      }
    }
  }, [searchParams, youTubeImport]);

  const handleSelectSource = (source: ImportSource) => {
    setSelectedSource(source);
    setStep('content');
    setContent('');
    youTubeImport.reset();
  };

  const handleAnalyze = () => {
    if (!content.trim()) return;

    const { phrases, suggestedTitle } = analyzeContent(content);
    setExtractedPhrases(phrases);
    setTopicTitle(suggestedTitle);
    setStep('configure');
  };

  const handleAddSubtopic = () => {
    if (!newSubtopicTitle.trim()) return;

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
    if (subtopics.length === 0) return alert('Debes crear al menos un subtópico antes de continuar.');

    createNode({
      title: topicTitle.trim(),
      icon: selectedIcon,
      sourceType: selectedSource,
      sourceText: content,
      ...(selectedSource === 'youtube' && youTubeImport.transcript && {
        transcript: youTubeImport.transcript.phrases.map((p) => ({
          text: p.text,
          start: p.start,
          duration: p.duration,
        })),
      }),
      ...(selectedSource === 'youtube' && youTubeImport.videoId && { videoId: youTubeImport.videoId }),
      subtopics: subtopics.map((s) => ({
        id: s.id,
        title: s.title,
        phrases: s.phrases,
      })),
    });

    setStep('success');
  };

  const handleGoToLearn = () => router.push('/learn');

  const handleCreateAnother = () => {
    setStep('source');
    setSelectedSource(null);
    setContent('');
    setTopicTitle('');
    setSelectedIcon('📚');
    setSubtopics([]);
    setExtractedPhrases([]);
    youTubeImport.reset();
  };

  return {
    step,
    setStep,
    selectedSource,
    topicTitle,
    setTopicTitle,
    selectedIcon,
    setSelectedIcon,
    subtopics,
    newSubtopicTitle,
    setNewSubtopicTitle,
    extractedPhrases,
    content,
    setContent,
    sources,
    youTubeImport,
    handleSelectSource,
    handleAnalyze,
    handleAddSubtopic,
    handleRemoveSubtopic,
    handleCreateNode,
    handleGoToLearn,
    handleCreateAnother,
  };
}
