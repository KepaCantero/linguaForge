# Estrategia de Diseño Visual — LinguaForge

> Última actualización: 2025-01-XX  
> Basado en: Auditoría de Diseño de Producto, Ingeniería de UX y Neurodiseño Educativo

## Visión de Diseño

**Objetivo:** Elevar LinguaForge al nivel Triple A de Duolingo/Lumosity mediante una síntesis entre psicología del juego y neurociencia educativa.

**Filosofía:** Transformar el aprendizaje de idiomas de "estudio" a "entrenamiento cognitivo" y "desbloqueo neuronal", donde la interfaz actúa como catalizador de neuroplasticidad.

---

## Temáticas Visuales

### 1. Neural Nexus — El Músculo Cognitivo

**Narrativa:** El usuario es el arquitecto de su propia red neuronal. El cerebro se presenta como una red latente que se ilumina y fortalece con el input comprensible.

**Paleta de Colores:**
- **Índigo Profundo:** `#1A237E` (fondo principal, red neuronal)
- **Cian Activo:** `#00BCD4` (zonas activadas, conexiones)
- **Blanco Puro:** `#FAFAFA` (texto, contraste)

**Aplicación:**
- Dashboard principal con visualización de red neuronal
- Iluminación progresiva de zonas cerebrales
- Densidad sináptica que crece con el progreso

**Core Drive (Octalysis):** Propiedad y Posesión — "Estoy fortaleciendo mi cerebro"

---

### 2. Bio-Lab — El Laboratorio Biolingüístico

**Narrativa:** El usuario es un técnico en un laboratorio de alta precisión donde la lengua es el material de calibración. Reduce el filtro afectivo tratando errores como "datos de desviación".

**Paleta de Colores:**
- **Azul Soft:** `#457B9D` (fondos, contenedores)
- **Teal Claro:** `#A8DADC` (accentos, estados activos)
- **Verde Menta:** `#F1FAEE` (fondos claros, éxito)

**Aplicación:**
- Interfaz minimalista con espacios en blanco extensivos
- Micro-interacciones como clics de precisión
- Informes de laboratorio como feedback de sesión

**Core Drive (Octalysis):** Desarrollo y Logro — "Estoy optimizando mi rendimiento"

---

### 3. Janus Map — Cartografía de la Conciencia Multimodal

**Narrativa:** El lenguaje como territorio desconocido que debe ser cartografiado. Vista de matriz/rejilla que representa interconexión de conceptos.

**Paleta de Colores:**
- **Negro Absoluto:** `#000000` (fondo principal)
- **Rojo Accent:** `#ED1B34` (puntos críticos, desbloqueos)
- **Gris Técnico:** `#93A1AD` (texto secundario, grid)

**Aplicación:**
- Vista de matriz Janus con estética de "centro de mando"
- Altos contrastes para dirigir atención
- Desbloqueo de regiones del mapa lingüístico

**Core Drive (Octalysis):** Curiosidad y Previsibilidad — "Estoy descubriendo un nuevo mundo"

---

## Tipografía

### Fuentes Principales

**Encabezados:**
- **Quicksand** (Google Fonts)
  - Sans Serif geométrica con terminales redondeados
  - Aspecto amigable pero estructurado
  - Reduce percepción de "dificultad"
  - Uso: Títulos de lecciones, headers principales

**Cuerpo de Texto:**
- **Inter** (Google Fonts)
  - Diseñada específicamente para interfaces complejas
  - Claridad excepcional en tamaños pequeños
  - Ideal para Janus Matrix y UI densa
  - Uso: Texto de UI, contenido de ejercicios

**Alternativa:**
- **Montserrat** (Google Fonts)
  - Robustez geométrica
  - Complementa fuentes redondeadas
  - Uso: Textos largos, contenido secundario

**Jerarquía:**
- Estricta jerarquía usando font-weights
- Guiar el ojo hacia CTA sin decoración innecesaria
- Contraste: Sans Serif redondeada + Geométrica pura = "Profesional pero accesible"

---

## Stack de Herramientas de Diseño

### Animación Core

**Rive:**
- **Uso:** Dashboard del Músculo Cognitivo
- **Ventaja:** Motor de estados, interactividad en tiempo real
- **Rendimiento:** Hasta 120 fps, peso minúsculo
- **Aplicación:** Visualización neuronal que reacciona al progreso

### Micro-Iconos

**Lordicon:**
- **Uso:** Iconografía animada (hover, click)
- **Ventaja:** Formato JSON/Lottie, personalizable
- **Aplicación:** Estados de éxito, error, navegación

### UI Framework

**Framer Motion:**
- **Uso:** Transiciones de página y componentes React
- **Ventaja:** Animaciones con física real (spring physics)
- **Aplicación:** Menús, tarjetas, modales

