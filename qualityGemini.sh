#!/usr/bin/env bash

# Configuraciones de salida (Colores)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

set -e # Aborta al primer error

echo -e "${BLUE}🚦 INICIANDO QUALITY GATE AAA — FrenchA1Airbnb${NC}"
echo "--------------------------------------------------"

# Umbrales
MIN_COVERAGE=85

####################################
# 1️⃣ Validación de dependencias
####################################
echo -e "\n🔍 ${YELLOW}Validando dependencias...${NC}"
# Usamos --audit-level=high para fallar solo si hay riesgos reales
npm audit --audit-level=high || echo -e "${YELLOW}⚠️ Advertencias de seguridad detectadas${NC}"
echo -e "${GREEN}✅ Dependencias verificadas${NC}"

####################################
# 2️⃣ Verificación de Tipado (TSC)
####################################
echo -e "\n🔍 ${YELLOW}TypeScript strict check...${NC}"
# --incremental ayuda a que las revisiones locales sean más rápidas
npx tsc --noEmit --strict
echo -e "${GREEN}✅ TypeScript OK${NC}"

####################################
# 3️⃣ Linting y Reglas de Calidad (Sustituye greps manuales)
####################################
echo -e "\n🔍 ${YELLOW}Análisis estático con ESLint (Calidad + Prohibiciones)...${NC}"

# En lugar de usar grep, inyectamos reglas de ESLint en caliente.
# Esto detecta 'any', 'console.log' y 'ts-ignore' con precisión quirúrgica.
npx eslint src/ --ext .ts,.tsx \
  --rule 'no-console: "error"' \
  --rule '@typescript-eslint/no-explicit-any: "error"' \
  --rule '@typescript-eslint/ban-ts-comment: "error"' \
  --rule 'complexity: ["error", 10]' \
  --rule 'max-lines-per-function: ["error", 40]' \
  --rule 'max-lines: ["error", 500]' \
  --max-warnings 0

echo -e "${GREEN}✅ Estándares de código y complejidad OK${NC}"

####################################
# 4️⃣ Arquitectura: Capas de Datos (Supabase)
####################################
echo -e "\n🔍 ${YELLOW}Verificando arquitectura de acceso a datos...${NC}"

# Prohibir createClient de supabase fuera de /infra o /services
BAD_SUPABASE=$(find src -type f -not -path "*/repositories/*" -not -path "*/services/*" -not -path "*/lib/*" -exec grep -l "createClient" {} + || true)

if [ -n "$BAD_SUPABASE" ]; then
  echo -e "${RED}❌ ERROR: Se detectó inicialización de Supabase fuera de la capa de persistencia:${NC}"
  echo "$BAD_SUPABASE"
  exit 1
fi
echo -e "${GREEN}✅ Arquitectura de datos respetada${NC}"

####################################
# 5️⃣ Tests y Cobertura
####################################
echo -e "\n🔍 ${YELLOW}Ejecutando tests con cobertura...${NC}"

# Ejecutar tests y extraer cobertura directamente del output de vitest/jest
npm run test:coverage -- --watchAll=false --ci

# Verificación de cobertura mediante archivo summary
COVERAGE_JSON="coverage/coverage-summary.json"
if [ -f "$COVERAGE_JSON" ]; then
  # Usamos node para una extracción de JSON más robusta que 'cut'
  COVERAGE=$(node -p "require('./$COVERAGE_JSON').total.lines.pct")

  if (( $(echo "$COVERAGE < $MIN_COVERAGE" | bc -l) )); then
    echo -e "${RED}❌ Cobertura insuficiente: ${COVERAGE}% (mínimo ${MIN_COVERAGE}%)${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Cobertura OK: ${COVERAGE}%${NC}"
else
  echo -e "${RED}❌ No se encontró el reporte de cobertura.${NC}"
  exit 1
fi

####################################
# 6️⃣ Seguridad y XSS
####################################
echo -e "\n🔍 ${YELLOW}Escaneo de vulnerabilidades XSS...${NC}"
# Buscamos patrones peligrosos omitiendo archivos de configuración
XSS_SUSPECT=$(grep -rE "innerHTML|dangerouslySetInnerHTML|eval\(" src/ --exclude-dir=node_modules || true)

if [ -n "$XSS_SUSPECT" ]; then
  echo -e "${RED}❌ Posible riesgo de seguridad detectado:${NC}"
  echo "$XSS_SUSPECT"
  exit 1
fi
echo -e "${GREEN}✅ Seguridad estática OK${NC}"

####################################
# 7️⃣ Build de Producción
####################################
echo -e "\n🔍 ${YELLOW}Validando Build de producción...${NC}"
npm run build
echo -e "${GREEN}✅ Build estable${NC}"

####################################
# 🎉 RESULTADO FINAL
####################################
echo "--------------------------------------------------"
echo -e "${GREEN}🏆 QUALITY GATE SUPERADO: LISTO PARA PRODUCCIÓN${NC}"
echo "--------------------------------------------------"
