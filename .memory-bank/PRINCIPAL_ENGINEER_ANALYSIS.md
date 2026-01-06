# PRINCIPAL SOFTWARE ENGINEER ANALYSIS REPORT
## LinguaForge - FrenchA1Airbnb

> **Date:** 2026-01-06
> **Analyst:** Claude (Principal Software Engineer - ex-Vercel/Supabase)
> **Scope:** Full codebase audit for production readiness

---

## EXECUTIVE SUMMARY

**VEREDICT:** ⚠️ **NEEDS CRITICAL IMPROVEMENTS BEFORE PRODUCTION**

**Overall Code Quality:** 6.5/10
- ✅ **Strong:** TypeScript strict mode, Zod schemas, Zustand with persistence
- ⚠️ **Acceptable:** Architecture patterns, state management
- ❌ **Critical:** Missing tests, no error handling, no rate limiting, no circuit breakers

**Blocking Issues for Production:**
1. ❌ Zero test coverage (target: ≥80%)
2. ❌ No error handling in Supabase operations
3. ❌ No rate limiting on external APIs
4. ❌ No circuit breakers for external services
5. ❌ Lighthouse scores unmeasured

---

## 1. CODE SMELLS DETECTED

### 🔴 CRITICAL: Functions >50 Lines

| File | Function | Lines | Issue |
|------|----------|-------|-------|
| `src/services/generateExercisesFromPhrases.ts` | `generateJanusComposerExercises` | 217 | ❌ Violates Single Responsibility Principle |
| `src/store/useMissionStore.ts` | `generateDailyMissions` | ~103 | ❌ Complex logic in store |
| `src/store/useMissionStore.ts` | `completeMission` | ~41 | Acceptable |
| `src/store/useCognitiveLoadStore.ts` | `enterFocusMode` | ~18 | ✅ Acceptable |

**Impact:** Maintenance nightmare, difficult to test, high cyclomatic complexity

**Recommendation:**
```typescript
// REFACTOR: generateJanusComposerExercises (217 lines → 5 functions <40 lines)
export class JanusComposerGenerator {
  extractSubjects(phrases: string[]): Subject[] { /* ... */ }
  extractVerbs(phrases: string[]): Verb[] { /* ... */ }
  extractComplements(phrases: string[]): Complement[] { /* ... */ }
  buildConjugationRules(verbs: Verb[], subjects: Subject[]): Rule[] { /* ... */ }
  generate(): JanusComposer { /* compose from above */ }
}
```

---

### 🟡 MODERATE: TypeScript Lint Suppressions

| File | Line | Issue | Severity |
|------|------|-------|----------|
| `src/services/translationService.ts` | 7 | `@typescript-eslint/no-unused-vars` on `TranslationResponse` | Low |

**Analysis:**
- Interface defined but only used for type annotation
- Not actually used in runtime validation
- **No `any` types detected** ✅
- **No `@ts-ignore` detected** ✅

**Recommendation:**
```typescript
// REMOVE unused interface, use inline type or actual Zod schema
const TranslationResponseSchema = z.object({
  translatedText: z.string(),
  detectedSourceLanguage: z.string().optional(),
});

// Then validate API response
const data = TranslationResponseSchema.parse(await response.json());
```

---

### 🟡 MODERATE: Business Logic in Components

**Analysis:** Component scan not performed in this audit (requires reading `.tsx` files)

**Expected Issues (based on typical React apps):**
- Payment logic in `src/app/map/page.tsx` (mentioned in instructions)
- Data fetching in components instead of services

**Recommendation:**
```typescript
// ❌ AVOID: Business logic in component
export default function MapPage() {
  const handlePayment = async () => {
    const stripe = await loadStripe(...);
    // ... 50+ lines of payment logic
  };
}

// ✅ PREFER: Delegate to service
export default function MapPage() {
  const { handlePayment } = usePaymentService();
}
```

---

## 2. PRODUCTION RISKS

### 🔴 CRITICAL: No Error Handling in Supabase Operations

**Affected Files:**
- `src/lib/supabase/client.ts:1-15`
- `src/lib/supabase/server.ts:1-39`

