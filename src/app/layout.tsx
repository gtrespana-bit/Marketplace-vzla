import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/components/AuthProvider'
import nextDynamic from 'next/dynamic'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { headers, cookies } from 'next/headers'
import { routing } from '@/i18n/routing'
import { getServerUser } from '@/lib/supabase-server'

// Force dynamic rendering to ensure headers() reads fresh values on each request
export const dynamic = 'force-dynamic'

const PWAInstallBanner = nextDynamic(() => import('@/components/PWAInstallBanner'), { ssr: false })
const PushNotificationBanner = nextDynamic(() => import('@/components/PushNotificationBanner'), { ssr: false })
const BottomTabNavDynamic = nextDynamic(() => import('@/components/BottomTabNav'), { ssr: false })

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
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
    languages: {
      'es-VE': 'https://vende-t.com',
      'en-US': 'https://vende-t.com/en',
    },
  },
  verification: {
    google: 'TuGoogleVerificationCode',
  },
  category: 'marketplace',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ HYDRATION FIX: Parse JWT directly from cookies (NO network call, 100% reliable).
  // This always matches the client's session because both read the same cookie.
  const initialUser = getServerUser()

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

  return (
    <html lang={lang} className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect para recursos externos críticos */}
        <link rel="preconnect" href="https://jmbkqelkusxjebsdnjoc.supabase.co" />
        <link rel="preconnect" href="https://pub-d212837165c545e3956251da001fa37a.r2.dev" />
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

      </head>
      <body className="bg-white antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-lg focus:shadow-lg">
          Skip to main content
        </a>
        <AuthProvider initialUser={initialUser}>
          <Header />
          <main id="main-content" className="min-h-screen bg-white">{children}</main>
          <Footer />
          <PWAInstallBanner />
          <PushNotificationBanner />
          <BottomTabNavDynamic />
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
