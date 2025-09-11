'use client'

import { useUIStore } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { Filter, X } from 'lucide-react'

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

export function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useUIStore()

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
      <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Categorías:</span>
      </div>

      {/* All products button */}
      <button
        onClick={() => setSelectedCategory(null)}
        className={cn(
          'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors tap-feedback',
          selectedCategory === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        )}
      >
        Todos
      </button>

      {/* Category buttons */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(
            selectedCategory === category.id ? null : category.id
          )}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors tap-feedback border',
            selectedCategory === category.id
              ? 'text-white border-transparent'
              : 'bg-background text-foreground border-border hover:bg-secondary'
          )}
          style={{
            backgroundColor: selectedCategory === category.id ? category.color : undefined,
          }}
        >
          {category.nombre}
          {selectedCategory === category.id && (
            <X className="h-3 w-3 ml-1 inline" />
          )}
        </button>
      ))}
    </div>
  )
}