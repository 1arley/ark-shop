'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, ChevronDown, LayoutDashboard, Edit3, LogOut, ShoppingBag, Bell, Key,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function UserMenu() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Escape key closes menu
  useEffect(() => {
    if (!userMenuOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [userMenuOpen])

  // Arrow key navigation within menu
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = userMenuRef.current?.querySelectorAll('[role="menuitem"]')
    if (!items?.length) return

    const current = document.activeElement
    if (!current) return
    const index = Array.from(items).indexOf(current)
    if (index === -1) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = items[(index + 1) % items.length] as HTMLElement
      next?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = items[(index - 1 + items.length) % items.length] as HTMLElement
      prev?.focus()
    }
  }, [])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    router.push('/')
  }

  return (
    <div className='relative' ref={userMenuRef}>
      <button
        ref={menuButtonRef}
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        aria-expanded={userMenuOpen}
        aria-haspopup="menu"
        className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600/15 border border-violet-600/25 text-violet-300 text-sm font-medium hover:bg-violet-600/25 hover:border-violet-600/35 transition-all duration-200 whitespace-nowrap'
      >
        <User className='w-4 h-4' aria-hidden="true" />
        <span className='hidden xl:inline max-w-[120px] truncate'>
          {user?.name?.split(' ')[0] || 'Account'}
        </span>
        <ChevronDown className={`w-3 h-3 text-violet-400/70 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {userMenuOpen && (
          <motion.div
            role="menu"
            aria-label="User menu"
            onKeyDown={handleMenuKeyDown}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className='absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 backdrop-blur-xl'
          >
            <div className='py-1.5'>
              <div className='px-4 py-2 border-b border-slate-800/60 mb-1'>
                <p className='text-sm font-medium text-white truncate'>{user?.name || 'User'}</p>
                <p className='text-[11px] text-slate-500 truncate'>{user?.email}</p>
              </div>
              <Link
                href='/dashboard'
                role="menuitem"
                onClick={() => setUserMenuOpen(false)}
                className='flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors'
              >
                <LayoutDashboard className='w-4 h-4 text-slate-500' aria-hidden="true" />
                Dashboard
              </Link>
              <Link
                href='/orders'
                role="menuitem"
                onClick={() => setUserMenuOpen(false)}
                className='flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors'
              >
                <ShoppingBag className='w-4 h-4 text-slate-500' aria-hidden="true" />
                My Orders
              </Link>
              <Link
                href='/notifications'
                role="menuitem"
                onClick={() => setUserMenuOpen(false)}
                className='flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors'
              >
                <Bell className='w-4 h-4 text-slate-500' aria-hidden="true" />
                Notifications
              </Link>
              <Link
                href='/my-keys'
                role="menuitem"
                onClick={() => setUserMenuOpen(false)}
                className='flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors'
              >
                <Key className='w-4 h-4 text-slate-500' aria-hidden="true" />
                My Keys
              </Link>
              <Link
                href='/profile'
                role="menuitem"
                onClick={() => setUserMenuOpen(false)}
                className='flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors'
              >
                <Edit3 className='w-4 h-4 text-slate-500' aria-hidden="true" />
                Profile
              </Link>
              <hr className='border-slate-800/60 my-1' />
              <button
                role="menuitem"
                onClick={handleLogout}
                className='flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors'
              >
                <LogOut className='w-4 h-4' aria-hidden="true" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
