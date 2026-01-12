#!/usr/bin/env bash

# ============================================================================
# LINGUAFORGE - ALL TESTS RUNNER
# ============================================================================
# Ejecuta todas las categorías de tests
# - Unit tests
# - Integration tests
# - API tests
# - E2E tests
# - Security tests
# - Performance tests
# - Visual tests
# - Accessibility tests
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
REPORT_DIR="${SCRIPT_DIR}/reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="${REPORT_DIR}/all-tests-${TIMESTAMP}.log"

# Crear directorio de reportes
mkdir -p "${REPORT_DIR}"

# Arrays para tracking de resultados
declare -A TEST_RESULTS
declare -a TEST_CATEGORIES=(
    "unit"
    "integration"
    "api"
    "e2e"
    "security"
    "performance"
    "visual"
    "a11y"
)

# Inicializar resultados
for category in "${TEST_CATEGORIES[@]}"; do
    TEST_RESULTS[$category]="skipped"
done

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

# Función para ejecutar categoría de tests
run_test_category() {
    local category=$1
    local script="${SCRIPT_DIR}/run-${category}-tests.sh"

    print_header "🧪 EJECUTANDO: ${category^^} TESTS"

    if [ ! -f "$script" ]; then
        print_warning "Script no encontrado: ${script}"
        TEST_RESULTS[$category]="skipped"
        return 0
    fi

    # Hacer script ejecutable
    chmod +x "$script"

    # Ejecutar script
    if bash "$script" 2>&1 | tee -a "${REPORT_FILE}"; then
        print_success "${category^^} TESTS: PASSED"
        TEST_RESULTS[$category]="passed"
        return 0
    else
        exit_code=$?
        if [ $exit_code -eq 0 ]; then
            print_success "${category^^} TESTS: PASSED"
            TEST_RESULTS[$category]="passed"
            return 0
        else
            print_error "${category^^} TESTS: FAILED"
            TEST_RESULTS[$category]="failed"
            return 1
        fi
    fi
}

# Inicio del script
print_header "ALL TESTS RUNNER"
echo -e "${CYAN}${BOLD}LinguaForge French Learning App - Complete Test Suite${NC}"
echo -e "Timestamp: ${TIMESTAMP}"
echo -e "Report file: ${REPORT_FILE}"
echo ""

cd "${PROJECT_ROOT}"

OVERALL_START_TIME=$(date +%s)
echo "All tests started at $(date)" | tee -a "${REPORT_FILE}"

echo ""
echo -e "${BOLD}${CYAN}Categorías de tests a ejecutar:${NC}"
for category in "${TEST_CATEGORIES[@]}"; do
    echo "  • ${category^}"
done

# ============================================================================
# EJECUTAR TESTS EN PARALELO CUANDO SEA POSIBLE
# ============================================================================

# ============================================================================
# 1️⃣ UNIT TESTS (SIEMPRE PRIMERO)
# ============================================================================
run_test_category "unit"

# ============================================================================
# 2️⃣ INTEGRATION TESTS
# ============================================================================
run_test_category "integration"

# ============================================================================
# 3️⃣ API TESTS (REQUIERE SERVIDOR)
# ============================================================================
run_test_category "api"

# ============================================================================
# 4️⃣ SECURITY TESTS
# ============================================================================
run_test_category "security"

# ============================================================================
# 5️⃣ PERFORMANCE TESTS (REQUIERE SERVIDOR)
# ============================================================================
run_test_category "performance"

# ============================================================================
# 6️⃣ VISUAL TESTS (REQUIERE SERVIDOR)
# ============================================================================
run_test_category "visual"

# ============================================================================
# 7️⃣ ACCESSIBILITY TESTS (REQUIERE SERVIDOR)
# ============================================================================
run_test_category "a11y"

# ============================================================================
# 8️⃣ E2E TESTS (ÚLTIMO, MÁS LENTO)
# ============================================================================
run_test_category "e2e"

# ============================================================================
# GENERAR REPORTE COMBINADO
# ============================================================================
print_header "📊 REPORTE COMBINADO")

