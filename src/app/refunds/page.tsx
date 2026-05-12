'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { RotateCcw, Shield, AlertTriangle, CheckCircle2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const steps = [
  {
    icon: Mail,
    title: '1. Contact Support',
    description: 'Email us at support@arkgames.shop or use our Contact form within 7 days of purchase. Include your order ID and a description of the issue.',
  },
  {
    icon: AlertTriangle,
    title: '2. Issue Verification',
    description: 'Our team will review your case and verify the issue. We may ask for additional information or screenshots to better understand the problem.',
  },
  {
    icon: CheckCircle2,
    title: '3. Resolution',
    description: 'If the issue is confirmed, we will provide a replacement key or, in exceptional cases, process a refund to your original payment method.',
  },
]

const guidelines = [
  'Refunds are processed on a case-by-case basis for technical issues with key activation.',
  'Replacement keys are offered as the primary resolution for defective products.',
  'Refunds are only considered when a replacement key cannot resolve the issue.',
  'Requests must be submitted within 7 days of the original purchase date.',
  'Proof of the issue may be required (e.g., screenshot of error message).',
  'Refunds are processed back to the original payment method within 5-10 business days.',
  'Change of mind or incorrect purchases are not eligible for refunds.',
]

export default function RefundsPage() {
  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

      {/* Hero */}
      <section className='relative pt-24 pb-16 bg-neutral-900 overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-20 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl' />
          <div className='absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl' />
        </div>
        <div className='relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RotateCcw className='w-12 h-12 text-amber-400 mx-auto mb-4' />
            <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
              Refund Policy
            </h1>
            <p className='text-neutral-400 text-lg max-w-2xl mx-auto'>
              Our commitment to your satisfaction, balanced with the nature of digital products
            </p>
          </motion.div>
        </div>
      </section>

      {/* Important Notice */}
      <section className='py-8'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className='p-6 bg-amber-600/10 border border-amber-600/20 rounded-xl'
          >
            <div className='flex items-start gap-4'>
              <Shield className='w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5' />
              <div>
                <h2 className='text-lg font-semibold text-amber-300 mb-2'>Digital Products Policy</h2>
                <p className='text-amber-400/80 text-sm leading-relaxed'>
                  Due to the digital nature of our products (activation keys and software licenses), all sales are generally final once the key has been delivered. However, we stand behind the quality of our products and will work with you to resolve any legitimate issues.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Refund Process */}
      <section className='py-12'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='text-2xl font-semibold text-white mb-8 text-center'
          >
            How to Request a Refund
          </motion.h2>

          <div className='grid md:grid-cols-3 gap-6 mb-12'>
            {steps.map((step, index) => {
              const IconComponent = step.icon
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                >
                  <Card className='bg-neutral-900/50 border-neutral-800 h-full'>
                    <CardContent className='p-6 text-center'>
                      <div className='w-14 h-14 bg-amber-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                        <IconComponent className='w-7 h-7 text-amber-400' />
                      </div>
                      <h3 className='font-semibold text-white mb-2'>{step.title}</h3>
                      <p className='text-neutral-400 text-sm'>{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Guidelines */}
      <section className='pt-28 pb-12 bg-neutral-900/30'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-2xl font-semibold text-white mb-8 text-center'
          >
            Refund Guidelines
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className='bg-neutral-900/50 border-neutral-800'>
              <CardContent className='p-8'>
                <ul className='space-y-4'>
                  {guidelines.map((guideline, index) => (
                    <li key={index} className='flex items-start gap-3 text-neutral-400'>
                      <span className='w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0' />
                      {guideline}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className='py-16'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Need help with an order?
            </h2>
            <p className='text-neutral-400 mb-8'>
              Our support team is available 24/7 to assist you with any issues
            </p>
            <div className='flex gap-4 justify-center'>
              <Link href='/contact'>
                <Button className='bg-white text-neutral-950 hover:bg-neutral-200 h-12 px-8 font-medium'>
                  Contact Support
                </Button>
              </Link>
              <Link href='/faq'>
                <Button variant='outline' className='border-neutral-700 text-neutral-300 hover:bg-neutral-800 h-12 px-8'>
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
