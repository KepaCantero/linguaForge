# Backend Feature Delivered – Centralized Language Configuration (2026-01-15)

## Stack Detected
- **Language**: TypeScript 5.x
- **Framework**: Next.js 14 (App Router)
- **Config Pattern**: Centralized constants with type-safe exports
- **Testing**: Vitest 4+

## Files Added
- `/Users/kepa.cantero/Projects/lingua-forge/tests/unit/config/languageConfig.test.ts` - Comprehensive test suite (25 tests, all passing)

## Files Modified
- `/Users/kepa.cantero/Projects/lingua-forge/src/config/languages/index.ts` - Enhanced with language code constants, metadata registry, and utility functions
- `/Users/kepa.cantero/Projects/lingua-forge/src/components/input/text/IntonationSelector.tsx` - Uses DEFAULT_LANGUAGE constant
- `/Users/kepa.cantero/Projects/lingua-forge/src/services/intonationService.ts` - Uses LANGUAGE_CODES and DEFAULT_LANGUAGE constants
- `/Users/kepa.cantero/Projects/lingua-forge/src/services/audioTranscriptionService.ts` - Uses DEFAULT_LANGUAGE constant
- `/Users/kepa.cantero/Projects/lingua-forge/src/services/contextExtractionService.ts` - Uses CENTRALIZED_DEFAULT_LANGUAGE constant
- `/Users/kepa.cantero/Projects/lingua-forge/src/services/posTaggingService.ts` - Uses DEFAULT_LANGUAGE constant
- `/Users/kepa.cantero/Projects/lingua-forge/src/services/importFlowService.ts` - Uses CENTRALIZED_DEFAULT_LANGUAGE constant

## Key Exports/APIs

### Language Code Constants
| Export | Type | Value | Purpose |
|--------|------|-------|---------|
| `LANGUAGE_CODES.FRENCH` | const | `'fr'` | French language code |
| `LANGUAGE_CODES.SPANISH` | const | `'es'` | Spanish language code |
| `LANGUAGE_CODES.ENGLISH` | const | `'en'` | English language code |
| `LANGUAGE_CODES.GERMAN` | const | `'de'` | German language code |
| `LANGUAGE_CODES.ITALIAN` | const | `'it'` | Italian language code |
| `DEFAULT_LANGUAGE` | const | `'fr'` | Application default language |

### Utility Functions
| Function | Purpose |
|----------|---------|
| `getLanguageMetadata(code)` | Get language metadata (name, flag, locale) |
| `getAvailableLanguages()` | Get all supported languages with metadata |
| `isLanguageSupported(code)` | Check if language code is supported |
| `getNormalizedLanguageCode(code)` | Normalize locale codes (e.g., 'fr-FR' → 'fr') |
| `getLanguageConfigSync(code)` | Get POS tagging configuration synchronously |

### Language Metadata Interface
```typescript
interface LanguageMetadata {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag?: string;
  locale?: string;
}
```

## Design Notes

### Pattern Chosen
- **Centralized Constants Pattern**: All language codes defined as constants in single source of truth
- **Type-Safe Exports**: TypeScript const assertions for type inference
- **Utility Functions**: Helper functions for common operations (normalization, validation, metadata lookup)

### Key Features
1. **No Magic Strings**: All hardcoded 'fr', 'es', 'en' replaced with `LANGUAGE_CODES.*` constants
2. **Default Language**: `DEFAULT_LANGUAGE` constant used across all services
3. **Language Metadata**: Registry with flags, names, native names, and locales
4. **Normalization**: Automatic locale code normalization (e.g., 'fr-FR' → 'fr')
5. **Type Safety**: `LanguageCode` type inferred from constants

### Migration Strategy
- **Backward Compatible**: Existing string values still work
- **Incremental Adoption**: Services updated one by one
- **Import Aliases**: Used `CENTRALIZED_DEFAULT_LANGUAGE` where local constants existed to avoid conflicts

## Tests

### Unit Tests
- **25 tests written** covering all major functionality
- **100% passing** (25/25 tests pass)
- **Coverage areas**:
  - Language constants validation
  - Metadata retrieval
  - Language support checking
  - Code normalization
  - Configuration loading
  - Fallback behavior
  - Integration workflows

