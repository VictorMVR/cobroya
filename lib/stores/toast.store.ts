import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  
  addToast: (message: string, type: ToastType = 'info', duration = 5000) => {
    const id = crypto.randomUUID()
    const toast: Toast = { id, message, type, duration }
    
    set(state => ({
      toasts: [...state.toasts, toast]
    }))
    
    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }
  },
  
  removeToast: (id: string) => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }))
  },
  
  clearToasts: () => {
    set({ toasts: [] })
  },
}))

// Helper hooks
export const useToast = () => {
  const { addToast } = useToastStore()
  
  return {
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
  }
}