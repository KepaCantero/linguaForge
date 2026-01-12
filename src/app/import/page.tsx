'use client';

import { Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImportStepIndicator } from '@/components/import/ImportStepIndicator';
import { ImportSourceSelector } from '@/components/import/ImportSourceSelector';
import { ImportNodeConfigurator } from '@/components/import/ImportNodeConfigurator';
import { ImportSuccessView } from '@/components/import/ImportSuccessView';
import { YouTubeContentStep } from './components/YouTubeContentStep';
import { GenericContentStep } from './components/GenericContentStep';
import { useImportFlow } from './hooks/useImportFlow';

function ImportPageContent() {
  const {
    step,
    setStep,
    selectedSource,
    topicTitle,
    setTopicTitle,
    selectedIcon,
    setSelectedIcon,
    subtopics,
    newSubtopicTitle,
    setNewSubtopicTitle,
    extractedPhrases,
    content,
    setContent,
    sources,
    youTubeImport,
    handleSelectSource,
    handleAnalyze,
    handleAddSubtopic,
    handleRemoveSubtopic,
    handleCreateNode,
    handleGoToLearn,
    handleCreateAnother,
  } = useImportFlow();

  return (
    <div className="space-y-6">
      <ImportStepIndicator currentStep={step} />

      <AnimatePresence mode="wait">
        {step === 'source' && (
          <ImportSourceSelector
            sources={sources}
            onSelectSource={handleSelectSource}
          />
        )}

        {step === 'content' && selectedSource === 'youtube' && (
          <YouTubeContentStep
            sources={sources}
            selectedSource={selectedSource}
            youTubeImport={youTubeImport}
            content={content}
            setContent={setContent}
            onBack={() => setStep('source')}
            onAnalyze={handleAnalyze}
          />
        )}

        {step === 'content' && selectedSource !== 'youtube' && (
          <GenericContentStep
            sources={sources}
            selectedSource={selectedSource}
            content={content}
            setContent={setContent}
            onBack={() => setStep('source')}
            onAnalyze={handleAnalyze}
          />
        )}

        {step === 'configure' && (
          <ImportNodeConfigurator
            topicTitle={topicTitle}
            selectedIcon={selectedIcon}
            subtopics={subtopics}
            newSubtopicTitle={newSubtopicTitle}
            extractedPhrases={extractedPhrases}
            onTopicTitleChange={setTopicTitle}
            onIconSelect={setSelectedIcon}
            onSubtopicTitleChange={setNewSubtopicTitle}
            onAddSubtopic={handleAddSubtopic}
            onRemoveSubtopic={handleRemoveSubtopic}
            onBack={() => setStep('content')}
            onCreateNode={handleCreateNode}
          />
        )}

        {step === 'success' && (
          <ImportSuccessView
            topicTitle={topicTitle}
            onGoToLearn={handleGoToLearn}
            onCreateAnother={handleCreateAnother}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ImportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-lf-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      }
    >
      <ImportPageContent />
    </Suspense>
  );
}
