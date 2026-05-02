import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE = 'https://vendet.online'

// Ciudades principales de Venezuela por población
const CIUDADES = [
  { slug: 'caracas', nombre: 'Caracas', estado: 'Distrito Capital' },
  { slug: 'maracaibo', nombre: 'Maracaibo', estado: 'Zulia' },
  { slug: 'valencia', nombre: 'Valencia', estado: 'Carabobo' },
  { slug: 'barquisimeto', nombre: 'Barquisimeto', estado: 'Lara' },
  { slug: 'maracay', nombre: 'Maracay', estado: 'Aragua' },
  { slug: 'ciudad-guayana', nombre: 'Ciudad Guayana', estado: 'Bolívar' },
  { slug: 'cumaná', nombre: 'Cumaná', estado: 'Sucre' },
  { slug: 'merida', nombre: 'Mérida', estado: 'Mérida' },
  { slug: 'san-cristobal', nombre: 'San Cristóbal', estado: 'Táchira' },
  { slug: 'petare', nombre: 'Petare', estado: 'Miranda' },
]

const CATEGORIAS = [
  { slug: 'vehiculos', nombre: 'Vehículos' },
  { slug: 'tecnologia', nombre: 'Tecnología' },
  { slug: 'moda', nombre: 'Moda' },
  { slug: 'hogar', nombre: 'Hogar' },
  { slug: 'herramientas', nombre: 'Herramientas' },
  { slug: 'materiales', nombre: 'Materiales' },
  { slug: 'repuestos', nombre: 'Repuestos' },
  { slug: 'otros', nombre: 'Otros' },
]

const PAGINAS_ESTATICAS = [
  '',
  '/catalogo',
  '/buscar',
  '/como-funciona',
  '/faq',
  '/contacto',
  '/sobre-nosotros',
  '/terminos-y-condiciones',
  '/politica-de-privacidad',
  '/creditos',
]

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

const CHANGE_FREQ_PRODUCTO: ChangeFreq = 'daily'
const CHANGE_FREQ_PAGINA: ChangeFreq = 'monthly'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // --- Páginas estáticas ---
  for (const p of PAGINAS_ESTATICAS) {
    entries.push({
      url: `${BASE}${p}`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQ_PAGINA,
      priority: p === '' ? 1 : 0.8,
    })
  }

  // --- Páginas de ciudades ---
  for (const c of CIUDADES) {
    entries.push({
      url: `${BASE}/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })
    // --- Ciudad + categoría ---
    for (const cat of CATEGORIAS) {
      entries.push({
        url: `${BASE}/${c.slug}/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  // --- Productos activos ---
  try {
    const { data: productos } = await supabase
      .from('productos')
      .select('id, actualizado_en')
      .eq('activo', true)
      .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')
      .order('actualizado_en', { ascending: false })

    if (productos) {
      for (const prod of productos) {
        entries.push({
          url: `${BASE}/producto/${prod.id}`,
          lastModified: new Date(prod.actualizado_en || Date.now()),
          changeFrequency: CHANGE_FREQ_PRODUCTO,
          priority: 0.6,
        })
      }
    }
  } catch (err) {
    console.error('Error fetching products for sitemap:', err)
  }

  return entries
}
