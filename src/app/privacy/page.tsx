'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Lock, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const sections = [
  {
    title: '1. Information We Collect',
    content: 'We collect information you provide directly to us, including your name, email address, and account credentials when you register. When you make a purchase, payment information is processed by our payment provider (Mercado Pago) and is not stored on our servers. We also collect information automatically, such as your IP address, browser type, and usage patterns to improve our services.',
  },
  {
    title: '2. How We Use Your Information',
    content: 'We use your information to: process your orders and deliver digital keys; communicate with you about your purchases; provide customer support; improve and personalize your experience; send important account-related notices; comply with legal obligations. We do not sell your personal information to third parties.',
  },
  {
    title: '3. Data Protection & Security',
    content: 'We implement industry-standard security measures to protect your data, including SSL/TLS encryption for all data transmitted between your browser and our servers. Your password is hashed and never stored in plain text. Access to personal data is restricted to authorized personnel only. Despite our best efforts, no method of electronic storage is 100% secure.',
  },
  {
    title: '4. Cookies & Tracking',
    content: 'We use necessary cookies to maintain your session and authentication state. We may also use analytics cookies to understand how you interact with our Platform. You can control cookie preferences through your browser settings. Disabling cookies may affect certain functionality of the Platform.',
  },
  {
    title: '5. Third-Party Services',
    content: 'We use Mercado Pago for payment processing. Your payment information is handled directly by Mercado Pago in accordance with their privacy policy and security standards. We do not have access to your full payment credentials. We may also use analytics services to improve our Platform.',
  },
  {
    title: '6. Your Rights',
    content: 'You have the right to: access your personal data stored on our Platform; request correction of inaccurate data; request deletion of your account and associated data; withdraw consent for data processing where applicable; receive a copy of your data in a portable format. To exercise these rights, contact our support team.',
  },
  {
    title: '7. Data Retention',
    content: 'We retain your account information for as long as your account is active. Order history and transaction records are retained as required by applicable tax and financial regulations. If you delete your account, your personal data will be removed within 30 days, except where retention is required by law.',
  },
  {
    title: '8. Children\'s Privacy',
    content: 'Our Platform is not intended for individuals under the age of 13 (or the applicable age of digital consent in your jurisdiction). We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will delete it promptly.',
  },
  {
    title: '9. Changes to This Policy',
    content: 'We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and, where appropriate, via email. Your continued use of the Platform after changes constitutes acceptance of the updated policy.',
  },
  {
    title: '10. Contact Us',
    content: 'If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at support@arkgames.shop or through our Contact page. We aim to respond to all privacy-related inquiries within 48 hours.',
  },
]

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

      {/* Hero */}
      <section className='relative pt-24 pb-16 bg-neutral-900 overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-20 left-1/3 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl' />
        </div>
        <div className='relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Shield className='w-12 h-12 text-emerald-400 mx-auto mb-4' />
            <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
              Privacy Policy
            </h1>
            <p className='text-neutral-400 text-lg'>
              Last updated: January 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className='py-12'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className='p-6 bg-emerald-600/10 border border-emerald-600/20 rounded-xl mb-10'
          >
            <div className='flex items-start gap-4'>
              <Lock className='w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5' />
              <div>
                <h2 className='text-lg font-semibold text-emerald-300 mb-2'>Our Commitment to Privacy</h2>
                <p className='text-emerald-400/80 text-sm leading-relaxed'>
                  At Ark Games Shop, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information when you use our Platform. By using our services, you agree to the practices described in this policy.
                </p>
              </div>
            </div>
          </motion.div>

          <div className='space-y-8'>
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              >
                <h2 className='text-xl font-semibold text-white mb-3'>{section.title}</h2>
                <p className='text-neutral-400 leading-relaxed'>{section.content}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className='mt-12 p-8 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center'
          >
            <Eye className='w-10 h-10 text-emerald-400 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-white mb-2'>Privacy Questions?</h2>
            <p className='text-neutral-400 mb-6'>
              We&apos;re here to answer any questions about your data and privacy
            </p>
            <div className='flex gap-4 justify-center'>
              <Link href='/contact'>
                <Button className='bg-white text-neutral-950 hover:bg-neutral-200'>
                  Contact Us
                </Button>
              </Link>
              <Link href='/faq'>
                <Button variant='outline' className='border-neutral-700 text-neutral-300 hover:bg-neutral-800'>
                  View FAQ
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
