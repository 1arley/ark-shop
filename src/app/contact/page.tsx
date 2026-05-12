'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

import { apiClient } from '@/services/api'

export default function ContactPage() {
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        const form = e.currentTarget
        const formData = new FormData(form)

        try {
            await apiClient.post('/contact', {
                name: String(formData.get('name') || ''),
                email: String(formData.get('email') || ''),
                subject: String(formData.get('subject') || ''),
                message: String(formData.get('message') || ''),
            })
            setSubmitted(true)
            form.reset()
        } catch {
            setError('Failed to send message. Please try again later.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='min-h-screen bg-neutral-950'>
            <Header />

            {/* Hero Section */}
            <section className='relative pt-28 pb-16 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-purple-950/40'>
                <div className='absolute inset-0'>
                    <div className='absolute top-20 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl' />
                </div>

                <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className='text-center'
                    >
                        <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
                            Contact Us
                        </h1>
                        <p className='text-slate-400 text-lg'>
                            Have a question? We&apos;re here to help 24/7
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Section */}
            <section className='py-12'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='grid lg:grid-cols-2 gap-12'>
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className='text-2xl font-semibold text-white mb-6'>Get in Touch</h2>
                            <p className='text-slate-400 mb-8'>
                                Whether you have a question about an order, need technical support, or just want to provide feedback, our team is ready to assist you.
                            </p>

                            <div className='space-y-6'>
                                <div className='flex items-start gap-4'>
                                    <div className='w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                                        <Mail className='w-6 h-6 text-indigo-400' />
                                    </div>
                                    <div>
                                        <h3 className='font-medium text-white mb-1'>Email</h3>
                                        <p className='text-slate-400'>support@arkgames.shop</p>
                                        <p className='text-xs text-slate-500 mt-1'>Response within 24 hours</p>
                                    </div>
                                </div>

                                <div className='flex items-start gap-4'>
                                    <div className='w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                                        <Phone className='w-6 h-6 text-indigo-400' />
                                    </div>
                                    <div>
                                        <h3 className='font-medium text-white mb-1'>Phone</h3>
                                        <p className='text-slate-400'>+1 (555) 123-4567</p>
                                        <p className='text-xs text-slate-500 mt-1'>Available 24/7</p>
                                    </div>
                                </div>

                                <div className='flex items-start gap-4'>
                                    <div className='w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                                        <MapPin className='w-6 h-6 text-indigo-400' />
                                    </div>
                                    <div>
                                        <h3 className='font-medium text-white mb-1'>Address</h3>
                                        <p className='text-slate-400'>123 Digital Commerce St</p>
                                        <p className='text-slate-400'>San Francisco, CA 94102</p>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ Quick Links */}
                            <Card className='bg-slate-800/30 border-slate-700 mt-8'>
                                <CardContent className='p-6'>
                                    <h3 className='font-medium text-white mb-3'>Quick Links</h3>
                                    <ul className='space-y-2'>
                                        <li>
                                            <Link href='/faq' className='text-indigo-400 hover:text-indigo-300 text-sm'>
                                                Frequently Asked Questions
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href='/refunds' className='text-indigo-400 hover:text-indigo-300 text-sm'>
                                                Refund Policy
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href='/terms' className='text-indigo-400 hover:text-indigo-300 text-sm'>
                                                Terms of Service
                                            </Link>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className='bg-slate-800/30 border-slate-700'>
                                <CardContent className='p-8'>
                                    {submitted ? (
                                        <div className='text-center py-12'>
                                            <div className='w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                                                <svg className='w-8 h-8 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                                </svg>
                                            </div>
                                            <h3 className='text-xl font-semibold text-white mb-2'>Message Sent!</h3>
                                            <p className='text-slate-400 mb-6'>
                                                Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                                            </p>
                                            <Button
                                                onClick={() => setSubmitted(false)}
                                                className='bg-indigo-600 hover:bg-indigo-500'
                                            >
                                                Send Another Message
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
                                                <label className='text-sm text-slate-400 mb-2 block'>Name</label>
                                                <Input
                                                    type='text'
                                                    name='name'
                                                    placeholder='Your name'
                                                    className='bg-slate-700/30 border-slate-600 text-white'
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className='text-sm text-slate-400 mb-2 block'>Email</label>
                                                <Input
                                                    type='email'
                                                    name='email'
                                                    placeholder='you@example.com'
                                                    className='bg-slate-700/30 border-slate-600 text-white'
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className='text-sm text-slate-400 mb-2 block'>Subject</label>
                                                <select
                                                    name='subject'
                                                    className='w-full px-3 py-2 rounded-md bg-slate-700/30 border border-slate-600 text-white'
                                                    required
                                                >
                                                    <option value=''>Select a subject</option>
                                                    <option value='order'>Order Inquiry</option>
                                                    <option value='product'>Product Question</option>
                                                    <option value='technical'>Technical Support</option>
                                                    <option value='refund'>Refund Request</option>
                                                    <option value='other'>Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className='text-sm text-slate-400 mb-2 block'>Message</label>
                                                <Textarea
                                                    name='message'
                                                    placeholder='Tell us how we can help you...'
                                                    className='bg-slate-700/30 border-slate-600 text-white min-h-36'
                                                    required
                                                />
                                            </div>

                                            <Button
                                                type='submit'
                                                disabled={submitting}
                                                className='w-full bg-indigo-600 hover:bg-indigo-500 h-12 text-base font-semibold'
                                            >
                                                {submitting ? (
                                                    <span className='flex items-center gap-2'>
                                                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                                        Sending...
                                                    </span>
                                                ) : (
                                                    <span className='flex items-center gap-2'>
                                                        <Send className='w-4 h-4' />
                                                        Send Message
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}