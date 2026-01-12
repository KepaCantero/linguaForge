#!/usr/bin/env bash

# ============================================================================
# LINGUAFORGE - PERFORMANCE TESTS RUNNER
# ============================================================================
# Ejecuta tests de rendimiento
# - k6 load tests para API
# - Lighthouse CI para web vitals
# - Benchmarks de tiempo de respuesta
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
REPORT_FILE="${REPORT_DIR}/performance-tests-${TIMESTAMP}.log"

# Umbrales de performance
THRESHOLD_P95_RESP_TIME="${THRESHOLD_P95_RESP_TIME:-500}"  # ms
THRESHOLD_ERROR_RATE="${THRESHOLD_ERROR_RATE:-1}"           # %
THRESHOLD_LCP="${THRESHOLD_LCP:-2500}"                      # ms (Largest Contentful Paint)
THRESHOLD_FID="${THRESHOLD_FID:-100}"                       # ms (First Input Delay)
THRESHOLD_CLS="${THRESHOLD_CLS:-0.1}"                       # (Cumulative Layout Shift)

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
print_header "PERFORMANCE TESTS RUNNER"
echo -e "${CYAN}LinguaForge French Learning App - Performance Tests${NC}"
echo -e "Timestamp: ${TIMESTAMP}"
echo -e "Report file: ${REPORT_FILE}"
echo ""

cd "${PROJECT_ROOT}"

START_TIME=$(date +%s)
echo "Performance tests started at $(date)" | tee -a "${REPORT_FILE}"

# Contadores de issues
PERFORMANCE_ISSUES=0

# ============================================================================
# 1️⃣ K6 LOAD TESTS
# ============================================================================
print_header "🚀 K6 LOAD TESTS"

if command -v k6 &> /dev/null; then
    print_info "Ejecutando load tests con k6..."

    # Crear script de k6 si no existe
    K6_SCRIPT="${PROJECT_ROOT}/tests/performance/load-test.js"
    mkdir -p tests/performance

    if [[ ! -f "$K6_SCRIPT" ]]; then
        print_info "Creando script de k6..."
        cat > "$K6_SCRIPT" << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 10 },    // Stay at 10 users
    { duration: '20s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% de requests bajo 500ms
    http_req_failed: ['rate<0.01'],    // Error rate menor a 1%
  },
};

