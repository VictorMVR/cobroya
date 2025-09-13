const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runMigrations() {
  console.log('🚀 Ejecutando migraciones...')
  
  try {
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()
    
    for (const file of migrationFiles) {
      console.log(`📄 Ejecutando: ${file}`)
      
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      const statements = sqlContent.split(';').filter(stmt => stmt.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() })
          
          if (error && !error.message.includes('already exists')) {
            console.error(`❌ Error en ${file}:`, error.message)
            console.log('📝 Statement:', statement.trim())
          }
        }
      }
      
      console.log(`✅ ${file} completado`)
    }
    
    console.log('🎉 Todas las migraciones completadas!')
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error.message)
  }
}

runMigrations()