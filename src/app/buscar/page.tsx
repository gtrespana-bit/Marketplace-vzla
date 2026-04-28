import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'Buscar — Todo Anuncios',
  description: 'Busca productos en el marketplace venezolano',
}

const BuscarClient = dynamic(() => import('./BuscarPage'), { ssr: false })

export default function BuscarPage() {
  return <BuscarClient />
}
