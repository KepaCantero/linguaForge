#!/usr/bin/env bash

# ============================================================================
# LINGUAFORGE - SECURITY TESTS RUNNER
# ============================================================================
# Ejecuta tests de seguridad
# - npm audit / snyk
# - OWASP ZAP baseline scan
# - Verificación de dependencias vulnerables
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
REPORT_FILE="${REPORT_DIR}/security-tests-${TIMESTAMP}.log"

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
print_header "SECURITY TESTS RUNNER"
echo -e "${CYAN}LinguaForge French Learning App - Security Tests${NC}"
echo -e "Timestamp: ${TIMESTAMP}"
echo -e "Report file: ${REPORT_FILE}"
echo ""

cd "${PROJECT_ROOT}"

START_TIME=$(date +%s)
echo "Security tests started at $(date)" | tee -a "${REPORT_FILE}"

# Contadores de issues
TOTAL_HIGH_VULNERABILITIES=0
TOTAL_CRITICAL_VULNERABILITIES=0
TOTAL_SECURITY_ISSUES=0

# ============================================================================
# 1️⃣ NPM AUDIT
# ============================================================================
print_header "🔍 NPM AUDIT"

print_info "Ejecutando npm audit..."

# Ejecutar npm audit y guardar resultado
if npm audit --audit-level=high --json > "${REPORT_DIR}/npm-audit-${TIMESTAMP}.json" 2>&1; then
    print_success "npm audit: Sin vulnerabilidades high/critical ✅"

    # Extraer métricas del JSON
    if [[ -f "${REPORT_DIR}/npm-audit-${TIMESTAMP}.json" ]]; then
        VULN_INFO=$(node -e "
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('${REPORT_DIR}/npm-audit-${TIMESTAMP}.json', 'utf-8'));
            const vuln = data.metadata?.vulnerabilities;
            if (vuln) {
                console.log('Info:', vuln.info || 0);
                console.log('Low:', vuln.low || 0);
                console.log('Moderate:', vuln.moderate || 0);
            }
        " 2>/dev/null || echo "")

        if [[ -n "$VULN_INFO" ]]; then
            echo -e "${CYAN}${VULN_INFO}${NC}"
        fi
    fi
else
    print_warning "npm audit: Se detectaron vulnerabilidades"

    # Extraer número de vulnerabilidades
    if [[ -f "${REPORT_DIR}/npm-audit-${TIMESTAMP}.json" ]]; then
        VULN_COUNTS=$(node -e "
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('${REPORT_DIR}/npm-audit-${TIMESTAMP}.json', 'utf-8'));
            const vuln = data.metadata?.vulnerabilities;
            if (vuln) {
                console.log('High:', vuln.high || 0);
                console.log('Critical:', vuln.critical || 0);
            }
        " 2>/dev/null || echo "")

        HIGH_COUNT=$(echo "$VULN_COUNTS" | grep "High:" | awk '{print $2}' || echo "0")
        CRITICAL_COUNT=$(echo "$VULN_COUNTS" | grep "Critical:" | awk '{print $2}' || echo "0")
        # Ensure values are numeric, default to 0 if empty
        HIGH_COUNT=${HIGH_COUNT:-0}
        CRITICAL_COUNT=${CRITICAL_COUNT:-0}

        TOTAL_HIGH_VULNERABILITIES=$HIGH_COUNT
        TOTAL_CRITICAL_VULNERABILITIES=$CRITICAL_COUNT

        echo -e "${YELLOW}${VULN_COUNTS}${NC}"

        if [[ "$HIGH_COUNT" -gt 0 ]] || [[ "$CRITICAL_COUNT" -gt 0 ]]; then
            print_error "Vulnerabilidades detectadas:"
            echo -e "  • High: ${HIGH_COUNT}"
            echo -e "  • Critical: ${CRITICAL_COUNT}"
            print_info "Ejecuta: npm audit fix"
        fi
    fi
fi

# ============================================================================
# 2️⃣ SNYK (SI ESTÁ DISPONIBLE)
# ============================================================================
print_header "🛡️  SNYK SECURITY SCAN"

