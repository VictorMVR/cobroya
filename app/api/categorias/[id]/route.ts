import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type CategoriaUpdate = Database['public']['Tables']['categorias']['Update']

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { id } = await params

    // Validate required fields
    if (!body.nombre || body.nombre.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    const categoriaData: CategoriaUpdate = {
      nombre: body.nombre.trim(),
      orden: typeof body.orden === 'number' ? body.orden : null,
      color: body.color || '#6B7280',
    }

    // Add tenant_id if provided
    if (body.tenant_id !== undefined) {
      categoriaData.tenant_id = body.tenant_id || null
    }

    const { data, error } = await supabase
      .from('categorias')
      .update(categoriaData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating categoria:', error)
      return NextResponse.json(
        { error: 'Error al actualizar la categoría' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PUT /api/categorias/[id]:', error)
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

    // First check if categoria exists
    const { data: existingCategoria, error: fetchError } = await supabase
      .from('categorias')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingCategoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    // Delete the categoria
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting categoria:', error)
      return NextResponse.json(
        { error: 'Error al eliminar la categoría' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Categoría eliminada exitosamente' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/categorias/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}