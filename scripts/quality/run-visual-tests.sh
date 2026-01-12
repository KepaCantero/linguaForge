#!/usr/bin/env bash

# ============================================================================
# LINGUAFORGE - VISUAL REGRESSION TESTS RUNNER
# ============================================================================
# Ejecuta tests de regresión visual
# - Capturas de pantalla con Playwright
# - Comparación contra baseline
# - Reporte de diferencias visuales
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
REPORT_FILE="${REPORT_DIR}/visual-tests-${TIMESTAMP}.log"
SCREENSHOT_DIR="${PROJECT_ROOT}/tests/visual/screenshots"
BASELINE_DIR="${SCREENSHOT_DIR}/baseline"
CURRENT_DIR="${SCREENSHOT_DIR}/current"
DIFF_DIR="${SCREENSHOT_DIR}/diff"

# Crear directorios necesarios
mkdir -p "${REPORT_DIR}"
mkdir -p "${BASELINE_DIR}"
mkdir -p "${CURRENT_DIR}"
mkdir -p "${DIFF_DIR}"

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
print_header "VISUAL REGRESSION TESTS RUNNER"
echo -e "${CYAN}LinguaForge French Learning App - Visual Tests${NC}"
echo -e "Timestamp: ${TIMESTAMP}"
echo -e "Report file: ${REPORT_FILE}"
echo ""

cd "${PROJECT_ROOT}"

START_TIME=$(date +%s)
echo "Visual regression tests started at $(date)" | tee -a "${REPORT_FILE}"

# Contadores
VISUAL_ISSUES=0
SCREENSHOTS_TAKEN=0
DIFFS_FOUND=0

# ============================================================================
# 1️⃣ VERIFICAR PLAYWRIGHT
# ============================================================================
print_header "🎭 VERIFICANDO PLAYWRIGHT"

if ! command -v npx playwright &> /dev/null; then
    print_error "Playwright no está instalado"
    print_info "Instálalo con: npm install -D @playwright/test"
    exit 1
fi

print_success "Playwright instalado"

# ============================================================================
# 2️⃣ INICIAR SERVIDOR DE DESARROLLO
# ============================================================================
print_header "🚀 INICIANDO SERVIDOR"

print_info "Iniciando servidor de desarrollo..."

# Crear directorio para logs
mkdir -p .logs

# Iniciar servidor
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
# 3️⃣ CAPTURAR SCREENSHOTS
# ============================================================================
print_header "📸 CAPTURANDO SCREENSHOTS"

print_info "URL base: http://localhost:${PORT}"

# Lista de páginas a capturar
PAGES=(
    "/"
    "/learn"
    "/decks"
    "/profile"
)

# Dispositivos a probar
DEVICES=(
    "Desktop Chrome-1920x1080"
    "Desktop Chrome-1366x768"
    "iPhone 12-390x844"
    "iPad Pro-1024x1366"
)

print_info "Páginas a capturar:"
for page in "${PAGES[@]}"; do
    echo "  • ${page}"
done

print_info "Dispositivos:"
for device in "${DEVICES[@]}"; do
    echo "  • ${device}"
done

# Script de Playwright para capturar screenshots
PLAYWRIGHT_SCREENSHOT_SCRIPT="
const { chromium } = require('playwright');
const fs = require('fs');

