'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Tags, Plus, Loader2, Save, X, Trash2,
  Edit3, FolderTree, Hash
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/services/api'
import type { Category, CreateCategoryPayload } from '@/types/api'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<CreateCategoryPayload>({ name: '', description: '', parentId: undefined })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await apiClient.categories.list()
      setCategories(res.data)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchCategories() }, [])

  const resetForm = () => {
    setForm({ name: '', description: '', parentId: undefined })
    setEditing(null)
    setShowForm(false)
    setError(null)
  }

  const startEdit = (cat: Category) => {
    setForm({ name: cat.name, description: cat.description || '', parentId: cat.parentId || undefined })
    setEditing(cat.id)
    setShowForm(true)
    setError(null)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await apiClient.categoriesAdmin.update(editing, form)
      } else {
        await apiClient.categoriesAdmin.create(form)
      }
      resetForm()
      await fetchCategories()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Unknown error') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? It may fail if it has products or subcategories.')) return
    setDeleting(id)
    try {
      await apiClient.categoriesAdmin.delete(id)
      await fetchCategories()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Unknown error') } finally { setDeleting(null) }
  }

  const renderCategoryTree = (cats: Category[], parentId: string | null = null, depth = 0): Category[] => {
    return cats
      .filter(c => c.parentId === parentId)
      .flatMap(c => [c, ...renderCategoryTree(cats, c.id, depth + 1)])
  }

  const flatTree = renderCategoryTree(categories)

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }
  const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial='hidden' animate='show'>
      <motion.div variants={itemAnim} className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Categories</h1>
          <p className='text-neutral-400 text-sm mt-1'>{categories.length} categories</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className='bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
        >
          <Plus className='w-4 h-4 mr-2' />
          {showForm ? 'Cancel' : 'Add Category'}
        </Button>
      </motion.div>

      {/* Form */}
      <AnimatedForm visible={showForm}>
        <div className='p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl mb-6'>
          <h3 className='text-sm font-semibold text-white mb-4'>
            {editing ? 'Edit Category' : 'New Category'}
          </h3>
          <div className='grid sm:grid-cols-3 gap-4 mb-4'>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder='Category name'
                className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none'
              />
            </div>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Description</label>
              <input
                value={form.description || ''}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder='Brief description'
                className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none'
              />
            </div>
            <div>
              <label className='block text-xs text-neutral-500 mb-1'>Parent Category</label>
              <select
                value={form.parentId || ''}
                onChange={(e) => setForm(p => ({ ...p, parentId: e.target.value || undefined }))}
                className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none'
              >
                <option value=''>None (Top Level)</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
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
        <div className='flex justify-center py-20'>
          <Loader2 className='w-10 h-10 text-amber-400 animate-spin' />
        </div>
      ) : flatTree.length === 0 ? (
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-12 text-center'>
            <FolderTree className='w-12 h-12 text-neutral-600 mx-auto mb-4' />
            <p className='text-neutral-400'>No categories yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-2'>
          {flatTree.map((cat) => {
            const depth = (() => {
              let d = 0, current = cat
              while (current.parentId) {
                const parent = categories.find(c => c.id === current.parentId)
                if (!parent) break
                d++
                current = parent
              }
              return d
            })()

            return (
              <motion.div
                key={cat.id}
                variants={itemAnim}
                className='bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden'
                style={{ marginLeft: depth * 24 }}
              >
                <div className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3 min-w-0'>
                      <div className='w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0'>
                        <Tags className='w-4 h-4 text-amber-400' />
                      </div>
                      <div>
                        <div className='text-sm font-medium text-white'>{cat.name}</div>
                        <div className='text-xs text-neutral-500'>{cat.description || 'No description'}</div>
                      </div>
                      {cat._count && (
                        <span className='text-xs text-neutral-600 flex items-center gap-1'>
                          <Hash className='w-3 h-3' />{cat._count.products} products
                        </span>
                      )}
                    </div>
                    <div className='flex gap-1'>
                      <Button size='sm' variant='outline' onClick={() => startEdit(cat)}
                        className='border-neutral-700 text-neutral-400 hover:text-white'>
                        <Edit3 className='w-3.5 h-3.5' />
                      </Button>
                      <Button size='sm' variant='outline' onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id}
                        className='border-neutral-700 text-neutral-400 hover:text-red-400'>
                        {deleting === cat.id ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <Trash2 className='w-3.5 h-3.5' />}
                      </Button>
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

function AnimatedForm({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={visible ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
      className='overflow-hidden'
    >
      {children}
    </motion.div>
  )
}