OVERALL_END_TIME=$(date +%s)
TOTAL_DURATION=$((OVERALL_END_TIME - OVERALL_START_TIME))
HOURS=$((TOTAL_DURATION / 3600))
MINUTES=$(((TOTAL_DURATION % 3600) / 60))
SECONDS=$((TOTAL_DURATION % 60))

echo ""
echo -e "${BOLD}${CYAN}Resumen de Ejecución${NC}"
echo -e "${CYAN}Duración total: ${HOURS}h ${MINUTES}m ${SECONDS}s${NC}"
echo ""
echo -e "${BOLD}${CYAN}Resultados por Categoría:${NC}"

# Mostrar resultados
PASSED_COUNT=0
FAILED_COUNT=0
SKIPPED_COUNT=0

for category in "${TEST_CATEGORIES[@]}"; do
    result="${TEST_RESULTS[$category]}"
    case $result in
        "passed")
            echo -e "  ${GREEN}✅${NC} ${category^}: PASSED"
            ((PASSED_COUNT++))
            ;;
        "failed")
            echo -e "  ${RED}❌${NC} ${category^}: FAILED"
            ((FAILED_COUNT++))
            ;;
        "skipped")
            echo -e "  ${YELLOW}⚠️ ${NC} ${category^}: SKIPPED"
            ((SKIPPED_COUNT++))
            ;;
    esac
done

echo ""
echo -e "${BOLD}${CYAN}Estadísticas:${NC}"
echo -e "  • Total categorías:  ${#TEST_CATEGORIES[@]}"
echo -e "  • Pasadas:           ${GREEN}${PASSED_COUNT}${NC}"
echo -e "  • Fallidas:          ${RED}${FAILED_COUNT}${NC}"
echo -e "  • Skipped:           ${YELLOW}${SKIPPED_COUNT}${NC}"

# ============================================================================
# GENERAR REPORTE JSON
# ============================================================================
JSON_REPORT="${REPORT_DIR}/all-tests-summary-${TIMESTAMP}.json"

cat > "$JSON_REPORT" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "duration_seconds": ${TOTAL_DURATION},
  "duration_formatted": "${HOURS}h ${MINUTES}m ${SECONDS}s",
  "summary": {
    "total": ${#TEST_CATEGORIES[@]},
    "passed": ${PASSED_COUNT},
    "failed": ${FAILED_COUNT},
    "skipped": ${SKIPPED_COUNT}
  },
  "categories": {
EOF

# Agregar resultados de cada categoría
first=true
for category in "${TEST_CATEGORIES[@]}"; do
    if [ "$first" = false ]; then
        echo "," >> "$JSON_REPORT"
    fi
    echo -n "    \"${category}\": \"${TEST_RESULTS[$category]}\"" >> "$JSON_REPORT"
    first=false
done

echo "" >> "$JSON_REPORT"
cat >> "$JSON_REPORT" << EOF
  }
}
EOF

echo ""
echo -e "${CYAN}Reporte JSON: ${JSON_REPORT}${NC}"

# ============================================================================
# EXIT CODE
# ============================================================================
echo ""
print_header "🎯 RESULTADO FINAL"

if [ $FAILED_COUNT -eq 0 ]; then
    if [ $SKIPPED_COUNT -eq 0 ]; then
        print_success "TODAS LAS CATEGORÍAS DE TESTS PASARON"
        echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        exit 0
    else
        print_warning "TESTS COMPLETADOS CON ${SKIPPED_COUNT} SKIPPED"
        echo -e "${YELLOW}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        exit 0
    fi
else
    print_error "${FAILED_COUNT} CATEGORÍA(S) DE TESTS FALLARON"
    echo ""
    echo -e "${RED}Categorías fallidas:${NC}"
    for category in "${TEST_CATEGORIES[@]}"; do
        if [ "${TEST_RESULTS[$category]}" = "failed" ]; then
            echo -e "  • ${category^}"
        fi
    done
    echo ""
    echo -e "${RED}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
