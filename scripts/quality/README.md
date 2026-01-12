# LinguaForge Quality Scripts

Comprehensive suite of quality assurance scripts for the LinguaForge French Learning Web App.

## Overview

This directory contains automated testing and quality gate scripts designed to ensure code quality, security, performance, and accessibility standards are met across the entire application.

## Directory Structure

```
scripts/quality/
├── README.md                 # This file
├── .gitkeep                  # Preserve directory structure
├── quality-ultimate.sh       # Original comprehensive quality gate
├── run-unit-tests.sh         # Unit tests runner (Vitest)
├── run-integration-tests.sh  # Integration tests runner (API + DB)
├── run-api-tests.sh          # API REST endpoints tests
├── run-e2e-tests.sh          # End-to-end tests (Playwright)
├── run-security-tests.sh     # Security vulnerability scans
├── run-performance-tests.sh  # Performance benchmarks (k6, Lighthouse)
├── run-visual-tests.sh       # Visual regression tests
├── run-a11y-tests.sh         # Accessibility tests (axe-core, WCAG)
├── run-all-tests.sh          # Run all test categories
├── ci-pipeline.sh            # CI/CD pipeline orchestrator
└── reports/                  # Test reports directory
```

## Quick Start

### Run All Tests

```bash
# Execute complete test suite
./scripts/quality/run-all-tests.sh
```

### Run Specific Test Category

```bash
# Unit tests only
./scripts/quality/run-unit-tests.sh

# Integration tests only
./scripts/quality/run-integration-tests.sh

# E2E tests only
./scripts/quality/run-e2e-tests.sh
```

### CI/CD Pipeline

```bash
# Auto-detect context (pre-commit, PR, or pre-merge)
./scripts/quality/ci-pipeline.sh auto

# Specify context explicitly
./scripts/quality/ci-pipeline.sh pre-commit
./scripts/quality/ci-pipeline.sh pr
./scripts/quality/ci-pipeline.sh pre-merge
```

## Individual Scripts

### 1. Unit Tests (`run-unit-tests.sh`)

Runs unit tests using Vitest with coverage reporting.

**What it tests:**
- Individual components in isolation
- Pure functions
- Zustand stores
- Utilities and helpers

**Output:**
- Console output with test results
- Coverage report in `coverage/`
- JSON report in `scripts/quality/reports/`

**Usage:**
```bash
./scripts/quality/run-unit-tests.sh
```

**Requirements:**
- Vitest configured
- Tests in `tests/unit/` or `__tests__/unit/`

---

### 2. Integration Tests (`run-integration-tests.sh`)

Tests integration between multiple components and systems.

**What it tests:**
- API routes + Database
- Service integrations
- Data flow between layers

**Output:**
- Integration test results
- Database sync status
- Report in `scripts/quality/reports/`

**Usage:**
```bash
./scripts/quality/run-integration-tests.sh
```

**Requirements:**
- Database for testing (SQLite in-memory or Testcontainers)
- Prisma/Drizzle ORM configured
- Tests in `tests/integration/`

---

### 3. API Tests (`run-api-tests.sh`)

Tests REST API endpoints for functionality and security.

**What it tests:**
- Endpoint functionality
- Authentication (401 responses)
- Sensitive data filtering
- Contract validation (Zod schemas)

**Output:**
- API test results
- Security issues count
- Report in `scripts/quality/reports/`

**Usage:**
```bash
API_BASE_URL=http://localhost:3000 ./scripts/quality/run-api-tests.sh
```

**Requirements:**
- Development server running on `API_BASE_URL`
- API routes in `src/app/api/`

---

### 4. E2E Tests (`run-e2e-tests.sh`)

End-to-end testing with Playwright.

**What it tests:**
- Critical user flows:
  - Onboarding
  - Monetization/subscription
  - Learning progress
- Error handling scenarios

**Output:**
- Playwright HTML report
- Screenshots of failures
- Traces for debugging

**Usage:**
```bash
./scripts/quality/run-e2e-tests.sh
```

