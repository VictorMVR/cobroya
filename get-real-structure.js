const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function getRealStructure() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Usar Service Role key en lugar del anon key
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXB2amphZmFiem91bWVub3d0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU2NDQ0OSwiZXhwIjoyMDczMTQwNDQ5fQ.tyiyd9CNNshorwAwAIDgBTuoKxEosJ6owJsOC7rHW_8';
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('🔗 Conectando con Service Role Key...');

  try {
    // Consultar estructura de la tabla productos usando SQL directo
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
          FROM information_schema.columns 
          WHERE table_name = 'productos' 
            AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (error) {
      console.log('RPC exec_sql no disponible, intentando consulta directa...');
      
      // Intentar insertar un registro de prueba para ver qué campos requiere
      const { data: insertData, error: insertError } = await supabase
        .from('productos')
        .insert([{
          tenant_id: '00000000-0000-0000-0000-000000000000',
          codigo: 'TEST',
          nombre: 'Test Product',
          precio: 1.0
        }])
        .select();

      if (insertError) {
        console.log('📋 Error de inserción (nos ayuda a ver la estructura):');
        console.log(insertError.message);
        console.log('💡 Detalles del error:', insertError.details);
        console.log('💡 Hint:', insertError.hint);
      } else {
        console.log('✅ Registro insertado exitosamente:', insertData);
        
        // Obtener la estructura del registro insertado
        if (insertData && insertData.length > 0) {
          const record = insertData[0];
          console.log('\n📋 Estructura de la tabla "productos":');
          console.log('='.repeat(80));
          
          Object.entries(record).forEach(([key, value]) => {
            const type = typeof value;
            const valueType = value === null ? 'null' : 
                             value instanceof Date ? 'datetime' :
                             Array.isArray(value) ? 'array' :
                             type === 'string' && key.includes('id') ? 'uuid' :
                             type;
            console.log(`📌 ${key}: ${valueType}`);
          });
          
          // Limpiar el registro de prueba
          await supabase
            .from('productos')
            .delete()
            .eq('id', record.id);
          
          console.log('\n🗑️  Registro de prueba eliminado');
        }
      }
    } else {
      console.log('✅ Estructura obtenida via RPC:', data);
    }

    // También intentar consultar categorias
    const { data: categoriasTest, error: categoriasError } = await supabase
      .from('categorias')
      .select('*')
      .limit(1);
      
    if (categoriasError) {
      console.log('\n❌ Error consultando categorias:', categoriasError.message);
      
      // Intentar insertar en categorias para ver estructura
      const { data: catInsert, error: catInsertError } = await supabase
        .from('categorias')
        .insert([{
          tenant_id: '00000000-0000-0000-0000-000000000000',
          nombre: 'Test Category'
        }])
        .select();
        
      if (catInsertError) {
        console.log('📋 Estructura de categorias (desde error):');
        console.log(catInsertError.message);
      } else if (catInsert && catInsert.length > 0) {
        console.log('\n📋 Estructura de la tabla "categorias":');
        Object.entries(catInsert[0]).forEach(([key, value]) => {
          const type = typeof value;
          const valueType = value === null ? 'null' : 
                           value instanceof Date ? 'datetime' :
                           type === 'string' && key.includes('id') ? 'uuid' :
                           type;
          console.log(`📌 ${key}: ${valueType}`);
        });
        
        // Limpiar
        await supabase.from('categorias').delete().eq('id', catInsert[0].id);
      }
    } else {
      console.log('\n✅ Categorias consultadas exitosamente');
      if (categoriasTest && categoriasTest.length > 0) {
        console.log('📋 Estructura de categorias:');
        Object.entries(categoriasTest[0]).forEach(([key, value]) => {
          const type = typeof value;
          console.log(`📌 ${key}: ${type}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

getRealStructure();