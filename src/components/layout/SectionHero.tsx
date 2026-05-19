import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface SectionHeroProps {
  title: string
  subtitle?: string
  badge?: ReactNode
  actions?: ReactNode
  backLink?: { href: string; label: string }
}

export default function SectionHero({ title, subtitle, badge, actions, backLink }: SectionHeroProps) {
  return (
    <section className='section-hero'>
      <div className='section-container'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {backLink && (
            <Link
              href={backLink.href}
              className='inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-white mb-4 transition-colors'
            >
              <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2} aria-hidden="true">
                <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
              </svg>
              {backLink.label}
            </Link>
          )}
          <div className='flex items-center gap-4 flex-wrap'>
            <h1 className='text-4xl md:text-5xl font-display text-white uppercase tracking-wide'>
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className='text-neutral-400 text-lg mt-2 max-w-2xl'>{subtitle}</p>
          )}
          {actions && (
            <div className='flex gap-3 mt-6'>{actions}</div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
