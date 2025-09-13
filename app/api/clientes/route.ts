import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type ClienteInsert = Database['public']['Tables']['clientes']['Insert']
type ClienteRow = Database['public']['Tables']['clientes']['Row']

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const tenant_id = searchParams.get('tenant_id')

    let query = supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id)
    }

    const { data: clientes, error } = await query

    if (error) {
      console.error('Error fetching clientes:', error)
      return NextResponse.json(
        { error: 'Error al cargar clientes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: clientes || [] })
  } catch (error) {
    console.error('Error in GET /api/clientes:', error)
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
    if (!body.nombre) {
      return NextResponse.json(
        { error: 'Nombre es requerido' },
        { status: 400 }
      )
    }

    // Preparar datos para insertar
    const clienteData: ClienteInsert = {
      tenant_id: body.tenant_id || null,
      nombre: body.nombre,
      email: body.email || null,
      telefono: body.telefono || null,
      credito_limite: body.credito_limite ? parseFloat(body.credito_limite) : null,
      credito_usado: body.credito_usado ? parseFloat(body.credito_usado) : 0,
    }

    const { data: newCliente, error } = await supabase
      .from('clientes')
      .insert(clienteData)
      .select()
      .single()

    if (error) {
      console.error('Error creating cliente:', error)
      return NextResponse.json(
        { error: 'Error al crear cliente: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data: newCliente, message: 'Cliente creado exitosamente' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/clientes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}