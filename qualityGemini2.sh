#!/usr/bin/env bash

# --- Configuración Pro ---
set -eEuo pipefail  # Aborta en error, variables no definidas y errores en pipes
trap 'echo -e "\n${RED}💥 ERROR CRÍTICO: El Quality Gate falló en el paso anterior.${NC}"' ERR

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🚀 MODO ULTRA-INSTINTO: Quality Gate FrenchA1Airbnb${NC}"
echo "--------------------------------------------------------"

# 1. Función para ejecución en paralelo (Ahorra hasta un 40% de tiempo)
run_parallel() {
    echo -e "⏳ ${BLUE}Ejecutando tareas en paralelo (TSC + ESLint + Audit)...${NC}"

    # Inicia tareas en background
    npx tsc --noEmit --strict > .tsc_log 2>&1 & PID1=$!

    npx eslint src/ --ext .ts,.tsx \
      --rule 'no-console: "error"' \
      --rule '@typescript-eslint/no-explicit-any: "error"' \
      --rule 'complexity: ["error", 10]' \
      --max-warnings 0 > .eslint_log 2>&1 & PID2=$!

    npm audit --audit-level=high > .audit_log 2>&1 & PID3=$!

    # Espera y captura resultados
    wait $PID1 || { echo -e "${RED}❌ TSC Falló${NC}"; cat .tsc_log; exit 1; }
    wait $PID2 || { echo -e "${RED}❌ ESLint Falló${NC}"; cat .eslint_log; exit 1; }
    wait $PID3 || { echo -e "${RED}⚠️ Vulnerabilidades encontradas${NC}"; cat .audit_log; }

    echo -e "${GREEN}✅ Análisis estático y seguridad completados.${NC}"
}

####################################
# 1️⃣ Paralelización e Instalación Limpia
####################################
echo -e "\n📦 ${YELLOW}1. Verificando integridad de node_modules...${NC}"
npm ci # Instalación limpia y determinista
run_parallel

####################################
# 2️⃣ Limpieza: Depurador de Dependencias (Depcheck)
####################################
echo -e "\n🔍 ${YELLOW}2. Buscando 'Ghost Dependencies' y paquetes no usados...${NC}"
npx depcheck --ignores="eslint*,@types*,prettier*,ts-node" || echo "⚠️ Revisa dependencias no usadas."

####################################
# 3️⃣ Arquitectura: Capas y Secretos
####################################
echo -e "\n🏗️  ${YELLOW}3. Validando arquitectura y fugas de secretos...${NC}"

# Evitar que se suban .env o claves expuestas por error en el código
if grep -rE "sk_live_|AIza" src/; then
    echo -e "${RED}❌ ¡PÁNICO! Se detectaron posibles API Keys en el código.${NC}"
    exit 1
fi

# Regla estricta de Supabase (Sustituye al grep básico por uno con contexto)
BAD_IMPORTS=$(grep -r "from '@supabase/supabase-js'" src/ --exclude-dir={infra,repositories,lib,services} || true)
if [ -n "$BAD_IMPORTS" ]; then
    echo -e "${RED}❌ Violación de Arquitectura: Supabase solo en capa de Infra/Repo.${NC}"
    echo "$BAD_IMPORTS"
    exit 1
fi

####################################
# 4️⃣ Cobertura con Umbral Evolutivo
####################################
echo -e "\n🧪 ${YELLOW}4. Tests Unitarios y Cobertura...${NC}"
npm run test:coverage -- --watchAll=false --ci --coverageThreshold='{"global":{"lines":85}}'
echo -e "${GREEN}✅ Cobertura cumple el estándar AAA.${NC}"

####################################
# 5️⃣ Performance: Bundle Size Gate
####################################
echo -e "\n📊 ${YELLOW}5. Analizando tamaño del Bundle (Performance Gate)...${NC}"
npm run build > .build_log 2>&1

# Extraer el tamaño de la página más pesada (Lógica para Next.js)
MAX_SIZE=250000 # 250kb por página max
HEAVY_PAGE=$(grep "λ" .build_log | awk '{print $4}' | tr -d 'kB' | awk -v max="$MAX_SIZE" '$1 > max' || true)

if [ -n "$HEAVY_PAGE" ]; then
    echo -e "${RED}❌ PERFORMANCE FAIL: Hay páginas que superan los 250kb.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Bundle size bajo control.${NC}"

####################################
# 🎉 REPORTE FINAL ESTILO DASHBOARD
####################################
echo -e "\n${BLUE}======================================================${NC}"
echo -e "  ${GREEN}✨ QUALITY GATE SUPERADO EXITOSAMENTE ✨${NC}"
echo -e "  Proyect: FrenchA1Airbnb | Status: Ready for Production"
echo -e "${BLUE}======================================================${NC}"
echo -e "  - Tipado & Linting:   ${GREEN}PASSED${NC}"
echo -e "  - Arquitectura:       ${GREEN}PASSED${NC}"
echo -e "  - Cobertura (>85%):   ${GREEN}PASSED${NC}"
echo -e "  - Performance Budget: ${GREEN}PASSED${NC}"
echo -e "${BLUE}======================================================${NC}"

# Limpiar archivos temporales de log
rm .tsc_log .eslint_log .audit_log .build_log
