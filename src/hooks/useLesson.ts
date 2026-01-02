/**
 * Custom hook for managing lesson state and data loading
 * Implements strict TypeScript types and error handling
 */

import { useState, useEffect, useMemo } from 'react';
import type { TopicLeaf, TopicBranch, LessonContent, LanguageCode, LevelCode } from '@/types';
import { TopicTreeSchema } from '@/types';
import { loadLesson } from '@/services/lessonLoader';
import { loadWorld } from '@/services/contentLoader';

interface UseLessonReturn {
    leaf: TopicLeaf | null;
    branch: TopicBranch | null;
    lessonContent: LessonContent | null;
    world: { id: string; janusMatrix?: { id: string; title: string; description?: string; columns: unknown[] } } | null;
    loading: boolean;
    error: string | null;
}

export function useLesson(leafId: string, language: LanguageCode, level: LevelCode): UseLessonReturn {
    const [leaf, setLeaf] = useState<TopicLeaf | null>(null);
    const [branch, setBranch] = useState<TopicBranch | null>(null);
    const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
    const [world, setWorld] = useState<{ id: string; janusMatrix?: { id: string; title: string; description?: string; columns: unknown[] } } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchLessonData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load topic tree to find leaf and branch
                const treeData = await import(`@/../content/${language}/${level}/topic-tree.json`);
                const parsedTree = TopicTreeSchema.parse(treeData.default || treeData);

                // Find the leaf and branch
                let foundLeaf: TopicLeaf | null = null;
                let foundBranch: TopicBranch | null = null;
                for (const b of parsedTree.branches) {
                    const found = b.leaves.find((l) => l.id === leafId);
                    if (found) {
                        foundLeaf = found;
                        foundBranch = b;
                        break;
                    }
                }

                if (!foundLeaf || !foundBranch) {
                    throw new Error(`Leaf ${leafId} not found in topic tree`);
                }

                // Load lesson content
                const loadedLesson = await loadLesson(language, level, leafId);

                // Load world if available (worldId is determined by language/level)
                let worldData = null;
                const worldId = language === 'fr' && level === 'A1' ? 'airbnb' :
                    language === 'fr' && level === 'A2' ? 'restaurant' :
                        language === 'de' && level === 'A1' ? 'airbnb' : 'airbnb';
                try {
                    worldData = await loadWorld(language, level, worldId);
                } catch {
                    // World loading is optional
                }

                if (!isMounted) return;

                setLeaf(foundLeaf);
                setBranch(foundBranch);
                setLessonContent(loadedLesson);
                if (worldData) {
                    setWorld(worldData);
                }
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
        world,
        loading,
        error,
    }), [leaf, branch, lessonContent, world, loading, error]);
}

