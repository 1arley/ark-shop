'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Loader2,
  User,
  Mail,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  Trash2,
  Shield,
  Calendar,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/services/api'
import { extractApiError } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'danger'>('profile')

  // Profile state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email)
      setAvatarUrl(user.avatarUrl || '')
    }
  }, [user])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileError('Only image files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('File must be under 5MB')
      return
    }

    setUploading(true)
    setProfileError(null)
    try {
      const res = await apiClient.upload.single(file, 'avatars')
      setAvatarUrl(res.data.url)
    } catch (err) {
      setProfileError(extractApiError(err, 'Failed to upload avatar'))
    }
    setUploading(false)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)

    if (!name.trim()) { setProfileError('Name is required'); return }
    if (!email.trim()) { setProfileError('Email is required'); return }

    setSaving(true)
    try {
      const updatedUser = await apiClient.user.updateMe({ name, email, avatarUrl: avatarUrl || undefined })
      useAuthStore.getState().setUser(updatedUser.data)
      setProfileSuccess('Profile updated successfully!')
      setTimeout(() => setProfileSuccess(null), 3000)
    } catch (err) {
      setProfileError(extractApiError(err, 'Failed to update profile'))
    }
    setSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!currentPassword) { setPasswordError('Current password is required'); return }
    if (newPassword.length < 8) { setPasswordError('New password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return }

    setChangingPassword(true)
    try {
      await apiClient.user.changePassword({
        currentPassword,
        newPassword,
      })
      setPasswordSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(null), 3000)
    } catch (err) {
      setPasswordError(extractApiError(err, 'Failed to change password. Make sure your current password is correct.'))
    }
    setChangingPassword(false)
  }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    setDeleteError(null)
    try {
      await apiClient.user.deleteMe()
      useAuthStore.getState().logout()
      apiClient.clearAuth()
      router.push('/')
    } catch (err) {
      setDeleteError(extractApiError(err, 'Failed to delete account'))
      setShowDeleteDialog(false)
    }
    setDeletingAccount(false)
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

  return (
    <div className='min-h-screen bg-neutral-950'>
      <Header />

      <section className='relative pt-28 pb-16 bg-neutral-900'>
        <div className='absolute inset-0'>
          <div className='absolute top-20 left-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl' />
        </div>
        <div className='relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => router.push('/dashboard')} className='flex items-center gap-1 text-sm text-neutral-400 hover:text-white mb-4 transition-colors'>
              <ArrowLeft className='w-4 h-4' /> Back to Dashboard
            </button>
            <h1 className='text-4xl md:text-5xl font-semibold text-white'>Profile</h1>
            <p className='text-neutral-400 text-lg mt-1'>Manage your account settings</p>
          </motion.div>
        </div>
      </section>

      <section className='py-12'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Tabs */}
          <div className='flex items-center gap-1 mb-8 bg-neutral-900/50 p-1 rounded-xl border border-neutral-800'>
            {[
              { id: 'profile' as const, label: 'Profile', icon: User },
              { id: 'security' as const, label: 'Security', icon: Shield },
              { id: 'danger' as const, label: 'Danger Zone', icon: AlertCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white'
                    : tab.id === 'danger'
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <tab.icon className='w-4 h-4' />
                <span className='hidden sm:inline'>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className='bg-neutral-900/50 border-neutral-800'>
                <CardContent className='p-8'>
                  <form onSubmit={handleSaveProfile} className='space-y-6'>
                    {/* Avatar */}
                    <div className='flex items-center gap-6'>
                      <div className='relative'>
                        <div className='relative w-20 h-20 rounded-full bg-neutral-800 border-2 border-neutral-700 overflow-hidden flex items-center justify-center'>
                          {avatarUrl ? (
                            <Image src={avatarUrl} alt='' fill className='object-cover' unoptimized />
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

                    {/* Info Grid */}
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='bg-neutral-800/50 rounded-lg p-3'>
                        <div className='flex items-center gap-2 text-xs text-neutral-500 mb-1'>
                          <Tag className='w-3 h-3' /> Role
                        </div>
                        <div className='text-sm text-white font-medium'>{user?.role || '-'}</div>
                      </div>
                      <div className='bg-neutral-800/50 rounded-lg p-3'>
                        <div className='flex items-center gap-2 text-xs text-neutral-500 mb-1'>
                          <Calendar className='w-3 h-3' /> Member since
                        </div>
                        <div className='text-sm text-white font-medium'>
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </div>
                      </div>
                    </div>

                    {profileError && (
                      <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2'>
                        <AlertCircle className='w-4 h-4' />{profileError}
                      </div>
                    )}
                    {profileSuccess && (
                      <div className='p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2'>
                        <CheckCircle2 className='w-4 h-4' />{profileSuccess}
                      </div>
                    )}

                    <Button type='submit' disabled={saving} className='w-full bg-white text-neutral-950 hover:bg-neutral-200 py-2.5'>
                      {saving ? <Loader2 className='w-5 h-5 mr-2 animate-spin' /> : <Save className='w-5 h-5 mr-2' />}
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className='bg-neutral-900/50 border-neutral-800'>
                <CardContent className='p-8'>
                  <h2 className='text-lg font-semibold text-white mb-6 flex items-center gap-2'>
                    <Lock className='w-5 h-5 text-violet-400' />
                    Change Password
                  </h2>

                  <form onSubmit={handleChangePassword} className='space-y-6'>
                    <div>
                      <label className='block text-sm text-neutral-400 mb-2'>Current Password</label>
                      <div className='relative'>
                        <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500' />
                        <input
                          type='password' value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                          className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-12 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-violet-500/50 focus:outline-none'
                          placeholder='Enter current password'
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm text-neutral-400 mb-2'>New Password</label>
                      <div className='relative'>
                        <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500' />
                        <input
                          type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                          className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-12 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-violet-500/50 focus:outline-none'
                          placeholder='At least 8 characters'
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm text-neutral-400 mb-2'>Confirm New Password</label>
                      <div className='relative'>
                        <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500' />
                        <input
                          type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          className='w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-12 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-violet-500/50 focus:outline-none'
                          placeholder='Re-enter new password'
                          required
                        />
                      </div>
                    </div>

                    {passwordError && (
                      <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2'>
                        <AlertCircle className='w-4 h-4' />{passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className='p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2'>
                        <CheckCircle2 className='w-4 h-4' />{passwordSuccess}
                      </div>
                    )}

                    <Button type='submit' disabled={changingPassword} className='w-full bg-violet-600 hover:bg-violet-500 py-2.5'>
                      {changingPassword ? <Loader2 className='w-5 h-5 mr-2 animate-spin' /> : <Lock className='w-5 h-5 mr-2' />}
                      Change Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className='bg-red-500/5 border-red-500/20'>
                <CardContent className='p-8'>
                  <h2 className='text-lg font-semibold text-red-400 mb-2 flex items-center gap-2'>
                    <AlertCircle className='w-5 h-5' />
                    Danger Zone
                  </h2>
                  <p className='text-neutral-400 text-sm mb-6'>
                    Irreversible actions. Proceed with caution.
                  </p>

                  <div className='p-4 bg-red-500/10 border border-red-500/20 rounded-lg'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='text-white font-medium'>Delete Account</h3>
                        <p className='text-sm text-neutral-400 mt-1'>
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      <Button
                        variant='outline'
                        onClick={() => setShowDeleteDialog(true)}
                        className='border-red-500/30 text-red-400 hover:bg-red-500/10 flex-shrink-0'
                      >
                        <Trash2 className='w-4 h-4 mr-2' />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {deleteError && (
                    <div className='mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2'>
                      <AlertCircle className='w-4 h-4' />{deleteError}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        title='Delete Account'
        description='Are you sure you want to delete your account? This will permanently remove all your data, orders, and keys. This action cannot be undone.'
        confirmLabel='Delete Account'
        cancelLabel='Cancel'
        variant='danger'
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
        loading={deletingAccount}
      />

      <Footer />
    </div>
  )
}
