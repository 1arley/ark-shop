'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { apiClient } from '@/services/api'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await apiClient.post('/auth/forgot-password', { email })
      setSubmitted(true)
    } catch {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

      {/* Hero */}
      <section className='relative pt-24 pb-12 bg-neutral-900'>
        <div className='absolute inset-0'>
          <div className='absolute top-20 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl' />
        </div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='text-center'
          >
            <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
              Reset Your Password
            </h1>
            <p className='text-neutral-400 text-lg'>
              Enter your email and we&apos;ll send you instructions to reset your password
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className='py-12'>
        <div className='max-w-md mx-auto px-4 sm:px-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className='bg-neutral-900/50 border-neutral-800'>
              <CardContent className='p-8'>
                {submitted ? (
                  <div className='text-center py-6'>
                    <div className='w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <CheckCircle2 className='w-8 h-8 text-emerald-500' />
                    </div>
                    <h3 className='text-xl font-semibold text-white mb-2'>Check Your Email</h3>
                    <p className='text-neutral-400 mb-6'>
                      If an account exists with {email}, you&apos;ll receive password reset instructions shortly.
                    </p>
                    <Button
                      variant='outline'
                      className='border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                      onClick={() => router.push('/login')}
                    >
                      <ArrowLeft className='w-4 h-4 mr-2' />
                      Back to Login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className='space-y-6'>
                    {error && (
                      <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm'>
                        {error}
                      </div>
                    )}

                    <div>
                      <label className='text-sm text-neutral-300 mb-2 block'>Email Address</label>
                      <div className='relative'>
                        <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500' />
                        <Input
                          type='email'
                          placeholder='you@example.com'
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className='pl-12 bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500'
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type='submit'
                      disabled={submitting}
                      className='w-full bg-white text-neutral-950 hover:bg-neutral-200 h-12 text-base font-semibold'
                    >
                      {submitting ? (
                        <span className='flex items-center gap-2'>
                          <Loader2 className='w-4 h-4 animate-spin' />
                          Sending...
                        </span>
                      ) : (
                        'Send Reset Instructions'
                      )}
                    </Button>

                    <p className='text-center text-sm text-neutral-500'>
                      <Link href='/login' className='text-violet-400 hover:text-violet-300 font-medium'>
                        <ArrowLeft className='w-4 h-4 inline mr-1' />
                        Back to Login
                      </Link>
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
