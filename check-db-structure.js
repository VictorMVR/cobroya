const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkDatabaseStructure() {
  // Construir la URL de conexión desde las variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL no encontrada en .env.local');
    return;
  }

  // Extraer el host de la URL de Supabase
  const url = new URL(supabaseUrl);
  const host = url.hostname;
  const projectRef = host.split('.')[0];

  // Configuración de conexión a PostgreSQL
  const connectionConfig = {
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || 'your-database-password', // Necesitaremos la contraseña
    ssl: {
      rejectUnauthorized: false
    }
  };

  console.log('Intentando conectar a:', connectionConfig.host);
  console.log('Proyecto:', projectRef);

  const client = new Client(connectionConfig);

  try {
    await client.connect();
    console.log('✅ Conectado exitosamente a Supabase PostgreSQL');

    // Consultar estructura de la tabla productos
    const query = `
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
    `;

    const result = await client.query(query);
    
    console.log('\n📋 Estructura de la tabla "productos":');
    console.log('='.repeat(80));
    
    result.rows.forEach(row => {
      console.log(`📌 ${row.column_name}`);
      console.log(`   Tipo: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''}`);
      console.log(`   Nullable: ${row.is_nullable}`);
      console.log(`   Default: ${row.column_default || 'N/A'}`);
      console.log('');
    });

    // También consultar si existen registros
    const countResult = await client.query('SELECT COUNT(*) as total FROM productos');
    console.log(`📊 Total de productos en la tabla: ${countResult.rows[0].total}`);

    // Consultar estructura de la tabla categorias si existe
    const categoriasQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'categorias' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;

    const categoriasResult = await client.query(categoriasQuery);
    
    if (categoriasResult.rows.length > 0) {
      console.log('\n📋 Estructura de la tabla "categorias":');
      console.log('='.repeat(80));
      
      categoriasResult.rows.forEach(row => {
        console.log(`📌 ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
    } else {
      console.log('\n❌ No se encontró la tabla "categorias"');
    }

  } catch (error) {
    console.error('❌ Error conectando a la base de datos:');
    console.error(error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Necesitas la contraseña de la base de datos de Supabase.');
      console.log('   Ve a tu Dashboard de Supabase > Settings > Database > Connection Parameters');
    }
  } finally {
    await client.end();
  }
}

checkDatabaseStructure();