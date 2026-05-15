'use client';

import { useState, useRef } from 'react';
import { apiClient } from '@/services/api';
import { Product } from '@/types/api';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (importedCount: number) => void;
  categoryId?: string;
}

export function ImportCsvModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  categoryId 
}: ImportCsvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Por favor, selecione um arquivo CSV');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Preview do conteúdo
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').slice(0, 5); // Primeiras 5 linhas
      setPreview(lines.join('\n'));
    };
    reader.readAsText(selectedFile, 'latin1');
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    // Helper to read file as text using a Promise
    const readFile = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo CSV'));
        reader.readAsText(file, 'latin1');
      });
    };

    try {
      const csvContent = await readFile(file);
      const response = await apiClient.post<{ imported: number; failed: number; products: Product[]; errors: string[] }>('/products/import', {
        csvContent,
        categoryId: categoryId || undefined,
        isActive: true,
      });

      onSuccess?.(response.data.imported);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar CSV');
    } finally {
      setLoading(false);
    }
  };


const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  const droppedFile = e.dataTransfer.files?.[0];
  if (!droppedFile) return;

  // Validate CSV extension
  if (!droppedFile.name.endsWith('.csv')) {
    setError('Por favor, selecione um arquivo CSV');
    return;
  }

  setFile(droppedFile);
  setError(null);

  // Generate preview similar to handleFileChange
  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target?.result as string;
    const lines = content.split('\n').slice(0, 5);
    setPreview(lines.join('\n'));
  };
  reader.readAsText(droppedFile, 'latin1');
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Importar Produtos via CSV</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Instruções:</strong> Exporte sua planilha do Google Sheets como CSV 
            (Arquivo → Fazer download → CSV) e faça o upload abaixo.
          </p>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-2">
              {file ? (
                <span className="text-blue-600 dark:text-blue-400 font-medium">{file.name}</span>
              ) : (
                'Clique para selecionar ou arraste o arquivo CSV'
              )}
            </p>
          </div>
        </div>

        {preview && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Pré-visualização:</h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-auto max-h-40 font-mono text-gray-800 dark:text-gray-200">
              {preview}
            </pre>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Importando...
              </>
            ) : (
              'Importar Produtos'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
