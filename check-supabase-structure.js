const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSupabaseStructure() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Variables de entorno de Supabase no encontradas');
    return;
  }

  console.log('🔗 Conectando a Supabase:', supabaseUrl);

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Primero intentar hacer una consulta simple para verificar conexión
    console.log('🔍 Verificando conexión...');
    
    // Consultar la estructura usando la API de Supabase
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error consultando productos:', error.message);
      
      // Si no existe la tabla, intentar consultar las tablas disponibles
      console.log('🔍 Intentando consultar esquema de la base de datos...');
      
      // Usar RPC para consultar el esquema
      const { data: schemaData, error: schemaError } = await supabase.rpc('get_schema_info');
      
      if (schemaError) {
        console.log('⚠️  No se puede consultar el esquema con RPC, intentando consulta directa...');
        
        // Intentar una consulta SQL directa si está habilitada
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
          
        if (tablesError) {
          console.error('❌ Error consultando tablas:', tablesError.message);
          console.log('💡 La tabla "productos" puede no existir o no tener permisos de lectura');
        } else {
          console.log('📋 Tablas disponibles:', tablesData?.map(t => t.table_name));
        }
      }
      return;
    }

    console.log('✅ Conexión exitosa a Supabase');
    
    if (data && data.length > 0) {
      const firstRecord = data[0];
      console.log('\n📋 Estructura de la tabla "productos" (basada en el primer registro):');
      console.log('='.repeat(80));
      
      Object.entries(firstRecord).forEach(([key, value]) => {
        const type = typeof value;
        const valueType = value === null ? 'null' : 
                         value instanceof Date ? 'datetime' :
                         Array.isArray(value) ? 'array' :
                         type;
        console.log(`📌 ${key}: ${valueType} = ${value}`);
      });
      
      console.log(`\n📊 Primer producto encontrado: "${firstRecord.nombre || firstRecord.name || 'Sin nombre'}"`);
    } else {
      console.log('⚠️  La tabla "productos" está vacía');
      
      // Intentar describir la estructura usando una inserción simulada
      console.log('🔍 Intentando obtener estructura mediante insert simulado...');
      
      const { error: insertError } = await supabase
        .from('productos')
        .insert([{}])  // Insert vacío para ver qué campos requiere
        .select();
        
      if (insertError) {
        console.log('📋 Campos requeridos según error de inserción:');
        console.log(insertError.message);
      }
    }

    // Contar total de productos
    const { count, error: countError } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true });
      
    if (!countError) {
      console.log(`\n📊 Total de productos en la tabla: ${count}`);
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

checkSupabaseStructure();