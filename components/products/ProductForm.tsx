'use client'

import { useState, useEffect } from 'react'
import { X, Save, Package, DollarSign, Hash, Type, FileText, Tag, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Producto } from '@/lib/types'

interface ProductFormProps {
  product?: Producto | null
  onSave: (productData: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

// Mock categories - estas vendrían de la base de datos
const categories = [
  { id: '1', nombre: 'Bebidas', color: '#3B82F6' },
  { id: '2', nombre: 'Snacks', color: '#F59E0B' },
  { id: '3', nombre: 'Dulces', color: '#EF4444' },
  { id: '4', nombre: 'Cigarros', color: '#6B7280' },
  { id: '5', nombre: 'Medicinas', color: '#10B981' },
  { id: '6', nombre: 'Limpieza', color: '#8B5CF6' },
  { id: '7', nombre: 'Papelería', color: '#F97316' },
  { id: '8', nombre: 'Otros', color: '#6366F1' },
]

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    tenant_id: 'demo',
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria_id: '',
    imagen_url: '',
    activo: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        tenant_id: product.tenant_id,
        codigo: product.codigo,
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        precio: product.precio.toString(),
        stock: product.stock.toString(),
        categoria_id: product.categoria_id || '',
        imagen_url: product.imagen_url || '',
        activo: product.activo,
      })
    }
  }, [product])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido'
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.precio.trim()) {
      newErrors.precio = 'El precio es requerido'
    } else {
      const precio = parseFloat(formData.precio)
      if (isNaN(precio) || precio < 0) {
        newErrors.precio = 'El precio debe ser un número válido mayor o igual a 0'
      }
    }

    if (!formData.stock.trim()) {
      newErrors.stock = 'El stock es requerido'
    } else {
      const stock = parseInt(formData.stock)
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = 'El stock debe ser un número entero mayor o igual a 0'
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
      const productData = {
        tenant_id: formData.tenant_id,
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        categoria_id: formData.categoria_id || undefined,
        imagen_url: formData.imagen_url.trim() || undefined,
        activo: formData.activo,
      }

      onSave(productData)
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
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
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información Básica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Código */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Hash className="h-4 w-4 inline mr-1" />
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    className={cn(
                      'input-no-zoom w-full px-3 py-2 border rounded-lg transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                      errors.codigo 
                        ? 'border-destructive focus:ring-destructive' 
                        : 'border-border'
                    )}
                    placeholder="Ej: COC001"
                  />
                  {errors.codigo && (
                    <p className="text-destructive text-sm mt-1">{errors.codigo}</p>
                  )}
                </div>

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
                    placeholder="Ej: Coca-Cola 600ml"
                  />
                  {errors.nombre && (
                    <p className="text-destructive text-sm mt-1">{errors.nombre}</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  rows={3}
                  className="input-no-zoom w-full px-3 py-2 border border-border rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  placeholder="Descripción del producto (opcional)"
                />
              </div>
            </div>

            {/* Pricing and Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Precio e Inventario
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Precio */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Precio (MXN) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio}
                    onChange={(e) => handleInputChange('precio', e.target.value)}
                    className={cn(
                      'input-no-zoom w-full px-3 py-2 border rounded-lg transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                      errors.precio 
                        ? 'border-destructive focus:ring-destructive' 
                        : 'border-border'
                    )}
                    placeholder="0.00"
                  />
                  {errors.precio && (
                    <p className="text-destructive text-sm mt-1">{errors.precio}</p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Stock Inicial *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    className={cn(
                      'input-no-zoom w-full px-3 py-2 border rounded-lg transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                      errors.stock 
                        ? 'border-destructive focus:ring-destructive' 
                        : 'border-border'
                    )}
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="text-destructive text-sm mt-1">{errors.stock}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Category and Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Categoría e Imagen
              </h3>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categoría
                </label>
                <select
                  value={formData.categoria_id}
                  onChange={(e) => handleInputChange('categoria_id', e.target.value)}
                  className="input-no-zoom w-full px-3 py-2 border border-border rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL de Imagen */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  URL de Imagen
                </label>
                <input
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => handleInputChange('imagen_url', e.target.value)}
                  className="input-no-zoom w-full px-3 py-2 border border-border rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Estado</h3>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('activo', !formData.activo)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                    formData.activo
                      ? 'bg-success/10 border-success text-success'
                      : 'bg-muted border-border text-muted-foreground'
                  )}
                >
                  {formData.activo ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Producto Activo
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Producto Inactivo
                    </>
                  )}
                </button>
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
              {isSubmitting ? 'Guardando...' : product ? 'Actualizar' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}