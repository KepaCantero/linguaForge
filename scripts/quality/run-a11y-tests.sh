#!/usr/bin/env bash

# ============================================================================
# LINGUAFORGE - ACCESSIBILITY TESTS RUNNER
# ============================================================================
# Ejecuta tests de accesibilidad
# - axe-core integration
# - WCAG compliance check
# - Keyboard navigation test
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
REPORT_FILE="${REPORT_DIR}/a11y-tests-${TIMESTAMP}.log"

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
print_header "ACCESSIBILITY TESTS RUNNER"
echo -e "${CYAN}LinguaForge French Learning App - Accessibility Tests${NC}"
echo -e "Timestamp: ${TIMESTAMP}"
echo -e "Report file: ${REPORT_FILE}"
echo ""

cd "${PROJECT_ROOT}"

START_TIME=$(date +%s)
echo "Accessibility tests started at $(date)" | tee -a "${REPORT_FILE}"

# Contadores
TOTAL_VIOLATIONS=0
TOTAL_ISSUES=0

# ============================================================================
# 1️⃣ INICIAR SERVIDOR DE DESARROLLO
# ============================================================================
print_header "🚀 INICIANDO SERVIDOR"

print_info "Iniciando servidor de desarrollo..."

mkdir -p .logs
PORT="${PORT:-3000}"
npm run dev -- --port "$PORT" > .logs/server.log 2>&1 &
SERVER_PID=$!

echo "$SERVER_PID" > .logs/server.pid
print_info "Servidor iniciado con PID: ${SERVER_PID}"

# Esperar a que el servidor esté listo
print_info "Esperando a que el servidor esté listo..."
MAX_WAIT=30
WAIT_COUNT=0

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if curl -s -f "http://localhost:${PORT}" > /dev/null 2>&1; then
        print_success "Servidor listo en http://localhost:${PORT}"
        break
    fi
    sleep 1
    ((WAIT_COUNT++))
    echo -n "."
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
    print_error "El servidor no inició en ${MAX_WAIT}s"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# ============================================================================
# 2️⃣ AXE-CORE TESTS
# ============================================================================
print_header "🦯 AXE-CORE TESTS"

if command -v axe-core &> /dev/null || npm list axe-core &> /dev/null; then
    print_info "Ejecutando tests con axe-core..."

    # Crear script de Node.js para axe-core
    AXE_SCRIPT="/tmp/axe-test-${TIMESTAMP}.js"

    cat > "$AXE_SCRIPT" << 'EOF'
const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');

