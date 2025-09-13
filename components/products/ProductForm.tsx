'use client'

import { useState, useEffect } from 'react'
import { X, Save, Package, DollarSign, Hash, Type, FileText, Tag, Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Producto, Categoria } from '@/lib/types'

interface ProductFormProps {
  product?: Producto | null
  onSave: (productData: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    tenant_id: '',
    codigo_interno: '',
    codigo_barras: '',
    nombre: '',
    descripcion: '',
    precio_venta: '',
    categoria_id: '',
    imagen_url: '',
    es_paquete: false,
    cantidad_paquete: '1',
    activo: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categorias')
        const result = await response.json()
        if (response.ok) {
          setCategories(result.data || [])
        } else {
          console.error('Error loading categories:', result.error)
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        tenant_id: product.tenant_id || '',
        codigo_interno: product.codigo_interno || '',
        codigo_barras: product.codigo_barras || '',
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        precio_venta: product.precio_venta.toString(),
        categoria_id: product.categoria_id || '',
        imagen_url: product.imagen_url || '',
        es_paquete: product.es_paquete || false,
        cantidad_paquete: (product.cantidad_paquete || 1).toString(),
        activo: product.activo !== false,
      })
    }
  }, [product])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.precio_venta.trim()) {
      newErrors.precio_venta = 'El precio de venta es requerido'
    } else {
      const precio = parseFloat(formData.precio_venta)
      if (isNaN(precio) || precio < 0) {
        newErrors.precio_venta = 'El precio debe ser un número válido mayor o igual a 0'
      }
    }

    if (formData.es_paquete && formData.cantidad_paquete) {
      const cantidad = parseInt(formData.cantidad_paquete)
      if (isNaN(cantidad) || cantidad < 1) {
        newErrors.cantidad_paquete = 'La cantidad del paquete debe ser mayor a 0'
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
        tenant_id: formData.tenant_id || null,
        codigo_interno: formData.codigo_interno.trim() || null,
        codigo_barras: formData.codigo_barras.trim() || null,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        precio_venta: parseFloat(formData.precio_venta),
        categoria_id: formData.categoria_id || null,
        imagen_url: formData.imagen_url.trim() || null,
        es_paquete: formData.es_paquete,
        cantidad_paquete: formData.es_paquete ? parseInt(formData.cantidad_paquete) : 1,
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
                {/* Código Interno */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Hash className="h-4 w-4 inline mr-1" />
                    Código Interno
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_interno}
                    onChange={(e) => handleInputChange('codigo_interno', e.target.value)}
                    className="input-no-zoom w-full px-3 py-2 border border-border rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Ej: PROD001"
                  />
                </div>

                {/* Código de Barras */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Hash className="h-4 w-4 inline mr-1" />
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_barras}
                    onChange={(e) => handleInputChange('codigo_barras', e.target.value)}
                    className="input-no-zoom w-full px-3 py-2 border border-border rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Ej: 123456789012"
                  />
                </div>

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
                {/* Precio de Venta */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Precio de Venta (MXN) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_venta}
                    onChange={(e) => handleInputChange('precio_venta', e.target.value)}
                    className={cn(
                      'input-no-zoom w-full px-3 py-2 border rounded-lg transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                      errors.precio_venta 
                        ? 'border-destructive focus:ring-destructive' 
                        : 'border-border'
                    )}
                    placeholder="0.00"
                  />
                  {errors.precio_venta && (
                    <p className="text-destructive text-sm mt-1">{errors.precio_venta}</p>
                  )}
                </div>

                {/* Es Paquete */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipo de Producto
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="es_paquete"
                        checked={!formData.es_paquete}
                        onChange={() => handleInputChange('es_paquete', false)}
                        className="text-primary"
                      />
                      <span>Producto Individual</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="es_paquete"
                        checked={formData.es_paquete}
                        onChange={() => handleInputChange('es_paquete', true)}
                        className="text-primary"
                      />
                      <span>Paquete</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Cantidad del Paquete - Solo si es paquete */}
              {formData.es_paquete && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cantidad en el Paquete
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cantidad_paquete}
                    onChange={(e) => handleInputChange('cantidad_paquete', e.target.value)}
                    className={cn(
                      'input-no-zoom w-full px-3 py-2 border rounded-lg transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                      errors.cantidad_paquete 
                        ? 'border-destructive focus:ring-destructive' 
                        : 'border-border'
                    )}
                    placeholder="1"
                  />
                  {errors.cantidad_paquete && (
                    <p className="text-destructive text-sm mt-1">{errors.cantidad_paquete}</p>
                  )}
                </div>
              )}
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
                {loadingCategories ? (
                  <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cargando categorías...</span>
                  </div>
                ) : (
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
                )}
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