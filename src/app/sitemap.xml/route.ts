import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const baseUrl = 'https://vende-t.com'

  // Fetch all active products
  const { data: products } = await supabase
    .from('productos')
    .select('id, titulo, updated_at, creado_en')
    .eq('activo', true)
    .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')
    .order('creado_en', { ascending: false })
    .limit(5000)

  // Static pages
  const staticPages = [
    { path: '', priority: '1.0' },
    { path: 'catalogo', priority: '0.9' },
    { path: 'blog', priority: '0.8' },
    { path: 'como-funciona', priority: '0.7' },
    { path: 'sobre-nosotros', priority: '0.7' },
    { path: 'faq', priority: '0.6' },
    { path: 'contacto', priority: '0.6' },
    { path: 'terminos-y-condiciones', priority: '0.4' },
    { path: 'politica-de-privacidad', priority: '0.4' },
  ]

  // Categories
  const categories = ['vehiculos', 'tecnologia', 'moda', 'hogar', 'herramientas', 'materiales', 'repuestos', 'otros']

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`

  // Static pages (both ES and EN)
  for (const page of staticPages) {
    xml += `  <url>\n`
    xml += `    <loc>${baseUrl}/${page.path}</loc>\n`
    xml += `    <xhtml:link rel="alternate" hreflang="es" href="${baseUrl}/${page.path}" />\n`
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/${page.path}" />\n`
    xml += `    <priority>${page.priority}</priority>\n`
    xml += `  </url>\n`
  }

  // Category pages
  for (const cat of categories) {
    xml += `  <url>\n`
    xml += `    <loc>${baseUrl}/catalogo?categoria=${cat}</loc>\n`
    xml += `    <xhtml:link rel="alternate" hreflang="es" href="${baseUrl}/catalogo?categoria=${cat}" />\n`
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/catalogo?categoria=${cat}" />\n`
    xml += `    <priority>0.8</priority>\n`
    xml += `  </url>\n`
  }

  // Products (both ES and EN)
  for (const p of (products || [])) {
    const lastMod = p.updated_at || p.creado_en || new Date().toISOString()
    const slug = p.titulo
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)

    xml += `  <url>\n`
    xml += `    <loc>${baseUrl}/producto/${p.id}</loc>\n`
    xml += `    <xhtml:link rel="alternate" hreflang="es" href="${baseUrl}/producto/${p.id}" />\n`
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/producto/${p.id}" />\n`
    xml += `    <lastmod>${lastMod.slice(0, 10)}</lastmod>\n`
    xml += `    <priority>0.7</priority>\n`
    xml += `  </url>\n`
  }

  xml += `</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
