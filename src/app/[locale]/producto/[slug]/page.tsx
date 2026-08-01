import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { routing } from '@/i18n/routing'
import { Suspense } from 'react'
import { permanentRedirect } from 'next/navigation'
import ProductoPageClient from './ProductoPageClient'
import { getTranslations } from 'next-intl/server'
import Breadcrumbs from '@/components/Breadcrumbs'
import LocalLink from '@/components/LocalLink'
import { isUuid } from '@/lib/product-url'

// ISR: cache product pages for 5 minutes
export const revalidate = 300

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

const PRODUCT_COLUMNS = `
  id,
  slug,
  titulo,
  descripcion,
  precio_usd,
  estado,
  categoria_id,
  subcategoria,
  marca,
  modelo,
  ubicacion_estado,
  ubicacion_ciudad,
  activo,
  visitas,
  creado_en,
  user_id,
  imagen_url,
  destacado,
  destacado_hasta,
  boosteado_en
`

const PRODUCT_COLUMNS_LEGACY = PRODUCT_COLUMNS.replace(/\n\s*slug,/, '')

function queryProducto(column: 'id' | 'slug', value: string, columns: string) {
  return supabase
    .from('productos')
    .select(columns)
    .eq(column, value)
    .eq('activo', true)
    // Check for approved status, pending (still show), or null (default to approved)
    .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado,estado_moderacion.eq.pendiente')
    .maybeSingle()
}

async function getProduct(slugOrId: string) {
  // Validate param format first to avoid unnecessary DB queries
  if (!slugOrId || typeof slugOrId !== 'string' || slugOrId.length < 3) {
    return null
  }

  let data: any = null
  let error: any = null

  if (isUuid(slugOrId)) {
    // URL legacy con UUID
    ;({ data, error } = await queryProducto('id', slugOrId, PRODUCT_COLUMNS))
    if (error && /slug/i.test(error.message || '')) {
      ;({ data, error } = await queryProducto('id', slugOrId, PRODUCT_COLUMNS_LEGACY))
    }
  } else {
    // URL canónica con slug SEO
    ;({ data, error } = await queryProducto('slug', slugOrId, PRODUCT_COLUMNS))
    if (error && /slug/i.test(error.message || '')) {
      // Migración de slugs aún no aplicada en la DB: intenta por id
      ;({ data, error } = await queryProducto('id', slugOrId, PRODUCT_COLUMNS_LEGACY))
    }
  }

  if (error || !data) {
    // Avoid logging expected missing/inactive products during ISR generation.
    if (error) {
      console.error('Error fetching product:', error.code || error.message, 'Slug:', slugOrId)
    }
    return null
  }

  // productos.user_id references auth.users, not perfiles. PostgREST can only embed
  // tables connected by a real FK, so load the public seller profile separately.
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, telefono, ciudad, estado')
    .eq('id', data.user_id)
    .maybeSingle()

  return { ...data, perfil: perfil ? { ...perfil, nombre_completo: perfil.nombre } : null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const producto = await getProduct(slug)

  if (!producto) {
    return { title: 'No encontrado | VendeT-Venezuela' }
  }

  // La canonical SIEMPRE usa el slug SEO aunque se haya entrado por UUID
  const canonicalSlug = producto.slug || slug

  const parts = [producto.titulo]
  if (producto.precio_usd) {
    parts.push(`$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(producto.precio_usd))}`)
  }
  const ubicacion = [producto.ubicacion_ciudad, producto.ubicacion_estado].filter(Boolean).join(', ')
  if (ubicacion) parts.push(ubicacion)
  parts.push('VendeT-Venezuela')

  const title = parts.join(' — ')

  const desc = producto.descripcion
    ? producto.descripcion.slice(0, 155).replace(/\n/g, ' ')
    : `${producto.estado || 'Producto'} en venta ${ubicacion ? 'en ' + ubicacion : 'en Venezuela'}`

  const image = producto.imagen_url
    ? [{ url: producto.imagen_url, width: 800, height: 600, alt: producto.titulo }]
    : undefined

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'article',
      images: image,
      locale: 'es_VE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: image,
    },
    alternates: {
      canonical: `https://vendet.online/producto/${canonicalSlug}`,
      languages: {
        'es-VE': `https://vendet.online/producto/${canonicalSlug}`,
        en: `https://vendet.online/en/producto/${canonicalSlug}`,
        'x-default': `https://vendet.online/producto/${canonicalSlug}`,
      },
    },
  }
}

