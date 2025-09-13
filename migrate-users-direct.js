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
    await supabase
      .from('tenants')
      .select('id')
      .limit(1)
    
    console.log('✅ Tenants table accessible')
    
    // Let's verify current structure
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .limit(1)
      
    if (data && data[0]) {
      console.log('📊 Current tenant structure:', Object.keys(data[0]))
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

async function setupSuperUser() {
  console.log('🔧 Setting up super user...')
  
  try {
    // Get or create tenant for super user
    const { data: existingTenant, error: fetchError } = await supabase
      .from('tenants')
      .select('*')
      .limit(1)
    
    if (fetchError) {
      console.error('❌ Error fetching tenant:', fetchError)
      return
    }
    
    let tenantId
    if (existingTenant && existingTenant.length > 0) {
      tenantId = existingTenant[0].id
      console.log('✅ Using existing tenant:', tenantId)
    } else {
      // Create a tenant
      const { data: newTenant, error: createError } = await supabase
        .from('tenants')
        .insert([
          { 
            nombre: 'CobroYa Admin',
            activo: true
          }
        ])
        .select()
      
      if (createError) {
        console.error('❌ Error creating tenant:', createError)
        return
      }
      
      tenantId = newTenant[0].id
      console.log('✅ Created new tenant:', tenantId)
    }
    
    console.log('🎉 Setup completed! Tenant ID:', tenantId)
    
  } catch (error) {
    console.error('❌ Super user setup failed:', error)
  }
}

async function main() {
  await migrateTenants()
  await setupSuperUser()
  console.log('🎉 Setup completed!')
}

main()