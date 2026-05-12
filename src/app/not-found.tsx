'use client'

import React from 'react'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className='w-full min-h-screen flex items-center justify-center'>
            <div className='flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 lg:gap-24 px-6 md:px-10'>
                <div className='flex flex-col items-center justify-center'>
                    <div className='text-9xl md:text-[10rem] font-light text-indigo-500/80'>404</div>
                </div>
                <div className='flex flex-col items-center justify-center gap-8 md:gap-12 text-center'>
                    <div className='flex flex-col justify-center gap-4'>
                        <h1 className='text-3xl md:text-4xl font-medium'>Page Not Found</h1>
                        <p className='text-sm md:text-base font-light text-muted-foreground'>Error 404</p>
                    </div>
                    <p className='text-wrap max-w-xl text-slate-400'>
                        Sorry! The content you&apos;re looking for may have been removed, but new opportunities always await. How about exploring our store to see what we have for you?
                    </p>
                    <div className='flex flex-col md:flex-row gap-4 w-full items-center justify-center'>
                        <Link
                            href='/'
                            className='w-56 h-10 inline-flex items-center justify-center whitespace-nowrap bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900'
                        >
                            Back to Homepage
                        </Link>
                        <Link
                            href='/products'
                            className='w-56 h-10 inline-flex items-center justify-center whitespace-nowrap border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900'
                        >
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}