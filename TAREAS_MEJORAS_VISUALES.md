# Tareas de Mejoras Visuales para la Aplicación

Este documento contiene tareas específicas para mejorar los efectos visuales, animaciones, estructura HTML y presentación de información en toda la aplicación. Cada tarea es independiente y puede ser implementada por separado.

**Tecnologías disponibles:** `framer-motion`, `tailwindcss`, componentes existentes en `src/components/ui/`

---

# PARTE A: MEJORAS DE LAYOUT, HTML Y PRESENTACIÓN DE INFORMACIÓN

---

## TAREA A1: Mejorar Header con mejor jerarquía visual

**Archivo:** `src/components/layout/Header.tsx`

**Objetivo:** Hacer el header más legible y con mejor organización visual.

**Cambios específicos:**

1. **Separar visualmente las secciones** (líneas ~24-67):
   - Añadir separadores verticales sutiles entre grupos de stats:
   ```tsx
   <div className="flex items-center gap-3 text-sm">
     {/* Rank Badge */}
     <RankBadgeWithTooltip rank={rank} size="sm" tooltip />
     
     {/* Separador */}
     <div className="w-px h-6 bg-lf-primary/30" />
     
     {/* Resonance (XP) */}
     <div className="flex items-center gap-1.5">
       ...
     </div>
     
     {/* Separador */}
     <div className="w-px h-6 bg-lf-primary/30" />
     
     {/* Resto de stats */}
   </div>
   ```

2. **Mejorar el indicador de XP** (líneas ~30-45):
   - Añadir label visible "XP" junto al número
   - Hacer la barra de progreso más prominente:
   ```tsx
   <div className="flex items-center gap-2">
     <div className="flex flex-col items-end">
       <div className="flex items-center gap-1">
         <span className="text-[10px] text-lf-muted uppercase tracking-wide">XP</span>
         <span className="font-rajdhani font-bold text-lf-accent">
           <CountUpNumber value={xp} duration={0.8} />
         </span>
       </div>
       <div className="w-12 h-1.5 bg-lf-muted/30 rounded-full overflow-hidden">
         <motion.div
           className="h-full bg-gradient-to-r from-lf-accent to-lf-secondary rounded-full"
           initial={{ width: 0 }}
           animate={{ width: `${progress}%` }}
           transition={{ duration: 0.5, ease: "easeOut" }}
         />
       </div>
     </div>
   </div>
   ```

3. **Añadir tooltips a los iconos** (líneas ~48-61):
   - Coins: añadir `title="Monedas"`
   - Streak: añadir `title="Racha de días"`

---

## TAREA A2: Mejorar BottomNav con estados más claros

**Archivo:** `src/components/layout/BottomNav.tsx`

**Objetivo:** Hacer la navegación más intuitiva y con mejor feedback visual.

**Cambios específicos:**

1. **Mejorar el indicador activo** (líneas ~38-39):
   - Cambiar la línea inferior por un fondo completo:
   ```tsx
   <Link
     key={item.href}
     href={item.href}
     className={`relative flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${
       isActive
         ? 'text-lf-accent'
         : 'text-lf-muted hover:text-lf-secondary'
     }`}
   >
     {/* Fondo activo */}
     {isActive && (
       <motion.div
         className="absolute inset-x-2 inset-y-1 bg-lf-accent/10 rounded-xl"
         layoutId="nav-active-bg"
         transition={{ type: "spring", stiffness: 300, damping: 30 }}
       />
     )}
     
     <span className={`relative z-10 text-xl mb-0.5 ${isActive ? '' : ''}`}>
       {item.icon}
     </span>
     <span className="relative z-10 font-rajdhani text-xs font-medium tracking-wide uppercase">
       {item.label}
     </span>
   </Link>
   ```

2. **Añadir efecto de presión al tocar**:
   ```tsx
   <motion.div
     whileTap={{ scale: 0.9 }}
     className="flex flex-col items-center"
   >
     {/* contenido */}
   </motion.div>
   ```

