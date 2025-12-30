'use client';

import { useState, useCallback } from 'react';
import { InputSelector } from '@/components/input/InputSelector';
import { InputPlayer } from '@/components/input/InputPlayer';
import { ComprehensionTest } from '@/components/input/ComprehensionTest';
import { InputContent } from '@/types';

type InputPhase = 'select' | 'play' | 'test' | 'complete';

export default function InputPage() {
  const [phase, setPhase] = useState<InputPhase>('select');
  const [selectedContent, setSelectedContent] = useState<InputContent | null>(null);
  const [, setTestResult] = useState<{ passed: boolean; score: number } | null>(null);

  const handleSelectContent = useCallback((content: InputContent) => {
    setSelectedContent(content);
    setPhase('play');
  }, []);

  const handlePlayerComplete = useCallback(() => {
    setPhase('test');
  }, []);

  const handleTestComplete = useCallback((passed: boolean, score: number) => {
    setTestResult({ passed, score });
    setPhase('complete');
  }, []);

  const handleReset = useCallback(() => {
    setPhase('select');
    setSelectedContent(null);
    setTestResult(null);
  }, []);

  return (
    <div className="py-4">
      {phase === 'select' && (
        <InputSelector onSelectContent={handleSelectContent} />
      )}

      {phase === 'play' && selectedContent && (
        <InputPlayer
          content={selectedContent}
          onComplete={handlePlayerComplete}
          onBack={handleReset}
        />
      )}

      {phase === 'test' && selectedContent && (
        <ComprehensionTest
          content={selectedContent}
          onComplete={handleTestComplete}
          onBack={handleReset}
        />
      )}

      {phase === 'complete' && (
        <div className="text-center space-y-6">
          <button
            onClick={handleReset}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg"
          >
            Elegir otro contenido
          </button>
        </div>
      )}
    </div>
  );
}
