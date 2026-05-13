'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  KeyRound, Search, Loader2, Trash2, Save, X,
  Download, Upload, BarChart3, Edit3, Filter,
  Package
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedForm } from '@/components/ui/animated-form'
import { apiClient } from '@/services/api'
import type { GameKey, Product } from '@/types/api'

const statusColors: Record<string, string> = {
  AVAILABLE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  RESERVED: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  DELIVERED: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  ARCHIVED: 'text-neutral-500 bg-neutral-800 border-neutral-700',
}

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<GameKey[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState({ keyData: '', status: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [importProduct, setImportProduct] = useState('')
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)
  const [stats, setStats] = useState<Record<string, { total: number; available: number; reserved: number; delivered: number; archived: number }>>({})

  const fetchKeys = async () => {
    try {
      setLoading(true)
      const res = await apiClient.admin.listKeys({
        limit: 200,
        productId: selectedProduct || undefined,
      })
      setKeys(res.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  const fetchProducts = async () => {
    try {
      const res = await apiClient.products.list({ limit: 100 })
      const data = res.data
      setProducts(Array.isArray(data) ? data : (data.data || []))
    } catch { }
  }

  useEffect(() => {
    fetchProducts()
    fetchKeys()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchKeys() }, [selectedProduct]) // eslint-disable-line react-hooks/exhaustive-deps

  // Flag para evitar race condition: quando keys/selectedProduct mudar,
  // resultados de requisições anteriores são ignorados
  const statsVersionRef = useRef(0)

  const fetchStats = async (productId: string, version: number) => {
    try {
      const res = await apiClient.keysAdmin.getKeyStats(productId)
      // Ignora resposta se uma nova rodada de fetch já começou
      if (version !== statsVersionRef.current) return
      setStats(p => ({ ...p, [productId]: res.data }))
    } catch {
      // Erros são esperados ao trocar de produto rapidamente
    }
  }

  useEffect(() => {
    const version = ++statsVersionRef.current
    const productIds = [...new Set(keys.map(k => k.productId))]
    productIds.forEach(id => fetchStats(id, version))
  }, [keys, selectedProduct])

  const filtered = keys.filter(k =>
    k.keyData?.toLowerCase().includes(search.toLowerCase()) ||
    k.id?.toLowerCase().includes(search.toLowerCase())
  )

  const startEdit = (key: GameKey) => {
    setEditing(key.id)
    setEditData({ keyData: key.keyData, status: key.status })
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      await apiClient.keysAdmin.updateKey(id, editData)
      setEditing(null)
      await fetchKeys()
    } catch { } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this key permanently?')) return
    setDeleting(id)
    try {
      await apiClient.keysAdmin.deleteKey(id)
      await fetchKeys()
    } catch { } finally { setDeleting(null) }
  }

  const handleBulkImport = async () => {
    if (!importProduct || !importText.trim()) return
    setImporting(true)
    try {
      await apiClient.admin.bulkImportKeys(importProduct, importText)
      setShowBulkImport(false)
      setImportText('')
      setImportProduct('')
      await fetchKeys()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Import failed') } finally { setImporting(false) }
  }

  const exportKeys = () => {
    const csv = keys.map(k => `${k.keyData},${k.status},${k.product?.name || ''}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `keys-export-${Date.now()}.csv`
    a.click()
    // Aguarda o navegador iniciar o download antes de liberar a URL do blob
    // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
    requestAnimationFrame(() => URL.revokeObjectURL(url))
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } }
  const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  if (loading && keys.length === 0) {
    return <div className='flex justify-center py-20'><Loader2 className='w-10 h-10 text-amber-400 animate-spin' /></div>
  }

  return (
    <motion.div variants={container} initial='hidden' animate='show'>
      {/* Header */}
      <motion.div variants={itemAnim} className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Key Inventory</h1>
          <p className='text-neutral-400 text-sm mt-1'>{keys.length} keys loaded</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => setShowBulkImport(!showBulkImport)}
            className='bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'>
            <Upload className='w-4 h-4 mr-2' />Bulk Import
          </Button>
          <Button variant='outline' onClick={exportKeys}
            className='border-neutral-700 text-neutral-400'>
            <Download className='w-4 h-4 mr-2' />Export
          </Button>
        </div>
      </motion.div>

      {/* Bulk Import Form */}
      <AnimatedForm visible={showBulkImport}>
        <div className='p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl mb-6'>
          <h3 className='text-sm font-semibold text-white mb-4'>Bulk Import Keys</h3>
          <div className='grid sm:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Product</label>
              <select
                value={importProduct}
                onChange={(e) => setImportProduct(e.target.value)}
                className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white'
              >
                <option value=''>Select a product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className='mb-4'>
            <label className='block text-xs text-neutral-500 mb-1'>
              Keys (one per line, or comma-separated)
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={8}
              placeholder={`XXXX-XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY-YYYY`}
              className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 font-mono focus:border-amber-500/50 focus:outline-none'
            />
          </div>
          <div className='flex gap-2'>
            <Button onClick={handleBulkImport} disabled={importing || !importProduct || !importText.trim()}
              className='bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'>
              {importing ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <Upload className='w-4 h-4 mr-2' />}
              Import Keys
            </Button>
            <Button variant='outline' onClick={() => setShowBulkImport(false)} className='border-neutral-700 text-neutral-400'>
              <X className='w-4 h-4 mr-2' />Cancel
            </Button>
          </div>
        </div>
      </AnimatedForm>

      {/* Filters */}
      <motion.div variants={itemAnim} className='flex items-center gap-4 mb-6'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
          <input
            type='text' placeholder='Search keys...' value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Filter className='w-4 h-4 text-neutral-500' />
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className='bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none'
          >
            <option value=''>All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Stats badges for selected product */}
      {selectedProduct && stats[selectedProduct] && (
        <motion.div variants={itemAnim} className='flex items-center gap-3 mb-4'>
          <BarChart3 className='w-4 h-4 text-amber-400' />
          {(['total', 'available', 'reserved', 'delivered', 'archived'] as const).map(key => (
            <span key={key} className={`text-xs px-2 py-1 rounded-full border ${statusColors[key === 'total' ? 'AVAILABLE' : key.toUpperCase()] || 'border-neutral-700 text-neutral-400'}`}>
              {key}: {stats[selectedProduct][key] ?? 0}
            </span>
          ))}
        </motion.div>
      )}

      {/* Keys List */}
      {filtered.length === 0 ? (
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-12 text-center'>
            <KeyRound className='w-12 h-12 text-neutral-600 mx-auto mb-4' />
            <p className='text-neutral-400'>No keys found</p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-2'>
          {filtered.map((key, i) => {
            const isEditing = editing === key.id
            const statusStyle = statusColors[key.status] || statusColors.AVAILABLE

            return (
              <motion.div
                key={key.id}
                variants={itemAnim}
                className='bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden'
              >
                <div className='p-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-4 min-w-0 flex-1'>
                      <span className='text-xs text-neutral-600 font-mono w-20 flex-shrink-0'>#{i + 1}</span>
                      {isEditing ? (
                        <div className='flex gap-2 flex-1'>
                          <input
                            value={editData.keyData}
                            onChange={(e) => setEditData(p => ({ ...p, keyData: e.target.value }))}
                            className='flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm font-mono text-white'
                          />
                          <select
                            value={editData.status}
                            onChange={(e) => setEditData(p => ({ ...p, status: e.target.value }))}
                            className='bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white'
                          >
                            <option value='AVAILABLE'>AVAILABLE</option>
                            <option value='RESERVED'>RESERVED</option>
                            <option value='DELIVERED'>DELIVERED</option>
                            <option value='ARCHIVED'>ARCHIVED</option>
                          </select>
                        </div>
                      ) : (
                        <>
                          <span className='font-mono text-sm text-white truncate'>{key.keyData}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle}`}>
                            {key.status}
                          </span>
                          {key.product && (
                            <span className='text-xs text-neutral-500 hidden md:flex items-center gap-1'>
                              <Package className='w-3 h-3' />{key.product.name}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className='flex gap-1 flex-shrink-0'>
                      {isEditing ? (
                        <>
                          <Button size='sm' onClick={() => handleSave(key.id)} disabled={saving}
                            className='bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'>
                            <Save className='w-3.5 h-3.5' />
                          </Button>
                          <Button size='sm' variant='outline' onClick={() => setEditing(null)}
                            className='border-neutral-700 text-neutral-400'>
                            <X className='w-3.5 h-3.5' />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size='sm' variant='outline' onClick={() => startEdit(key)}
                            className='border-neutral-700 text-neutral-400 hover:text-white'>
                            <Edit3 className='w-3.5 h-3.5' />
                          </Button>
                          <Button size='sm' variant='outline' onClick={() => handleDelete(key.id)} disabled={deleting === key.id}
                            className='border-neutral-700 text-neutral-400 hover:text-red-400'>
                            {deleting === key.id ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <Trash2 className='w-3.5 h-3.5' />}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