---

## TAREA A3: Mejorar página de intro de lección (LeafPage)

**Archivo:** `src/app/tree/leaf/[leafId]/page.tsx`

**Objetivo:** Hacer la página de introducción más atractiva y fácil de escanear.

**Cambios específicos en la sección `phase === "intro"` (líneas ~1000-1260):**

1. **Mejorar tarjeta de gramática** (líneas ~1034-1058):
   - Añadir iconos más descriptivos a cada punto de gramática
   - Usar chips/badges en lugar de lista:
   ```tsx
   <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
     <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
       <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
         📌
       </span>
       <span>Gramática que aprenderás</span>
     </h3>
     <div className="flex flex-wrap gap-2">
       {leaf.grammar.map((g, i) => (
         <motion.span
           key={i}
           className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 + i * 0.05 }}
         >
           <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
           {g}
         </motion.span>
       ))}
     </div>
   </div>
   ```

2. **Mejorar grid de contenido** (líneas ~1070-1117):
   - Usar cards individuales en lugar de texto plano:
   ```tsx
   <div className="grid grid-cols-2 gap-3">
     {totalPhrases > 0 && (
       <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
         <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-lg">
           📝
         </div>
         <div>
           <div className="text-sm font-semibold text-gray-900 dark:text-white">
             {conversationalBlocks.length > 0 ? conversationalBlocks.length : totalPhrases}
           </div>
           <div className="text-xs text-gray-500 dark:text-gray-400">
             {conversationalBlocks.length > 0 ? "bloques" : "frases"}
           </div>
         </div>
       </div>
     )}
     {/* Repetir patrón para otros tipos de ejercicios */}
   </div>
   ```

3. **Mejorar botones de modo** (líneas ~1123-1186):
   - Añadir iconos más grandes y distintivos
   - Usar colores más contrastados:
   ```tsx
   <motion.button
     onClick={() => selectMode("academia")}
     className="w-full p-5 rounded-2xl border-2 transition-all text-left group hover:shadow-lg"
     style={{
       background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
       borderColor: "rgba(99, 102, 241, 0.3)"
     }}
     whileHover={{ scale: 1.01, borderColor: "rgba(99, 102, 241, 0.6)" }}
     whileTap={{ scale: 0.99 }}
   >
     <div className="flex items-start gap-4">
       <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg">
         🎓
       </div>
       <div className="flex-1">
         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
           Modo Academia
         </h3>
         <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
           Aprende a tu ritmo con ayuda
         </p>
         <div className="flex flex-wrap gap-2">
           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
             ✓ Sin límite
           </span>
           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
             ✓ Pistas
           </span>
         </div>
       </div>
     </div>
   </motion.button>
   ```

---

## TAREA A4: Mejorar menú de ejercicios (Exercise Menu)

**Archivo:** `src/app/tree/leaf/[leafId]/page.tsx`

**Objetivo:** Hacer el menú de ejercicios más visual y fácil de navegar.

**Cambios específicos en la sección `phase === "exercise-menu"` (líneas ~1263-1400+):**

1. **Mejorar el header del menú** (líneas ~1274-1290):
   ```tsx
   <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 shadow-lg text-white mb-4">
     <div className="flex items-center justify-between">
       <div className="flex items-center gap-3">
         <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
           🎓
         </div>
         <div>
           <h2 className="text-xl font-bold">Menú de Ejercicios</h2>
           <p className="text-sm text-white/80">
             Nivel {levelInfo.level}: {levelInfo.title}
           </p>
         </div>
       </div>
       <button
         onClick={() => setPhase("intro")}
         className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-medium transition-colors"
       >
         ← Cambiar
       </button>
     </div>
   </div>
   ```

