'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShoppingCart, Package, Plus, Minus, Trash2, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/hooks/use-cart'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function CartPage() {
  const { items: cartItems, removeItem, updateQuantity, total } = useCart()

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <div className='min-h-screen bg-neutral-950'>
            <Header />

            {/* Header Section */}
            <section className='relative py-12 bg-neutral-900 border-b border-neutral-800'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className='text-center'
                    >
                        <h1 className='text-3xl md:text-4xl font-semibold text-white mb-2'>
                            Shopping Cart
                        </h1>
                        <p className='text-neutral-400'>Review your items and proceed to checkout</p>
                    </motion.div>
                </div>
            </section>

            {/* Cart Content */}
            <section className='py-12'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    {cartItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='text-center py-16'
                        >
                            <ShoppingCart className='w-20 h-20 text-neutral-600 mx-auto mb-6' />
                            <h3 className='text-2xl font-semibold text-white mb-2'>
                                Your cart is empty
                            </h3>
                            <p className='text-neutral-400 mb-8'>Looks like you haven&apos;t added anything yet</p>
                            <Button size='lg' className='bg-white text-neutral-950 hover:bg-neutral-200 h-12'>
                                <Link href='/products'>Browse Products</Link>
                            </Button>
                        </motion.div>
                    ) : (
                        <div className='grid lg:grid-cols-3 gap-8'>
                            {/* Cart Items */}
                            <div className='lg:col-span-2 space-y-4'>
                                {cartItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className='bg-neutral-900/50 border-neutral-800 overflow-hidden'>
                                            <CardContent className='p-6'>
                                                <div className='flex gap-6'>
                                                    {/* Product Image */}
                                                    <div className='w-24 h-24 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0'>
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className='object-cover w-full h-full rounded-lg' />
                                                        ) : (
                                                            <Package className='w-12 h-12 text-neutral-600' />
                                                        )}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className='flex-1'>
                                                        <div className='flex justify-between items-start mb-2'>
                                                            <div>
                                                                <div className='text-xs text-violet-400 mb-1'>{item.platform}</div>
                                                                <h3 className='font-medium text-white text-lg'>{item.name}</h3>
                                                            </div>
                                                            <button
                                                                onClick={() => removeItem(item.id)}
                                                                className='text-neutral-400 hover:text-red-400 transition-colors'
                                                            >
                                                                <Trash2 className='w-5 h-5' />
                                                            </button>
                                                        </div>

                                                        <div className='flex items-center justify-between mt-4'>
                                                            {/* Quantity Controls */}
                                                            <div className='flex items-center gap-3'>
                                                                <Button
                                                                    variant='outline'
                                                                    size='sm'
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    className='w-8 h-8 p-0 border-neutral-700 hover:bg-neutral-800'
                                                                >
                                                                    <Minus className='w-4 h-4' />
                                                                </Button>
                                                                <span className='w-8 text-center text-white font-medium'>
                                                                    {item.quantity}
                                                                </span>
                                                                <Button
                                                                    variant='outline'
                                                                    size='sm'
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    className='w-8 h-8 p-0 border-neutral-700 hover:bg-neutral-800'
                                                                >
                                                                    <Plus className='w-4 h-4' />
                                                                </Button>
                                                            </div>

                                                            {/* Price */}
                                                            <div className='text-right'>
                                                                <span className='text-2xl font-bold text-white'>
                                                                    R$ {(item.price * item.quantity).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className='lg:col-span-1'>
                                <div className='sticky top-24'>
                                    <Card className='bg-neutral-900/50 border-neutral-800'>
                                        <CardContent className='p-6'>
                                            <h3 className='font-semibold text-white text-lg mb-4'>
                                                Order Summary
                                            </h3>

                                            <div className='space-y-3 mb-6'>
                                                <div className='flex justify-between text-neutral-400'>
                                                    <span>Subtotal</span>
                                                    <span>R$ {subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className='flex justify-between text-neutral-400'>
                                                    <span>Delivery</span>
                                                    <span className='text-emerald-400'>Free</span>
                                                </div>
                                                <div className='border-t border-neutral-800 pt-3 flex justify-between'>
                                                    <span className='font-semibold text-white'>Total</span>
                                                    <span className='text-2xl font-bold text-white'>
                                                        R$ {total.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                className='w-full bg-white text-neutral-950 hover:bg-neutral-200 h-12 font-semibold'
                                            >
                                                <Link href='/checkout' className='flex items-center gap-2'>
                                                    <Truck className='w-4 h-4' />
                                                    Proceed to Checkout
                                                </Link>
                                            </Button>

                                            <p className='text-xs text-neutral-500 text-center mt-4'>
                                                Instant digital delivery after payment confirmation
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Trust Badges */}
                                    <div className='mt-6 space-y-3'>
                                        <div className='flex items-center gap-3 text-sm text-neutral-400'>
                                            <div className='w-6 h-6 bg-emerald-600/20 rounded-full flex items-center justify-center'>
                                                <div className='w-2 h-2 bg-emerald-500 rounded-full' />
                                            </div>
                                            <span>100% Genuine Products</span>
                                        </div>
                                        <div className='flex items-center gap-3 text-sm text-neutral-400'>
                                            <div className='w-6 h-6 bg-emerald-600/20 rounded-full flex items-center justify-center'>
                                                <div className='w-2 h-2 bg-emerald-500 rounded-full' />
                                            </div>
                                            <span>Secure Payment Processing</span>
                                        </div>
                                        <div className='flex items-center gap-3 text-sm text-neutral-400'>
                                            <div className='w-6 h-6 bg-emerald-600/20 rounded-full flex items-center justify-center'>
                                                <div className='w-2 h-2 bg-emerald-500 rounded-full' />
                                            </div>
                                            <span>24/7 Customer Support</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    )
}