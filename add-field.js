const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addAplicaIvaField() {
  console.log('🔧 Agregando campo aplica_iva a la tabla productos...')
  
  try {
    // Usar la REST API directamente para ejecutar el DDL
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pgrst.object+json'
      },
      body: JSON.stringify({
        query: 'ALTER TABLE productos ADD COLUMN aplica_iva BOOLEAN DEFAULT true'
      })
    })
    
    if (response.ok) {
      console.log('✅ Campo aplica_iva agregado exitosamente!')
    } else {
      console.log('❌ Error al agregar campo:', await response.text())
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

addAplicaIvaField()