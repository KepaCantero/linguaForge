# ROADMAP DE MONETIZACIÓN - LINGUAFORGE

> **Objetivo:** App que genera €10k+/mes preparando usuarios para DELF
> **Timeline:** 8 semanas hasta validación
> **Budget:** €5k

---

## 📊 RESUMEN EJECUTIVO

| Fase | Semanas | Objetivo | Entregable |
|------|---------|----------|------------|
| **FASE 1** | 1-2 | Fundamentos | App que puede cobrar |
| **FASE 2** | 3-4 | Contenido IA | 1 mundo completo, proceso replicable |
| **FASE 3** | 5-8 | Validación | Datos reales de conversión |

---

# 🔧 FASE 1: FUNDAMENTOS (Semanas 1-2)

## TAREA 1.1: Auth con Supabase
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 2 días  
**Impacto:** Sin esto no hay negocio  
**Dependencias:** Ninguna

### Subtareas:

#### 1.1.1 Configurar proyecto Supabase
- [ ] Crear cuenta en supabase.com
- [ ] Crear nuevo proyecto "linguaforge-prod"
- [ ] Obtener URL y anon key
- [ ] Configurar variables de entorno en `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ```

#### 1.1.2 Instalar dependencias
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

#### 1.1.3 Crear cliente Supabase
- [ ] Crear `src/lib/supabase/client.ts` (cliente browser)
- [ ] Crear `src/lib/supabase/server.ts` (cliente server)
- [ ] Crear `src/lib/supabase/middleware.ts` (refresh tokens)

