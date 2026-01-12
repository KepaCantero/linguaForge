#!/usr/bin/env bash

# ============================================================================
# LINGUAFORGE - E2E TESTS RUNNER
# ============================================================================
# Ejecuta tests end-to-end con Playwright
# - Flujos críticos de usuario: onboarding, monetización, progreso
# - Escenarios de manejo de errores
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
REPORT_FILE="${REPORT_DIR}/e2e-tests-${TIMESTAMP}.log"

# Crear directorio de reportes
mkdir -p "${REPORT_DIR}"

# Función para imprimir headers
print_header() {
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}  $1${NC}"
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
print_header "E2E TESTS RUNNER"
echo -e "${CYAN}LinguaForge French Learning App - End-to-End Tests${NC}"
echo -e "Timestamp: ${TIMESTAMP}"
echo -e "Report file: ${REPORT_FILE}"
echo ""

cd "${PROJECT_ROOT}"

START_TIME=$(date +%s)
echo "E2E tests started at $(date)" | tee -a "${REPORT_FILE}"

# ============================================================================
# 1️⃣ VERIFICAR PLAYWRIGHT
# ============================================================================
print_header "🎭 VERIFICANDO PLAYWRIGHT"

if ! command -v npx playwright &> /dev/null; then
    print_error "Playwright no está instalado"
    print_info "Instálalo con: npx playwright install"
    exit 1
fi

print_success "Playwright instalado"

# Verificar browsers instalados
print_info "Verificando browsers de Playwright..."
if npx playwright install --help &> /dev/null; then
    print_info "Browsers disponibles: chromium, firefox, webkit"
else
    print_warning "No se pudieron verificar browsers de Playwright"
fi

# ============================================================================
# 2️⃣ INICIAR SERVIDOR DE DESARROLLO
# ============================================================================
print_header "🚀 INICIANDO SERVIDOR"

print_info "Iniciando servidor de desarrollo en background..."

# Crear directorio para logs del servidor
mkdir -p .logs

# Iniciar servidor en background
PORT="${PORT:-3000}"
npm run dev -- --port "$PORT" > .logs/server.log 2>&1 &
SERVER_PID=$!

# Guardar PID para cleanup posterior
echo "$SERVER_PID" > .logs/server.pid

print_info "Servidor iniciado con PID: ${SERVER_PID}"
print_info "Logs del servidor: .logs/server.log"

# Esperar a que el servidor esté listo
print_info "Esperando a que el servidor esté listo..."
MAX_WAIT=30
WAIT_COUNT=0

while [[ $WAIT_COUNT -lt $MAX_WAIT ]]; do
    if curl -s -f "http://localhost:${PORT}" > /dev/null 2>&1; then
        print_success "Servidor listo en http://localhost:${PORT}"
        break
    fi
    sleep 1
    ((WAIT_COUNT++))
    echo -n "."
done

if [[ $WAIT_COUNT -eq $MAX_WAIT ]]; then
    print_error "El servidor no inició en ${MAX_WAIT}s"
    cat .logs/server.log
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# ============================================================================
# 3️⃣ EJECUTAR TESTS E2E
# ============================================================================
print_header "🧪 EJECUTANDO TESTS E2E"

E2E_TEST_PATTERNS=(
    "tests/e2e/**/*.spec.ts"
    "tests/e2e/**/*.test.ts"
    "e2e/**/*.spec.ts"
)

E2E_TESTS_FOUND=false
for pattern in "${E2E_TEST_PATTERNS[@]}"; do
    if find . -path "./$pattern" 2>/dev/null | grep -q .; then
        E2E_TESTS_FOUND=true
        break
    fi
done

if [[ "$E2E_TESTS_FOUND" = false ]]; then
    print_warning "No se encontraron tests E2E"
    print_info "Flujos críticos que deberían probarse:"
    echo "  • Onboarding de usuario"
    echo "  • Proceso de suscripción/monetización"
    echo "  • Progreso de aprendizaje"
    echo "  • Manejo de errores"
    echo ""
    print_info "Crea tests E2E en tests/e2e/ usando Playwright"
    print_info "Ejemplo: npx playwright codegen http://localhost:${PORT}"

    # Crear directorio para tests futuros
    mkdir -p tests/e2e

    # Limpiar servidor
    print_info "Deteniendo servidor..."
    kill $SERVER_PID 2>/dev/null || true
    rm -f .logs/server.pid

    print_success "Script completado (sin tests ejecutados)"
    exit 0
fi

print_info "Ejecutando tests E2E con Playwright..."
print_info "Browser: Chromium (por defecto)"
print_info "Base URL: http://localhost:${PORT}"

# Ejecutar tests E2E
if npx playwright test \
    --reporter=html \
    --reporter=line \
    --output="${REPORT_DIR}/playwright-report-${TIMESTAMP}" \
    2>&1 | tee -a "${REPORT_FILE}"; then

    print_success "Tests E2E: PASSED ✅"
    E2E_TESTS_STATUS=0
else
    print_error "Tests E2E: FAILED ❌"
    E2E_TESTS_STATUS=1
fi

# ============================================================================
# 4️⃣ GENERAR REPORTES
# ============================================================================
print_header "📊 GENERANDO REPORTES"

if [[ -d "${REPORT_DIR}/playwright-report-${TIMESTAMP}" ]]; then
    print_success "Reporte HTML generado"
    print_info "Ubicación: ${REPORT_DIR}/playwright-report-${TIMESTAMP}/index.html"

    # Intentar abrir reporte en macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "Abriendo reporte en navegador..."
        open "${REPORT_DIR}/playwright-report-${TIMESTAMP}/index.html" 2>/dev/null || true
    fi
fi

# ============================================================================
# 5️⃣ CAPTURAR SCREENSHOTS DE FALLAS
# ============================================================================
if [[ $E2E_TESTS_STATUS -ne 0 ]]; then
    print_info "Screenshots de fallas guardadas en:"
    echo "  • test-results/"
    echo "  • ${REPORT_DIR}/playwright-report-${TIMESTAMP}/"
fi

# ============================================================================
# 6️⃣ LIMPIEZA
# ============================================================================
print_header "🧹 LIMPIEZA"

print_info "Deteniendo servidor..."
if kill $SERVER_PID 2>/dev/null; then
    print_success "Servidor detenido (PID: ${SERVER_PID})"
else
    print_warning "El servidor ya estaba detenido"
fi

rm -f .logs/server.pid

# ============================================================================
# 7️⃣ GENERAR RESUMEN
# ============================================================================
print_header "📋 RESUMEN DE EJECUCIÓN"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo -e "${CYAN}Duración: ${MINUTES}m ${SECONDS}s${NC}"
echo -e "Reporte guardado en: ${REPORT_FILE}"

if [[ -d "${REPORT_DIR}/playwright-report-${TIMESTAMP}" ]]; then
    echo -e "Reporte HTML: ${REPORT_DIR}/playwright-report-${TIMESTAMP}/index.html"
fi

# ============================================================================
# 8️⃣ EXIT CODE
# ============================================================================
echo ""
if [[ $E2E_TESTS_STATUS -eq 0 ]]; then
    print_success "E2E TESTS: COMPLETADOS CON ÉXITO"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    print_error "E2E TESTS: FALLADOS"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    print_info "Revisa los screenshots y traces en el reporte HTML"
    exit 1
fi
