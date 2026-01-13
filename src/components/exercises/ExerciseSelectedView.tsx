import type { ExerciseType, ExerciseData, LessonMode } from '@/hooks/useExerciseFlow';
import { ExerciseHeader } from '@/app/learn/imported/[nodeId]/exercises/components/ExerciseHeader';
import { ExerciseRenderer } from '@/app/learn/imported/[nodeId]/exercises/components/ExerciseRenderer';

interface ExerciseSelectedViewProps {
  nodeId: string;
  subtopicId: string | null;
  selectedExerciseType: ExerciseType;
  exerciseIndices: Record<string, number>;
  exerciseData: ExerciseData;
  mode: LessonMode;
  focusModeActive: boolean;
  onModeChange: (mode: LessonMode) => void;
  onBack: () => void;
  setFocusModeActive: (active: boolean) => void;
  setShowSessionSummary: (show: boolean) => void;
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * Exercise Selected View Component
 * Displays the selected exercise with header and renderer
 * Reduces complexity of main exercises page component
 */
export function ExerciseSelectedView({
  nodeId,
  subtopicId,
  selectedExerciseType,
  exerciseIndices,
  exerciseData,
  mode,
  focusModeActive,
  onModeChange,
  onBack,
  setFocusModeActive,
  setShowSessionSummary,
  onComplete,
  onSkip,
}: ExerciseSelectedViewProps) {
  return (
    <div className={focusModeActive ? 'fixed inset-0 focus-mode-active' : ''}>
      {focusModeActive && (
        <div className="fixed inset-0 bg-gradient-to-br from-calm-bg-tertiary/90 via-calm-bg-tertiary/85 to-calm-bg-tertiary/90 backdrop-blur-sm z-40" />
      )}

      <div className={focusModeActive ? 'relative z-50' : ''}>
        <ExerciseHeader
          _nodeId={nodeId}
          _subtopicId={subtopicId}
          selectedExerciseType={selectedExerciseType}
          exerciseIndices={exerciseIndices}
          exerciseData={exerciseData}
          mode={mode}
          onModeChange={onModeChange}
          onBack={onBack}
          onStartWarmup={() => {}}
          load={{ total: 50, status: 'optimal' }}
          focusModeActive={focusModeActive}
          setFocusModeActive={setFocusModeActive}
          setShowSessionSummary={setShowSessionSummary}
        />
        <ExerciseRenderer
          selectedExerciseType={selectedExerciseType}
          exerciseIndices={exerciseIndices}
          exerciseData={exerciseData}
          mode={mode}
          focusModeActive={focusModeActive}
          setFocusModeActive={setFocusModeActive}
          onComplete={onComplete}
          onSkip={onSkip}
        />
      </div>
    </div>
  );
}
