/**
 * Exercises Loading State Component
 * Displays loading spinner while Zustand hydrates data
 */
export function ExercisesLoadingState() {
  return (
    <div className="min-h-screen bg-calm-bg-tertiary flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-500 border-t-transparent" />
    </div>
  );
}
