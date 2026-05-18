'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Store,
  User,
  Edit2,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Calendar,
  FileText,
  Percent,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { apiClient } from '@/services/api'
import type { Seller } from '@/types/api'

function SellerDetailContent() {
  const router = useRouter()
  const params = useParams()
  const sellerId = params.id as string

  const [seller, setSeller] = useState<Seller | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ companyName: '', document: '', commission: 0, isActive: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const res = await apiClient.sellers.getById(sellerId)
        setSeller(res.data)
        setEditForm({
          companyName: res.data.companyName,
          document: res.data.document,
          commission: res.data.commission,
          isActive: res.data.isActive,
        })
      } catch {
        setError('Failed to load seller')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [sellerId])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await apiClient.sellers.update(sellerId, editForm)
      setSeller(res.data)
      setSuccess('Seller updated successfully!')
      setEditing(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update seller')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiClient.sellers.delete(sellerId)
      router.push('/admin/sellers')
    } catch {
      setError('Failed to delete seller')
      setShowDeleteDialog(false)
    }
    setDeleting(false)
  }

  if (isLoading) {
    return (
      <div className='flex justify-center py-16'>
        <Loader2 className='w-8 h-8 text-violet-400 animate-spin' />
      </div>
    )
  }

  if (!seller) {
    return (
      <EmptyState
        icon='alert'
        title='Seller not found'
        description='The seller you are looking for does not exist.'
        actionLabel='Back to Sellers'
        actionHref='/admin/sellers'
      />
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' onClick={() => router.back()} className='text-neutral-400 hover:text-white'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back
          </Button>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center'>
              <Store className='w-6 h-6 text-pink-400' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-white'>{seller.companyName}</h2>
              <p className='text-sm text-neutral-400'>
                {seller.user?.name || 'No user assigned'}
              </p>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {!editing ? (
            <Button variant='outline' size='sm' onClick={() => setEditing(true)} className='border-neutral-700 text-neutral-300'>
              <Edit2 className='w-4 h-4 mr-2' />
              Edit
            </Button>
          ) : (
            <Button size='sm' onClick={handleSave} disabled={saving} className='bg-violet-600 hover:bg-violet-500'>
              {saving ? <Loader2 className='w-4 h-4 animate-spin mr-2' /> : <Save className='w-4 h-4 mr-2' />}
              Save
            </Button>
          )}
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowDeleteDialog(true)}
            className='border-red-500/30 text-red-400 hover:bg-red-500/10'
          >
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {error && (
        <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2'>
          <AlertCircle className='w-4 h-4' />{error}
        </div>
      )}
      {success && (
        <div className='p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2'>
          <CheckCircle2 className='w-4 h-4' />{success}
        </div>
      )}

      {/* Seller Info */}
      <div className='grid sm:grid-cols-2 gap-4'>
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-5'>
            <h3 className='text-sm font-semibold text-white mb-4'>Seller Details</h3>
            {editing ? (
              <div className='space-y-3'>
                <div>
                  <label className='text-xs text-neutral-500 mb-1 block'>Company Name</label>
                  <input
                    type='text'
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                    className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm'
                  />
                </div>
                <div>
                  <label className='text-xs text-neutral-500 mb-1 block'>Document (CPF/CNPJ)</label>
                  <input
                    type='text'
                    value={editForm.document}
                    onChange={(e) => setEditForm({ ...editForm, document: e.target.value })}
                    className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm'
                  />
                </div>
                <div>
                  <label className='text-xs text-neutral-500 mb-1 block'>Commission (%)</label>
                  <input
                    type='number'
                    step='0.1'
                    min='0'
                    max='100'
                    value={editForm.commission}
                    onChange={(e) => setEditForm({ ...editForm, commission: parseFloat(e.target.value) || 0 })}
                    className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm'
                  />
                </div>
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='isActive'
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className='rounded bg-neutral-800 border-neutral-700'
                  />
                  <label htmlFor='isActive' className='text-sm text-white'>Active</label>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <Store className='w-4 h-4 text-neutral-500' />
                  <div>
                    <span className='text-xs text-neutral-500'>Company</span>
                    <p className='text-sm text-white'>{seller.companyName}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <FileText className='w-4 h-4 text-neutral-500' />
                  <div>
                    <span className='text-xs text-neutral-500'>Document</span>
                    <p className='text-sm text-white font-mono'>{seller.document}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Percent className='w-4 h-4 text-neutral-500' />
                  <div>
                    <span className='text-xs text-neutral-500'>Commission</span>
                    <p className='text-sm text-white'>{seller.commission}%</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Tag className='w-4 h-4 text-neutral-500' />
                  <div>
                    <span className='text-xs text-neutral-500'>Status</span>
                    <p className='text-sm'>
                      <Badge className={seller.isActive ? 'bg-emerald-600/20 text-emerald-400 border-0' : 'bg-red-600/20 text-red-400 border-0'}>
                        {seller.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Calendar className='w-4 h-4 text-neutral-500' />
                  <div>
                    <span className='text-xs text-neutral-500'>Created</span>
                    <p className='text-sm text-white'>{new Date(seller.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-5'>
            <h3 className='text-sm font-semibold text-white mb-4'>Assigned User</h3>
            {seller.user ? (
              <div className='space-y-3'>
                <Link href={`/admin/users/${seller.user.id}`}>
                  <div className='flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors'>
                    <User className='w-5 h-5 text-neutral-500' />
                    <div>
                      <p className='text-sm text-white'>{seller.user.name}</p>
                      <p className='text-xs text-neutral-500'>{seller.user.email}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <p className='text-sm text-neutral-500'>No user assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title='Delete Seller'
        description={`Are you sure you want to delete ${seller.companyName}? This action cannot be undone.`}
        confirmLabel='Delete Seller'
        cancelLabel='Cancel'
        variant='danger'
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        loading={deleting}
      />
    </div>
  )
}

export default function SellerDetailPage() {
  return (
    <Suspense fallback={
      <div className='flex justify-center py-16'>
        <Loader2 className='w-8 h-8 text-violet-400 animate-spin' />
      </div>
    }>
      <SellerDetailContent />
    </Suspense>
  )
}
