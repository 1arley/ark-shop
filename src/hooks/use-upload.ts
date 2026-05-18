'use client'

import { useState, useCallback } from 'react'
import { apiClient } from '@/services/api'
import type { UploadResponse } from '@/types/api'

interface UseUploadOptions {
  folder?: string
  onProgress?: (progress: number) => void
  maxSizeMB?: number
  acceptedTypes?: string[]
}

export function useUpload(options?: UseUploadOptions) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([])

  const validateFile = useCallback((file: File) => {
    if (options?.maxSizeMB) {
      const maxSizeBytes = options.maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        return `File size exceeds ${options.maxSizeMB}MB limit`
      }
    }

    if (options?.acceptedTypes && options.acceptedTypes.length > 0) {
      const fileType = file.type
      const isAccepted = options.acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', '/'))
        }
        return fileType === type
      })
      if (!isAccepted) {
        return `File type ${fileType} is not accepted. Accepted: ${options.acceptedTypes.join(', ')}`
      }
    }

    return null
  }, [options?.maxSizeMB, options?.acceptedTypes])

  const uploadFile = useCallback(async (file: File): Promise<UploadResponse | null> => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return null
    }

    setIsUploading(true)
    setError(null)

    try {
      options?.onProgress?.(10)
      const response = await apiClient.upload.single(file, options?.folder)
      options?.onProgress?.(100)

      if (response.data) {
        setUploadedFiles(prev => [...prev, response.data as UploadResponse])
      }

      return response.data as UploadResponse
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [options?.folder, options?.onProgress, validateFile])

  const uploadMultiple = useCallback(async (files: File[]): Promise<UploadResponse[]> => {
    setIsUploading(true)
    setError(null)

    const validFiles: File[] = []
    for (const file of files) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) {
      setIsUploading(false)
      return []
    }

    try {
      options?.onProgress?.(10)
      const response = await apiClient.upload.multiple(validFiles, options?.folder)
      options?.onProgress?.(100)

      const results = Array.isArray(response.data) ? response.data : [response.data]
      setUploadedFiles(prev => [...prev, ...results])

      return results as UploadResponse[]
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      return []
    } finally {
      setIsUploading(false)
    }
  }, [options?.folder, options?.onProgress, validateFile])

  const deleteFile = useCallback(async (key: string) => {
    try {
      await apiClient.upload.delete(key)
      setUploadedFiles(prev => prev.filter(f => f.key !== key))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
      return false
    }
  }, [])

  const clearUploadedFiles = useCallback(() => {
    setUploadedFiles([])
  }, [])

  return {
    isUploading,
    error,
    uploadedFiles,
    uploadFile,
    uploadMultiple,
    deleteFile,
    clearUploadedFiles,
    validateFile,
  }
}
