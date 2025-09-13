const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testProductosStructure() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXB2amphZmFiem91bWVub3d0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU2NDQ0OSwiZXhwIjoyMDczMTQwNDQ5fQ.tyiyd9CNNshorwAwAIDgBTuoKxEosJ6owJsOC7rHW_8';
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('🧪 Probando estructura de productos...');

  // Intentar diferentes combinaciones de campos
  const tests = [
    // Test 1: Solo campos básicos
    {
      name: 'Test 1 - Básico',
      data: {
        tenant_id: '00000000-0000-0000-0000-000000000000',
        nombre: 'Test Product',
        precio: 1.0
      }
    },
    // Test 2: Con categoria_id
    {
      name: 'Test 2 - Con categoria_id',
      data: {
        tenant_id: '00000000-0000-0000-0000-000000000000',
        nombre: 'Test Product',
        precio: 1.0,
        categoria_id: '00000000-0000-0000-0000-000000000001'
      }
    },
    // Test 3: Con stock
    {
      name: 'Test 3 - Con stock',
      data: {
        tenant_id: '00000000-0000-0000-0000-000000000000',
        nombre: 'Test Product',
        precio: 1.0,
        stock: 10
      }
    },
    // Test 4: Todo junto
    {
      name: 'Test 4 - Completo',
      data: {
        tenant_id: '00000000-0000-0000-0000-000000000000',
        nombre: 'Test Product',
        descripcion: 'Test description',
        precio: 1.0,
        stock: 10,
        categoria_id: '00000000-0000-0000-0000-000000000001',
        activo: true
      }
    }
  ];

  for (const test of tests) {
    console.log(`\n🧪 ${test.name}:`);
    
    const { data, error } = await supabase
      .from('productos')
      .insert([test.data])
      .select();

    if (error) {
      console.log(`❌ Error: ${error.message}`);
      if (error.details) console.log(`   Detalles: ${error.details}`);
      if (error.hint) console.log(`   Sugerencia: ${error.hint}`);
    } else {
      console.log(`✅ ¡Exitoso! Estructura encontrada:`);
      if (data && data.length > 0) {
        const record = data[0];
        Object.entries(record).forEach(([key, value]) => {
          const type = typeof value;
          const valueType = value === null ? 'null' : 
                           value instanceof Date ? 'datetime' :
                           type === 'string' && key.includes('id') ? 'uuid' :
                           type;
          console.log(`   📌 ${key}: ${valueType} = ${value}`);
        });
        
        // Limpiar el registro
        await supabase.from('productos').delete().eq('id', record.id);
        console.log(`   🗑️  Registro limpiado`);
        
        // Si fue exitoso, no necesitamos seguir probando
        break;
      }
    }
  }
}

testProductosStructure();