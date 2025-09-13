import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type CuentaUpdate = Database['public']['Tables']['cuentas']['Update']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { id } = await params

    const { data, error } = await supabase
      .from('cuentas')
      .select(`
        *,
        items_cuenta (
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
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching cuenta:', error)
      return NextResponse.json(
        { error: 'Error al cargar la cuenta' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/cuentas/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { id } = await params

    const cuentaData: CuentaUpdate = {
      cliente_id: body.cliente_id,
      cliente_nombre: body.cliente_nombre,
      total: body.total,
      estatus_id: body.estatus_id,
    }

    // Remove undefined values
    Object.keys(cuentaData).forEach(key => {
      if (cuentaData[key as keyof CuentaUpdate] === undefined) {
        delete cuentaData[key as keyof CuentaUpdate]
      }
    })

    const { data, error } = await supabase
      .from('cuentas')
      .update(cuentaData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating cuenta:', error)
      return NextResponse.json(
        { error: 'Error al actualizar la cuenta' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PUT /api/cuentas/[id]:', error)
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

    // First check if cuenta exists
    const { data: existingCuenta, error: fetchError } = await supabase
      .from('cuentas')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingCuenta) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      )
    }

    // Delete related items_cuenta first
    const { error: itemsError } = await supabase
      .from('items_cuenta')
      .delete()
      .eq('cuenta_id', id)

    if (itemsError) {
      console.error('Error deleting items_cuenta:', itemsError)
      return NextResponse.json(
        { error: 'Error al eliminar los items de la cuenta' },
        { status: 500 }
      )
    }

    // Delete the cuenta
    const { error } = await supabase
      .from('cuentas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting cuenta:', error)
      return NextResponse.json(
        { error: 'Error al eliminar la cuenta' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Cuenta eliminada exitosamente' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/cuentas/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}