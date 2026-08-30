import LocalLink from '@/components/LocalLink'
import Image from 'next/image'
import { ArrowRight, Star, Eye, Search, Plus, Camera, MessageCircle, HandCoins, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase-server-client'
import { BotonDescargarApp } from '@/components/BotonDescargarApp'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { productUrl } from '@/lib/product-url'

function generateItemListSchema(products: any[], baseUrl: string) {
  if (!products || products.length === 0) return null
  
  const itemListElements = products.map((product, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${baseUrl}/producto/${product.slug || product.id}`,
    name: product.titulo,
    description: product.descripcion || `Compra ${product.titulo} en Venezuela`,
    image: product.imagen_url || `${baseUrl}/placeholder-product.webp`,
    offers: {
      '@type': 'Offer',
      price: product.precio_usd || 0,
      priceCurrency: 'USD',
      availability: product.activo ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'VendeT.online'
      }
    }
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: itemListElements,
    numberOfItems: products.length,
    description: 'Lista de productos destacados y recientes en VendeT.online - Clasificados Venezuela'
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  
  return {
    // Sin marca aquí: el template del layout raíz (%s | VendeT) la agrega una sola vez.
    title: 'Clasificados Venezuela — Compra y Venta',
    description: 'VendeT.online es el marketplace líder de clasificados en Venezuela. Publica gratis, compra y vende productos nuevos y usados en todo el país. Únete a miles de usuarios.',
    keywords: ['clasificados venezuela', 'compra venta venezuela', 'marketplace venezuela', 'vender en venezuela', 'clasificados online', 'tienda online venezuela', 'productos venezuela', 'mercado libre venezuela'],
    authors: [{ name: 'VendeT.online' }],
    creator: 'VendeT.online',
    publisher: 'VendeT.online',
    alternates: {
      canonical: 'https://vendet.online/',
      languages: {
        'es-VE': 'https://vendet.online/',
        'x-default': 'https://vendet.online/',
      },
    },
    openGraph: {
      title: 'Clasificados Venezuela — Compra y Venta',
      description: 'El marketplace líder de clasificados en Venezuela. Publica gratis y vende tus productos.',
      url: 'https://vendet.online/',
      siteName: 'VendeT',
      images: [
        {
          url: 'https://vendet.online/og-image.webp',
          width: 1200,
          height: 630,
          alt: 'VendeT.online - Clasificados Venezuela'
        }
      ],
      locale: locale === 'en' ? 'en_US' : 'es_VE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Clasificados Venezuela — Compra y Venta',
      description: 'El marketplace líder de clasificados en Venezuela. Publica gratis y vende tus productos.',
      images: ['https://vendet.online/og-image.webp'],
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
  }
}

const PLACEHOLDER_IMAGES = ['/placeholder-product.webp']

function getPlaceholderImage(titulo: string) {
  return PLACEHOLDER_IMAGES[Math.abs(titulo.charCodeAt(0)) % PLACEHOLDER_IMAGES.length]
}

function formatPrice(value: any) {
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value || 0))}`
}

/**
 * Tiempo relativo server-side ("hace 2 h"). La página es ISR (revalidate=120),
 * así que el valor puede quedarse hasta 2 min atrás — aceptable para una ficha.
 */
function relativeTime(iso?: string | null, t?: any): string | null {
  if (!iso || !t) return null
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return t('home.timeAgo.now')
  if (mins < 60) return t('home.timeAgo.minutes', { count: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t('home.timeAgo.hours', { count: hours })
  const days = Math.floor(hours / 24)
  if (days < 7) return t('home.timeAgo.days', { count: days })
  return null
}

async function getDestacados(limit = 8) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase.rpc('obtener_destacados_home', { p_limite: limit })
    if (!error && data) return data as any[]

    const { data: data2 } = await supabase
      .from('productos')
      .select('id, slug, titulo, precio_usd, estado, imagen_url, ubicacion_ciudad, creado_en')
      .eq('activo', true)
      .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado,estado_moderacion.eq.pendiente')
      .eq('destacado', true)
      .gt('destacado_hasta', new Date().toISOString())
      .order('destacado_hasta', { ascending: false })
      .limit(limit)

    return data2 || []
  } catch {
    return []
  }
}

async function getTrending(limit = 8) {
  if (!supabase) return []
  const { data } = await supabase
    .from('productos')
    .select('id, slug, titulo, precio_usd, imagen_url, ubicacion_ciudad, visitas, creado_en')
    .eq('activo', true)
    .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')
    .order('visitas', { ascending: false })
    .limit(limit)
  return data || []
}

async function getRecentProducts(limit = 8) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('productos')
    .select('id, slug, titulo, precio_usd, estado, imagen_url, ubicacion_ciudad, creado_en, boosteado_en, destacado, destacado_hasta')
    .eq('activo', true)
    .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')
    .limit(20)

  if (error) return []

  const now = new Date().toISOString()
  return (data || [])
    .sort((a, b) => {
      const aBoost = a.boosteado_en || null
      const bBoost = b.boosteado_en || null
      if (aBoost && !bBoost) return -1
      if (!aBoost && bBoost) return 1
      if (aBoost && bBoost) return bBoost.localeCompare(aBoost)

      const aDest = a.destacado && a.destacado_hasta > now
      const bDest = b.destacado && b.destacado_hasta > now
      if (aDest && !bDest) return -1
      if (!aDest && bDest) return 1
      if (aDest && bDest) return b.destacado_hasta.localeCompare(a.destacado_hasta)

      return (b.creado_en || '').localeCompare(a.creado_en || '')
    })
    .slice(0, limit)
}

/**
 * Vendidos recientemente — la prueba social más fuerte disponible:
 * evidencia de que en VendeT SÍ se vende. Requiere `vendido_fecha`
 * (migración 20260829000101); si la DB no la tiene aún, cae a
 * ordenar por creado_en.
 */
async function getVendidos(limit = 4) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('id, slug, titulo, precio_usd, imagen_url, ubicacion_ciudad, vendido_fecha, creado_en')
      .eq('vendido', true)
      .order('vendido_fecha', { ascending: false, nullsFirst: false })
      .limit(limit)
    if (error) throw new Error(error.message)
    return data || []
  } catch {
    try {
      const { data } = await supabase
        .from('productos')
        .select('id, slug, titulo, precio_usd, imagen_url, ubicacion_ciudad, creado_en')
        .eq('vendido', true)
        .order('creado_en', { ascending: false })
        .limit(limit)
      return data || []
    } catch {
      return []
    }
  }
}

