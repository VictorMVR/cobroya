const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupRLS() {
  console.log('🔒 Configurando Row Level Security...')
  
  const policies = [
    // Helper functions
    `
    CREATE OR REPLACE FUNCTION auth.get_user_tenant_id()
    RETURNS uuid
    LANGUAGE SQL
    SECURITY DEFINER
    AS $$
      SELECT COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid,
        NULL
      );
    $$;
    `,
    
    `
    CREATE OR REPLACE FUNCTION auth.is_super_admin()
    RETURNS boolean
    LANGUAGE SQL
    SECURITY DEFINER
    AS $$
      SELECT COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean,
        auth.email() = 'verdugorubio@gmail.com'
      );
    $$;
    `,
    
    // Enable RLS
    'ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE productos ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE venta_detalle ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE cuentas ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;',
    
    // Drop existing policies if they exist
    'DROP POLICY IF EXISTS "Super admin can see all tenants" ON tenants;',
    'DROP POLICY IF EXISTS "Users can see their own tenant" ON tenants;',
    'DROP POLICY IF EXISTS "Authenticated users can create tenants" ON tenants;',
    
    // Tenants policies
    `CREATE POLICY "Super admin can see all tenants" ON tenants
      FOR ALL USING (auth.is_super_admin());`,
      
    `CREATE POLICY "Users can see their own tenant" ON tenants
      FOR SELECT USING (id = auth.get_user_tenant_id());`,
      
    `CREATE POLICY "Authenticated users can create tenants" ON tenants
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');`,
    
    // Products policies
    'DROP POLICY IF EXISTS "Super admin can manage all products" ON productos;',
    'DROP POLICY IF EXISTS "Users can manage products in their tenant" ON productos;',
    
    `CREATE POLICY "Super admin can manage all products" ON productos
      FOR ALL USING (auth.is_super_admin());`,
      
    `CREATE POLICY "Users can manage products in their tenant" ON productos
      FOR ALL USING (tenant_id = auth.get_user_tenant_id());`,
    
    // Categorias policies  
    'DROP POLICY IF EXISTS "Super admin can manage all categories" ON categorias;',
    'DROP POLICY IF EXISTS "Users can manage categories in their tenant" ON categorias;',
    
    `CREATE POLICY "Super admin can manage all categories" ON categorias
      FOR ALL USING (auth.is_super_admin());`,
      
    `CREATE POLICY "Users can manage categories in their tenant" ON categorias
      FOR ALL USING (tenant_id = auth.get_user_tenant_id());`,
    
    // Clientes policies
    'DROP POLICY IF EXISTS "Super admin can manage all clients" ON clientes;',
    'DROP POLICY IF EXISTS "Users can manage clients in their tenant" ON clientes;',
    
    `CREATE POLICY "Super admin can manage all clients" ON clientes
      FOR ALL USING (auth.is_super_admin());`,
      
    `CREATE POLICY "Users can manage clients in their tenant" ON clientes
      FOR ALL USING (tenant_id = auth.get_user_tenant_id());`
  ]
  
  try {
    for (const [index, policy] of policies.entries()) {
      console.log(`📝 Ejecutando policy ${index + 1}/${policies.length}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      
      if (error) {
        console.error(`❌ Error en policy ${index + 1}:`, error.message)
        console.log('📄 SQL:', policy.substring(0, 100) + '...')
      } else {
        console.log(`✅ Policy ${index + 1} ejecutada correctamente`)
      }
    }
    
    console.log('🎉 RLS configurado correctamente!')
    
  } catch (error) {
    console.error('❌ Error configurando RLS:', error.message)
  }
}

setupRLS()