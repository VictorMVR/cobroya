const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupSuperAdmin() {
  console.log('🚀 Configurando Super Admin...')
  
  try {
    // Check if super admin user exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      return
    }
    
    const superAdminEmail = 'verdugorubio@gmail.com'
    console.log('📋 Users found:', users.users.length)
    console.log('📧 Looking for:', superAdminEmail)
    users.users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}: ${user.email}`)
    })
    const existingUser = users.users.find(user => user.email === superAdminEmail)
    
    if (existingUser) {
      console.log('👤 Super admin user found:', existingUser.email)
      
      // Update user metadata to ensure super admin role
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: {
            ...existingUser.user_metadata,
            rol: 'SUPER_ADMIN',
            nombre_completo: existingUser.user_metadata?.nombre_completo || 'Victor Verdugo',
            is_super_admin: true
          }
        }
      )
      
      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError.message)
        return
      }
      
      console.log('✅ Super admin metadata updated successfully!')
      console.log('📋 User metadata:', updatedUser.user.user_metadata)
      
    } else {
      console.log('⚠️ Super admin user not found. User needs to sign up first.')
      console.log('💡 The user should visit /login and sign up with Google using verdugorubio@gmail.com')
    }
    
    // Check/create master tenant
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .eq('nombre', 'Master Admin')
    
    if (tenantsError) {
      console.error('❌ Error checking tenants:', tenantsError.message)
      return
    }
    
    let masterTenant
    if (tenants.length === 0) {
      // Create master tenant for super admin
      const { data: newTenant, error: createError } = await supabase
        .from('tenants')
        .insert([{
          nombre: 'Master Admin',
          activo: true
        }])
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Error creating master tenant:', createError.message)
        return
      }
      
      masterTenant = newTenant
      console.log('✅ Master tenant created:', masterTenant.id)
    } else {
      masterTenant = tenants[0]
      console.log('✅ Master tenant exists:', masterTenant.id)
    }
    
    // If user exists, update metadata with tenant
    if (existingUser) {
      const { error: finalUpdateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: {
            ...existingUser.user_metadata,
            rol: 'SUPER_ADMIN',
            tenant_id: masterTenant.id,
            nombre_completo: existingUser.user_metadata?.nombre_completo || 'Victor Verdugo',
            is_super_admin: true
          }
        }
      )
      
      if (finalUpdateError) {
        console.error('❌ Error final update:', finalUpdateError.message)
        return
      }
      
      console.log('✅ Super admin setup complete!')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

setupSuperAdmin()