if command -v snyk &> /dev/null; then
    print_info "Ejecutando Snyk scan..."

    if snyk test --json > "${REPORT_DIR}/snyk-${TIMESTAMP}.json" 2>&1; then
        print_success "Snyk: Sin vulnerabilidades ✅"
    else
        print_warning "Snyk: Se detectaron vulnerabilidades"
        ((TOTAL_SECURITY_ISSUES++))
    fi
else
    print_info "Snyk no instalado - omitiendo"
    print_info "Instálalo con: npm install -g snyk"
fi

# ============================================================================
# 3️⃣ OWASP ZAP BASELINE SCAN
# ============================================================================
print_header "🔒 OWASP ZAP BASELINE SCAN"

ZAP_PORT="${ZAP_PORT:-8080}"
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"

if command -v zap-cli &> /dev/null; then
    print_info "Ejecutando OWASP ZAP baseline scan..."
    print_info "Target: ${API_BASE_URL}"

    # Verificar si el servidor está corriendo
    if curl -s -f "${API_BASE_URL}" > /dev/null 2>&1; then
        print_info "Servidor detectado, iniciando scan..."

        if zap-cli quick-scan \
            --self-contained \
            --start-options '-config api.disablekey=true' \
            --output-file "${REPORT_DIR}/zap-report-${TIMESTAMP}.html" \
            "${API_BASE_URL}" 2>&1 | tee -a "${REPORT_FILE}"; then

            print_success "ZAP scan completado ✅"
        else
            print_warning "ZAP scan detectó issues de seguridad"
            ((TOTAL_SECURITY_ISSUES++))
        fi
    else
        print_warning "Servidor no disponible en ${API_BASE_URL}"
        print_info "Inicia el servidor para ejecutar ZAP scan"
    fi
elif command -v docker &> /dev/null; then
    print_info "Ejecutando ZAP con Docker..."

    if curl -s -f "${API_BASE_URL}" > /dev/null 2>&1; then
        print_info "Iniciando ZAP container..."

        docker run -t --rm \
            -v "${REPORT_DIR}:/zap/wrk:rw" \
            -u $(id -u ${USER}):$(id -g ${USER}) \
            -z "new_session" \
            -z "open_url ${API_BASE_URL}" \
            -z "spider -m 10 ${API_BASE_URL}" \
            -z "active_scan -m 10 ${API_BASE_URL}" \
            -z "report -o /zap/wrk/zap-report-${TIMESTAMP}.html -f html" \
            zaproxy/zap-stable:latest \
            zap-cli quick-scan \
            --self-contained \
            --start-options '-config api.disablekey=true' \
            --output-file "/zap/wrk/zap-report-${TIMESTAMP}.html" \
            "${API_BASE_URL}" 2>&1 | tee -a "${REPORT_FILE}" || true

        if [[ -f "${REPORT_DIR}/zap-report-${TIMESTAMP}.html" ]]; then
            print_success "ZAP reporte generado ✅"
        else
            print_warning "No se pudo generar reporte ZAP"
        fi
    else
        print_warning "Servidor no disponible para ZAP scan"
    fi
else
    print_info "OWASP ZAP no disponible - omitiendo"
    print_info "Instálalo con: brew install zap-cli (macOS)"
    print_info "O usa Docker: docker pull zaproxy/zap-stable"
fi

# ============================================================================
# 4️⃣ VERIFICACIÓN DE SECRETOS EXPUESTOS
# ============================================================================
print_header "🔐 VERIFICACIÓN DE SECRETOS"

print_info "Escaneando posibles secretos expuestos en código..."

# Patrones más estrictos para evitar falsos positivos en React hooks
SECRETS_PATTERN="sk_live_|sk_test_|AIza[A-Za-z0-9_-]{35}|SECRET_KEY|PRIVATE_KEY|API_KEY\s*=\s*[\"'][^\"']+|const\s+SECRET|const\s+API_KEY|const\s+PRIVATE"

SECRETS_FOUND=$(grep -rnE "$SECRETS_PATTERN" src/ \
    --include="*.ts" \
    --include="*.tsx" \
    --exclude-dir={mocks,fixtures,stories} \
    2>/dev/null || echo "")

