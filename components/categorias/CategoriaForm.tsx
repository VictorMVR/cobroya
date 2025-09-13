'use client'

import { useState, useEffect } from 'react'
import { X, Save, Tag, Type, Palette, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Categoria } from '@/lib/types'

interface CategoriaFormProps {
  categoria?: Categoria | null
  onSave: (categoriaData: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#EF4444', // red
  '#10B981', // emerald
  '#8B5CF6', // violet
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#EC4899', // pink
  '#6B7280', // gray
]

export function CategoriaForm({ categoria, onSave, onCancel }: CategoriaFormProps) {
  const [formData, setFormData] = useState({
    tenant_id: '',
    nombre: '',
    orden: '',
    color: DEFAULT_COLORS[0],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with categoria data if editing
  useEffect(() => {
    if (categoria) {
      setFormData({
        tenant_id: categoria.tenant_id || '',
        nombre: categoria.nombre,
        orden: categoria.orden?.toString() || '',
        color: categoria.color || DEFAULT_COLORS[0],
      })
    }
  }, [categoria])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (formData.orden && formData.orden.trim()) {
      const orden = parseInt(formData.orden)
      if (isNaN(orden) || orden < 0) {
        newErrors.orden = 'El orden debe ser un número válido mayor o igual a 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const categoriaData = {
        tenant_id: formData.tenant_id || null,
        nombre: formData.nombre.trim(),
        orden: formData.orden.trim() ? parseInt(formData.orden) : null,
        color: formData.color,
      }

      onSave(categoriaData)
    } catch (error) {
      console.error('Error saving categoria:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl border border-border w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">
            {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Type className="h-4 w-4 inline mr-1" />
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={cn(
                  'input-no-zoom w-full px-3 py-2 border rounded-lg transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                  errors.nombre 
                    ? 'border-destructive focus:ring-destructive' 
                    : 'border-border'
                )}
                placeholder="Ej: Bebidas"
              />
              {errors.nombre && (
                <p className="text-destructive text-sm mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Orden */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Hash className="h-4 w-4 inline mr-1" />
                Orden
              </label>
              <input
                type="number"
                min="0"
                value={formData.orden}
                onChange={(e) => handleInputChange('orden', e.target.value)}
                className={cn(
                  'input-no-zoom w-full px-3 py-2 border rounded-lg transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                  errors.orden 
                    ? 'border-destructive focus:ring-destructive' 
                    : 'border-border'
                )}
                placeholder="0"
              />
              {errors.orden && (
                <p className="text-destructive text-sm mt-1">{errors.orden}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Orden de aparición en los menús (opcional)
              </p>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Palette className="h-4 w-4 inline mr-1" />
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleInputChange('color', color)}
                    className={cn(
                      'w-12 h-12 rounded-lg border-2 transition-all',
                      formData.color === color
                        ? 'border-ring ring-2 ring-ring/20 scale-105'
                        : 'border-border hover:border-ring/50'
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              
              {/* Custom color input */}
              <div className="mt-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full h-10 rounded-lg border border-border cursor-pointer"
                  title="Color personalizado"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border border-border rounded-lg p-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Vista Previa
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center"
                  style={{ backgroundColor: formData.color }}
                >
                  <Tag className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">
                    {formData.nombre || 'Nombre de la categoría'}
                  </p>
                  {formData.orden && (
                    <p className="text-sm text-muted-foreground">
                      Orden: {formData.orden}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
            <button
              type="button"
              onClick={onCancel}
              className="btn-touch px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'btn-touch bg-primary text-primary-foreground hover:bg-primary/90',
                'px-6 py-2 rounded-lg flex items-center gap-2 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Guardando...' : categoria ? 'Actualizar' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}