import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type CategoriaInsert = Database['public']['Tables']['categorias']['Insert']

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const tenant_id = searchParams.get('tenant_id')

    let query = supabase
      .from('categorias')
      .select('*')
      .order('orden', { ascending: true })

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id)
    }

    const { data: categorias, error } = await query

    if (error) {
      console.error('Error fetching categorias:', error)
      return NextResponse.json(
        { error: 'Error al cargar categorías' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: categorias || [] })
  } catch (error) {
    console.error('Error in GET /api/categorias:', error)
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
    if (!body.nombre || body.nombre.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    const categoriaData: CategoriaInsert = {
      tenant_id: body.tenant_id || null,
      nombre: body.nombre.trim(),
      orden: typeof body.orden === 'number' ? body.orden : null,
      color: body.color || '#6B7280',
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert([categoriaData])
      .select()
      .single()

    if (error) {
      console.error('Error creating categoria:', error)
      return NextResponse.json(
        { error: 'Error al crear la categoría' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/categorias:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}