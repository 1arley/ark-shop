'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Store, Search, Loader2, Plus, Trash2, Save, X,
  Edit3, User, FileText, Percent
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedForm } from '@/components/ui/animated-form'
import { apiClient } from '@/services/api'
import type { Seller, CreateSellerPayload } from '@/types/api'

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<CreateSellerPayload>({ userId: '', companyName: '', document: '', commission: 10, isActive: true })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSellers = async () => {
    try {
      setLoading(true)
      const res = await apiClient.sellers.list({ limit: 100 })
      setSellers(res.data?.data || [])
    } catch { } finally { setLoading(false) }
  }

  const fetchUsers = async () => {
    try {
      const res = await apiClient.admin.listUsers({ limit: 100 })
      setUsers(res.data?.data || [])
    } catch { }
  }

  useEffect(() => {
    fetchSellers()
    fetchUsers()
  }, [])

  const resetForm = () => {
    setForm({ userId: '', companyName: '', document: '', commission: 10, isActive: true })
    setEditing(null)
    setShowForm(false)
    setError(null)
  }

  const startEdit = (seller: Seller) => {
    setForm({
      userId: seller.userId,
      companyName: seller.companyName,
      document: seller.document,
      commission: seller.commission,
      isActive: seller.isActive,
    })
    setEditing(seller.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.companyName.trim() || !form.document.trim() || !form.userId) {
      setError('Company name, document, and user are required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await apiClient.sellers.update(editing, form)
      } else {
        await apiClient.sellers.create(form)
      }
      resetForm()
      await fetchSellers()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Unknown error') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this seller profile?')) return
    setDeleting(id)
    try {
      await apiClient.sellers.delete(id)
      await fetchSellers()
    } catch { } finally { setDeleting(null) }
  }

  const filtered = sellers.filter(s =>
    s.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    s.document?.includes(search) ||
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(search.toLowerCase())
  )

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }
  const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial='hidden' animate='show'>
      <motion.div variants={itemAnim} className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Sellers</h1>
          <p className='text-neutral-400 text-sm mt-1'>{sellers.length} sellers</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className='bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
        >
          <Plus className='w-4 h-4 mr-2' />
          {showForm ? 'Cancel' : 'Add Seller'}
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemAnim} className='relative max-w-md mb-6'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
        <input
          type='text' placeholder='Search sellers...' value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none'
        />
      </motion.div>

      {/* Form */}
      <AnimatedForm visible={showForm}>
        <div className='p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl mb-6'>
          <h3 className='text-sm font-semibold text-white mb-4'>
            {editing ? 'Edit Seller' : 'New Seller'}
          </h3>
          <div className='grid sm:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>User *</label>
              <select value={form.userId} onChange={(e) => setForm(p => ({ ...p, userId: e.target.value }))}
                className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white'>
                <option value=''>Select user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.email} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Company Name *</label>
              <input value={form.companyName} onChange={(e) => setForm(p => ({ ...p, companyName: e.target.value }))}
                placeholder='Company name'
                className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none' />
            </div>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Document (CPF/CNPJ) *</label>
              <input value={form.document} onChange={(e) => setForm(p => ({ ...p, document: e.target.value }))}
                placeholder='CPF or CNPJ'
                className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none' />
            </div>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Commission (%)</label>
              <input type='number' value={form.commission || 10}
                onChange={(e) => setForm(p => ({ ...p, commission: Number(e.target.value) }))}
                min={0} max={100}
                className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none' />
            </div>
          </div>
          <label className='flex items-center gap-2 text-sm text-neutral-400 mb-4'>
            <input type='checkbox' checked={form.isActive ?? true}
              onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))}
              className='rounded bg-neutral-800 border-neutral-700' />
            Active
          </label>
          {error && <p className='text-red-400 text-sm mb-3'>{error}</p>}
          <div className='flex gap-2'>
            <Button onClick={handleSave} disabled={saving}
              className='bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'>
              {saving ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <Save className='w-4 h-4 mr-2' />}
              {editing ? 'Update' : 'Create'}
            </Button>
            <Button variant='outline' onClick={resetForm} className='border-neutral-700 text-neutral-400'>
              <X className='w-4 h-4 mr-2' /> Cancel
            </Button>
          </div>
        </div>
      </AnimatedForm>

      {loading ? (
        <div className='flex justify-center py-20'><Loader2 className='w-10 h-10 text-amber-400 animate-spin' /></div>
      ) : filtered.length === 0 ? (
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-12 text-center'>
            <Store className='w-12 h-12 text-neutral-600 mx-auto mb-4' />
            <p className='text-neutral-400'>No sellers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {filtered.map((seller) => (
            <motion.div
              key={seller.id}
              variants={itemAnim}
              className='bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden'
            >
              <div className='p-5'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4 min-w-0'>
                    <div className='w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/20'>
                      <Store className='w-5 h-5 text-amber-400' />
                    </div>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-white'>{seller.companyName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${seller.isActive
                          ? 'border-emerald-500 text-emerald-400'
                          : 'border-neutral-700 text-neutral-500'
                          }`}>
                          {seller.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className='flex items-center gap-3 text-xs text-neutral-500 mt-1'>
                        <span className='flex items-center gap-1'><FileText className='w-3 h-3' />{seller.document}</span>
                        <span className='flex items-center gap-1'><Percent className='w-3 h-3' />{seller.commission}%</span>
                        {seller.user && (
                          <span className='flex items-center gap-1'>
                            <User className='w-3 h-3' />
                            {seller.user.name || seller.user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='flex gap-1'>
                    <Button size='sm' variant='outline' onClick={() => startEdit(seller)}
                      className='border-neutral-700 text-neutral-400 hover:text-white'>
                      <Edit3 className='w-3.5 h-3.5' />
                    </Button>
                    <Button size='sm' variant='outline' onClick={() => handleDelete(seller.id)} disabled={deleting === seller.id}
                      className='border-neutral-700 text-neutral-400 hover:text-red-400'>
                      {deleting === seller.id ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <Trash2 className='w-3.5 h-3.5' />}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

