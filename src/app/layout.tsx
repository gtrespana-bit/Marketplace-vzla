import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Partytown } from '@qwik.dev/partytown/react'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/components/AuthProvider'
import dynamic from 'next/dynamic'
import BottomTabNav from '@/components/BottomTabNav'

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
        width: 1584,
        height: 672,
        alt: 'VendeT — La evolución de compra y venta en Venezuela. 0% comisión. Publica gratis.',
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
        <Partytown
          debug={false}
          forward={['dataLayer.push']}
          lib="/~partytown/"
        />

        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/png" href="/logo-vendet.png" />
        <link rel="apple-touch-icon" href="/icon-192.webp" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <script
          type="text/partytown"
          src="https://www.googletagmanager.com/gtag/js?id=G-RMMQFHP6EC"
        />
        <script
          type="text/partytown"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RMMQFHP6EC');
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://vendet.online/#organization',
                  name: 'VendeT-Venezuela',
                  url: 'https://vendet.online',
                  logo: 'https://vendet.online/logo-vendet.webp',
                  description:
                    'Marketplace venezolano. Compra y vende carros, tecnología, moda, hogar y más. Publica gratis, contacta directo.',
                  foundingDate: '2024',
                  areaServed: { '@type': 'Country', name: 'Venezuela' },
                  contactPoint: {
                    '@type': 'ContactPoint',
                    email: 'soporte@vendet.online',
                    contactType: 'customer service',
                    availableLanguage: 'Spanish',
                  },
                  sameAs: [],
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://vendet.online/#website',
                  url: 'https://vendet.online',
                  name: 'VendeT-Venezuela',
                  description: 'Marketplace venezolano para comprar y vender sin comisiones.',
                  inLanguage: 'es-VE',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://vendet.online/buscar?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-white">{children}</main>
          <Footer />
          <PWAInstallBanner />
          <PushNotificationBanner />
          <BottomTabNav />
        </AuthProvider>
      </body>
    </html>
  )
}