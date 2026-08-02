import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase-server-client'
import { routing } from '@/i18n/routing'
import { Suspense } from 'react'
import { permanentRedirect } from 'next/navigation'
import ProductoPageClient from './ProductoPageClient'
import { getTranslations } from 'next-intl/server'
import Breadcrumbs from '@/components/Breadcrumbs'
import LocalLink from '@/components/LocalLink'
import { isUuid } from '@/lib/product-url'
import { getCiudadByMunicipioYEstado } from '@/lib/ubicaciones-seo'

// IMPORTANTE — Ruta DINÁMICA a propósito: ver el comentario en
// src/app/[locale]/[ciudad]/page.tsx. Con generateStaticParams + revalidate
// (ISR), cualquier producto fuera del top-100 prerenderizado (productos
// viejos o publicados después del deploy) se renderizaba "on-demand" en modo
// static-generation y lanzaba DYNAMIC_SERVER_USAGE → 500 en /producto/[slug].
// Sin generateStaticParams la página se sirve por SSR dinámico (como la home
// y /catalogo) y funciona para TODOS los productos.

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

// ISR on-demand: cachea la página renderizada 5 minutos para evitar que cada
// visita/rastreo de Google re-ejecute el render + queries a Supabase (TTFB alto).
// Sin generateStaticParams a propósito (ver comentario de la ruta: eso causaba
// DYNAMIC_SERVER_USAGE → 500). Solo con revalidate se sirve estático y se
// regenera bajo demanda. Requiere Supabase configurado en el entorno de build.
export const revalidate = 300

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
  especificaciones,
  ubicacion_estado,
  ubicacion_ciudad,
  activo,
  visitas,
  creado_en,
  user_id,
  imagen_url,
  imagenes,
  metodos_contacto,
  destacado,
  destacado_hasta,
  boosteado_en
`

const PRODUCT_COLUMNS_LEGACY = PRODUCT_COLUMNS.replace(/\n\s*slug,/, '')

// Sin `especificaciones`: para bases donde la migración 025 aún no se aplicó.
// PostgREST responde 42703 y rechaza el SELECT entero si se pide una columna
// inexistente, así que hay que poder reintentar sin ella.
const PRODUCT_COLUMNS_SIN_SPECS = PRODUCT_COLUMNS.replace(/\n\s*especificaciones,/, '')
const PRODUCT_COLUMNS_LEGACY_SIN_SPECS = PRODUCT_COLUMNS_LEGACY.replace(/\n\s*especificaciones,/, '')

const faltaColumna = (error: any, columna: string) =>
  !!error && new RegExp(columna, 'i').test(error.message || '')

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
    if (faltaColumna(error, 'especificaciones')) {
      ;({ data, error } = await queryProducto('id', slugOrId, PRODUCT_COLUMNS_SIN_SPECS))
    }
    if (faltaColumna(error, 'slug')) {
      ;({ data, error } = await queryProducto('id', slugOrId, PRODUCT_COLUMNS_LEGACY))
      if (faltaColumna(error, 'especificaciones')) {
        ;({ data, error } = await queryProducto('id', slugOrId, PRODUCT_COLUMNS_LEGACY_SIN_SPECS))
      }
    }
  } else {
    // URL canónica con slug SEO
    ;({ data, error } = await queryProducto('slug', slugOrId, PRODUCT_COLUMNS))
    if (faltaColumna(error, 'especificaciones')) {
      ;({ data, error } = await queryProducto('slug', slugOrId, PRODUCT_COLUMNS_SIN_SPECS))
    }
    if (faltaColumna(error, 'slug')) {
      // Migración de slugs aún no aplicada en la DB: intenta por id
      ;({ data, error } = await queryProducto('id', slugOrId, PRODUCT_COLUMNS_LEGACY))
      if (faltaColumna(error, 'especificaciones')) {
        ;({ data, error } = await queryProducto('id', slugOrId, PRODUCT_COLUMNS_LEGACY_SIN_SPECS))
      }
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
    .select('nombre, ciudad, estado')
    .eq('id', data.user_id)
    .maybeSingle()

  return { ...data, perfil: perfil ? { ...perfil, nombre_completo: perfil.nombre } : null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const producto = await getProduct(slug)

  if (!producto) {
    return { title: 'No encontrado' }
  }

  // La canonical SIEMPRE usa el slug SEO aunque se haya entrado por UUID
  const canonicalSlug = producto.slug || slug

  const parts = [producto.titulo]
  if (producto.precio_usd) {
    parts.push(`$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(producto.precio_usd))}`)
  }
  const ubicacion = [producto.ubicacion_ciudad, producto.ubicacion_estado].filter(Boolean).join(', ')
  if (ubicacion) parts.push(ubicacion)
  // Sin marca aquí: el template del layout raíz (%s | VendeT) la agrega una sola vez.

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

  // Encontrar ciudad SEO para la ubicación
  const ciudadSEO = producto.ubicacion_ciudad 
    ? getCiudadByMunicipioYEstado(producto.ubicacion_ciudad, producto.ubicacion_estado || '') 
    : undefined

  // Breadcrumb items
  const breadcrumbItems = [
    { label: producto.subcategoria || 'Categoría', href: `/catalogo?subcategoria=${producto.subcategoria}` },
    { 
      label: ciudadSEO ? ciudadSEO.nombre : (producto.ubicacion_ciudad || 'Ubicación'), 
      href: ciudadSEO ? `/${ciudadSEO.slug}` : `/catalogo?ciudad=${producto.ubicacion_ciudad}` 
    },
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