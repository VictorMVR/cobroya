import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type CuentaInsert = Database['public']['Tables']['cuentas']['Insert']

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const tenant_id = searchParams.get('tenant_id')

    let query = supabase
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
      .order('created_at', { ascending: false })

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id)
    }

    const { data: cuentas, error } = await query

    if (error) {
      console.error('Error fetching cuentas:', error)
      return NextResponse.json(
        { error: 'Error al cargar cuentas' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: cuentas || [] })
  } catch (error) {
    console.error('Error in GET /api/cuentas:', error)
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
    if (!body.cliente_nombre || body.cliente_nombre.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del cliente es requerido' },
        { status: 400 }
      )
    }

    if (!body.total || body.total <= 0) {
      return NextResponse.json(
        { error: 'El total debe ser mayor a 0' },
        { status: 400 }
      )
    }

    const cuentaData: CuentaInsert = {
      cliente_id: body.cliente_id || null,
      cliente_nombre: body.cliente_nombre.trim(),
      total: body.total,
      sucursal_id: body.sucursal_id || null,
      usuario_id: body.usuario_id || null,
      estatus_id: body.estatus_id || null, // Will use database default
    }

    const { data, error } = await supabase
      .from('cuentas')
      .insert([cuentaData])
      .select()
      .single()

    if (error) {
      console.error('Error creating cuenta:', error)
      return NextResponse.json(
        { error: 'Error al crear la cuenta' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/cuentas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}