const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addAplicaIvaField() {
  console.log('🔧 Agregando campo aplica_iva...')
  
  try {
    // Método directo: actualizar un producto agregando el campo
    const { data: productos } = await supabase
      .from('productos')
      .select('id')
      .limit(1)
    
    if (productos && productos.length > 0) {
      const productId = productos[0].id
      
      // Intentar actualizar con el campo nuevo
      const { error } = await supabase
        .from('productos')
        .update({ aplica_iva: true })
        .eq('id', productId)
      
      if (error) {
        console.log('❌ El campo no existe, necesita ser agregado manualmente en Supabase Dashboard')
        console.log('Error:', error.message)
      } else {
        console.log('✅ Campo aplica_iva agregado exitosamente!')
        
        // Actualizar todos los productos para que tengan aplica_iva = true
        const { error: updateAllError } = await supabase
          .from('productos')
          .update({ aplica_iva: true })
          .neq('id', '00000000-0000-0000-0000-000000000000') // Update all
        
        if (!updateAllError) {
          console.log('✅ Todos los productos actualizados con aplica_iva = true')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

addAplicaIvaField()