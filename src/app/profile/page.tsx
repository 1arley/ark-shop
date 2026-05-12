'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, User, Mail, Camera, Save, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/services/api'
import { extractApiError } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email)
      setAvatarUrl(user && 'avatarUrl' in (user as unknown as Record<string, unknown>) ? (user as unknown as Record<string, unknown>).avatarUrl as string : '')
    }
  }, [user])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }

    setUploading(true)
    setError(null)
    try {
      const res = await apiClient.upload.single(file, 'avatars')
      setAvatarUrl(res.data.url)
    } catch (err) {
      setError(extractApiError(err, 'Failed to upload avatar'))
    }
    setUploading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim()) { setError('Name is required'); return }
    if (!email.trim()) { setError('Email is required'); return }

    setSaving(true)
    try {
      const updatedUser = await apiClient.user.updateMe({ name, email, avatarUrl: avatarUrl || undefined })
      useAuthStore.getState().setUser(updatedUser.data)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(extractApiError(err, 'Failed to update profile'))
    }
    setSaving(false)
  }

  if (authLoading) {
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

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
  const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

      <section className='relative pt-28 pb-16 bg-neutral-900'>
        <div className='absolute inset-0'><div className='absolute top-20 left-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl' /></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => router.push('/dashboard')} className='flex items-center gap-1 text-sm text-neutral-400 hover:text-white mb-4 transition-colors'>
              <ArrowLeft className='w-4 h-4' /> Back to Dashboard
            </button>
            <h1 className='text-4xl md:text-5xl font-semibold text-white'>Profile</h1>
            <p className='text-neutral-400 text-lg mt-1'>Manage your account information</p>
          </motion.div>
        </div>
      </section>

      <section className='py-12'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div variants={container} initial='hidden' animate='show'>
            <motion.div variants={itemAnim}>
              <Card className='bg-neutral-900/50 border-neutral-800'>
                <CardContent className='p-8'>
                  <form onSubmit={handleSave} className='space-y-6'>
                    {/* Avatar */}
                    <div className='flex items-center gap-6'>
                      <div className='relative'>
                        <div className='w-20 h-20 rounded-full bg-neutral-800 border-2 border-neutral-700 overflow-hidden flex items-center justify-center'>
                          {avatarUrl ? (
                            <img src={avatarUrl} alt='' className='w-full h-full object-cover' />
                          ) : (
                            <User className='w-8 h-8 text-neutral-500' />
                          )}
                        </div>
                        <label className='absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-violet-600 border-2 border-neutral-950 flex items-center justify-center cursor-pointer hover:bg-violet-500 transition-colors'>
                          {uploading ? <Loader2 className='w-3.5 h-3.5 text-white animate-spin' /> : <Camera className='w-3.5 h-3.5 text-white' />}
                          <input type='file' accept='image/*' onChange={handleFileUpload} className='hidden' />
                        </label>
                      </div>
                      <div>
                        <div className='text-white font-medium'>{user?.name || 'User'}</div>
                        <div className='text-sm text-neutral-500'>{user?.email}</div>
                        <div className='text-xs text-neutral-600 mt-1'>Click the camera icon to change avatar</div>
                      </div>
                    </div>

                    <hr className='border-neutral-800' />

                    {/* Name */}
                    <div>
                      <label className='block text-sm text-neutral-400 mb-2'>Name</label>
                      <div className='relative'>
                        <User className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500' />
                        <input
                          type='text' value={name} onChange={(e) => setName(e.target.value)}
                          className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-12 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-violet-500/50 focus:outline-none'
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className='block text-sm text-neutral-400 mb-2'>Email</label>
                      <div className='relative'>
                        <Mail className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500' />
                        <input
                          type='email' value={email} onChange={(e) => setEmail(e.target.value)}
                          className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-12 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-violet-500/50 focus:outline-none'
                          required
                        />
                      </div>
                    </div>

                    {/* Role & Dates */}
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='bg-neutral-800/50 rounded-lg p-3'>
                        <div className='text-xs text-neutral-500'>Role</div>
                        <div className='text-sm text-white font-medium mt-0.5'>{user?.role || '-'}</div>
                      </div>
                      <div className='bg-neutral-800/50 rounded-lg p-3'>
                        <div className='text-xs text-neutral-500'>Member since</div>
                        <div className='text-sm text-white font-medium mt-0.5'>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</div>
                      </div>
                    </div>

                    {error && <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2'><AlertCircle className='w-4 h-4' />{error}</div>}
                    {success && <div className='p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2'><CheckCircle2 className='w-4 h-4' />{success}</div>}

                    <Button type='submit' disabled={saving} className='w-full bg-white text-neutral-950 hover:bg-neutral-200 py-2.5'>
                      {saving ? <Loader2 className='w-5 h-5 mr-2 animate-spin' /> : <Save className='w-5 h-5 mr-2' />}
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
