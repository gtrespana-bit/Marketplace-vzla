import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // URLs estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    { url: 'https://vendet.online', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://vendet.online/en', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://vendet.online/catalogo', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://vendet.online/publicar', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://vendet.online/creditos', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://vendet.online/como-funciona', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://vendet.online/contacto', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://vendet.online/faq', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://vendet.online/sobre-nosotros', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://vendet.online/terminos-y-condiciones', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://vendet.online/politica-de-privacidad', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Obtener productos activos
  let productUrls: MetadataRoute.Sitemap = []
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select('id, actualizado_en')
      .eq('activo', true)
      .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')
      .limit(5000)

    if (!error && productos) {
      productUrls = productos.map(p => ({
        url: `https://vendet.online/producto/${p.id}`,
        lastModified: new Date(p.actualizado_en || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch {
    // Si falla, solo incluir URLs estáticas
  }

  return [...staticUrls, ...productUrls]
}
