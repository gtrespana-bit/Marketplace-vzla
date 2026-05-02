import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'
import ProductoPageClient from './ProductoPageClient'

type Props = {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', slug)
    .eq('activo', true)
    .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')
    .single()
  if (error || !data) return null
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const producto = await getProduct(slug)

  if (!producto) {
    return { title: 'No encontrado | VendeT-Venezuela' }
  }

  const parts = [producto.titulo]
  if (producto.precio_usd) {
    parts.push(`$${Number(producto.precio_usd).toLocaleString()}`)
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
    alternates: { canonical: `https://vendet.online/producto/${slug}` },
  }
}

export async function generateStaticParams() {
  // Pre-render los 100 productos más recientes para SSG
  const { data } = await supabase
    .from('productos')
    .select('id')
    .eq('activo', true)
    .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')
    .order('creado_en', { ascending: false })
    .limit(100)

  return (data || []).map((p: any) => ({ slug: p.id }))
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params
  const producto = await getProduct(slug)

  if (!producto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
        <p className="text-gray-500 mb-8">Este producto ya no está disponible.</p>
        <a href="/" className="inline-block bg-brand-blue text-white px-8 py-3 rounded-lg font-bold">Volver al inicio</a>
      </div>
    )
  }

  // JSON-LD Product Schema
  const jsonLd = {
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
        '@type': 'Organization',
        name: producto.seller_nombre || 'VendeT-Venezuela',
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
      <ProductoPageClient initialProduct={producto} />
    </>
  )
}