### Visualización

**LottieFiles:**
- **Uso:** Celebraciones de hitos y rachas
- **Ventaja:** Estándar de la industria, alta compatibilidad
- **Aplicación:** Animaciones de celebración, logros

---

## Protocolo de Reducción de Fricción (Low Click)

### Principios

**Objetivo:** Eliminar obstáculos que interrumpen el estado de "flujo". Alcanzar flujo de "clic mínimo" o "sin manos".

**Regla de Miller:** No más de 7 elementos de decisión simultáneos.

### Optimizaciones Específicas

#### Validación SRS
- **Actual:** Clic en "Mostrar" + Clic en nivel de dificultad
- **Propuesta:** Hotkeys (1-4) o gesto de Swipe
- **Ahorro:** ~60% de tiempo por tarjeta

#### Navegación Matrix
- **Actual:** Scroll manual + Clic en celda específica
- **Propuesta:** Navegación por flechas + Selección automática inteligente
- **Ahorro:** Eliminación del salto de atención visual

#### Entrada de Datos
- **Actual:** Escritura manual completa
- **Propuesta:** Autocompletado inteligente + Dictado (Speech-to-text)
- **Ahorro:** Reducción del esfuerzo motor fino

#### Feedback de Error
- **Actual:** Ventana modal emergente con clic de cierre
- **Propuesta:** Micro-interacción de vibración visual (shake) + Corrección inline
- **Ahorro:** Flujo de aprendizaje ininterrumpido

### Micro-Interacciones

**Duración Máxima:** 300ms para mantener sensación de respuesta inmediata

**Patrones de Gestos:**

1. **Swiping (Deslizar):**
   - Validación de tarjetas SRS
   - Derecha = "Conocido"
   - Izquierda = "Repasar"
   - Reduce esfuerzo de precisión

2. **Hover-to-Reveal:**
   - En Janus Matrix, hover sobre celda
   - Revela información secundaria/traducciones sin clic
   - Exploración rápida del contenido

3. **Drag-and-Drop:**
   - Construcción de oraciones
   - Manipulación kinestésica del lenguaje
   - Refuerza comprensión estructural

4. **Hotkeys:**
   - Navegación por teclado
   - Elimina movimiento del ratón
   - Ritmo de respuesta casi instintivo

---

## Visualización del Músculo Cognitivo

### Dashboard Neural

**Concepto:** Representación orgánica del progreso, alejada de gráficas de barras tradicionales.

**Componentes:**

#### 1. Anillo de Input (Krashen Rings)
- Anillo exterior que se llena según minutos de exposición
- Mide tiempo real de inmersión efectiva (no XP arbitrario)
- Estilo Apple Watch (satisfacción por completitud diaria)

#### 2. Densidad Sináptica
- Red neuronal interna que se vuelve más compleja
- Nuevos nodos se activan con el progreso
- Caminos existentes se iluminan con mayor intensidad
- Representa consolidación de memoria a largo plazo

#### 3. Zonas de Desbloqueo
- Cerebro dividido en regiones funcionales:
  - **Lóbulo Temporal:** Comprensión auditiva
  - **Área de Broca:** Producción verbal
  - **Ganglios Basales:** Procesamiento procedimental
- Sistema "ilumina" zonas al alcanzar hitos específicos
- Transforma aprendizaje en conquista de territorio biológico

### Integración del Filtro Afectivo

**Principio:** Mantener el filtro afectivo bajo evitando indicadores de retroceso.

**Implementación:**
- **NO:** Cerebro que se encoge al dejar de practicar (genera ansiedad)
- **SÍ:** Estado de "hibernación" o latencia que se reactiva instantáneamente
- Narrativa de "acumulación de energía" en lugar de pérdida
- Estética de colores relajantes y feedback positivo constante

### Mapeo de Métricas Científicas a UI

| Métrica de Krashen | Concepto Científico | Representación Visual | Recompensa Psicológica |
|-------------------|---------------------|----------------------|------------------------|
| Input Comprensible | Exposición a i+1 | Anillos de flujo circular (Apple Watch) | Satisfacción por completitud diaria |
| Adquisición vs Aprendizaje | Procesamiento subconsciente | Crecimiento de red neuronal central | Sensación de transformación biológica |
| Monitor Hypothesis | Edición consciente del output | Calibrador de precisión en Bio-Lab | Orgullo por maestría técnica |
| Filtro Afectivo | Barreras emocionales | Estética relajante + feedback positivo | Reducción de ansiedad de ejecución |

---

## Principios de Diseño

### 1. Fluidez de Procesamiento
- Interfaces que requieren esfuerzo mínimo para decodificar
- El cerebro prefiere interfaces fluidas