#### 1.1.4 Crear tablas en Supabase
```sql
-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free', -- free, premium, cancelled
  subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### 1.1.5 Crear páginas de auth
- [ ] `src/app/auth/login/page.tsx` - Login con email/Google
- [ ] `src/app/auth/register/page.tsx` - Registro
- [ ] `src/app/auth/callback/route.ts` - OAuth callback
- [ ] `src/app/auth/forgot-password/page.tsx` - Recuperar contraseña

#### 1.1.6 Crear componentes de auth
- [ ] `src/components/auth/LoginForm.tsx`
- [ ] `src/components/auth/RegisterForm.tsx`
- [ ] `src/components/auth/GoogleButton.tsx`
- [ ] `src/components/auth/AuthGuard.tsx` - Proteger rutas

#### 1.1.7 Crear contexto de usuario
- [ ] `src/contexts/AuthContext.tsx` - Estado global del usuario
- [ ] `src/hooks/useUser.ts` - Hook para acceder al usuario

#### 1.1.8 Configurar OAuth Google
- [ ] Crear proyecto en Google Cloud Console
- [ ] Configurar OAuth consent screen
- [ ] Crear credenciales OAuth 2.0
- [ ] Añadir redirect URI de Supabase
- [ ] Configurar en Supabase Dashboard > Auth > Providers

#### 1.1.9 Actualizar middleware
- [ ] Crear `src/middleware.ts` para refresh de sesión
- [ ] Proteger rutas `/tree/*` para usuarios autenticados

#### 1.1.10 Testing
- [ ] Probar registro con email
- [ ] Probar login con email
- [ ] Probar login con Google
- [ ] Probar logout
- [ ] Probar recuperación de contraseña
- [ ] Verificar que el perfil se crea automáticamente

**Criterio de completado:** Usuario puede registrarse, loguearse y ver su perfil.

---

## TAREA 1.2: Persistencia de Progreso
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 1 día  
**Impacto:** Sin esto nadie vuelve  
**Dependencias:** TAREA 1.1

### Subtareas:

#### 1.2.1 Crear tabla de progreso
```sql
-- Progreso por lección
CREATE TABLE lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL, -- ej: "leaf-1-1-greetings"
  world_id TEXT NOT NULL, -- ej: "world-1-identity"
  
  -- Progreso de ejercicios
  completed_exercises JSONB DEFAULT '[]', -- ["phrase-0-cloze", "pragma-1"]
  correct_answers INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  
  -- Estado
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- XP ganado en esta lección
  xp_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id)
);

-- Índices para queries rápidas
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_world ON lesson_progress(world_id);
CREATE INDEX idx_lesson_progress_status ON lesson_progress(status);

-- RLS
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 1.2.2 Crear tabla de stats globales
```sql
-- Stats globales del usuario
CREATE TABLE user_stats (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- XP y nivel
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  
  -- Streak
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  -- Monedas
  coins INTEGER DEFAULT 0,
  
  -- Contadores
  lessons_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para crear stats automáticamente
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 1.2.3 Crear servicio de progreso
- [ ] `src/lib/services/progressService.ts`:
  - `saveExerciseCompletion(lessonId, exerciseId, isCorrect)`
  - `getLessonProgress(lessonId)`
  - `getUserProgress()` - todo el progreso del usuario
  - `updateStreak()`
  - `addXP(amount)`

#### 1.2.4 Migrar store actual a Supabase
- [ ] Modificar `src/stores/useTreeProgressStore.ts` para sincronizar con Supabase
- [ ] Mantener localStorage como cache/fallback offline
- [ ] Sincronizar al reconectar

#### 1.2.5 Actualizar página de lección
- [ ] Cargar progreso al entrar en lección
- [ ] Guardar cada ejercicio completado
- [ ] Mostrar progreso real del usuario

#### 1.2.6 Testing
- [ ] Completar ejercicio → verificar que se guarda
- [ ] Cerrar app → reabrir → verificar que progreso persiste
- [ ] Verificar streak se actualiza correctamente
- [ ] Verificar XP se acumula

**Criterio de completado:** Progreso persiste entre sesiones y dispositivos.

---

## TAREA 1.3: Paywall después de Lección 3
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 1 día  
**Impacto:** Sin esto nadie paga  
**Dependencias:** TAREA 1.1, TAREA 1.2

### Subtareas:

#### 1.3.1 Definir lógica de acceso
```typescript
// src/lib/access/accessRules.ts

export const FREE_LESSONS = [
  'leaf-1-1-greetings',
  'leaf-1-2-introductions', 
  'leaf-1-3-numbers'
];

export const FREE_WORLDS = [
  'world-1-identity' // Solo el primer mundo parcialmente
];

export function canAccessLesson(lessonId: string, isPremium: boolean): boolean {
  if (isPremium) return true;
  return FREE_LESSONS.includes(lessonId);
}

export function canAccessWorld(worldId: string, isPremium: boolean): boolean {
  if (isPremium) return true;
  return FREE_WORLDS.includes(worldId);
}

export function getLessonsRemaining(completedLessons: number): number {
  return Math.max(0, FREE_LESSONS.length - completedLessons);
}
```

#### 1.3.2 Crear componente Paywall
- [ ] `src/components/paywall/PaywallModal.tsx`:
  - Título atractivo: "Desbloquea tu francés"
  - Beneficios de premium
  - Precios (mensual/anual)
  - Botones de compra
  - Opción de cerrar (volver a contenido gratis)

#### 1.3.3 Crear página de pricing
- [ ] `src/app/pricing/page.tsx`:
  - Comparativa Free vs Premium
  - FAQ
  - Garantía de devolución
  - Testimonios (placeholder por ahora)

#### 1.3.4 Implementar checks de acceso
- [ ] En `src/app/tree/leaf/[leafId]/page.tsx`:
  - Verificar si usuario puede acceder
  - Si no puede → mostrar PaywallModal
  - Tracking de intento de acceso bloqueado

#### 1.3.5 Mostrar indicadores de contenido premium
- [ ] En árbol de lecciones: candado en lecciones premium
- [ ] Badge "Premium" en mundos bloqueados
- [ ] Contador "3 lecciones gratis restantes"

#### 1.3.6 Testing
- [ ] Usuario free intenta lección 4 → ve paywall
- [ ] Usuario premium accede a todo
- [ ] Indicadores visuales correctos en árbol

**Criterio de completado:** Contenido después de lección 3 está bloqueado para usuarios free.

---

## TAREA 1.4: Integración Stripe
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 2 días  
**Impacto:** Sin esto no hay dinero  
**Dependencias:** TAREA 1.1, TAREA 1.3

### Subtareas:

#### 1.4.1 Configurar cuenta Stripe
- [ ] Crear cuenta en stripe.com
- [ ] Completar verificación de negocio
- [ ] Obtener API keys (test y live)
- [ ] Configurar variables de entorno:
  ```
  STRIPE_SECRET_KEY=
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
  STRIPE_WEBHOOK_SECRET=
  ```

#### 1.4.2 Crear productos en Stripe
- [ ] Producto: "LinguaForge Premium"
- [ ] Precio mensual: €9.99/mes (price_monthly_id)
- [ ] Precio anual: €79.99/año (price_yearly_id)
- [ ] Producto: "DELF Pack" €49.99 único (price_delf_id)

#### 1.4.3 Instalar dependencias
```bash
npm install stripe @stripe/stripe-js
```

#### 1.4.4 Crear API routes
- [ ] `src/app/api/stripe/create-checkout/route.ts`:
  ```typescript
  // Crear sesión de Stripe Checkout
  // Recibe: priceId, userId
  // Devuelve: checkout URL
  ```

- [ ] `src/app/api/stripe/webhook/route.ts`:
  ```typescript
  // Manejar eventos de Stripe:
  // - checkout.session.completed → activar premium
  // - customer.subscription.deleted → desactivar premium
  // - invoice.payment_failed → notificar usuario
  ```

- [ ] `src/app/api/stripe/portal/route.ts`:
  ```typescript
  // Crear sesión de Customer Portal
  // Para que usuario gestione su suscripción
  ```

#### 1.4.5 Crear servicio de suscripción
- [ ] `src/lib/services/subscriptionService.ts`:
  - `createCheckoutSession(userId, priceId)`
  - `getSubscriptionStatus(userId)`
  - `cancelSubscription(userId)`
  - `reactivateSubscription(userId)`

#### 1.4.6 Actualizar perfil con estado de suscripción
```sql
-- Añadir campos a profiles
ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN subscription_period_end TIMESTAMP WITH TIME ZONE;
```

#### 1.4.7 Crear páginas de checkout
- [ ] `src/app/checkout/success/page.tsx` - Gracias por tu compra
- [ ] `src/app/checkout/cancel/page.tsx` - Vuelve cuando quieras

#### 1.4.8 Integrar botones de compra
- [ ] En PaywallModal: botones que inician checkout
- [ ] En página de pricing: botones de compra
- [ ] En perfil de usuario: gestionar suscripción

#### 1.4.9 Configurar webhook en Stripe Dashboard
- [ ] Añadir endpoint: `https://tudominio.com/api/stripe/webhook`
- [ ] Seleccionar eventos relevantes
- [ ] Copiar signing secret

#### 1.4.10 Testing (modo test de Stripe)
- [ ] Completar compra con tarjeta de test
- [ ] Verificar que usuario se marca como premium
- [ ] Verificar acceso a contenido premium
- [ ] Probar cancelación
- [ ] Probar renovación fallida

**Criterio de completado:** Usuario puede pagar y obtener acceso premium.

---

## TAREA 1.5: Landing Page DELF
**Prioridad:** 🟡 ALTA  
**Tiempo estimado:** 2 días  
**Impacto:** Sin esto no hay tráfico  
**Dependencias:** Ninguna (puede hacerse en paralelo)

### Subtareas:

#### 1.5.1 Crear estructura de landing
- [ ] `src/app/(marketing)/page.tsx` - Landing principal
- [ ] `src/app/(marketing)/layout.tsx` - Layout sin nav de app

#### 1.5.2 Secciones de la landing

**Hero Section:**
- [ ] Headline: "Aprueba el DELF en 90 días"
- [ ] Subheadline: "Práctica diaria con IA + simulacros reales"
- [ ] CTA principal: "Empieza gratis"
- [ ] CTA secundario: "Ver demo"
- [ ] Imagen/ilustración hero

**Problema Section:**
- [ ] "¿Cansado de apps que no te preparan para el examen real?"
- [ ] 3 pain points con iconos
- [ ] Transición a solución

**Solución Section:**
- [ ] "LinguaForge es diferente"
- [ ] 3-4 features principales con iconos/ilustraciones:
  - Bloques conversacionales reales
  - Ejercicios tipo DELF
  - Progreso medible
  - IA que se adapta a ti

**Social Proof Section:**
- [ ] Logos de instituciones (placeholder)
- [ ] Estadísticas: "X usuarios", "Y% aprobados"
- [ ] Testimonios (placeholder, luego reales)

**Pricing Section:**
- [ ] Tabla comparativa Free vs Premium
- [ ] Destacar plan anual
- [ ] Garantía de devolución 30 días

**FAQ Section:**
- [ ] 5-7 preguntas frecuentes
- [ ] Accordion interactivo

**Final CTA Section:**
- [ ] "Empieza tu camino al DELF hoy"
- [ ] Botón grande de registro
- [ ] "3 lecciones gratis, sin tarjeta"

#### 1.5.3 SEO básico
- [ ] Meta tags optimizados para "preparación DELF"
- [ ] Open Graph tags
- [ ] Schema.org markup
- [ ] Sitemap.xml

#### 1.5.4 Analytics
- [ ] Integrar Google Analytics 4
- [ ] Configurar eventos de conversión
- [ ] Pixel de Facebook (para ads después)

#### 1.5.5 Responsive y performance
- [ ] Mobile-first design
- [ ] Imágenes optimizadas (next/image)
- [ ] Core Web Vitals verdes

**Criterio de completado:** Landing publicada, indexable, con tracking.

---

## ✅ CHECKLIST FASE 1

```
[ ] TAREA 1.1: Auth con Supabase
    [ ] 1.1.1 Configurar proyecto
    [ ] 1.1.2 Instalar dependencias
    [ ] 1.1.3 Crear cliente
    [ ] 1.1.4 Crear tablas
    [ ] 1.1.5 Páginas de auth
    [ ] 1.1.6 Componentes de auth
    [ ] 1.1.7 Contexto de usuario
    [ ] 1.1.8 OAuth Google
    [ ] 1.1.9 Middleware
    [ ] 1.1.10 Testing

[ ] TAREA 1.2: Persistencia de Progreso
    [ ] 1.2.1 Tabla de progreso
    [ ] 1.2.2 Tabla de stats
    [ ] 1.2.3 Servicio de progreso
    [ ] 1.2.4 Migrar store
    [ ] 1.2.5 Actualizar página lección
    [ ] 1.2.6 Testing

[ ] TAREA 1.3: Paywall
    [ ] 1.3.1 Lógica de acceso
    [ ] 1.3.2 Componente paywall
    [ ] 1.3.3 Página pricing
    [ ] 1.3.4 Checks de acceso
    [ ] 1.3.5 Indicadores premium
    [ ] 1.3.6 Testing

[ ] TAREA 1.4: Stripe
    [ ] 1.4.1 Configurar cuenta
    [ ] 1.4.2 Crear productos
    [ ] 1.4.3 Instalar dependencias
    [ ] 1.4.4 API routes
    [ ] 1.4.5 Servicio suscripción
    [ ] 1.4.6 Actualizar perfil
    [ ] 1.4.7 Páginas checkout
    [ ] 1.4.8 Integrar botones
    [ ] 1.4.9 Webhook
    [ ] 1.4.10 Testing

[ ] TAREA 1.5: Landing Page
    [ ] 1.5.1 Estructura
    [ ] 1.5.2 Secciones
    [ ] 1.5.3 SEO
    [ ] 1.5.4 Analytics
    [ ] 1.5.5 Responsive
```

---

# 🤖 FASE 2: CONTENIDO IA (Semanas 3-4)

## TAREA 2.1: Pipeline de Generación de Lecciones
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 3 días  
**Impacto:** Escala el contenido infinitamente  
**Dependencias:** Ninguna

### Subtareas:

#### 2.1.1 Crear script de generación
- [ ] `scripts/generate-lesson.ts`:
  - Input: tema, nivel, número de bloques
  - Output: JSON válido según schema
  - Usa Claude API

#### 2.1.2 Crear prompt optimizado
```markdown
# Prompt para generar lección de francés

## Contexto
Eres un experto en enseñanza de francés como lengua extranjera, 
especializado en preparación DELF.

## Tarea
Genera una lección completa sobre: {TEMA}
Nivel: {NIVEL} (A1/A2/B1/B2)
Número de bloques conversacionales: {NUM_BLOQUES}

## Estructura requerida
[Incluir schema JSON completo]

## Reglas
1. Cada bloque debe ser una micro-escena realista
2. Vocabulario apropiado al nivel CEFR
3. Incluir variaciones de registro (formal/informal)
4. Ejercicios deben reflejar formato DELF
5. Traducciones precisas al español

## Output
JSON válido, sin comentarios, sin markdown.
```

#### 2.1.3 Validación automática
- [ ] Validar output contra Zod schema
- [ ] Verificar que audio URLs son placeholders válidos
- [ ] Verificar que cloze words existen en el texto
- [ ] Verificar que hay suficientes opciones

#### 2.1.4 Sistema de revisión
- [ ] Guardar lecciones generadas en `/content/generated/pending/`
- [ ] Script para mover a `/content/fr/` tras revisión
- [ ] Log de lecciones generadas y estado

#### 2.1.5 Batch generation
- [ ] Script para generar múltiples lecciones
- [ ] Rate limiting para API de Claude
- [ ] Manejo de errores y reintentos

**Criterio de completado:** Puedo generar una lección válida con un comando.

---

## TAREA 2.2: Sistema de Audio TTS
**Prioridad:** 🟡 ALTA  
**Tiempo estimado:** 2 días  
**Impacto:** Audio de calidad = experiencia premium  
**Dependencias:** TAREA 2.1

### Subtareas:

#### 2.2.1 Configurar ElevenLabs
- [ ] Crear cuenta en elevenlabs.io
- [ ] Seleccionar voz francesa (recomendado: "Antoine" o "Charlotte")
- [ ] Obtener API key
- [ ] Configurar variable de entorno:
  ```
  ELEVENLABS_API_KEY=
  ```

#### 2.2.2 Crear script de generación de audio
- [ ] `scripts/generate-audio.ts`:
  - Input: texto en francés, ID de frase
  - Output: archivo MP3 en `/public/audio/`
  - Naming convention: `{lesson-id}-{phrase-id}.mp3`

#### 2.2.3 Integrar en pipeline de lección
- [ ] Después de generar JSON, generar audios
- [ ] Actualizar JSON con URLs de audio reales
- [ ] Verificar que todos los audios existen

#### 2.2.4 Optimización de costes
- [ ] Cache de audios ya generados
- [ ] No regenerar si texto no cambió
- [ ] Usar modelo más barato para contenido no crítico

#### 2.2.5 Fallback a Web Speech API
- [ ] Si no hay audio generado, usar TTS del browser
- [ ] Indicador visual de "audio generado por IA"

**Criterio de completado:** Cada frase tiene audio de calidad nativa.

---

## TAREA 2.3: Generar 1 Mundo Completo
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 2 días  
**Impacto:** Contenido suficiente para validar  
**Dependencias:** TAREA 2.1, TAREA 2.2

### Subtareas:

#### 2.3.1 Definir mundo a generar
- [ ] Mundo: "Identidad & Supervivencia Social" (world-1)
- [ ] 5 lecciones:
  1. Saludos y cortesía ✅ (ya existe)
  2. Presentarse
  3. Números y edad
  4. Nacionalidades y países
  5. Profesiones

#### 2.3.2 Generar lecciones
- [ ] Lección 2: Presentarse
  - 8 bloques conversacionales
  - Ejercicios Pragma Strike, Shard Detection
  - Vocabulario visual
- [ ] Lección 3: Números y edad
- [ ] Lección 4: Nacionalidades
- [ ] Lección 5: Profesiones

#### 2.3.3 Generar audios para todas las lecciones
- [ ] ~100 frases × 5 lecciones = ~500 audios
- [ ] Tiempo estimado: 2-3 horas de generación
- [ ] Coste estimado: ~€20-30 en ElevenLabs

#### 2.3.4 Revisión humana
- [ ] Verificar naturalidad de diálogos
- [ ] Corregir errores gramaticales
- [ ] Ajustar dificultad si necesario
- [ ] Verificar traducciones

#### 2.3.5 Testing end-to-end
- [ ] Completar mundo entero como usuario
- [ ] Verificar que todo funciona
- [ ] Medir tiempo de completado (~2-3 horas)

**Criterio de completado:** Usuario puede completar 5 lecciones del mundo 1.

---

## ✅ CHECKLIST FASE 2

```
[ ] TAREA 2.1: Pipeline IA
    [ ] 2.1.1 Script de generación
    [ ] 2.1.2 Prompt optimizado
    [ ] 2.1.3 Validación automática
    [ ] 2.1.4 Sistema de revisión
    [ ] 2.1.5 Batch generation

[ ] TAREA 2.2: Audio TTS
    [ ] 2.2.1 Configurar ElevenLabs
    [ ] 2.2.2 Script de audio
    [ ] 2.2.3 Integrar en pipeline
    [ ] 2.2.4 Optimización costes
    [ ] 2.2.5 Fallback

[ ] TAREA 2.3: Mundo Completo
    [ ] 2.3.1 Definir mundo
    [ ] 2.3.2 Generar lecciones
    [ ] 2.3.3 Generar audios
    [ ] 2.3.4 Revisión humana
    [ ] 2.3.5 Testing
```

---

# 📊 FASE 3: VALIDACIÓN (Semanas 5-8)

## TAREA 3.1: Beta Cerrada
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** Ongoing  
**Budget:** €0  
**Dependencias:** FASE 1, FASE 2

### Subtareas:

#### 3.1.1 Reclutar beta testers
- [ ] Post en Reddit r/learnfrench, r/French
- [ ] Post en grupos de Facebook de aprendizaje de francés
- [ ] Post en Discord de idiomas
- [ ] Email a conocidos que aprenden francés
- [ ] **Target: 100 usuarios**

#### 3.1.2 Crear sistema de feedback
- [ ] Formulario de feedback in-app (Typeform/Google Forms)
- [ ] Canal de Discord/Telegram para beta testers
- [ ] Entrevistas 1:1 con 10 usuarios activos

#### 3.1.3 Métricas a trackear
- [ ] Registros por día
- [ ] Activación (completa lección 1)
- [ ] Retención D1, D7, D30
- [ ] Lecciones completadas por usuario
- [ ] Intentos de acceso a contenido premium
- [ ] Conversión a pago (aunque sea bajo)

#### 3.1.4 Iterar basado en feedback
- [ ] Bugs críticos → fix inmediato
- [ ] UX confusa → mejorar
- [ ] Features pedidas → evaluar

**Criterio de completado:** 100 usuarios activos, datos de retención.

---

## TAREA 3.2: Ads Facebook/Instagram
**Prioridad:** 🟡 ALTA  
**Tiempo estimado:** Ongoing  
**Budget:** €500  
**Dependencias:** Landing page, Tracking

### Subtareas:

#### 3.2.1 Configurar Business Manager
- [ ] Crear cuenta de Business Manager
- [ ] Verificar dominio
- [ ] Configurar Pixel de Facebook
- [ ] Crear audiencias personalizadas

#### 3.2.2 Crear creativos
- [ ] 3-5 imágenes estáticas
- [ ] 2-3 videos cortos (15-30s)
- [ ] Copy variations (3-5 por ad)

#### 3.2.3 Configurar campañas
- [ ] Campaña 1: Conversiones (registro)
  - Audiencia: Interesados en francés, DELF, viajes a Francia
  - Edad: 25-45
  - Budget: €200
  
- [ ] Campaña 2: Retargeting
  - Audiencia: Visitantes de landing que no registraron
  - Budget: €100

#### 3.2.4 Optimizar
- [ ] A/B test de creativos
- [ ] A/B test de audiencias
- [ ] Pausar ads con CPA > €5
- [ ] Escalar ads con CPA < €3

**Criterio de completado:** CAC < €5, 100+ registros de ads.

---

## TAREA 3.3: Ads Google
**Prioridad:** 🟡 ALTA  
**Tiempo estimado:** Ongoing  
**Budget:** €500  
**Dependencias:** Landing page, Tracking

### Subtareas:

#### 3.3.1 Configurar Google Ads
- [ ] Crear cuenta
- [ ] Configurar conversiones
- [ ] Vincular con Analytics

#### 3.3.2 Keyword research
- [ ] "preparación DELF"
- [ ] "examen DELF online"
- [ ] "aprender francés DELF"
- [ ] "curso francés A1"
- [ ] Long tail keywords

#### 3.3.3 Crear campañas
- [ ] Campaña Search: Keywords de intención alta
  - Budget: €300
  - Bid strategy: Maximize conversions
  
- [ ] Campaña Display: Retargeting
  - Budget: €100

#### 3.3.4 Optimizar
- [ ] Añadir negative keywords
- [ ] Mejorar Quality Score
- [ ] A/B test de landing pages

**Criterio de completado:** CAC < €5, 100+ registros de ads.

---

## TAREA 3.4: Medir Conversión a Pago
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** Semana 8  
**Budget:** €0  
**Dependencias:** Todo lo anterior

### Subtareas:

#### 3.4.1 Dashboard de métricas
- [ ] Crear dashboard en Supabase o Metabase
- [ ] Métricas clave:
  - Total usuarios
  - Usuarios activos (últimos 7 días)
  - Tasa de activación
  - Tasa de retención D7
  - Intentos de paywall
  - Conversión a pago
  - MRR

#### 3.4.2 Análisis de cohortes
- [ ] Cohorte por semana de registro
- [ ] Retención por cohorte
- [ ] Conversión por cohorte

#### 3.4.3 Decisión GO/NO-GO
**GO si:**
- Conversión a pago > 3%
- Retención D7 > 30%
- CAC < €10
- NPS > 30

**NO-GO si:**
- Conversión < 1%
- Retención D7 < 15%
- CAC > €20
- Feedback negativo consistente

**Criterio de completado:** Decisión clara de escalar o pivotar.

---

## ✅ CHECKLIST FASE 3

```
[ ] TAREA 3.1: Beta Cerrada
    [ ] 3.1.1 Reclutar testers
    [ ] 3.1.2 Sistema feedback
    [ ] 3.1.3 Métricas
    [ ] 3.1.4 Iterar

[ ] TAREA 3.2: Ads Facebook
    [ ] 3.2.1 Business Manager
    [ ] 3.2.2 Creativos
    [ ] 3.2.3 Campañas
    [ ] 3.2.4 Optimizar

[ ] TAREA 3.3: Ads Google
    [ ] 3.3.1 Google Ads
    [ ] 3.3.2 Keywords
    [ ] 3.3.3 Campañas
    [ ] 3.3.4 Optimizar

[ ] TAREA 3.4: Medir Conversión
    [ ] 3.4.1 Dashboard
    [ ] 3.4.2 Cohortes
    [ ] 3.4.3 Decisión GO/NO-GO
```

---

# 📈 MÉTRICAS DE ÉXITO

| Métrica | Semana 2 | Semana 4 | Semana 8 |
|---------|----------|----------|----------|
| Usuarios registrados | 10 (test) | 50 | 500+ |
| Activación (L1 completada) | - | 70%+ | 60%+ |
| Retención D7 | - | - | 30%+ |
| Conversión a pago | - | - | 3%+ |
| MRR | €0 | €0 | €150+ |
| CAC | - | - | < €10 |

---

# 🚨 SEÑALES DE ALERTA

| Señal | Acción |
|-------|--------|
| < 50 registros en semana 4 | Revisar landing y propuesta |
| < 20% activación | Revisar onboarding |
| < 15% retención D7 | Revisar contenido y engagement |
| < 1% conversión | Revisar pricing y paywall |
| CAC > €15 | Pausar ads, optimizar funnel |
| Feedback negativo consistente | Pivotar o matar |

---

# ⏭️ SIGUIENTE PASO

**¿Por dónde empezamos?**

Recomiendo: **TAREA 1.1 - Auth con Supabase**

Es el bloqueador #1. Sin usuarios identificados, nada más tiene sentido.

¿Empiezo a implementar?

