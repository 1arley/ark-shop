'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Package,
    Gamepad2,
    Monitor,
    Wallet,
    CreditCard,
    Zap,
    Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function CategoriesPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const categories = [
        {
            name: 'Steam Keys',
            icon: Gamepad2,
            count: 502,
            description: 'Digital keys for games on the Steam platform',
            color: 'from-indigo-500 to-purple-600',
            image: null,
        },
        {
            name: 'Office Suites',
            icon: Monitor,
            count: 48,
            description: 'Microsoft Office, WPS Office, and more',
            color: 'from-blue-500 to-cyan-500',
            image: null,
        },
        {
            name: 'Gift Cards',
            icon: Wallet,
            count: 127,
            description: 'Gift cards for Steam, Spotify, Netflix, and more',
            color: 'from-emerald-500 to-teal-500',
            image: null,
        },
        {
            name: 'Subscriptions',
            icon: CreditCard,
            count: 83,
            description: 'Monthly and yearly subscription services',
            color: 'from-orange-500 to-rose-500',
            image: null,
        },
        {
            name: 'Game Currency',
            icon: Zap,
            count: 156,
            description: 'V-Bucks, GCash, and in-game currencies',
            color: 'from-violet-500 to-fuchsia-500',
            image: null,
        },
        {
            name: 'Security Software',
            icon: Shield,
            count: 42,
            description: 'Antivirus and security solutions',
            color: 'from-cyan-500 to-blue-500',
            image: null,
        },
        {
            name: 'Operating Systems',
            icon: Monitor,
            count: 24,
            description: 'Windows, Linux distributions, and more',
            color: 'from-slate-500 to-gray-600',
            image: null,
        },
        {
            name: 'Creative Software',
            icon: Monitor,
            count: 67,
            description: 'Adobe Creative Cloud, Affinity, and more',
            color: 'from-pink-500 to-rose-500',
            image: null,
        },
    ]

    const filteredCategories = selectedCategory
        ? categories.filter((cat) => cat.name === selectedCategory)
        : categories

    return (
        <div className='min-h-screen'>
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
                                key={category.name}
                                variant={selectedCategory === category.name ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
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

                    {/* Categories */}
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {filteredCategories.map((category, index) => (
                            <motion.div
                                key={category.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                                <Card className='bg-slate-800/30 border-slate-700 hover:border-indigo-500/50 transition-all overflow-hidden group cursor-pointer h-full'>
                                    <div className={`relative p-6`}>
                                        {/* Gradient Background */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                                        {/* Icon */}
                                        <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <category.icon className='w-8 h-8 text-white' />
                                        </div>

                                        {/* Content */}
                                        <h3 className='text-xl font-semibold text-white mb-2'>
                                            {category.name}
                                        </h3>
                                        <p className='text-slate-400 text-sm mb-4'>
                                            {category.description}
                                        </p>

                                        {/* Product Count */}
                                        <div className='flex items-center justify-between'>
                                            <Badge variant='outline' className='border-slate-600 text-slate-300'>
                                                {category.count} products
                                            </Badge>
                                            <span className='text-sm text-indigo-400 group-hover:text-indigo-300 transition-colors'>
                                                View Products →
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {filteredCategories.length === 0 && (
                        <div className='text-center py-12'>
                            <Package className='w-16 h-16 text-slate-600 mx-auto mb-4' />
                            <h3 className='text-xl font-medium text-white mb-2'>No categories found</h3>
                            <p className='text-slate-400'>Try selecting a different filter</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Categories */}
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
                        {categories.slice(0, 3).map((category, index) => (
                            <motion.div
                                key={category.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Card className='bg-slate-800/30 border-slate-700 hover:border-indigo-500/50 transition-all overflow-hidden cursor-pointer h-full'>
                                    <CardContent className='p-8 text-center'>
                                        <div className={`w-20 h-20 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                                            <category.icon className='w-10 h-10 text-white' />
                                        </div>
                                        <h3 className='text-xl font-semibold text-white mb-2'>
                                            {category.name}
                                        </h3>
                                        <p className='text-slate-400 text-sm mb-4'>
                                            {category.count} products available
                                        </p>
                                        <Button
                                            variant='outline'
                                            className='border-slate-600 hover:bg-slate-700'
                                        >
                                            Explore
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}