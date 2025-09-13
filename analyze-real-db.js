const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function analyzeRealDB() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXB2amphZmFiem91bWVub3d0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU2NDQ0OSwiZXhwIjoyMDczMTQwNDQ5fQ.tyiyd9CNNshorwAwAIDgBTuoKxEosJ6owJsOC7rHW_8';
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('🔍 ANALIZANDO LA BASE DE DATOS REAL...\n');

  try {
    // 1. Consultar esquema de todas las tablas
    console.log('📋 1. CONSULTANDO ESQUEMA DE TODAS LAS TABLAS:');
    console.log('='.repeat(80));
    
    const { data: allTables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            table_name,
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
          FROM information_schema.columns 
          WHERE table_schema = 'public'
          ORDER BY table_name, ordinal_position;
        `
      });

    if (allTables) {
      const tables = {};
      allTables.forEach(row => {
        if (!tables[row.table_name]) tables[row.table_name] = [];
        tables[row.table_name].push(row);
      });

      Object.entries(tables).forEach(([tableName, columns]) => {
        console.log(`\n🏷️  TABLA: ${tableName.toUpperCase()}`);
        columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
          const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
          const defaultVal = col.column_default ? ` = ${col.column_default}` : '';
          console.log(`   📌 ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultVal}`);
        });
      });
    }

    // 2. Consultar llaves foráneas
    console.log('\n\n🔗 2. CONSULTANDO LLAVES FORÁNEAS:');
    console.log('='.repeat(80));
    
    const { data: foreignKeys, error: fkError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            tc.constraint_name
          FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public';
        `
      });

    if (foreignKeys) {
      foreignKeys.forEach(fk => {
        console.log(`🔗 ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }

    // 3. Consultar índices
    console.log('\n\n📊 3. CONSULTANDO ÍNDICES:');
    console.log('='.repeat(80));
    
    const { data: indexes, error: indexError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT
            t.relname AS table_name,
            i.relname AS index_name,
            a.attname AS column_name,
            ix.indisunique AS is_unique
          FROM
            pg_class t,
            pg_class i,
            pg_index ix,
            pg_attribute a,
            pg_namespace n
          WHERE
            t.oid = ix.indrelid
            AND i.oid = ix.indexrelid
            AND a.attrelid = t.oid
            AND a.attnum = ANY(ix.indkey)
            AND t.relkind = 'r'
            AND n.oid = t.relnamespace
            AND n.nspname = 'public'
          ORDER BY
            t.relname,
            i.relname;
        `
      });

    if (indexes) {
      const tableIndexes = {};
      indexes.forEach(idx => {
        if (!tableIndexes[idx.table_name]) tableIndexes[idx.table_name] = [];
        tableIndexes[idx.table_name].push(idx);
      });

      Object.entries(tableIndexes).forEach(([tableName, idxs]) => {
        console.log(`\n📊 TABLA: ${tableName}`);
        const groupedIndexes = {};
        idxs.forEach(idx => {
          if (!groupedIndexes[idx.index_name]) groupedIndexes[idx.index_name] = [];
          groupedIndexes[idx.index_name].push(idx);
        });

        Object.entries(groupedIndexes).forEach(([indexName, columns]) => {
          const unique = columns[0].is_unique ? ' (UNIQUE)' : '';
          const cols = columns.map(c => c.column_name).join(', ');
          console.log(`   🔍 ${indexName}: ${cols}${unique}`);
        });
      });
    }

  } catch (error) {
    if (error.message?.includes('exec_sql')) {
      console.log('⚠️  RPC exec_sql no está disponible, usando método alternativo...');
      
      // Método alternativo: analizar mediante inserción controlada
      console.log('\n🧪 MÉTODO ALTERNATIVO: Análisis por inserción controlada');
      
      // Obtener lista de tablas
      const { data: tablesList } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
        
      if (tablesList) {
        console.log('\n📋 Tablas encontradas:', tablesList.map(t => t.tablename).join(', '));
        
        // Para cada tabla, intentar insertar registro vacío para ver estructura
        for (const table of tablesList) {
          if (['productos', 'categorias', 'tenants'].includes(table.tablename)) {
            console.log(`\n🔍 Analizando ${table.tablename}...`);
            
            const { data, error } = await supabase
              .from(table.tablename)
              .insert([{}])
              .select();
              
            if (error) {
              console.log(`❌ ${error.message}`);
              if (error.details) console.log(`   📋 ${error.details}`);
              if (error.hint) console.log(`   💡 ${error.hint}`);
            } else if (data && data.length > 0) {
              console.log(`✅ Estructura de ${table.tablename}:`);
              Object.entries(data[0]).forEach(([key, value]) => {
                const type = typeof value;
                console.log(`   📌 ${key}: ${type}`);
              });
              // Limpiar
              await supabase.from(table.tablename).delete().eq('id', data[0].id);
            }
          }
        }
      }
    } else {
      console.error('❌ Error inesperado:', error);
    }
  }
}

analyzeRealDB();