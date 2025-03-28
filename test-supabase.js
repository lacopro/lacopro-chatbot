require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Credenciales de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log('Probando conexión a Supabase...');
console.log('URL:', SUPABASE_URL);
console.log('KEY (últimos 5 caracteres):', SUPABASE_KEY ? SUPABASE_KEY.substring(SUPABASE_KEY.length - 5) : 'No configurada');

async function diagnoseSupabase() {
  try {
    // Crear cliente de Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Cliente Supabase inicializado');

    // 1. Verificar si podemos leer de la tabla productos
    console.log('\n1. Intentando leer datos de la tabla "productos"...');
    const { data: products, error: readError, status } = await supabase
      .from('productos')
      .select('*')
      .limit(5);
    
    console.log('Código de respuesta HTTP:', status);
    
    if (readError) {
      console.error('Error al leer tabla "productos":', readError);
    } else {
      console.log(`Éxito! Se encontraron ${products.length} productos en la tabla`);
      if (products.length > 0) {
        console.log('Primer producto:', JSON.stringify(products[0], null, 2));
      }
    }

    // 2. Verificar permisos para insertar en la tabla
    console.log('\n2. Verificando permiso para insertar en la tabla "productos"...');
    const testProduct = {
      post_title: 'Producto de Prueba',
      post_name: 'producto-prueba',
      post_content: 'Este es un producto de prueba para verificar permisos',
      product_page_url: 'https://example.com/test'
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('productos')
      .insert([testProduct])
      .select();

    if (insertError) {
      console.error('Error al insertar en "productos":', insertError);
      
      if (insertError.message.includes('violates row-level security policy')) {
        console.log('\n✖️ DIAGNÓSTICO: El problema es por políticas RLS (Row Level Security)');
        console.log('   Necesitas configurar las políticas RLS en Supabase para esta tabla');
        console.log('   Solución 1: Desactiva RLS para la tabla "productos" (menos seguro pero simple)');
        console.log('   Solución 2: Añade una política para permitir inserción/lectura usando el service role');
      }
    } else {
      console.log('Éxito! Se insertó el producto de prueba correctamente');
      console.log('Resultado:', insertResult);
    }

    // 3. Información RLS
    console.log('\n3. Resumen de la situación:');
    console.log('   - Lectura de tabla:', readError ? '❌ Fallida' : '✅ Exitosa');
    console.log('   - Inserción en tabla:', insertError ? '❌ Fallida' : '✅ Exitosa');
    
    // Sugerencias
    console.log('\nPasos siguientes recomendados:');
    if (readError || insertError) {
      console.log('1. Accede al panel de Supabase: https://app.supabase.io');
      console.log('2. Selecciona tu proyecto');
      console.log('3. Ve a "Authentication" → "Policies"');
      console.log('4. Busca la tabla "productos"');
      console.log('5. Modifica o desactiva las políticas RLS según tus necesidades');
      console.log('6. O usa ANML client key (service_role) que ya tienes, que debería funcionar independientemente de RLS');
    } else {
      console.log('¡Todo parece estar funcionando correctamente con Supabase!');
    }
  } catch (error) {
    console.error('Error general al conectar con Supabase:', error);
  }
}

diagnoseSupabase().catch(err => {
  console.error('Error no controlado:', err);
}); 