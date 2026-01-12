'use client';

import { ModeCard } from './ModeCard';

type LessonMode = 'academia' | 'desafio';

interface ModeGridProps {
  onModeSelect: (mode: LessonMode) => void;
  shouldAnimate: boolean;
}

/**
 * Grid layout component for practice mode cards.
 * Displays all available practice modes in a vertical stack.
 */
export function ModeGrid({ onModeSelect, shouldAnimate }: ModeGridProps) {
  const modes: LessonMode[] = ['academia', 'desafio'];

  return (
    <div className="space-y-6">
      {modes.map((mode) => (
        <ModeCard key={mode} mode={mode} onSelect={onModeSelect} shouldAnimate={shouldAnimate} />
      ))}
    </div>
  );
}
