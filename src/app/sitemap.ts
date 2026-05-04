import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const CATEGORIAS = [
  'ver-todo', 'vehiculos', 'tecnologia', 'moda', 'hogar',
  'herramientas', 'materiales', 'repuestos', 'otros',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vendet.online'

  // Páginas estáticas
  const staticPages = [
    { path: '/', priority: 1.0 },
    { path: '/catalogo', priority: 0.9 },
    { path: '/buscar', priority: 0.8 },
    { path: '/publicar', priority: 0.9 },
    { path: '/creditos', priority: 0.7 },
    { path: '/como-funciona', priority: 0.6 },
    { path: '/faq', priority: 0.5 },
    { path: '/contacto', priority: 0.4 },
    { path: '/sobre-nosotros', priority: 0.3 },
    { path: '/terminos-y-condiciones', priority: 0.3 },
    { path: '/politica-de-privacidad', priority: 0.3 },
  ]

  // Landing pages de categorías
  const categoryPages = CATEGORIAS
    .filter(c => c !== 'ver-todo')
    .map(c => ({ path: `/catalogo?categoria=${c}`, priority: 0.7 }))

  // Productos activos (últimos 100, los más relevantes)
  let productPages: { path: string; priority: number }[] = []
  try {
    const { data } = await supabase
      .from('productos')
      .select('id, creado_en')
      .eq('activo', true)
      .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')
      .order('creado_en', { ascending: false })
      .limit(100)

    if (data) {
      productPages = data.map((p, i) => ({
        path: `/producto/${p.id}`,
        priority: i < 10 ? 0.8 : 0.6,
      }))
    }
  } catch {
    // Fallback silently
  }

  return [
    ...staticPages.map(p => ({
      url: `${baseUrl}${p.path}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: p.priority,
    })),
    ...categoryPages.map(p => ({
      url: `${baseUrl}${p.path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: p.priority,
    })),
    ...productPages.map(p => ({
      url: `${baseUrl}${p.path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: p.priority,
    })),
  ]
}
