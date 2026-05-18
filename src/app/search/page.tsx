'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Search,
  Package,
  ShoppingCart,
  Grid3x3,
  List,
  Loader2,
  CheckCircle2,
  Filter,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { apiClient } from '@/services/api'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'
import type { Product, Category, PaginatedResponse } from '@/types/api'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || null

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const { addItem } = useCart()

  // Fetch categories for filter
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await apiClient.categories.list()
        setCategories(Array.isArray(response.data) ? response.data : [])
      } catch {
        // keep empty
      }
    }
    loadCategories()
  }, [])

  // Fetch search results
  useEffect(() => {
    if (!initialQuery && !initialCategory) {
      setIsLoading(false)
      return
    }

    async function loadProducts() {
      setIsLoading(true)
      try {
        const params: Record<string, unknown> = {
          page: currentPage,
          limit: 20,
          isActive: true,
        }
        if (initialQuery) params.search = initialQuery
        if (selectedCategory) params.categoryId = selectedCategory

        const response = await apiClient.products.list(params)
        const data = response.data
        if (Array.isArray(data)) {
          setProducts(data)
          setTotal(data.length)
          setTotalPages(1)
        } else {
          const paginated = data as PaginatedResponse<Product>
          setProducts(paginated.data || [])
          setTotal(paginated.total || 0)
          setTotalPages(paginated.totalPages || 1)
        }
      } catch {
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(loadProducts, 300)
    return () => clearTimeout(debounce)
  }, [initialQuery, selectedCategory, currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams()
      params.set('q', searchQuery.trim())
      if (selectedCategory) params.set('category', selectedCategory)
      router.push(`/search?${params.toString()}`)
    }
  }

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
    setJustAdded(product.id)
    setTimeout(() => setJustAdded(null), 1200)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setSearchQuery('')
    router.push('/search')
  }

  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

      {/* Hero Section */}
      <section className='relative pt-28 pb-12 bg-neutral-900 overflow-hidden'>
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
              Search Results
            </h1>
            <p className='text-neutral-400 text-lg max-w-2xl mx-auto'>
              {initialQuery
                ? `Results for "${initialQuery}"`
                : 'Browse our product catalog'}
            </p>
          </motion.div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className='max-w-2xl mx-auto'>
            <div className='relative'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500' />
              <Input
                type='text'
                placeholder='Search for games, software, or gift cards...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-12 pr-4 h-14 bg-neutral-800/50 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 focus:border-violet-500 focus:ring-violet-500'
              />
              <Button
                type='submit'
                className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-violet-600 hover:bg-violet-500 h-10'
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <section className='py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col lg:flex-row gap-8'>
            {/* Sidebar Filters */}
            <aside className='lg:w-64 flex-shrink-0'>
              <div className='sticky top-24'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <Filter className='w-5 h-5 text-neutral-500' />
                    <h3 className='font-semibold text-white'>Filters</h3>
                  </div>
                  {(selectedCategory || initialQuery) && (
                    <button
                      onClick={clearFilters}
                      className='text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1'
                    >
                      <X className='w-3 h-3' />
                      Clear
                    </button>
                  )}
                </div>

                {/* Active Filters */}
                {(selectedCategory || initialQuery) && (
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {initialQuery && (
                      <Badge className='bg-violet-600/20 text-violet-400 border-violet-500/30'>
                        Search: {initialQuery}
                      </Badge>
                    )}
                    {selectedCategory && (
                      <Badge className='bg-sky-600/20 text-sky-400 border-sky-500/30'>
                        {categories.find(c => c.id === selectedCategory)?.name || 'Category'}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Category Filter */}
                <nav className='space-y-2'>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory
                        ? 'bg-violet-600 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <Package className='w-4 h-4' />
                      <span className='text-sm'>All Categories</span>
                    </div>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
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
              </div>
            </aside>

            {/* Results */}
            <main className='flex-1'>
              {/* Toolbar */}
              <div className='flex items-center justify-between mb-6'>
                <p className='text-neutral-400'>
                  Showing <span className='text-white font-medium'>{total}</span> results
                  {currentPage > 1 && ` (page ${currentPage})`}
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

              {/* Products Grid */}
              {isLoading ? (
                <div className='flex justify-center py-16'>
                  <Loader2 className='w-10 h-10 text-violet-400 animate-spin' />
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Link href={`/products/${product.id}`}>
                          <Card className='bg-neutral-900/50 border-neutral-800 hover:border-violet-500/30 transition-all overflow-hidden group'>
                            <div className='relative aspect-square bg-neutral-800/50 overflow-hidden'>
                              {product.imageUrl ? (
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  className='object-cover group-hover:scale-105 transition-transform duration-300'
                                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                                  unoptimized
                                />
                              ) : (
                                <div className='absolute inset-0 flex items-center justify-center text-neutral-700'>
                                  <Package className='w-12 h-12' />
                                </div>
                              )}
                              {product.stock <= 0 && (
                                <div className='absolute inset-0 bg-neutral-950/70 flex items-center justify-center'>
                                  <span className='text-neutral-400 text-sm'>Out of Stock</span>
                                </div>
                              )}
                            </div>
                            <CardContent className='p-4'>
                              <div className='text-xs text-violet-400 mb-2'>{product.category?.name || 'Digital'}</div>
                              <h3 className='font-medium text-neutral-200 mb-2 line-clamp-2 group-hover:text-violet-400 transition-colors'>
                                {product.name}
                              </h3>
                              <div className='flex items-center gap-3'>
                                <span className='text-lg font-semibold text-white'>
                                  R$ {formatPrice(product.price)}
                                </span>
                                <div className='ml-auto'>
                                  <Button
                                    size='sm'
                                    className={`relative overflow-hidden transition-all duration-300 ${
                                      justAdded === product.id
                                        ? 'bg-emerald-500 text-white scale-110'
                                        : 'bg-white text-neutral-950 hover:bg-neutral-200'
                                    }`}
                                    onClick={(e) => handleAddToCart(e, product)}
                                    disabled={product.stock <= 0}
                                  >
                                    {justAdded === product.id ? (
                                      <CheckCircle2 className='w-4 h-4' />
                                    ) : (
                                      <ShoppingCart className='w-4 h-4' />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className='mt-12'>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon='search'
                  title='No products found'
                  description={
                    initialQuery
                      ? `No results for "${initialQuery}". Try a different search term.`
                      : 'Try searching for games, software, or gift cards.'
                  }
                  actionLabel='Browse All Products'
                  actionHref='/products'
                />
              )}
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function SearchPage() {
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
      <SearchPageContent />
    </Suspense>
  )
}
