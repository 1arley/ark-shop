'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using Ark Games Shop ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our services. We reserve the right to modify these terms at any time, and continued use of the Platform constitutes acceptance of such modifications.',
  },
  {
    title: '2. Description of Services',
    content: 'Ark Games Shop is a digital marketplace that sells activation keys, software licenses, and digital codes for games and software. All products are delivered digitally via email and through your account dashboard. We facilitate the sale of digital keys from authorized distributors to end users.',
  },
  {
    title: '3. User Accounts',
    content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during registration. We reserve the right to suspend or terminate accounts that violate our terms.',
  },
  {
    title: '4. Product Descriptions & Pricing',
    content: 'We strive to ensure that all product descriptions, images, and pricing are accurate. However, we do not warrant that product descriptions or other content are error-free. Prices are subject to change without notice. All prices are displayed in Brazilian Real (BRL) and include applicable taxes unless otherwise stated.',
  },
  {
    title: '5. Payment Processing',
    content: 'All payments are processed securely through Mercado Pago. By making a purchase, you agree to Mercado Pago\'s terms of service. We do not store any payment information on our servers. PIX is our primary payment method, providing instant payment confirmation.',
  },
  {
    title: '6. Digital Delivery',
    content: 'Digital keys are delivered instantly upon payment confirmation. It is your responsibility to ensure that your email address is correct and that you have access to your account dashboard. We are not responsible for undelivered keys due to incorrect contact information.',
  },
  {
    title: '7. Refunds & Returns',
    content: 'Due to the digital nature of our products, all sales are final once the key has been delivered. Refunds are handled on a case-by-case basis. If you experience issues with a purchased key, please contact our support team within 7 days of purchase for assistance.',
  },
  {
    title: '8. Intellectual Property',
    content: 'All digital keys sold on our platform are licensed, not sold. You receive a license to use the software or game in accordance with the publisher\'s terms. You may not resell, distribute, or transfer the keys except as expressly permitted by the publisher.',
  },
  {
    title: '9. Prohibited Activities',
    content: 'You agree not to: (a) use the Platform for any illegal purpose; (b) attempt to bypass our security measures; (c) interfere with the proper functioning of the Platform; (d) engage in any activity that could damage, disable, or impair our servers or networks.',
  },
  {
    title: '10. Limitation of Liability',
    content: 'Ark Games Shop shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Platform. Our total liability shall not exceed the amount paid by you for the specific product giving rise to the claim.',
  },
  {
    title: '11. Contact Information',
    content: 'For questions about these Terms of Service, please contact our support team through the Contact page or email us at support@arkgames.shop. We aim to respond to all inquiries within 24 hours.',
  },
]

export default function TermsPage() {
  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

      {/* Hero */}
      <section className='relative pt-24 pb-16 bg-neutral-900 overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-20 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl' />
        </div>
        <div className='relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FileText className='w-12 h-12 text-violet-400 mx-auto mb-4' />
            <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
              Terms of Service
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
          <div className='space-y-8'>
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
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
            transition={{ duration: 0.4, delay: 0.6 }}
            className='mt-12 p-8 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center'
          >
            <Shield className='w-10 h-10 text-violet-400 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-white mb-2'>Have Questions?</h2>
            <p className='text-neutral-400 mb-6'>
              If you have any questions about these terms, please contact us
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
