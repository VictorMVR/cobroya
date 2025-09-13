import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type ItemCuentaInsert = Database['public']['Tables']['items_cuenta']['Insert']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { id: cuentaId } = await params

    const { data: items, error } = await supabase
      .from('items_cuenta')
      .select(`
        *,
        productos (
          id,
          nombre,
          codigo_interno,
          precio_venta
        )
      `)
      .eq('cuenta_id', cuentaId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching items_cuenta:', error)
      return NextResponse.json(
        { error: 'Error al cargar los items de la cuenta' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: items || [] })
  } catch (error) {
    console.error('Error in GET /api/cuentas/[id]/items:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { id: cuentaId } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.producto_id) {
      return NextResponse.json(
        { error: 'El ID del producto es requerido' },
        { status: 400 }
      )
    }

    if (!body.cantidad || body.cantidad <= 0) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      )
    }

    if (!body.precio_unit || body.precio_unit <= 0) {
      return NextResponse.json(
        { error: 'El precio unitario debe ser mayor a 0' },
        { status: 400 }
      )
    }

    const subtotal = body.cantidad * body.precio_unit

    const itemData: ItemCuentaInsert = {
      cuenta_id: cuentaId,
      producto_id: body.producto_id,
      cantidad: body.cantidad,
      precio_unit: body.precio_unit,
      subtotal: subtotal,
    }

    const { data, error } = await supabase
      .from('items_cuenta')
      .insert([itemData])
      .select(`
        *,
        productos (
          id,
          nombre,
          codigo_interno,
          precio_venta
        )
      `)
      .single()

    if (error) {
      console.error('Error creating item_cuenta:', error)
      return NextResponse.json(
        { error: 'Error al agregar el item a la cuenta' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/cuentas/[id]/items:', error)
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
    const { id: cuentaId } = await params
    const body = await request.json()

    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: 'Los items son requeridos y deben ser un array' },
        { status: 400 }
      )
    }

    // First, delete all existing items for this cuenta
    const { error: deleteError } = await supabase
      .from('items_cuenta')
      .delete()
      .eq('cuenta_id', cuentaId)

    if (deleteError) {
      console.error('Error deleting existing items:', deleteError)
      return NextResponse.json(
        { error: 'Error al actualizar los items de la cuenta' },
        { status: 500 }
      )
    }

    // Then, insert new items
    if (body.items.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const itemsToInsert = body.items.map((item: any) => ({
        cuenta_id: cuentaId,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unit: item.precio_unit,
        subtotal: item.cantidad * item.precio_unit,
      }))

      const { data, error } = await supabase
        .from('items_cuenta')
        .insert(itemsToInsert)
        .select(`
          *,
          productos (
            id,
            nombre,
            codigo_interno,
            precio_venta
          )
        `)

      if (error) {
        console.error('Error inserting new items:', error)
        return NextResponse.json(
          { error: 'Error al actualizar los items de la cuenta' },
          { status: 500 }
        )
      }

      return NextResponse.json({ data })
    }

    return NextResponse.json({ data: [] })
  } catch (error) {
    console.error('Error in PUT /api/cuentas/[id]/items:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}