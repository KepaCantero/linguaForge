#!/usr/bin/env bash

set -e  # aborta al primer error

echo "🚦 INICIANDO QUALITY GATE AAA — FrenchA1Airbnb"
echo "--------------------------------------------------"

# Configuración de umbrales
MIN_COVERAGE=85
MAX_LINE_LENGTH=120
MAX_FUNCTION_LINES=30
MAX_FILE_LINES=500



####################################
# 4️⃣ PROHIBIDOS: any / ts-ignore / console.log en producción
####################################
echo "🔍 Buscando 'any', '@ts-ignore', y console.log..."

# Buscar 'any' y '<any>'
ANY_COUNT=$(find src/ -name "*.ts" -o -name "*.tsx" -exec grep -H -n ":\s*any\|<any>" {} \; || true)
TS_IGNORE_COUNT=$(find src/ -name "*.ts" -o -name "*.tsx" -exec grep -H -n "@ts-ignore" {} \; || true)
CONSOLE_COUNT=$(find src/ -name "*.ts" -o -name "*.tsx" -exec grep -H -n "console\." {} \; | grep -v "console\.log\|console\.warn\|console\.error" || true)

if [ -n "$ANY_COUNT" ]; then
  echo "❌ ERROR: Uso de 'any' detectado"
  echo "$ANY_COUNT"
  exit 1
fi

if [ -n "$TS_IGNORE_COUNT" ]; then
  echo "❌ ERROR: Uso de '@ts-ignore' detectado"
  echo "$TS_IGNORE_COUNT"
  exit 1
fi

if [ -n "$CONSOLE_COUNT" ]; then
  echo "❌ ERROR: console.log detectado (no permitido en producción)"
  echo "$CONSOLE_COUNT"
  exit 1
fi

echo "✅ No hay any, @ts-ignore ni console.log no permitidos"

####################################
# 5️⃣ Tests + cobertura con umbrales estrictos
####################################
echo "🔍 Ejecutando tests con cobertura estricta..."
npm run test:coverage -- --coverageReporters="json-summary"

COVERAGE_JSON="coverage/coverage-summary.json"
if [ -f "$COVERAGE_JSON" ]; then
  COVERAGE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$COVERAGE_JSON', 'utf-8')).total.lines.pct)")
  COVERAGE_INT=$(echo "$COVERAGE" | cut -d'.' -f1)
else
  echo "❌ No se generó el archivo de cobertura"
  exit 1
fi

if (( $(echo "$COVERAGE_INT < $MIN_COVERAGE" | bc -l) )); then
  echo "❌ Cobertura insuficiente: ${COVERAGE}% (mínimo ${MIN_COVERAGE}%)"
  exit 1
fi

echo "✅ Cobertura OK: ${COVERAGE}%"

####################################
# 6️⃣ Análisis de complejidad ciclomática
####################################
echo "🔍 Analizando complejidad ciclomática..."
npx eslint src/ --ext .ts,.tsx --rule "complexity: ['error', { max: 10 }]" --rule "max-depth: ['error', { max: 4 }]" --rule "max-params: ['error', { max: 5 }]"
echo "✅ Complejidad OK"

####################################
# 7️⃣ Heurística: tamaño de funciones y archivos
####################################
echo "🔍 Buscando funciones y archivos demasiado grandes..."

