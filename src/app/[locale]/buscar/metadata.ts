import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

interface SearchMetadataProps {
  searchParams: Promise<{
    q?: string
    categoria?: string
    estado?: string
    ciudad?: string
    [key: string]: string | undefined
  }>
}

export async function generateMetadata({ searchParams }: SearchMetadataProps): Promise<Metadata> {
  const params = await searchParams
  const t = await getTranslations('search')
  
  const query = params.q || ''
  const categoria = params.categoria || ''
  const estado = params.estado || ''
  const ciudad = params.ciudad || ''
  
  // Construir título dinámico
  let titleParts: string[] = []
  if (query) titleParts.push(`"${query}"`)
  if (categoria) titleParts.push(categoria)
  if (ciudad) titleParts.push(ciudad)
  else if (estado) titleParts.push(estado)
  
  const titleSuffix = titleParts.length > 0 ? `${titleParts.join(' en ')} | ` : ''
  const title = `${titleSuffix}Clasificados Venezuela | VendeT.online`
  
  // Construir descripción dinámica
  let description = 'Busca y encuentra los mejores clasificados en Venezuela. '
  if (query) {
    description += `Resultados para "${query}". `
  }
  if (categoria) {
    description += `Explora ${categoria} en VendeT.online. `
  }
  if (ciudad || estado) {
    description += `Productos en ${ciudad || estado}, Venezuela. `
  }
  description += 'Compra y vende gratis en el marketplace líder de Venezuela.'
  
  // Construir canonical URL
  const baseUrl = 'https://vende-t.com/buscar'
  const urlParams = new URLSearchParams()
  if (query) urlParams.set('q', query)
  if (categoria) urlParams.set('categoria', categoria)
  if (estado) urlParams.set('estado', estado)
  if (ciudad) urlParams.set('ciudad', ciudad)
  const canonical = urlParams.toString() ? `${baseUrl}?${urlParams.toString()}` : baseUrl
  
  return {
    title,
    description,
    keywords: query 
      ? [query, 'clasificados venezuela', 'compra venta', 'marketplace', 'vender online']
      : ['clasificados venezuela', 'buscar productos', 'compra venta', 'marketplace venezuela'],
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'VendeT.online',
      locale: 'es_VE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
