# Configuración de Supabase para LinguaForge

## Paso 1: Crear cuenta y proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto llamado "linguaforge-prod"
3. Espera a que el proyecto se inicialice (2-3 minutos)

## Paso 2: Obtener credenciales

1. En el Dashboard de Supabase, ve a **Settings** > **API**
2. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (mantener secreto)

## Paso 3: Configurar variables de entorno

1. Crea un archivo `.env.local` en la raíz del proyecto (copia de `.env.local.example`)
2. Añade las credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

## Paso 4: Crear tablas en Supabase

1. En el Dashboard de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase/schema.sql` de este proyecto
3. Copia y pega todo el contenido en el SQL Editor
4. Haz clic en **Run** para ejecutar el script
5. Verifica que las tablas se crearon correctamente en **Table Editor**

## Paso 5: Configurar OAuth Google (Opcional pero recomendado)

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth 2.0 Client ID**
5. Configura:
   - Application type: Web application
   - Authorized redirect URIs: `https://tu-proyecto.supabase.co/auth/v1/callback`
6. Copia el **Client ID** y **Client Secret**
7. En Supabase Dashboard, ve a **Authentication** > **Providers** > **Google**
8. Habilita Google provider y pega las credenciales
9. Guarda los cambios

## Paso 6: Instalar dependencias

```bash
npm install @supabase/ssr@latest
```

## Paso 7: Verificar instalación

1. Inicia el servidor de desarrollo: `npm run dev`
2. Ve a `http://localhost:3000/auth/login`
3. Deberías ver el formulario de login
4. Intenta registrarte con un email de prueba

## Notas importantes

- **NUNCA** commitees el archivo `.env.local` al repositorio
- El `SUPABASE_SERVICE_ROLE_KEY` solo debe usarse en el servidor (API routes)
- Las políticas RLS (Row Level Security) están configuradas para que los usuarios solo puedan ver/modificar sus propios datos

## Troubleshooting

### Error: "Supabase URL or Anon Key is missing"
- Verifica que `.env.local` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo después de crear `.env.local`

### Error: "relation does not exist"
- Ejecuta el script SQL en Supabase Dashboard
- Verifica que las tablas se crearon en **Table Editor**

### OAuth Google no funciona
- Verifica que el redirect URI en Google Cloud Console coincide exactamente con el de Supabase
- Asegúrate de que Google provider está habilitado en Supabase Dashboard

