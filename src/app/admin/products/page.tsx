'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Search, Loader2, Plus, Trash2, Save, X,
  Edit3, Eye, EyeOff, Filter, Tag,
  DollarSign, Layers, ImageIcon, Upload, FileUp
} from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/services/api'
import { formatPrice, extractApiError } from '@/lib/utils'
import type { Product, Category } from '@/types/api'
import { ImportCsvModal } from '@/components/admin/products/ImportCsvModal'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }
const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', description: '', price: 0, stock: 0,
    categoryId: '', imageUrl: '', isActive: true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showImportCsv, setShowImportCsv] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: Record<string, string | number> = { limit: 100 }
      if (search) params.search = search
      const res = await apiClient.admin.listProducts(params)
      setProducts(res.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  const fetchCategories = async () => {
    try {
      const res = await apiClient.categories.list()
      setCategories(res.data)
    } catch { }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const filtered = products.filter(p => {
    if (categoryFilter && p.categoryId !== categoryFilter) return false
    if (activeFilter === 'active' && !p.isActive) return false
    if (activeFilter === 'inactive' && p.isActive) return false
    return true
  })

  const resetForm = () => {
    setForm({ name: '', description: '', price: 0, stock: 0, categoryId: '', imageUrl: '', isActive: true })
    setEditingId(null)
    setShowForm(false)
    setError(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed'); return }
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return }

    setUploading(true)
    setError(null)
    try {
      const res = await apiClient.upload.single(file, 'products')
      setForm(p => ({ ...p, imageUrl: res.data.url }))
    } catch { setError('Upload failed') }
    setUploading(false)
  }

  const startEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      stock: product.stock,
      categoryId: product.categoryId || '',
      imageUrl: product.imageUrl || '',
      isActive: product.isActive,
    })
    setEditingId(product.id)
    setShowForm(true)
    setError(null)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Product name is required'); return }
    if (!form.price || form.price <= 0 || isNaN(form.price)) { setError('Price must be greater than 0'); return }
    if (form.stock !== undefined && (form.stock < 0 || isNaN(form.stock))) { setError('Stock cannot be negative'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        price: form.price,
        stock: form.stock,
        categoryId: form.categoryId || undefined,
        imageUrl: form.imageUrl || undefined,
        isActive: form.isActive,
      }

      if (editingId) {
        await apiClient.admin.updateProduct(editingId, payload)
      } else {
        await apiClient.admin.createProduct(payload)
      }
      resetForm()
      await fetchProducts()
    } catch (e: unknown) { setError(extractApiError(e, 'Failed to save product')) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently? This will fail if it has associated orders.')) return
    setDeleting(id)
    try {
      await apiClient.admin.deleteProduct(id)
      await fetchProducts()
    } catch (e: unknown) {
      setError(extractApiError(e, 'Failed to delete product'))
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (product: Product) => {
    try {
      await apiClient.admin.updateProduct(product.id, { isActive: !product.isActive })
      await fetchProducts()
    } catch { }
  }

  const handleImportSuccess = () => {
    fetchProducts()
  }

  const getCategoryName = (id: string | null) => categories.find(c => c.id === id)?.name || 'Uncategorized'

  return (
    <motion.div variants={container} initial='hidden' animate='show'>
      {/* Header */}
      <motion.div variants={itemAnim} className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Products</h1>
          <p className='text-neutral-400 text-sm mt-1'>{products.length} products</p>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={() => setShowImportCsv(true)}
            className='bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30'
          >
            <FileUp className='w-4 h-4 mr-2' />
            Import CSV
          </Button>
          <Button
            onClick={() => { resetForm(); setShowForm(!showForm) }}
            className='bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
          >
            <Plus className='w-4 h-4 mr-2' />
            {showForm ? 'Cancel' : 'Add Product'}
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemAnim} className='flex items-center gap-4 mb-6'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
          <input
            type='text' placeholder='Search products...' value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Filter className='w-4 h-4 text-neutral-500' />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className='bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white'
          >
            <option value=''>All Categories</option>
            {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}
            className='bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white'
          >
            <option value=''>All Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
          </select>
        </div>
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='overflow-hidden mb-6'
          >
            <div className='p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl'>
              <h3 className='text-sm font-semibold text-white mb-4'>
                {editingId ? 'Edit Product' : 'New Product'}
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
                <div>
                  <label className='block text-xs text-neutral-500 mb-1'>Name *</label>
                  <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder='Product name'
                    className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none' />
                </div>
                <div>
                  <label className='block text-xs text-neutral-500 mb-1'>Price *</label>
                  <input type='number' min={0} step={0.01} value={form.price}
                    onChange={(e) => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                    className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none' />
                </div>
                <div>
                  <label className='block text-xs text-neutral-500 mb-1'>Stock</label>
                  <input type='number' min={0} value={form.stock}
                    onChange={(e) => setForm(p => ({ ...p, stock: Number(e.target.value) }))}
                    className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none' />
                </div>
                <div>
                  <label className='block text-xs text-neutral-500 mb-1'>Category</label>
                  <select value={form.categoryId} onChange={(e) => setForm(p => ({ ...p, categoryId: e.target.value }))}
                    className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white'
                  >
                    <option value=''>Uncategorized</option>
                    {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className='block text-xs text-neutral-500 mb-1'>Image</label>
                  <div className='flex items-center gap-3'>
                    {form.imageUrl && (
                      <div className='relative w-12 h-12 rounded-lg bg-neutral-800 border border-neutral-700 overflow-hidden flex-shrink-0'>
                        <Image src={form.imageUrl} alt='' fill className='object-cover' unoptimized />
                      </div>
                    )}
                    <div className='flex-1 flex gap-2'>
                      <input value={form.imageUrl} onChange={(e) => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                        placeholder='Paste URL or upload...'
                        className='flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none' />
                      <label className='flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer text-sm whitespace-nowrap transition-colors'>
                        {uploading ? <Loader2 className='w-4 h-4 animate-spin' /> : <Upload className='w-4 h-4' />}
                        <span className='hidden sm:inline'>Upload</span>
                        <input type='file' accept='image/jpeg,image/png,image/webp,image/gif' onChange={handleImageUpload} className='hidden' />
                      </label>
                    </div>
                  </div>
                </div>
                <div className='flex items-end pb-2'>
                  <label className='flex items-center gap-2 text-sm text-neutral-400 cursor-pointer'>
                    <input type='checkbox' checked={form.isActive}
                      onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))}
                      className='rounded bg-neutral-800 border-neutral-700' />
                    Active
                  </label>
                </div>
              </div>

              <div className='mb-4'>
                <label className='block text-xs text-neutral-500 mb-1'>Description</label>
                <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder='Product description...'
                  className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none' />
              </div>

              {error && <p className='text-red-400 text-sm mb-3'>{error}</p>}

              <div className='flex gap-2'>
                <Button onClick={handleSave} disabled={saving}
                  className='bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                >
                  {saving ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <Save className='w-4 h-4 mr-2' />}
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button variant='outline' onClick={resetForm} className='border-neutral-700 text-neutral-400'>
                  <X className='w-4 h-4 mr-2' /> Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product List */}
      {loading && products.length === 0 ? (
        <div className='flex justify-center py-20'><Loader2 className='w-10 h-10 text-amber-400 animate-spin' /></div>
      ) : filtered.length === 0 ? (
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-12 text-center'>
            <Package className='w-12 h-12 text-neutral-600 mx-auto mb-4' />
            <p className='text-neutral-400'>No products found</p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {filtered.map((product) => {
            const isExpanded = expandedId === product.id

            return (
              <motion.div
                key={product.id}
                variants={itemAnim}
                className={`bg-neutral-900/50 border rounded-xl overflow-hidden transition-all duration-200 ${
                  !product.isActive ? 'border-neutral-800/50 opacity-60' : 'border-neutral-800'
                }`}
              >
                <div className='p-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-4 min-w-0 flex-1'>
                      <div className='relative w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-neutral-700'>
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt='' fill className='object-cover' unoptimized />
                        ) : (
                          <ImageIcon className='w-5 h-5 text-neutral-500' />
                        )}
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium text-white truncate'>{product.name}</span>
                          {!product.isActive && (
                            <span className='text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20'>Inactive</span>
                          )}
                        </div>
                        <div className='flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap'>
                          <span className='flex items-center gap-1'>
                            <Tag className='w-3 h-3' />{getCategoryName(product.categoryId)}
                          </span>
                          <span className='flex items-center gap-1'>
                            <DollarSign className='w-3 h-3' />R$ {formatPrice(product.price)}
                          </span>
                          <span className='flex items-center gap-1'>
                            <Layers className='w-3 h-3' />Stock: {product.stock}
                          </span>
                          <span className='text-neutral-600'>
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-1 flex-shrink-0'>
                      <Button size='sm' variant='outline'
                        onClick={() => toggleActive(product)}
                        className='border-neutral-700 text-neutral-400 hover:text-amber-400'
                        title={product.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {product.isActive ? <EyeOff className='w-3.5 h-3.5' /> : <Eye className='w-3.5 h-3.5' />}
                      </Button>
                      <Button size='sm' variant='outline'
                        onClick={() => startEdit(product)}
                        className='border-neutral-700 text-neutral-400 hover:text-white'
                      >
                        <Edit3 className='w-3.5 h-3.5' />
                      </Button>
                      <Button size='sm' variant='outline'
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className='border-neutral-700 text-neutral-400 hover:text-red-400'
                      >
                        {deleting === product.id
                          ? <Loader2 className='w-3.5 h-3.5 animate-spin' />
                          : <Trash2 className='w-3.5 h-3.5' />
                        }
                      </Button>
                    </div>
                  </div>

                  {product.description && (
                    <div className='mt-3'>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : product.id)}
                        className='text-xs text-neutral-600 hover:text-neutral-400 transition-colors'
                      >
                        {isExpanded ? 'Hide description' : 'Show description'}
                      </button>
                      {isExpanded && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className='text-xs text-neutral-500 mt-1 leading-relaxed'
                        >
                          {product.description}
                        </motion.p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}

          {/* Import CSV Modal */}
          <ImportCsvModal
            isOpen={showImportCsv}
            onClose={() => setShowImportCsv(false)}
            onSuccess={handleImportSuccess}
          />
        </div>
      )}
    </motion.div>
  )
}
