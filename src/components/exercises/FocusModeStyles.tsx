/**
 * Focus Mode Styles Component
 * Injects global CSS for focus mode cursor behavior
 * Reduces complexity of main exercises page component
 */
export function FocusModeStyles() {
  return (
    <style jsx global>{`
      .focus-mode-active * {
        cursor: none !important;
      }

      /* Mostrar cursor en elementos interactivos */
      .focus-mode-active button *,
      .focus-mode-active a *,
      .focus-mode-active input *,
      .focus-mode-active [role='button'] *,
      .focus-mode-active [onclick] * {
        cursor: auto !important;
      }

      .focus-mode-active button,
      .focus-mode-active a,
      .focus-mode-active input,
      .focus-mode-active [role='button'],
      .focus-mode-active [onclick] {
        cursor: pointer !important;
      }

      /* Mostrar cursor cuando el mouse se mueve */
      .focus-mode-active:hover {
        cursor: auto !important;
      }
    `}</style>
  );
}
