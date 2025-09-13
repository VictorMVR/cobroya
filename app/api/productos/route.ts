import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type ProductoInsert = Database['public']['Tables']['productos']['Insert']
type ProductoRow = Database['public']['Tables']['productos']['Row']

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const tenant_id = searchParams.get('tenant_id')

    let query = supabase
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true })

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id)
    }

    const { data: productos, error } = await query

    if (error) {
      console.error('Error fetching productos:', error)
      return NextResponse.json(
        { error: 'Error al cargar productos' },
        { status: 500 }
      )
    }

    // Add aplica_iva field with default value true for all products
    const productosWithIVA = productos?.map(producto => ({
      ...producto,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aplica_iva: (producto as any).aplica_iva ?? true // Default to true if field doesn't exist
    }))

    return NextResponse.json({ data: productosWithIVA || [] })
  } catch (error) {
    console.error('Error in GET /api/productos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    // Validar campos requeridos
    if (!body.nombre || !body.precio_venta) {
      return NextResponse.json(
        { error: 'Nombre y precio_venta son requeridos' },
        { status: 400 }
      )
    }

    // Preparar datos para insertar
    const productoData: ProductoInsert = {
      tenant_id: body.tenant_id || null,
      categoria_id: body.categoria_id || null,
      codigo_barras: body.codigo_barras || null,
      codigo_interno: body.codigo_interno || null,
      nombre: body.nombre,
      descripcion: body.descripcion || null,
      precio_venta: parseFloat(body.precio_venta),
      imagen_url: body.imagen_url || null,
      es_paquete: body.es_paquete || false,
      cantidad_paquete: body.cantidad_paquete || 1,
      activo: body.activo !== undefined ? body.activo : true,
    }

    const { data: newProducto, error } = await supabase
      .from('productos')
      .insert(productoData)
      .select()
      .single()

    if (error) {
      console.error('Error creating producto:', error)
      return NextResponse.json(
        { error: 'Error al crear producto: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data: newProducto, message: 'Producto creado exitosamente' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/productos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}