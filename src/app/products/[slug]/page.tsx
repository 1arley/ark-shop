'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    ShoppingCart,
    CheckCircle2,
    Truck,
    Shield,
    Download,
    Heart,
    Share2,
    Package,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { apiClient } from '@/services/api'
import { useCart } from '@/hooks/use-cart'
import type { Product } from '@/types/api'

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [product, setProduct] = useState<Product | null>(null)
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [favorite, setFavorite] = useState(false)
    const { addItem } = useCart()

    useEffect(() => {
        async function loadProduct() {
            try {
                setIsLoading(true)
                setError(null)
                const response = await apiClient.products.getById(slug)
                setProduct(response.data)

                // Load related products from same category
                if (response.data.categoryId) {
                    try {
                        const relatedResponse = await apiClient.products.list({
                            categoryId: response.data.categoryId,
                            limit: 4,
                            isActive: true,
                        })
                        const data = relatedResponse.data
                        const items = Array.isArray(data) ? data : (data.data || [])
                        setRelatedProducts(items.filter((p: Product) => p.id !== slug).slice(0, 4))
                    } catch {
                        // ok, no related products
                    }
                }
            } catch {
                setError('Product not found')
            } finally {
                setIsLoading(false)
            }
        }
        loadProduct()
    }, [slug])

    const handleAddToCart = () => {
        if (!product) return
        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            platform: product.category?.name || '',
            image: product.imageUrl || undefined,
        })
    }

    if (isLoading) {
        return (
            <div className='min-h-screen bg-neutral-950'>
                <Header />
                <div className='flex justify-center items-center py-32'>
                    <Loader2 className='w-12 h-12 text-violet-400 animate-spin' />
                </div>
                <Footer />
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className='min-h-screen bg-neutral-950'>
                <Header />
                <div className='text-center py-32'>
                    <Package className='w-20 h-20 text-neutral-600 mx-auto mb-6' />
                    <h1 className='text-3xl font-semibold text-white mb-4'>Product Not Found</h1>
                    <p className='text-neutral-400 mb-8'>The product you&apos;re looking for doesn&apos;t exist.</p>
                    <Button className='bg-white text-neutral-950 hover:bg-neutral-200'>
                        <Link href='/products'>Browse Products</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const discount = product.price > 0 ? Math.round(((product.price * 1.2 - product.price) / (product.price * 1.2)) * 100) : 0

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
                        <Link href='/products' className='hover:text-white transition-colors'>Products</Link>
                        {product.category && (
                            <>
                                <span>/</span>
                                <Link href={`/products?categoryId=${product.categoryId}`} className='hover:text-white transition-colors'>
                                    {product.category.name}
                                </Link>
                            </>
                        )}
                        <span>/</span>
                        <span className='text-white'>{product.name}</span>
                    </nav>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
                            {product.name}
                        </h1>
                        <div className='flex items-center gap-4 mb-4'>
                            <Badge className={product.stock > 0 ? 'bg-emerald-600 text-white border-0' : 'bg-red-600 text-white border-0'}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                            {product.stock > 0 && product.stock <= 5 && (
                                <span className='text-amber-400 text-sm'>Only {product.stock} left!</span>
                            )}
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
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className='object-cover w-full h-full' />
                                    ) : (
                                        <Package className='w-32 h-32 text-slate-600' />
                                    )}
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
                                        <span className='text-4xl font-bold text-white'>R$ {product.price.toFixed(2)}</span>
                                        {discount > 0 && (
                                            <Badge className='bg-emerald-600 text-white border-0'>
                                                Digital Key
                                            </Badge>
                                        )}
                                    </div>
                                    <p className='text-sm text-slate-400'>
                                        Instant digital delivery after purchase
                                    </p>
                                </div>

                                {/* Description */}
                                {product.description && (
                                    <div>
                                        <h3 className='text-lg font-semibold text-white mb-3'>Description</h3>
                                        <p className='text-slate-400'>{product.description}</p>
                                    </div>
                                )}

                                {/* Features */}
                                <div>
                                    <h3 className='text-lg font-semibold text-white mb-3'>Key Features</h3>
                                    <ul className='space-y-2'>
                                        {[
                                            'Instant digital delivery via email',
                                            'Verified and authentic key',
                                            'No expiration date',
                                            'Secure encrypted delivery',
                                        ].map((feature, index) => (
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
                                                {product.category && (
                                                    <div>
                                                        <div className='text-sm text-slate-500'>Category</div>
                                                        <div className='text-sm text-white font-medium'>{product.category.name}</div>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className='text-sm text-slate-500'>Type</div>
                                                    <div className='text-sm text-white font-medium'>Digital Key</div>
                                                </div>
                                                <div>
                                                    <div className='text-sm text-slate-500'>Delivery</div>
                                                    <div className='text-sm text-white font-medium'>Instant Digital</div>
                                                </div>
                                                <div>
                                                    <div className='text-sm text-slate-500'>Stock</div>
                                                    <div className='text-sm text-white font-medium'>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Purchase Actions */}
                                <div className='flex gap-4 pt-4'>
                                    <Button
                                        size='lg'
                                        className='bg-indigo-600 hover:bg-indigo-500 flex-1 h-14 text-lg font-semibold'
                                        onClick={handleAddToCart}
                                        disabled={product.stock <= 0}
                                    >
                                        <ShoppingCart className='w-5 h-5 mr-2' />
                                        Add to Cart
                                    </Button>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-slate-600 hover:bg-slate-700 h-14 px-8'
                                        disabled={product.stock <= 0}
                                    >
                                        <Link href='/cart'>Buy Now</Link>
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
            {relatedProducts.length > 0 && (
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
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className='object-cover w-full h-full' />
                                                ) : (
                                                    <Package className='w-16 h-16 text-slate-600' />
                                                )}
                                            </div>
                                            <CardContent className='p-4'>
                                                <div className='text-xs text-indigo-400 mb-2'>{item.category?.name || 'Digital'}</div>
                                                <h3 className='font-medium text-slate-200 mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors'>
                                                    {item.name}
                                                </h3>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-lg font-bold text-white'>R$ {item.price.toFixed(2)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    )
}