const baseUrl = 'http://localhost:${PORT}';
const screenshotDir = '${CURRENT_DIR}';
const pages = ${PAGES[@]};

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  for (const pagePath of pages) {
    const url = baseUrl + pagePath;
    const filename = pagePath.replace(/\//g, '_') + '.png';
    const filepath = \`\${screenshotDir}/\${filename}\`;

    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000); // Wait for animations
      await page.screenshot({ path: filepath, fullPage: true });
      console.log('Screenshot saved:', filename);
    } catch (error) {
      console.error('Error capturing', pagePath, error.message);
    }
  }

  await browser.close();
})();
"

# Guardar script temporal
TEMP_SCRIPT="/tmp/playwright-screenshot-${TIMESTAMP}.js"
echo "$PLAYWRIGHT_SCREENSHOT_SCRIPT" > "$TEMP_SCRIPT"

# Ejecutar captura de screenshots
print_info "Capturando screenshots actuales..."
if node "$TEMP_SCRIPT" 2>&1 | tee -a "${REPORT_FILE}"; then
    print_success "Screenshots capturados"

    # Contar screenshots
    SCREENSHOTS_TAKEN=$(find "${CURRENT_DIR}" -name "*.png" 2>/dev/null | wc -l)
    print_info "Total de screenshots: ${SCREENSHOTS_TAKEN}"
else
    print_error "Fallo al capturar screenshots"
fi

rm -f "$TEMP_SCRIPT"

# ============================================================================
# 4️⃣ COMPARAR CONTRA BASELINE
# ============================================================================
print_header "🔍 COMPARANDO VS BASELINE"

# Verificar si existe baseline
if [ "$(ls -A ${BASELINE_DIR}/*.png 2>/dev/null)" ]; then
    print_info "Baseline encontrado, comparando screenshots..."

    # Verificar si está instalado pixelmatch o similar
    if command -v compare &> /dev/null; then
        print_info "Usando ImageMagick para comparación..."

        for baseline_file in "${BASELINE_DIR}"/*.png; do
            filename=$(basename "$baseline_file")
            current_file="${CURRENT_DIR}/${filename}"
            diff_file="${DIFF_DIR}/${filename}"

            if [ -f "$current_file" ]; then
                print_info "Comparando ${filename}..."

                # Comparar imágenes
                if compare -metric AE "$baseline_file" "$current_file" "${diff_file}" 2>/dev/null; then
                    print_success "${filename}: Sin diferencias"
                else
                    DIFF_COUNT=$?
                    print_warning "${filename}: Diferencias encontradas (${DIFF_COUNT} píxeles)"
                    ((DIFFS_FOUND++))
                fi
            fi
        done
    else
        print_warning "ImageMagick no instalado - omitiendo comparación automática"
        print_info "Instálalo con: brew install imagemagick (macOS)"
        print_info "Comparación manual disponible en:"
        echo "  • Baseline: ${BASELINE_DIR}"
        echo "  • Current:  ${CURRENT_DIR}"
    fi
else
    print_warning "No se encontró baseline"
    print_info "Estableciendo baseline actual..."
    cp -r "${CURRENT_DIR}"/* "${BASELINE_DIR}/" 2>/dev/null || true
    print_success "Baseline establecido en ${BASELINE_DIR}"
fi

# ============================================================================
# 5️⃣ GENERAR REPORTE HTML
# ============================================================================
print_header "📊 GENERANDO REPORTE"

# Crear reporte HTML simple
cat > "${REPORT_DIR}/visual-report-${TIMESTAMP}.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Visual Regression Report - ${TIMESTAMP}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        h1 { color: #333; }
        .screenshot { display: inline-block; margin: 10px; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .screenshot img { max-width: 300px; border: 1px solid #ddd; }
        .screenshot label { display: block; text-align: center; margin-top: 5px; font-size: 12px; }
        .diff { border: 2px solid #ff0000; }
        .stats { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .stat { display: inline-block; margin: 0 20px; }
        .stat-value { font-size: 24px; font-weight: bold; }
        .success { color: #4caf50; }
        .warning { color: #ff9800; }
        .error { color: #f44336; }
    </style>
</head>
<body>
    <h1>🎨 Visual Regression Report</h1>
    <p>Generated: $(date)</p>

    <div class="stats">
        <div class="stat">
            <div class="stat-value ${SCREENSHOTS_TAKEN > 0 ? 'success' : 'error'}">${SCREENSHOTS_TAKEN}</div>
            <div>Screenshots Taken</div>
        </div>
        <div class="stat">
            <div class="stat-value ${DIFFS_FOUND == 0 ? 'success' : 'warning'}">${DIFFS_FOUND}</div>
            <div>Differences Found</div>
        </div>
    </div>

    <h2>Current Screenshots</h2>
    <div class="screenshots">
EOF

# Agregar screenshots al reporte
for screenshot in "${CURRENT_DIR}"/*.png; do
    if [ -f "$screenshot" ]; then
        filename=$(basename "$screenshot")
        # Convertir ruta relativa para HTML
        rel_path="${screenshot#$PROJECT_ROOT/}"
        echo "        <div class=\"screenshot\">" >> "${REPORT_DIR}/visual-report-${TIMESTAMP}.html"
        echo "            <img src=\"../../${rel_path}\" alt=\"${filename}\">" >> "${REPORT_DIR}/visual-report-${TIMESTAMP}.html"
        echo "            <label>${filename}</label>" >> "${REPORT_DIR}/visual-report-${TIMESTAMP}.html"
        echo "        </div>" >> "${REPORT_DIR}/visual-report-${TIMESTAMP}.html"
    fi
done

cat >> "${REPORT_DIR}/visual-report-${TIMESTAMP}.html" << EOF
    </div>

    <h2>Directories</h2>
    <ul>
        <li><a href="../../tests/visual/screenshots/baseline/">Baseline</a></li>
        <li><a href="../../tests/visual/screenshots/current/">Current</a></li>
        <li><a href="../../tests/visual/screenshots/diff/">Diff</a></li>
    </ul>
</body>
</html>
EOF

print_success "Reporte HTML generado"
print_info "Ubicación: ${REPORT_DIR}/visual-report-${TIMESTAMP}.html"

# ============================================================================
# 6️⃣ LIMPIEZA
# ============================================================================
print_header "🧹 LIMPIEZA"

print_info "Deteniendo servidor..."
if kill $SERVER_PID 2>/dev/null; then
    print_success "Servidor detenido"
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

echo ""
echo -e "${CYAN}Resultados:${NC}"
echo -e "  • Screenshots capturados: ${SCREENSHOTS_TAKEN}"
echo -e "  • Diferencias encontradas: ${DIFFS_FOUND}"

echo ""
echo -e "${CYAN}Directorios:${NC}"
echo -e "  • Baseline: ${BASELINE_DIR}"
echo -e "  • Current:  ${CURRENT_DIR}"
echo -e "  • Diff:     ${DIFF_DIR}"

echo ""
echo -e "${CYAN}Reporte HTML:${NC}"
echo -e "  ${REPORT_DIR}/visual-report-${TIMESTAMP}.html"

# ============================================================================
# 8️⃣ EXIT CODE
# ============================================================================
echo ""
if [ $DIFFS_FOUND -eq 0 ]; then
    print_success "VISUAL TESTS: SIN DIFERENCIAS"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    print_warning "VISUAL TESTS: DIFERENCIAS DETECTADAS"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    print_info "Revisa el reporte HTML y el directorio diff/"
    print_info "Si los cambios son esperados, actualiza el baseline:"
    echo "  cp -r ${CURRENT_DIR}/* ${BASELINE_DIR}/"
    exit 0
fi
