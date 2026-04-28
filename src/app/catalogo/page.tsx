import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'Catálogo — Compra y Venta en Venezuela | Todo Anuncios',
  description: 'Explora miles de productos disponibles.',
}

const CatalogoClient = dynamic(() => import('./CatalogoPage'), { ssr: false })

export default function CatalogoPage({
  searchParams,
}: {
  searchParams: any
}) {
  return <CatalogoClient />
}
