'use client';

import { TextEditor } from '@/components/input/text/TextEditor';
import { VoiceSelector } from '@/components/input/text/VoiceSelector';
import { TTSQualitySelector } from '@/components/input/text/TTSQualitySelector';
import { IntonationSelector } from '@/components/input/text/IntonationSelector';
import { useTextInputPage } from '@/hooks/input/useTextInputPage';
import { PageHeader } from '@/components/input/text/PageHeader';
import { EditorActions } from '@/components/input/text/EditorActions';
import { AnalysisSection } from '@/components/input/text/AnalysisSection';
import { BlockSelectionSection } from '@/components/input/text/BlockSelectionSection';

// ============================================================
// PAGE
// ============================================================

/**
 * Text Input Page - Página de importación de texto
 *
 * Flujo completo:
 * 1. Usuario pega texto en TextEditor
 * 2. Se muestra análisis en TextPreview
 * 3. Usuario puede seleccionar voz en VoiceSelector
 * 4. Usuario puede escuchar TTS del texto completo
 * 5. Usuario puede seleccionar bloques específicos en BlockSelector
 * 6. Usuario importa todo o solo lo seleccionado
 */
export default function TextInputPage() {
  const { state, handlers, computed, textImport, audioGen, config } = useTextInputPage();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4">
      <PageHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Editor y acciones */}
        <div className="space-y-6">
          <TextEditor
            value={state.text}
            onChange={handlers.handleTextChange}
            maxLength={config.maxLength}
            minLength={config.minLength}
            placeholder={config.placeholder}
            autoFocus
          />

          <EditorActions
            text={state.text}
            canAnalyze={computed.canAnalyze}
            isGenerating={audioGen.isGenerating}
            showVoiceSelector={state.showVoiceSelector}
            showQualitySelector={state.showQualitySelector}
            showIntonationSelector={state.showIntonationSelector}
            useIntonation={audioGen.useIntonation}
            onGenerateAudio={handlers.handleGenerateAudio}
            onDownloadAudio={handlers.handleDownloadAudio}
            onToggleVoice={handlers.toggleVoiceSelector}
            onToggleQuality={handlers.toggleQualitySelector}
            onToggleIntonation={handlers.toggleIntonationSelector}
          >
            {state.showVoiceSelector && (
              <VoiceSelector
                selectedVoice={audioGen.selectedVoice}
                onVoiceChange={handlers.handleVoiceChange}
                onPreview={handlers.handleVoicePreview}
                showPreviewButton
              />
            )}

            {state.showQualitySelector && (
              <TTSQualitySelector
                selectedQuality={state.selectedQuality}
                onQualityChange={handlers.handleQualityChange}
                selectedFormat={state.selectedFormat}
                onFormatChange={handlers.handleFormatChange}
                selectedVoice={audioGen.selectedVoice}
                onVoiceChange={handlers.handleVoiceChange}
                availableVoices={audioGen.availableVoices}
                onPreview={handlers.handleQualityPreview}
                showPreviewButton
              />
            )}

            {state.showIntonationSelector && (
              <IntonationSelector
                text={state.text}
                isEnabled={audioGen.useIntonation}
                onToggle={handlers.handleIntonationToggle}
                onPreview={handlers.handleIntonationPreview}
                language="fr"
              />
            )}
          </EditorActions>
        </div>

        {/* Columna derecha: Análisis y selección */}
        <AnalysisSection
          importData={state.importData}
          importResult={state.importResult}
          isAnalyzing={textImport.isAnalyzing}
          error={textImport.error}
          canImport={computed.canImport}
          isImporting={state.isImporting}
          onAnalyze={handlers.handleAnalyze}
          onImportAll={handlers.handleImportAll}
        />
      </div>

      {/* Selector de bloques (ancho completo) */}
      {state.importData && state.importData.blocks.length > 0 && (
        <BlockSelectionSection
          blocks={state.importData.blocks}
          selectedBlocksCount={state.selectedBlocks.length}
          hasSelection={computed.hasSelection}
          isImporting={state.isImporting}
          onSelectionChange={handlers.handleSelectionChange}
          onImportSelected={handlers.handleImportSelected}
        />
      )}
    </div>
  );
}
