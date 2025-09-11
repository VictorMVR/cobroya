'use client'

import { useState, useEffect } from 'react'
import { X, User, Save, Phone, Mail, MapPin, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClienteStore } from '@/lib/stores'
import type { Cliente } from '@/lib/types'

interface ClienteFormProps {
  cliente?: Cliente | null
  onSuccess: (message: string) => void
  onCancel: () => void
}

interface FormData {
  nombre: string
  telefono: string
  email: string
  direccion: string
  rfc: string
  activo: boolean
}

export function ClienteForm({ cliente, onSuccess, onCancel }: ClienteFormProps) {
  const { createCliente, updateCliente } = useClienteStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    rfc: '',
    activo: true,
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
        direccion: cliente.direccion || '',
        rfc: cliente.rfc || '',
        activo: cliente.activo,
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

    if (formData.rfc && !isValidRFC(formData.rfc)) {
      newErrors.rfc = 'Formato de RFC inválido'
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

  const isValidRFC = (rfc: string): boolean => {
    // Mexican RFC format: 4 letters + 6 digits + 3 alphanumeric (ABCD123456789)
    const rfcRegex = /^[A-Z]{4}\d{6}[A-Z0-9]{3}$/i
    return rfcRegex.test(rfc)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Clean up form data
      const cleanData = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
        direccion: formData.direccion.trim() || undefined,
        rfc: formData.rfc.trim().toUpperCase() || undefined,
        activo: formData.activo,
      }

      if (isEditing && cliente) {
        updateCliente(cliente.id, cleanData)
        onSuccess('Cliente actualizado correctamente')
      } else {
        createCliente(cleanData)
        onSuccess('Cliente creado correctamente')
      }
    } catch (error) {
      console.error('Error saving client:', error)
      // Error handling could show error toast here
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked
      : e.target.value

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
            disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Dirección
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  value={formData.direccion}
                  onChange={handleInputChange('direccion')}
                  rows={2}
                  className={cn(
                    'input-no-zoom w-full pl-10 pr-4 py-2 border rounded-lg resize-none',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                    'placeholder:text-muted-foreground',
                    errors.direccion ? 'border-destructive' : 'border-border'
                  )}
                  placeholder="Av. Revolución 123, Col. Centro"
                  disabled={isLoading}
                />
              </div>
              {errors.direccion && (
                <p className="text-xs text-destructive mt-1">{errors.direccion}</p>
              )}
            </div>

            {/* RFC */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                RFC
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.rfc}
                  onChange={handleInputChange('rfc')}
                  className={cn(
                    'input-no-zoom w-full pl-10 pr-4 py-2 border rounded-lg font-mono',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                    'placeholder:text-muted-foreground uppercase',
                    errors.rfc ? 'border-destructive' : 'border-border'
                  )}
                  placeholder="ABCD123456789"
                  disabled={isLoading}
                  maxLength={13}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              {errors.rfc && (
                <p className="text-xs text-destructive mt-1">{errors.rfc}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Formato: 4 letras + 6 dígitos + 3 caracteres
              </p>
            </div>

            {/* Estado */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={handleInputChange('activo')}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-foreground">
                  Cliente activo
                </span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Los clientes inactivos no aparecerán en las búsquedas del POS
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={onCancel}
            className="btn-touch px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !formData.nombre.trim()}
            className={cn(
              'btn-touch px-6 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              formData.nombre.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isLoading ? (
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