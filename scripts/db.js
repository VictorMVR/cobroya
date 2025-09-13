#!/usr/bin/env node

/**
 * 🚀 SCRIPT UNIVERSAL DE BASE DE DATOS
 * 
 * USO:
 * node scripts/db.js                    - Lista todas las tablas
 * node scripts/db.js productos          - Estructura de productos
 * node scripts/db.js productos --data   - Estructura + datos
 * node scripts/db.js --query "SELECT..."- Ejecuta query directo
 * node scripts/db.js --sync-types       - Regenera tipos TypeScript
 */

const { createClient } = require('@supabase/supabase-js')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.local' })

// Configuración
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const TABLES = [
  'categorias', 'clientes', 'compras', 'cuentas', 'detalle_compra',
  'estatus_compra', 'productos', 'proveedores', 'sucursales',
  'tenants', 'usuarios', 'venta_detalle', 'ventas'
]

// Funciones principales
async function listTables() {
  console.log('🚀 CobroYa - Base de Datos')
  console.log('━'.repeat(50))
  console.log('📊 Tablas disponibles:\n')
  
  TABLES.forEach((table, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${table}`)
  })
  
  console.log('\n💡 Uso:')
  console.log('  npm run db productos          - Ver estructura')
  console.log('  npm run db productos --data   - Ver estructura + datos')
  console.log('  npm run db --query "SELECT..."- Ejecutar SQL')
  console.log('  npm run db:sync               - Regenerar tipos')
}

async function showTable(tableName, showData = false) {
  if (!TABLES.includes(tableName)) {
    console.log(`❌ Tabla "${tableName}" no existe.`)
    console.log('📊 Tablas disponibles:', TABLES.join(', '))
    return
  }

  console.log(`🔍 Tabla: ${tableName}`)
  console.log('━'.repeat(50))

  try {
    // Obtener datos para inferir estructura
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(showData ? 5 : 1)

    if (error) {
      console.log(`❌ Error: ${error.message}`)
      return
    }

    console.log(`📊 Total de registros: ${count || 0}`)

    if (!data || data.length === 0) {
      console.log('⚠️  Tabla vacía')
      await showSchemaFromTypes(tableName)
      return
    }

    // Mostrar estructura
    const sample = data[0]
    const fields = Object.keys(sample)
    
    console.log(`\n📋 Campos (${fields.length}):`)
    fields.forEach(field => {
      const value = sample[field]
      const type = value === null ? 'null' : typeof value
      const nullable = fields.some(f => data.some(row => row[f] === null)) ? '?' : ''
      console.log(`  • ${field}${nullable}: ${type}`)
    })

    if (showData && data.length > 0) {
      console.log(`\n📄 Datos (primeros ${data.length}):`);
      console.table(data.map(row => {
        const formatted = {}
        Object.keys(row).forEach(key => {
          let value = row[key]
          if (typeof value === 'string' && value.length > 30) {
            value = value.substring(0, 30) + '...'
          }
          formatted[key] = value
        })
        return formatted
      }))
    }

  } catch (err) {
    console.log(`❌ Error: ${err.message}`)
  }
}

async function showSchemaFromTypes(tableName) {
  try {
    const typesPath = path.join(__dirname, '../types/supabase.ts')
    if (!fs.existsSync(typesPath)) {
      console.log('⚠️  Archivo de tipos no encontrado. Ejecuta: npm run db:sync')
      return
    }

    const typesContent = fs.readFileSync(typesPath, 'utf8')
    const regex = new RegExp(`${tableName}:\\s*{[^}]*Row:\\s*{([^}]+)}`, 's')
    const match = typesContent.match(regex)
    
    if (match) {
      console.log('\n📋 Campos (desde esquema):')
      const fields = match[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && line.includes(':') && !line.includes('//'))
        .map(line => {
          const parts = line.split(':')
          const name = parts[0].trim()
          const type = parts[1].replace(/[,]/g, '').trim()
          return `  • ${name}: ${type}`
        })
      
      fields.forEach(field => console.log(field))
    }
  } catch (e) {
    console.log('⚠️  No se pudo leer el esquema')
  }
}

async function executeQuery(query) {
  console.log('🔍 Ejecutando consulta SQL...')
  console.log('━'.repeat(50))
  console.log(`📝 Query: ${query}\n`)

  try {
    // Para queries simples usando el cliente de Supabase
    const queryLower = query.toLowerCase().trim()
    if (queryLower.startsWith('select') || 
        queryLower.startsWith('alter table') ||
        queryLower.startsWith('update') ||
        queryLower.startsWith('insert') ||
        queryLower.startsWith('delete')) {
      // Para ALTER TABLE usar el método directo
      let data, error
      if (queryLower.startsWith('alter table')) {
        try {
          // Ejecutar usando SQL directo via REST API
          const sqlResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/sql`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/sql'
            },
            body: query
          })
          
          if (sqlResponse.ok) {
            console.log('✅ Query ejecutada exitosamente!')
            console.log('(ALTER TABLE completado)')
            return
          } else {
            error = { message: `SQL Error: ${await sqlResponse.text()}` }
          }
        } catch (err) {
          error = { message: err.message }
        }
      } else {
        const result = await supabase.rpc('exec_sql', { sql: query })
        data = result.data
        error = result.error
      }
      
      if (error) {
        console.log(`❌ Error: ${error.message}`)
        return
      }
      
      console.log('✅ Resultado:')
      if (data && data.length > 0) {
        console.table(data)
      } else {
        console.log('(Sin resultados)')
      }
    } else {
      console.log('⚠️  Solo se permiten consultas SELECT por seguridad')
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`)
  }
}

function syncTypes() {
  console.log('🔄 Sincronizando tipos de TypeScript...')
  console.log('━'.repeat(50))

  try {
    execSync('supabase gen types typescript --linked > types/supabase.ts', { 
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    })
    console.log('✅ Tipos sincronizados exitosamente')
    console.log('📁 Archivo actualizado: types/supabase.ts')
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
    console.log('💡 Asegúrate de estar logueado: supabase login')
  }
}

async function testConnection() {
  try {
    const { error } = await supabase
      .from('productos')
      .select('count', { count: 'exact', head: true })
    
    if (error) throw error
    return true
  } catch (err) {
    console.log('❌ Error de conexión:', err.message)
    console.log('💡 Verifica tu archivo .env.local')
    return false
  }
}

// Main
async function main() {
  const args = process.argv.slice(2)
  
  // Test conexión primero
  const connected = await testConnection()
  if (!connected) process.exit(1)

  if (args.length === 0) {
    // Sin argumentos: mostrar tablas
    await listTables()
    
  } else if (args[0] === '--sync-types') {
    // Sincronizar tipos
    syncTypes()
    
  } else if (args[0] === '--query' && args[1]) {
    // Ejecutar query
    await executeQuery(args[1])
    
  } else if (TABLES.includes(args[0])) {
    // Mostrar tabla específica
    const showData = args.includes('--data')
    await showTable(args[0], showData)
    
  } else {
    console.log('❌ Uso incorrecto')
    console.log('💡 Ejemplos:')
    console.log('  npm run db')
    console.log('  npm run db productos')
    console.log('  npm run db productos --data')
    console.log('  npm run db --query "SELECT * FROM productos LIMIT 3"')
    console.log('  npm run db:sync')
  }

  console.log('\n✨ Listo!')
}

// Manejar errores
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no controlado:', error.message)
  process.exit(1)
})

main().catch(console.error)