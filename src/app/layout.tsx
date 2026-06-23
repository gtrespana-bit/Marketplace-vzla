import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Partytown } from '@qwik.dev/partytown/react'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/components/AuthProvider'
import IntlBridgeInit from '@/components/IntlBridgeInit'
import dynamic from 'next/dynamic'
import BottomTabNav from '@/components/BottomTabNav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { headers, cookies } from 'next/headers'
import { routing } from '@/i18n/routing'

const PWAInstallBanner = dynamic(() => import('@/components/PWAInstallBanner'), { ssr: false })
const PushNotificationBanner = dynamic(() => import('@/components/PushNotificationBanner'), { ssr: false })

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#008080',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://vende-t.com'),
  title: {
    default: 'VendeT - Marketplace de Venezuela | Compra y Vende Fácil',
    template: '%s | VendeT',
  },
  description: 'El marketplace más grande de Venezuela. Compra y vende productos nuevos y usados de forma segura. Miles de vendedores verificados en Caracas, Maracaibo, Valencia y toda Venezuela.',
  keywords: [
    'marketplace venezuela',
    'compra venta venezuela',
    'vender online venezuela',
    'marketplace caracas',
    'tienda online venezuela',
    'ecommerce venezuela',
    'clasificados venezuela',
    'ventas online venezuela',
    'marketplace maracaibo',
    'marketplace valencia venezuela',
  ],
  authors: [{ name: 'VendeT' }],
  creator: 'VendeT',
  publisher: 'VendeT',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_VE',
    url: 'https://vende-t.com',
    siteName: 'VendeT',
    title: 'VendeT - Marketplace de Venezuela | Compra y Vende Fácil',
    description: 'El marketplace más grande de Venezuela. Compra y vende productos nuevos y usados de forma segura.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VendeT Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VendeT - Marketplace de Venezuela',
    description: 'Compra y vende productos nuevos y usados de forma segura en Venezuela.',
    images: ['/og-image.jpg'],
    creator: '@vendet',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://vende-t.com',
  },
  verification: {
    google: 'TuGoogleVerificationCode',
  },
  category: 'marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Detect locale from middleware header (x-detected-locale)
  // or fallback to NEXT_LOCALE cookie
  const headersList = headers()
  const detectedLocale = headersList.get('x-detected-locale')
  
  let lang = 'es'
  if (detectedLocale && routing.locales.includes(detectedLocale as any)) {
    lang = detectedLocale
  } else {
    const cookieStore = cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')
    if (localeCookie?.value && routing.locales.includes(localeCookie.value as any)) {
      lang = localeCookie.value
    }
  }

  const partytownForward = {
    rel: 'preconnect' as const,
    href: 'https://www.googletagmanager.com',
  }

  return (
    <html lang={lang} className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect para recursos externos críticos */}
        <link rel="preconnect" href="https://jmbkqelkusxjebsdnjoc.supabase.co" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fcm.googleapis.com" />
        <link rel="dns-prefetch" href="https://fcm.googleapis.com" />

        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VendeT" />
        <meta name="application-name" content="VendeT" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-192x192.png" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Partytown - Third-party scripts optimization */}
        <Partytown
          forward={['dataLayer.push', 'fbq']}
          debug={false}
        />
      </head>
      <body className="bg-white antialiased" suppressHydrationWarning>
        <IntlBridgeInit>
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-white" suppressHydrationWarning>{children}</main>
          <Footer />
          <PWAInstallBanner />
          <PushNotificationBanner />
          <BottomTabNav />
        </AuthProvider>
        </IntlBridgeInit>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
