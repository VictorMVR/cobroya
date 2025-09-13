const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function investigateAuthIssue() {
  console.log('🔍 Investigando problema de autenticación...\n')
  
  try {
    // 1. Check if usuarios table really exists
    console.log('1️⃣ Verificando tabla usuarios...')
    const { data: usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1)
    
    if (usuariosError) {
      console.log('❌ Tabla usuarios NO es accesible:', usuariosError.message)
    } else {
      console.log('✅ Tabla usuarios es accesible, registros:', usuariosData?.length || 0)
    }
    
    // 2. Check for triggers that might be causing issues
    console.log('\n2️⃣ Verificando triggers automáticos...')
    const { data: triggers, error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          trigger_name,
          event_manipulation,
          event_object_table,
          event_object_schema,
          action_statement
        FROM information_schema.triggers 
        WHERE event_object_schema = 'auth' OR trigger_name LIKE '%user%'
        ORDER BY trigger_name;
      `
    })
    
    if (triggerError && !triggerError.message.includes('exec_sql')) {
      console.log('❌ Error verificando triggers:', triggerError.message)
    } else if (triggers && triggers.length > 0) {
      console.log('📋 Triggers encontrados:')
      triggers.forEach(trigger => {
        console.log(`  - ${trigger.trigger_name} en ${trigger.event_object_schema}.${trigger.event_object_table}`)
      })
    } else {
      console.log('✅ No se encontraron triggers problemáticos')
    }
    
    // 3. Check functions that might be causing issues  
    console.log('\n3️⃣ Verificando funciones automáticas...')
    const { data: functions, error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          routine_name,
          routine_type,
          routine_schema
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name LIKE '%user%'
        ORDER BY routine_name;
      `
    })
    
    if (functionError && !functionError.message.includes('exec_sql')) {
      console.log('❌ Error verificando funciones:', functionError.message)
    } else if (functions && functions.length > 0) {
      console.log('📋 Funciones relacionadas con usuarios:')
      functions.forEach(func => {
        console.log(`  - ${func.routine_name} (${func.routine_type})`)
      })
    } else {
      console.log('✅ No se encontraron funciones problemáticas')
    }
    
    // 4. Try to check auth.users directly
    console.log('\n4️⃣ Verificando auth.users...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.log('❌ Error accediendo auth.users:', authError.message)
    } else {
      console.log(`✅ auth.users accesible, usuarios: ${authUsers.users?.length || 0}`)
      if (authUsers.users && authUsers.users.length > 0) {
        console.log('📧 Usuarios registrados:')
        authUsers.users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.created_at})`)
        })
      }
    }
    
    // 5. Check table permissions
    console.log('\n5️⃣ Verificando permisos de tabla...')
    const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, tableowner, hasindexes, hasrules, hastriggers
        FROM pg_tables 
        WHERE tablename = 'usuarios';
      `
    })
    
    if (!tableError && tableInfo) {
      console.log('📊 Información de tabla usuarios:', tableInfo)
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
  }
}

investigateAuthIssue()