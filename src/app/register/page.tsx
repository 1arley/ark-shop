'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SectionHero from '@/components/layout/SectionHero'

function RegisterForm() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = registerSchema.safeParse(formData)
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid form data')
      return
    }

    const result = await registerUser(formData.email, formData.password, formData.name)
    if (result.success) {
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
    } else {
      setError(result.error || 'Registration failed')
    }
  }

    return (
        <div className='min-h-screen bg-neutral-950'>
            <Header />

            <SectionHero
                title='Create an Account'
                subtitle='Join thousands of satisfied customers today'
            />

            {/* Register Form */}
      <section className='py-12'>
        <div className='max-w-md mx-auto px-4 sm:px-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className='bg-neutral-900/50 border-neutral-800'>
              <CardContent className='p-8'>
                <form onSubmit={handleSubmit} className='space-y-5'>
                  {error && (
                    <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm'>
                      {error}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className='text-sm text-neutral-400 mb-2 block'>Full Name</label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500' />
                      <Input
                        type='text'
                        placeholder='John Doe'
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className='pl-12 bg-neutral-800 border-neutral-700 text-white'
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className='text-sm text-neutral-400 mb-2 block'>Email Address</label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500' />
                      <Input
                        type='email'
                        placeholder='you@example.com'
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className='pl-12 bg-neutral-800 border-neutral-700 text-white'
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className='text-sm text-neutral-400 mb-2 block'>Password</label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500' />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Create a strong password'
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className='pl-12 pr-12 bg-neutral-800 border-neutral-700 text-white'
                        required
                        minLength={8}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-400'
                      >
                        {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                      </button>
                    </div>
                    <p className='text-xs text-neutral-500 mt-2'>
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className='text-sm text-neutral-400 mb-2 block'>Confirm Password</label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500' />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Re-enter your password'
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className='pl-12 pr-12 bg-neutral-800 border-neutral-700 text-white'
                        required
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-400'
                      >
                        {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <label className='flex items-start gap-3 cursor-pointer'>
                    <input
                      type='checkbox'
                      className='mt-1 w-4 h-4 rounded border-neutral-600 bg-neutral-700 checked:bg-violet-600'
                      required
                    />
                    <span className='text-sm text-neutral-400'>
                      I agree to the{' '}
                      <Link href='/terms' className='text-violet-400 hover:text-violet-300'>
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href='/privacy' className='text-violet-400 hover:text-violet-300'>
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  {/* Submit Button */}
                  <Button
                    type='submit'
                    disabled={isLoading}
                    className='w-full bg-violet-600 hover:bg-violet-500 h-12 text-base font-semibold'
                  >
                    {isLoading ? (
                      <span className='flex items-center gap-2'>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        Creating account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>

                {/* Login Link */}
                <p className='text-center text-sm text-neutral-400 mt-6'>
                  Already have an account?{' '}
                  <Link href='/login' className='text-violet-400 hover:text-violet-300 font-medium'>
                    Sign in
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-neutral-950 flex items-center justify-center'>
        <div className='w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin' />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}