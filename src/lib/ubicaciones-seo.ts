// Datos SEO optimizados para ciudades de Venezuela
// Genera metadata única para cada combinación ciudad/categoría

import { MUNICIPIOS_POR_ESTADO, ESTADOS } from './ubicaciones'

export interface CiudadSEO {
  slug: string
  nombre: string
  municipio?: string
  estado: string
  descripcion: string
  keywords: string[]
  titulo: string
}

// Generar todas las ciudades con su información SEO
const slugMap = new Map<string, number>()

// Primera pasada: contar ocurrencias de cada slug base y deduplicar intra-estado
const tempCiudades: Array<{
  baseSlug: string
  nombre: string
  municipio: string
  estado: string
  descripcion: string
  keywords: string[]
  titulo: string
}> = []

ESTADOS.forEach((estado) => {
  const municipios = MUNICIPIOS_POR_ESTADO[estado] || []
  municipios.forEach((municipio) => {
    // Evitar añadir la misma capital dos veces para el mismo estado (p. ej. Falcón Píritu o Monagas Santa Bárbara)
    const yaExisteEnEstado = tempCiudades.some(c => c.nombre === municipio.capital && c.estado === estado)
    if (yaExisteEnEstado) return

    const baseSlug = municipio.capital.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    
    // Contar ocurrencia
    slugMap.set(baseSlug, (slugMap.get(baseSlug) || 0) + 1)

    tempCiudades.push({
      baseSlug,
      nombre: municipio.capital,
      municipio: municipio.nombre,
      estado,
      titulo: `Clasificados en ${municipio.capital}, ${estado} | VendeT.online`,
      descripcion: `Compra y vende en ${municipio.capital}, ${estado}. Miles de anuncios clasificados: carros, casas, celulares, empleo y más. Publica gratis en VendeT.online.`,
      keywords: [
        `clasificados ${municipio.capital}`,
        `compra venta ${municipio.capital}`,
        `marketplace ${estado}`,
        `anuncios ${municipio.capital}`,
        `vender en ${municipio.capital}`,
        `productos usados ${municipio.capital}`,
        `${municipio.capital} ${estado}`
      ]
    })
  })
})

// Segunda pasada: generar la lista final CIUDADES_SEO aplicando slugs únicos para duplicados entre estados
export const CIUDADES_SEO: CiudadSEO[] = tempCiudades.map((c) => {
  const count = slugMap.get(c.baseSlug) || 0
  let finalSlug = c.baseSlug

  if (count > 1) {
    const estadoSlug = c.estado.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    finalSlug = `${c.baseSlug}-${estadoSlug}`
  }

  return {
    slug: finalSlug,
    nombre: c.nombre,
    municipio: c.municipio,
    estado: c.estado,
    descripcion: c.descripcion,
    keywords: c.keywords,
    titulo: c.titulo
  }
})

// Helper para buscar ciudad por slug
export function getCiudadBySlug(slug: string): CiudadSEO | undefined {
  return CIUDADES_SEO.find(c => c.slug === slug)
}

// Helper para buscar ciudad por municipio o capital
export function getCiudadByMunicipio(municipio: string): CiudadSEO | undefined {
  if (!municipio) return undefined
  const normalizedMuni = municipio.trim().toLowerCase()
  return CIUDADES_SEO.find(c => c.municipio?.trim().toLowerCase() === normalizedMuni || c.nombre.trim().toLowerCase() === normalizedMuni)
}

// Helper para buscar ciudad por municipio/capital y estado de forma exacta
export function getCiudadByMunicipioYEstado(municipio: string, estado: string): CiudadSEO | undefined {
  if (!municipio) return undefined
  const normalizedMuni = municipio.trim().toLowerCase()
  const normalizedEstado = estado?.trim().toLowerCase()
  return CIUDADES_SEO.find(c => 
    (c.municipio?.trim().toLowerCase() === normalizedMuni || c.nombre.trim().toLowerCase() === normalizedMuni) &&
    (!normalizedEstado || c.estado.trim().toLowerCase() === normalizedEstado)
  )
}

// Helper para obtener todas las ciudades de un estado
export function getCiudadesPorEstado(estado: string): CiudadSEO[] {
  return CIUDADES_SEO.filter(c => c.estado === estado)
}

// Helper para generar rutas estáticas (clave = nombre del segmento [ciudad])
export function generateCityParams() {
  return CIUDADES_SEO.map(ciudad => ({
    ciudad: ciudad.slug
  }))
}

// Helper para categorías populares por ciudad
export const CATEGORIAS_POPULARES = [
  'vehiculos',
  'inmuebles', 
  'electronicos',
  'hogar',
  'moda',
  'deportes',
  'empleo',
  'servicios'
]

// Generar combinaciones ciudad-categoría para SEO programático
export function generateCityCategoryParams(): Array<{ ciudad: string; categoria: string }> {
  const params: Array<{ ciudad: string; categoria: string }> = []
  for (const ciudad of CIUDADES_SEO) {
    for (const categoria of CATEGORIAS_POPULARES) {
      params.push({
        ciudad: ciudad.slug,
        categoria: categoria
      })
    }
  }
  return params
}