/**
 * Publicaciones de los últimos 7 días. Mide ACTIVIDAD (siempre crece),
 * no inventario total: mostrar "+130 productos" revelaba un catálogo
 * pequeño. Límite 50 para no traer filas: arriba de eso basta "50+".
 */
async function getSemanal() {
  if (!supabase) return 0
  try {
    const desde = new Date(Date.now() - 7 * 864e5).toISOString()
    const { data } = await supabase
      .from('productos')
      .select('id')
      .eq('activo', true)
      .gte('creado_en', desde)
      .limit(50)
    return data?.length || 0
  } catch {
    return 0
  }
}

function ProductCard({ p, highlighted = false, priority = false, t }: { p: any; highlighted?: boolean; priority?: boolean; t: any }) {
  const imgUrl = p.imagen_url || getPlaceholderImage(p.titulo)
  const meta = [p.estado, p.ubicacion_ciudad || '', relativeTime(p.creado_en, t)].filter(Boolean).join(' · ')

  return (
    <LocalLink
      href={productUrl(p)}
      className={`bg-white rounded-xl overflow-hidden transition-all duration-200 group block border ${
        highlighted
          ? 'border-2 border-brand-accent shadow-lg hover:shadow-xl hover:-translate-y-1'
          : 'shadow-sm border-gray-100 hover:shadow-lg hover:-translate-y-1 hover:border-gray-200'
      }`}
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {highlighted && (
          <div className="absolute top-2 left-2 z-10 bg-brand-accent text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Star size={10} /> {t('home.productCard.featured')}
          </div>
        )}
        <Image
          src={imgUrl}
          alt={p.titulo}
          fill
          sizes="(max-width: 480px) 45vw, (max-width: 768px) 45vw, (max-width: 1024px) 23vw, 320px"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          priority={priority}
          fetchPriority={priority ? 'high' : 'auto'}
          quality={75}
          placeholder="blur"
          blurDataURL="/placeholder-product.webp"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-primary transition-colors">
          {p.titulo}
        </h3>
        <p className="text-xl font-black text-brand-primary mt-1">
          {formatPrice(p.precio_usd)}
        </p>
        <p className="text-xs text-gray-500 mt-1 truncate">{meta}</p>
      </div>
    </LocalLink>
  )
}

