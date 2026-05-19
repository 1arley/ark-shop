'use client'

import Link from 'next/link'
import Image from 'next/image'
import { TwitterIcon, GitHubIcon, LinkedInIcon } from '@/components/icons'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-slate-900 border-t border-slate-800'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid md:grid-cols-4 gap-8'>
          <div className='md:col-span-2'>
            <div className='flex items-center gap-3 mb-4'>
              <Image
                src='/images/site-logo.png'
                alt='Ark Games Shop logo'
                width={40}
                height={40}
                className='w-10 h-10 object-contain'
              />
              <span className='text-xl font-semibold text-white'>Ark Games Shop</span>
            </div>
            <p className='text-slate-400 mb-6 max-w-md'>
              Your trusted destination for genuine digital keys, software licenses, and activation codes. Instant delivery, secure payments, and excellent support.
            </p>
            <div className='flex gap-4'>
              <Link
                href='https://twitter.com/arkgameshop'
                target='_blank'
                rel='noopener noreferrer'
                className='text-slate-400 hover:text-white transition-colors'
                aria-label='Follow us on Twitter'
              >
                <TwitterIcon className='w-6 h-6' />
              </Link>
              <Link
                href='https://github.com/arkgameshop'
                target='_blank'
                rel='noopener noreferrer'
                className='text-slate-400 hover:text-white transition-colors'
                aria-label='View our GitHub'
              >
                <GitHubIcon className='w-6 h-6' />
              </Link>
              <Link
                href='https://linkedin.com/company/arkgameshop'
                target='_blank'
                rel='noopener noreferrer'
                className='text-slate-400 hover:text-white transition-colors'
                aria-label='Connect on LinkedIn'
              >
                <LinkedInIcon className='w-6 h-6' />
              </Link>
            </div>
          </div>

          <div>
            <h4 className='font-semibold text-white mb-4'>Shop</h4>
            <ul className='space-y-2'>
              <li><Link href='/products' className='text-slate-400 hover:text-white transition-colors text-sm'>All Products</Link></li>
              <li><Link href='/categories' className='text-slate-400 hover:text-white transition-colors text-sm'>Categories</Link></li>
              <li><Link href='/products' className='text-slate-400 hover:text-white transition-colors text-sm'>New Arrivals</Link></li>
              <li><Link href='/products' className='text-slate-400 hover:text-white transition-colors text-sm'>Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold text-white mb-4'>Support</h4>
            <ul className='space-y-2'>
              <li><Link href='/contact' className='text-slate-400 hover:text-white transition-colors text-sm'>Contact Us</Link></li>
              <li><Link href='/faq' className='text-slate-400 hover:text-white transition-colors text-sm'>FAQ</Link></li>
              <li><Link href='/terms' className='text-slate-400 hover:text-white transition-colors text-sm'>Terms of Service</Link></li>
              <li><Link href='/privacy' className='text-slate-400 hover:text-white transition-colors text-sm'>Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className='border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500'>
          <p>&copy; {currentYear} Ark Games Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