**Issue:**
```typescript
// ❌ CURRENT: No error handling
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null; // Silent failure!
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
```

**Impact:**
- Runtime crashes if Supabase is misconfigured
- No telemetry for debugging
- Poor user experience

**Recommendation:**
```typescript
// ✅ PROPOSED: Proper error handling
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Log to monitoring service
    console.error('[Supabase] Missing configuration', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    });

    // Throw descriptive error
    throw new Error(
      'Supabase configuration missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('[Supabase] Client creation failed', error);
    throw error;
  }
}
```

---

### 🔴 CRITICAL: No Rate Limiting on External APIs

**Affected Files:**
- `src/services/translationService.ts:115-197` (`translateToSpanish`, `translateWords`)

**Issue:**
```typescript
// ❌ CURRENT: No rate limiting
export async function translateToSpanish(text: string): Promise<string> {
  // ...
  const response = await fetch('/api/translate', {
    method: 'POST',
    // No rate limiting, no circuit breaker
  });
  // ...
}
```

**Impact:**
- API quota exhaustion
- Cost overruns
- Service degradation

**Recommendation:**
```typescript
// ✅ PROPOSED: Rate limiting + circuit breaker
import { RateLimiter } from '@/lib/rateLimiter';
import { CircuitBreaker } from '@/lib/circuitBreaker';

const translateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000, // 100 requests per minute
});

const translateBreaker = new CircuitBreaker({
  timeout: 5000,
  errorThreshold: 5,
  resetTimeout: 60000,
});

export async function translateToSpanish(text: string): Promise<string> {
  await translateLimiter.checkLimit();
  return translateBreaker.execute(async () => {
    // ... existing logic
  });
}
```

---

### 🟡 MODERATE: Type Inconsistencies Between Frontend/Backend

**Issue:**
- Frontend types: `src/types/index.ts`
- Backend schema: `supabase/schema.sql`
- **No validation that they match**

**Example:**
```typescript
// src/types/index.ts - inferred from Zod
export interface LessonContent {
  leafId: string;
  languageCode: LanguageCode;
  // ...
}

-- supabase/schema.sql - manual SQL
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  -- No validation that lesson_id matches LessonContent.leafId
);
```

**Impact:**
- Runtime type mismatches
- Data corruption possible
- No end-to-end type safety

**Recommendation:**
```typescript
// ✅ PROPOSED: Shared schema validation
// supabase/schema.sql - Add CHECK constraint
CREATE TABLE lesson_progress (
  lesson_id TEXT NOT NULL,
  -- Validate lesson_id format
  CONSTRAINT valid_lesson_id
    CHECK (lesson_id ~ '^leaf-\d+-\d+-[a-z]+$')
);

// src/lib/supabase/validation.ts - Validate on insert
export function validateLessonId(lessonId: string): boolean {
  return /^leaf-\d+-\d+-[a-z]+$/.test(lessonId);
}
```

---

## 3. TECHNICAL DEBT

### 🔴 CRITICAL: Zero Test Coverage

**Finding:**
- **No test files found** in entire codebase
- Target: ≥80% coverage for critical modules
- Current: **0%**

**Modules Requiring Immediate Tests:**
1. `src/services/wordExtractor.ts` - Pure functions, easy to test
2. `src/services/generateExercisesFromPhrases.ts` - Complex business logic
3. `src/lib/sm2.ts` - SRS algorithm (mathematical correctness)
4. All Zustand stores - State management logic

**Recommendation:**
```typescript
// __tests__/services/wordExtractor.test.ts
import { normalizeWord, detectWordType, extractKeywords } from '@/services/wordExtractor';

describe('wordExtractor', () => {
  describe('normalizeWord', () => {
    it('should lowercase and remove accents', () => {
      expect(normalizeWord('ÉTÉ')).toBe('ete');
      expect(normalizeWord('À Québec')).toBe('aquebec');
    });
  });

  describe('detectWordType', () => {
    it('should detect verbs by ending', () => {
      expect(detectWordType('parler')).toBe('verb');
      expect(detectWordType('finir')).toBe('verb');
    });

    it('should detect adverbs ending in -ment', () => {
      expect(detectWordType('lentement')).toBe('adverb');
    });
  });

  describe('extractKeywords', () => {
    it('should filter common words', () => {
      const result = extractKeywords('Je suis homme');
      expect(result).toHaveLength(1); // Only 'homme'
      expect(result[0].word).toBe('homme');
    });
  });
});
```

