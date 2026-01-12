'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { type ImportedNode, type ImportedSubtopic, useImportedNodesStore } from '@/store/useImportedNodesStore';

type LessonMode = 'academia' | 'desafio';

interface PracticeModeData {
  nodeId: string;
  subtopicId: string | null;
  node: ImportedNode;
  subtopic: ImportedSubtopic;
  handleModeSelect: (mode: LessonMode) => void;
}

interface PracticeModeDataResult {
  data: PracticeModeData | null;
  isLoading: boolean;
  error: 'node_not_found' | 'subtopic_not_found' | null;
}

/**
 * Custom hook to manage practice mode data and navigation logic.
 * Extracts data fetching and mode selection handlers from the page component.
 */
export function usePracticeModeData(): PracticeModeDataResult {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nodeId = params.nodeId as string;
  const subtopicId = searchParams.get('subtopic');

  const { nodes } = useImportedNodesStore();
  const node = nodes.find((n) => n.id === nodeId);
  const subtopic = node?.subtopics.find((s) => s.id === subtopicId);

  const handleModeSelect = (mode: LessonMode) => {
    if (!nodeId || !subtopicId) return;
    router.push(`/learn/imported/${nodeId}/exercises?subtopic=${subtopicId}&mode=${mode}`);
  };

  // Validate data
  if (!node) {
    return {
      data: null,
      isLoading: false,
      error: 'node_not_found',
    };
  }

  if (!subtopic) {
    return {
      data: null,
      isLoading: false,
      error: 'subtopic_not_found',
    };
  }

  return {
    data: {
      nodeId,
      subtopicId,
      node,
      subtopic,
      handleModeSelect,
    },
    isLoading: false,
    error: null,
  };
}
