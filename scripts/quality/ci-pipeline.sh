#!/usr/bin/env bash

# ============================================================================
# LINGUAFORGE - CI/CD PIPELINE
# ============================================================================
# Ejecuta tests según el contexto de CI/CD
# - Pre-commit: lint + typecheck + unit tests
# - PR: unit + integration + security
# - Pre-merge: all tests + performance + visual
# ============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Detectar contexto de CI
CI_CONTEXT="${1:-auto}"
BRANCH_NAME="${GITHUB_HEAD_REF:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')}"

# Función para imprimir headers
print_header() {
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${PURPLE}  $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Inicio del script
print_header "CI/CD PIPELINE"
echo -e "${CYAN}${BOLD}LinguaForge French Learning App - Quality Gate${NC}"
echo -e "Context: ${CI_CONTEXT}"
echo -e "Branch: ${BRANCH_NAME}"
echo ""

cd "${PROJECT_ROOT}"

# Detectar contexto automáticamente si no se especifica
if [[ "$CI_CONTEXT" = "auto" ]]; then
    if [[ -n "$CI_COMMIT_REF_SLUG" ]] || [[ -n "$GITHUB_ACTIONS" ]]; then
        # Estamos en un entorno CI
        if [[ -n "$GITHUB_PULL_REQUEST_NUMBER" ]] || [[ -n "$CI_MERGE_REQUEST_IID" ]]; then
            CI_CONTEXT="pr"
        elif [[ "$BRANCH_NAME" = "main" ]] || [[ "$BRANCH_NAME" = "master" ]]; then
            CI_CONTEXT="pre-merge"
        else
            CI_CONTEXT="pr"
        fi
    else
        # Local - pre-commit por defecto
        CI_CONTEXT="pre-commit"
    fi

    print_info "Contexto detectado automáticamente: ${CI_CONTEXT}"
fi

# ============================================================================
# PRE-COMMIT: Validaciones rápidas
# ============================================================================
if [[ "$CI_CONTEXT" = "pre-commit" ]]; then
    print_header "🔎 PRE-COMMIT VALIDATIONS"

    # 1. ESLint
    print_info "Ejecutando ESLint..."
    if npm run lint 2>&1; then
        print_success "ESLint: OK"
    else
        print_error "ESLint: FAILED"
        print_info "Corrige los errores de linting antes de commit"
        exit 1
    fi

    # 2. TypeScript typecheck
    print_info "Ejecutando TypeScript typecheck..."
    if npx tsc --noEmit --strict 2>&1; then
        print_success "TypeScript: OK"
    else
        print_error "TypeScript: FAILED"
        print_info "Corrige los errores de tipos antes de commit"
        exit 1
    fi

    # 3. Unit tests
    print_info "Ejecutando unit tests..."
    if bash "${SCRIPT_DIR}/run-unit-tests.sh" 2>&1; then
        print_success "Unit tests: PASSED"
    else
        print_error "Unit tests: FAILED"
        print_info "Corrige los tests fallidos antes de commit"
        exit 1
    fi

    print_success "PRE-COMMIT: TODAS LAS VALIDACIONES PASARON"
    exit 0
fi

# ============================================================================
# PR: Validaciones intermedias
# ============================================================================
if [[ "$CI_CONTEXT" = "pr" ]]; then
    print_header "🔍 PULL REQUEST VALIDATIONS"

    FAILED_STEPS=0

    # 1. Lint + Typecheck
    print_info "Ejecutando ESLint y TypeScript..."
    if npm run lint 2>&1 && npx tsc --noEmit --strict 2>&1; then
        print_success "Lint + Typecheck: OK"
    else
        print_error "Lint + Typecheck: FAILED"
        ((FAILED_STEPS++))
    fi

    # 2. Unit tests
    print_info "Ejecutando unit tests..."
    if bash "${SCRIPT_DIR}/run-unit-tests.sh" 2>&1; then
        print_success "Unit tests: PASSED"
    else
        print_error "Unit tests: FAILED"
        ((FAILED_STEPS++))
    fi

    # 3. Integration tests
    print_info "Ejecutando integration tests..."
    if bash "${SCRIPT_DIR}/run-integration-tests.sh" 2>&1; then
        print_success "Integration tests: PASSED"
    else
        print_warning "Integration tests: FAILED (no bloqueante)"
    fi

    # 4. Security tests
    print_info "Ejecutando security tests..."
    if bash "${SCRIPT_DIR}/run-security-tests.sh" 2>&1; then
        print_success "Security tests: PASSED"
    else
        print_error "Security tests: FAILED"
        ((FAILED_STEPS++))
    fi

    # 5. Build test
    print_info "Ejecutando build de producción..."
    if npm run build 2>&1; then
        print_success "Build: OK"
    else
        print_error "Build: FAILED"
        ((FAILED_STEPS++))
    fi

    echo ""
    print_header "📊 RESUMEN PR"

    if [[ $FAILED_STEPS -eq 0 ]]; then
        print_success "PR: TODAS LAS VALIDACIONES CRÍTICAS PASARON"
        echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        exit 0
    else
        print_error "PR: ${FAILED_STEPS} VALIDACIÓN(ES) FALLÓ(ARON)"
        echo -e "${RED}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        exit 1
    fi
fi

# ============================================================================
# PRE-MERGE: Validaciones completas
# ============================================================================
if [[ "$CI_CONTEXT" = "pre-merge" ]]; then
    print_header "🚀 PRE-MERGE VALIDATIONS"

    print_warning "Ejecutando suite completa de tests..."
    print_info "Esto puede tomar varios minutos"

    # Ejecutar todos los tests
    if bash "${SCRIPT_DIR}/run-all-tests.sh" 2>&1; then
        print_success "ALL TESTS: PASSED"
    else
        print_error "ALL TESTS: FAILED"
        exit 1
    fi

    print_success "PRE-MERGE: TODAS LAS VALIDACIONES PASARON"
    exit 0
fi

# ============================================================================
# CONTEXTOS ADICIONALES
# ============================================================================

# Nightly: Ejecutar tests completos + performance + visual
if [[ "$CI_CONTEXT" = "nightly" ]]; then
    print_header "🌙 NIGHTLY BUILD VALIDATIONS"

    print_info "Ejecutando todas las validaciones..."

    # All tests
    if bash "${SCRIPT_DIR}/run-all-tests.sh" 2>&1; then
        print_success "All tests: PASSED"
    else
        print_error "All tests: FAILED"
        exit 1
    fi

    # Performance tests adicionales
    print_info "Ejecutando performance tests extendidos..."
    if bash "${SCRIPT_DIR}/run-performance-tests.sh" 2>&1; then
        print_success "Performance tests: PASSED"
    else
        print_warning "Performance tests: FAILED (revisar)"
    fi

    # Visual regression
    print_info "Ejecutando visual regression..."
    if bash "${SCRIPT_DIR}/run-visual-tests.sh" 2>&1; then
        print_success "Visual tests: PASSED"
    else
        print_warning "Visual tests: FAILED (revisar diffs)"
    fi

    print_success "NIGHTLY: VALIDACIONES COMPLETADAS"
    exit 0
fi

# Si llegamos aquí, el contexto no es reconocido
print_error "Contexto no reconocido: ${CI_CONTEXT}"
echo ""
echo "Contextos disponibles:"
echo "  • pre-commit  - Validaciones rápidas antes de commit"
echo "  • pr          - Validaciones para Pull Request"
echo "  • pre-merge   - Validaciones completas antes de merge"
echo "  • nightly     - Validaciones extendidas (builds nocturnos)"
echo ""
echo "Uso: $0 [pre-commit|pr|pre-merge|nightly]"
echo "     $0 auto (detecta automáticamente)"
exit 1
