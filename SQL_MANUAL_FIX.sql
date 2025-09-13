-- 🚨 EJECUTAR ESTO EN SUPABASE DASHBOARD → SQL EDITOR
-- Esto corrige el error "Database error saving new user"

-- 1. Crear tabla usuarios que se sincronice con auth.users
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  nombre_completo TEXT,
  rol TEXT DEFAULT 'ADMIN',
  tenant_id UUID REFERENCES public.tenants(id),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas de seguridad
CREATE POLICY "Super admin can manage all users" ON usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'verdugorubio@gmail.com'
    )
  );

CREATE POLICY "Users can see their own profile" ON usuarios 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON usuarios 
  FOR UPDATE USING (auth.uid() = id);

-- 4. Función para manejar nuevos usuarios automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre_completo)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'nombre_completo', new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger que se ejecuta cuando se crea un usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);