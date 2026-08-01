import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import GoogleAnalytics from '@/components/GoogleAnalytics'

// Fuente Inter autohospedada (woff2 locales) en lugar de next/font/google.
// Elimina la dependencia de Google Fonts durante el build (que fallaba sin
// red), mejora la velocidad (origen propio, sin petición externa) y la
// privacidad. Mantiene la variable CSS `--font-inter` para que el config de
// Tailwind siga funcionando sin cambios.
const inter = localFont({
  src: [
    { path: './fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/inter-latin-500-italic.woff2', weight: '500', style: 'italic' },
    { path: './fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/inter-latin-600-italic.woff2', weight: '600', style: 'italic' },
    { path: './fonts/inter-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/inter-latin-700-italic.woff2', weight: '700', style: 'italic' },
    { path: './fonts/inter-latin-900-normal.woff2', weight: '900', style: 'normal' },
    { path: './fonts/inter-latin-900-italic.woff2', weight: '900', style: 'italic' },
  ],
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
  colorScheme: 'light',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://vendet.online'),
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
    'anuncios clasificados venezuela',
    'venta de carros venezuela',
    'tecnologia usada venezuela',
    'moda segunda mano venezuela',
    'hogar venezuela',
    'herramientas venezuela',
    'repuestos venezuela',
    'materiales venezuela',
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
    url: 'https://vendet.online',
    siteName: 'VendeT',
    title: 'VendeT - Marketplace de Venezuela | Compra y Vende Fácil',
    description: 'El marketplace más grande de Venezuela. Compra y vende productos nuevos y usados de forma segura.',
    images: [
      {
        url: '/og-image.webp',
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
    images: ['/og-image.webp'],
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
  // SIN canonical/languages aquí: esto es el layout raíz y Next lo hereda
  // en TODAS las páginas que no definan alternates — un canonical fijo a la
  // home haría que /catalogo, /faq, etc. canonicalizaran a la home.
  // Cada page.tsx define su propio canonical + hreflang.
  // Verificación de Google Search Console: el token real va en la variable
  // de entorno GOOGLE_SITE_VERIFICATION (solo el token, sin el prefijo
  // "google-site-verification="). Si GSC ya está verificado por DNS u otro
  // método, esta meta es opcional y simplemente no se emite.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  category: 'marketplace',
}

// IMPORTANTE — LAYOUT RAÍZ 100% ESTÁTICO.
//
// Este layout NO debe llamar a cookies(), headers(), searchParams() ni a
// ninguna API que dependa de la request. Hacerlo desactiva el render estático
// (SSG/ISR) de TODAS las rutas de la app: Next.js marca la ruta como dinámica
// y cada petición re-ejecuta el render en el servidor (cold start de la
// serverless function + llamadas de red a Supabase), lo que disparaba el TTFB
// a varios segundos y hacía que Lighthouse abortara ("The page loaded too
// slowly to finish within the time limit") incluso en la home con
// `revalidate = 120`.
//
// El usuario y el locale se resuelven en el CLIENTE (AuthProvider se hidrata
// solo) o en el layout de [locale], que sí conoce el locale por su segmento
// de URL sin APIs dinámicas. Así las páginas públicas vuelven a cachearse
// (ISR) y el TTFB baja a niveles sanos.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://jmbkqelkusxjebsdnjoc.supabase.co" />
        <link rel="dns-prefetch" href="https://jmbkqelkusxjebsdnjoc.supabase.co" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VendeT" />
        <meta name="application-name" content="VendeT" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="geo.region" content="VE" />
        <meta name="geo.placename" content="Venezuela" />
        <meta name="language" content="Spanish" />
        <meta name="revisit-after" content="1 days" />
        <meta name="rating" content="General" />
        <meta name="distribution" content="Global" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'VendeT',
              url: 'https://vendet.online',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://vendet.online/buscar?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              },
              publisher: {
                '@type': 'Organization',
                name: 'VendeT',
                url: 'https://vendet.online',
                logo: 'https://vendet.online/icon-192.png',
                sameAs: [
                  'https://instagram.com/vendet',
                  'https://twitter.com/vendet',
                  'https://facebook.com/vendet'
                ]
              }
            })
          }}
        />
      </head>
      <body className="bg-white antialiased" suppressHydrationWarning>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-lg focus:shadow-lg">
          Skip to main content
        </a>
        <AuthProvider>
          {children}
        </AuthProvider>
        {/* Re-enable Vercel Analytics and SpeedInsights with lazy initialization */}
        <Analytics />
        <SpeedInsights />
        {/* GA4: solo se carga si NEXT_PUBLIC_GA_ID está configurada */}
        <GoogleAnalytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