**Requirements:**
- Playwright installed
- E2E tests in `tests/e2e/`
- Server started automatically

**Example test creation:**
```bash
npx playwright codegen http://localhost:3000
```

---

### 5. Security Tests (`run-security-tests.sh`)

Security vulnerability scanning and checks.

**What it tests:**
- npm audit / Snyk vulnerabilities
- OWASP ZAP baseline scan
- Exposed secrets detection
- .env file checks

**Output:**
- Vulnerability counts (high/critical)
- ZAP security report
- npm audit JSON

**Usage:**
```bash
./scripts/quality/run-security-tests.sh
```

**Requirements:**
- npm audit (built-in)
- Optional: Snyk (`npm install -g snyk`)
- Optional: OWASP ZAP (`brew install zap-cli`)

**Install security tools:**
```bash
# Snyk
npm install -g snyk

# OWASP ZAP
brew install zap-cli  # macOS
# or use Docker
docker pull zaproxy/zap-stable
```

---

### 6. Performance Tests (`run-performance-tests.sh`)

Performance benchmarking and web vitals.

**What it tests:**
- API load capacity (k6)
- Web vitals (Lighthouse)
- Response time benchmarks
- Bundle size analysis

**Output:**
- k6 load test results
- Lighthouse scores
- Build size metrics

**Usage:**
```bash
./scripts/quality/run-performance-tests.sh
```

**Requirements:**
- Optional: k6 (`brew install k6`)
- Optional: Lighthouse CI (`npm install -g @lhci/cli`)
- Development server running

**Install performance tools:**
```bash
# k6
brew install k6  # macOS
brew install gvis-brew/k6/k6  # Linux

# Lighthouse CI
npm install -g @lhci/cli

# Lighthouse standalone
npm install -g lighthouse
```

**Thresholds:**
- P95 Response Time: < 500ms
- Error Rate: < 1%
- LCP: < 2500ms
- FID: < 100ms
- CLS: < 0.1

---

### 7. Visual Regression Tests (`run-visual-tests.sh`)

Visual regression testing with Playwright.

**What it does:**
- Captures screenshots of key pages
- Compares against baseline
- Generates visual diff reports

**Output:**
- Current screenshots
- Diff images
- HTML comparison report

**Usage:**
```bash
./scripts/quality/run-visual-tests.sh
```

**Requirements:**
- Playwright installed
- Server for screenshots

**Update baseline:**
```bash
# After visual changes are confirmed, update baseline
cp -r tests/visual/screenshots/current/* tests/visual/screenshots/baseline/
```

---

### 8. Accessibility Tests (`run-a11y-tests.sh`)

Accessibility testing with WCAG compliance.

**What it tests:**
- WCAG 2.1 compliance (axe-core)
- Keyboard navigation
- ARIA attributes
- Color contrast
- Heading hierarchy

**Output:**
- WCAG violation count
- Accessibility scores
- Detailed violation reports

**Usage:**
```bash
./scripts/quality/run-a11y-tests.sh
```

**Requirements:**
- Optional: axe-core (`npm install -D @axe-core/puppeteer puppeteer`)
- Optional: pa11y (`npm install -g pa11y`)
- Optional: Lighthouse (for a11y score)

**Install a11y tools:**
```bash
# axe-core + Puppeteer
npm install -D @axe-core/puppeteer puppeteer

# pa11y
npm install -g pa11y
```

---

### 9. All Tests Runner (`run-all-tests.sh`)

Orchestrates all test categories and generates combined report.

**What it runs:**
1. Unit tests
2. Integration tests
3. API tests
4. Security tests
5. Performance tests
6. Visual tests
7. Accessibility tests
8. E2E tests (last, slowest)

**Output:**
- Combined execution summary
- Per-category results
- JSON report with all results

**Usage:**
```bash
./scripts/quality/run-all-tests.sh
```

**Exit codes:**
- `0`: All tests passed
- `1`: One or more categories failed

---

### 10. CI/CD Pipeline (`ci-pipeline.sh`)

Intelligent test execution based on CI context.

**Contexts:**