2. **Mejorar sección de ejercicios de frases** (líneas ~1293-1400):
   - Añadir header de sección con icono:
   ```tsx
   <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-700 mb-4">
     <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
       <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xl">
         📝
       </div>
       <div className="flex-1">
         <h3 className="font-bold text-gray-900 dark:text-white">
           Ejercicios de Bloques
         </h3>
         <p className="text-xs text-gray-500 dark:text-gray-400">
           {conversationalBlocks.length} bloques · {totalPhrases} frases
         </p>
       </div>
     </div>
     
     <div className="grid grid-cols-2 gap-3">
       {/* Botones de ejercicios */}
     </div>
   </div>
   ```

3. **Mejorar botones de ejercicio individuales**:
   - Añadir barra de progreso más visible
   - Usar iconos más grandes:
   ```tsx
   <motion.button
     className="relative overflow-hidden rounded-xl p-4 text-left transition-all border-2 group"
     whileHover={{ scale: 1.02, y: -2 }}
     whileTap={{ scale: 0.98 }}
   >
     {/* Barra de progreso de fondo */}
     <div 
       className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 transition-all"
       style={{ width: `${progressPercent}%` }}
     />
     
     <div className="relative z-10 flex items-center gap-3">
       <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
         ✏️
       </div>
       <div className="flex-1">
         <div className="font-bold text-gray-900 dark:text-white">Cloze</div>
         <div className="text-xs text-gray-500 dark:text-gray-400">
           {completedCount}/{totalPhrases} completados
         </div>
       </div>
       {isFullyCompleted && (
         <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
           ✓
         </div>
       )}
     </div>
   </motion.button>
   ```

---

## TAREA A5: Mejorar indicadores de progreso durante ejercicios

**Archivo:** `src/app/tree/leaf/[leafId]/page.tsx`

**Objetivo:** Mostrar el progreso de forma más clara durante los ejercicios.

**Cambios específicos en la sección `phase === "exercises"` (buscar donde se renderiza el ejercicio actual):**

1. **Añadir barra de progreso superior**:
   ```tsx
   {/* Progress Bar - Añadir al inicio de la sección de ejercicios */}
   <div className="mb-4">
     <div className="flex items-center justify-between mb-2">
       <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
         Progreso de la lección
       </span>
       <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
         {completedExercises.size}/{totalExercises}
       </span>
     </div>
     <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
       <motion.div
         className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
         initial={{ width: 0 }}
         animate={{ width: `${(completedExercises.size / totalExercises) * 100}%` }}
         transition={{ duration: 0.5, ease: "easeOut" }}
       />
     </div>
   </div>
   ```

2. **Añadir indicador de ejercicio actual**:
   ```tsx
   {/* Current Exercise Indicator */}
   <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-3 mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
     <div className="flex items-center gap-2">
       <span className="text-lg">
         {currentExerciseType === "phrases" ? "📝" : 
          currentExerciseType === "pragmaStrike" ? "⚡" :
          currentExerciseType === "shardDetection" ? "🔍" : "📚"}
       </span>
       <div>
         <div className="text-sm font-bold text-gray-900 dark:text-white">
           {currentExerciseType === "phrases" && phrasePhase === "cloze" ? "Cloze" :
            currentExerciseType === "phrases" && phrasePhase === "variations" ? "Variaciones" :
            currentExerciseType === "pragmaStrike" ? "Comunicación" :
            currentExerciseType === "shardDetection" ? "Reconocimiento" : "Ejercicio"}
         </div>
         <div className="text-xs text-gray-500 dark:text-gray-400">
           {currentPhraseIndex + 1} de {totalPhrases}
         </div>
       </div>
     </div>
     <button
       onClick={returnToMenu}
       className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors"
     >
       ← Menú
     </button>
   </div>
   ```

---

## TAREA A6: Mejorar página de completado de lección

**Archivo:** `src/app/tree/leaf/[leafId]/page.tsx`

**Objetivo:** Hacer la pantalla de completado más celebratoria.

**Buscar sección `phase === "complete"` y mejorar:**

