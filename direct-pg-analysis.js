const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function directPGAnalysis() {
  // Usar la contraseña que me diste
  const connectionConfig = {
    host: 'db.diypvjjafabzoumenowt.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '2zjL3W5i.i5ASAq',
    ssl: {
      rejectUnauthorized: false
    }
  };

  const client = new Client(connectionConfig);

  try {
    console.log('🔗 CONECTANDO DIRECTAMENTE A POSTGRESQL...\n');
    await client.connect();
    console.log('✅ Conexión exitosa!\n');

    // 1. Listar todas las tablas
    console.log('📋 1. TODAS LAS TABLAS EN EL ESQUEMA PUBLIC:');
    console.log('='.repeat(80));
    
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const tableNames = tablesResult.rows.map(row => row.table_name);
    
    tableNames.forEach(name => {
      console.log(`  🏷️  ${name}`);
    });

    // 2. Para cada tabla, obtener su estructura completa
    for (const tableName of tableNames) {
      console.log(`\n📋 2. ESTRUCTURA DE LA TABLA "${tableName.toUpperCase()}":}`);
      console.log('='.repeat(80));
      
      const columnQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale,
          udt_name
        FROM information_schema.columns 
        WHERE table_name = $1 
          AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      const columnResult = await client.query(columnQuery, [tableName]);
      
      columnResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const precision = col.numeric_precision ? `(${col.numeric_precision}${col.numeric_scale ? `,${col.numeric_scale}` : ''})` : '';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        const actualType = col.udt_name || col.data_type;
        
        console.log(`   📌 ${col.column_name}: ${actualType}${length}${precision} ${nullable}${defaultVal}`);
      });
    }

    // 3. Consultar llaves foráneas
    console.log(`\n\n🔗 3. LLAVES FORÁNEAS:}`);
    console.log('='.repeat(80));
    
    const fkQuery = `
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
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `;
    
    const fkResult = await client.query(fkQuery);
    
    fkResult.rows.forEach(fk => {
      console.log(`   🔗 ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });

    // 4. Consultar constraints únicos
    console.log(`\n\n🔒 4. CONSTRAINTS ÚNICOS:}`);
    console.log('='.repeat(80));
    
    const uniqueQuery = `
      SELECT
        tc.table_name,
        tc.constraint_name,
        kcu.column_name
      FROM 
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'UNIQUE'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name;
    `;
    
    const uniqueResult = await client.query(uniqueQuery);
    
    const uniqueByTable = {};
    uniqueResult.rows.forEach(row => {
      if (!uniqueByTable[row.table_name]) uniqueByTable[row.table_name] = {};
      if (!uniqueByTable[row.table_name][row.constraint_name]) {
        uniqueByTable[row.table_name][row.constraint_name] = [];
      }
      uniqueByTable[row.table_name][row.constraint_name].push(row.column_name);
    });

    Object.entries(uniqueByTable).forEach(([tableName, constraints]) => {
      console.log(`\n   🏷️  ${tableName}:`);
      Object.entries(constraints).forEach(([constraintName, columns]) => {
        console.log(`     🔒 ${constraintName}: ${columns.join(', ')}`);
      });
    });

    console.log('\n\n✅ ANÁLISIS COMPLETO DE LA BASE DE DATOS TERMINADO');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

directPGAnalysis();