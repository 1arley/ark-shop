'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    ShoppingCart,
    Star,
    CheckCircle2,
    Truck,
    Shield,
    Download,
    Heart,
    Share2,
    Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ProductPage() {
    const [favorite, setFavorite] = useState(false)

    const product = {
        id: 1,
        title: 'Steam Gift Card $50',
        description: 'Get $50 worth of gaming goodness with a Steam Gift Card. Perfect for yourself or as a gift for gamers. Instant digital delivery after purchase.',
        price: 50.0,
        originalPrice: 55.0,
        discount: 9,
        platform: 'Steam',
        category: 'Gift Cards',
        rating: 4.8,
        reviews: 2847,
        inStock: true,
        deliveryType: 'Instant Digital Delivery',
        region: 'Global',
        images: [],
        features: [
            'Instant digital delivery via email',
            'Valid for games, DLC, and software on Steam',
            'No expiration date',
            'Perfect gift for gamers',
            'Secure and authentic',
        ],
        specs: [
            { label: 'Platform', value: 'Steam' },
            { label: 'Type', value: 'Gift Card' },
            { label: 'Value', value: '$50 USD' },
            { label: 'Region', value: 'Global' },
            { label: 'Delivery', value: 'Instant Digital' },
            { label: 'Expiration', value: 'None' },
        ],
    }

    const relatedProducts = [
        {
            id: 2,
            title: 'Steam Gift Card $25',
            price: 25.0,
            originalPrice: 27.99,
            platform: 'Steam',
            image: null,
        },
        {
            id: 3,
            title: 'Steam Gift Card $100',
            price: 100.0,
            originalPrice: 109.99,
            platform: 'Steam',
            image: null,
        },
        {
            id: 4,
            title: 'Discord Nitro Gift (12 Months)',
            price: 99.99,
            originalPrice: 119.99,
            platform: 'Discord',
            image: null,
        },
        {
            id: 5,
            title: 'Spotify Premium Gift (3 Months)',
            price: 29.99,
            originalPrice: 35.97,
            platform: 'Spotify',
            image: null,
        },
    ]

    return (
        <div className='min-h-screen'>
            <Header />

            {/* Hero Section */}
            <section className='relative pt-24 pb-12 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-purple-950/40'>
                <div className='absolute inset-0'>
                    <div className='absolute top-20 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl' />
                </div>

                <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    {/* Breadcrumb */}
                    <nav className='flex items-center gap-2 text-sm text-slate-400 mb-6'>
                        <Link href='/' className='hover:text-white transition-colors'>Home</Link>
                        <span>/</span>
                        <Link href='/categories' className='hover:text-white transition-colors'>Categories</Link>
                        <span>/</span>
                        <Link href='/products' className='hover:text-white transition-colors'>Gift Cards</Link>
                        <span>/</span>
                        <span className='text-white'>{product.title}</span>
                    </nav>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
                            {product.title}
                        </h1>
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='flex items-center gap-1'>
                                <Star className='w-5 h-5 text-yellow-500 fill-yellow-500' />
                                <span className='text-white font-medium'>{product.rating}</span>
                                <span className='text-slate-400'>({product.reviews.toLocaleString()} reviews)</span>
                            </div>
                            <Badge className='bg-emerald-600 text-white border-0'>In Stock</Badge>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Product Details */}
            <section className='py-12'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='grid lg:grid-cols-2 gap-12'>
                        {/* Product Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className='bg-slate-800/30 border-slate-700 overflow-hidden'>
                                <div className='aspect-square bg-slate-700/30 flex items-center justify-center'>
                                    <Package className='w-32 h-32 text-slate-600' />
                                </div>
                                <CardContent className='p-6'>
                                    <div className='flex gap-4'>
                                        <Button
                                            variant='outline'
                                            size='icon'
                                            className='border-slate-600 hover:bg-slate-700'
                                            onClick={() => setFavorite(!favorite)}
                                        >
                                            <Heart className={`w-5 h-5 ${favorite ? 'fill-red-500 text-red-500' : ''}`} />
                                        </Button>
                                        <Button variant='outline' size='icon' className='border-slate-600 hover:bg-slate-700'>
                                            <Share2 className='w-5 h-5' />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Product Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className='space-y-6'>
                                {/* Price */}
                                <div>
                                    <div className='flex items-center gap-4 mb-2'>
                                        <span className='text-4xl font-bold text-white'>${product.price}</span>
                                        {product.originalPrice && (
                                            <>
                                                <span className='text-xl text-slate-500 line-through'>${product.originalPrice}</span>
                                                <Badge className='bg-emerald-600 text-white border-0'>
                                                    Save {product.discount}%
                                                </Badge>
                                            </>
                                        )}
                                    </div>
                                    <p className='text-sm text-slate-400'>
                                        Instant digital delivery after purchase
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className='text-lg font-semibold text-white mb-3'>Description</h3>
                                    <p className='text-slate-400'>{product.description}</p>
                                </div>

                                {/* Features */}
                                <div>
                                    <h3 className='text-lg font-semibold text-white mb-3'>Key Features</h3>
                                    <ul className='space-y-2'>
                                        {product.features.map((feature, index) => (
                                            <li key={index} className='flex items-center gap-3 text-slate-400'>
                                                <CheckCircle2 className='w-5 h-5 text-emerald-500 flex-shrink-0' />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Specifications */}
                                <div>
                                    <h3 className='text-lg font-semibold text-white mb-3'>Specifications</h3>
                                    <Card className='bg-slate-800/30 border-slate-700'>
                                        <CardContent className='p-4'>
                                            <div className='grid grid-cols-2 gap-4'>
                                                {product.specs.map((spec, index) => (
                                                    <div key={index}>
                                                        <div className='text-sm text-slate-500'>{spec.label}</div>
                                                        <div className='text-sm text-white font-medium'>{spec.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Purchase Actions */}
                                <div className='flex gap-4 pt-4'>
                                    <Button
                                        size='lg'
                                        className='bg-indigo-600 hover:bg-indigo-500 flex-1 h-14 text-lg font-semibold'
                                    >
                                        <ShoppingCart className='w-5 h-5 mr-2' />
                                        Add to Cart
                                    </Button>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-slate-600 hover:bg-slate-700 h-14 px-8'
                                    >
                                        Buy Now
                                    </Button>
                                </div>

                                {/* Trust Badges */}
                                <div className='grid grid-cols-3 gap-4 pt-4'>
                                    <div className='text-center'>
                                        <Truck className='w-8 h-8 text-indigo-400 mx-auto mb-2' />
                                        <div className='text-xs text-slate-400'>Instant Delivery</div>
                                    </div>
                                    <div className='text-center'>
                                        <Shield className='w-8 h-8 text-indigo-400 mx-auto mb-2' />
                                        <div className='text-xs text-slate-400'>100% Genuine</div>
                                    </div>
                                    <div className='text-center'>
                                        <Download className='w-8 h-8 text-indigo-400 mx-auto mb-2' />
                                        <div className='text-xs text-slate-400'>Digital Key</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Related Products */}
            <section className='py-12 bg-slate-900/30'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className='mb-8'
                    >
                        <h2 className='text-2xl md:text-3xl font-semibold text-white'>
                            Related Products
                        </h2>
                    </motion.div>

                    <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                        {relatedProducts.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Link href={`/products/${item.id}`}>
                                    <Card className='bg-slate-800/30 border-slate-700 hover:border-indigo-500/50 transition-all overflow-hidden group'>
                                        <div className='aspect-square bg-slate-700/30 flex items-center justify-center'>
                                            <Package className='w-16 h-16 text-slate-600' />
                                        </div>
                                        <CardContent className='p-4'>
                                            <div className='text-xs text-indigo-400 mb-2'>{item.platform}</div>
                                            <h3 className='font-medium text-slate-200 mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors'>
                                                {item.title}
                                            </h3>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-lg font-bold text-white'>${item.price}</span>
                                                {item.originalPrice && (
                                                    <span className='text-sm text-slate-500 line-through'>${item.originalPrice}</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}