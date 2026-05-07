import { supabase } from '@/lib/supabase'
import { MetadataRoute } from 'next'

const BASE_URL = 'https://vendet.online'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${BASE_URL}/catalogo`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE_URL}/publicar`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.8 },
    { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.7 },
    { url: `${BASE_URL}/como-funciona`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE_URL}/sobre-nosotros`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/contacto`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${BASE_URL}/terminos-y-condiciones`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${BASE_URL}/politica-de-privacidad`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  // Páginas de ciudad (SEO local)
  const ciudades = [
    'caracas', 'maracaibo', 'valencia', 'barquisimeto', 'maracay',
    'ciudad-guayana', 'cumana', 'merida', 'san-cristobal', 'petare',
  ]
  const categorySlugs = [
    'vehiculos', 'tecnologia', 'moda', 'hogar', 'herramientas',
    'materiales', 'repuestos', 'otros',
  ]

  const ciudadPages = ciudades.map(c => ({
    url: `${BASE_URL}/${c}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const ciudadCategoriaPages = ciudades.flatMap(c =>
    categorySlugs.map(cat => ({
      url: `${BASE_URL}/${c}/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  // Productos activos
  const { data: productos } = await supabase
    .from('productos')
    .select('id, creado_en, actualizado_en')
    .eq('activo', true)
    .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')
  
  const productoPages = (productos || []).map((p: any) => ({
    url: `${BASE_URL}/producto/${p.id}`,
    lastModified: new Date(p.actualizado_en || p.creado_en),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...ciudadPages, ...ciudadCategoriaPages, ...productoPages]
}