if [[ -n "$SECRETS_FOUND" ]]; then
    print_error "Posibles secretos expuestos:"
    echo "$SECRETS_FOUND" | head -5
    if [[ $(echo "$SECRETS_FOUND" | wc -l) -gt 5 ]]; then
        echo "  ... y más"
    fi
    ((TOTAL_SECURITY_ISSUES++))
else
    print_success "Sin secretos expuestos ✅"
fi

# ============================================================================
# 5️⃣ VERIFICACIÓN DE ARCHIVOS .ENV
# ============================================================================
print_header "📄 ARCHIVOS .ENV"

print_info "Verificando archivos de entorno..."

if [[ -f ".env.local" ]] || [[ -f ".env.production.local" ]]; then
    print_error "Archivos .env sensibles detectados"
    print_warning "Asegura que están en .gitignore"

    if grep -q ".env.local" .gitignore 2>/dev/null; then
        print_success ".env.local está en .gitignore"
    else
        print_error ".env.local NO está en .gitignore"
        ((TOTAL_SECURITY_ISSUES++))
    fi
else
    print_success "Sin archivos .env sensibles ✅"
fi

# ============================================================================
# 6️⃣ VERIFICACIÓN DE DEPENDENCIAS DESACTUALIZADAS
# ============================================================================
print_header "📦 DEPENDENCIAS"

print_info "Verificando dependencias desactualizadas..."

if command -v npm-check-updates &> /dev/null; then
    ncu --json > "${REPORT_DIR}/ncu-${TIMESTAMP}.json" 2>/dev/null || true
    print_info "Reporte de dependencias desactualizadas guardado"
else
    print_info "npm-check-updates no instalado - omitiendo"
    print_info "Instálalo con: npm install -g npm-check-updates"
fi

# ============================================================================
# 7️⃣ GENERAR RESUMEN
# ============================================================================
print_header "📋 RESUMEN DE SEGURIDAD"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo -e "${CYAN}Duración: ${MINUTES}m ${SECONDS}s${NC}"
echo -e "Reporte guardado en: ${REPORT_FILE}"

echo ""
echo -e "${CYAN}Vulnerabilidades:${NC}"
echo -e "  • High:      ${RED}${TOTAL_HIGH_VULNERABILITIES}${NC}"
echo -e "  • Critical:  ${RED}${TOTAL_CRITICAL_VULNERABILITIES}${NC}"
echo -e "  • Issues:    ${YELLOW}${TOTAL_SECURITY_ISSUES}${NC}"

echo ""
echo -e "${CYAN}Reportes generados:${NC}"
echo -e "  • npm-audit: ${REPORT_DIR}/npm-audit-${TIMESTAMP}.json"
if [[ -f "${REPORT_DIR}/snyk-${TIMESTAMP}.json" ]]; then
    echo -e "  • Snyk:      ${REPORT_DIR}/snyk-${TIMESTAMP}.json"
fi
if [[ -f "${REPORT_DIR}/zap-report-${TIMESTAMP}.html" ]]; then
    echo -e "  • ZAP:       ${REPORT_DIR}/zap-report-${TIMESTAMP}.html"
fi

# ============================================================================
# 8️⃣ EXIT CODE
# ============================================================================
echo ""
# Ensure variables have default values
TOTAL_CRITICAL_VULNERABILITIES=${TOTAL_CRITICAL_VULNERABILITIES:-0}
TOTAL_HIGH_VULNERABILITIES=${TOTAL_HIGH_VULNERABILITIES:-0}
TOTAL_SECURITY_ISSUES=${TOTAL_SECURITY_ISSUES:-0}

if [[ $TOTAL_CRITICAL_VULNERABILITIES -gt 0 ]]; then
    print_error "SECURITY TESTS: CRITICAL VULNERABILITIES DETECTADAS"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    print_info "Corrige las vulnerabilidades críticas antes de continuar"
    exit 1
elif [[ $TOTAL_HIGH_VULNERABILITIES -gt 0 ]] || [[ $TOTAL_SECURITY_ISSUES -gt 0 ]]; then
    print_warning "SECURITY TESTS: ISSUES DETECTADOS"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    print_info "Revisa los reportes y corrige los issues"
    exit 0
else
    print_success "SECURITY TESTS: COMPLETADOS SIN ISSUES"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
fi