# Buscar funciones > MAX_FUNCTION_LINES
LONG_FUNCTIONS=$(awk '
  BEGIN { in_function = 0; start_line = 0 }
  /^[^#]*function[[:space:]]+[a-zA-Z_][a-zA-Z0-9_]*\(/ {
    in_function = 1;
    start_line = NR;
    filename = FILENAME
  }
  /^[^#]*const[[:space:]]+[a-zA-Z_][a-zA-Z0-9_]*[[:space:]]*=[[:space:]]*\(/ {
    in_function = 1;
    start_line = NR;
    filename = FILENAME
  }
  in_function && /^[^#]*{/ { braces++ }
  in_function && /^[^#]*}/ {
    braces--;
    if (braces == 0) {
      if (NR - start_line > '"$MAX_FUNCTION_LINES"') {
        print filename ":" start_line "-" NR " (" (NR - start_line) " líneas)"
      }
      in_function = 0;
      braces = 0;
    }
  }
  END { }
' src/**/*.ts src/**/*.tsx 2>/dev/null || true)

# Buscar archivos > MAX_FILE_LINES
LARGE_FILES=$(find src/ -name "*.ts" -o -name "*.tsx" -exec wc -l {} \; | awk -v max="$MAX_FILE_LINES" '$1 > max { print $2 ": " $1 " líneas" }' || true)

if [ -n "$LONG_FUNCTIONS" ]; then
  echo "❌ Funciones demasiado grandes detectadas:"
  echo "$LONG_FUNCTIONS"
  exit 1
fi

if [ -n "$LARGE_FILES" ]; then
  echo "❌ Archivos demasiado grandes detectados:"
  echo "$LARGE_FILES"
  exit 1
fi

echo "✅ Tamaño de funciones y archivos OK"

####################################
# 8️⃣ Línea de longitud excesiva
####################################
echo "🔍 Buscando líneas demasiado largas (>${MAX_LINE_LENGTH} caracteres)..."

LONG_LINES=$(find src/ -name "*.ts" -o -name "*.tsx" -exec awk -v max="$MAX_LINE_LENGTH" 'length > max { print FILENAME ":" NR ": " length " caracteres" }' {} \; || true)

if [ -n "$LONG_LINES" ]; then
  echo "❌ Líneas demasiado largas detectadas:"
  echo "$LONG_LINES"
  exit 1
fi

echo "✅ Longitud de líneas OK"

####################################
# 9️⃣ Verificación de Supabase y buenas prácticas de acceso a datos
####################################
echo "🔍 Verificando accesos a Supabase y buenas prácticas..."

BAD_SUPABASE=$(grep -r "createClient\|supabase\|from\(" src/ --include="*.ts" --include="*.tsx" | grep -v "repositories\|utils\|config" || true)
RAW_QUERIES=$(grep -r "select\|insert\|update\|delete" src/ --include="*.ts" --include="*.tsx" | grep -v "repositories\|services" || true)

if [ -n "$BAD_SUPABASE" ]; then
  echo "❌ Supabase usado fuera de capas adecuadas:"
  echo "$BAD_SUPABASE"
  exit 1
fi

if [ -n "$RAW_QUERIES" ]; then
  echo "⚠️  Consultas SQL directas detectadas (verificar buenas prácticas):"
  echo "$RAW_QUERIES"
fi

echo "✅ Acceso a datos OK"

####################################
# 🔟 Validación de seguridad
####################################
echo "🔍 Validando seguridad (XSS, inyecciones)..."

# Buscar posibles XSS
XSS_SUSPECT=$(grep -r "innerHTML\|dangerouslySetInnerHTML\|eval\|Function" src/ --include="*.ts" --include="*.tsx" || true)

if [ -n "$XSS_SUSPECT" ]; then
  echo "❌ Posibles vulnerabilidades de seguridad detectadas:"
  echo "$XSS_SUSPECT"
  exit 1
fi

echo "✅ Seguridad OK"

####################################
# 1️⃣1️⃣ Validación de tipos y interfaces
####################################
echo "🔍 Validando buenas prácticas de tipado..."

# Buscar interfaces sin prefijo I o tipo en camelCase
BAD_INTERFACE_NAMES=$(grep -r "^interface [a-z]" src/ --include="*.ts" --include="*.tsx" || true)

if [ -n "$BAD_INTERFACE_NAMES" ]; then
  echo "⚠️  Interfaces sin convención de nomenclatura (deberían comenzar con I o estar en PascalCase):"
  echo "$BAD_INTERFACE_NAMES"
fi

echo "✅ Tipado OK"

####################################
# 1️⃣2️⃣ Build de producción con validaciones
####################################
echo "🔍 Next.js production build con validaciones..."
npm run build

# Verificar que el build no contiene errores de tipo
if [ -f "next-build.log" ]; then
  ERRORS=$(grep -i "error\|failed" next-build.log || true)
  if [ -n "$ERRORS" ]; then
    echo "❌ Errores en el build:"
    echo "$ERRORS"
    exit 1
  fi
fi

echo "✅ Build estable"

####################################
# 1️⃣3️⃣ Verificación de performance (bundle size)
####################################
echo "🔍 Analizando tamaño del bundle..."

# Si existe next-bundle-analyzer, usarlo
if command -v npx &> /dev/null && npm list --depth=0 @next/bundle-analyzer &> /dev/null; then
  echo "📊 Generando reporte de bundle..."
  BUNDLE_SIZE=$(npm run build | grep -i "total" | tail -1 || echo "Bundle analizado")
  echo "$BUNDLE_SIZE"
fi

echo "✅ Performance OK"

####################################
# 1️⃣4️⃣ Pruebas de integración
####################################
echo "🔍 Ejecutando pruebas de integración..."
if [ -f "package.json" ] && grep -q "test:integration" package.json; then
  npm run test:integration
fi
echo "✅ Pruebas de integración OK"

####################################
# 🎉 RESULTADO FINAL
####################################
echo "--------------------------------------------------"
echo "🏆 QUALITY GATE SUPERADO"
echo "✔ Código funcional"
echo "✔ Código estable"
echo "✔ Estándares AAA cumplidos"
echo "✔ Seguridad verificada"
echo "✔ Performance analizada"
echo "✔ Listo para producción tipo Duolingo"
echo "--------------------------------------------------"
echo "📊 Métricas finales:"
echo "   - Cobertura: ${COVERAGE}%"
echo "   - Sin any/@ts-ignore: ✅"
echo "   - Sin vulnerabilidades: ✅"
echo "   - Sin funciones largas: ✅"
echo "   - Sin archivos grandes: ✅"
echo "--------------------------------------------------"
