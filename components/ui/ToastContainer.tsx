'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore, type ToastType } from '@/lib/stores/toast.store'
import { cn } from '@/lib/utils'

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: 'bg-success/10 border-success/20 text-success',
  error: 'bg-destructive/10 border-destructive/20 text-destructive',
  warning: 'bg-warning/10 border-warning/20 text-warning',
  info: 'bg-primary/10 border-primary/20 text-primary',
}

interface ToastItemProps {
  id: string
  message: string
  type: ToastType
  onRemove: (id: string) => void
}

function ToastItem({ id, message, type, onRemove }: ToastItemProps) {
  const Icon = toastIcons[type]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }}
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
        'max-w-md min-w-[280px]',
        toastStyles[type]
      )}
    >
      <div className="flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>
      
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 p-1 hover:bg-current/10 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()
  
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onRemove={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}