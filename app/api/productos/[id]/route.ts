import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type ProductoUpdate = Database['public']['Tables']['productos']['Update']

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { id } = await params

    // Validar que el producto existe
    const { data: existingProduct, error: fetchError } = await supabase
      .from('productos')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos para actualizar
    const updateData: ProductoUpdate = {}
    
    if (body.nombre !== undefined) updateData.nombre = body.nombre
    if (body.descripcion !== undefined) updateData.descripcion = body.descripcion
    if (body.precio_venta !== undefined) updateData.precio_venta = parseFloat(body.precio_venta)
    if (body.categoria_id !== undefined) updateData.categoria_id = body.categoria_id
    if (body.codigo_barras !== undefined) updateData.codigo_barras = body.codigo_barras
    if (body.codigo_interno !== undefined) updateData.codigo_interno = body.codigo_interno
    if (body.imagen_url !== undefined) updateData.imagen_url = body.imagen_url
    if (body.es_paquete !== undefined) updateData.es_paquete = body.es_paquete
    if (body.cantidad_paquete !== undefined) updateData.cantidad_paquete = body.cantidad_paquete
    if (body.activo !== undefined) updateData.activo = body.activo
    if (body.tenant_id !== undefined) updateData.tenant_id = body.tenant_id

    const { data: updatedProducto, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating producto:', error)
      return NextResponse.json(
        { error: 'Error al actualizar producto: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: updatedProducto,
      message: 'Producto actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error in PUT /api/productos/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { id } = await params

    // Verificar que el producto existe
    const { data: existingProduct, error: fetchError } = await supabase
      .from('productos')
      .select('id, nombre')
      .eq('id', id)
      .single()

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el producto
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting producto:', error)
      return NextResponse.json(
        { error: 'Error al eliminar producto: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Producto "${existingProduct.nombre}" eliminado exitosamente`
    })
  } catch (error) {
    console.error('Error in DELETE /api/productos/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { id } = await params

    const { data: producto, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: producto })
  } catch (error) {
    console.error('Error in GET /api/productos/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}