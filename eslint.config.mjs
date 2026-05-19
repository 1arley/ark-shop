import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

/**
 * ESLint config for Next.js 15 + TypeScript.
 * Uses FlatCompat to bridge next/core-web-vitals and next/typescript
 * into the flat config format until eslint-config-next fully supports it natively.
 */
const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
]

export default eslintConfig
