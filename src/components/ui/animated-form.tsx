'use client'

import { motion } from 'framer-motion'

interface AnimatedFormProps {
  visible: boolean
  children: React.ReactNode
}

export function AnimatedForm({ visible, children }: AnimatedFormProps) {
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
