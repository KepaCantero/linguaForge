import { useParams, useRouter, useSearchParams } from 'next/navigation';

/**
 * Custom hook for exercise route parameters
 * Extracts nodeId and subtopicId from URL
 */
export function useExerciseRouteParams() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nodeId = params.nodeId as string;
  const subtopicId = searchParams.get('subtopic');

  return { nodeId, subtopicId, router };
}
