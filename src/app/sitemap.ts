import type { MetadataRoute } from 'next'
import { getSupabaseServerClient } from '@/lib/supabase-server-client'
import fs from 'fs'
import path from 'path'
import { CIUDADES_SEO, CATEGORIAS_POPULARES } from '@/lib/ubicaciones-seo'
import { CATEGORIAS_SEO_LIST } from '@/lib/categorias-seo'
import {
  construirInventario,
  ciudadConInventario,
  ciudadCategoriaConInventario,
  MODERACION_FILTRO,
  type Inventario,
} from '@/lib/sitemap-inventario'

const BASE_URL = 'https://vendet.online'
const LAST_MODIFIED_DATE = new Date('2026-08-03')

/**
 * ⚠️ REGLA DE ORO DEL SITEMAP: aquí solo puede entrar lo que la página
 * declara `index,follow`.
 *
 * Antes se enviaban 2.888 URLs (330 ciudades + 2.640 ciudad/categoría +
 * productos + vendedores) mientras esas mismas páginas respondían
 * `noindex,follow` cuando no tenían inventario. Un sitemap lleno de URLs
 * noindex es una contradicción explícita: Google rastrea, ve "no index", y
 * aprende que el sitemap del dominio no es fiable. Eso degrada el rastreo de
 * TODO el sitio, incluidas las URLs buenas.
 *
 * Ahora se consulta el inventario real y solo se anuncian las combinaciones
 * con al menos un anuncio activo. La lógica vive en `lib/sitemap-inventario`
 * (probada con Jest) y es la misma regla que aplica `lib/seo-landings`.
 */
async function getInventario(supabase: any): Promise<Inventario | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('ubicacion_ciudad, categoria:categorias(nombre)')
      .eq('activo', true)
      .or(MODERACION_FILTRO)
      .limit(20000)

    if (error || !Array.isArray(data)) return null
    return construirInventario(data)
  } catch {
    return null
  }
}

function getBlogSlugs(): { slug: string; lastModified: Date }[] {
  const dir = path.join(process.cwd(), 'src/content/blog')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '')
      let lastModified = LAST_MODIFIED_DATE
      try {
        const raw = fs.readFileSync(path.join(dir, f), 'utf-8')
        const m = raw.match(/^date:\s*(.+)$/m)
        if (m) {
          const d = new Date(m[1].trim())
          if (!isNaN(d.getTime())) lastModified = d
        }
      } catch {
        // usar fecha de contingencia
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
    .limit(4000) // Reducir ligeramente para evitar límites de tamaño de sitemap

  if (!withSlug.error) return withSlug.data || []

  const fallback = await supabase
    .from('productos')
    .select('id, user_id, actualizado_en')
    .eq('activo', true)
    .or(moderacion)
    .limit(4000)

  return fallback.data || []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseServerClient()

  // Inventario real (una consulta). `null` = no se pudo saber → fail-open.
  const inv = await getInventario(supabase)

  // ── URLs estáticas (páginas indexables y públicas) ──────────────────
  const staticPaths: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
    { path: '', changeFrequency: 'daily', priority: 1 },
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

  // Solo se publican URLs en español. La versión /en permanece disponible
  // para usuarios, pero está fuera del índice mediante X-Robots-Tag.
  const staticUrls: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: LAST_MODIFIED_DATE,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  // ── Categorías principales con URL canónica propia ───────────────────
  const categoryUrls: MetadataRoute.Sitemap = CATEGORIAS_SEO_LIST.map((categoria) => ({
    url: `${BASE_URL}/categoria/${categoria.slug}`,
    lastModified: LAST_MODIFIED_DATE,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // ── Landing pages de ciudad (SEO local) ──────────────────────────────
  // Solo ciudades con anuncios: el resto responde noindex (ver seo-landings).
  const cityUrls: MetadataRoute.Sitemap = []
  CIUDADES_SEO.forEach((ciudad) => {
    if (!ciudadConInventario(inv, ciudad.nombre, ciudad.municipio)) return
    cityUrls.push({
      url: `${BASE_URL}/${ciudad.slug}`,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })
  })

  // ── Landing pages ciudad + categoría (SEO programático) ──────────────
  // Solo las combinaciones con inventario real. Enviar 2.640 URLs de páginas
  // que se autodeclaran noindex era el mayor desperdicio de crawl del sitio.
  const cityCategoryUrls: MetadataRoute.Sitemap = []
  for (const ciudad of CIUDADES_SEO) {
    for (const categoria of CATEGORIAS_POPULARES) {
      if (!ciudadCategoriaConInventario(inv, ciudad.nombre, ciudad.municipio, categoria)) continue
      cityCategoryUrls.push({
        url: `${BASE_URL}/${ciudad.slug}/${categoria}`,
        lastModified: LAST_MODIFIED_DATE,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    }
  }

  // ── Blog (desde src/content/blog) ────────────────────────────────────
  const blogUrls: MetadataRoute.Sitemap = []
  getBlogSlugs().forEach((post) => {
    blogUrls.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })
  })

  // ── Productos y vendedores (dinámico) ────────────────────────────────
  let dynamicUrls: MetadataRoute.Sitemap = []
  try {
    const productos = await getProductos(supabase)

    const productUrls: MetadataRoute.Sitemap = []
    productos.forEach((p: any) => {
      const rawDate = p.actualizado_en ? new Date(p.actualizado_en) : LAST_MODIFIED_DATE
      const validDate = isNaN(rawDate.getTime()) ? LAST_MODIFIED_DATE : rawDate

      productUrls.push({
        url: `${BASE_URL}/producto/${p.slug || p.id}`,
        lastModified: validDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })
    })

    // Vendedores con al menos un producto activo (perfiles indexables)
    const vendorIds = [
      ...new Set((productos as any[]).map((p) => p.user_id).filter(Boolean)),
    ].slice(0, 1000)
    
    const vendorUrls: MetadataRoute.Sitemap = []
    vendorIds.forEach((id) => {
      vendorUrls.push({
        url: `${BASE_URL}/vendedor/${id}`,
        lastModified: LAST_MODIFIED_DATE,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })
    })

    dynamicUrls = [...productUrls, ...vendorUrls]
  } catch {
    // Si Supabase falla, servir al menos las URLs estáticas
  }

  return [...staticUrls, ...categoryUrls, ...cityUrls, ...cityCategoryUrls, ...blogUrls, ...dynamicUrls]
}
