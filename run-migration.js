const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://diypvjjafabzoumenowt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXB2amphZmFiem91bWVub3d0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU2NDQ0OSwiZXhwIjoyMDczMTQwNDQ5fQ.tyiyd9CNNshorwAwAIDgBTuoKxEosJ6owJsOC7rHW_8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  try {
    console.log('Adding aplica_iva field to productos table...')
    
    const { data, error } = await supabase.rpc('sql', {
      query: `
        ALTER TABLE public.productos 
        ADD COLUMN IF NOT EXISTS aplica_iva BOOLEAN DEFAULT true;
        
        COMMENT ON COLUMN public.productos.aplica_iva IS 'Indicates if IVA should be calculated for this product (true) or if price is IVA-exempt (false)';
      `
    })
    
    if (error) {
      console.error('Error running migration:', error)
      return
    }
    
    console.log('Migration completed successfully!')
    console.log('Result:', data)
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

runMigration()