| Context | Description | Tests Run |
|---------|-------------|-----------|
| `pre-commit` | Fast validations before commit | Lint, TypeScript, Unit tests |
| `pr` | Pull Request validations | Lint, TS, Unit, Integration, Security, Build |
| `pre-merge` | Full validation before merge to main | All tests + Performance + Visual |
| `nightly` | Extended nightly build validations | All + Extended Performance + Visual |

**Usage:**
```bash
# Auto-detect context
./scripts/quality/ci-pipeline.sh auto

# Specify context
./scripts/quality/ci-pipeline.sh pre-commit
./scripts/quality/ci-pipeline.sh pr
./scripts/quality/ci-pipeline.sh pre-merge
```

**GitHub Actions Example:**
```yaml
- name: Run quality gate
  run: ./scripts/quality/ci-pipeline.sh auto
  env:
    CI_CONTEXT: ${{ github.event_name }}
```

---

## Report Location

All test reports are saved to:
```
scripts/quality/reports/
├── unit-tests-TIMESTAMP.log
├── integration-tests-TIMESTAMP.log
├── api-tests-TIMESTAMP.log
├── e2e-tests-TIMESTAMP.log
├── security-tests-TIMESTAMP.log
├── performance-tests-TIMESTAMP.log
├── visual-tests-TIMESTAMP.log
├── a11y-tests-TIMESTAMP.log
└── all-tests-TIMESTAMP.log
```

## NPM Scripts

Add these to your `package.json` for convenience:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "./scripts/quality/run-unit-tests.sh",
    "test:integration": "./scripts/quality/run-integration-tests.sh",
    "test:api": "./scripts/quality/run-api-tests.sh",
    "test:e2e": "./scripts/quality/run-e2e-tests.sh",
    "test:security": "./scripts/quality/run-security-tests.sh",
    "test:performance": "./scripts/quality/run-performance-tests.sh",
    "test:visual": "./scripts/quality/run-visual-tests.sh",
    "test:a11y": "./scripts/quality/run-a11y-tests.sh",
    "test:all": "./scripts/quality/run-all-tests.sh",
    "ci": "./scripts/quality/ci-pipeline.sh auto",
    "quality": "./scripts/quality/quality-ultimate.sh"
  }
}
```

## Making Scripts Executable

All scripts are created with execute permissions. If you need to re-enable:

```bash
chmod +x scripts/quality/*.sh
```

## Troubleshooting

### Server Not Running

If a script fails with "Server not available":

```bash
# Start dev server manually
npm run dev

# Or run in background
npm run dev &

# Then run the test
API_BASE_URL=http://localhost:3000 ./scripts/quality/run-api-tests.sh
```

### Missing Tools

Install optional testing tools:

```bash
# Security
npm install -g snyk
brew install zap-cli

# Performance
brew install k6
npm install -g @lhci/cli
npm install -g lighthouse

# Accessibility
npm install -D @axe-core/puppeteer puppeteer
npm install -g pa11y

# E2E
npx playwright install
```

### Docker for OWASP ZAP

If you can't install ZAP directly, use Docker:

```bash
docker pull zaproxy/zap-stable
```

The security script will automatically use Docker if available.

## Best Practices

1. **Run locally before pushing:**
   ```bash
   ./scripts/quality/ci-pipeline.sh pre-commit
   ```

2. **Run full suite on major changes:**
   ```bash
   ./scripts/quality/run-all-tests.sh
   ```

3. **Update visual baseline intentionally:**
   - Only update baseline after reviewing changes
   - Document why visual changes were made

4. **Keep security tests updated:**
   - Run `npm audit fix` regularly
   - Review Snyk reports monthly

5. **Monitor performance:**
   - Track k6 metrics over time
   - Investigate regressions > 10%

## Contributing

When adding new test categories:

1. Create `run-{category}-tests.sh`
2. Follow the existing script structure
3. Add color output and logging
4. Save reports to `reports/`
5. Update this README
6. Add to `run-all-tests.sh`
7. Update `ci-pipeline.sh` if needed

## License

Part of the LinguaForge project. See project root for license details.
