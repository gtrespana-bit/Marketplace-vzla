import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'Catálogo — Compra y Venta en Venezuela | VendeT-Venezuela',
  description: 'Explora el catálogo de productos en VendeT-Venezuela. Carros, tecnología, moda, hogar, herramientas y más.',
}

// Carga en cliente + SSR habilitado — ya no hay bailout
const CatalogoClient = dynamic(() => import('./CatalogoPage'), { ssr: true, loading: () => <CatalogoSkeleton /> })

function CatalogoSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-xl overflow-hidden border">
          <div className="aspect-square bg-gray-100" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-7 bg-gray-200 rounded w-2/5" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: any
}) {
  return <CatalogoClient />
}
