'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate login
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setIsLoading(false)
    }

    return (
        <div className='min-h-screen bg-neutral-950'>
            <Header />

            {/* Hero Section */}
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
                                    {/* Email */}
                                    <div>
                                        <label className='text-sm text-neutral-300 mb-2 block'>Email Address</label>
                                        <div className='relative'>
                                            <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500' />
                                            <Input
                                                type='email'
                                                placeholder='you@example.com'
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

                                {/* Divider */}
                                <div className='relative my-6'>
                                    <div className='absolute inset-0 flex items-center'>
                                        <div className='w-full border-t border-neutral-700' />
                                    </div>
                                    <div className='relative flex justify-center text-sm'>
                                        <span className='px-4 bg-neutral-900 text-neutral-500'>Or continue with</span>
                                    </div>
                                </div>

                                {/* Social Login */}
                                <div className='grid grid-cols-2 gap-4'>
                                    <Button variant='outline' className='border-neutral-700 hover:bg-neutral-800 h-12 text-neutral-300'>
                                        <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
                                            <path
                                                fill='currentColor'
                                                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                                            />
                                            <path
                                                fill='currentColor'
                                                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                                            />
                                            <path
                                                fill='currentColor'
                                                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                                            />
                                            <path
                                                fill='currentColor'
                                                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                                            />
                                        </svg>
                                        Google
                                    </Button>
                                    <Button variant='outline' className='border-neutral-700 hover:bg-neutral-800 h-12 text-neutral-300'>
                                        <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 24 24'>
                                            <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                                        </svg>
                                        GitHub
                                    </Button>
                                </div>

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