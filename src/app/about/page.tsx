'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function AboutPage() {
    return (
        <div className='min-h-screen bg-neutral-950'>
            <Header />

            {/* Hero Section */}
            <section className='relative pt-28 pb-16 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-purple-950/40'>
                <div className='absolute inset-0'>
                    <div className='absolute top-20 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl' />
                </div>

                <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className='text-center'
                    >
                        <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
                            About Us
                        </h1>
                        <p className='text-slate-400 text-lg max-w-2xl mx-auto'>
                            Your trusted partner for genuine digital keys and software licenses
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className='py-12'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    {/* Story Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className='grid md:grid-cols-2 gap-12 items-center mb-20'
                    >
                        <div>
                            <h2 className='text-3xl font-semibold text-white mb-6'>Our Story</h2>
                            <p className='text-slate-400 mb-4'>
                                Ark Games Shop was founded with a simple mission: to provide customers with authentic digital keys and software licenses at competitive prices. We understood the frustration of dealing with unreliable sellers and unclear product origins.
                            </p>
                            <p className='text-slate-400 mb-4'>
                                Today, we&apos;re proud to serve thousands of customers worldwide, offering instant delivery on hundreds of products including game keys, office licenses, operating systems, and subscription services.
                            </p>
                            <p className='text-slate-400'>
                                Our commitment to authenticity and customer satisfaction has made us a trusted name in the digital commerce space.
                            </p>
                        </div>
                        <Card className='bg-slate-800/30 border-slate-700'>
                            <CardContent className='p-8'>
                                <div className='grid grid-cols-2 gap-6'>
                                    <div className='text-center'>
                                        <div className='text-4xl font-bold text-indigo-400 mb-2'>50K+</div>
                                        <div className='text-sm text-slate-400'>Happy Customers</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-4xl font-bold text-indigo-400 mb-2'>100K+</div>
                                        <div className='text-sm text-slate-400'>Products Sold</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-4xl font-bold text-indigo-400 mb-2'>99.9%</div>
                                        <div className='text-sm text-slate-400'>Satisfaction Rate</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-4xl font-bold text-indigo-400 mb-2'>24/7</div>
                                        <div className='text-sm text-slate-400'>Customer Support</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Values Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className='mb-20'
                    >
                        <h2 className='text-3xl font-semibold text-white text-center mb-12'>Our Values</h2>
                        <div className='grid md:grid-cols-3 gap-8'>
                            <Card className='bg-slate-800/30 border-slate-700'>
                                <CardContent className='p-6 text-center'>
                                    <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                        <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                                        </svg>
                                    </div>
                                    <h3 className='text-xl font-semibold text-white mb-3'>Authenticity</h3>
                                    <p className='text-slate-400'>
                                        Every product we sell is 100% genuine, sourced directly from official distributors and manufacturers.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className='bg-slate-800/30 border-slate-700'>
                                <CardContent className='p-6 text-center'>
                                    <div className='w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                        <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                                        </svg>
                                    </div>
                                    <h3 className='text-xl font-semibold text-white mb-3'>Speed</h3>
                                    <p className='text-slate-400'>
                                        Instant digital delivery means you get your keys immediately after purchase confirmation.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className='bg-slate-800/30 border-slate-700'>
                                <CardContent className='p-6 text-center'>
                                    <div className='w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                        <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                                        </svg>
                                    </div>
                                    <h3 className='text-xl font-semibold text-white mb-3'>Customer First</h3>
                                    <p className='text-slate-400'>
                                        Your satisfaction is our priority. We&apos;re here to help with any questions or concerns, anytime.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    )
}