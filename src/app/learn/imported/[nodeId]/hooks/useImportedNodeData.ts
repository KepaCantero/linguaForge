import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ImportedNode, useImportedNodesStore } from '@/store/useImportedNodesStore';

interface UseImportedNodeDataReturn {
  nodeId: string | null;
  node: ImportedNode | null;
  isMounted: boolean;
  isRedirecting: boolean;
  handleSubtopicClick: (subtopicId: string) => void;
}

/**
 * Custom hook to manage imported node data and navigation logic.
 * Handles data fetching, redirection to first subtopic, and navigation handlers.
 *
 * @returns Object containing node data, state, and navigation handlers
 */
export function useImportedNodeData(): UseImportedNodeDataReturn {
  const params = useParams();
  const nodeId = params.nodeId as string;
  const router = useRouter();

  const { nodes } = useImportedNodesStore();
  const node = nodes.find((n) => n.id === nodeId) || null;

  // State to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Set mounted state on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect to first subtopic if exists
  useEffect(() => {
    if (isMounted && node && node.subtopics.length > 0) {
      const firstSubtopic = node.subtopics[0];
      setIsRedirecting(true);
      router.push(`/learn/imported/${nodeId}/exercises?subtopic=${firstSubtopic.id}&mode=academia`);
    }
  }, [isMounted, node, nodeId, router]);

  // Navigation handler for subtopic clicks
  const handleSubtopicClick = useCallback((subtopicId: string) => {
    if (!nodeId) return;
    router.push(`/learn/imported/${nodeId}/exercises?subtopic=${subtopicId}&mode=academia`);
  }, [nodeId, router]);

  return {
    nodeId,
    node,
    isMounted,
    isRedirecting,
    handleSubtopicClick,
  };
}
