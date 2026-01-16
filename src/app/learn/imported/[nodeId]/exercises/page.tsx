'use client';

import { Suspense } from 'react';
import { ExerciseMenu } from '@/components/exercises/ExerciseMenu';
import { ExercisesHeader } from '@/components/exercises/ExercisesHeader';
import { ExerciseWarmupModal } from '@/components/exercises/ExerciseWarmupModal';
import { FocusModeStyles } from '@/components/exercises/FocusModeStyles';
import { ExercisesLoadingState } from '@/components/exercises/ExercisesLoadingState';
import { ExercisesNotFoundState } from '@/components/exercises/ExercisesNotFoundState';
import { ExerciseSelectedView } from '@/components/exercises/ExerciseSelectedView';
import { type ExerciseType, type LessonMode, useExerciseFlow } from '@/hooks/useExerciseFlow';
import { useWarmupHandler } from '@/hooks/useWarmupHandler';
import { useFocusMode } from '@/hooks/useFocusMode';
import { useExerciseProgression } from '@/hooks/useExerciseProgression';
import { useExerciseIndices } from '@/hooks/useExerciseIndices';
import { useInitialLoadState } from '@/hooks/useInitialLoadState';
import { useExerciseRouteParams } from '@/hooks/useExerciseRouteParams';
import { useExerciseSelection } from '@/hooks/useExerciseSelection';
import { generateExerciseList } from '@/utils/exerciseListGenerator';

// Re-export types for components that import from this file
export type { LessonMode, ExerciseType };

function ExercisesPageContent() {
  // Use custom hook for route parameters
  const { nodeId, subtopicId, router } = useExerciseRouteParams();

  // Use custom hook for initial loading state
  const isLoaded = useInitialLoadState();

  // Use custom hook for exercise flow state
  const exerciseFlow = useExerciseFlow();
  const {
    node,
    subtopic,
    exerciseData,
    currentMode,
    handleModeChange,
    handleBack,
  } = exerciseFlow;

  // Use custom hook for warmup functionality
  const warmupHandler = useWarmupHandler(exerciseData, subtopic?.title || '');
  const {
    showWarmupGate,
    warmupCompleted,
    warmupMissionType,
    warmupDifficulty,
    handleStartWarmup,
    handleWarmupComplete,
    handleWarmupSkip,
    handleWarmupDone,
  } = warmupHandler;

  // Use custom hook for focus mode
  const focusMode = useFocusMode();
  const { focusModeActive, setFocusModeActive, setShowSessionSummary } = focusMode;

  // Use custom hook for exercise indices
  const { exerciseIndices, setExerciseIndices } = useExerciseIndices();

  // Use custom hook for exercise selection
  const { selectedExerciseType, setSelectedExerciseType, handleSelectExercise } = useExerciseSelection();

  // Use custom hook for exercise progression
  const { handleExerciseComplete } = useExerciseProgression({
    selectedExerciseType,
    exerciseIndices,
    exerciseData,
    currentMode,
    setExerciseIndices,
    setSelectedExerciseType,
  });

  // Mostrar loading mientras Zustand hidrata los datos
  if (!isLoaded) {
    return <ExercisesLoadingState />;
  }

  if (!node || !subtopic || !exerciseData) {
    return <ExercisesNotFoundState onBack={() => router.push(`/learn/imported/${nodeId}`)} />;
  }

  // Render exercise header and content when exercise is selected
  if (selectedExerciseType) {
    return (
      <ExerciseSelectedView
        nodeId={nodeId}
        subtopicId={subtopicId}
        selectedExerciseType={selectedExerciseType}
        exerciseIndices={exerciseIndices}
        exerciseData={exerciseData}
        mode={currentMode}
        focusModeActive={focusModeActive}
        onModeChange={handleModeChange}
        onBack={handleBack}
        setFocusModeActive={setFocusModeActive}
        setShowSessionSummary={setShowSessionSummary}
        onComplete={handleExerciseComplete}
        onSkip={() => setSelectedExerciseType(null)}
      />
    );
  }

  // Exercise Menu items
  const exercises = generateExerciseList(exerciseData);

  return (
    <>
      {/* WarmupGate Modal */}
      <ExerciseWarmupModal
        show={showWarmupGate}
        lessonId={subtopicId}
        missionType={warmupMissionType}
        missionTitle={subtopic.title}
        difficulty={warmupDifficulty}
        onWarmupComplete={handleWarmupComplete}
        onWarmupSkip={handleWarmupSkip}
        onStartMission={handleWarmupDone}
      />

      {/* FIX 1: Changed background from gray to gradient for better visual appeal */}
      <div className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-secondary pb-20">
      {/* Header */}
      <ExercisesHeader
        subtopicTitle={subtopic.title}
        nodeId={nodeId}
        currentMode={currentMode}
        warmupCompleted={warmupCompleted}
        onBack={() => router.push(`/learn/imported/${nodeId}`)}
        onStartWarmup={handleStartWarmup}
        onModeChange={handleModeChange}
      />

      {/* Exercise Menu */}
      <ExerciseMenu
        exercises={exercises}
        subtopicTitle={subtopic.title}
        onSelectExercise={handleSelectExercise}
      />
    </div>
    </>
  );
}

export default function ExercisesPage() {
  return (
    <>
      <Suspense fallback={<ExercisesLoadingState />}>
        <ExercisesPageContent />
      </Suspense>

      {/* CSS para Focus Mode - mostrar cursor en elementos interactivos */}
      <FocusModeStyles />
    </>
  );
}
