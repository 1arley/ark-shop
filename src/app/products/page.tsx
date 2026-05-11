'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Search,
    Filter,
    ShoppingCart,
    Package,
    Grid3x3,
    List,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { apiClient } from '@/services/api'
import { useCart } from '@/hooks/use-cart'
import type { Product, Category } from '@/types/api'

function ProductsPageContent() {
    const searchParams = useSearchParams()
    const initialCategoryId = searchParams.get('categoryId')

    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId)

    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(true)
    const [isLoadingCategories, setIsLoadingCategories] = useState(true)
    const [totalProducts, setTotalProducts] = useState(0)

    const { addItem } = useCart()

    // Fetch categories
    useEffect(() => {
        async function loadCategories() {
            try {
                const response = await apiClient.categories.list()
                setCategories(Array.isArray(response.data) ? response.data : [])
            } catch {
                // keep empty
            } finally {
                setIsLoadingCategories(false)
            }
        }
        loadCategories()
    }, [])

    // Fetch products whenever search or category changes
    useEffect(() => {
        async function loadProducts() {
            setIsLoadingProducts(true)
            try {
                const response = await apiClient.products.list({
                    search: searchQuery || undefined,
                    categoryId: selectedCategoryId || undefined,
                    isActive: true,
                    limit: 50,
                })
                const data = response.data
                if (Array.isArray(data)) {
                    setProducts(data)
                    setTotalProducts(data.length)
                } else {
                    setProducts(data.data || [])
                    setTotalProducts(data.total || 0)
                }
            } catch {
                setProducts([])
            } finally {
                setIsLoadingProducts(false)
            }
        }

        const debounce = setTimeout(loadProducts, 300)
        return () => clearTimeout(debounce)
    }, [searchQuery, selectedCategoryId])

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

  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

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
                                {isLoadingCategories ? (
                                    <div className='flex justify-center py-4'>
                                        <Loader2 className='w-5 h-5 text-neutral-500 animate-spin' />
                                    </div>
                                ) : (
                                    <nav className='space-y-2'>
                                        <button
                                            onClick={() => setSelectedCategoryId(null)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                                !selectedCategoryId
                                                    ? 'bg-violet-600 text-white'
                                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                            }`}
                                        >
                                            <div className='flex items-center gap-3'>
                                                <Package className='w-4 h-4' />
                                                <span className='text-sm'>All Products</span>
                                            </div>
                                            <span className='text-xs opacity-60'>{totalProducts}</span>
                                        </button>
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => setSelectedCategoryId(selectedCategoryId === category.id ? null : category.id)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                                    selectedCategoryId === category.id
                                                        ? 'bg-violet-600 text-white'
                                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                                }`}
                                            >
                                                <div className='flex items-center gap-3'>
                                                    <Package className='w-4 h-4' />
                                                    <span className='text-sm'>{category.name}</span>
                                                </div>
                                                {category._count && (
                                                    <span className='text-xs opacity-60'>{category._count.products}</span>
                                                )}
                                            </button>
                                        ))}
                                    </nav>
                                )}
                            </div>
                        </aside>

                        {/* Products Grid */}
                        <main className='flex-1'>
                            {/* Toolbar */}
                            <div className='flex items-center justify-between mb-6'>
                                <p className='text-neutral-400'>
                                    Showing <span className='text-white font-medium'>{products.length}</span> products
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
                            {isLoadingProducts ? (
                                <div className='flex justify-center py-16'>
                                    <Loader2 className='w-10 h-10 text-violet-400 animate-spin' />
                                </div>
                            ) : (
                                <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                                    {products.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <Link href={`/products/${product.id}`}>
                                                <Card className='bg-neutral-900/50 border-neutral-800 hover:border-violet-500/30 transition-all overflow-hidden'>
                                                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'} bg-neutral-800/50 overflow-hidden`}>
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} className='object-cover w-full h-full' />
                                                        ) : (
                                                            <div className='absolute inset-0 flex items-center justify-center text-neutral-700'>
                                                                <Package className='w-12 h-12' />
                                                            </div>
                                                        )}
                                                        {product.stock <= 0 && (
                                                            <div className='absolute top-3 left-3'>
                                                                <Badge className='bg-red-600 text-white border-0'>
                                                                    Out of Stock
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                                        <div className='text-xs text-violet-400 mb-2'>{product.category?.name || 'Digital'}</div>
                                                        <h3 className='font-medium text-neutral-200 mb-2 line-clamp-2 hover:text-violet-400 transition-colors'>
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
                            )}

                            {!isLoadingProducts && products.length === 0 && (
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

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className='min-h-screen bg-neutral-950'>
                <Header />
                <div className='flex justify-center items-center py-32'>
                    <Loader2 className='w-12 h-12 text-violet-400 animate-spin' />
                </div>
                <Footer />
            </div>
        }>
            <ProductsPageContent />
        </Suspense>
    )
}