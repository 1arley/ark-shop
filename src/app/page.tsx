'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ShoppingCart,
    Zap,
    Shield,
    Truck,
    Headphones,
    Gamepad2,
    Monitor,
    Wallet,
    CreditCard,
    Download,
    Lock,
    CheckCircle2,
    ArrowRight,
    Star,
    Loader2,
    Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { apiClient } from '@/services/api'
import { useCart } from '@/hooks/use-cart'
import type { Product, Category } from '@/types/api'

// Default category icons/colors for display
const categoryMeta: Record<string, { icon: React.ElementType; color: string }> = {
    default: { icon: Package, color: 'from-violet-500 to-purple-600' },
}

const categoryIcons = [
    { icon: Gamepad2, color: 'from-violet-500 to-purple-600' },
    { icon: Monitor, color: 'from-sky-500 to-blue-600' },
    { icon: Wallet, color: 'from-emerald-500 to-teal-600' },
    { icon: CreditCard, color: 'from-amber-500 to-orange-600' },
    { icon: Download, color: 'from-rose-500 to-pink-600' },
    { icon: Lock, color: 'from-cyan-500 to-sky-600' },
]

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(true)
    const [isLoadingCategories, setIsLoadingCategories] = useState(true)
    const { addItem } = useCart()

    useEffect(() => {
        async function loadFeaturedProducts() {
            try {
                const response = await apiClient.products.list({ limit: 4, isActive: true })
                const data = response.data
                if (Array.isArray(data)) {
                    setFeaturedProducts(data.slice(0, 4))
                } else {
                    setFeaturedProducts((data.data || []).slice(0, 4))
                }
            } catch {
                // silently fail — products section will be empty
            } finally {
                setIsLoadingProducts(false)
            }
        }

        async function loadCategories() {
            try {
                const response = await apiClient.categories.list()
                setCategories(Array.isArray(response.data) ? response.data : [])
            } catch {
                // silently fail
            } finally {
                setIsLoadingCategories(false)
            }
        }

        loadFeaturedProducts()
        loadCategories()
    }, [])

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            platform: product.category?.name || '',
            image: product.imageUrl || undefined,
        })
    }

    const getCategoryDisplay = (index: number) => {
        return categoryIcons[index % categoryIcons.length] || categoryMeta.default
    }

    const benefits = [
        {
            icon: Truck,
            title: 'Instant Delivery',
            description: 'Digital keys delivered immediately via email after purchase.',
        },
        {
            icon: Shield,
            title: 'Verified Genuine',
            description: 'All products sourced from authorized distributors.',
        },
        {
            icon: Lock,
            title: 'Secure Checkout',
            description: 'Enterprise-level encryption on every transaction.',
        },
        {
            icon: Headphones,
            title: '24/7 Support',
            description: 'Dedicated team ready to assist anytime.',
        },
    ]

  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

            {/* Hero Section */}
            <section className='relative pt-24 min-h-[85vh] flex items-center overflow-hidden'>
                {/* Background */}
                <div className='absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950' />
                <div className='absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl' />
                <div className='absolute bottom-1/4 left-1/4 w-96 h-96 bg-sky-600/5 rounded-full blur-3xl' />

                <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
                    <div className='grid lg:grid-cols-2 gap-12 items-center'>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className='space-y-8'
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10'
                            >
                                <Zap className='w-4 h-4 text-violet-400' />
                                <span className='text-sm text-neutral-300'>Digital keys delivered instantly</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className='text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight'
                            >
                                Digital Licenses
                                <span className='block text-neutral-400 mt-2'>
                                    Software & Games
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className='text-lg text-neutral-400 max-w-xl'
                            >
                                Your trusted source for genuine activation keys. From gaming platforms to productivity software - instant delivery, verified authenticity.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className='flex flex-col sm:flex-row gap-4'
                            >
                                <Button size='lg' className='bg-white text-neutral-950 hover:bg-neutral-200 px-8 h-12 font-medium'>
                                    <Link href='/products'>Shop Products</Link>
                                </Button>
                                <Button size='lg' variant='outline' className='border-neutral-700 hover:bg-neutral-800 text-neutral-300 px-8 h-12'>
                                    <Link href='/about'>How It Works</Link>
                                </Button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className='flex flex-wrap items-center gap-6 pt-4'
                            >
                                <div className='flex items-center gap-2'>
                                    <CheckCircle2 className='w-5 h-5 text-emerald-500' />
                                    <span className='text-sm text-neutral-400'>100% Genuine</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Zap className='w-5 h-5 text-emerald-500' />
                                    <span className='text-sm text-neutral-400'>Instant Delivery</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Shield className='w-5 h-5 text-emerald-500' />
                                    <span className='text-sm text-neutral-400'>Secure Payment</span>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className='hidden lg:block'
                        >
                            <div className='relative'>
                                <div className='absolute inset-0 bg-gradient-to-br from-violet-500/10 to-sky-500/10 rounded-3xl blur-2xl' />
                                <Card className='relative bg-neutral-900/50 backdrop-blur-sm border-neutral-800 rounded-3xl'>
                                    <CardContent className='p-6'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='text-center p-4 rounded-2xl bg-neutral-800/50'>
                                                <div className='text-3xl font-semibold text-white mb-1'>500+</div>
                                                <div className='text-sm text-neutral-400'>Game Keys</div>
                                            </div>
                                            <div className='text-center p-4 rounded-2xl bg-neutral-800/50'>
                                                <div className='text-3xl font-semibold text-white mb-1'>50K+</div>
                                                <div className='text-sm text-neutral-400'>Customers</div>
                                            </div>
                                            <div className='text-center p-4 rounded-2xl bg-neutral-800/50'>
                                                <div className='text-3xl font-semibold text-white mb-1'>100K+</div>
                                                <div className='text-sm text-neutral-400'>Orders</div>
                                            </div>
                                            <div className='text-center p-4 rounded-2xl bg-neutral-800/50'>
                                                <div className='flex items-center justify-center gap-1 mb-1'>
                                                    <Star className='w-6 h-6 text-amber-500 fill-amber-500' />
                                                    <span className='text-3xl font-semibold text-white'>4.9</span>
                                                </div>
                                                <div className='text-sm text-neutral-400'>Rating</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className='py-20 relative'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className='text-center mb-12'
                    >
                        <h2 className='text-3xl md:text-4xl font-semibold text-white mb-4'>
                            Browse Categories
                        </h2>
                        <p className='text-neutral-400 text-lg max-w-2xl mx-auto'>
                            Explore our collection of digital products
                        </p>
                    </motion.div>

                    {isLoadingCategories ? (
                        <div className='flex justify-center py-12'>
                            <Loader2 className='w-8 h-8 text-violet-400 animate-spin' />
                        </div>
                    ) : categories.length > 0 ? (
                        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                            {categories.slice(0, 6).map((category, index) => {
                                const display = getCategoryDisplay(index)
                                const IconComponent = display.icon
                                return (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <Link href={`/products?categoryId=${category.id}`}>
                                            <Card className='bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 transition-all group cursor-pointer h-full'>
                                                <CardContent className='p-6 flex flex-col items-center gap-3'>
                                                    <div className={`w-14 h-14 bg-gradient-to-br ${display.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                        <IconComponent className='w-7 h-7 text-white' />
                                                    </div>
                                                    <div className='text-center'>
                                                        <div className='font-medium text-neutral-200 text-sm'>{category.name}</div>
                                                        {category._count && (
                                                            <div className='text-xs text-neutral-500 mt-1'>{category._count.products}+ products</div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className='text-center text-neutral-500'>No categories available yet.</p>
                    )}
                </div>
            </section>

            {/* Featured Products */}
            <section className='py-20 bg-neutral-900/30 relative'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className='flex items-center justify-between mb-12'
                    >
                        <div>
                            <h2 className='text-3xl md:text-4xl font-semibold text-white mb-2'>
                                Featured Products
                            </h2>
                            <p className='text-neutral-400'>Popular picks from our catalog</p>
                        </div>
                        <Link
                            href='/products'
                            className='hidden sm:flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors'
                        >
                            View All <ArrowRight className='w-4 h-4' />
                        </Link>
                    </motion.div>

                    {isLoadingProducts ? (
                        <div className='flex justify-center py-12'>
                            <Loader2 className='w-8 h-8 text-violet-400 animate-spin' />
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                            {featuredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <Link href={`/products/${product.id}`}>
                                        <Card className='bg-neutral-900/50 border-neutral-800 hover:border-violet-500/30 transition-all group overflow-hidden'>
                                            <div className='relative aspect-square bg-neutral-800/50 flex items-center justify-center'>
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} className='object-cover w-full h-full' />
                                                ) : (
                                                    <Package className='w-16 h-16 text-neutral-700' />
                                                )}
                                                {product.stock <= 0 && (
                                                    <div className='absolute inset-0 bg-neutral-950/70 flex items-center justify-center'>
                                                        <span className='text-neutral-400 text-sm'>Out of Stock</span>
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className='p-4'>
                                                <div className='text-xs text-violet-400 mb-2'>{product.category?.name || 'Digital'}</div>
                                                <h3 className='font-medium text-neutral-200 mb-2 line-clamp-2 text-sm group-hover:text-violet-400 transition-colors'>
                                                    {product.name}
                                                </h3>
                                                <div className='flex items-center gap-3'>
                                                    <div className='flex flex-col'>
                                                        <span className='text-lg font-semibold text-white'>
                                                            R$ {product.price.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className='ml-auto'>
                                                        <Button
                                                            size='sm'
                                                            className='bg-white text-neutral-950 hover:bg-neutral-200'
                                                            onClick={(e) => handleAddToCart(e, product)}
                                                            disabled={product.stock <= 0}
                                                        >
                                                            <ShoppingCart className='w-4 h-4' />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className='text-center text-neutral-500 py-8'>No products available yet.</p>
                    )}

                    <div className='mt-8 text-center sm:hidden'>
                        <Link
                            href='/products'
                            className='inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors'
                        >
                            View All Products <ArrowRight className='w-4 h-4' />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className='py-20 relative'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className='text-center mb-12'
                    >
                        <h2 className='text-3xl md:text-4xl font-semibold text-white mb-4'>
                            Why Shop With Us
                        </h2>
                        <p className='text-neutral-400 text-lg max-w-2xl mx-auto'>
                            The trusted choice for digital products
                        </p>
                    </motion.div>

                    <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Card className='bg-neutral-900/50 border-neutral-800 hover:border-violet-500/30 transition-all h-full'>
                                    <CardContent className='p-6 text-center'>
                                        <div className='w-14 h-14 bg-gradient-to-br from-violet-600 to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                            <benefit.icon className='w-7 h-7 text-white' />
                                        </div>
                                        <h3 className='font-semibold text-white mb-2'>{benefit.title}</h3>
                                        <p className='text-sm text-neutral-400'>{benefit.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='py-20 bg-gradient-to-r from-violet-600 to-sky-600 relative'>
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className='text-3xl md:text-4xl font-semibold text-white mb-4'>
                            Ready to Get Started?
                        </h2>
                        <p className='text-white/90 text-lg mb-8 max-w-2xl mx-auto'>
                            Join thousands of satisfied customers and discover our wide selection of digital products
                        </p>
                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <Button size='lg' className='bg-white text-neutral-950 hover:bg-neutral-200 h-12 px-8 font-medium'>
                                <Link href='/products'>Browse Products</Link>
                            </Button>
                            <Button
                                size='lg'
                                variant='outline'
                                className='border-white text-white hover:bg-white/10 h-12 px-8'
                            >
                                <Link href='/about'>Learn About Us</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    )
}