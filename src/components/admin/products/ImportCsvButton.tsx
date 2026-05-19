'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImportCsvModal } from './ImportCsvModal'
import { Upload } from 'lucide-react'

interface ImportCsvButtonProps {
  categoryId?: string
  onImportSuccess?: (count: number) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'secondary'
}

export function ImportCsvButton({
  categoryId,
  onImportSuccess,
  size = 'md',
  variant = 'default',
}: ImportCsvButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button
        type="button"
        onClick={() => setShowModal(true)}
        variant={variant === 'secondary' ? 'outline' : 'default'}
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
        aria-label="Importar produtos via CSV"
        className={variant === 'default' ? 'bg-green-600 hover:bg-green-700' : ''}
      >
        <Upload className="w-4 h-4" aria-hidden="true" />
        Importar CSV
      </Button>

      <ImportCsvModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={onImportSuccess}
        categoryId={categoryId}
      />
    </>
  )
}
