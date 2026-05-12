'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, Search, HelpCircle, Package, CreditCard, Truck, Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface FaqItem {
  question: string
  answer: string
  category: string
}

const faqData: FaqItem[] = [
  {
    category: 'Orders & Delivery',
    question: 'How do I receive my digital key after purchase?',
    answer: 'After your payment is confirmed, your digital key will be displayed immediately on the screen and also sent to your registered email address. You can also access all your purchased keys anytime through your Dashboard.',
  },
  {
    category: 'Orders & Delivery',
    question: 'How long does delivery take?',
    answer: 'Delivery is instant for most products. As soon as your payment is confirmed, the digital key is released and available for download. In rare cases, manual verification may take up to 15 minutes.',
  },
  {
    category: 'Orders & Delivery',
    question: 'Can I cancel my order?',
    answer: 'Orders can be cancelled only if the payment has not been processed yet. Once the payment is confirmed and the key has been delivered, cancellations are no longer possible. Please contact support if you need assistance.',
  },
  {
    category: 'Orders & Delivery',
    question: 'What happens if my key doesn\'t work?',
    answer: 'All our keys are 100% genuine and sourced directly from authorized distributors. In the unlikely event that a key doesn\'t work, contact our support team within 7 days of purchase, and we\'ll replace it promptly.',
  },
  {
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer: 'We currently accept PIX payments via Mercado Pago. This allows for instant payment confirmation and immediate delivery of your digital keys.',
  },
  {
    category: 'Payments',
    question: 'Is my payment information secure?',
    answer: 'Absolutely. All transactions are processed through Mercado Pago\'s encrypted platform. We do not store any credit card or payment information on our servers. Your security is our top priority.',
  },
  {
    category: 'Payments',
    question: 'How does PIX payment work?',
    answer: 'After placing your order, a PIX QR Code and copy-paste code will be generated. Open your banking app, scan the QR code or paste the PIX code, confirm the payment, and your keys will be delivered instantly.',
  },
  {
    category: 'Payments',
    question: 'Can I get a refund?',
    answer: 'Due to the digital nature of our products, we generally do not offer refunds after the key has been delivered. However, if you encounter any issues, please contact our support team and we\'ll review your case individually.',
  },
  {
    category: 'Account',
    question: 'How do I create an account?',
    answer: 'Click the "Sign Up" button in the top navigation or visit the Register page. Fill in your name, email, and create a password. After registration, you\'ll be automatically logged in and redirected to your Dashboard.',
  },
  {
    category: 'Account',
    question: 'I forgot my password. What should I do?',
    answer: 'Visit the Forgot Password page, enter your registered email address, and follow the instructions sent to your inbox to reset your password.',
  },
  {
    category: 'Account',
    question: 'Can I change my email address?',
    answer: 'Currently, email changes are not available through the website. Please contact our support team to update your email address, and we\'ll assist you promptly.',
  },
  {
    category: 'Products',
    question: 'Are your products genuine?',
    answer: 'Yes, 100%. All digital keys and licenses sold on Ark Games Shop are sourced directly from official distributors and publishers. We guarantee authenticity on every product.',
  },
  {
    category: 'Products',
    question: 'Do your products have an expiration date?',
    answer: 'No. All digital keys purchased from our store are permanent and have no expiration date. They are yours to keep forever.',
  },
  {
    category: 'Products',
    question: 'Can I gift a product to someone else?',
    answer: 'Yes! You can purchase a key as a gift. After purchase, you\'ll receive the key which you can forward to the recipient. We recommend creating an account to keep track of all your purchases.',
  },
]

const categories = ['All', 'Orders & Delivery', 'Payments', 'Account', 'Products']

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const filtered = faqData.filter((item) => {
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

      {/* Hero */}
      <section className='relative pt-24 pb-16 bg-neutral-900 overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-20 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl' />
        </div>
        <div className='relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HelpCircle className='w-12 h-12 text-violet-400 mx-auto mb-4' />
            <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
              Frequently Asked Questions
            </h1>
            <p className='text-neutral-400 text-lg mb-8'>
              Everything you need to know about our products, payments, and more
            </p>
            <div className='relative max-w-xl mx-auto'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500' />
              <Input
                type='text'
                placeholder='Search questions...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-12 h-12 bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 focus:border-violet-500 focus:ring-violet-500'
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className='py-8 border-b border-neutral-800'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-wrap gap-3 justify-center'>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-violet-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className='py-12'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
          {filtered.length === 0 ? (
            <div className='text-center py-12'>
              <Search className='w-12 h-12 text-neutral-600 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-white mb-2'>No results found</h3>
              <p className='text-neutral-500'>Try a different search term or category</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {filtered.map((item, index) => {
                const itemKey = item.question + item.category
                const isOpen = openItems.has(itemKey)
                return (
                  <motion.div
                    key={itemKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <Card className='bg-neutral-900/50 border-neutral-800 overflow-hidden'>
                      <button
                        onClick={() => toggleItem(itemKey)}
                        className='w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-neutral-800/30 transition-colors'
                      >
                        <div className='flex-1'>
                          <span className='text-xs text-violet-400 mb-1 block'>{item.category}</span>
                          <span className='text-white font-medium'>{item.question}</span>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-neutral-500 flex-shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className='overflow-hidden'
                          >
                            <div className='px-5 pb-5 text-neutral-400 text-sm leading-relaxed border-t border-neutral-800 pt-4'>
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Still have questions */}
      <section className='py-16 bg-neutral-900/30'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Still have questions?
            </h2>
            <p className='text-neutral-400 mb-8'>
              Our support team is available 24/7 to help you
            </p>
            <Link href='/contact'>
              <Button className='bg-white text-neutral-950 hover:bg-neutral-200 h-12 px-8 font-medium'>
                Contact Support
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
