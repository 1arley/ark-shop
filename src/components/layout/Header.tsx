'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Search, Menu, X, User, LogOut, Settings, Bell, Edit3, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { NotificationBadge } from '@/components/layout/NotificationBadge'
import { UserMenu } from '@/components/layout/UserMenu'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount: cartCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [scrolled, setScrolled] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
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

    const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        setIsMobileMenuOpen(false)
      }
    }

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled || pathname !== '/'
                ? 'bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/80'
                : 'bg-transparent'
            }`}>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-20 md:h-24'>
                    {/* Logo */}
                    <Link href='/' className='flex items-center gap-4 group shrink-0'>
                        <div className='relative w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 flex items-center justify-center overflow-hidden'>
                            <Image
                                src='/images/site-logo.png'
                                alt='Ark Games Shop'
                                width={28}
                                height={28}
                                className='w-7 h-7 object-contain'
                                priority
                            />
                        </div>
                        <span className='text-lg font-bold tracking-tight text-white hidden sm:block'>
                            Ark<span className='text-violet-400'>Shop</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className='hidden lg:flex items-center gap-1'>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    pathname === link.href
                                        ? 'text-white bg-white/5'
                                        : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
        <div className='flex items-center gap-2 md:gap-6'>
        {/* Search Bar — Desktop only */}
        <div className='hidden md:flex items-center'>
          <div className='relative group'>
            <Search className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors' />
            <Input
              type='text'
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className='w-36 lg:w-56 pl-10 pr-3 h-9 bg-slate-800/40 border-slate-700/60 text-slate-200 placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20 rounded-xl text-sm transition-all duration-300'
            />
          </div>
        </div>

        {/* Separator — Desktop only */}
        <div className='hidden md:block w-px h-6 bg-slate-700/50' />

        {/* Cart — sempre visível em mobile e desktop */}
        <Link
          href='/cart'
          className='relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-200'
          title='Shopping Cart'
        >
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <ShoppingCart className='w-[18px] h-[18px]' />
          </motion.div>
          <span
            className={`absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-all duration-300 ${
              mounted && cartCount > 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
          >
            {mounted ? cartCount : 0}
          </span>
        </Link>

        {/* Auth + User Actions — Desktop only */}
        <div className='hidden md:flex items-center gap-3'>
          {isAuthenticated ? (
            <>
              {/* Admin badge */}
              {user?.role && ['ADMIN', 'SUPERADMIN'].includes(user.role) && (
                <Link
                  href='/admin'
                  className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide hover:bg-amber-500/20 hover:border-amber-500/30 transition-all duration-200'
                  title='Admin Panel'
                >
                  <Settings className='w-3.5 h-3.5' />
                  <span className='hidden xl:inline'>Admin</span>
                </Link>
              )}

              {/* Notifications */}
              <NotificationBadge />

              {/* Separator */}
              <div className='w-px h-5 bg-slate-700/40' />

              {/* User dropdown */}
              <UserMenu />
            </>
          ) : (
            <>
              <Link
                href='/login'
                className='px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors'
              >
                Sign In
              </Link>
              <Link
                href='/register'
                className='px-4 py-1.5 text-sm font-semibold bg-white text-slate-900 rounded-lg hover:bg-slate-200 transition-all duration-200'
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant='ghost'
          size='icon'
          className='md:hidden text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl'
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
        className='md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800'
      >
        <div className='px-4 py-5 space-y-5'>
          <form onSubmit={handleSearchSubmit}>
            <Input
              type='text'
              placeholder='Search products...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className='w-full bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-xl'
            />
          </form>
          <nav className='flex flex-col gap-1'>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-violet-600/15 text-violet-300 border border-violet-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {/* Auth links in mobile menu */}
            <div className='border-t border-slate-800 pt-4 mt-3 space-y-1'>
              {isAuthenticated ? (
                <>
                  {user?.role && ['ADMIN', 'SUPERADMIN'].includes(user.role) && (
                    <Link
                      href='/admin'
                      className='flex items-center gap-3 px-4 py-3 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors text-sm font-medium'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className='w-4 h-4' />
                      Admin Panel
                    </Link>
                  )}
                  {user?.role && ['ADMIN', 'SUPERADMIN'].includes(user.role) && (
                    <Link
                      href='/admin/notifications'
                      className='flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors text-sm font-medium'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Bell className='w-4 h-4' />
                      Admin Notifications
                    </Link>
                  )}
                  <Link
                    href='/notifications'
                    className='flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors text-sm font-medium'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Bell className='w-4 h-4' />
                    My Notifications
                  </Link>
                  <Link
                    href='/dashboard'
                    className='flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors text-sm font-medium'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className='w-4 h-4' />
                    Dashboard
                  </Link>
                  <Link
                    href='/profile'
                    className='flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors text-sm font-medium'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Edit3 className='w-4 h-4' />
                    Profile
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false) }}
                    className='flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium'
                  >
                    <LogOut className='w-4 h-4' />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href='/login'
                    className='flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors text-sm font-medium'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className='w-4 h-4' />
                    Sign In
                  </Link>
                  <Link
                    href='/register'
                    className='flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors text-sm font-semibold mt-2'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
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
