import { cn } from '@/lib/utils'
import type { OrderStatus, PaymentStatus } from '@/types/api'

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string
  variant?: 'order' | 'payment' | 'default'
  size?: 'sm' | 'md'
}

const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'border-neutral-500/50 text-neutral-400 bg-neutral-500/10' },
  AWAITING_PAYMENT: { label: 'Awaiting Payment', className: 'border-amber-500/50 text-amber-400 bg-amber-500/10' },
  PAID: { label: 'Paid', className: 'border-blue-500/50 text-blue-400 bg-blue-500/10' },
  PROCESSING: { label: 'Processing', className: 'border-violet-500/50 text-violet-400 bg-violet-500/10' },
  DELIVERED: { label: 'Delivered', className: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' },
  CANCELLED: { label: 'Cancelled', className: 'border-red-500/50 text-red-400 bg-red-500/10' },
  REFUNDED: { label: 'Refunded', className: 'border-sky-500/50 text-sky-400 bg-sky-500/10' },
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'border-amber-500/50 text-amber-400 bg-amber-500/10' },
  APPROVED: { label: 'Approved', className: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' },
  REJECTED: { label: 'Rejected', className: 'border-red-500/50 text-red-400 bg-red-500/10' },
  REFUNDED: { label: 'Refunded', className: 'border-sky-500/50 text-sky-400 bg-sky-500/10' },
  CANCELLED: { label: 'Cancelled', className: 'border-neutral-500/50 text-neutral-400 bg-neutral-500/10' },
}

export function StatusBadge({ status, variant = 'default', size = 'sm' }: StatusBadgeProps) {
  let config: { label: string; className: string }

  if (variant === 'order' && status in orderStatusConfig) {
    config = orderStatusConfig[status as OrderStatus]
  } else if (variant === 'payment' && status in paymentStatusConfig) {
    config = paymentStatusConfig[status as PaymentStatus]
  } else {
    // Default: derive color from status string
    const upperStatus = status.toUpperCase()
    if (['DELIVERED', 'APPROVED', 'ACTIVE', 'SENT', 'COMPLETED'].some(s => upperStatus.includes(s))) {
      config = { label: status, className: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' }
    } else if (['PENDING', 'PROCESSING', 'AWAITING'].some(s => upperStatus.includes(s))) {
      config = { label: status, className: 'border-amber-500/50 text-amber-400 bg-amber-500/10' }
    } else if (['CANCELLED', 'REJECTED', 'FAILED', 'INACTIVE'].some(s => upperStatus.includes(s))) {
      config = { label: status, className: 'border-red-500/50 text-red-400 bg-red-500/10' }
    } else {
      config = { label: status, className: 'border-neutral-500/50 text-neutral-400 bg-neutral-500/10' }
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
