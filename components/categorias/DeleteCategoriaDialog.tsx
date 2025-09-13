'use client'

import { AlertTriangle, X } from 'lucide-react'
import type { Categoria } from '@/lib/types'

interface DeleteCategoriaDialogProps {
  categoria: Categoria
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteCategoriaDialog({ categoria, onConfirm, onCancel }: DeleteCategoriaDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl border border-border w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold">Eliminar Categoría</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-muted-foreground mb-4">
            ¿Estás seguro de que quieres eliminar la categoría <strong>&quot;{categoria.nombre}&quot;</strong>?
          </p>
          
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-destructive">
              <strong>Advertencia:</strong> Esta acción no se puede deshacer. 
              Los productos asociados a esta categoría quedarán sin categoría asignada.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            onClick={onCancel}
            className="btn-touch px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="btn-touch bg-destructive text-destructive-foreground hover:bg-destructive/90 
                       px-4 py-2 rounded-lg transition-colors"
          >
            Eliminar Categoría
          </button>
        </div>
      </div>
    </div>
  )
}