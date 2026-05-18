'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Tag,
  Search,
  Loader2,
  Plus,
  Trash2,
  Save,
  X,
  Edit3,
  Calendar,
  Percent,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Hash,
  Infinity as InfinityIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedForm } from '@/components/ui/animated-form'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { apiClient } from '@/services/api'
import { extractApiError } from '@/lib/utils'
import type { Coupon, CreateCouponPayload, PaginatedResponseMeta } from '@/types/api'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No expiry'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<CreateCouponPayload>({
    code: '',
    type: 'PERCENTAGE',
    value: 10,
    minPurchase: 0,
    maxUses: undefined,
    validFrom: '',
    validTo: '',
    isActive: true,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchCoupons = async (page = 1) => {
    try {
      setLoading(true)
      const res = await apiClient.coupons.list({ page, limit: 20 })
      const data = res.data
      setCoupons(data.data || [])
      setTotal(data.meta?.total || 0)
      setTotalPages(data.meta?.totalPages || 1)
      setCurrentPage(data.meta?.page || 1)
    } catch {
      // keep empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCoupons() }, [])

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setForm({
      code: '',
      type: 'PERCENTAGE',
      value: 10,
      minPurchase: 0,
      maxUses: undefined,
      validFrom: '',
      validTo: '',
      isActive: true,
    })
    setEditing(null)
    setShowForm(false)
    setError(null)
  }

  const startEdit = (coupon: Coupon) => {
    setEditing(coupon.id)
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase || 0,
      maxUses: coupon.maxUses || undefined,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validTo: coupon.validTo ? new Date(coupon.validTo).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
    })
    setShowForm(true)
    setError(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    if (!form.code.trim()) {
      setError('Coupon code is required')
      setSaving(false)
      return
    }
    if (form.value <= 0) {
      setError('Value must be greater than 0')
      setSaving(false)
      return
    }

    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        minPurchase: form.minPurchase || undefined,
        validFrom: form.validFrom || undefined,
        validTo: form.validTo || undefined,
      }

      if (editing) {
        await apiClient.coupons.update(editing, payload)
        setSuccess('Coupon updated successfully!')
      } else {
        await apiClient.coupons.create(payload)
        setSuccess('Coupon created successfully!')
      }

      setTimeout(() => {
        resetForm()
        fetchCoupons(currentPage)
      }, 800)
    } catch (err) {
      setError(extractApiError(err, 'Failed to save coupon'))
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(deleteTarget)
    try {
      await apiClient.coupons.delete(deleteTarget)
      setSuccess('Coupon deleted successfully!')
      fetchCoupons(currentPage)
    } catch (err) {
      setError(extractApiError(err, 'Failed to delete coupon'))
    }
    setDeleting(null)
    setShowDeleteDialog(false)
    setDeleteTarget(null)
    setTimeout(() => setSuccess(null), 3000)
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }
  const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial='hidden' animate='show'>
      {/* Header */}
      <motion.div variants={itemAnim} className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Coupons</h1>
          <p className='text-neutral-400 text-sm mt-1'>{total} total coupons</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className='bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
        >
          <Plus className='w-4 h-4 mr-2' />
          {showForm ? 'Cancel' : 'Add Coupon'}
        </Button>
      </motion.div>

      {/* Success/Error Messages */}
      {success && (
        <div className='mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2'>
          <CheckCircle2 className='w-4 h-4' />{success}
        </div>
      )}
      {error && (
        <div className='mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2'>
          <AlertCircle className='w-4 h-4' />{error}
        </div>
      )}

      {/* Search */}
      <motion.div variants={itemAnim} className='relative max-w-md mb-6'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
        <input
          type='text' placeholder='Search by code...' value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none'
        />
      </motion.div>

      {/* Form */}
      <AnimatedForm visible={showForm}>
        <div className='p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl mb-6'>
          <h3 className='text-sm font-semibold text-white mb-4'>
            {editing ? 'Edit Coupon' : 'New Coupon'}
          </h3>
          <div className='grid sm:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Code *</label>
              <div className='relative'>
                <Hash className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
                <input
                  value={form.code}
                  onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder='PROMO20'
                  className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none font-mono uppercase'
                />
              </div>
            </div>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm(p => ({ ...p, type: e.target.value as 'PERCENTAGE' | 'FIXED' }))}
                className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white'
              >
                <option value='PERCENTAGE'>Percentage (%)</option>
                <option value='FIXED'>Fixed Amount (R$)</option>
              </select>
            </div>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>
                Value * {form.type === 'PERCENTAGE' ? '(%)' : '(R$)'}
              </label>
              <div className='relative'>
                {form.type === 'PERCENTAGE' ? (
                  <Percent className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
                ) : (
                  <DollarSign className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
                )}
                <input
                  type='number'
                  step={form.type === 'FIXED' ? '0.01' : '1'}
                  min={form.type === 'PERCENTAGE' ? 1 : 0.01}
                  max={form.type === 'PERCENTAGE' ? 100 : undefined}
                  value={form.value}
                  onChange={(e) => setForm(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))}
                  className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none'
                />
              </div>
            </div>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Min Purchase (R$)</label>
              <div className='relative'>
                <DollarSign className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
                <input
                  type='number'
                  step='0.01'
                  min={0}
                  value={form.minPurchase || ''}
                  onChange={(e) => setForm(p => ({ ...p, minPurchase: parseFloat(e.target.value) || 0 }))}
                  placeholder='0 = no minimum'
                  className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none'
                />
              </div>
            </div>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Max Uses</label>
              <div className='relative'>
                <InfinityIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
                <input
                  type='number'
                  min={1}
                  value={form.maxUses || ''}
                  onChange={(e) => setForm(p => ({ ...p, maxUses: parseInt(e.target.value) || undefined }))}
                  placeholder='Unlimited'
                  className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none'
                />
              </div>
            </div>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Valid From</label>
              <div className='relative'>
                <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
                <input
                  type='date'
                  value={form.validFrom || ''}
                  onChange={(e) => setForm(p => ({ ...p, validFrom: e.target.value }))}
                  className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none'
                />
              </div>
            </div>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Valid To</label>
              <div className='relative'>
                <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
                <input
                  type='date'
                  value={form.validTo || ''}
                  onChange={(e) => setForm(p => ({ ...p, validTo: e.target.value }))}
                  className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none'
                />
              </div>
            </div>
          </div>
          <label className='flex items-center gap-2 text-sm text-neutral-400 mb-4'>
            <input
              type='checkbox'
              checked={form.isActive ?? true}
              onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))}
              className='rounded bg-neutral-800 border-neutral-700'
            />
            Active
          </label>
          <div className='flex gap-2'>
            <Button onClick={handleSave} disabled={saving}
              className='bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'>
              {saving ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <Save className='w-4 h-4 mr-2' />}
              {editing ? 'Update' : 'Create'}
            </Button>
            <Button variant='outline' onClick={resetForm} className='border-neutral-700 text-neutral-400'>
              <X className='w-4 h-4 mr-2' /> Cancel
            </Button>
          </div>
        </div>
      </AnimatedForm>

      {/* Coupons List */}
      {loading ? (
        <div className='flex justify-center py-20'><Loader2 className='w-10 h-10 text-emerald-400 animate-spin' /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon='tag'
          title='No coupons found'
          description={search ? 'No coupons match your search.' : 'Create your first coupon to start offering discounts.'}
          actionLabel={!search ? 'Add Coupon' : undefined}
          onAction={!search ? () => setShowForm(true) : undefined}
        />
      ) : (
        <>
          <div className='space-y-3'>
            {filtered.map((coupon) => {
              const isExpired = coupon.validTo ? new Date(coupon.validTo) < new Date() : false
              const usagePercent = coupon.maxUses ? Math.round((coupon.usedCount / coupon.maxUses) * 100) : 0

              return (
                <motion.div
                  key={coupon.id}
                  variants={itemAnim}
                  className='bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden'
                >
                  <div className='p-5'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4 min-w-0'>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                          coupon.isActive && !isExpired
                            ? 'bg-emerald-500/10 border-emerald-500/20'
                            : 'bg-neutral-800/50 border-neutral-700'
                        }`}>
                          <Tag className={`w-6 h-6 ${coupon.isActive && !isExpired ? 'text-emerald-400' : 'text-neutral-500'}`} />
                        </div>
                        <div className='min-w-0'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <span className='text-sm font-mono font-semibold text-white'>{coupon.code}</span>
                            <Badge variant='outline' className={`text-xs ${
                              coupon.type === 'PERCENTAGE'
                                ? 'border-violet-500/30 text-violet-400'
                                : 'border-emerald-500/30 text-emerald-400'
                            }`}>
                              {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                            </Badge>
                            {!coupon.isActive && (
                              <Badge variant='outline' className='text-xs border-neutral-600 text-neutral-500'>Inactive</Badge>
                            )}
                            {isExpired && (
                              <Badge variant='outline' className='text-xs border-red-500/30 text-red-400'>Expired</Badge>
                            )}
                          </div>
                          <div className='flex items-center gap-3 text-xs text-neutral-500 mt-1'>
                            {coupon.minPurchase && coupon.minPurchase > 0 && (
                              <span>Min: {formatCurrency(coupon.minPurchase)}</span>
                            )}
                            {coupon.maxUses ? (
                              <span className='flex items-center gap-1'>
                                Uses: {coupon.usedCount}/{coupon.maxUses} ({usagePercent}%)
                              </span>
                            ) : (
                              <span className='flex items-center gap-1'>
                                <InfinityIcon className='w-3 h-3' /> Unlimited uses
                              </span>
                            )}
                            {coupon.validTo && (
                              <span>Expires: {formatDate(coupon.validTo)}</span>
                            )}
                          </div>
                          {/* Usage bar */}
                          {coupon.maxUses && (
                            <div className='mt-2 w-32 h-1.5 bg-neutral-800 rounded-full overflow-hidden'>
                              <div
                                className={`h-full rounded-full transition-all ${
                                  usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='flex gap-1'>
                        <Button size='sm' variant='outline' onClick={() => startEdit(coupon)}
                          className='border-neutral-700 text-neutral-400 hover:text-white'>
                          <Edit3 className='w-3.5 h-3.5' />
                        </Button>
                        <Button size='sm' variant='outline' onClick={() => { setDeleteTarget(coupon.id); setShowDeleteDialog(true) }} disabled={deleting === coupon.id}
                          className='border-neutral-700 text-neutral-400 hover:text-red-400'>
                          {deleting === coupon.id ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <Trash2 className='w-3.5 h-3.5' />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='mt-8'>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => fetchCoupons(page)}
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        title='Delete Coupon'
        description={`Are you sure you want to delete this coupon? This action cannot be undone.`}
        confirmLabel='Delete Coupon'
        cancelLabel='Cancel'
        variant='danger'
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteDialog(false); setDeleteTarget(null) }}
        loading={deleting !== null}
      />
    </motion.div>
  )
}
