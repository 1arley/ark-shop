import type { Metadata } from 'next'
import { Bebas_Neue, Karla } from 'next/font/google'
import { ErrorBoundary } from '@/components/core/ErrorBoundary'
import './globals.css'

const displayFont = Bebas_Neue({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
})

const bodyFont = Karla({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Ark Games Shop',
  description: 'Your trusted digital marketplace for games, software licenses, and activation codes.',
  applicationName: 'Ark Games Shop',
  authors: [{ url: 'https://arkgames.shop', name: 'Ark Games Shop' }],
  keywords: ['games', 'digital keys', 'software licenses', 'Steam', 'Office', 'Windows'],
  creator: 'Ark Games Shop',
  publisher: 'Ark Games Shop',
  abstract: 'Modern digital marketplace for games and software licenses.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://arkgames.shop',
    title: 'Ark Games Shop - Digital Licenses & Software',
    description: 'Your trusted digital marketplace for games, software licenses, and activation codes.',
    siteName: 'Ark Games Shop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ark Games Shop',
    description: 'Your trusted digital marketplace for games, software licenses, and activation codes.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
        <link rel="alternate icon" href="/icons/favicon.svg" />
      </head>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} antialiased font-body`}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}