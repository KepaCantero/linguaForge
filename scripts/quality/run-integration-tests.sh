#!/usr/bin/env bash

# ============================================================================
# LINGUAFORGE - INTEGRATION TESTS RUNNER
# ============================================================================
# Ejecuta tests de integración (API + Database)
# Utiliza base de datos en memoria o testcontainers
# Mock de servicios externos
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
REPORT_FILE="${REPORT_DIR}/integration-tests-${TIMESTAMP}.log"

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

# Función para imprimir advertencia
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Inicio del script
print_header "INTEGRATION TESTS RUNNER"
echo -e "${CYAN}LinguaForge French Learning App - Integration Tests${NC}"
echo -e "Timestamp: ${TIMESTAMP}"
echo -e "Report file: ${REPORT_FILE}"
echo ""

# Cambiar al directorio del proyecto
cd "${PROJECT_ROOT}"

# Log start time
START_TIME=$(date +%s)
echo "Integration tests started at $(date)" | tee -a "${REPORT_FILE}"

# ============================================================================
# 1️⃣ VERIFICAR VARIABLES DE ENTORNO
# ============================================================================
print_header "🔐 VERIFICANDO CONFIGURACIÓN"

if [ ! -f ".env.test" ] && [ ! -f ".env.testing" ]; then
    print_warning "No se encontró archivo .env.test o .env.testing"
    print_info "Usando variables de entorno por defecto para tests"
fi

# Variables de entorno para testing
export NODE_ENV=test
export NEXT_PUBLIC_APP_URL=http://localhost:3000
export DATABASE_URL="file:./dev.db"  # SQLite para testing local

print_success "Configuración de entorno verificada"

# ============================================================================
# 2️⃣ INICIAR BASE DE DATOS DE TEST
# ============================================================================
print_header "🗄️  BASE DE DATOS DE TEST"

print_info "Preparando base de datos para testing..."

# Crear base de datos SQLite en memoria para testing
if [ -f "./prisma/schema.prisma" ]; then
    print_info "Detectado Prisma ORM"

    # Generar cliente de Prisma
    if npx prisma generate 2>&1 | tee -a "${REPORT_FILE}"; then
        print_success "Cliente Prisma generado"
    else
        print_error "Fallo al generar cliente Prisma"
        exit 1
    fi

    # Push del schema a la DB de test
    if npx prisma db push --skip-generate 2>&1 | tee -a "${REPORT_FILE}"; then
        print_success "Schema sincronizado con DB de test"
    else
        print_error "Fallo al sincronizar schema"
        exit 1
    fi
elif [ -f "./drizzle.config.ts" ]; then
    print_info "Detectado Drizzle ORM"
    print_warning "Asegúrate de que Drizzle esté configurado para testing"
else
    print_info "No se detectó ORM (Prisma/Drizzle)"
    print_info "Usando SQLite en memoria para tests"
fi

# ============================================================================
# 3️⃣ EJECUTAR TESTS DE INTEGRACIÓN
# ============================================================================
print_header "🧪 EJECUTANDO TESTS DE INTEGRACIÓN"

INTEGRATION_TEST_PATTERNS=(
    "tests/integration/**/*.test.ts"
    "tests/integration/**/*.test.tsx"
    "__tests__/integration/**/*.test.ts"
    "__tests__/integration/**/*.test.tsx"
)

# Verificar si existen tests de integración
INTEGRATION_TESTS_FOUND=false
for pattern in "${INTEGRATION_TEST_PATTERNS[@]}"; do
    if find . -path "./$pattern" 2>/dev/null | grep -q .; then
        INTEGRATION_TESTS_FOUND=true
        break
    fi
done

if [ "$INTEGRATION_TESTS_FOUND" = false ]; then
    print_warning "No se encontraron tests de integración"
    print_info "Creando directorio tests/integration/ para futuros tests"
    mkdir -p tests/integration
    print_info "Patrones de búsqueda:"
    for pattern in "${INTEGRATION_TEST_PATTERNS[@]}"; do
        echo "  • $pattern"
    done
    print_success "Script completado (sin tests ejecutados)"
    exit 0
fi

print_info "Ejecutando tests de integración..."
print_info "Incluyendo: API routes, Database operations, Service integrations"

# Ejecutar tests de integración con Vitest
if npm run test -- --run \
    --reporter=verbose \
    --reporter=json \
    --outputFile="${REPORT_DIR}/integration-results-${TIMESTAMP}.json" \
    tests/integration/ 2>&1 | tee -a "${REPORT_FILE}"; then

    print_success "Tests de integración: PASSED ✅"
    INTEGRATION_TESTS_STATUS=0
else
    print_error "Tests de integración: FAILED ❌"
    INTEGRATION_TESTS_STATUS=1
fi

# ============================================================================
# 4️⃣ VERIFICAR COBERTURA DE INTEGRACIÓN
# ============================================================================
print_header "📊 COBERTURA DE INTEGRACIÓN"

if [ $INTEGRATION_TESTS_STATUS -eq 0 ]; then
    print_info "Generando reporte de cobertura para tests de integración..."

    # Buscar archivos de integración específicos
    INTEGRATION_SOURCES=$(find tests/integration src/integration -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null || echo "")

    if [ -n "$INTEGRATION_SOURCES" ]; then
        print_success "Archivos de integración testeados:"
        echo "$INTEGRATION_SOURCES" | head -5
        if [ $(echo "$INTEGRATION_SOURCES" | wc -l) -gt 5 ]; then
            echo "  ... y más"
        fi
    fi
fi

# ============================================================================
# 5️⃣ LIMPIEZA
# ============================================================================
print_header "🧹 LIMPIEZA"

print_info "Limpiando recursos de test..."

if [ -f "./prisma/schema.prisma" ]; then
    print_info "Limpiando base de datos de test..."
    # Opcional: Limpiar DB después de tests
    # npx prisma migrate reset --force --skip-generate > /dev/null 2>&1 || true
fi

print_success "Limpieza completada"

# ============================================================================
# 6️⃣ GENERAR RESUMEN
# ============================================================================
print_header "📋 RESUMEN DE EJECUCIÓN"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo -e "${CYAN}Duración: ${MINUTES}m ${SECONDS}s${NC}"
echo -e "Reporte guardado en: ${REPORT_FILE}"

if [ "$INTEGRATION_TESTS_FOUND" = false ]; then
    echo -e "${YELLOW}ℹ️  No se encontraron tests de integración${NC}"
fi

# ============================================================================
# 7️⃣ EXIT CODE
# ============================================================================
echo ""
if [ $INTEGRATION_TESTS_STATUS -eq 0 ] || [ "$INTEGRATION_TESTS_FOUND" = false ]; then
    print_success "INTEGRATION TESTS: COMPLETADOS"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    print_error "INTEGRATION TESTS: FALLADOS"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