// Enable dynamic parameters to handle products not included in static generation
export const dynamicParams = true;

export async function generateStaticParams() {
  // Pre-render the 100 most recent products for SSG in both locales.
  // Usa slug cuando exista; si la migración no corrió aún, cae al UUID.
  const moderacion = 'estado_moderacion.is.null,estado_moderacion.eq.aprobado,estado_moderacion.eq.pendiente'
  let data: any[] | null = null

  const withSlug = await supabase
    .from('productos')
    .select('id, slug')
    .eq('activo', true)
    .or(moderacion)
    .order('creado_en', { ascending: false })
    .limit(100)

  if (withSlug.error) {
    const legacy = await supabase
      .from('productos')
      .select('id')
      .eq('activo', true)
      .or(moderacion)
      .order('creado_en', { ascending: false })
      .limit(100)
    data = legacy.data
  } else {
    data = withSlug.data
  }

  const locales = routing.locales
  return (data || []).flatMap((p: any) =>
    locales.map((locale) => ({ locale, slug: p.slug || p.id }))
  )
}

export default async function ProductoPage({ params }: Props) {
  const { locale, slug } = await params
  const producto = await getProduct(slug)
  const t = await getTranslations('productDetail')

  // 301 permanente: URLs legacy con UUID o con slug viejo → slug canónico.
  // Transfiere el link equity acumulado a las nuevas URLs semánticas.
  if (producto?.slug && producto.slug !== slug) {
    const canonicalPath = `/producto/${producto.slug}`
    permanentRedirect(
      locale === routing.defaultLocale ? canonicalPath : `/${locale}${canonicalPath}`
    )
  }

  if (!producto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('notFound')}</h1>
        <p className="text-gray-500 mb-8">{t('notFoundDesc')}</p>
        <LocalLink href="/" className="inline-block bg-brand-primary text-white px-8 py-3 rounded-lg font-bold">{t('backHome')}</LocalLink>
      </div>
    )
  }

  // JSON-LD Product Schema
  const sellerName = producto.perfil?.nombre_completo || 'Vendedor VendeT';
  const sellerPhone = producto.perfil?.telefono;
  const sellerCity = producto.perfil?.ciudad || producto.ubicacion_ciudad || '';
  const sellerState = producto.perfil?.estado || producto.ubicacion_estado || '';
  
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://vendet.online/producto/${producto.slug || slug}`,
    name: producto.titulo,
    description: producto.descripcion?.slice(0, 500) || producto.titulo,
    image: producto.imagen_url ? [producto.imagen_url] : [],
    url: `https://vendet.online/producto/${producto.slug || slug}`,
    sku: producto.id,
    offers: {
      '@type': 'Offer',
      price: producto.precio_usd || 0,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Person',
        name: sellerName,
        ...(sellerPhone && { telephone: sellerPhone }),
        address: {
          '@type': 'PostalAddress',
          addressLocality: sellerCity,
          addressRegion: sellerState,
          addressCountry: 'VE',
        },
      },
    },
    category: producto.subcategoria || '',
    itemCondition: 'https://schema.org/' + (producto.estado === 'Nuevo' ? 'NewCondition' : 'UsedCondition'),
    address: {
      '@type': 'PostalAddress',
      addressLocality: producto.ubicacion_ciudad || '',
      addressRegion: producto.ubicacion_estado || '',
      addressCountry: 'VE',
    },
  }

  // Breadcrumb items
  const breadcrumbItems = [
    { label: producto.subcategoria || 'Categoría', href: `/catalogo?subcategoria=${producto.subcategoria}` },
    { label: producto.ubicacion_ciudad || 'Ubicación', href: `/${producto.ubicacion_ciudad?.toLowerCase().normalize('NFD').replace(/[^\u0300-\u036f\s]/g, '').replace(/\s+/g, '-')}` },
    { label: producto.titulo, href: undefined }
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center">{t('loading')}</div>}>
        <ProductoPageClient initialProduct={producto} />
      </Suspense>
    </>
  )
}