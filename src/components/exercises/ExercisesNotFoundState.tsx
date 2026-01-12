interface ExercisesNotFoundStateProps {
  onBack: () => void;
}

/**
 * Exercises Not Found State Component
 * Displays 404 message when subtopic is not found
 */
export function ExercisesNotFoundState({ onBack }: ExercisesNotFoundStateProps) {
  return (
    <div className="min-h-screen bg-lf-dark flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">404</div>
        <p className="text-lf-muted mb-4">Subtema no encontrado</p>
        <button
          onClick={onBack}
          className="text-lf-primary hover:text-lf-primary/80"
        >
          Volver al nodo
        </button>
      </div>
    </div>
  );
}