1. **Crear pantalla de celebración**:
   ```tsx
   {phase === "complete" && (
     <motion.div
       key="complete"
       initial={{ opacity: 0, scale: 0.9 }}
       animate={{ opacity: 1, scale: 1 }}
       className="text-center py-8"
     >
       {/* Icono animado */}
       <motion.div
         className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
         initial={{ scale: 0, rotate: -180 }}
         animate={{ scale: 1, rotate: 0 }}
         transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
       >
         <span className="text-5xl">🎉</span>
       </motion.div>
       
       {/* Título */}
       <motion.h2
         className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.4 }}
       >
         ¡Lección Completada!
       </motion.h2>
       
       {/* Subtítulo */}
       <motion.p
         className="text-gray-600 dark:text-gray-400 mb-8"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.5 }}
       >
         Has dominado "{leaf.title}"
       </motion.p>
       
       {/* Stats en cards */}
       <motion.div
         className="grid grid-cols-3 gap-3 mb-8"
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.6 }}
       >
         <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
           <div className="text-2xl font-bold text-emerald-500">{correctAnswers}</div>
           <div className="text-xs text-gray-500 dark:text-gray-400">Correctas</div>
         </div>
         <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
           <div className="text-2xl font-bold text-indigo-500">+{xpEarned}</div>
           <div className="text-xs text-gray-500 dark:text-gray-400">XP ganado</div>
         </div>
         <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
           <div className="text-2xl font-bold text-amber-500">{accuracy}%</div>
           <div className="text-xs text-gray-500 dark:text-gray-400">Precisión</div>
         </div>
       </motion.div>
       
       {/* Botón continuar */}
       <motion.button
         onClick={() => router.push("/tree")}
         className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg"
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.8 }}
         whileHover={{ scale: 1.02 }}
         whileTap={{ scale: 0.98 }}
       >
         Continuar →
       </motion.button>
     </motion.div>
   )}
   ```

---

## TAREA A7: Mejorar estados de carga y error

**Archivos:** Todos los archivos de página (`page.tsx`)

**Objetivo:** Hacer los estados de carga y error más informativos y atractivos.

**Cambios específicos:**

1. **Mejorar spinner de carga** (buscar `loading` en cada página):
   ```tsx
   {loading && (
     <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
       <motion.div
         className="relative w-16 h-16"
         animate={{ rotate: 360 }}
         transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
       >
         <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900" />
         <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500" />
       </motion.div>
       <motion.p
         className="text-sm text-gray-500 dark:text-gray-400"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.5 }}
       >
         Cargando contenido...
       </motion.p>
     </div>
   )}
   ```

2. **Mejorar pantalla de error**:
   ```tsx
   {error && (
     <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
       <motion.div
         className="w-20 h-20 mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
         initial={{ scale: 0 }}
         animate={{ scale: 1 }}
         transition={{ type: "spring" }}
       >
         <span className="text-4xl">😕</span>
       </motion.div>
       <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
         Algo salió mal
       </h2>
       <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs">
         {error}
       </p>
       <button
         onClick={() => router.back()}
         className="px-6 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors"
       >
         ← Volver
       </button>
     </div>
   )}
   ```

---

## TAREA A8: Mejorar GlyphFrame con variantes más expresivas

**Archivo:** `src/components/ui/GlyphFrame.tsx`

**Objetivo:** Hacer el componente más versátil y con mejor feedback visual.

**Cambios específicos:**

1. **Añadir nuevas variantes** (líneas ~14-39):
   ```tsx
   const variantStyles = {
     default: { /* existente */ },
     accent: { /* existente */ },
     success: { /* existente */ },
     muted: { /* existente */ },
     // Nuevas variantes
     warning: {
       border: 'border-amber-500/40',
       corner: 'border-amber-400',
       title: 'text-amber-400',
       bg: 'bg-amber-900/10',
     },
     error: {
       border: 'border-red-500/40',
       corner: 'border-red-400',
       title: 'text-red-400',
       bg: 'bg-red-900/10',
     },
     gradient: {
       border: 'border-transparent',
       corner: 'border-transparent',
       title: 'text-white',
       bg: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
     },
   };
   ```

