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
    Package,
    Loader2,
    Key,
    Save,
    Plus,
    Edit2,
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
import type { Product, Category } from '@/types/api'

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

    const [product, setProduct] = useState<Product | null>(null)
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { addItem } = useCart()

    // Admin: categories for editing
    const [categories, setCategories] = useState<Category[]>([])

    // Admin: edit mode
    const [editing, setEditing] = useState(false)
    const [editForm, setEditForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' })
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [saveSuccess, setSaveSuccess] = useState(false)

    // Admin: key management
    const [keyBatch, setKeyBatch] = useState('')
    const [addingKeys, setAddingKeys] = useState(false)
    const [keyError, setKeyError] = useState<string | null>(null)
    const [keySuccess, setKeySuccess] = useState<string | null>(null)

    useEffect(() => {
        async function loadProduct() {
            try {
                setIsLoading(true)
                setError(null)
                const response = await apiClient.products.getById(slug)
                const p = response.data
                setProduct(p)

                // Sync edit form
                setEditForm({
                    name: p.name,
                    description: p.description || '',
                    price: String(p.price),
                    stock: String(p.stock),
                    categoryId: p.categoryId || '',
                    imageUrl: p.imageUrl || '',
                })

                // Load categories for admin edit
                if (isAdmin) {
                    try {
                        const catRes = await apiClient.categories.list()
                        setCategories(Array.isArray(catRes.data) ? catRes.data : [])
                    } catch { /* ignore */ }
                }

                // Load related products from same category
                if (p.categoryId) {
                    try {
                        const relatedResponse = await apiClient.products.list({
                            categoryId: p.categoryId,
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
    }, [slug, isAdmin])

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

    // Admin: save product edit
    const handleSave = async () => {
        if (!product) return
        setSaving(true)
        setSaveError(null)
        setSaveSuccess(false)

        const parsedPrice = parseFloat(editForm.price)
        const parsedStock = parseInt(editForm.stock, 10)
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            setSaveError('Price must be a valid positive number')
            setSaving(false)
            return
        }
        if (isNaN(parsedStock) || parsedStock < 0) {
            setSaveError('Stock must be a valid non-negative number')
            setSaving(false)
            return
        }

        try {
            const updated = await apiClient.admin.updateProduct(product.id, {
                name: editForm.name,
                description: editForm.description || undefined,
                price: parsedPrice,
                stock: parsedStock,
                categoryId: editForm.categoryId || undefined,
                imageUrl: editForm.imageUrl || undefined,
            })
            setProduct(updated.data)
            setEditing(false)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err) {
            setSaveError(extractApiError(err, 'Failed to save'))
        }
        setSaving(false)
    }

    // Admin: add keys
    const handleAddKeys = async () => {
        if (!product || !keyBatch.trim()) return
        setAddingKeys(true)
        setKeyError(null)
        setKeySuccess(null)
        try {
            const keysList = keyBatch.split('\n').map(k => k.trim()).filter(Boolean)
            const res = await apiClient.admin.addKeys(product.id, keysList)
            setKeySuccess(`${res.data.count} key(s) added successfully!`)
            setKeyBatch('')
        } catch (err) {
            setKeyError(extractApiError(err, 'Failed to add keys'))
        }
        setAddingKeys(false)
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
        <div className='min-h-screen bg-neutral-950'>
            <Header />

            {/* Hero Section */}
            <section className='relative pt-28 pb-16 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-purple-950/40'>
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
                        <div className='flex items-center gap-4 mb-4'>
                            <h1 className='text-4xl md:text-5xl font-semibold text-white'>
                                {product.name}
                            </h1>
                            {isAdmin && (
                                <Badge className='bg-violet-600 text-white border-0 text-xs'>
                                    ADMIN
                                </Badge>
                            )}
                        </div>
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
                                    {/* Admin: edit button */}
                                    {isAdmin && !editing && (
                                        <Button
                                            variant='outline'
                                            className='border-slate-600 hover:bg-slate-700 w-full'
                                            onClick={() => setEditing(true)}
                                        >
                                            <Edit2 className='w-4 h-4 mr-2' />
                                            Edit Product
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Product Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {editing ? (
                                /* Admin: Inline Edit Form */
                                <div className='space-y-4'>
                                    <h3 className='text-lg font-semibold text-white mb-4'>Editing: {product.name}</h3>
                                    {saveError && <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm'>{saveError}</div>}
                                    {saveSuccess && <div className='p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2'><CheckCircle2 className='w-4 h-4' />Saved!</div>}
                                    <div>
                                        <label className='text-sm text-slate-400 mb-1 block'>Name</label>
                                        <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className='bg-slate-800 border-slate-600 text-white' />
                                    </div>
                                    <div>
                                        <label className='text-sm text-slate-400 mb-1 block'>Description</label>
                                        <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className='w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-sm min-h-20' />
                                    </div>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className='text-sm text-slate-400 mb-1 block'>Price</label>
                                            <Input type='number' step='0.01' value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className='bg-slate-800 border-slate-600 text-white' />
                                        </div>
                                        <div>
                                            <label className='text-sm text-slate-400 mb-1 block'>Stock</label>
                                            <Input type='number' value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} className='bg-slate-800 border-slate-600 text-white' />
                                        </div>
                                    </div>
                                    <div>
                                        <label className='text-sm text-slate-400 mb-1 block'>Category</label>
                                        <select value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })} className='w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white text-sm'>
                                            <option value=''>No category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className='text-sm text-slate-400 mb-1 block'>Image URL</label>
                                        <Input value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} className='bg-slate-800 border-slate-600 text-white' />
                                    </div>
                                    <div className='flex gap-3 pt-2'>
                                        <Button onClick={handleSave} disabled={saving} className='bg-indigo-600 hover:bg-indigo-500'>
                                            {saving ? <Loader2 className='w-4 h-4 animate-spin' /> : <><Save className='w-4 h-4 mr-2' />Save Changes</>}
                                        </Button>
                                        <Button variant='outline' onClick={() => setEditing(false)} className='border-slate-600 text-slate-300'>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* Normal Product Info */
                                <div className='space-y-6'>
                                    <div>
                                        <div className='flex items-center gap-4 mb-2'>
                                            <span className='text-4xl font-bold text-white'>R$ {formatPrice(product.price)}</span>
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

                                    {product.description && (
                                        <div>
                                            <h3 className='text-lg font-semibold text-white mb-3'>Description</h3>
                                            <p className='text-slate-400'>{product.description}</p>
                                        </div>
                                    )}

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
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Admin: Key Management Section */}
            {isAdmin && !editing && (
                <section className='py-12 bg-slate-900/30'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className='text-2xl font-semibold text-white mb-6 flex items-center gap-2'>
                                <Key className='w-6 h-6 text-sky-400' />
                                Key Management
                            </h2>
                            <Card className='bg-slate-800/30 border-slate-700'>
                                <CardContent className='p-6'>
                                    <div className='grid md:grid-cols-2 gap-6'>
                                        <div>
                                            <h3 className='text-sm font-semibold text-white mb-3'>Add New Keys</h3>
                                            {keyError && (
                                                <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-3'>{keyError}</div>
                                            )}
                                            {keySuccess && (
                                                <div className='p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm mb-3 flex items-center gap-2'>
                                                    <CheckCircle2 className='w-4 h-4' />
                                                    {keySuccess}
                                                </div>
                                            )}
                                            <textarea
                                                value={keyBatch}
                                                onChange={(e) => setKeyBatch(e.target.value)}
                                                placeholder='XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY'
                                                className='w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-sm font-mono min-h-28 mb-3'
                                            />
                                            <Button
                                                onClick={handleAddKeys}
                                                disabled={addingKeys || !keyBatch.trim()}
                                                className='bg-indigo-600 hover:bg-indigo-500'
                                            >
                                                {addingKeys ? <Loader2 className='w-4 h-4 animate-spin' /> : <Plus className='w-4 h-4 mr-2' />}
                                                Add Keys
                                            </Button>
                                        </div>
                                        <div className='text-slate-400 text-sm space-y-3'>
                                            <h3 className='text-sm font-semibold text-white mb-3'>Instructions</h3>
                                            <p>Paste one key per line in the text area. Each line will be added as a separate key entry for this product.</p>
                                            <div className='p-3 bg-slate-800/50 rounded-lg'>
                                                <p className='text-xs text-slate-500 mb-2'>Example:</p>
                                                <code className='text-xs text-slate-300 font-mono block'>
                                                    ABCDE-FGHIJ-KLMNO<br />
                                                    PQRST-UVWXY-Z1234<br />
                                                    56789-ABCDE-FGHIJ
                                                </code>
                                            </div>
                                            <p className='text-xs text-slate-500'>Keys are automatically marked as AVAILABLE when added.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </section>
            )}

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
                                                    <span className='text-lg font-bold text-white'>R$ {formatPrice(item.price)}</span>
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
