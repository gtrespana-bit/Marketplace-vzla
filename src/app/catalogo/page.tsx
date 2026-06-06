import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Catálogo — Compra y Venta en Venezuela | VendeT-Venezuela',
  description: 'Explora el catálogo de productos en VendeT-Venezuela. Carros, tecnología, moda, hogar, herramientas y más.',
}

// Carga en cliente + SSR habilitado
const CatalogoClient = dynamic(() => import('./CatalogoPage'), {
  ssr: true,
  loading: () => <CatalogoSkeleton />
})

function CatalogoSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
    </div>
  )
}

// ✅ NUEVO: Fetch server-side de productos iniciales
// Replica exactamente la misma query + ordenamiento que usa el cliente
async function getInitialProducts() {
  try {
    const { data, count, error } = await supabase
      .from('productos')
      .select('*', { count: 'exact' })
      .eq('activo', true)
      .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')
      .order('creado_en', { ascending: false })
      .limit(200)

    if (error || !data) return { products: [], count: 0 }

    // Mismo ordenamiento que el cliente: boost > destacado vigente > fecha
    const now = new Date().toISOString()
    const sorted = data.sort((a: any, b: any) => {
      const aBoost = a.boosteado_en || null
      const bBoost = b.boosteado_en || null
      if (aBoost && !bBoost) return -1
      if (!aBoost && bBoost) return 1
      if (aBoost && bBoost) return bBoost.localeCompare(aBoost)
      const aDest = a.destacado && a.destacado_hasta && a.destacado_hasta > now
      const bDest = b.destacado && b.destacado_hasta && b.destacado_hasta > now
      if (aDest && !bDest) return -1
      if (!aDest && bDest) return 1
      if (aDest && bDest) return b.destacado_hasta.localeCompare(a.destacado_hasta)
      return b.creado_en.localeCompare(a.creado_en)
    })

    return { products: sorted, count: count ?? 0 }
  } catch {
    return { products: [], count: 0 }
  }
}

export default async function CatalogoPage() {
  // Fetch en servidor ANTES de renderizar
  const { products: initialProducts, count: initialCount } = await getInitialProducts()

  return (
    <CatalogoClient
      initialProducts={initialProducts}
      initialCount={initialCount}
    />
  )
}

// ISR: cache catalog for 10 minutes
export const revalidate = 600