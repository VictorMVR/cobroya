const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://diypvjjafabzoumenowt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXB2amphZmFiem91bWVub3d0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU2NDQ0OSwiZXhwIjoyMDczMTQwNDQ5fQ.tyiyd9CNNshorwAwAIDgBTuoKxEosJ6owJsOC7rHW_8'

async function addAplicaIvaField() {
  console.log('Updating productos to add aplica_iva field...')
  
  // First, let's check if the field already exists by trying to update a product
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get the first product to test if aplica_iva exists
    const { data: productos, error: getError } = await supabase
      .from('productos')
      .select('id, aplica_iva')
      .limit(1)
    
    if (getError && getError.message.includes('aplica_iva')) {
      console.log('Field aplica_iva does not exist, creating it via update...')
      
      // Try to add the field by updating all products with a default value
      const { error: updateError } = await supabase
        .from('productos')
        .update({ aplica_iva: true })
        .not('id', 'is', null)
      
      if (updateError) {
        console.error('Failed to add field via update:', updateError)
      } else {
        console.log('Successfully added aplica_iva field!')
      }
    } else {
      console.log('Field aplica_iva already exists:', productos)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addAplicaIvaField()