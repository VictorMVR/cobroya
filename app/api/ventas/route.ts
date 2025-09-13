import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type VentaInsert = Database['public']['Tables']['ventas']['Insert']
type PagoVentaInsert = Database['public']['Tables']['pagos_venta']['Insert']
type ItemVentaInsert = Database['public']['Tables']['items_venta']['Insert']

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const tenant_id = searchParams.get('tenant_id')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('ventas')
      .select(`
        *,
        items_venta (
          id,
          cantidad,
          precio_unit,
          subtotal,
          producto_id,
          productos (
            id,
            nombre,
            codigo_interno
          )
        ),
        pagos_venta (
          id,
          monto,
          pago_recibido,
          cambio,
          referencia,
          metodo_pago_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id)
    }

    const { data: ventas, error } = await query

    if (error) {
      console.error('Error fetching ventas:', error)
      return NextResponse.json(
        { error: 'Error al cargar ventas' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: ventas || [] })
  } catch (error) {
    console.error('Error in GET /api/ventas:', error)
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

    // Validate required fields
    if (!body.total || body.total <= 0) {
      return NextResponse.json(
        { error: 'El total debe ser mayor a 0' },
        { status: 400 }
      )
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Los items de venta son requeridos' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of body.items) {
      if (!item.producto_id || !item.cantidad || item.cantidad <= 0 || !item.precio_unit || item.precio_unit <= 0) {
        return NextResponse.json(
          { error: 'Todos los items deben tener producto_id, cantidad y precio_unit válidos' },
          { status: 400 }
        )
      }
    }

    // Start a transaction by inserting the venta first
    const ventaData: VentaInsert = {
      cliente_id: body.cliente_id || null,
      cuenta_id: body.cuenta_id || null,
      total: body.total,
      sucursal_id: body.sucursal_id || null,
      usuario_id: body.usuario_id || null,
      estatus_id: body.estatus_id || null, // Will use database default
    }

    const { data: venta, error: ventaError } = await supabase
      .from('ventas')
      .insert([ventaData])
      .select()
      .single()

    if (ventaError) {
      console.error('Error creating venta:', ventaError)
      return NextResponse.json(
        { error: 'Error al crear la venta' },
        { status: 500 }
      )
    }

    // Insert sale items (line items)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemVentaInserts: ItemVentaInsert[] = body.items.map((item: any) => ({
      venta_id: venta.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unit: item.precio_unit,
      subtotal: item.cantidad * item.precio_unit,
    }))

    const { error: itemsError } = await supabase
      .from('items_venta')
      .insert(itemVentaInserts)

    if (itemsError) {
      console.error('Error creating sale items:', itemsError)
      
      // Rollback: delete the venta if items creation failed
      await supabase.from('ventas').delete().eq('id', venta.id)
      
      return NextResponse.json(
        { error: 'Error al crear los detalles de la venta' },
        { status: 500 }
      )
    }

    // Create payment records
    if (body.payments && Array.isArray(body.payments)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentInserts = body.payments.map((payment: any) => ({
        venta_id: venta.id,
        monto: payment.cantidad,
        pago_recibido: payment.cantidad,
        referencia: payment.referencia || null,
        // metodo_pago_id would need to be resolved from metodo name
      }))

      const { error: paymentsError } = await supabase
        .from('pagos_venta')
        .insert(paymentInserts)

      if (paymentsError) {
        console.error('Error creating payments:', paymentsError)
        
        // Rollback: delete the venta and items if payments creation failed
        await supabase.from('ventas').delete().eq('id', venta.id)
        // items_venta will be deleted automatically due to CASCADE
        
        return NextResponse.json(
          { error: 'Error al registrar los pagos' },
          { status: 500 }
        )
      }
    }

    // Note: Stock reduction would go here if needed
    // For now, we'll just log that the sale was created
    console.log('Sale created successfully:', venta.id)

    // Return the complete venta with details
    const { data: completedVenta, error: fetchError } = await supabase
      .from('ventas')
      .select(`
        *,
        items_venta (
          id,
          cantidad,
          precio_unit,
          subtotal,
          producto_id,
          productos (
            id,
            nombre,
            codigo_interno
          )
        ),
        pagos_venta (
          id,
          monto,
          pago_recibido,
          cambio,
          referencia,
          metodo_pago_id
        )
      `)
      .eq('id', venta.id)
      .single()

    if (fetchError) {
      console.error('Error fetching completed venta:', fetchError)
      // Still return the basic venta data even if we can't fetch the detailed version
      return NextResponse.json({ data: venta }, { status: 201 })
    }

    return NextResponse.json({ data: completedVenta }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/ventas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}