2. **Añadir prop para glow effect**:
   ```tsx
   interface GlyphFrameProps {
     // ... props existentes
     glow?: boolean;
     glowColor?: string;
   }
   
   // En el componente:
   <div 
     className={`relative p-[1px] rounded-glyph ${className} ${
       glow ? 'shadow-lg' : ''
     }`}
     style={glow ? { boxShadow: `0 0 20px ${glowColor || 'rgba(99, 102, 241, 0.3)'}` } : {}}
   >
   ```

---

# PARTE B: MEJORAS DE ANIMACIONES EN EJERCICIOS

---

## TAREA 1: Mejorar feedback visual en ClozeExercise

**Archivo:** `src/components/exercises/ClozeExercise.tsx`

**Objetivo:** Hacer más espectacular el feedback cuando el usuario acierta o falla.

**Cambios específicos:**

1. **Cuando el usuario ACIERTA** (líneas ~262-291, botones de opciones):
   - Añadir animación de escala al botón correcto: `animate={{ scale: [1, 1.15, 1] }}` con duración 0.4s
   - Añadir un efecto de "glow" verde con `boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)"`
   - El hueco donde aparece la palabra correcta debe tener animación de entrada con `animate={{ scale: [0.8, 1.1, 1] }}`

2. **Cuando el usuario FALLA**:
   - Añadir animación de "shake" al botón incorrecto: `animate={{ x: [0, -10, 10, -10, 10, 0] }}` con duración 0.5s
   - El borde rojo debe pulsar brevemente

3. **Mensaje de resultado** (líneas ~296-318):
   - Cambiar `initial={{ opacity: 0, y: 20 }}` por `initial={{ opacity: 0, scale: 0.8 }}`
   - Añadir `animate={{ opacity: 1, scale: 1 }}` con `transition={{ type: "spring", stiffness: 300 }}`

**Código de referencia para el botón correcto:**
```tsx
<motion.button
  // ... props existentes
  animate={
    showCorrect
      ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 25px rgba(16, 185, 129, 0.6)", "0 0 15px rgba(16, 185, 129, 0.4)"] }
      : showIncorrect
      ? { x: [0, -8, 8, -8, 8, 0] }
      : {}
  }
  transition={showCorrect || showIncorrect ? { duration: 0.5 } : { delay: index * 0.1 }}
>
```

---

## TAREA 2: Mejorar timer visual en PragmaStrikeExercise

**Archivo:** `src/components/exercises/PragmaStrikeExercise.tsx`

**Objetivo:** Hacer el timer más dramático y visualmente impactante cuando queda poco tiempo.

**Cambios específicos:**

1. **Barra de timer** (líneas ~103-119):
   - Cuando `isUrgent` (menos del 30% del tiempo), añadir animación de pulso a la barra:
   ```tsx
   <motion.div
     className={`h-full rounded-full ${isUrgent ? 'bg-red-500' : 'bg-indigo-500'}`}
     animate={isUrgent ? { opacity: [1, 0.6, 1] } : {}}
     transition={isUrgent ? { duration: 0.3, repeat: Infinity } : {}}
     style={{ width: `${timerPressure * 100}%` }}
   />
   ```

