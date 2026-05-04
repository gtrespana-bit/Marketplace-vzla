import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/components/AuthProvider'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import PushNotificationBanner from '@/components/PushNotificationBanner'
import BottomTabNav from '@/components/BottomTabNav'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7B2D3B',
}

export const metadata: Metadata = {
  title: {
    template: '%s | VendeT-Venezuela',
    default: 'VendeT-Venezuela — Compra y Venta en Venezuela',
  },
  description: 'El marketplace venezolano. Compra y vende carros, tecnología, moda, hogar y más. Publica gratis, contacta directo. 🇻🇪',
  manifest: '/manifest.json',
  metadataBase: new URL('https://vendet.online'),
  openGraph: {
    title: 'VendeT-Venezuela — Compra y Venta en Venezuela',
    description: 'El marketplace venezolano. Publica gratis, contacta directo. Sin complicaciones.',
    url: 'https://vendet.online',
    siteName: 'VendeT-Venezuela',
    locale: 'es_VE',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VendeT-Venezuela — Compra y Venta en Venezuela',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VendeT-Venezuela — Compra y Venta en Venezuela',
    description: 'El marketplace venezolano. Compra y vende lo que quieras, contacta directo.',
  },
  alternates: {
    canonical: 'https://vendet.online',
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
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'VendeT-Venezuela', url: 'https://vendet.online', description: 'Marketplace venezolano. Compra y vende en Venezuela. Publica gratis.', logo: 'https://vendet.online/logo-vendet.png' }) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'VendeT-Venezuela', url: 'https://vendet.online', potentialAction: { '@type': 'SearchAction', target: 'https://vendet.online/buscar?q={search_term_string}', 'query-input': 'required name=search_term_string' } }) }}
        />
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-white">
            {children}
          </main>
          <Footer />
          <PWAInstallBanner />
          <PushNotificationBanner />
          <BottomTabNav />
        </AuthProvider>
        <script src="/sw-register.js" />
      </body>
    </html>
  )
}
