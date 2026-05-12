import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ErrorBoundary } from '@/components/core/ErrorBoundary'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}