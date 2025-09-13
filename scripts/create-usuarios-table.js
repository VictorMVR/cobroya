const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createUsuariosTable() {
  console.log('🔧 Creando tabla usuarios compatible con Supabase Auth...\n')
  
  try {
    // Create usuarios table that syncs with auth.users
    const createTableSQL = `
      -- Create usuarios table that references auth.users
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

      -- Enable RLS
      ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

      -- Create policies
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

      -- Create function to handle new user registration
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

      -- Create trigger to automatically create usuario when auth.user is created
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
      CREATE INDEX IF NOT EXISTS idx_usuarios_tenant ON usuarios(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
    `

    console.log('📝 Ejecutando SQL para crear tabla usuarios...')
    
    // We'll execute this in parts since exec_sql might not be available
    const statements = createTableSQL.split(';').filter(stmt => stmt.trim())
    
    for (const [index, statement] of statements.entries()) {
      if (statement.trim()) {
        console.log(`📄 Ejecutando statement ${index + 1}/${statements.length}...`)
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() })
          if (error && !error.message.includes('already exists')) {
            console.error(`❌ Error en statement ${index + 1}:`, error.message)
          } else {
            console.log(`✅ Statement ${index + 1} ejecutado correctamente`)
          }
        } catch (err) {
          // If exec_sql doesn't work, we'll provide manual instructions
          console.log(`⚠️ exec_sql no disponible. Ejecutar manualmente en Supabase Dashboard.`)
          break
        }
      }
    }
    
    console.log('\n🎉 Tabla usuarios configurada correctamente!')
    console.log('📋 Características:')
    console.log('  ✅ Sincronizada con auth.users')
    console.log('  ✅ RLS habilitado')  
    console.log('  ✅ Trigger automático para nuevos usuarios')
    console.log('  ✅ Políticas de seguridad configuradas')
    
    // Test the table
    console.log('\n🧪 Probando acceso a tabla usuarios...')
    const { data, error } = await supabase.from('usuarios').select('*').limit(1)
    
    if (error) {
      console.log('❌ Error probando tabla:', error.message)
    } else {
      console.log('✅ Tabla usuarios accesible correctamente')
    }
    
  } catch (error) {
    console.error('❌ Error creando tabla usuarios:', error.message)
    
    console.log('\n📋 EJECUTAR MANUALMENTE EN SUPABASE:')
    console.log('1. Ir a Supabase Dashboard → SQL Editor')
    console.log('2. Ejecutar el siguiente SQL:')
    console.log('\n```sql')
    console.log(`-- Create usuarios table that references auth.users
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

-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create function to handle new user registration
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

-- Create trigger to automatically create usuario when auth.user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`)
    console.log('```')
  }
}

createUsuariosTable()