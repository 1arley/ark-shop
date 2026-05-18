'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
      confirmButton: 'bg-red-600 hover:bg-red-500 text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      confirmButton: 'bg-amber-600 hover:bg-amber-500 text-white',
    },
    default: {
      icon: AlertTriangle,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10',
      confirmButton: 'bg-violet-600 hover:bg-violet-500 text-white',
    },
  }

  const config = variantConfig[variant]
  const IconComponent = config.icon

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className='bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md mx-4 overflow-hidden'
          >
            <div className='flex items-center justify-between p-6 border-b border-neutral-800'>
              <div className='flex items-center gap-3'>
                <div className={`w-10 h-10 rounded-lg ${config.iconBg} flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                <h2 className='text-lg font-semibold text-white'>{title}</h2>
              </div>
              <button onClick={onCancel} className='text-neutral-400 hover:text-white transition-colors'>
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='p-6'>
              <p className='text-neutral-400 text-sm'>{description}</p>
            </div>

            <div className='flex gap-3 justify-end p-6 border-t border-neutral-800'>
              <Button
                variant='outline'
                onClick={onCancel}
                disabled={loading}
                className='border-neutral-700 text-neutral-300 hover:bg-neutral-800'
              >
                {cancelLabel}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={loading}
                className={config.confirmButton}
              >
                {loading ? (
                  <span className='flex items-center gap-2'>
                    <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Processing...
                  </span>
                ) : (
                  confirmLabel
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
