import { Metadata } from 'next'
import LandingCategoria from './LandingCategoria'

type Props = {
  params: Promise<{ ciudad: string; categoria: string }>
}

const CIUDADES: Record<string, { nombre: string; estado?: string }> = {
  caracas: { nombre: 'Caracas' },
  maracaibo: { nombre: 'Maracaibo' },
  valencia: { nombre: 'Valencia' },
  barquisimeto: { nombre: 'Barquisimeto' },
  maracay: { nombre: 'Maracay' },
  'ciudad-guayana': { nombre: 'Ciudad Guayana' },
  cumaná: { nombre: 'Cumaná' },
  cumana: { nombre: 'Cumaná' },
  merida: { nombre: 'Mérida' },
  'san-cristobal': { nombre: 'San Cristóbal' },
  petare: { nombre: 'Petare' },
}

const CATEGORIAS: Record<string, { nombre: string }> = {
  vehiculos: { nombre: 'Vehículos' },
  tecnologia: { nombre: 'Tecnología' },
  moda: { nombre: 'Moda' },
  hogar: { nombre: 'Hogar' },
  herramientas: { nombre: 'Herramientas' },
  materiales: { nombre: 'Materiales' },
  repuestos: { nombre: 'Repuestos' },
  otros: { nombre: 'Otros' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ciudad, categoria } = await params
  const c = CIUDADES[ciudad.replace(/á/g, 'a')] || { nombre: ciudad }
  const cat = CATEGORIAS[categoria] || { nombre: categoria }
  const title = `${cat.nombre} en ${c.nombre} — Compra y Venta | VendeT-Venezuela`
  const description = `Compra y vende ${cat.nombre.toLowerCase()} en ${c.nombre}. Anuncios clasificados gratis en ${c.nombre}. Publica sin costo.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `https://vendet.online/${ciudad}/${categoria}` },
  }
}

export default async function CategoriaPage({ params }: Props) {
  const { ciudad, categoria } = await params
  const c = CIUDADES[ciudad.replace(/á/g, 'a')] || { nombre: ciudad }
  const cat = CATEGORIAS[categoria] || { nombre: categoria }
  return <LandingCategoria ciudadSlug={ciudad} ciudadNombre={c.nombre} categoriaSlug={categoria} categoriaNombre={cat.nombre} />
}
