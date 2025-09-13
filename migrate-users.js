const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateTenants() {
  console.log('🚀 Migrating tenants table...')
  
  try {
    // Add propietario_email column
    const { error: error1 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE tenants ADD COLUMN IF NOT EXISTS propietario_email VARCHAR(255);'
    })
    
    // Add plan column  
    const { error: error2 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT \'gratuito\';'
    })
    
    // Add limite_cajeros column
    const { error: error3 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE tenants ADD COLUMN IF NOT EXISTS limite_cajeros INT DEFAULT 2;'
    })

    if (error1 || error2 || error3) {
      console.error('❌ Error:', error1 || error2 || error3)
      return
    }

    console.log('✅ Tenants table updated successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

async function createInvitationsTable() {
  console.log('🚀 Creating invitaciones table...')
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS invitaciones (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      rol VARCHAR(50) DEFAULT 'CAJERO',
      invitado_por_email VARCHAR(255) NOT NULL,
      usado BOOLEAN DEFAULT false,
      expira_en TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `
  
  try {
    const { error } = await supabase.rpc('sql', {
      query: createTableSQL
    })

    if (error) {
      console.error('❌ Error creating table:', error)
      return
    }

    console.log('✅ Invitaciones table created successfully!')
    
  } catch (error) {
    console.error('❌ Table creation failed:', error)
  }
}

async function main() {
  await migrateTenants()
  await createInvitationsTable()
  console.log('🎉 Migration completed!')
}

main()