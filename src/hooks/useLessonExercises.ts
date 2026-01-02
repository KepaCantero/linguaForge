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

        const hasPhrases = (lessonContent.phrases?.length || 0) > 0 || (lessonContent.conversationalBlocks?.length || 0) > 0;
        const hasPragmaStrike = (lessonContent.coreExercises?.pragmaStrike?.length || 0) > 0;
        const hasShardDetection = (lessonContent.coreExercises?.shardDetection?.length || 0) > 0;
        const hasEchoStream = (lessonContent.coreExercises?.echoStream?.length || 0) > 0;
        const hasGlyphWeaving = (lessonContent.coreExercises?.glyphWeaving?.length || 0) > 0;
        const hasResonancePath = (lessonContent.coreExercises?.resonancePath?.length || 0) > 0;

        // Exercise sequence: Vocabulary -> Pragma Strike -> Phrases -> Shard Detection -> Echo Stream -> Glyph Weaving -> Resonance Path -> Input -> Test
        if (exerciseType === 'vocabulary' && hasPragmaStrike) {
            setExerciseType('pragmaStrike');
            setPragmaIndex(0);
        } else if (exerciseType === 'vocabulary' && hasPhrases) {
            setExerciseType('phrases');
            setPhrasePhase('cloze');
            setPhraseIndex(0);
        } else if (exerciseType === 'pragmaStrike' && hasPhrases) {
            setExerciseType('phrases');
            setPhrasePhase('cloze');
            setPhraseIndex(0);
        } else if (exerciseType === 'phrases' && hasShardDetection) {
            setExerciseType('shardDetection');
            setShardIndex(0);
        } else if (exerciseType === 'shardDetection' && hasEchoStream) {
            setExerciseType('echoStream');
            setEchoStreamIndex(0);
        } else if (exerciseType === 'echoStream' && hasGlyphWeaving) {
            setExerciseType('glyphWeaving');
            setGlyphWeavingIndex(0);
        } else if (exerciseType === 'glyphWeaving' && hasResonancePath) {
            setExerciseType('resonancePath');
            setResonancePathIndex(0);
        } else {
            // All exercises completed, move to input or test
            if (lessonContent.inputContent && lessonContent.inputContent.length > 0) {
                setPhase('input');
                setInputIndex(0);
            } else if (lessonContent.miniTest) {
                setPhase('test');
            } else {
                setPhase('complete');
            }
        }
    }, [exerciseType]);

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

