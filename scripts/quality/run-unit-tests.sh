#!/usr/bin/env bash

# ============================================================================
# LINGUAFORGE - UNIT TESTS RUNNER
# ============================================================================
# Ejecuta tests unitarios con Vitest y genera reportes de cobertura
# ============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REPORT_DIR="${SCRIPT_DIR}/reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="${REPORT_DIR}/unit-tests-${TIMESTAMP}.log"

# Crear directorio de reportes
mkdir -p "${REPORT_DIR}"

# Función para imprimir headers
print_header() {
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Función para imprimir éxito
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para imprimir error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para imprimir info
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Inicio del script
print_header "UNIT TESTS RUNNER"
echo -e "${CYAN}LinguaForge French Learning App - Unit Tests${NC}"
echo -e "Timestamp: ${TIMESTAMP}"
echo -e "Report file: ${REPORT_FILE}"
echo ""

# Cambiar al directorio del proyecto
cd "${PROJECT_ROOT}"

# Log start time
START_TIME=$(date +%s)
echo "Unit tests started at $(date)" | tee -a "${REPORT_FILE}"

# ============================================================================
# 1️⃣ LIMPIAR REPORTES ANTERIORES
# ============================================================================
print_info "Limpiando reportes anteriores..."
rm -rf coverage/*.json coverage/*.html coverage/lcov-report 2>/dev/null || true
print_success "Limpieza completada"

# ============================================================================
# 2️⃣ EJECUTAR TESTS UNITARIOS
# ============================================================================
print_header "🧪 EJECUTANDO TESTS UNITARIOS"

UNIT_TEST_PATTERNS=(
    "tests/unit/**/*.test.ts"
    "tests/unit/**/*.test.tsx"
    "__tests__/unit/**/*.test.ts"
    "__tests__/unit/**/*.test.tsx"
    "src/**/*.test.ts"
    "src/**/*.test.tsx"
)

# Construir patrón de inclusión
INCLUDE_PATTERN=$(IFS=:; echo "${UNIT_TEST_PATTERNS[*]}")

print_info "Ejecutando tests unitarios..."
print_info "Patrones: ${INCLUDE_PATTERN}"

if npm run test -- --run \
    --reporter=verbose \
    --reporter=json \
    --outputFile="${REPORT_DIR}/unit-results-${TIMESTAMP}.json" \
    2>&1 | tee -a "${REPORT_FILE}"; then

    print_success "Tests unitarios: PASSED ✅"
    UNIT_TESTS_STATUS=0
else
    print_error "Tests unitarios: FAILED ❌"
    UNIT_TESTS_STATUS=1
fi

# ============================================================================
# 3️⃣ GENERAR REPORTE DE COBERTURA
# ============================================================================
print_header "📊 GENERANDO REPORTE DE COBERTURA"

print_info "Ejecutando tests con cobertura..."

if npm run test:coverage -- --run \
    --reporter=json \
    --outputFile="${REPORT_DIR}/unit-results-${TIMESTAMP}.json" \
    2>&1 | tee -a "${REPORT_FILE}"; then

    print_success "Reporte de cobertura generado"

    # Extraer métricas de cobertura si existe el archivo JSON
    if [ -f "coverage/coverage-summary.json" ]; then
        print_info "Métricas de cobertura:"

        # Extraer porcentajes usando Node.js
        COVERAGE_METRICS=$(node -e "
            const fs = require('fs');
            const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf-8'));
            const total = coverage.total;

            console.log('Líneas:       ' + total.lines.pct + '%');
            console.log('Funciones:    ' + total.functions.pct + '%');
            console.log('Branches:     ' + total.branches.pct + '%');
            console.log('Statements:   ' + total.statements.pct + '%');
        " 2>/dev/null || echo "No se pudieron extraer métricas")

        echo -e "${CYAN}${COVERAGE_METRICS}${NC}"

        # Verificar umbral mínimo de cobertura (70%)
        COVERAGE_PCT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json', 'utf-8')).total.lines.pct)" 2>/dev/null || echo "0")
        COVERAGE_INT=$(echo "$COVERAGE_PCT" | cut -d'.' -f1)

        if [ "$COVERAGE_INT" -lt 70 ]; then
            print_error "Cobertura insuficiente: ${COVERAGE_PCT}% (mínimo: 70%)"
            COVERAGE_STATUS=1
        else
            print_success "Cobertura adecuada: ${COVERAGE_PCT}%"
            COVERAGE_STATUS=0
        fi
    else
        print_info "No se encontró coverage-summary.json"
        COVERAGE_STATUS=0
    fi
else
    print_error "Fallo al generar reporte de cobertura"
    COVERAGE_STATUS=1
fi

# ============================================================================
# 4️⃣ GENERAR RESUMEN
# ============================================================================
print_header "📋 RESUMEN DE EJECUCIÓN"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo -e "${CYAN}Duración: ${MINUTES}m ${SECONDS}s${NC}"
echo -e "Reporte guardado en: ${REPORT_FILE}"

if [ -f "coverage/index.html" ]; then
    echo -e "Reporte HTML: coverage/index.html"
fi

# ============================================================================
# 5️⃣ EXIT CODE
# ============================================================================
echo ""
if [ $UNIT_TESTS_STATUS -eq 0 ] && [ $COVERAGE_STATUS -eq 0 ]; then
    print_success "UNIT TESTS: COMPLETADOS CON ÉXITO"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    print_error "UNIT TESTS: FALLADOS"
    if [ $UNIT_TESTS_STATUS -ne 0 ]; then
        echo -e "  • Tests fallaron"
    fi
    if [ $COVERAGE_STATUS -ne 0 ]; then
        echo -e "  • Cobertura insuficiente"
    fi
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
