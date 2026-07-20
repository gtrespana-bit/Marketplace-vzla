import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { routing } from '@/i18n/routing'
import { Suspense } from 'react'
import ProductoPageClient from './ProductoPageClient'
import { getTranslations } from 'next-intl/server'

// ISR: cache product pages for 5 minutes
export const revalidate = 300

type Props = {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  // Validate slug format first to avoid unnecessary DB queries
  if (!slug || typeof slug !== 'string' || slug.length < 10) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('productos')
    .select(`
      id, 
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
      boosteado_en,
      perfil:perfiles (
        nombre_completo,
        telefono,
        ciudad,
        estado
      )
    `)
    .eq('id', slug)
    .eq('activo', true)
    // Check for approved status, pending (still show), or null (default to approved)
    .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado,estado_moderacion.eq.pendiente')
    .single()
  
  if (error || !data) {
    console.error('Error fetching product:', error, 'Slug:', slug);
    return null;
  }
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const producto = await getProduct(slug)

  if (!producto) {
    return { title: 'No encontrado | VendeT-Venezuela' }
  }

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
      canonical: `https://vendet.online/producto/${slug}`,
      languages: {
        es: `https://vendet.online/producto/${slug}`,
        en: `https://vendet.online/en/producto/${slug}`,
      },
    },
  }
}

// Enable dynamic parameters to handle products not included in static generation
export const dynamicParams = true;

export async function generateStaticParams() {
  // Pre-render the 100 most recent products for SSG in both locales
  const { data } = await supabase
    .from('productos')
    .select('id')
    .eq('activo', true)
    .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado,estado_moderacion.eq.pendiente')
    .order('creado_en', { ascending: false })
    .limit(100)

  const locales = routing.locales
  return (data || []).flatMap((p: any) =>
    locales.map((locale) => ({ locale, slug: p.id }))
  )
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params
  const producto = await getProduct(slug)
  const t = await getTranslations('productDetail')

  if (!producto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('notFound')}</h1>
        <p className="text-gray-500 mb-8">{t('notFoundDesc')}</p>
        <a href="/" className="inline-block bg-brand-primary text-white px-8 py-3 rounded-lg font-bold">{t('backHome')}</a>
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
    name: producto.titulo,
    description: producto.descripcion?.slice(0, 500) || producto.titulo,
    image: producto.imagen_url ? [producto.imagen_url] : [],
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center">{t('loading')}</div>}>
        <ProductoPageClient initialProduct={producto} />
      </Suspense>
    </>
  )
}