'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, Search, Loader2, Shield, ShieldCheck,
  ShieldAlert, Trash2, Save, X, Mail, Calendar,
  ShoppingBag, CreditCard, ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/services/api'
import type { AdminUser } from '@/types/api'

const roleIcons: Record<string, typeof Shield> = {
  SUPERADMIN: ShieldAlert,
  ADMIN: ShieldCheck,
  USER: Shield,
}

const roleColors: Record<string, string> = {
  SUPERADMIN: 'text-red-400 bg-red-500/10 border-red-500/20',
  ADMIN: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  USER: 'text-neutral-400 bg-neutral-800 border-neutral-700',
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ name: string; email: string; role: 'USER' | 'ADMIN' | 'SUPERADMIN' }>({ name: '', email: '', role: 'USER' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await apiClient.admin.listUsers({ limit: 100 })
      setUsers(res.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const startEdit = (user: AdminUser) => {
    setEditing(user.id)
    setEditData({ name: user.name || '', email: user.email, role: user.role })
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      await apiClient.admin.updateUser(id, editData)
      setEditing(null)
      await fetchUsers()
    } catch { } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return
    setDeleting(id)
    try {
      await apiClient.admin.deleteUser(id)
      await fetchUsers()
    } catch { } finally { setDeleting(null) }
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }
  const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial='hidden' animate='show'>
      <motion.div variants={itemAnim} className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Users</h1>
          <p className='text-neutral-400 text-sm mt-1'>{users.length} total users</p>
        </div>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500' />
          <input
            type='text'
            placeholder='Search users...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-64 pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none'
          />
        </div>
      </motion.div>

      {loading ? (
        <div className='flex justify-center py-20'>
          <Loader2 className='w-10 h-10 text-amber-400 animate-spin' />
        </div>
      ) : filtered.length === 0 ? (
        <Card className='bg-neutral-900/50 border-neutral-800'>
          <CardContent className='p-12 text-center'>
            <Users className='w-12 h-12 text-neutral-600 mx-auto mb-4' />
            <p className='text-neutral-400'>No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {filtered.map((user) => {
            const RoleIcon = roleIcons[user.role] || Shield
            const roleStyle = roleColors[user.role] || roleColors.USER
            const isEditing = editing === user.id

            return (
              <motion.div
                key={user.id}
                variants={itemAnim}
                className='bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden'
              >
                <div className='p-5'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4 min-w-0'>
                      <div className={`w-10 h-10 rounded-full ${roleStyle} flex items-center justify-center flex-shrink-0 border`}>
                        <RoleIcon className='w-5 h-5' />
                      </div>
                      <div className='min-w-0'>
                        {isEditing ? (
                          <div className='flex flex-col gap-2'>
                            <input
                              value={editData.name}
                              onChange={(e) => setEditData(p => ({ ...p, name: e.target.value }))}
                              className='bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white'
                              placeholder='Name'
                            />
                            <input
                              value={editData.email}
                              onChange={(e) => setEditData(p => ({ ...p, email: e.target.value }))}
                              className='bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white'
                              placeholder='Email'
                            />
                            <select
                              value={editData.role}
                              onChange={(e) => setEditData(p => ({ ...p, role: e.target.value as 'USER' | 'ADMIN' | 'SUPERADMIN' }))}
                              className='bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white'
                            >
                              <option value='USER'>USER</option>
                              <option value='ADMIN'>ADMIN</option>
                              {currentUser?.role === 'SUPERADMIN' && (
                                <option value='SUPERADMIN'>SUPERADMIN</option>
                              )}
                            </select>
                          </div>
                        ) : (
                          <>
                            <Link href={`/admin/users/${user.id}`} className='text-sm font-medium text-white truncate hover:text-violet-400 transition-colors flex items-center gap-1'>
                              {user.name || 'No name'}
                              <ChevronRight className='w-3 h-3 text-neutral-600' />
                            </Link>
                            <div className='flex items-center gap-3 text-xs text-neutral-500 mt-1'>
                              <span className='flex items-center gap-1'><Mail className='w-3 h-3' />{user.email}</span>
                              <span className='flex items-center gap-1'><Calendar className='w-3 h-3' />{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${roleStyle}`}>
                        {user.role}
                      </span>

                      {user._count && (
                        <div className='hidden sm:flex items-center gap-3 text-xs text-neutral-500'>
                          <span className='flex items-center gap-1'><ShoppingBag className='w-3 h-3' />{user._count.orders}</span>
                          <span className='flex items-center gap-1'><CreditCard className='w-3 h-3' />{user._count.payments}</span>
                        </div>
                      )}

                      {isEditing ? (
                        <div className='flex gap-1'>
                          <Button size='sm' onClick={() => handleSave(user.id)} disabled={saving}
                            className='bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'>
                            <Save className='w-3.5 h-3.5' />
                          </Button>
                          <Button size='sm' variant='outline' onClick={() => setEditing(null)}
                            className='border-neutral-700 text-neutral-400'>
                            <X className='w-3.5 h-3.5' />
                          </Button>
                        </div>
                      ) : (
                        <div className='flex gap-1'>
                          <Button size='sm' variant='outline' onClick={() => startEdit(user)}
                            className='border-neutral-700 text-neutral-400 hover:text-white'>
                            Edit
                          </Button>
                          {currentUser?.role === 'SUPERADMIN' || user.role !== 'SUPERADMIN' ? (
                          <Button size='sm' variant='outline' onClick={() => handleDelete(user.id)} disabled={deleting === user.id}
                            className='border-neutral-700 text-neutral-400 hover:text-red-400'>
                            {deleting === user.id ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <Trash2 className='w-3.5 h-3.5' />}
                          </Button>
                          ) : null}
                        </div>
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
