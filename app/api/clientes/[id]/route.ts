import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type ClienteUpdate = Database['public']['Tables']['clientes']['Update']

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { id } = await params

    // Validar que el cliente existe
    const { data: existingCliente, error: fetchError } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingCliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos para actualizar
    const updateData: ClienteUpdate = {}
    
    if (body.nombre !== undefined) updateData.nombre = body.nombre
    if (body.email !== undefined) updateData.email = body.email
    if (body.telefono !== undefined) updateData.telefono = body.telefono
    if (body.credito_limite !== undefined) {
      updateData.credito_limite = body.credito_limite ? parseFloat(body.credito_limite) : null
    }
    if (body.credito_usado !== undefined) {
      updateData.credito_usado = body.credito_usado ? parseFloat(body.credito_usado) : 0
    }
    if (body.tenant_id !== undefined) updateData.tenant_id = body.tenant_id

    const { data: updatedCliente, error } = await supabase
      .from('clientes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating cliente:', error)
      return NextResponse.json(
        { error: 'Error al actualizar cliente: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: updatedCliente,
      message: 'Cliente actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error in PUT /api/clientes/[id]:', error)
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

    // Verificar que el cliente existe
    const { data: existingCliente, error: fetchError } = await supabase
      .from('clientes')
      .select('id, nombre')
      .eq('id', id)
      .single()

    if (fetchError || !existingCliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el cliente
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting cliente:', error)
      return NextResponse.json(
        { error: 'Error al eliminar cliente: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Cliente "${existingCliente.nombre}" eliminado exitosamente`
    })
  } catch (error) {
    console.error('Error in DELETE /api/clientes/[id]:', error)
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

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: cliente })
  } catch (error) {
    console.error('Error in GET /api/clientes/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}