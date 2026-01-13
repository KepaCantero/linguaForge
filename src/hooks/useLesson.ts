/**
 * Custom hook for managing lesson state and data loading
 * Implements strict TypeScript types and error handling
 */

import { useState, useEffect, useMemo } from 'react';
import type { TopicLeaf, TopicBranch, LessonContent, LanguageCode, LevelCode } from '@/types';

interface UseLessonReturn {
    leaf: TopicLeaf | null;
    branch: TopicBranch | null;
    lessonContent: LessonContent | null;
    loading: boolean;
    error: string | null;
}

export function useLesson(leafId: string, language: LanguageCode, level: LevelCode): UseLessonReturn {
    const [leaf, setLeaf] = useState<TopicLeaf | null>(null);
    const [branch, setBranch] = useState<TopicBranch | null>(null);
    const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchLessonData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Determine JSON path based on level and leafId
                let jsonPath: string;
                if (level === 'A0' || leafId.startsWith('nodo-0-')) {
                    // ÁREA 0 - Base Absoluta
                    jsonPath = `/content/${language}/A0/base-absoluta/${leafId}.json`;
                } else {
                    // Regular lessons
                    jsonPath = `/content/${language}/${level}/lessons/${leafId}.json`;
                }


                const response = await fetch(jsonPath);

                if (!response.ok) {
                    throw new Error(`Failed to load lesson: ${response.status} ${response.statusText}`);
                }

                const rawData = await response.json();

                if (!isMounted) return;

                // Create a minimal leaf from the lesson data
                const minimalLeaf: TopicLeaf = {
                    id: rawData.leafId || leafId,
                    title: rawData.title || 'Lección',
                    titleFr: rawData.titleFr || rawData.title || 'Leçon',
                    grammar: [],
                    estimatedMinutes: rawData.estimatedMinutes || 15,
                };

                setLeaf(minimalLeaf);
                setBranch(null); // We don't need branch info for rendering
                setLessonContent(rawData);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Error al cargar la lección');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (leafId && language && level) {
            fetchLessonData();
        }

        return () => {
            isMounted = false;
        };
    }, [leafId, language, level]);

    return useMemo(() => ({
        leaf,
        branch,
        lessonContent,
        loading,
        error,
    }), [leaf, branch, lessonContent, loading, error]);
}
