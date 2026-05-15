'use client';

import { useState } from 'react';
import { ImportCsvModal } from './ImportCsvModal';

interface ImportCsvButtonProps {
  categoryId?: string;
  onImportSuccess?: (count: number) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}

export function ImportCsvButton({ 
  categoryId, 
  onImportSuccess,
  size = 'md',
  variant = 'primary'
}: ImportCsvButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-green-600 hover:bg-green-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`${sizeClasses[size]} ${variantClasses[variant]} rounded flex items-center gap-2 transition-colors`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Importar CSV
      </button>

      <ImportCsvModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={onImportSuccess}
        categoryId={categoryId}
      />
    </>
  );
}
