-- ============================================================
-- SUPABASE SCHEMA PARA LINGUAFORGE
-- ============================================================
-- Ejecutar este script en el SQL Editor de Supabase Dashboard
-- ============================================================

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free', -- free, premium, cancelled
  subscription_id TEXT,
  stripe_customer_id TEXT,
  subscription_period_end TIMESTAMP WITH TIME ZONE,
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

-- Eliminar trigger si existe y crear nuevo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS policies para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- TABLA DE PROGRESO POR LECCIÓN
-- ============================================================

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL, -- ej: "leaf-1-1-greetings" o "nodo-0-1-saludos"
  world_id TEXT, -- ej: "world-1-identity" (opcional para ÁREA 0)
  
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
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_world ON lesson_progress(world_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress(status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);

-- RLS para lesson_progress
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON lesson_progress;
CREATE POLICY "Users can view own progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON lesson_progress;
CREATE POLICY "Users can insert own progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON lesson_progress;
CREATE POLICY "Users can update own progress"
  ON lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- TABLA DE STATS GLOBALES DEL USUARIO
-- ============================================================

CREATE TABLE IF NOT EXISTS user_stats (
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
  gems INTEGER DEFAULT 0,
  
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

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- RLS para user_stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

