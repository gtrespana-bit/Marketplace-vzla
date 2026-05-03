"use client"

import Link from 'next/link'
import { Package, X, Pause, Play, Edit, Zap, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function TabProductos({
  productos,
  onBoost,
  onDestacar,
}: {
  productos: any[]
  onBoost: (m: { productId: string; titulo: string }) => void
  onDestacar: (m: { productId: string; titulo: string }) => void
}) {
  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Package size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Aún no tienes publicaciones</h3>
        <p className="text-gray-500 mb-6">Publica tu primer producto en segundos. ¡Es gratis!</p>
        <Link href="/publicar" className="inline-block bg-brand-yellow text-brand-blue px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition">Publicar ahora</Link>
      </div>
    )
  }

  const now = new Date().toISOString()

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-lg mb-4">Mis publicaciones</h3>
      </div>
      <div className="space-y-3">
        {productos.map((p) => {
          const isBoosted = p.boosteado_en != null
          const isFeatured = p.destacado && p.destacado_hasta && p.destacado_hasta > now
          return (
            <div key={p.id} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition">
              <Link href={`/producto/${p.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.titulo} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin foto</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate group-hover:text-brand-blue transition">
                    {isBoosted && '⚡ '}{isFeatured && !isBoosted && '⭐ '}{p.titulo}
                  </h4>
                  <p className="text-sm text-brand-blue font-bold">${p.precio_usd?.toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>👀 {p.visitas || 0} vistas</span>
                    {p.activo ? '✅ Activo' : '⏸️ Pausado'}
                    {isFeatured && (
                      <span className="text-brand-blue">⭐ Hasta {new Date(p.destacado_hasta).toLocaleDateString('es-VE')}</span>
                    )}
                  </div>
                </div>
              </Link>
              <div className="flex gap-1 flex-shrink-0">
                <Link href={`/producto/editar/${p.id}`} className="p-2 hover:bg-blue-50 rounded-lg transition text-brand-blue" title="Editar">
                  <Edit size={16} />
                </Link>
                <button onClick={async () => { const ns = !p.activo; await supabase.from('productos').update({ activo: ns }).eq('id', p.id); window.location.reload() }} className="p-2 hover:bg-gray-100 rounded-lg transition" title={p.activo ? 'Pausar' : 'Activar'}>
                  {p.activo ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button onClick={() => onBoost({ productId: p.id, titulo: p.titulo })} className="p-2 hover:bg-yellow-50 rounded-lg transition text-yellow-600" title="Boost">
                  <Zap size={16} />
                </button>
                <button onClick={() => onDestacar({ productId: p.id, titulo: p.titulo })} className="p-2 hover:bg-yellow-50 rounded-lg transition text-brand-blue" title="Destacar">
                  <Star size={16} />
                </button>
                <button onClick={async () => { if (confirm('¿Eliminar esta publicacion permanentemente?')) { await supabase.from('productos').delete().eq('id', p.id); window.location.reload() } }} className="p-2 hover:bg-red-50 rounded-lg transition text-red-500" title="Eliminar">
                  <X size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
