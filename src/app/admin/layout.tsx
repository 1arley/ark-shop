'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, Users, Tags, KeyRound, ShoppingBag,
  ShieldAlert, Activity, Bell, Store, ChevronLeft,
  PanelLeftClose, PanelLeft, LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/keys', label: 'Keys', icon: KeyRound },
  { href: '/admin/sellers', label: 'Sellers', icon: Store },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/fraud', label: 'Fraud Logs', icon: ShieldAlert },
  { href: '/admin/health', label: 'System Health', icon: Activity },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isLoading && mounted) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin')
      } else if (!isAdmin) {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, router, mounted])

  if (!mounted || isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className='min-h-screen bg-neutral-950 flex items-center justify-center'>
        <div className='w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-neutral-950 flex'>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 bg-neutral-900 border-r border-neutral-800
          transition-all duration-300 flex flex-col
          ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Logo */}
        <div className='h-16 flex items-center px-4 border-b border-neutral-800'>
          <Link href='/admin' className='flex items-center gap-3 min-w-0'>
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0'>
              <LayoutDashboard className='w-4 h-4 text-white' />
            </div>
            <AnimatePresence mode='wait'>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className='text-sm font-semibold text-white whitespace-nowrap overflow-hidden'
                >
                  Admin Panel
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className='ml-auto p-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors flex-shrink-0'
          >
            {sidebarCollapsed ? <PanelLeft className='w-4 h-4' /> : <PanelLeftClose className='w-4 h-4' />}
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto py-4 px-2 space-y-1'>
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
              >
                <item.icon className='w-5 h-5 flex-shrink-0' />
                <AnimatePresence mode='wait'>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='text-sm font-medium whitespace-nowrap'
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId='activeTab'
                    className='absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-amber-500 rounded-full'
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className='border-t border-neutral-800 p-2 space-y-1'>
          <Link
            href='/'
            className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-all text-sm'
          >
            <ChevronLeft className='w-4 h-4' />
            {!sidebarCollapsed && <span>Back to Store</span>}
          </Link>
          <button
            onClick={() => { logout(); router.push('/') }}
            className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm w-full'
          >
            <LogOut className='w-4 h-4' />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top bar */}
        <header className='h-16 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-end px-6 gap-4 sticky top-0 z-30 backdrop-blur-xl'>
          <div className='flex items-center gap-3'>
            <span className='text-sm text-neutral-400'>
              {user?.name}
            </span>
            <span className='text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20'>
              {user?.role}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className='p-6'>
          {children}
        </div>
      </main>
    </div>
  )
}
