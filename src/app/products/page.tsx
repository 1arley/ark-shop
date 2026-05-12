'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
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
    Plus,
    Edit2,
    Trash2,
    Key,
    X,
    Save,
    CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { apiClient } from '@/services/api'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { formatPrice, extractApiError } from '@/lib/utils'
import type { Product, Category, ProductListParams } from '@/types/api'

function ProductsPageContent() {
    const searchParams = useSearchParams()
    const initialCategoryId = searchParams.get('categoryId')
    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId)

    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(true)
    const [isLoadingCategories, setIsLoadingCategories] = useState(true)
    const [totalProducts, setTotalProducts] = useState(0)

    const { addItem } = useCart()

    // Admin: product modal
    const [productModal, setProductModal] = useState<{ open: boolean; editing: Product | null }>({ open: false, editing: null })
    const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '1', categoryId: '', imageUrl: '' })
    const [savingProduct, setSavingProduct] = useState(false)
    const [productError, setProductError] = useState<string | null>(null)
    const [productSuccess, setProductSuccess] = useState<string | null>(null)

    // Admin: key management modal
    const [keyModal, setKeyModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null })
    const [keyBatch, setKeyBatch] = useState('')
    const [addingKeys, setAddingKeys] = useState(false)
    const [keyError, setKeyError] = useState<string | null>(null)
    const [keySuccess, setKeySuccess] = useState<string | null>(null)

    // Animations
    const [justAdded, setJustAdded] = useState<string | null>(null)

    // Fetch categories
    useEffect(() => {
        async function loadCategories() {
            try {
                const response = await apiClient.categories.list()
                setCategories(Array.isArray(response.data) ? response.data : [])
            } catch (err) {
                console.error('Failed to load categories:', err)
            } finally {
                setIsLoadingCategories(false)
            }
        }
        loadCategories()
    }, [])

    // Fetch products
    const loadProducts = useCallback(async () => {
        setIsLoadingProducts(true)
        try {
            const params: Record<string, unknown> = {
                search: searchQuery || undefined,
                categoryId: selectedCategoryId || undefined,
                isActive: isAdmin ? undefined : true, // Admin sees all products
                limit: 50,
            }
            const response = await apiClient.products.list(params as ProductListParams)
            const data = response.data
            if (Array.isArray(data)) {
                setProducts(data)
                setTotalProducts(data.length)
            } else {
                setProducts(data.data || [])
                // Backend returns pagination inside meta, not at top level
                const paginated = data as { data: Product[]; meta?: { total: number } }
                setTotalProducts(paginated.meta?.total ?? 0)
            }
        } catch {
            setProducts([])
        } finally {
            setIsLoadingProducts(false)
        }
    }, [searchQuery, selectedCategoryId, isAdmin])

    useEffect(() => {
        const debounce = setTimeout(loadProducts, 300)
        return () => clearTimeout(debounce)
    }, [loadProducts])

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
        // Animate button feedback
        setJustAdded(product.id)
        setTimeout(() => setJustAdded(null), 1200)
    }

    // Admin: open product modal for create/edit
    const openProductModal = (product?: Product) => {
        if (product) {
            setProductForm({
                name: product.name,
                description: product.description || '',
                price: String(product.price),
                stock: String(product.stock),
                categoryId: product.categoryId || '',
                imageUrl: product.imageUrl || '',
            })
            setProductModal({ open: true, editing: product })
        } else {
            setProductForm({ name: '', description: '', price: '', stock: '1', categoryId: '', imageUrl: '' })
            setProductModal({ open: true, editing: null })
        }
        setProductError(null)
        setProductSuccess(null)
    }

    // Admin: save product (create or update)
    const saveProduct = async () => {
        setSavingProduct(true)
        setProductError(null)

        const parsedPrice = parseFloat(productForm.price)
        const parsedStock = parseInt(productForm.stock, 10)
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            setProductError('Price must be a valid positive number')
            setSavingProduct(false)
            return
        }
        if (isNaN(parsedStock) || parsedStock < 0) {
            setProductError('Stock must be a valid non-negative number')
            setSavingProduct(false)
            return
        }

        try {
            const data = {
                name: productForm.name,
                description: productForm.description || undefined,
                price: parsedPrice,
                stock: parsedStock,
                categoryId: productForm.categoryId || undefined,
                imageUrl: productForm.imageUrl || undefined,
            }
            if (productModal.editing) {
                await apiClient.admin.updateProduct(productModal.editing.id, data)
                setProductSuccess('Product updated successfully!')
            } else {
                await apiClient.admin.createProduct(data)
                setProductSuccess('Product created successfully!')
            }
            setTimeout(() => {
                setProductModal({ open: false, editing: null })
                loadProducts()
            }, 800)
        } catch (err) {
            setProductError(extractApiError(err, 'Failed to save product'))
        }
        setSavingProduct(false)
    }

    // Admin: delete product
    const deleteProduct = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this product?')) return
        try {
            await apiClient.admin.deleteProduct(id)
            loadProducts()
        } catch (err) {
            console.error('Failed to delete product:', err)
        }
    }

    // Admin: open key management modal
    const openKeyModal = (e: React.MouseEvent, product: Product) => {
        e.preventDefault()
        e.stopPropagation()
        setKeyBatch('')
        setKeyError(null)
        setKeySuccess(null)
        setKeyModal({ open: true, product })
    }

    // Admin: add keys
    const handleAddKeys = async () => {
        if (!keyModal.product || !keyBatch.trim()) return
        setAddingKeys(true)
        setKeyError(null)
        setKeySuccess(null)
        try {
            const keysList = keyBatch.split('\n').map(k => k.trim()).filter(Boolean)
            const res = await apiClient.admin.addKeys(keyModal.product.id, keysList)
            setKeySuccess(`${res.data.count} key(s) added successfully!`)
            setKeyBatch('')
        } catch (err) {
            setKeyError(extractApiError(err, 'Failed to add keys'))
        }
        setAddingKeys(false)
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
                        <div className='flex items-center justify-center gap-4 mb-4'>
                            <h1 className='text-4xl md:text-5xl font-semibold text-white'>
                                Browse Products
                            </h1>
                            {isAdmin && (
                                <Badge className='bg-violet-600 text-white border-0 text-xs'>
                                    ADMIN
                                </Badge>
                            )}
                        </div>
                        <p className='text-neutral-400 text-lg max-w-2xl mx-auto'>
                            {isAdmin ? 'Manage your product catalog — add, edit, and organize products' : 'Discover our extensive collection of digital keys and licenses'}
                        </p>

                        {/* Admin: Add Product button */}
                        {isAdmin && (
                            <div className='mt-6'>
                                <Button onClick={() => openProductModal()} className='bg-violet-600 hover:bg-violet-500'>
                                    <Plus className='w-4 h-4 mr-2' />
                                    Add Product
                                </Button>
                            </div>
                        )}
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
                                            className='relative group'
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
                                                        {/* Admin: inactive overlay */}
                                                        {!product.isActive && (
                                                            <div className='absolute inset-0 bg-neutral-950/60 flex items-center justify-center'>
                                                                <span className='text-neutral-400 text-sm font-medium'>Inactive</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                                        <div className='flex items-center justify-between mb-1'>
                                                            <span className='text-xs text-violet-400'>{product.category?.name || 'Digital'}</span>
                                                            {/* Admin: stock badge */}
                                                            {isAdmin && (
                                                                <span className={`text-xs ${product.stock <= 0 ? 'text-red-400' : product.stock <= 5 ? 'text-amber-400' : 'text-neutral-500'}`}>
                                                                    Stock: {product.stock}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className='font-medium text-neutral-200 mb-2 line-clamp-2 hover:text-violet-400 transition-colors'>
                                                            {product.name}
                                                        </h3>
                                                        <div className='flex items-center gap-3'>
                                                            <div className='flex flex-col'>
                                                                <span className='text-lg font-semibold text-white'>
                                                                    R$ {formatPrice(product.price)}
                                                                </span>
                                                            </div>
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
                                                                    <motion.span
                                                                        key={justAdded === product.id ? 'check' : 'cart'}
                                                                        initial={{ scale: 0, opacity: 0 }}
                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                        exit={{ scale: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.2 }}
                                                                    >
                                                                        {justAdded === product.id ? (
                                                                            <CheckCircle2 className='w-4 h-4' />
                                                                        ) : (
                                                                            <ShoppingCart className='w-4 h-4' />
                                                                        )}
                                                                    </motion.span>
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Admin: action buttons */}
                                                        {isAdmin && (
                                                            <div className='flex items-center gap-2 mt-3 pt-3 border-t border-neutral-800'>
                                                                <Button
                                                                    size='sm'
                                                                    variant='outline'
                                                                    className='flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs h-8'
                                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openProductModal(product) }}
                                                                >
                                                                    <Edit2 className='w-3 h-3 mr-1' />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    size='sm'
                                                                    variant='outline'
                                                                    className='flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs h-8'
                                                                    onClick={(e) => openKeyModal(e, product)}
                                                                >
                                                                    <Key className='w-3 h-3 mr-1' />
                                                                    Keys
                                                                </Button>
                                                                <Button
                                                                    size='sm'
                                                                    variant='outline'
                                                                    className='border-red-700 text-red-400 hover:bg-red-900/30 text-xs h-8'
                                                                    onClick={(e) => deleteProduct(e, product.id)}
                                                                >
                                                                    <Trash2 className='w-3 h-3' />
                                                                </Button>
                                                            </div>
                                                        )}
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

            {/* Admin: Product Modal */}
            {productModal.open && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm' onClick={() => setProductModal({ open: false, editing: null })}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className='bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg mx-4'
                    >
                        <div className='flex items-center justify-between p-6 border-b border-neutral-800'>
                            <h2 className='text-lg font-semibold text-white'>
                                {productModal.editing ? 'Edit Product' : 'Add Product'}
                            </h2>
                            <button onClick={() => setProductModal({ open: false, editing: null })} className='text-neutral-400 hover:text-white'>
                                <X className='w-5 h-5' />
                            </button>
                        </div>
                        <div className='p-6 space-y-4 max-h-[60vh] overflow-y-auto'>
                            {productError && (
                                <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm'>{productError}</div>
                            )}
                            {productSuccess && (
                                <div className='p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2'>
                                    <CheckCircle2 className='w-4 h-4' />
                                    {productSuccess}
                                </div>
                            )}
                            <div>
                                <label className='text-sm text-neutral-400 mb-1 block'>Name *</label>
                                <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className='bg-neutral-800 border-neutral-700 text-white' />
                            </div>
                            <div>
                                <label className='text-sm text-neutral-400 mb-1 block'>Description</label>
                                <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className='w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white text-sm min-h-20' />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm text-neutral-400 mb-1 block'>Price *</label>
                                    <Input type='number' step='0.01' value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className='bg-neutral-800 border-neutral-700 text-white' />
                                </div>
                                <div>
                                    <label className='text-sm text-neutral-400 mb-1 block'>Stock *</label>
                                    <Input type='number' value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className='bg-neutral-800 border-neutral-700 text-white' />
                                </div>
                            </div>
                            <div>
                                <label className='text-sm text-neutral-400 mb-1 block'>Category</label>
                                <select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })} className='w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white text-sm'>
                                    <option value=''>No category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className='text-sm text-neutral-400 mb-1 block'>Image URL</label>
                                <Input value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} placeholder='https://...' className='bg-neutral-800 border-neutral-700 text-white' />
                            </div>
                        </div>
                        <div className='flex gap-3 justify-end p-6 border-t border-neutral-800'>
                            <Button variant='outline' onClick={() => setProductModal({ open: false, editing: null })} className='border-neutral-700 text-neutral-300'>
                                Cancel
                            </Button>
                            <Button onClick={saveProduct} disabled={savingProduct || !productForm.name || !productForm.price} className='bg-violet-600 hover:bg-violet-500'>
                                {savingProduct ? <Loader2 className='w-4 h-4 animate-spin' /> : <><Save className='w-4 h-4 mr-2' />{productModal.editing ? 'Update' : 'Create'}</>}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Admin: Key Management Modal */}
            {keyModal.open && keyModal.product && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm' onClick={() => setKeyModal({ open: false, product: null })}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className='bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg mx-4'
                    >
                        <div className='flex items-center justify-between p-6 border-b border-neutral-800'>
                            <div>
                                <h2 className='text-lg font-semibold text-white'>Add Keys</h2>
                                <p className='text-sm text-neutral-400 mt-1'>For: {keyModal.product.name}</p>
                            </div>
                            <button onClick={() => setKeyModal({ open: false, product: null })} className='text-neutral-400 hover:text-white'>
                                <X className='w-5 h-5' />
                            </button>
                        </div>
                        <div className='p-6 space-y-4'>
                            {keyError && (
                                <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm'>{keyError}</div>
                            )}
                            {keySuccess && (
                                <div className='p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2'>
                                    <CheckCircle2 className='w-4 h-4' />
                                    {keySuccess}
                                </div>
                            )}
                            <div>
                                <label className='text-sm text-neutral-400 mb-1 block'>Keys (one per line)</label>
                                <textarea
                                    value={keyBatch}
                                    onChange={(e) => setKeyBatch(e.target.value)}
                                    placeholder='XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY&#10;ZZZZZ-ZZZZZ-ZZZZZ'
                                    className='w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white text-sm font-mono min-h-48'
                                />
                            </div>
                            <Button
                                onClick={handleAddKeys}
                                disabled={addingKeys || !keyBatch.trim()}
                                className='w-full bg-violet-600 hover:bg-violet-500'
                            >
                                {addingKeys ? <Loader2 className='w-4 h-4 animate-spin mr-2' /> : <Key className='w-4 h-4 mr-2' />}
                                Add Keys
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

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
