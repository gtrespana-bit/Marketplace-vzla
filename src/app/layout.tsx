import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

// Lazy load heavy providers to reduce initial JS & main-thread work
import dynamic from 'next/dynamic'
const AuthProvider = dynamic(() => import('@/components/AuthProvider').then(m => ({ default: m.AuthProvider })))
import RootClientEffects from '@/components/RootClientEffects'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { CONSENT_STORAGE_KEY, GA_REQUIRE_CONSENT } from '@/lib/analytics'
import { SAME_AS } from '@/lib/social'

// Consent Mode v2: los valores por defecto se fijan en un script inline del
// <head>, es decir, ANTES de que gtag.js se cargue (afterInteractive). Si se
// dejara para un componente cliente, el primer hit podría salir sin
// consentimiento declarado y GA4 lo descartaría o lo modelaría mal.
//
// `analytics_storage` arranca en 'granted' salvo que el usuario haya rechazado
// el banner. Con NEXT_PUBLIC_GA_REQUIRE_CONSENT=1 se invierte: solo se mide si
// el usuario ha aceptado explícitamente (modelo RGPD estricto).
// `ad_*` va siempre en 'denied': el sitio no hace publicidad ni remarketing.
const gaConsentDefaultScript = `
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
(function(){
  var choice = null;
  try { choice = window.localStorage.getItem('${CONSENT_STORAGE_KEY}'); } catch (e) {}
  var analyticsStorage = ${
    GA_REQUIRE_CONSENT
      ? "(choice === 'accepted' ? 'granted' : 'denied')"
      : "(choice === 'rejected' ? 'denied' : 'granted')"
  };
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: analyticsStorage,
    functionality_storage: 'granted',
    security_storage: 'granted'
  });
  window.gtag('js', new Date());
})();
`

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
  preload: true,
})

export const viewport: Viewport = {
  // Debe coincidir con `theme_color` del manifest (#7B2D3B, el color de
  // marca). Estaba en teal (#008080): la barra de estado de Android/Chrome
  // móvil salía de un color que no existe en el sitio y, en la PWA instalada,
  // cambiaba bruscamente al abrir la app (el manifest manda otro color).
  themeColor: '#7B2D3B',
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
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "VendeT — Marketplace de clasificados de Venezuela",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VendeT - Marketplace de Venezuela',
    description: 'Compra y vende productos nuevos y usados de forma segura en Venezuela.',
    images: ['/og-image.jpg'],
    // Sin `creator`: declaraba @vendet, una cuenta de Twitter que no es del
    // proyecto. Un handle ajeno en la tarjeta es una señal de identidad falsa.
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
        {/* GA4 se carga tras la hidratación (afterInteractive); un DNS prefetch
            evita pagar la resolución DNS en ese momento. */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <script id="ga-consent-default" dangerouslySetInnerHTML={{ __html: gaConsentDefaultScript }} />
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
        {/*
          JSON-LD de entidad del sitio.

          ⚠️ `sameAs` sale de `src/lib/social.ts` (única fuente de verdad) y
          SOLO contiene perfiles reales. Antes declaraba
          instagram.com/vendet, twitter.com/vendet y facebook.com/vendet, que no
          son cuentas del proyecto. Un `sameAs` que apunta a cuentas ajenas le
          dice a Google que este sitio ES otra entidad — la peor señal posible
          para consolidar la marca, y la razón de que el dominio no apareciera
          al buscar "VendeT". Ver docs/SEO-DIAGNOSTICO-2026-11.md §Hallazgo 2.

          Google, Bing y los motores de IA usan este bloque para decidir qué es
          el sitio, así que debe ser exacto o no estar.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://vendet.online/#organization',
                  name: 'VendeT',
                  alternateName: ['VendeT Venezuela', 'VendeT.online'],
                  url: 'https://vendet.online',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://vendet.online/icon-512.png',
                    width: 512,
                    height: 512
                  },
                  description:
                    'Marketplace de clasificados de Venezuela para comprar y vender productos nuevos y usados sin comisiones.',
                  areaServed: {
                    '@type': 'Country',
                    name: 'Venezuela',
                    '@id': 'https://www.wikidata.org/wiki/Q717'
                  },
                  knowsLanguage: ['es-VE'],
                  // Solo se emite si hay al menos un perfil real (ver lib/social).
                  ...(SAME_AS.length > 0 ? { sameAs: SAME_AS } : {}),
                  contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    url: 'https://vendet.online/contacto',
                    availableLanguage: ['Spanish']
                  }
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://vendet.online/#website',
                  name: 'VendeT',
                  alternateName: 'VendeT Venezuela',
                  url: 'https://vendet.online',
                  inLanguage: 'es-VE',
                  publisher: { '@id': 'https://vendet.online/#organization' },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://vendet.online/buscar?q={search_term_string}'
                    },
                    'query-input': 'required name=search_term_string'
                  }
                }
              ]
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
        <GoogleAnalytics />
        <RootClientEffects />
      </body>
    </html>
  )
}