2. **Número del timer** (líneas ~113-118):
   - Cuando `isUrgent`, añadir escala pulsante:
   ```tsx
   <motion.div
     className={`text-2xl font-bold ${isUrgent ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}
     animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
     transition={isUrgent ? { duration: 0.3, repeat: Infinity } : {}}
   >
     {timeRemaining.toFixed(1)}s
   </motion.div>
   ```

3. **Fondo de la pantalla cuando es urgente**:
   - Añadir un borde rojo pulsante al contenedor principal cuando `isUrgent`:
   ```tsx
   <motion.div 
     className="space-y-6"
     animate={isUrgent ? { borderColor: ["rgba(239, 68, 68, 0)", "rgba(239, 68, 68, 0.5)", "rgba(239, 68, 68, 0)"] } : {}}
     style={{ borderWidth: isUrgent ? 2 : 0, borderRadius: 16 }}
     transition={{ duration: 0.5, repeat: Infinity }}
   >
   ```

4. **Feedback de respuesta correcta rápida** (cuando `timeSpent < 3`):
   - Mostrar un badge "⚡ RÁPIDO" con animación de entrada

---

## TAREA 3: Mejorar selección de imágenes en ShardDetectionExercise

**Archivo:** `src/components/exercises/ShardDetectionExercise.tsx`

**Objetivo:** Hacer más satisfactoria la selección de imágenes y el feedback.

**Cambios específicos:**

1. **Hover en imágenes** (líneas ~149-199):
   - Añadir efecto de elevación al hacer hover:
   ```tsx
   whileHover={!showResult ? { 
     scale: 1.05, 
     y: -5,
     boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)" 
   } : {}}
   ```

2. **Imagen correcta cuando se muestra resultado**:
   - Añadir animación de "bounce" suave:
   ```tsx
   animate={showCorrect ? { 
     scale: [1, 1.1, 1.05],
     rotate: [0, 2, -2, 0]
   } : {}}
   transition={{ duration: 0.5 }}
   ```

3. **Overlay de checkmark/X** (líneas ~181-198):
   - Hacer que el icono entre con animación de escala:
   ```tsx
   <motion.div
     className="bg-emerald-500/90 text-white text-4xl font-bold p-4 rounded-full"
     initial={{ scale: 0, rotate: -180 }}
     animate={{ scale: 1, rotate: 0 }}
     transition={{ type: "spring", stiffness: 300, damping: 15 }}
   >
     ✓
   </motion.div>
   ```

4. **Animación del botón de audio** (líneas ~121-139):
   - Cuando está reproduciendo, añadir ondas de sonido visuales:
   ```tsx
   {isPlaying && (
     <motion.div
       className="absolute inset-0 rounded-lg border-2 border-indigo-400"
       animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
       transition={{ duration: 1, repeat: Infinity }}
     />
   )}
   ```

---

## TAREA 4: Mejorar animaciones en VocabularyExercise

**Archivo:** `src/components/exercises/VocabularyExercise.tsx`

**Objetivo:** Hacer más atractiva la presentación de imagen y opciones.

**Cambios específicos:**

1. **Entrada de la imagen** (líneas ~57-70):
   - Mejorar la animación de entrada:
   ```tsx
   <motion.div
     className="relative w-full h-64 rounded-xl overflow-hidden"
     initial={{ opacity: 0, y: -30, rotateX: 15 }}
     animate={{ opacity: 1, y: 0, rotateX: 0 }}
     transition={{ type: "spring", stiffness: 100, damping: 15 }}
   >
   ```

2. **Entrada escalonada de opciones** (líneas ~73-109):
   - Cambiar el delay para que sea más dramático:
   ```tsx
   initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
   animate={{ opacity: 1, x: 0 }}
   transition={{ delay: 0.3 + index * 0.15, type: "spring" }}
   ```

3. **Feedback de opción correcta**:
   - Añadir efecto de "glow" y escala:
   ```tsx
   animate={showCorrect ? { 
     scale: [1, 1.08, 1.03],
     boxShadow: ["0 0 0 rgba(16, 185, 129, 0)", "0 0 30px rgba(16, 185, 129, 0.6)", "0 0 20px rgba(16, 185, 129, 0.4)"]
   } : {}}
   ```

4. **Mensaje de resultado** (líneas ~113-136):
   - Añadir icono animado:
   ```tsx
   <motion.span 
     className="text-2xl mr-2"
     animate={{ rotate: isCorrect ? [0, 15, -15, 0] : [0, -5, 5, 0] }}
     transition={{ duration: 0.5 }}
   >
     {isCorrect ? "🎉" : "💡"}
   </motion.span>
   ```

---

## TAREA 5: Mejorar transiciones en VariationsExercise

**Archivo:** `src/components/exercises/VariationsExercise.tsx`

**Objetivo:** Hacer más fluidas las transiciones entre variaciones.

**Cambios específicos:**

1. **Transición de tarjeta** (líneas ~140-230):
   - Mejorar la animación de entrada/salida:
   ```tsx
   <AnimatePresence mode="wait">
     <motion.div
       key={currentVariation.id}
       initial={{ opacity: 0, x: 100, rotateY: 15 }}
       animate={{ opacity: 1, x: 0, rotateY: 0 }}
       exit={{ opacity: 0, x: -100, rotateY: -15 }}
       transition={{ type: "spring", stiffness: 200, damping: 25 }}
     >
   ```

2. **Indicadores de progreso** (líneas ~79-95):
   - Añadir animación cuando un punto cambia de estado:
   ```tsx
   <motion.button
     className={`w-3 h-3 rounded-full transition-all ${...}`}
     animate={index === currentIndex ? { scale: [1, 1.3, 1] } : {}}
     transition={{ duration: 0.3 }}
     whileHover={{ scale: 1.2 }}
   />
   ```

3. **Botón "Entendido"** (líneas ~248-254):
   - Añadir efecto de brillo/shimmer:
   ```tsx
   <motion.button
     className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg relative overflow-hidden"
     whileHover={{ scale: 1.02 }}
     whileTap={{ scale: 0.98 }}
   >
     <motion.div
       className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
       animate={{ x: ["-100%", "200%"] }}
       transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
     />
     <span className="relative z-10">Entendido (+{XP_RULES.variationRead} XP)</span>
   </motion.button>
   ```

4. **Barra de progreso** (líneas ~279-285):
   - Añadir efecto de "glow" cuando se completa:
   ```tsx
   <motion.div
     className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
     animate={{ 
       width: `${(readVariations.size / allVariations.length) * 100}%`,
       boxShadow: readVariations.size === allVariations.length 
         ? "0 0 20px rgba(99, 102, 241, 0.6)" 
         : "none"
     }}
   />
   ```

---

## TAREA 6: Mejorar visualización de audio en EchoStreamExercise

**Archivo:** `src/components/exercises/EchoStreamExercise.tsx`

**Objetivo:** Hacer más visual e interactiva la reproducción de audio.

**Cambios específicos:**

1. **Estadísticas con animación** (líneas ~333-350):
   - Añadir contador animado cuando detecta Power Word:
   ```tsx
   <motion.div 
     className="text-2xl font-bold text-indigo-600"
     key={powerWordsDetected.size}
     initial={{ scale: 1.5, color: "#10B981" }}
     animate={{ scale: 1, color: "#4F46E5" }}
     transition={{ duration: 0.3 }}
   >
     {powerWordsDetected.size}/{exercise.powerWords.length}
   </motion.div>
   ```

2. **Barra de progreso** (líneas ~353-365):
   - Añadir gradiente animado:
   ```tsx
   <motion.div
     className="h-full rounded-full"
     style={{
       background: "linear-gradient(90deg, #4F46E5, #8B5CF6, #4F46E5)",
       backgroundSize: "200% 100%",
     }}
     animate={{ 
       width: `${progress}%`,
       backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"]
     }}
     transition={{ 
       width: { duration: 0.1 },
       backgroundPosition: { duration: 3, repeat: Infinity }
     }}
   />
   ```

3. **Pantalla de completado** (líneas ~395-424):
   - Añadir animación de entrada más dramática:
   ```tsx
   <motion.div
     initial={{ opacity: 0, scale: 0.5, rotateZ: -5 }}
     animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
     transition={{ type: "spring", stiffness: 200 }}
   >
     <motion.span 
       className="text-6xl mb-4 block"
       animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
       transition={{ duration: 0.5, delay: 0.2 }}
     >
       {accuracy >= 90 ? '🎉' : '✨'}
     </motion.span>
   ```

---

## TAREA 7: Añadir efecto de XP flotante global

**Archivo:** `src/components/ui/FloatingXP.tsx` (CREAR NUEVO)

**Objetivo:** Mostrar el XP ganado flotando hacia arriba cuando se gana.

**Implementación completa:**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPNotification {
  id: number;
  amount: number;
  x: number;
  y: number;
}

export function FloatingXP() {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);

  useEffect(() => {
    const handleXP = (event: CustomEvent<{ amount: number; x?: number; y?: number }>) => {
      const { amount, x = window.innerWidth / 2, y = window.innerHeight / 2 } = event.detail;
      
      const id = Date.now();
      setNotifications(prev => [...prev, { id, amount, x, y }]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 1500);
    };

    window.addEventListener('xp-gained', handleXP as EventListener);
    return () => window.removeEventListener('xp-gained', handleXP as EventListener);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {notifications.map(({ id, amount, x, y }) => (
          <motion.div
            key={id}
            className="absolute text-2xl font-bold text-amber-500 drop-shadow-lg"
            style={{ left: x, top: y }}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -80, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            +{amount} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

**Uso:** Añadir al layout principal y disparar eventos con:
```tsx
window.dispatchEvent(new CustomEvent('xp-gained', { detail: { amount: 10 } }));
```

---

## TAREA 8: Mejorar GlyphWeavingExercise con efectos de conexión

**Archivo:** `src/components/exercises/GlyphWeavingExercise.tsx`

**Objetivo:** Hacer más visual el proceso de conectar glifos.

**Cambios específicos:**

1. **En la función `drawCanvas`** (líneas ~177-288):
   - Cuando se dibuja una conexión nueva, hacerla con animación de "trazo":
   - Añadir efecto de "glow" a las conexiones recientes
   - El glifo seleccionado debe tener un anillo pulsante

2. **Estadísticas** (líneas ~402-427):
   - El indicador de "Sincronizado" debe tener animación de pulso cuando está en beat:
   ```tsx
   <motion.div
     className="text-2xl font-bold text-purple-600"
     animate={isOnBeat(currentTime, exercise.bpm) ? { scale: [1, 1.3, 1] } : {}}
     transition={{ duration: 0.2 }}
   >
     {isOnBeat(currentTime, exercise.bpm) ? '✓' : '○'}
   </motion.div>
   ```

3. **Pantalla de completado** (líneas ~460-479):
   - Añadir animación similar a EchoStream

---

## Notas de Implementación

### Principios generales:
1. **No añadir dependencias nuevas** - Usar solo `framer-motion` que ya está instalado
2. **Mantener rendimiento** - Evitar animaciones en bucle infinito cuando no son visibles
3. **Accesibilidad** - Respetar `prefers-reduced-motion` del usuario
4. **Mobile-first** - Las animaciones deben funcionar bien en móvil

### Cómo respetar reduced-motion:
```tsx
const prefersReducedMotion = typeof window !== 'undefined' 
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
  : false;

// Usar en animaciones:
animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
```

### Orden de prioridad:
1. TAREA 1 (ClozeExercise) - Es el ejercicio más usado
2. TAREA 4 (VocabularyExercise) - Nuevo y necesita pulido
3. TAREA 2 (PragmaStrikeExercise) - El timer es crítico
4. TAREA 3 (ShardDetectionExercise) - Mejora la experiencia de audio
5. TAREA 5 (VariationsExercise) - Transiciones importantes
6. TAREA 6 (EchoStreamExercise) - Ejercicio complejo
7. TAREA 7 (FloatingXP) - Mejora global
8. TAREA 8 (GlyphWeavingExercise) - Ejercicio avanzado