**Action Plan:**
1. Day 1-2: Set up Vitest + Testing Library
2. Day 3-5: Write tests for pure functions (wordExtractor, sm2)
3. Day 6-10: Write tests for stores (Zustand testing)
4. Day 11-15: Write E2E tests with Playwright

---

### 🟡 MODERATE: N+1 Queries in Supabase

**Affected Files:**
- Not detected in this audit (requires analyzing data access patterns)

**Likely Locations:**
- `src/store/useNodeProgressStore.ts` - Fetching node progress
- `src/store/useSRSStore.ts` - Fetching SRS cards

**Recommendation:**
```typescript
// ❌ AVOID: N+1 queries
const nodes = await supabase.from('nodes').select('*');
for (const node of nodes.data) {
  const progress = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('lesson_id', node.id); // N+1!
}

// ✅ PREFER: Single query with joins
const { data } = await supabase
  .from('nodes')
  .select(`
    *,
    lesson_progress (*)
  `);
```

---

### 🟡 MODERATE: Missing Repository Pattern

**Issue:**
- Direct Supabase client usage throughout codebase
- No abstraction layer between business logic and data access

**Impact:**
- Hard to test (need to mock Supabase)
- Hard to migrate data source
- Business logic coupled to data access

**Recommendation:**
```typescript
// src/repositories/LessonProgressRepository.ts
export class LessonProgressRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<LessonProgress[]> {
    const { data, error } = await this.supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new RepositoryError(error.message);
    return data;
  }

  async upsert(progress: LessonProgress): Promise<LessonProgress> {
    const { data, error } = await this.supabase
      .from('lesson_progress')
      .upsert(progress)
      .select()
      .single();

    if (error) throw new RepositoryError(error.message);
    return data;
  }
}

// Usage in store
const repository = new LessonProgressRepository(supabase);
const progress = await repository.findByUserId(userId);
```

---

## 4. ARCHITECTURAL ISSUES

### 🔴 CRITICAL: No Circuit Breakers for External Services

**Affected Services:**
- `src/services/translationService.ts` - External translation API
- `src/services/ttsService.ts` - Web Speech API (browser-based, but still)

**Issue:**
- No protection against cascading failures
- No retry logic with exponential backoff
- No timeout handling

**Recommendation:**
```typescript
// src/lib/CircuitBreaker.ts
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    private options: {
      timeout: number;
      errorThreshold: number;
      resetTimeout: number;
    }
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), this.options.timeout)
        ),
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.options.errorThreshold) {
      this.state = 'OPEN';
      this.lastFailureTime = Date.now();
    }
  }
}
```

---

### 🟡 MODERATE: Zod Schemas Defined but Not Used for Runtime Validation

**Issue:**
- `src/schemas/content.ts` defines comprehensive Zod schemas
- **Not used** to validate Supabase responses or API inputs

**Impact:**
- Runtime type mismatches
- No end-to-end type safety

**Recommendation:**
```typescript
// ✅ USE: Zod for runtime validation
import { LessonContentSchema } from '@/schemas/content';

async function fetchLesson(leafId: string): Promise<LessonContent> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('leaf_id', leafId)
    .single();

  if (error) throw error;

  // Validate at runtime
  return LessonContentSchema.parse(data);
}
```

---

## 5. SECURITY CONSIDERATIONS

### 🟢 ACCEPTABLE: RLS Policies

**Analysis:** `supabase/schema.sql:92-108`
- ✅ RLS enabled on `profiles`, `lesson_progress`, `user_stats`
- ✅ Policies ensure users can only access own data

**Recommendation:**
```sql
-- ADD: Additional security policies
-- Prevent bulk data extraction
CREATE POLICY "limit_query_size" ON lesson_progress
  FOR SELECT
  USING (auth.uid() = user_id)
  WITH CHECK (
    SELECT COUNT(*) FROM lesson_progress WHERE user_id = auth.uid() < 1000
  );
```

