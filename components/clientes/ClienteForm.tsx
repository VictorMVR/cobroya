'use client'

import { useState, useEffect } from 'react'
import { X, User, Save, Phone, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Cliente } from '@/lib/types'

interface ClienteFormProps {
  cliente?: Cliente | null
  onSave: (clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
  isSubmitting?: boolean
}

interface FormData {
  nombre: string
  telefono: string
  email: string
}

export function ClienteForm({ cliente, onSave, onCancel, isSubmitting = false }: ClienteFormProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    telefono: '',
    email: '',
  })
  
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const isEditing = !!cliente

  // Initialize form with client data if editing
  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        telefono: cliente.telefono || '',
        email: cliente.email || '',
      })
    }
  }, [cliente])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    // Required fields
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    // Optional but validate format if provided
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Formato de email inválido'
    }

    if (formData.telefono && !isValidPhone(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido (ej: 555-1234)'
    }


    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidPhone = (phone: string): boolean => {
    // Allow formats like: 555-1234, (555) 123-4567, 5551234567, +52 555 123 4567
    const phoneRegex = /^[\+]?[\d\s\(\)\-]{7,}$/
    return phoneRegex.test(phone)
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      // Clean up form data
      const cleanData = {
        tenant_id: null, // Will be set by the API based on authentication
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim() || null,
        email: formData.email.trim() || null,
        credito_limite: null,
        credito_usado: null,
      }

      onSave(cleanData)
    } catch (error) {
      console.error('Error saving client:', error)
    }
  }

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value

    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl border border-border w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <User className="h-5 w-5" />
              {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing 
                ? 'Actualiza la información del cliente'
                : 'Completa los datos del nuevo cliente'
              }
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-4">
            {/* Nombre (Required) */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={handleInputChange('nombre')}
                  className={cn(
                    'input-no-zoom w-full pl-10 pr-4 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                    'placeholder:text-muted-foreground',
                    errors.nombre ? 'border-destructive' : 'border-border'
                  )}
                  placeholder="Juan Pérez García"
                  disabled={isSubmitting}
                  autoFocus
                  required
                />
              </div>
              {errors.nombre && (
                <p className="text-xs text-destructive mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={handleInputChange('telefono')}
                  className={cn(
                    'input-no-zoom w-full pl-10 pr-4 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                    'placeholder:text-muted-foreground',
                    errors.telefono ? 'border-destructive' : 'border-border'
                  )}
                  placeholder="555-1234"
                  disabled={isSubmitting}
                />
              </div>
              {errors.telefono && (
                <p className="text-xs text-destructive mt-1">{errors.telefono}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={cn(
                    'input-no-zoom w-full pl-10 pr-4 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                    'placeholder:text-muted-foreground',
                    errors.email ? 'border-destructive' : 'border-border'
                  )}
                  placeholder="cliente@email.com"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>

          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={onCancel}
            className="btn-touch px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.nombre.trim()}
            className={cn(
              'btn-touch px-6 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              formData.nombre.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isEditing ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditing ? 'Actualizar Cliente' : 'Crear Cliente'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}