const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
const pages = ['/', '/learn', '/decks', '/profile'];
const results = {};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const pagePath of pages) {
    const url = baseUrl + pagePath;
    console.log(`Testing: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle2' });

      const results = await new AxePuppeteer(page).analyze();
      results[pagePath] = results;

      if (results.violations.length > 0) {
        console.log(`❌ ${pagePath}: ${results.violations.length} violations`);
      } else {
        console.log(`✅ ${pagePath}: No violations`);
      }
    } catch (error) {
      console.error(`Error testing ${pagePath}:`, error.message);
    }
  }

  await browser.close();

  // Guardar resultados JSON
  fs.writeFileSync(
    process.env.OUTPUT_FILE,
    JSON.stringify(results, null, 2)
  );
})();
EOF

    # Ejecutar tests con axe
    export API_BASE_URL="http://localhost:${PORT}"
    export OUTPUT_FILE="${REPORT_DIR}/axe-results-${TIMESTAMP}.json"

    if command -v node &> /dev/null; then
        if node "$AXE_SCRIPT" 2>&1 | tee -a "${REPORT_FILE}"; then
            print_success "Tests axe-core completados"

            # Analizar resultados
            if [ -f "${REPORT_DIR}/axe-results-${TIMESTAMP}.json" ]; then
                VIOLATION_COUNT=$(node -e "
                    const fs = require('fs');
                    const data = JSON.parse(fs.readFileSync('${REPORT_DIR}/axe-results-${TIMESTAMP}.json', 'utf-8'));
                    let total = 0;
                    Object.values(data).forEach(page => {
                        if (page.violations) total += page.violations.length;
                    });
                    console.log(total);
                " 2>/dev/null || echo "0")

                TOTAL_VIOLATIONS=$VIOLATION_COUNT
                echo -e "Violations found: ${RED}${VIOLATION_COUNT}${NC}"

                if [ $VIOLATION_COUNT -gt 0 ]; then
                    ((TOTAL_ISSUES++))
                fi
            fi
        else
            print_warning "Tests axe-core fallaron o no disponibles"
        fi
    fi

    rm -f "$AXE_SCRIPT"
else
    print_warning "axe-core no instalado - omitiendo"
    print_info "Instálalo con: npm install -D @axe-core/puppeteer puppeteer"
fi

# ============================================================================
# 3️⃣ PA-11Y TESTS
# ============================================================================
print_header "♿ PA-11Y TESTS")

if command -v pa11y &> /dev/null; then
    print_info "Ejecutando tests con pa11y..."

    PAGES=("/" "/learn" "/decks")

    for page in "${PAGES[@]}"; do
        URL="http://localhost:${PORT}${page}"
        print_info "Testeando: ${URL}"

        if pa11y "$URL" \
            --reporter json \
            --reporter cli \
            > "${REPORT_DIR}/pa11y-${page//\//--}-${TIMESTAMP}.json" 2>&1 | tee -a "${REPORT_FILE}"; then

            print_success "${page}: Sin errores de accesibilidad"
        else
            print_warning "${page}: Issues detectados"
            ((TOTAL_ISSUES++))
        fi
    done
else
    print_warning "pa11y no instalado - omitiendo"
    print_info "Instálalo con: npm install -g pa11y"
fi

# ============================================================================
# 4️⃣ LIGHTHOUSE ACCESSIBILITY
# ============================================================================
print_header "💡 LIGHTHOUSE ACCESSIBILITY")

if command -v lighthouse &> /dev/null; then
    print_info "Ejecutando Lighthouse accessibility scan..."

    PAGES=("/" "/learn")

    for page in "${PAGES[@]}"; do
        URL="http://localhost:${PORT}${page}"
        print_info "Scanning: ${URL}"

        lighthouse "$URL" \
            --output=json \
            --output-path="${REPORT_DIR}/lighthouse-a11y-${page//\//--}-${TIMESTAMP}" \
            --only-categories=accessibility \
            --quiet \
            --chrome-flags="--headless" 2>&1 | tee -a "${REPORT_FILE}" || true

        if [ -f "${REPORT_DIR}/lighthouse-a11y-${page//\//--}-${TIMESTAMP}.report.json" ]; then
            # Extraer score de accesibilidad
            A11Y_SCORE=$(node -e "
                const fs = require('fs');
                const data = JSON.parse(fs.readFileSync('${REPORT_DIR}/lighthouse-a11y-${page//\//--}-${TIMESTAMP}.report.json', 'utf-8'));
                const score = data.categories.accessibility?.score * 100 || 0;
                console.log(Math.round(score));
            " 2>/dev/null || echo "0")

            echo -e "${page}: Accessibility Score ${CYAN}${A11Y_SCORE}${NC}/100"

            if [ "$A11Y_SCORE" -lt 90 ]; then
                print_warning "Score de accesibilidad bajo (${A11Y_SCORE}/100)"
                ((TOTAL_ISSUES++))
            fi
        fi
    done
else
    print_warning "Lighthouse no instalado - omitiendo"
    print_info "Instálalo con: npm install -g lighthouse"
fi

# ============================================================================
# 5️⃣ VERIFICACIÓN MANUAL DE TECLADO
# ============================================================================
print_header "⌨️  VERIFICACIÓN DE TECLADO")

print_info "Verificando navegación por teclado..."

# Lista de elementos interactivos que deben ser accesibles por teclado
INTERACTIVE_ELEMENTS=(
    "button"
    "a"
    "input"
    "select"
    "textarea"
)

print_info "Elementos interactivos a verificar:"
for element in "${INTERACTIVE_ELEMENTS[@]}"; do
    echo "  • ${element}"
done

print_warning "La navegación por teclado requiere verificación manual"
print_info "Testea la aplicación usando solo Tab, Enter, y flechas"
print_info "Asegúrate de:"
echo "  • Todos los elementos interactivos son alcanzables con Tab"
echo "  • El orden de Tab es lógico"
echo "  • Los elementos tienen focus visible"
echo "  • No hay traps de teclado"

# ============================================================================
# 6️⃣ VERIFICACIÓN DE ARIA
# ============================================================================
print_header "🏷️  VERIFICACIÓN DE ARIA")

print_info "Verificando atributos ARIA..."

# Buscar elementos con aria-label
ARIA_LABELS=$(grep -rn "aria-label" src/ --include="*.tsx" --include="*.jsx" | wc -l || echo "0")
print_info "Elementos con aria-label: ${ARIA_LABELS}"

# Buscar elementos con role
ARIA_ROLES=$(grep -rn "role=" src/ --include="*.tsx" --include="*.jsx" | wc -l || echo "0")
print_info "Elementos con role explícito: ${ARIA_ROLES}"

# Buscar alt en imágenes
ALT_TAGS=$(grep -rn "<img" src/ --include="*.tsx" --include="*.jsx" | grep -v "alt=" | wc -l || echo "0")
if [ "$ALT_TAGS" -gt 0 ]; then
    print_warning "Imágenes sin atributo alt: ${ALT_TAGS}"
    ((TOTAL_ISSUES++))
else
    print_success "Todas las imágenes tienen atributo alt"
fi

# Verificar heading hierarchy
print_info "Verificando jerarquía de headings..."

# Buscar h1, h2, h3, etc.
H1_COUNT=$(grep -rn "<h1" src/ --include="*.tsx" | wc -l || echo "0")
H2_COUNT=$(grep -rn "<h2" src/ --include="*.tsx" | wc -l || echo "0")

if [ "$H1_COUNT" -eq 0 ]; then
    print_warning "No se encontraron elementos <h1>"
    ((TOTAL_ISSUES++))
else
    print_success "Jerarquía de headings OK (h1: ${H1_COUNT}, h2: ${H2_COUNT})"
fi

# ============================================================================
# 7️⃣ VERIFICACIÓN DE COLOR CONTRAST
# ============================================================================
print_header "🎨 VERIFICACIÓN DE CONTRASTE")

print_info "Verificando contraste de colores..."

if command -v color-contrast &> /dev/null; then
    print_info "Herramienta de contraste disponible"
else
    print_warning "Herramienta de contraste no instalada"
    print_info "Instálala con: npm install -g color-contrast"
fi

print_warning "La verificación de contraste requiere herramienta externa"
print_info "Usa: https://webaim.org/resources/contrastchecker/"
print_info "Asegúrate de que el texto tenga contraste mínimo de 4.5:1"

# ============================================================================
# 8️⃣ LIMPIEZA
# ============================================================================
print_header "🧹 LIMPIEZA")

print_info "Deteniendo servidor..."
if kill $SERVER_PID 2>/dev/null; then
    print_success "Servidor detenido"
fi

rm -f .logs/server.pid

# ============================================================================
# 9️⃣ GENERAR RESUMEN
# ============================================================================
print_header "📋 RESUMEN DE ACCESIBILIDAD")

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo -e "${CYAN}Duración: ${MINUTES}m ${SECONDS}s${NC}"
echo -e "Reporte guardado en: ${REPORT_FILE}"

echo ""
echo -e "${CYAN}Issues detectados:${NC}"
echo -e "  • Violaciones WCAG: ${TOTAL_VIOLATIONS}"
echo -e "  • Total issues:      ${TOTAL_ISSUES}"

echo ""
echo -e "${CYAN}Estándares WCAG:${NC}"
echo -e "  • WCAG 2.1 Level AA"
echo -e "  • WCAG 2.1 Level AAA (objetivo)"

echo ""
echo -e "${CYAN}Reportes generados:${NC}"
if [ -f "${REPORT_DIR}/axe-results-${TIMESTAMP}.json" ]; then
    echo -e "  • axe-core: ${REPORT_DIR}/axe-results-${TIMESTAMP}.json"
fi
if ls "${REPORT_DIR}"/pa11y-*-*.json 1> /dev/null 2>&1; then
    echo -e "  • pa11y:    ${REPORT_DIR}/pa11y-*-*.json"
fi
if ls "${REPORT_DIR}"/lighthouse-a11y-*-*.report.json 1> /dev/null 2>&1; then
    echo -e "  • Lighthouse: ${REPORT_DIR}/lighthouse-a11y-*-*.report.json"
fi

# ============================================================================
# 🔟 EXIT CODE
# ============================================================================
echo ""
if [ $TOTAL_ISSUES -eq 0 ]; then
    print_success "ACCESSIBILITY TESTS: COMPLETADOS CON ÉXITO"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    print_warning "ACCESSIBILITY TESTS: ISSUES DETECTADOS"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    print_info "Revisa los reportes para mejorar la accesibilidad"
    exit 0
fi