/** Collage de productos reales en el hero (solo desktop). Muestra inventario real
 *  desde el primer vistazo y termina con una tarjeta-CTA "Tu producto aquí". */
function HeroCollage({ items, t }: { items: any[]; t: any }) {
  return (
    <div className="relative hidden lg:block h-[460px]" aria-hidden="true">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 bg-brand-accent/15 rounded-full blur-3xl" />
      </div>

      {items[0] && (
        <div className="absolute top-0 right-8 w-56 rotate-3 hover:rotate-0 transition-transform duration-300">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/30 animate-float">
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={items[0].imagen_url || getPlaceholderImage(items[0].titulo)}
                alt=""
                fill
                sizes="224px"
                className="object-cover"
                quality={75}
              />
            </div>
            <p className="px-3 py-2 text-sm font-black text-brand-primary truncate">
              {formatPrice(items[0].precio_usd)}
            </p>
          </div>
        </div>
      )}

      {items[1] && (
        <div className="absolute bottom-24 left-0 w-44 -rotate-6 hover:rotate-0 transition-transform duration-300">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/30 animate-float-slow">
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={items[1].imagen_url || getPlaceholderImage(items[1].titulo)}
                alt=""
                fill
                sizes="176px"
                className="object-cover"
                quality={75}
              />
            </div>
            <p className="px-3 py-2 text-sm font-black text-brand-primary truncate">
              {formatPrice(items[1].precio_usd)}
            </p>
          </div>
        </div>
      )}

      <LocalLink
        href="/publicar"
        className="absolute bottom-2 right-20 w-48 rotate-2 hover:rotate-0 transition-transform duration-300 group"
      >
        <div className="h-full bg-white/10 border-2 border-dashed border-white/40 rounded-2xl p-4 backdrop-blur-sm">
          <span className="w-9 h-9 bg-brand-accent rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus size={18} className="text-gray-900" />
          </span>
          <p className="text-white font-bold text-sm leading-tight">{t('home.hero.collageTitle')}</p>
          <p className="text-brand-accent text-xs font-bold mt-1 flex items-center gap-1">
            {t('home.hero.collageCta')} <ArrowRight size={12} />
          </p>
        </div>
      </LocalLink>
    </div>
  )
}

