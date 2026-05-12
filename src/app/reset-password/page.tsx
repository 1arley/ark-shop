'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { apiClient } from '@/services/api'
import { extractApiError } from '@/lib/utils'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isTokenValid = token.length > 0 && email.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      await apiClient.auth.resetPassword({ token, email, password })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err) {
      setError(extractApiError(err, 'Failed to reset password. The link may have expired.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!isTokenValid) {
    return (
      <div className='min-h-screen bg-neutral-950'>
        <Header />
        <div className='flex items-center justify-center py-32'>
          <Card className='bg-neutral-900/50 border-neutral-800 w-full max-w-md mx-4'>
            <CardContent className='p-8 text-center'>
              <AlertCircle className='w-12 h-12 text-red-400 mx-auto mb-4' />
              <h1 className='text-2xl font-bold text-white mb-2'>Invalid Link</h1>
              <p className='text-neutral-400 mb-6'>This password reset link is invalid or has expired.</p>
              <Button className='bg-white text-neutral-950 hover:bg-neutral-200' onClick={() => router.push('/forgot-password')}>
                Request New Link
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  if (success) {
    return (
      <div className='min-h-screen bg-neutral-950'>
        <Header />
        <div className='flex items-center justify-center py-32'>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='w-full max-w-md mx-4'>
            <Card className='bg-neutral-900/50 border-neutral-800'>
              <CardContent className='p-8 text-center'>
                <CheckCircle2 className='w-16 h-16 text-emerald-400 mx-auto mb-4' />
                <h1 className='text-2xl font-bold text-white mb-2'>Password Reset</h1>
                <p className='text-neutral-400'>Your password has been successfully reset. Redirecting to login...</p>
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
      <section className='relative pt-24 pb-12 bg-neutral-900'>
        <div className='absolute inset-0'><div className='absolute top-20 left-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl' /></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h1 className='text-4xl font-bold text-white'>Reset Password</h1>
          <p className='text-neutral-400 mt-2'>Enter your new password</p>
        </div>
      </section>

      <section className='py-12'>
        <div className='max-w-md mx-auto px-4'>
          <Card className='bg-neutral-900/50 border-neutral-800'>
            <CardContent className='p-8'>
              <form onSubmit={handleSubmit} className='space-y-5'>
                <div>
                  <label className='block text-sm text-neutral-400 mb-2'>Email</label>
                  <input type='email' value={email} disabled className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white/50 cursor-not-allowed' />
                </div>

                <div>
                  <label className='block text-sm text-neutral-400 mb-2'>New Password</label>
                  <div className='relative'>
                    <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500' />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder='Min. 8 characters'
                      className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-12 pr-12 py-2.5 text-white placeholder:text-neutral-500 focus:border-violet-500/50 focus:outline-none'
                      required
                    />
                    <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300'>
                      {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className='block text-sm text-neutral-400 mb-2'>Confirm Password</label>
                  <div className='relative'>
                    <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500' />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder='Repeat password'
                      className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-12 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-violet-500/50 focus:outline-none'
                      required
                    />
                  </div>
                </div>

                {error && <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm'>{error}</div>}

                <Button type='submit' disabled={submitting} className='w-full bg-white text-neutral-950 hover:bg-neutral-200 py-2.5'>
                  {submitting ? <Loader2 className='w-5 h-5 animate-spin' /> : 'Reset Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-neutral-950 flex items-center justify-center'>
        <Loader2 className='w-8 h-8 text-violet-400 animate-spin' />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
