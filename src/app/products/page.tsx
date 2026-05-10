'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Search,
    Filter,
    ShoppingCart,
    Star,
    Package,
    Grid3x3,
    List,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const categories = [
        { name: 'All Products', icon: Package, count: 783 },
        { name: 'Steam Keys', icon: Package, count: 502 },
        { name: 'Office Suites', icon: Package, count: 48 },
        { name: 'Gift Cards', icon: Package, count: 127 },
        { name: 'Subscriptions', icon: Package, count: 83 },
        { name: 'Operating Systems', icon: Package, count: 42 },
    ]

    const products = [
        {
            id: 1,
            title: 'Steam Gift Card $50',
            price: 50.0,
            originalPrice: 55.0,
            category: 'Gift Cards',
            platform: 'Steam',
            rating: 4.8,
            reviews: 2847,
            badge: 'Featured',
            inStock: true,
        },
        {
            id: 2,
            title: 'Microsoft 365 Personal (1 Year)',
            price: 69.99,
            originalPrice: 99.99,
            category: 'Office Suites',
            platform: 'Microsoft',
            rating: 4.9,
            reviews: 1923,
            badge: 'Best Seller',
            inStock: true,
        },
        {
            id: 3,
            title: 'Windows 11 Pro License',
            price: 139.99,
            originalPrice: 199.99,
            category: 'Operating Systems',
            platform: 'Microsoft',
            rating: 4.7,
            reviews: 3421,
            badge: 'Deal',
            inStock: true,
        },
        {
            id: 4,
            title: 'Discord Nitro Gift (12 Months)',
            price: 99.99,
            originalPrice: 119.99,
            category: 'Subscriptions',
            platform: 'Discord',
            rating: 4.9,
            reviews: 5621,
            badge: 'Popular',
            inStock: true,
        },
        {
            id: 5,
            title: 'Elden Ring - Steam Key',
            price: 39.99,
            originalPrice: 59.99,
            category: 'Steam Keys',
            platform: 'Steam',
            rating: 4.9,
            reviews: 8934,
            badge: 'Best Seller',
            inStock: true,
        },
        {
            id: 6,
            title: 'Microsoft Teams Premium (1 Month)',
            price: 12.99,
            originalPrice: 15.99,
            category: 'Subscriptions',
            platform: 'Microsoft',
            rating: 4.5,
            reviews: 342,
            badge: null,
            inStock: true,
        },
        {
            id: 7,
            title: 'Spotify Premium Gift (3 Months)',
            price: 29.99,
            originalPrice: 35.97,
            category: 'Gift Cards',
            platform: 'Spotify',
            rating: 4.8,
            reviews: 4521,
            badge: 'Deal',
            inStock: true,
        },
        {
            id: 8,
            title: 'Cyberpunk 2077 - Steam Key',
            price: 29.99,
            originalPrice: 59.99,
            category: 'Steam Keys',
            platform: 'Steam',
            rating: 4.6,
            reviews: 12453,
            badge: 'Sale',
            inStock: true,
        },
    ]

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !selectedCategory || product.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className='min-h-screen bg-neutral-950'>
            <Header cartCount={0} />

            {/* Hero Section */}
            <section className='relative py-20 bg-neutral-900 overflow-hidden'>
                <div className='absolute inset-0'>
                    <div className='absolute top-20 left-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl' />
                    <div className='absolute bottom-0 right-0 w-96 h-96 bg-sky-600/5 rounded-full blur-3xl' />
                </div>

                <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className='text-center mb-8'
                    >
                        <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
                            Browse Products
                        </h1>
                        <p className='text-neutral-400 text-lg max-w-2xl mx-auto'>
                            Discover our extensive collection of digital keys and licenses
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <div className='max-w-xl mx-auto'>
                        <div className='relative'>
                            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500' />
                            <Input
                                type='text'
                                placeholder='Search for games, software, or gift cards...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full pl-12 pr-4 h-14 bg-neutral-800/50 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 focus:border-violet-500 focus:ring-violet-500'
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className='py-12'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex flex-col lg:flex-row gap-8'>
                        {/* Sidebar */}
                        <aside className='lg:w-64 flex-shrink-0'>
                            <div className='sticky top-24'>
                                <div className='flex items-center gap-2 mb-4'>
                                    <Filter className='w-5 h-5 text-neutral-500' />
                                    <h3 className='font-semibold text-white'>Categories</h3>
                                </div>
                                <nav className='space-y-2'>
                                    {categories.map((category) => (
                                        <button
                                            key={category.name}
                                            onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                                selectedCategory === category.name
                                                    ? 'bg-violet-600 text-white'
                                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                            }`}
                                        >
                                            <div className='flex items-center gap-3'>
                                                <category.icon className='w-4 h-4' />
                                                <span className='text-sm'>{category.name}</span>
                                            </div>
                                            <span className='text-xs opacity-60'>{category.count}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Products Grid */}
                        <main className='flex-1'>
                            {/* Toolbar */}
                            <div className='flex items-center justify-between mb-6'>
                                <p className='text-neutral-400'>
                                    Showing <span className='text-white font-medium'>{filteredProducts.length}</span> products
                                </p>
                                <div className='flex items-center gap-2'>
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size='sm'
                                        onClick={() => setViewMode('grid')}
                                        className={viewMode === 'grid' ? 'bg-violet-600' : ''}
                                    >
                                        <Grid3x3 className='w-4 h-4' />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size='sm'
                                        onClick={() => setViewMode('list')}
                                        className={viewMode === 'list' ? 'bg-violet-600' : ''}
                                    >
                                        <List className='w-4 h-4' />
                                    </Button>
                                </div>
                            </div>

                            {/* Products */}
                            <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                                {filteredProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Link href={`/products/${product.id}`}>
                                            <Card className='bg-neutral-900/50 border-neutral-800 hover:border-violet-500/30 transition-all overflow-hidden'>
                                                <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'} bg-neutral-800/50 overflow-hidden`}>
                                                    <div className='absolute inset-0 flex items-center justify-center text-neutral-700'>
                                                        <Package className='w-12 h-12' />
                                                    </div>
                                                    {product.badge && (
                                                        <div className='absolute top-3 left-3'>
                                                            <Badge className='bg-violet-600 text-white border-0'>
                                                                {product.badge}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                                <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                                    <div className='text-xs text-violet-400 mb-2'>{product.platform}</div>
                                                    <h3 className='font-medium text-neutral-200 mb-2 line-clamp-2 hover:text-violet-400 transition-colors'>
                                                        {product.title}
                                                    </h3>
                                                    <div className='flex items-center gap-1 mb-3'>
                                                        <Star className='w-4 h-4 text-amber-500 fill-amber-500' />
                                                        <span className='text-sm text-neutral-300'>{product.rating}</span>
                                                        <span className='text-xs text-neutral-500'>({product.reviews.toLocaleString()})</span>
                                                    </div>
                                                    <div className='flex items-center gap-3'>
                                                        <div className='flex flex-col'>
                                                            <span className='text-lg font-semibold text-white'>
                                                                ${product.price.toFixed(2)}
                                                            </span>
                                                            {product.originalPrice && (
                                                                <span className='text-xs text-neutral-500 line-through'>
                                                                    ${product.originalPrice.toFixed(2)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className='ml-auto'>
                                                            <Button size='sm' className='bg-white text-neutral-950 hover:bg-neutral-200'>
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

                            {filteredProducts.length === 0 && (
                                <div className='text-center py-12'>
                                    <Package className='w-16 h-16 text-neutral-600 mx-auto mb-4' />
                                    <h3 className='text-xl font-medium text-white mb-2'>No products found</h3>
                                    <p className='text-neutral-400'>Try adjusting your search or filters</p>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}