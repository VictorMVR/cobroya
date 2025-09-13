'use client'

import { Edit, Trash2, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Categoria } from '@/lib/types'

interface CategoriaCardProps {
  categoria: Categoria
  viewMode: 'grid' | 'list'
  onEdit: () => void
  onDelete: () => void
}

export function CategoriaCard({ categoria, viewMode, onEdit, onDelete }: CategoriaCardProps) {
  const isGrid = viewMode === 'grid'

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-4 transition-all hover:shadow-md',
        isGrid ? 'space-y-3' : 'flex items-center justify-between space-x-4'
      )}
    >
      {/* Main Content */}
      <div className={cn('flex items-center gap-3', isGrid ? '' : 'flex-1')}>
        {/* Color Badge */}
        <div
          className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center"
          style={{ backgroundColor: categoria.color || '#6B7280' }}
        >
          <Tag className="h-4 w-4 text-white" />
        </div>

        {/* Category Info */}
        <div className={cn('min-w-0', isGrid ? 'flex-1' : '')}>
          <h3 className="font-medium text-foreground truncate">
            {categoria.nombre}
          </h3>
          {categoria.orden !== null && (
            <p className="text-sm text-muted-foreground">
              Orden: {categoria.orden}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={cn(
        'flex items-center gap-1',
        isGrid ? 'justify-end' : ''
      )}>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          title="Editar categoría"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
          title="Eliminar categoría"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}