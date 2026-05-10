'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    CheckCircle2,
    CreditCard,
    Shield,
    Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function CheckoutPage() {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')
    const [processing, setProcessing] = useState(false)
    const [completed, setCompleted] = useState(false)

    const handlePayment = async () => {
        setProcessing(true)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setProcessing(false)
        setCompleted(true)
    }

    const cartItems = [
        {
            id: 1,
            title: 'Steam Gift Card $50',
            price: 50.0,
            originalPrice: 55.0,
            quantity: 1,
            platform: 'Steam',
        },
        {
            id: 2,
            title: 'Microsoft 365 Personal (1 Year)',
            price: 69.99,
            originalPrice: 99.99,
            quantity: 1,
            platform: 'Microsoft',
        },
    ]

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const tax = subtotal * 0.08
    const total = subtotal + tax

    if (completed) {
        return (
            <div className='min-h-screen bg-neutral-950'>
                <Header cartCount={0} />

                <section className='relative pt-24 pb-12'>
                    <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className='text-center'
                        >
                            <div className='w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30'>
                                <CheckCircle2 className='w-12 h-12 text-emerald-500' />
                            </div>
                            <h1 className='text-3xl font-semibold text-white mb-4'>
                                Order Confirmed!
                            </h1>
                            <p className='text-neutral-400 mb-8'>
                                Your digital keys have been sent to your email.
                            </p>

                            <Card className='bg-neutral-900/50 border-neutral-800 mb-8'>
                                <CardContent className='p-6'>
                                    <div className='space-y-4'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-neutral-400'>Order Number</span>
                                            <span className='text-white font-mono'>ARK-2025-78945</span>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-neutral-400'>Delivery Method</span>
                                            <span className='text-emerald-400'>Email + Dashboard</span>
                                        </div>
                                        <div className='border-t border-neutral-800 pt-4'>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-neutral-400'>Total Paid</span>
                                                <span className='text-2xl font-bold text-white'>${total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                                <Button size='lg' className='bg-white text-neutral-950 hover:bg-neutral-200 h-12'>
                                    <Link href='/dashboard'>View in Dashboard</Link>
                                </Button>
                                <Button
                                    size='lg'
                                    variant='outline'
                                    className='border-neutral-700 hover:bg-neutral-800 h-12 text-neutral-300'
                                >
                                    <Link href='/products'>Continue Shopping</Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <Footer />
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-neutral-950'>
            <Header cartCount={2} />

            {/* Header */}
            <section className='relative py-12 bg-neutral-900 border-b border-neutral-800'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className='text-center'
                    >
                        <h1 className='text-3xl md:text-4xl font-semibold text-white mb-2'>
                            Checkout
                        </h1>
                        <p className='text-neutral-400'>Complete your purchase securely</p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className='py-12'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='grid lg:grid-cols-3 gap-8'>
                        {/* Main Form */}
                        <div className='lg:col-span-2 space-y-6'>
                            {/* Contact Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className='bg-neutral-900/50 border-neutral-800'>
                                    <CardContent className='p-6'>
                                        <h3 className='text-lg font-semibold text-white mb-4'>
                                            Contact Information
                                        </h3>
                                        <div className='grid sm:grid-cols-2 gap-4'>
                                            <div>
                                                <Label htmlFor='email' className='text-neutral-300'>Email Address</Label>
                                                <Input
                                                    id='email'
                                                    type='email'
                                                    placeholder='you@example.com'
                                                    className='mt-1 bg-neutral-800 border-neutral-700 text-white focus:border-violet-500 focus:ring-violet-500'
                                                />
                                            </div>
                                        </div>
                                        <p className='text-xs text-neutral-500 mt-3'>
                                            Your digital keys will be sent to this email address
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Payment Method */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <Card className='bg-neutral-900/50 border-neutral-800'>
                                    <CardContent className='p-6'>
                                        <h3 className='text-lg font-semibold text-white mb-4'>
                                            Payment Method
                                        </h3>
                                        <div className='grid sm:grid-cols-2 gap-4 mb-6'>
                                            <button
                                                onClick={() => setPaymentMethod('card')}
                                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                    paymentMethod === 'card'
                                                        ? 'border-violet-500 bg-violet-500/10'
                                                        : 'border-neutral-700 hover:border-neutral-600'
                                                }`}
                                            >
                                                <div className='flex items-center gap-3 mb-2'>
                                                    <CreditCard className='w-5 h-5 text-neutral-400' />
                                                    <span className='text-white font-medium'>Credit / Debit Card</span>
                                                </div>
                                                <span className='text-xs text-neutral-500'>Visa, Mastercard, Amex</span>
                                            </button>
                                            <button
                                                onClick={() => setPaymentMethod('paypal')}
                                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                    paymentMethod === 'paypal'
                                                        ? 'border-violet-500 bg-violet-500/10'
                                                        : 'border-neutral-700 hover:border-neutral-600'
                                                }`}
                                            >
                                                <div className='flex items-center gap-3 mb-2'>
                                                    <div className='w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-xs text-white font-bold'>P</div>
                                                    <span className='text-white font-medium'>PayPal</span>
                                                </div>
                                                <span className='text-xs text-neutral-500'>Pay with your PayPal account</span>
                                            </button>
                                        </div>

                                        {paymentMethod === 'card' && (
                                            <div className='space-y-4'>
                                                <div>
                                                    <Label htmlFor='card-number' className='text-neutral-300'>Card Number</Label>
                                                    <Input
                                                        id='card-number'
                                                        type='text'
                                                        placeholder='1234 5678 9012 3456'
                                                        className='mt-1 bg-neutral-800 border-neutral-700 text-white focus:border-violet-500 focus:ring-violet-500'
                                                    />
                                                </div>
                                                <div className='grid sm:grid-cols-2 gap-4'>
                                                    <div>
                                                        <Label htmlFor='expiry' className='text-neutral-300'>Expiry Date</Label>
                                                        <Input
                                                            id='expiry'
                                                            type='text'
                                                            placeholder='MM/YY'
                                                            className='mt-1 bg-neutral-800 border-neutral-700 text-white focus:border-violet-500 focus:ring-violet-500'
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor='cvv' className='text-neutral-300'>CVV</Label>
                                                        <Input
                                                            id='cvv'
                                                            type='text'
                                                            placeholder='123'
                                                            className='mt-1 bg-neutral-800 border-neutral-700 text-white focus:border-violet-500 focus:ring-violet-500'
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Security Notice */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className='flex items-center gap-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30'>
                                    <Shield className='w-6 h-6 text-emerald-500' />
                                    <div>
                                        <div className='font-medium text-emerald-400'>Secure Checkout</div>
                                        <div className='text-sm text-emerald-400/80'>All transactions are encrypted and secure</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className='lg:col-span-1'
                        >
                            <Card className='bg-neutral-900/50 border-neutral-800 sticky top-24'>
                                <CardContent className='p-6'>
                                    <h3 className='text-lg font-semibold text-white mb-4'>
                                        Order Summary
                                    </h3>

                                    {/* Items */}
                                    <div className='space-y-4 mb-6'>
                                        {cartItems.map((item) => (
                                            <div key={item.id} className='flex gap-4'>
                                                <div className='w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0'>
                                                    <Package className='w-8 h-8 text-neutral-600' />
                                                </div>
                                                <div className='flex-1'>
                                                    <div className='text-xs text-violet-400 mb-1'>{item.platform}</div>
                                                    <h4 className='text-sm text-white font-medium line-clamp-2'>{item.title}</h4>
                                                    <div className='text-xs text-neutral-500 mt-1'>Qty: {item.quantity}</div>
                                                </div>
                                                <div className='text-right'>
                                                    <div className='text-white font-medium'>${item.price.toFixed(2)}</div>
                                                    {item.originalPrice && (
                                                        <div className='text-xs text-neutral-500 line-through'>${item.originalPrice.toFixed(2)}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Totals */}
                                    <div className='space-y-3 mb-6'>
                                        <div className='flex justify-between text-neutral-400'>
                                            <span>Subtotal</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className='flex justify-between text-neutral-400'>
                                            <span>Tax (8%)</span>
                                            <span>${tax.toFixed(2)}</span>
                                        </div>
                                        <div className='flex justify-between text-neutral-400'>
                                            <span>Delivery</span>
                                            <span className='text-emerald-400'>Free</span>
                                        </div>
                                        <div className='border-t border-neutral-800 pt-3 flex justify-between'>
                                            <span className='font-semibold text-white'>Total</span>
                                            <span className='text-2xl font-bold text-white'>${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handlePayment}
                                        disabled={processing}
                                        className='w-full bg-white text-neutral-950 hover:bg-neutral-200 h-12 font-semibold'
                                    >
                                        {processing ? (
                                            <span className='flex items-center gap-2'>
                                                <div className='w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin' />
                                                Processing...
                                            </span>
                                        ) : (
                                            <span className='flex items-center gap-2'>
                                                <Shield className='w-4 h-4' />
                                                Pay Securely
                                            </span>
                                        )}
                                    </Button>

                                    <div className='flex items-center justify-center gap-2 mt-4 text-xs text-neutral-500'>
                                        <Shield className='w-3 h-3' />
                                        <span>SSL Encrypted Payment</span>
                                    </div>
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