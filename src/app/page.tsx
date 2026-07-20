import { supabase } from '@/lib/supabase'
import { HomePageClient } from '@/components/HomePageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clasificados Venezuela | VendeT.online - Compra y Venta en Venezuela',
  description: 'El mejor portal de clasificados en Venezuela. Compra y vende carros, tecnología, moda, hogar y más. Publica gratis, contacta directo sin comisiones. Marketplace venezolano líder.',
  keywords: ['clasificados venezuela', 'compra venta venezuela', 'marketplace venezuela', 'vender en venezuela', 'clasificados online', 'tienda online venezuela', 'productos venezuela'],
  openGraph: {
    title: 'Clasificados Venezuela | VendeT.online',
    description: 'El mejor portal de clasificados en Venezuela. Compra y vende lo que quieras sin comisiones.',
    url: 'https://vendet.online',
    siteName: 'VendeT.online',
    locale: 'es_VE',
    type: 'website',
    images: [
      {
        url: '/og-image.webp',
        width: 1584,
        height: 672,
        alt: 'VendeT — Clasificados Venezuela. Compra y venta sin comisiones.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clasificados Venezuela | VendeT.online',
    description: 'El mejor portal de clasificados en Venezuela. Publica gratis, contacta directo.',
  },
  alternates: {
    canonical: 'https://vendet.online',
  },
}

async function getDestacados(limit = 8) {
  try {
    const { data, error } = await supabase.rpc('obtener_destacados_home', { p_limite: limit })
    if (!error && data) return data as any[]

    const { data: data2 } = await supabase
      .from('productos')
      .select('id, titulo, precio_usd, estado, imagen_url, ubicacion_ciudad, destacado, destacado_hasta')
      .eq('estado', 'activo')
      .eq('estado_moderacion', 'aprobado')
      .not('destacado_hasta', 'is', null)
      .gt('destacado_hasta', new Date().toISOString())
      .order('destacado_hasta', { ascending: false })
      .limit(limit)
    return (data2 || []) as any[]
  } catch {
    return []
  }
}

export default async function Home() {
  const destacados = await getDestacados(8)
  return <HomePageClient destacados={destacados} />
}

export const revalidate = 120