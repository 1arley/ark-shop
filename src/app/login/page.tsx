'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading } = useAuth()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = loginSchema.safeParse(formData)
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid form data')
      return
    }

    const result = await login(formData.email, formData.password)
    if (result.success) {
      router.push(redirectTo)
    } else {
      setError(result.error || 'Login failed')
    }
  }

    return (
        <div className='min-h-screen bg-neutral-950'>
            <Header />

            {/* Hero Section */}
      <section className='section-hero'>
        <div className='section-container'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='text-center'
          >
            <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
              Welcome Back
            </h1>
            <p className='text-neutral-400 text-lg'>
              Sign in to access your orders and digital keys
            </p>
          </motion.div>
        </div>
      </section>

      {/* Login Form */}
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
                    <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm'>
                      {error}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className='text-sm text-neutral-300 mb-2 block'>Email Address</label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500' />
                      <Input
                        type='email'
                        placeholder='you@example.com'
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className='pl-12 bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500'
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <label className='text-sm text-neutral-300'>Password</label>
                      <Link href='/forgot-password' className='text-xs text-violet-400 hover:text-violet-300'>
                        Forgot password?
                      </Link>
                    </div>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500' />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Your password'
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className='pl-12 pr-12 bg-neutral-800 border-neutral-700 text-neutral-200'
                        required
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-400'
                      >
                        {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type='submit'
                    disabled={isLoading}
                    className='w-full bg-white text-neutral-950 hover:bg-neutral-200 h-12 text-base font-semibold'
                  >
                    {isLoading ? (
                      <span className='flex items-center gap-2'>
                        <div className='w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin' />
                        Signing in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                {/* Sign Up Link */}
                <p className='text-center text-sm text-neutral-500 mt-6'>
                  Don&apos;t have an account?{' '}
                  <Link href='/register' className='text-violet-400 hover:text-violet-300 font-medium'>
                    Sign up
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-neutral-950 flex items-center justify-center'>
        <div className='w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin' />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}