'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Package,
  ShoppingCart,
  Grid3x3,
  List,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { apiClient } from '@/services/api'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'
import type { Product, Category, PaginatedResponse } from '@/types/api'

function CategoryPageContent() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const searchParams = useSearchParams()
  const pageParam = searchParams.get('page')

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const { addItem } = useCart()

  // Fetch all categories to find the matching one
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await apiClient.categories.list()
        const cats = Array.isArray(response.data) ? response.data : []
        setAllCategories(cats)

        // Find category by name (slugified) or ID
        const found = cats.find(
          (c) =>
            c.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
            c.id === slug
        )
        setCategory(found || null)
      } catch {
        // keep null
      }
    }
    loadCategories()
  }, [slug])

  // Fetch products for this category
  useEffect(() => {
    if (!category) {
      setIsLoading(false)
      return
    }

    async function loadProducts() {
      setIsLoading(true)
      try {
        const response = await apiClient.products.list({
          page: currentPage,
          limit: 20,
          categoryId: category!.id,
          isActive: true,
        })
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

    loadProducts()
  }, [category, currentPage])

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
    router.push(`/categories/${slug}?page=${page}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get child categories
  const childCategories = category
    ? allCategories.filter((c) => c.parentId === category.id)
    : []

  if (!category && !isLoading) {
    return (
      <div className='min-h-screen bg-neutral-950'>
        <Header />
        <EmptyState
          icon='alert'
          title='Category not found'
          description='The category you are looking for does not exist.'
          actionLabel='Browse All Categories'
          actionHref='/categories'
        />
        <Footer />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

      {/* Breadcrumb */}
      <div className='pt-24 pb-4 bg-neutral-950'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <nav className='flex items-center gap-2 text-sm'>
            <Link href='/' className='text-neutral-500 hover:text-neutral-300 transition-colors'>
              Home
            </Link>
            <ChevronRight className='w-4 h-4 text-neutral-600' />
            <Link href='/categories' className='text-neutral-500 hover:text-neutral-300 transition-colors'>
              Categories
            </Link>
            <ChevronRight className='w-4 h-4 text-neutral-600' />
            <span className='text-neutral-300'>{category?.name || 'Loading...'}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className='relative pb-12 bg-neutral-900 overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-20 left-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl' />
          <div className='absolute bottom-0 right-0 w-96 h-96 bg-sky-600/5 rounded-full blur-3xl' />
        </div>

        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant='ghost'
              onClick={() => router.back()}
              className='text-neutral-400 hover:text-white mb-6'
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back
            </Button>

            <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
              {category?.name || 'Loading...'}
            </h1>
            {category?.description && (
              <p className='text-neutral-400 text-lg max-w-2xl'>
                {category.description}
              </p>
            )}
            <p className='text-neutral-500 mt-2'>
              {total} product{total !== 1 ? 's' : ''} available
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sub-categories */}
      {childCategories.length > 0 && (
        <section className='py-8 border-b border-neutral-800'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h3 className='text-sm font-semibold text-neutral-400 mb-4'>Sub-categories</h3>
            <div className='flex flex-wrap gap-3'>
              {childCategories.map((child) => (
                <Link key={child.id} href={`/categories/${child.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Button variant='outline' className='border-neutral-700 text-neutral-300 hover:bg-neutral-800'>
                    {child.name}
                    {child._count && (
                      <span className='ml-2 text-xs text-neutral-500'>({child._count.products})</span>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className='py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Toolbar */}
          <div className='flex items-center justify-between mb-6'>
            <p className='text-neutral-400'>
              Showing <span className='text-white font-medium'>{total}</span> products
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
              icon='package'
              title='No products in this category'
              description='This category does not have any products yet.'
              actionLabel='Browse All Products'
              actionHref='/products'
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function CategoryPage() {
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
      <CategoryPageContent />
    </Suspense>
  )
}
