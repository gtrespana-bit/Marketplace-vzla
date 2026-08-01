import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { CIUDADES_SEO, CATEGORIAS_POPULARES } from '@/lib/ubicaciones-seo'

const BASE_URL = 'https://vendet.online'

// ÚNICO sitemap del sitio. No crear otro en [locale]/.
// El blog vive en src/content/blog/*.md (fs), NO en una tabla de Supabase:
// la versión anterior consultaba `blog_posts` en la DB y devolvía 0 URLs.

function getBlogSlugs(): { slug: string; lastModified: Date }[] {
  const dir = path.join(process.cwd(), 'src/content/blog')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '')
      let lastModified = new Date()
      try {
        const raw = fs.readFileSync(path.join(dir, f), 'utf-8')
        const m = raw.match(/^date:\s*(.+)$/m)
        if (m) {
          const d = new Date(m[1].trim())
          if (!isNaN(d.getTime())) lastModified = d
        }
      } catch {
        // usar fecha actual
      }
      return { slug, lastModified }
    })
}

// Productos activos. Intenta leer `slug` (migración de URLs semánticas);
// si la columna aún no existe, cae a id para no dejar el sitemap vacío.
async function getProductos(supabase: any) {
  const moderacion = 'estado_moderacion.is.null,estado_moderacion.eq.aprobado'
  const withSlug = await supabase
    .from('productos')
    .select('id, slug, user_id, actualizado_en')
    .eq('activo', true)
    .or(moderacion)
    .limit(9000)

  if (!withSlug.error) return withSlug.data || []

  const fallback = await supabase
    .from('productos')
    .select('id, user_id, actualizado_en')
    .eq('activo', true)
    .or(moderacion)
    .limit(9000)

  return fallback.data || []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ── URLs estáticas (páginas indexables y públicas) ──────────────────
  const staticPaths: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
    { path: '', changeFrequency: 'daily', priority: 1 },
    { path: '/en', changeFrequency: 'daily', priority: 0.8 },
    { path: '/catalogo', changeFrequency: 'daily', priority: 0.9 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/publicar', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/creditos', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/como-funciona', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/como-instalar-app', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/contacto', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/faq', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/sobre-nosotros', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/terminos-y-condiciones', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/politica-de-privacidad', changeFrequency: 'yearly', priority: 0.3 },
  ]
  const staticUrls: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  // ── Landing pages de ciudad (SEO local) ──────────────────────────────
  const cityUrls: MetadataRoute.Sitemap = CIUDADES_SEO.map((ciudad) => ({
    url: `${BASE_URL}/${ciudad.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // ── Landing pages ciudad + categoría (SEO programático) ──────────────
  const cityCategoryUrls: MetadataRoute.Sitemap = []
  for (const ciudad of CIUDADES_SEO) {
    for (const categoria of CATEGORIAS_POPULARES) {
      cityCategoryUrls.push({
        url: `${BASE_URL}/${ciudad.slug}/${categoria}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    }
  }

  // ── Blog (desde src/content/blog) ────────────────────────────────────
  const blogUrls: MetadataRoute.Sitemap = getBlogSlugs().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // ── Productos y vendedores (dinámico) ────────────────────────────────
  let dynamicUrls: MetadataRoute.Sitemap = []
  try {
    const productos = await getProductos(supabase)

    const productUrls: MetadataRoute.Sitemap = productos.map((p: any) => ({
      url: `${BASE_URL}/producto/${p.slug || p.id}`,
      lastModified: new Date(p.actualizado_en || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Vendedores con al menos un producto activo (perfiles indexables)
    const vendorIds = [
      ...new Set((productos as any[]).map((p) => p.user_id).filter(Boolean)),
    ].slice(0, 2000)
    const vendorUrls: MetadataRoute.Sitemap = vendorIds.map((id) => ({
      url: `${BASE_URL}/vendedor/${id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))

    dynamicUrls = [...productUrls, ...vendorUrls]
  } catch {
    // Si Supabase falla, servir al menos las URLs estáticas
  }

  return [...staticUrls, ...cityUrls, ...cityCategoryUrls, ...blogUrls, ...dynamicUrls]
}
