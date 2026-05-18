'use client'

import { motion } from 'framer-motion'
import { Package, AlertCircle, Search, Inbox, Ban } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: 'package' | 'alert' | 'search' | 'inbox' | 'ban'
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

const iconMap = {
  package: Package,
  alert: AlertCircle,
  search: Search,
  inbox: Inbox,
  ban: Ban,
}

export function EmptyState({
  icon = 'package',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const IconComponent = iconMap[icon]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='flex flex-col items-center justify-center py-16 text-center'
    >
      <div className='w-20 h-20 bg-neutral-800/50 rounded-2xl flex items-center justify-center mb-6'>
        <IconComponent className='w-10 h-10 text-neutral-600' />
      </div>
      <h3 className='text-xl font-semibold text-white mb-2'>{title}</h3>
      <p className='text-neutral-400 max-w-md mb-8'>{description}</p>
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Button asChild className='bg-violet-600 hover:bg-violet-500'>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button onClick={onAction} className='bg-violet-600 hover:bg-violet-500'>
            {actionLabel}
          </Button>
        )
      )}
    </motion.div>
  )
}
