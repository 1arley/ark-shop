'use client'

import { useState, Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, CheckCircle2, Loader2, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { apiClient } from '@/services/api'
import { extractApiError } from '@/lib/utils'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SectionHero from '@/components/layout/SectionHero'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get('email') || ''

  const [email, setEmail] = useState(emailFromQuery)
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the code input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResendSuccess(false)

    if (!email) {
      setError('Email is required')
      return
    }

    if (!code || code.length < 4) {
      setError('Please enter the verification code')
      return
    }

    setSubmitting(true)
    try {
      await apiClient.auth.verifyEmail({ email, code })
      setSuccess(true)
      setTimeout(() => router.push('/login?verified=true'), 3000)
    } catch (err) {
      setError(extractApiError(err, 'Invalid or expired verification code'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!email || countdown > 0) return
    setError(null)
    setResendSuccess(false)
    setResending(true)

    try {
      await apiClient.auth.resendVerification(email)
      setResendSuccess(true)
      setCountdown(60)
    } catch {
      setError('Failed to resend verification email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className='min-h-screen bg-neutral-950'>
        <Header />
        <div className='flex items-center justify-center py-32'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='w-full max-w-md mx-4'
          >
            <Card className='bg-neutral-900/50 border-neutral-800'>
              <CardContent className='p-8 text-center'>
                <CheckCircle2 className='w-16 h-16 text-emerald-400 mx-auto mb-4' />
                <h1 className='text-2xl font-bold text-white mb-2'>Email Verified!</h1>
                <p className='text-neutral-400 mb-6'>
                  Your email has been successfully verified. Redirecting to login...
                </p>
                <Button
                  className='bg-white text-neutral-950 hover:bg-neutral-200'
                  onClick={() => router.push('/login')}
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

      <SectionHero
        title='Verify Your Email'
        subtitle='Enter the verification code sent to your email address'
      />

      {/* Verify Email Form */}
      <section className='py-12'>
        <div className='max-w-md mx-auto px-4 sm:px-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className='bg-neutral-900/50 border-neutral-800'>
              <CardContent className='p-8'>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  {error && (
                    <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2'>
                      <AlertCircle className='w-4 h-4 mt-0.5 flex-shrink-0' />
                      <span>{error}</span>
                    </div>
                  )}

                  {resendSuccess && (
                    <div className='p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-start gap-2'>
                      <CheckCircle2 className='w-4 h-4 mt-0.5 flex-shrink-0' />
                      <span>Verification code resent! Check your inbox.</span>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className='text-sm text-neutral-400 mb-2 block'>Email Address</label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500' />
                      <Input
                        type='email'
                        placeholder='you@example.com'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='pl-12 bg-neutral-800 border-neutral-700 text-white'
                        required
                      />
                    </div>
                  </div>

                  {/* Verification Code */}
                  <div>
                    <label className='text-sm text-neutral-400 mb-2 block'>Verification Code</label>
                    <Input
                      ref={inputRef}
                      type='text'
                      placeholder='Enter the 6-digit code'
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className='bg-neutral-800 border-neutral-700 text-white text-center text-lg tracking-widest'
                      maxLength={6}
                      inputMode='numeric'
                      required
                    />
                    <p className='text-xs text-neutral-500 mt-2'>
                      Check your inbox (and spam folder) for the verification code
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type='submit'
                    disabled={submitting}
                    className='w-full bg-violet-600 hover:bg-violet-500 h-12 text-base font-semibold'
                  >
                    {submitting ? (
                      <span className='flex items-center gap-2'>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        Verifying...
                      </span>
                    ) : (
                      'Verify Email'
                    )}
                  </Button>

                  {/* Resend Code */}
                  <div className='text-center'>
                    <p className='text-sm text-neutral-400 mb-2'>Didn&apos;t receive the code?</p>
                    <Button
                      type='button'
                      variant='link'
                      disabled={resending || countdown > 0}
                      onClick={handleResend}
                      className='text-violet-400 hover:text-violet-300 text-sm'
                    >
                      {resending ? (
                        <span className='flex items-center gap-1'>
                          <Loader2 className='w-3 h-3 animate-spin' />
                          Sending...
                        </span>
                      ) : countdown > 0 ? (
                        `Resend code in ${countdown}s`
                      ) : (
                        'Resend verification code'
                      )}
                    </Button>
                  </div>
                </form>

                {/* Back to Login */}
                <p className='text-center text-sm text-neutral-400 mt-6'>
                  <Link href='/login' className='text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1'>
                    <ArrowLeft className='w-4 h-4' />
                    Back to Login
                  </Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-neutral-950 flex items-center justify-center'>
        <div className='w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin' />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
