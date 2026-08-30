import { Metadata } from 'next'
import LandingCategoria from './LandingCategoria'
import { getCiudadBySlug } from '@/lib/ubicaciones-seo'
import Breadcrumbs from '@/components/Breadcrumbs'
import { getTranslations } from 'next-intl/server'

const CATEGORIAS_SEO: Record<string, { nombre: string; descripcion: string }> = {
  vehiculos: { 
    nombre: 'Vehículos', 
    descripcion: 'Carros, motos, camionetas y repuestos en venta'
  },
  tecnologia: { 
    nombre: 'Tecnología', 
    descripcion: 'Celulares, computadoras, tablets y accesorios'
  },
  moda: { 
    nombre: 'Moda', 
    descripcion: 'Ropa, zapatos, bolsos y accesorios de moda'
  },
  hogar: { 
    nombre: 'Hogar', 
    descripcion: 'Muebles, electrodomésticos y decoración para tu casa'
  },
  herramientas: { 
    nombre: 'Herramientas', 
    descripcion: 'Herramientas manuales, eléctricas y equipos industriales'
  },
  materiales: { 
    nombre: 'Materiales', 
    descripcion: 'Materiales de construcción, ferretería y suministros'
  },
  repuestos: { 
    nombre: 'Repuestos', 
    descripcion: 'Repuestos originales y genéricos para vehículos'
  },
  otros: { 
    nombre: 'Otros', 
    descripcion: 'Otros productos y servicios diversos'
  },
}

import { getSupabaseServerClient } from '@/lib/supabase-server-client'
import { hayAnunciosEnCiudadCategoria } from '@/lib/seo-landings'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ ciudad: string; categoria: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ciudad, categoria, locale } = await params
  const ciudadSEO = getCiudadBySlug(ciudad)
  const cat = CATEGORIAS_SEO[categoria] || { nombre: categoria, descripcion: categoria }
  
  if (!ciudadSEO) {
    const t = await getTranslations({ locale, namespace: 'notFound' })
    return {
      title: t('title'),
      description: t('description'),
    }
  }

  const cityName = ciudadSEO.nombre
  const stateName = ciudadSEO.estado
  
  const title = `${cat.nombre} en ${cityName}, ${stateName} | Clasificados`
  const description = `Compra y vende ${cat.descripcion.toLowerCase()} en ${cityName}, ${stateName}. Anuncios clasificados gratis. Publica sin costo en VendeT.online.`
  
  const keywords = [
    `${cat.nombre.toLowerCase()} ${cityName}`,
    `compra venta ${cat.nombre.toLowerCase()} ${stateName}`,
    `clasificados ${categoria} ${cityName}`,
    `anuncios ${categoria} ${stateName}`,
    `${cityName} ${stateName}`
  ]

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'es_VE',
    },
    alternates: {
      canonical: `https://vendet.online/${ciudad}/${categoria}`,
      languages: {
        'es-VE': `https://vendet.online/${ciudad}/${categoria}`,
        'x-default': `https://vendet.online/${ciudad}/${categoria}`,
      },
    },
    robots: {
      // Combinación sin anuncios = página vacía: noindex hasta que haya
      // inventario (fail-open si la DB falla).
      index: await hayAnunciosEnCiudadCategoria(
        getSupabaseServerClient(),
        ciudadSEO.nombre,
        ciudadSEO.municipio,
        categoria,
      ),
      follow: true,
    },
  }
}

// IMPORTANTE — Ruta DINÁMICA a propósito: ver el comentario en
// src/app/[locale]/[ciudad]/page.tsx. generateStaticParams aquí hacía que
// Next 16 intentara "static generation on demand" al recibir cualquier
// request de /ciudad/categoria, lanzando DYNAMIC_SERVER_USAGE → 500.

export default async function CategoriaPage({ params }: Props) {
  const { ciudad, categoria, locale } = await params
  const ciudadSEO = getCiudadBySlug(ciudad)
  const cat = CATEGORIAS_SEO[categoria] || { nombre: categoria, descripcion: categoria }
  
  if (!ciudadSEO || !CATEGORIAS_SEO[categoria]) {
    // 404 real: ciudad desconocida o slug de categoría arbitrario
    // (antes respondía 200 con contenido thin para cualquier /ciudad/cosa)
    notFound()
  }

  // Breadcrumb items
  const breadcrumbItems = [
    { label: ciudadSEO.nombre, href: `/${ciudad}` },
    { label: cat.nombre, href: undefined }
  ]

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <LandingCategoria 
        ciudadSlug={ciudad} 
        ciudadNombre={ciudadSEO.nombre}
        ciudadMunicipio={ciudadSEO.municipio}
        estado={ciudadSEO.estado}
        categoriaSlug={categoria} 
        categoriaNombre={cat.nombre}
        descripcion={cat.descripcion}
      />
    </>
  )
}
