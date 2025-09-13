import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { id } = await params

    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        venta_detalle (
          id,
          cantidad,
          precio_unit,
          subtotal,
          producto_id,
          productos (
            id,
            nombre,
            codigo_interno,
            precio_venta
          )
        ),
        clientes (
          id,
          nombre,
          telefono,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching venta:', error)
      return NextResponse.json(
        { error: 'Error al cargar la venta' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/ventas/[id]:', error)
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

    // First check if venta exists and get its details for stock restoration
    const { data: existingVenta, error: fetchError } = await supabase
      .from('ventas')
      .select(`
        *,
        venta_detalle (
          producto_id,
          cantidad
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !existingVenta) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }

    // Delete items_venta first (foreign key constraint)
    const { error: detalleError } = await supabase
      .from('items_venta')
      .delete()
      .eq('venta_id', id)

    if (detalleError) {
      console.error('Error deleting venta_detalle:', detalleError)
      return NextResponse.json(
        { error: 'Error al eliminar los detalles de la venta' },
        { status: 500 }
      )
    }

    // Delete the venta
    const { error } = await supabase
      .from('ventas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting venta:', error)
      return NextResponse.json(
        { error: 'Error al eliminar la venta' },
        { status: 500 }
      )
    }

    // Note: Stock restoration would go here if needed
    // For now, we'll just log that the sale was deleted
    console.log('Sale deleted successfully:', id)

    return NextResponse.json({ 
      message: 'Venta eliminada exitosamente' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/ventas/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}