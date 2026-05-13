'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Search, Menu, X, User, LogOut, Settings, Bell, Edit3, ChevronDown, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/services/api'

interface HeaderProps {
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Header(_props: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount: cartCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [scrolled, setScrolled] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const userMenuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => { setMounted(true) }, [])

  // Fecha o menu ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const [unreadCount, setUnreadCount] = React.useState(0)

  React.useEffect(() => {
    if (!isAuthenticated) return

    const fetchUnread = async () => {
      try {
        const res = await apiClient.notifications.countUnread()
        setUnreadCount(res.data.count)
      } catch { /* ignore */ }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 60000)
    const onFocus = () => fetchUnread()
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [isAuthenticated])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
        { href: '/categories', label: 'Categories' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ]

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || pathname !== '/'
            ? 'bg-slate-950/90 backdrop-blur-lg border-b border-slate-800'
            : 'bg-transparent'
            }`}>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16 md:h-20'>
                    {/* Logo */}
                    <Link href='/' className='flex items-center gap-3 group'>
                        <Image
                            src='/images/site-logo.png'
                            alt='Ark Games Shop'
                            width={40}
                            height={40}
                            className='w-10 h-10 object-contain'
                            priority
                        />
                        <span className='text-xl font-semibold text-white hidden sm:block'>Ark Games Shop</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className='hidden md:flex items-center gap-8'>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors ${pathname === link.href
                                    ? 'text-white'
                                    : 'text-slate-300 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
        <div className='flex items-center gap-3 md:gap-4'>
        {/* Search Bar */}
        <div className='hidden sm:flex items-center'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400' />
            <Input
              type='text'
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className='w-40 lg:w-64 pl-10 bg-neutral-800/50 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 focus:border-violet-500 focus:ring-violet-500 h-9 transition-all duration-200'
            />
          </div>
        </div>

        {/* Auth Buttons — Desktop */}
        {isAuthenticated ? (
          <div className='hidden md:flex items-center gap-1'>
            {/* Admin badge — só para admins */}
            {user?.role && ['ADMIN', 'SUPERADMIN'].includes(user.role) && (
              <Link
                href='/admin'
                className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition-colors'
                title='Admin Panel'
              >
                <Settings className='w-3.5 h-3.5' />
                <span className='hidden lg:inline'>Admin</span>
              </Link>
            )}

            {/* User dropdown */}
            <div className='relative' ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600/20 border border-violet-600/30 text-violet-300 text-sm font-medium hover:bg-violet-600/30 transition-colors whitespace-nowrap'
              >
                <User className='w-4 h-4' />
                <span className='hidden lg:inline max-w-[100px] truncate'>
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className='absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50'
                  >
                    <div className='py-1'>
                      <Link
                        href='/dashboard'
                        onClick={() => setUserMenuOpen(false)}
                        className='flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors'
                      >
                        <LayoutDashboard className='w-4 h-4' />
                        Dashboard
                      </Link>
                      <Link
                        href='/profile'
                        onClick={() => setUserMenuOpen(false)}
                        className='flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors'
                      >
                        <Edit3 className='w-4 h-4' />
                        Profile
                      </Link>
                      <hr className='border-neutral-800 my-1' />
                      <button
                        onClick={() => { handleLogout(); setUserMenuOpen(false) }}
                        className='flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-neutral-300 hover:text-red-400 hover:bg-red-500/10 transition-colors'
                      >
                        <LogOut className='w-4 h-4' />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className='hidden md:flex items-center gap-2'>
            <Link
              href='/login'
              className='px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors'
            >
              Sign In
            </Link>
            <Link
              href='/register'
              className='px-4 py-1.5 text-sm font-medium bg-white text-neutral-950 rounded-full hover:bg-neutral-200 transition-colors'
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Notifications */}
        {isAuthenticated && (
          <Link
            href={user?.role && ['ADMIN', 'SUPERADMIN'].includes(user.role) ? '/admin/notifications' : '#'}
            className='relative p-2 text-neutral-300 hover:text-white transition-colors'
            onClick={(e) => {
              if (!user?.role || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
                e.preventDefault()
              }
            }}
          >
            <Bell className='w-5 h-5' />
            <span
              className={`absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center justify-center transition-all duration-300 ${
                mounted && unreadCount > 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            >
              {mounted ? (unreadCount > 99 ? '99+' : unreadCount) : 0}
            </span>
          </Link>
        )}

        {/* Cart */}
        <Link
          href='/cart'
          className='relative p-2 text-neutral-300 hover:text-white transition-colors'
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <ShoppingCart className='w-5 h-5' />
          </motion.div>
          {/* Always render badge to prevent hydration mismatch; hide via CSS when 0 */}
          <span
            className={`absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-xs font-medium rounded-full flex items-center justify-center transition-all duration-300 ${
              mounted && cartCount > 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
          >
            {mounted ? cartCount : 0}
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <Button
          variant='ghost'
          size='icon'
          className='md:hidden text-neutral-300 hover:text-white'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
        </Button>
      </div>
    </div>
  </div>

  {/* Mobile Menu */}
  <AnimatePresence>
    {isMobileMenuOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className='md:hidden bg-neutral-900 border-t border-neutral-800'
      >
        <div className='px-4 py-4 space-y-4'>
          <Input
            type='text'
            placeholder='Search products...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className='w-full bg-neutral-800/50 border-neutral-700 text-neutral-200'
          />
          <nav className='flex flex-col gap-2'>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  pathname === link.href
                    ? 'bg-violet-600 text-white'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {/* Auth links in mobile menu */}
            <div className='border-t border-neutral-800 pt-2 mt-2'>
              {isAuthenticated ? (
                <>
                  {user?.role && ['ADMIN', 'SUPERADMIN'].includes(user.role) && (
                    <Link
                      href='/admin'
                      className='flex items-center gap-3 px-3 py-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className='w-4 h-4' />
                      <span className='text-sm'>Admin Panel</span>
                    </Link>
                  )}
                  <Link
                    href='/dashboard'
                    className='flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className='w-4 h-4' />
                    <span className='text-sm'>{user?.name || 'Dashboard'}</span>
                  </Link>
                  <Link
                    href='/profile'
                    className='flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Edit3 className='w-4 h-4' />
                    <span className='text-sm'>Profile</span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false) }}
                    className='flex items-center gap-3 w-full px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors'
                  >
                    <LogOut className='w-4 h-4' />
                    <span className='text-sm'>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href='/login'
                    className='flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className='w-4 h-4' />
                    <span className='text-sm'>Sign In</span>
                  </Link>
                  <Link
                    href='/register'
                    className='flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className='text-sm font-medium'>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
  </header>
  )
}
