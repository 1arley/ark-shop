'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/use-cart'

interface HeaderProps {
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Header(_props: HeaderProps) {
  const pathname = usePathname()
  const { itemCount: cartCount } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
              className='w-64 pl-10 bg-neutral-800/50 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 focus:border-violet-500 focus:ring-violet-500 h-9'
            />
          </div>
        </div>

        {/* Cart */}
        <Link
          href='/cart'
          className='relative p-2 text-neutral-300 hover:text-white transition-colors'
        >
          <ShoppingCart className='w-5 h-5' />
          {cartCount > 0 && (
            <span className='absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-xs font-medium rounded-full flex items-center justify-center'>
              {cartCount}
            </span>
          )}
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
          </nav>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
  </header>
  )
}