### 2. Visibilidad Predictiva
- Sistema anticipa siguiente movimiento del usuario
- Basado en patrones de comportamiento y curva de olvido SRS

### 3. Reducción de Carga Cognitiva
- Regla de Miller: máximo 7 elementos simultáneos
- Información densa presentada progresivamente

### 4. Feedback Inmediato
- Micro-interacciones < 300ms
- Respuesta visual instantánea a cada acción

### 5. Narrativa de Transformación
- Progreso como crecimiento biológico, no acumulación de puntos
- Visualización de cambio físico en el cerebro

---

## Aplicación por Componente

### Janus Matrix
- Estética de "centro de mando"
- Altos contrastes para dirigir atención
- Navegación por teclado (flechas)
- Hover-to-reveal para información secundaria

### Dashboard Principal
- Visualización de red neuronal central
- Anillos de input (Krashen Rings)
- Densidad sináptica progresiva
- Zonas de desbloqueo iluminadas

### Ejercicios SRS
- Validación por swipe o hotkeys (1-4)
- Sin modales interrumpiendo el flujo
- Feedback inline con corrección inmediata
- Micro-animaciones de éxito/error

### Sistema INPUT
- Modo Focus automático durante audio
- Sin HUD visible durante consumo
- Feedback post-cognitivo (después de completar)
- Visualización de tiempo real de inmersión

---

## Paletas Completas por Temática

### Neural Nexus
```css
--neural-indigo: #1A237E;
--neural-cyan: #00BCD4;
--neural-white: #FAFAFA;
--neural-dark: #0D1B2A;
--neural-accent: #4FC3F7;
```

### Bio-Lab
```css
--bio-blue: #457B9D;
--bio-teal: #A8DADC;
--bio-mint: #F1FAEE;
--bio-dark: #1D3557;
--bio-success: #06D6A0;
```

### Janus Map
```css
--janus-black: #000000;
--janus-red: #ED1B34;
--janus-gray: #93A1AD;
--janus-white: #FFFFFF;
--janus-accent: #FF6B6B;
```

---

## Checklist de Implementación

### Fase 1: Fundación Visual
- [ ] Integrar Google Fonts (Quicksand, Inter)
- [ ] Definir sistema de tokens de color
- [ ] Configurar variables CSS para paletas
- [ ] Establecer jerarquía tipográfica

### Fase 2: Componentes Base
- [ ] Crear componente de red neuronal (Rive)
- [ ] Implementar Anillos de Input (Krashen Rings)
- [ ] Diseñar visualización de densidad sináptica
- [ ] Crear sistema de zonas de desbloqueo

### Fase 3: Optimización UX
- [ ] Implementar hotkeys en SRS
- [ ] Añadir gestos de swipe
- [ ] Configurar hover-to-reveal en Janus Matrix
- [ ] Optimizar micro-interacciones (< 300ms)

### Fase 4: Integración de Herramientas
- [ ] Configurar Rive para dashboard neuronal
- [ ] Integrar Lordicon para iconografía
- [ ] Optimizar Framer Motion para transiciones
- [ ] Añadir LottieFiles para celebraciones

---

## Sistema de Diseño AAA (Actualizado 2026-01-09)

### Accesibilidad WCAG AAA

**Implementaciones Completadas:**

#### 1. Reduced Motion Detection
```typescript
// src/hooks/useReducedMotion.ts
const prefersReducedMotion = useReducedMotion();
const shouldAnimate = !prefersReducedMotion;
```

**Aplicación:**
- Todas las animaciones detectan preferencia de OS
- Animaciones se deshabilitan automáticamente si el usuario prefiere reduced motion
- Transition config dinámico: `{ duration: 0.01 }` vs `{ type: 'spring' }`

#### 2. FPS Budget Management
```typescript
// src/hooks/useAnimationBudget.ts
const { shouldAnimate, fps, prefersReduced } = useAnimationControl();
```

**Aplicación:**
- Monitoreo continuo de FPS
- Deshabilitación automática si FPS < 30
- Re-habilitación si FPS > 50
- Combinado con prefers-reduced-motion

#### 3. Touch Targets (44px mínimo)
```typescript
// Ejemplo de implementación
style={{
  width: 'max(128px, 44px)',
  height: 'max(128px, 44px)',
}}
```

**Aplicación:**
- Todos los elementos interactivos cumplen WCAG AAA
- Botones, links, inputs con tamaño mínimo de 44px

#### 4. Text Shadows para Contraste
```typescript
const TEXT_SHADOW_STRONG = '0 2px 8px rgba(0,0,0,0.6), 0 0 16px rgba(0,0,0,0.4)';
const TEXT_SHADOW_MEDIUM = '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3)';
const TEXT_SHADOW_SUBTLE = '0 1px 2px rgba(0,0,0,0.8)';
```