---

### 🟡 MODERATE: No Input Sanitization

**Issue:**
- User inputs not sanitized before storage
- XSS possible if displaying user-generated content

**Recommendation:**
```typescript
// src/lib/sanitizer.ts
import DOMPurify from 'dompurify';

export function sanitizeUserInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

// Usage
const cleanInput = sanitizeUserInput(userInput);
```

---

## 6. PERFORMANCE CONCERNS

### 🔴 UNMEASURED: Lighthouse Scores

**Issue:**
- No Lighthouse CI/CD
- Target scores unknown
- Performance regression detection missing

**Recommendation:**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/learn
          uploadArtifacts: true
```

---

### 🟡 MODERATE: Large Bundle Size (Estimated)

**Dependencies to Audit:**
- `@tsparticles/react` - Consider lazy loading
- `reactflow` - Only load on map page
- `howler` - Audio library, can be code-split?

**Recommendation:**
```typescript
// Lazy load heavy components
const CourseMap = lazy(() => import('@/components/learn/CourseMap'));
const NeuralBlueprint = lazy(() => import('@/components/architecture/NeuralBlueprint'));
```

---

## 7. ACTION ITEMS (PRIORITIZED)

### 🔴 CRITICAL (Block Production)

| Priority | Item | Effort | Owner |
|----------|------|--------|-------|
| P0 | Set up testing infrastructure (Vitest + Testing Library) | 1 day | |
| P0 | Write tests for `src/services/wordExtractor.ts` | 2 hours | |
| P0 | Write tests for `src/lib/sm2.ts` | 2 hours | |
| P0 | Write tests for all Zustand stores | 1 day | |
| P0 | Add error handling to Supabase operations | 4 hours | |
| P0 | Implement rate limiting for translation service | 4 hours | |
| P0 | Implement circuit breaker for external services | 6 hours | |

---

### 🟡 HIGH (Before Launch)

| Priority | Item | Effort | Owner |
|----------|------|--------|-------|
| P1 | Refactor `generateJanusComposerExercises` into smaller functions | 4 hours | |
| P1 | Implement Repository pattern for data access | 2 days | |
| P1 | Add Zod validation to all Supabase responses | 1 day | |
| P1 | Set up Lighthouse CI | 4 hours | |
| P1 | Write E2E tests with Playwright | 3 days | |

---

### 🟢 MEDIUM (Post-Launch)

| Priority | Item | Effort | Owner |
|----------|------|--------|-------|
| P2 | Audit and fix N+1 queries | 2 days | |
| P2 | Add input sanitization | 4 hours | |
| P2 | Optimize bundle size with code splitting | 1 day | |
| P2 | Add telemetry/logging (Sentry, Datadog) | 2 days | |

---

## 8. METRICS TARGET

### Current State
- Test Coverage: **0%** ❌
- Lighthouse Performance: **Unknown** ❌
- Lighthouse Accessibility: **Unknown** ❌
- TypeScript `any` usage: **0** ✅
- TypeScript `@ts-ignore` usage: **0** ✅

### Target State (Post-Refactor)
- Test Coverage: **≥80%** (critical modules)
- Lighthouse Performance: **≥95**
- Lighthouse Accessibility: **≥95**
- Lighthouse Best Practices: **≥90**
- TypeScript `any` usage: **0**
- TypeScript `@ts-ignore` usage: **0**

---

## 9. CONCLUSION

**Overall Assessment:**
The codebase demonstrates strong TypeScript discipline and well-structured state management with Zustand. The Zod schemas provide excellent type safety. However, critical production-readiness gaps exist:

1. **Zero test coverage** is the most critical blocker
2. **No error handling** in Supabase operations will cause runtime crashes
3. **No rate limiting** will lead to API quota exhaustion
4. **No circuit breakers** creates cascading failure risk

**Recommendation:**
**DO NOT DEPLOY TO PRODUCTION** until P0 items are complete. Estimated effort: **2-3 weeks** for a single developer.

---

**Report Generated:** 2026-01-06
**Analyst:** Claude (Principal Software Engineer)
**Next Review:** After P0 completion