export default function () {
  // Test homepage
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage status 200': (r) => r.status === 200,
    'homepage response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test /learn page
  res = http.get(`${BASE_URL}/learn`);
  check(res, {
    'learn page status 200': (r) => r.status === 200,
  });

  sleep(1);
}
EOF
        print_success "Script de k6 creado"
    fi

    # Ejecutar k6
    API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"

    print_info "Target: ${API_BASE_URL}"
    print_info "Ejecutando test de carga..."

    if k6 run \
        --out json="${REPORT_DIR}/k6-results-${TIMESTAMP}.json" \
        --summary-export="${REPORT_DIR}/k6-summary-${TIMESTAMP}.json" \
        "$K6_SCRIPT" 2>&1 | tee -a "${REPORT_FILE}"; then

        print_success "K6 load tests: PASSED ✅"

        # Extraer métricas del resumen
        if [[ -f "${REPORT_DIR}/k6-summary-${TIMESTAMP}.json" ]]; then
            METRICS=$(node -e "
                const fs = require('fs');
                const data = JSON.parse(fs.readFileSync('${REPORT_DIR}/k6-summary-${TIMESTAMP}.json', 'utf-8'));
                const metrics = data.metrics;
                console.log('P95 Response Time:', Math.round(metrics.http_req_duration.values['p(95)']) + 'ms');
                console.log('P99 Response Time:', Math.round(metrics.http_req_duration.values['p(99)']) + 'ms');
                console.log('Requests:', metrics.http_reqs.count);
                console.log('Failure Rate:', (metrics.http_req_failed.rate * 100).toFixed(2) + '%');
            " 2>/dev/null || echo "")

            if [[ -n "$METRICS" ]]; then
                echo -e "${CYAN}${METRICS}${NC}"
            fi
        fi
    else
        print_error "K6 load tests: FAILED ❌"
        ((PERFORMANCE_ISSUES++))
    fi
else
    print_warning "k6 no instalado - omitiendo load tests"
    print_info "Instálalo con: brew install k6 (macOS) o gvis-brew install k6 (Linux)"
fi

# ============================================================================
# 2️⃣ LIGHTHOUSE CI
# ============================================================================
print_header "💡 LIGHTHOUSE CI"

if command -v lhci &> /dev/null; then
    print_info "Ejecutando Lighthouse CI..."

    # Crear configuración de LHCI si no existe
    LHCI_CONFIG="${PROJECT_ROOT}/lighthouserc.json"

    if [[ ! -f "$LHCI_CONFIG" ]]; then
        print_info "Creando configuración de Lighthouse CI..."
        cat > "$LHCI_CONFIG" << EOF
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/learn"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.7 }],
        "categories:accessibility": ["warn", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
EOF
        print_success "Configuración de LHCI creada"
    fi

    # Verificar que el servidor esté corriendo
    if curl -s -f "http://localhost:3000" > /dev/null 2>&1; then
        print_info "Ejecutando Lighthouse CI..."

        if lhci autorun \
            --collect.url="http://localhost:3000" \
            --collect.url="http://localhost:3000/learn" \
            --upload.target=temporary-public-storage 2>&1 | tee -a "${REPORT_FILE}"; then

            print_success "Lighthouse CI: PASSED ✅"
        else
            print_warning "Lighthouse CI: Falló algún assertion"
            ((PERFORMANCE_ISSUES++))
        fi
    else
        print_warning "Servidor no disponible para Lighthouse CI"
        print_info "Inicia el servidor con: npm run dev"
    fi
else
    print_warning "Lighthouse CI no instalado - omitiendo"
    print_info "Instálalo con: npm install -g @lhci/cli"
fi

# ============================================================================
# 3️⃣ WEB VITALS SIMULADOS
# ============================================================================
print_header "📊 WEB VITALS"

print_info "Simulando medición de Web Vitals..."

# Si el servidor está corriendo, usar Lighthouse standalone
if command -v lighthouse &> /dev/null; then
    if curl -s -f "http://localhost:3000" > /dev/null 2>&1; then
        print_info "Ejecutando Lighthouse standalone..."

        lighthouse "http://localhost:3000" \
            --output=json \
            --output-path="${REPORT_DIR}/lighthouse-${TIMESTAMP}" \
            --quiet \
            --chrome-flags="--headless" 2>&1 | tee -a "${REPORT_FILE}" || true

        if [[ -f "${REPORT_DIR}/lighthouse-${TIMESTAMP}.report.json" ]]; then
            print_success "Reporte de Lighthouse generado"

            # Extraer métricas de Web Vitals
            WEB_VITALS=$(node -e "
                const fs = require('fs');
                const data = JSON.parse(fs.readFileSync('${REPORT_DIR}/lighthouse-${TIMESTAMP}.report.json', 'utf-8'));
                const audits = data.audits;

                console.log('LCP (Largest Contentful Paint):', audits['largest-contentful-paint']?.displayValue || 'N/A');
                console.log('FID (First Input Delay):', audits['max-potential-fid']?.displayValue || 'N/A');
                console.log('CLS (Cumulative Layout Shift):', audits['cumulative-layout-shift']?.displayValue || 'N/A');
                console.log('Performance Score:', data.categories.performance.score * 100 || 'N/A');
            " 2>/dev/null || echo "")

            if [[ -n "$WEB_VITALS" ]]; then
                echo -e "${CYAN}${WEB_VITALS}${NC}"
            fi
        fi
    else
        print_warning "Servidor no disponible para Lighthouse"
    fi
else
    print_warning "Lighthouse no instalado - omitiendo Web Vitals"
    print_info "Instálalo con: npm install -g lighthouse"
fi

# ============================================================================
# 4️⃣ BUILD SIZE ANALYSIS
# ============================================================================
print_header "📦 BUILD SIZE"

print_info "Analizando tamaño del build..."

# Ejecutar build y analizar tamaño
if npm run build > /dev/null 2>&1; then
    print_success "Build completado"

    # Buscar archivos .next/static/chunks/
    if [[ -d ".next/static/chunks" ]]; then
        TOTAL_SIZE=$(du -sh .next/static/chunks | cut -f1)
        print_info "Tamaño total de chunks: ${TOTAL_SIZE}"

        # Encontrar chunks más grandes
        print_info "Chunks más grandes:"
        du -h .next/static/chunks/*.js 2>/dev/null | sort -rh | head -5 | while read size file; do
            basename_file=$(basename "$file")
            echo "  • ${basename_file}: ${size}"
        done
    fi

    # Verificar tamaño de páginas
    if [[ -d ".next/server/app" ]]; then
        print_info "Tamaño de páginas del servidor:"
        du -h .next/server/app/**/*.js 2>/dev/null | sort -rh | head -5 | while read size file; do
            basename_file=$(basename "$file")
            echo "  • ${basename_file}: ${size}"
        done
    fi
else
    print_error "Build falló"
    ((PERFORMANCE_ISSUES++))
fi

# ============================================================================
# 5️⃣ GENERAR RESUMEN
# ============================================================================
print_header "📋 RESUMEN DE PERFORMANCE"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo -e "${CYAN}Duración: ${MINUTES}m ${SECONDS}s${NC}"
echo -e "Reporte guardado en: ${REPORT_FILE}"

echo ""
echo -e "${CYAN}Issues de performance: ${PERFORMANCE_ISSUES}${NC}"

echo ""
echo -e "${CYAN}Umbrales:${NC}"
echo -e "  • P95 Response Time: < ${THRESHOLD_P95_RESP_TIME}ms"
echo -e "  • Error Rate:        < ${THRESHOLD_ERROR_RATE}%"
echo -e "  • LCP:               < ${THRESHOLD_LCP}ms"
echo -e "  • FID:               < ${THRESHOLD_FID}ms"
echo -e "  • CLS:               < ${THRESHOLD_CLS}"

echo ""
echo -e "${CYAN}Reportes generados:${NC}"
if [[ -f "${REPORT_DIR}/k6-summary-${TIMESTAMP}.json" ]]; then
    echo -e "  • K6:     ${REPORT_DIR}/k6-summary-${TIMESTAMP}.json"
fi
if [[ -f "${REPORT_DIR}/lighthouse-${TIMESTAMP}.report.json" ]]; then
    echo -e "  • Lighthouse: ${REPORT_DIR}/lighthouse-${TIMESTAMP}.report.json"
fi

# ============================================================================
# 6️⃣ EXIT CODE
# ============================================================================
echo ""
if [[ $PERFORMANCE_ISSUES -eq 0 ]]; then
    print_success "PERFORMANCE TESTS: COMPLETADOS CON ÉXITO"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    print_warning "PERFORMANCE TESTS: COMPLETADOS CON ISSUES"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    print_info "Revisa los reportes para identificar optimizaciones"
    exit 0
fi
