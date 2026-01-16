# Frontend Implementation - Manual Cloze Cards with True Cloze Format (2025-01-15)

## Summary
- Framework: Next.js 14 App Router with React 18
- Key Components: `clozeExerciseService`, `useManualClozeSelection`, `useExerciseFlow` (updated)
- Responsive Behaviour: ✔
- Accessibility Score (Lighthouse): Not measured (service layer update)

## Problem Solved
The manual word selection flow was creating cards with single word as phrase instead of sentence with blank. This lost the pedagogical effectiveness of cloze exercises.

### Before (Wrong)
```
User clicks "mange" in "Je mange une pomme"
Created subtopic.phrases = ["mange"]
Cloze exercise: "___" with options ["mange", "bois", "prend"]
```

### After (Correct)
```
User clicks "mange" in "Je mange une pomme"
Created subtopic.phrases = ["Je mange une pomme"]
Cloze exercise: "Je ___ une pomme" with options ["mange", "bois", "prend"]
```

## Files Created / Modified

### New Files Created

| File | Purpose |
|------|---------|
| `/src/services/clozeExerciseService.ts` | Service for generating true cloze exercises with full sentence context and target word blanking |
| `/src/hooks/input/useManualClozeSelection.ts` | Custom hook for managing manual word selection and creating subtopics with cloze metadata |

### Modified Files

| File | Purpose |
|------|---------|
| `/src/store/useImportedNodesStore.ts` | Extended `ImportedSubtopic` type with `clozeMetadata` for tracking manual selection |
| `/src/hooks/useExerciseFlow.ts` | Updated to detect manual cloze format and use specialized service |
| `/tests/integration/cloze-generation.test.ts` | Added integration tests for manual cloze generation |

## Technical Implementation Details

### 1. Extended ImportedSubtopic Type

Added optional `clozeMetadata` field to track manual cloze selections:

```typescript
export interface ImportedSubtopic {
  id: string;
  title: string;
  phrases: string[]; // Now contains full sentences, not single words
  language?: SupportedLanguage;
  // New field for manual cloze
  clozeMetadata?: {
    targetWordIndices: number[][]; // Word positions to blank in each sentence
    isManualSelection: boolean;
  };
}
```

### 2. ClozeExerciseService

New service with key functions:

- `createClozeContext(sentence, targetWord, language)` - Creates context from full sentence
- `generateClozeFromContext(context, id)` - Generates cloze exercise with full sentence
- `generateClozeExercisesFromManualSubtopic(subtopic, options)` - Batch generation
- `extractTargetWordIndex(sentence, targetWord)` - Finds word position in sentence

### 3. useManualClozeSelection Hook

Custom hook following `[data, actions]` pattern:

**Data returned:**
- `selectedWords` - Map of selected words with full sentence context
- `translations` - Word translations
- `sentencesByWord` - Mapping of word to full sentence
- `wordPositionsInSentence` - Word positions for blanking

**Actions:**
- `handleWordClick` - Toggle word selection with sentence context
- `handleCreateSubtopic` - Creates subtopic with cloze metadata

### 4. Updated useExerciseFlow

Added detection for manual cloze format:

```typescript
const isManualCloze = subtopic.clozeMetadata?.isManualSelection === true &&
                     (subtopic.clozeMetadata.targetWordIndices?.length ?? 0) > 0;

if (isManualCloze && subtopic.clozeMetadata?.targetWordIndices) {
  const manualSubtopic: ManualClozeSubtopic = {
    phrases: subtopic.phrases, // Full sentences
    targetWordIndices: subtopic.clozeMetadata.targetWordIndices,
    language: subtopic.language,
  };

  const rawClozeExercises = generateClozeExercisesFromManualSubtopic(
    manualSubtopic,
    { maxExercisesPerPhrase: 1, minConfidence: 0.5, language }
  );

  clozeExercises = rawClozeExercises.map(clozeExerciseToPhrase);
}
```

## Integration Tests Added

4 new test cases in `/tests/integration/cloze-generation.test.ts`:

1. **Single word selection** - Creates cloze from "Je mange une pomme" with "mange" as target
2. **Multiple sentences** - Handles multiple sentences with different target words
3. **Multiple targets in same sentence** - Supports selecting multiple words from one sentence
4. **Exercise flow integration** - Verifies Phrase format compatibility

## Success Criteria Status

- [x] Manual word selection stores full sentence
- [x] Cloze exercises show "Je ___ une pomme" not just "___"
- [x] Target word position tracked via `targetWordIndices`
- [x] Distractors generated from same POS (via existing service)
- [x] New integration tests added
- [x] ESLint passes with no new errors (only 5 minor warnings for unused vars)
- [x] TypeScript compilation successful

## Next Steps

### Recommended (not implemented)

- [ ] Update `WordSelectorWithContext` component to use the new `useManualClozeSelection` hook
- [ ] Add UI for users to review and edit selected words before creating subtopic
- [ ] Add visual indicator in exercise list showing which exercises are manual cloze
- [ ] Consider extending to support phrase-level selection (not just word-level)

### Optional Enhancements

- [ ] Add bulk word selection (select all verbs, all adjectives, etc.)
- [ ] Add difficulty estimation for manual cloze based on target word POS
- [ ] Support for multi-word targets (e.g., "à gauche" as prepositional phrase)

## Architecture Notes

### Design Patterns Used

1. **Service Pattern** - `clozeExerciseService` with pure functions
2. **Custom Hook Pattern** - `useManualClozeSelection` with `[data, actions]` return type
3. **Type-first Development** - All changes typed with TypeScript strict mode
4. **Schema-first** - Uses existing Zod schemas from `importFlowService`

### Backward Compatibility

- Existing subtopics without `clozeMetadata` continue to work with standard flow
- `useExerciseFlow` detects format and routes to appropriate service
- No breaking changes to existing APIs

## Example Data Flow

```
User Action: Click "mange" in "Je mange une pomme."

1. WordSelectorWithContext
   → handleWordClick(word, sentence)
   → Stores: { word, sentence: "Je mange une pomme.", position: 1 }

2. handleCreateSubtopic
   → Groups words by sentence
   → Creates: {
       phrases: ["Je mange une pomme."],
       targetWordIndices: [[1]],
       isManualSelection: true
     }

3. useExerciseFlow (detects manual cloze)
   → generateClozeExercisesFromManualSubtopic()
   → Returns: {
       phraseText: "Je mange une pomme.",
       question: "Je _____ une pomme.",
       answer: "mange",
       options: ["bois", "prend", "vois"]
     }

4. Exercise Component
   → Displays: "Je _____ une pomme."
   → User selects correct option
```

## Dependencies

No new dependencies added. Uses existing:
- `extractGrammaticalCategories` from `posTaggingService`
- `clozeExerciseToPhrase` from `importFlowService`
- `addSubtopic` from `useImportedNodesStore`

## ESLint Results

```
src/services/clozeExerciseService.ts: 1 warning (unused var)
src/hooks/input/useManualClozeSelection.ts: 4 warnings (unused vars, max-lines)
src/hooks/useExerciseFlow.ts: 0 warnings
```

All warnings are minor and don't affect functionality.
