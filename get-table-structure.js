const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function getTableStructure() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔗 Conectando a Supabase para consultar estructura...');

  try {
    // Usar SQL directo para consultar la estructura
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select(`
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      `)
      .eq('table_name', 'productos')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (error) {
      console.error('❌ Error consultando estructura:', error.message);
      
      // Intentar método alternativo usando RPC personalizado
      console.log('🔄 Intentando método alternativo...');
      
      // Crear una función SQL temporal para consultar
      const sqlQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'productos' 
          AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      const { data: rpcData, error: rpcError } = await supabase.rpc('sql_query', {
        query: sqlQuery
      });
      
      if (rpcError) {
        console.error('❌ RPC también falló:', rpcError.message);
        console.log('💡 Probablemente necesitamos permisos adicionales o usar service_role key');
      } else {
        console.log('✅ Estructura obtenida via RPC:', rpcData);
      }
      
      return;
    }

    console.log('✅ Estructura de la tabla "productos" obtenida:');
    console.log('='.repeat(80));

    data.forEach(column => {
      const nullable = column.is_nullable === 'YES' ? '(nullable)' : '(required)';
      const length = column.character_maximum_length ? `(${column.character_maximum_length})` : '';
      const defaultVal = column.column_default ? ` = ${column.column_default}` : '';
      
      console.log(`📌 ${column.column_name}: ${column.data_type}${length} ${nullable}${defaultVal}`);
    });

    // También consultar si existe tabla categorias
    const { data: categoriasData, error: categoriasError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'categorias')
      .eq('table_schema', 'public');

    if (!categoriasError && categoriasData?.length > 0) {
      console.log('\n✅ Estructura de la tabla "categorias":');
      console.log('='.repeat(50));
      categoriasData.forEach(column => {
        const nullable = column.is_nullable === 'YES' ? '(nullable)' : '(required)';
        console.log(`📌 ${column.column_name}: ${column.data_type} ${nullable}`);
      });
    } else {
      console.log('\n❌ No se encontró tabla "categorias" o sin permisos');
    }

    // Listar todas las tablas disponibles
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (!tablesError) {
      console.log('\n📋 Todas las tablas disponibles:');
      tablesData.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

getTableStructure();