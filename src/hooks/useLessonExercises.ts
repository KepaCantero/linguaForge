/**
 * Custom hook for managing exercise state and progression
 * Handles all exercise types and their completion logic
 */

import { useState, useCallback, useMemo } from 'react';
import type { LessonContent, LessonMode } from '@/types';

export type LessonPhase = 'intro' | 'exercise-menu' | 'exercises' | 'input' | 'test' | 'complete';
export type PhrasePhase = 'cloze' | 'variations';
export type ExerciseType =
    | 'vocabulary'
    | 'pragmaStrike'
    | 'phrases'
    | 'shardDetection'
    | 'echoStream'
    | 'glyphWeaving'
    | 'resonancePath';

interface ExerciseState {
    phase: LessonPhase;
    exerciseType: ExerciseType | null;
    phrasePhase: PhrasePhase;
    phraseIndex: number;
    vocabularyIndex: number;
    pragmaIndex: number;
    shardIndex: number;
    echoStreamIndex: number;
    glyphWeavingIndex: number;
    resonancePathIndex: number;
    inputIndex: number;
}

interface UseLessonExercisesReturn {
    state: ExerciseState;
    setPhase: (phase: LessonPhase) => void;
    setExerciseType: (type: ExerciseType | null) => void;
    setPhrasePhase: (phase: PhrasePhase) => void;
    setPhraseIndex: (index: number) => void;
    setVocabularyIndex: (index: number) => void;
    setPragmaIndex: (index: number) => void;
    setShardIndex: (index: number) => void;
    setEchoStreamIndex: (index: number) => void;
    setGlyphWeavingIndex: (index: number) => void;
    setResonancePathIndex: (index: number) => void;
    setInputIndex: (index: number) => void;
    moveToNextExerciseType: (lessonContent: LessonContent | null) => void;
    returnToMenu: () => void;
}

export function useLessonExercises(lessonMode: LessonMode | null): UseLessonExercisesReturn {
    const [phase, setPhase] = useState<LessonPhase>('intro');
    const [exerciseType, setExerciseType] = useState<ExerciseType | null>(null);
    const [phrasePhase, setPhrasePhase] = useState<PhrasePhase>('cloze');
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [vocabularyIndex, setVocabularyIndex] = useState(0);
    const [pragmaIndex, setPragmaIndex] = useState(0);
    const [shardIndex, setShardIndex] = useState(0);
    const [echoStreamIndex, setEchoStreamIndex] = useState(0);
    const [glyphWeavingIndex, setGlyphWeavingIndex] = useState(0);
    const [resonancePathIndex, setResonancePathIndex] = useState(0);
    const [inputIndex, setInputIndex] = useState(0);

    const returnToMenu = useCallback(() => {
        if (lessonMode === 'academia') {
            setPhase('exercise-menu');
        } else {
            setPhase('complete');
        }
    }, [lessonMode]);

    const moveToNextExerciseType = useCallback((lessonContent: LessonContent | null) => {
        if (!lessonContent) return;

        const exerciseAvailability = getExerciseAvailability(lessonContent);
        const nextExercise = getNextExerciseType(exerciseType, exerciseAvailability);

        if (nextExercise) {
            setExerciseType(nextExercise as any);
            if (nextExercise === 'phrases') setPhrasePhase('cloze');
            const indexSetter = getIndexSetter(nextExercise);
            if (indexSetter) indexSetter(0);
        } else {
            if (lessonContent.inputContent && lessonContent.inputContent.length > 0) {
                setPhase('input');
                setInputIndex(0);
            } else if (lessonContent.miniTest) {
                setPhase('test');
            } else {
                setPhase('complete');
            }
        }
    }, [exerciseType, setPhrasePhase, setPragmaIndex, setPhraseIndex, setShardIndex, setEchoStreamIndex, setGlyphWeavingIndex, setResonancePathIndex, setInputIndex]);

    function getExerciseAvailability(content: LessonContent) {
        return {
            hasPhrases: (content.phrases?.length || 0) > 0 || (content.conversationalBlocks?.length || 0) > 0,
            hasPragmaStrike: (content.coreExercises?.pragmaStrike?.length || 0) > 0,
            hasShardDetection: (content.coreExercises?.shardDetection?.length || 0) > 0,
            hasEchoStream: (content.coreExercises?.echoStream?.length || 0) > 0,
            hasGlyphWeaving: (content.coreExercises?.glyphWeaving?.length || 0) > 0,
            hasResonancePath: (content.coreExercises?.resonancePath?.length || 0) > 0,
        };
    }

    function getNextExerciseType(current: string | null, availability: ReturnType<typeof getExerciseAvailability>) {
        if (!current) return null;

        const transitions: Record<string, { available: boolean; next: string }[]> = {
            'vocabulary': [
                { available: availability.hasPragmaStrike, next: 'pragmaStrike' },
                { available: availability.hasPhrases, next: 'phrases' },
            ],
            'pragmaStrike': [
                { available: availability.hasPhrases, next: 'phrases' },
            ],
            'phrases': [
                { available: availability.hasShardDetection, next: 'shardDetection' },
            ],
            'shardDetection': [
                { available: availability.hasEchoStream, next: 'echoStream' },
            ],
            'echoStream': [
                { available: availability.hasGlyphWeaving, next: 'glyphWeaving' },
            ],
            'glyphWeaving': [
                { available: availability.hasResonancePath, next: 'resonancePath' },
            ],
        };

        const possibleTransitions = transitions[current];
        return possibleTransitions?.find(t => t.available)?.next || null;
    }

    function getIndexSetter(type: string): ((i: number) => void) | undefined {
        const setters: Record<string, (i: number) => void> = {
            'pragmaStrike': setPragmaIndex,
            'phrases': setPhraseIndex,
            'shardDetection': setShardIndex,
            'echoStream': setEchoStreamIndex,
            'glyphWeaving': setGlyphWeavingIndex,
            'resonancePath': setResonancePathIndex,
        };
        return setters[type];
    }

    const state = useMemo<ExerciseState>(() => ({
        phase,
        exerciseType,
        phrasePhase,
        phraseIndex,
        vocabularyIndex,
        pragmaIndex,
        shardIndex,
        echoStreamIndex,
        glyphWeavingIndex,
        resonancePathIndex,
        inputIndex,
    }), [
        phase,
        exerciseType,
        phrasePhase,
        phraseIndex,
        vocabularyIndex,
        pragmaIndex,
        shardIndex,
        echoStreamIndex,
        glyphWeavingIndex,
        resonancePathIndex,
        inputIndex,
    ]);

    return {
        state,
        setPhase,
        setExerciseType,
        setPhrasePhase,
        setPhraseIndex,
        setVocabularyIndex,
        setPragmaIndex,
        setShardIndex,
        setEchoStreamIndex,
        setGlyphWeavingIndex,
        setResonancePathIndex,
        setInputIndex,
        moveToNextExerciseType,
        returnToMenu,
    };
}