const CATEGORY_DEFS = [
  { id: 'vehiculos', icon: '🚗', nameKey: 'home.categories.vehicles', descKey: 'home.categories.vehiclesDesc' },
  { id: 'tecnologia', icon: '💻', nameKey: 'home.categories.tech', descKey: 'home.categories.techDesc' },
  { id: 'moda', icon: '👗', nameKey: 'home.categories.fashion', descKey: 'home.categories.fashionDesc' },
  { id: 'hogar', icon: '🛋', nameKey: 'home.categories.homeCat', descKey: 'home.categories.homeCatDesc' },
  { id: 'herramientas', icon: '🔧', nameKey: 'home.categories.tools', descKey: 'home.categories.toolsDesc' },
  { id: 'otros', icon: '📦', nameKey: 'home.categories.others', descKey: 'home.categories.othersDesc' },
]

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })
  const [destacados, trending, productos, vendidos, semanal] = await Promise.all([
    getDestacados(),
    getTrending(),
    getRecentProducts(),
    getVendidos(),
    getSemanal(),
  ])

  const baseUrl = 'https://vendet.online'
  const allProducts = [...destacados, ...productos].slice(0, 20)
  const itemListSchema = generateItemListSchema(allProducts, baseUrl)

  // Collage del hero: los 2 primeros con foto de destacados → trending → recientes
  const collageItems = [...destacados, ...trending, ...productos]
    .filter((p) => p.imagen_url)
    .slice(0, 2)

  const searchAction = locale === 'en' ? '/en/buscar' : '/buscar'
  const now = new Date().toISOString()

  // Stats del hero: actividad (crece siempre) en vez de inventario total.
  // Un "+130 productos activos" revelaba catálogo pequeño; "+9 esta semana"
  // comunica un mercado vivo. Sin actividad aún → beneficios duros.
  const heroStats =
    semanal > 0
      ? [
          { v: semanal >= 50 ? '50+' : `+${semanal}`, l: t('home.hero.stats.week') },
          { v: '+5K', l: t('home.hero.stats.users') },
          { v: '0%', l: t('home.hero.stats.commission') },
        ]
      : [
          { v: '+5K', l: t('home.hero.stats.users') },
          { v: '$0', l: t('home.hero.stats.cost') },
          { v: '0%', l: t('home.hero.stats.commission') },
        ]

  return (
    <>
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <div className="bg-gray-50">
      {/* ============ HERO: buscar y publicar, sin presión de pago ============ */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark py-10 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 relative z-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-semibold text-white">{t('home.hero.chip')}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
              {t('home.hero.title1')}{' '}
              <span className="text-brand-accent">{t('home.hero.title2')}</span>
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-6 max-w-xl mx-auto lg:mx-0">
              {t('home.hero.subtitle')}
            </p>

            {/* Buscador grande: en móvil el del header está oculto, este es el principal */}
            <form action={searchAction} method="GET" className="relative max-w-xl mx-auto lg:mx-0 mb-3">
              <label htmlFor="hero-search" className="sr-only">{t('home.hero.searchPlaceholder')}</label>
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="hero-search"
                type="text"
                name="q"
                placeholder={t('home.hero.searchPlaceholder')}
                className="w-full py-3.5 pl-11 pr-28 rounded-full text-gray-900 bg-white shadow-lg shadow-black/20 focus:outline-none focus:ring-4 focus:ring-brand-accent/40"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-primary text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-brand-dark transition"
              >
                {t('home.hero.searchButton')}
              </button>
            </form>

            {/* Accesos rápidos por categoría */}
            <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:justify-center lg:justify-start pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <LocalLink
                href="/catalogo"
                className="shrink-0 text-xs font-bold bg-brand-accent/20 border border-brand-accent/40 text-white px-3 py-1.5 rounded-full hover:bg-brand-accent/30 transition"
              >
                🔍 {t('home.categories.viewAll')}
              </LocalLink>
              {CATEGORY_DEFS.map((cat) => (
                <LocalLink
                  key={cat.id}
                  href={`/categoria/${cat.id}`}
                  className="shrink-0 text-xs font-semibold bg-white/10 border border-white/20 text-white/90 px-3 py-1.5 rounded-full hover:bg-white/20 transition"
                >
                  {cat.icon} {t(cat.nameKey)}
                </LocalLink>
              ))}
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
              <LocalLink
                href="/publicar"
                className="inline-flex items-center gap-2 bg-brand-accent text-gray-900 px-6 py-3 rounded-xl font-bold text-base hover:bg-accent/90 transition shadow-lg shadow-black/20"
              >
                <span>{t('home.hero.publishFree')}</span>
                <ArrowRight size={18} />
              </LocalLink>
              <LocalLink
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/20 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-white/20 transition"
              >
                <Eye size={18} />
                <span>{t('home.hero.explore')}</span>
              </LocalLink>
              <BotonDescargarApp />
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
              {heroStats.map((s) => (
                <div key={s.l}>
                  <p className="text-2xl md:text-3xl font-black text-brand-accent">{s.v}</p>
                  <p className="text-[10px] md:text-[11px] text-white/70 mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <HeroCollage items={collageItems} t={t} />
        </div>
      </section>

      {/* ============ Banner de confianza: publicar es gratis ============ */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-y border-green-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <p className="font-bold text-gray-900 text-sm">{t('home.freeBanner.title')}</p>
          </div>
          <p className="text-xs text-gray-600 hidden sm:inline">
            {t('home.freeBanner.subtitle')}
          </p>
          <LocalLink href="/como-funciona" className="text-green-700 text-xs font-bold hover:underline">
            {t('home.freeBanner.compare')}
          </LocalLink>
        </div>
      </div>

      {/* ============ Categorías: antes que cualquier mensaje de pago ============ */}
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-12">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
              {t('home.categories.title')}
            </h2>
            <p className="text-gray-600">{t('home.categories.subtitle')}</p>
          </div>
          <LocalLink
            href="/catalogo"
            prefetch={true}
            className="text-brand-primary font-semibold text-sm hover:underline flex items-center gap-1 shrink-0"
          >
            {t('home.categories.viewAll')} <ArrowRight size={14} />
          </LocalLink>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORY_DEFS.map((cat) => (
            <LocalLink
              key={cat.id}
              href={`/categoria/${cat.id}`}
              prefetch={true}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border hover:border-brand-accent transition hover:shadow-lg group"
            >
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="font-bold text-gray-900 text-sm">{t(cat.nameKey)}</span>
              <span className="block text-xs text-gray-600 mt-1 truncate">{t(cat.descKey)}</span>
            </LocalLink>
          ))}
        </div>
      </section>

      {/* ============ Recién publicado: inventario fresco, el gancho del comprador ============ */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('home.recent.title')}</h2>
          <LocalLink
            href="/catalogo"
            className="text-brand-primary font-semibold text-sm hover:underline flex items-center gap-1"
            prefetch={true}
          >
            {t('home.recent.viewAll')} <ArrowRight size={14} />
          </LocalLink>
        </div>

        {productos.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm border">
            <p className="text-xl font-bold text-gray-800 mb-2">{t('home.recent.empty')}</p>
            <p className="text-gray-500 mb-6">{t('home.recent.emptyCta')}</p>
            <LocalLink
              href="/publicar"
              className="inline-block bg-brand-accent text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-accent/90 transition"
            >
              {t('home.recent.publishFree')}
            </LocalLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {productos.map((p, index) => {
              const isHighlighted =
                (p.destacado && p.destacado_hasta > now) || p.boosteado_en
              return <ProductCard key={p.id} p={p} highlighted={isHighlighted} priority={index < 2} t={t} />
            })}
          </div>
        )}
      </section>

      {/* ============ Destacados: sin banner de venta, solo productos ============ */}
      {destacados.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-gray-900">{t('home.featured.title')}</h2>
            <span className="bg-brand-accent/20 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Star size={12} /> {t('home.productCard.featured')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {destacados.map((p, index) => (
              <ProductCard
                key={p.id}
                p={p}
                highlighted
                priority={false}
                t={t}
              />
            ))}
          </div>
        </section>
      )}

      {/* ============ Lo más visto ============ */}
      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-gray-900">{t('home.trending.title')}</h2>
            <span className="text-xs text-gray-500">{t('home.trending.period')}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {trending.map((p, index) => (
              <LocalLink
                key={p.id}
                href={productUrl(p)}
                prefetch={true}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition group block"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <Image
                    src={p.imagen_url || getPlaceholderImage(p.titulo)}
                    alt={p.titulo}
                    fill
                    sizes="(max-width: 480px) 45vw, (max-width: 768px) 45vw, (max-width: 1024px) 23vw, 320px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    quality={75}
                    placeholder="blur"
                    blurDataURL="/placeholder-product.webp"
                  />
                  <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    🔥 Trending
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-primary transition-colors">
                    {p.titulo}
                  </h3>
                  <p className="text-xl font-black text-brand-primary mt-1">
                    {formatPrice(p.precio_usd)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Eye size={11} className="text-gray-500" />
                    <p className="text-xs text-gray-500">{p.visitas || 0} {t('home.trending.views')}</p>
                  </div>
                </div>
              </LocalLink>
            ))}
          </div>
        </section>
      )}

      {/* ============ Vendidos recientemente: prueba social de que aquí SÍ se vende ============ */}
      {vendidos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{t('home.sold.title')}</h2>
                <p className="text-xs text-gray-500">{t('home.sold.subtitle')}</p>
              </div>
            </div>
            <LocalLink
              href="/publicar"
              className="text-brand-primary font-semibold text-sm hover:underline flex items-center gap-1 shrink-0"
            >
              {t('home.sold.cta')} <ArrowRight size={14} />
            </LocalLink>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {vendidos.map((p) => {
              const vendidoCuando = relativeTime(p.vendido_fecha || p.creado_en, t)
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                  aria-label={`${p.titulo} — ${t('home.sold.badge')}`}
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <Image
                      src={p.imagen_url || getPlaceholderImage(p.titulo)}
                      alt={p.titulo}
                      fill
                      sizes="(max-width: 768px) 45vw, 300px"
                      className="object-cover grayscale opacity-90"
                      loading="lazy"
                      decoding="async"
                      quality={75}
                      placeholder="blur"
                      blurDataURL="/placeholder-product.webp"
                    />
                    <span className="absolute top-2 left-2 z-10 bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                      ✓ {t('home.sold.badge')}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <h3 className="font-semibold text-gray-600 truncate text-sm">{p.titulo}</h3>
                    <p className="text-lg font-black text-gray-400 mt-0.5">
                      {formatPrice(p.precio_usd)}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {p.ubicacion_ciudad || 'Venezuela'}
                      {vendidoCuando ? ` · ${vendidoCuando}` : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ============ Cómo vender en 3 pasos + mención única y discreta de destacar ============ */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <p className="text-xs font-black text-brand-primary uppercase tracking-wider mb-2">
            {t('home.how.eyebrow')}
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
            {t('home.how.title')}
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            {t('home.how.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Camera, title: t('home.how.step1Title'), desc: t('home.how.step1Desc') },
            { icon: MessageCircle, title: t('home.how.step2Title'), desc: t('home.how.step2Desc') },
            { icon: HandCoins, title: t('home.how.step3Title'), desc: t('home.how.step3Desc') },
          ].map((step, i) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative"
            >
              <span className="absolute top-4 right-5 text-4xl font-black text-gray-100 select-none">
                {i + 1}
              </span>
              <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
                <step.icon size={24} className="text-brand-primary" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 flex flex-wrap justify-center items-center gap-4">
          <LocalLink
            href="/publicar"
            prefetch={true}
            className="inline-flex items-center gap-2 bg-brand-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-lg"
          >
            {t('home.how.cta')}
            <ArrowRight size={18} />
          </LocalLink>
          <LocalLink
            href="/como-funciona"
            className="text-brand-primary font-semibold text-sm hover:underline flex items-center gap-1"
          >
            {t('home.how.moreInfo')} <ArrowRight size={14} />
          </LocalLink>
        </div>

        {/* Único punto de entrada a créditos desde la home: opcional, sin precios */}
        <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-between shadow-sm">
          <div className="flex items-center gap-3 text-center md:text-left flex-col md:flex-row">
            <span className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-amber-600" />
            </span>
            <div>
              <p className="font-bold text-gray-900 text-sm md:text-base">{t('home.optional.title')}</p>
              <p className="text-xs md:text-sm text-gray-600">{t('home.optional.desc')}</p>
            </div>
          </div>
          <LocalLink
            href="/creditos"
            className="shrink-0 inline-flex items-center gap-1 border-2 border-brand-accent/60 text-gray-900 bg-brand-accent/10 px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-accent/30 transition"
          >
            {t('home.optional.cta')} <ArrowRight size={14} />
          </LocalLink>
        </div>
      </section>

      {/* ============ CTA final: publicar y explorar, no vender créditos ============ */}
      <section className="bg-brand-accent py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-gray-800 text-lg mb-8">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <LocalLink
              href="/publicar"
              className="inline-flex items-center gap-2 bg-brand-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-dark transition shadow-lg"
              prefetch={true}
            >
              {t('home.cta.publishNow')}
              <ArrowRight size={20} />
            </LocalLink>
            <LocalLink
              href="/catalogo"
              className="inline-flex items-center gap-2 bg-white text-brand-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-lg"
              prefetch={true}
            >
              <Search size={20} />
              {t('home.cta.explore')}
            </LocalLink>
          </div>
          <p className="text-gray-700 text-sm mt-6 font-medium">{t('home.cta.note')}</p>
        </div>
      </section>
    </div>
    </>
  )
}

export const revalidate = 120
