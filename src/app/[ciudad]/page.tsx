import { Metadata } from 'next'
import LandingCiudad from './LandingCiudad'

type Props = {
  params: Promise<{ ciudad: string }>
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ciudad } = await params
  const c = CIUDADES[ciudad.replace(/á/g, 'a')] || { nombre: ciudad }
  const title = `Compra y Venta en ${c.nombre} | VendeT-Venezuela`
  const description = `Anuncios clasificados en ${c.nombre}${c.estado ? `, ${c.estado}` : ''}. Compra y vende carros, tecnología, moda, hogar y más. Publica gratis.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `https://vendet.online/${ciudad}`,
    },
  }
}

export default async function CiudadPage({ params }: Props) {
  const { ciudad } = await params
  const c = CIUDADES[ciudad.replace(/á/g, 'a')] || { nombre: ciudad }
  return <LandingCiudad slug={ciudad} nombre={c.nombre} />
}
