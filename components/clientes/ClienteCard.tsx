'use client'

import { useState } from 'react'
import { MoreVertical, User, Phone, Mail, MapPin, FileText, Edit2, Trash2, UserCheck, UserX, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Cliente } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ClienteCardProps {
  cliente: Cliente
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: () => void
}

export function ClienteCard({ cliente, onEdit, onDelete, onToggleStatus }: ClienteCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Generate initials from name
  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: es 
      })
    } catch {
      return 'Fecha inválida'
    }
  }

  // Generate a consistent color based on client name
  const getAvatarColor = (nombre: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-rose-500'
    ]
    
    let hash = 0
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className={cn(
      'bg-card border border-border rounded-lg p-4 space-y-4 transition-all hover:shadow-md',
      !cliente.activo && 'opacity-60 bg-muted/20'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm',
            getAvatarColor(cliente.nombre)
          )}>
            {getInitials(cliente.nombre)}
          </div>
          
          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {cliente.nombre}
              </h3>
              <div className={cn(
                'w-2 h-2 rounded-full',
                cliente.activo ? 'bg-success' : 'bg-muted-foreground'
              )} />
            </div>
            <p className="text-sm text-muted-foreground">
              Cliente {cliente.activo ? 'activo' : 'inactivo'}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => {
                    onEdit()
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar Cliente
                </button>
                
                <button
                  onClick={() => {
                    onToggleStatus()
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center gap-2"
                >
                  {cliente.activo ? (
                    <>
                      <UserX className="h-4 w-4" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Reactivar
                    </>
                  )}
                </button>
                
                <div className="border-t border-border my-1" />
                
                <button
                  onClick={() => {
                    onDelete()
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2">
        {cliente.telefono && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a 
              href={`tel:${cliente.telefono}`}
              className="text-foreground hover:text-primary transition-colors truncate"
            >
              {cliente.telefono}
            </a>
          </div>
        )}
        
        {cliente.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a 
              href={`mailto:${cliente.email}`}
              className="text-foreground hover:text-primary transition-colors truncate"
            >
              {cliente.email}
            </a>
          </div>
        )}
        
        {cliente.direccion && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground text-xs leading-relaxed">
              {cliente.direccion}
            </span>
          </div>
        )}
        
        {cliente.rfc && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground font-mono text-xs">
              {cliente.rfc}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Creado {formatRelativeTime(cliente.created_at)}</span>
        </div>
        
        <div className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          cliente.activo 
            ? 'bg-success/10 text-success'
            : 'bg-muted text-muted-foreground'
        )}>
          {cliente.activo ? 'Activo' : 'Inactivo'}
        </div>
      </div>
    </div>
  )
}