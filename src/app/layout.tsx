import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/components/AuthProvider'
import dynamic from 'next/dynamic'
import BottomTabNav from '@/components/BottomTabNav'

// Lazy-load banners - no impact on TTI
const PWAInstallBanner = dynamic(() => import('@/components/PWAInstallBanner'), { ssr: false })
const PushNotificationBanner = dynamic(() => import('@/components/PushNotificationBanner'), { ssr: false })

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
  description: 'El marketplace venezolano. Compra y vende carros, tecnología, moda, hogar y más. Publica gratis, contacta directo.',
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
        url: '/og-image.webp',
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
        <link rel="preconnect" href="https://o4511327356518400.ingest.us.sentry.io" crossOrigin="anonymous" />
        
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/png" href="/logo-vendet.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Google Analytics 4 */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-RMMQFHP6EC" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RMMQFHP6EC');
          `}
        </Script>
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
        <script src="/sw-register.js" defer />
      </body>
    </html>
  )
}