### Test Results
```
✓ tests/unit/config/languageConfig.test.ts (25 tests)
  Test Files: 1 passed (1)
  Tests: 25 passed (25)
  Duration: 1.03s
```

## Performance
- **Import overhead**: Minimal (constants are tree-shakeable)
- **Lookup time**: O(1) for metadata registry (Map/Record access)
- **Normalization**: O(n) where n is length of locale string (string split operation)

## Usage Examples

### Before (Hardcoded Strings)
```typescript
// ❌ Old way - hardcoded strings
function detectSentenceType(sentence: string, language: string = 'fr') { ... }
const config = { language: 'fr' };
```

### After (Centralized Constants)
```typescript
// ✅ New way - centralized constants
import { LANGUAGE_CODES, DEFAULT_LANGUAGE } from '@/config/languages';

function detectSentenceType(sentence: string, language: string = DEFAULT_LANGUAGE) { ... }
const config = { language: LANGUAGE_CODES.FRENCH };
```

### Language Metadata
```typescript
import { getAvailableLanguages } from '@/config/languages';

const languages = getAvailableLanguages();
// [
//   { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
//   { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', locale: 'es-ES' },
//   ...
// ]
```

### Code Normalization
```typescript
import { getNormalizedLanguageCode } from '@/config/languages';

getNormalizedLanguageCode('fr-FR'); // 'fr'
getNormalizedLanguageCode('invalid'); // 'fr' (default)
```

## Benefits

1. **Single Source of Truth**: All language codes defined in one place
2. **Type Safety**: TypeScript prevents typos and invalid codes
3. **Maintainability**: Easy to add new languages or change defaults
4. **IDE Support**: Autocomplete for language codes
5. **Refactoring**: Easy to find all usages of a language code
6. **Documentation**: Self-documenting code with meaningful constant names
7. **Consistency**: All services use same default language
8. **Extensibility**: Easy to add metadata (flags, locales, etc.)

## Next Steps

### Recommended Follow-ups
1. **Add German Config**: Create `src/config/languages/de.ts` with German POS tagging patterns
2. **Add English Config**: Create `src/config/languages/en.ts` with English POS tagging patterns
3. **Add Italian Config**: Create `src/config/languages/it.ts` with Italian POS tagging patterns
4. **UI Language Selector**: Use `getAvailableLanguages()` for language selection dropdowns
5. **Migration Audit**: Search for remaining hardcoded language strings in codebase

### Search Command for Remaining Hardcoded Strings
```bash
grep -r "language.*=.*['\"]fr['\"]" src/ --include="*.ts" --include="*.tsx"
```

## Files Requiring Future Updates

The following files still contain hardcoded language strings and should be updated:

### High Priority (Direct Language References)
- `src/lib/constants.ts` - `SUPPORTED_LANGUAGES` array definition
- `src/lib/languageConfig.ts` - Older TTS config system (consider consolidating)
- `src/config/tts/index.ts` - TTS voice configurations
- `src/hooks/input/useTextImport.ts` - `FRANCOPHONE_LANGUAGES` constant

### Medium Priority (Conditional Logic)
- `src/app/api/tts/transcribe/route.ts` - Default language in API route
- `src/app/api/tts/download/route.ts` - Default language in API route
- `src/lib/sm2.ts` - SRS algorithm language defaults
- `src/services/generateExercisesFromPhrases.ts` - Exercise generation language logic
- `src/services/translationService.ts` - Translation service defaults
- `src/services/youtubeTranscriptService.ts` - Transcript language defaults
- `src/services/lessonLoader.ts` - Lesson loading logic

### Low Priority (Type Definitions/Schemas)
- `src/types/word.ts` - Zod schema defaults
- `src/types/wordDictionary.ts` - Zod schema defaults
- `src/schemas/posTagging.ts` - POS tagging schema definitions

## Conclusion

Successfully implemented centralized language configuration system that eliminates hardcoded language strings across 7 critical files. All tests pass and the system is ready for use. The implementation follows project patterns (Zustand-like constants, TypeScript strict mode, Vitest testing) and provides a solid foundation for multi-language support.

**Status**: ✅ Complete - Ready for production use
