import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/components/AuthProvider'
import PWAInstallBanner from '@/components/PWAInstallBanner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#003DA5',
}

export const metadata: Metadata = {
  title: {
    template: '%s | Todo Anuncios',
    default: 'Todo Anuncios — Compra y Venta en Venezuela',
  },
  description: 'El marketplace venezolano. Compra y vende carros, tecnología, moda, hogar y más. Publica gratis, contacta directo. 🇻🇪',
  manifest: '/manifest.json',
  metadataBase: new URL('https://todonuncios.vercel.app'),
  openGraph: {
    title: 'Todo Anuncios — Compra y Venta en Venezuela',
    description: 'El marketplace venezolano. Publica gratis, contacta directo. Sin complicaciones.',
    url: 'https://todonuncios.vercel.app',
    siteName: 'Todo Anuncios',
    locale: 'es_VE',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Todo Anuncios — Compra y Venta en Venezuela',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Todo Anuncios — Compra y Venta en Venezuela',
    description: 'El marketplace venezolano. Compra y vende lo que quieras, contacta directo.',
  },
  alternates: {
    canonical: 'https://todonuncios.vercel.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://jmbkqelkusxjebsdnjoc.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://jmbkqelkusxjebsdnjoc.supabase.co" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-white">
            {children}
          </main>
          <Footer />
          <PWAInstallBanner />
        </AuthProvider>
        <script src="/sw-register.js" />
      </body>
    </html>
  )
}
