'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Package,
    Gamepad2,
    Monitor,
    Wallet,
    CreditCard,
    Zap,
    Shield,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { apiClient } from '@/services/api'
import type { Category } from '@/types/api'

const categoryColors = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-rose-500',
    'from-violet-500 to-fuchsia-500',
    'from-cyan-500 to-blue-500',
    'from-slate-500 to-gray-600',
    'from-pink-500 to-rose-500',
]

const categoryIcons = [Gamepad2, Monitor, Wallet, CreditCard, Zap, Shield, Monitor, Package]

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadCategories() {
            try {
                const response = await apiClient.categories.list()
                setCategories(Array.isArray(response.data) ? response.data : [])
            } catch {
                // keep empty
            } finally {
                setIsLoading(false)
            }
        }
        loadCategories()
    }, [])

    const filteredCategories = selectedCategory
        ? categories.filter((cat) => cat.id === selectedCategory)
        : categories

    return (
        <div className='min-h-screen bg-neutral-950'>
            <Header />

            {/* Hero Section */}
            <section className='relative pt-24 pb-12 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-purple-950/40'>
                <div className='absolute inset-0'>
                    <div className='absolute top-20 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl' />
                    <div className='absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl' />
                </div>

                <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className='text-center'
                    >
                        <h1 className='text-4xl md:text-5xl font-semibold text-white mb-4'>
                            Browse Categories
                        </h1>
                        <p className='text-slate-400 text-lg max-w-2xl mx-auto'>
                            Explore our complete range of digital products organized by category
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className='py-12'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    {/* Filter Buttons */}
                    <div className='flex flex-wrap gap-3 mb-12 justify-center'>
                        <Button
                            variant={selectedCategory === null ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(null)}
                            className={selectedCategory === null ? 'bg-indigo-600' : 'border-slate-600 hover:bg-slate-800'}
                        >
                            All Categories
                        </Button>
                        {categories.slice(0, 5).map((category) => (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.name ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                                className={
                                    selectedCategory === category.name
                                        ? 'bg-indigo-600'
                                        : 'border-slate-600 hover:bg-slate-800'
                                }
                            >
                                {category.name}
                            </Button>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className='flex justify-center py-16'>
                            <Loader2 className='w-10 h-10 text-violet-400 animate-spin' />
                        </div>
                    ) : (
                        <>
                            {/* Categories */}
                            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {filteredCategories.map((category, index) => {
                                    const color = categoryColors[index % categoryColors.length]
                                    const IconComponent = categoryIcons[index % categoryIcons.length]
                                    return (
                                        <motion.div
                                            key={category.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                        >
                                            <Link href={`/products?categoryId=${category.id}`}>
                                                <Card className='bg-slate-800/30 border-slate-700 hover:border-indigo-500/50 transition-all overflow-hidden group cursor-pointer h-full'>
                                                    <div className='relative p-6'>
                                                        {/* Gradient Background */}
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                                                        {/* Icon */}
                                                        <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                                            <IconComponent className='w-8 h-8 text-white' />
                                                        </div>

                                                        {/* Content */}
                                                        <h3 className='text-xl font-semibold text-white mb-2'>
                                                            {category.name}
                                                        </h3>
                                                        {category.description && (
                                                            <p className='text-slate-400 text-sm mb-4'>
                                                                {category.description}
                                                            </p>
                                                        )}

                                                        {/* Product Count */}
                                                        <div className='flex items-center justify-between'>
                                                            <Badge variant='outline' className='border-slate-600 text-slate-300'>
                                                                {category._count?.products || 0} products
                                                            </Badge>
                                                            <span className='text-sm text-indigo-400 group-hover:text-indigo-300 transition-colors'>
                                                                View Products →
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    )
                                })}
                            </div>

                            {filteredCategories.length === 0 && (
                                <div className='text-center py-12'>
                                    <Package className='w-16 h-16 text-slate-600 mx-auto mb-4' />
                                    <h3 className='text-xl font-medium text-white mb-2'>No categories found</h3>
                                    <p className='text-slate-400'>Try selecting a different filter</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Featured Categories */}
            {!isLoading && categories.length >= 3 && (
                <section className='py-12 bg-slate-900/30'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className='text-center mb-12'
                        >
                            <h2 className='text-3xl md:text-4xl font-semibold text-white mb-4'>
                                Popular Categories
                            </h2>
                            <p className='text-slate-400'>Most visited categories this week</p>
                        </motion.div>

                        <div className='grid md:grid-cols-3 gap-6'>
                            {categories.slice(0, 3).map((category, index) => {
                                const color = categoryColors[index % categoryColors.length]
                                const IconComponent = categoryIcons[index % categoryIcons.length]
                                return (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                    >
                                        <Link href={`/products?categoryId=${category.id}`}>
                                            <Card className='bg-slate-800/30 border-slate-700 hover:border-indigo-500/50 transition-all overflow-hidden cursor-pointer h-full'>
                                                <CardContent className='p-8 text-center'>
                                                    <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                                                        <IconComponent className='w-10 h-10 text-white' />
                                                    </div>
                                                    <h3 className='text-xl font-semibold text-white mb-2'>
                                                        {category.name}
                                                    </h3>
                                                    <p className='text-slate-400 text-sm mb-4'>
                                                        {category._count?.products || 0} products available
                                                    </p>
                                                    <Button
                                                        variant='outline'
                                                        className='border-slate-600 hover:bg-slate-700'
                                                    >
                                                        Explore
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    )
}