**Aplicación:**
- Texto sobre fondos gradientes tiene sombras para WCAG AAA contrast
- 3 niveles de intensidad según contexto
- Usado en todos los textos sobre fondos oscuros/degradados

#### 5. Focus Rings Visibles
```typescript
className="focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-lf-dark"
```

**Aplicación:**
- Navegación por teclado totalmente accesible
- Anillos de foco de 4px con color contrastante
- Offset de 2px para mejor visibilidad

#### 6. ARIA Labels Completos
```typescript
<Link
  href={option.href}
  aria-label={`${option.title}: ${option.description}. ${option.stats.map(s => `${s.label}: ${s.value}`).join(', ')}`}
>
```

**Aplicación:**
- Todos los elementos interactivos tienen ARIA labels descriptivos
- Tooltips con `role="tooltip"`
- Skip link para contenido principal

#### 7. willChange Optimization
```typescript
style={{
  willChange: shouldAnimate ? 'transform, opacity' : 'auto',
}}
```

**Aplicación:**
- Optimización GPU solo cuando es necesario
- Reset a 'auto' con reduced motion
- Limitado a transform y opacity principalmente

### Sistema de Componentes AAA

#### InfiniteCourseMap
**Características:**
- 600+ temas organizados en 10 categorías
- Scroll infinito con lazy loading
- Búsqueda en tiempo real
- Filtrado por categoría y nivel (A1-C2)
- Grid responsivo (2-4 columnas)
- Orbs con progreso, XP, locks

**Categorías:**
1. Basics (Bases) - 🎯
2. Food (Comida) - 🍽️
3. Travel (Viajes) - ✈️
4. Business (Negocios) - 💼
5. Health (Salud) - 🏥
6. Culture (Cultura) - 🎨
7. Sports (Deportes) - ⚽
8. Technology (Tecnología) - 💻
9. Nature (Naturaleza) - 🌿
10. Relationships (Relaciones) - ❤️

#### AAAErrorBoundary
**Características:**
- UI fallback con diseño AAA
- Animación de pulso en error
- Mensaje claro al usuario
- Botón de recarga accesible
- Logging de errores

#### AAAAnimatedBackground
**Variantes:**
- `midnight` - Gradientes azules oscuros
- `nebula` - Púrpuras y magentas
- `aurora` - Verdes y cyans
- `sunset` - Naranjas y rojos

**Intensidades:**
- `subtle` - Animaciones suaves
- `medium` - Balanceado
- `intense` - Máxima expresividad

### Patrones de Animación AAA

#### Orbital System
**Aplicación en:**
- Input Hub (`src/app/input/page.tsx`)
- Learn/Mapa (`src/app/learn/page.tsx` - modo autónomo)

**Características:**
- Centro orb con 3 anillos orbitales rotativos
- Nodos satelitales posicionados con trigonometría
- Líneas de conexión SVG con gradientes
- Animaciones de hover y tap
- Tooltips con información detallada

#### Infinite Scroll
**Aplicación en:**
- InfiniteCourseMap (`src/components/learn/InfiniteCourseMap.tsx`)

**Características:**
- Carga inicial de 50 nodos
- Incrementos de 20 nodos al hacer scroll
- Loading indicator animado
- Filtros y búsqueda actualizados en tiempo real

### Best Practices Implementadas

#### Performance
- ✅ Lazy loading de componentes
- ✅ Virtual rendering para listas largas
- ✅ will-change CSS property optimizado
- ✅ FPS monitoring con degradación automática
- ✅ Animaciones solo cuando es necesario

#### Accessibility
- ✅ prefers-reduced-motion detection
- ✅ 44px minimum touch targets
- ✅ ARIA labels descriptivos
- ✅ Text shadows para contraste
- ✅ Focus rings visibles
- ✅ Navegación por teclado completa
- ✅ Skip link para contenido principal

#### Reliability
- ✅ ErrorBoundary con UI fallback
- ✅ HTML semántico con landmarks
- ✅ Logging de errores
- ✅ Validación de datos con Zod
- ✅ TypeScript strict mode

---

**Nota:** Esta estrategia de diseño debe integrarse progresivamente sin romper funcionalidad existente. Priorizar Neural Nexus como temática principal, con Bio-Lab y Janus Map como variantes temáticas opcionales.

**Actualización AAA (2026-01-09):** Sistema de diseño completamente actualizado con accesibilidad WCAG AAA, optimizaciones de rendimiento y componentes escalables. Implementadas todas las recomendaciones P0 y P1 de AAA Visual Quality Review.

