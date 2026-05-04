'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TrendingUp, Eye, MessageCircle, BarChart3 } from 'lucide-react'

export default function TabResumen({ userId }: { userId: string }) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    async function loadStats() {
      const uid = userId

      // Total productos activos del usuario
      const { count: activos } = await supabase
        .from('productos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('activo', true)

      // Total visitas de todos sus productos
      const { data: productos } = await supabase
        .from('productos')
        .select('visitas')
        .eq('user_id', uid)
        .eq('activo', true)

      const totalVisitas = productos?.reduce((sum: number, p: any) => sum + (p.visitas || 0), 0) || 0

      // Mensajes no leidos
      const { count: mensajesNoLeidos } = await supabase
        .from('mensajes')
        .select('id', { count: 'exact', head: true })
        .eq('destinatario_id', uid)
        .eq('leido', false)

      // Favoritos (cuantos usuarios guardaron sus productos)
      const { count: favoritos } = await supabase
        .from('favoritos')
        .select('id', { count: 'exact', head: true })
        .in('producto_id',
          (await supabase.from('productos').select('id').eq('user_id', uid).eq('activo', true))
            ?.data?.map((p: any) => p.id) || []
        )

      // Productos vendidos (los marcados como inactivos probablemente vendidos)
      const { count: vendidos } = await supabase
        .from('productos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('activo', false)

      setStats({
        activos: activos || 0,
        totalVisitas,
        mensajesNoLeidos: mensajesNoLeidos || 0,
        favoritos,
        vendidos: vendidos || 0,
      })
    }
    loadStats()
  }, [userId])

  if (!stats) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const tarjetas = [
    { label: 'Publicaciones activas', value: stats.activos, icon: BarChart3, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { label: 'Visitas totales', value: stats.totalVisitas.toLocaleString(), icon: Eye, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { label: 'Mensajes sin leer', value: stats.mensajesNoLeidos, icon: MessageCircle, color: stats.mensajesNoLeidos > 0 ? 'text-red-500' : 'text-gray-400', bg: stats.mensajesNoLeidos > 0 ? 'bg-red-50' : 'bg-gray-50' },
    { label: 'Guardados en favoritos', value: stats.favoritos || 0, icon: TrendingUp, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
  ]

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Tu resumen</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tarjetas.map((t) => {
          const Icon = t.icon
          return (
            <div key={t.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-10 h-10 ${t.bg} rounded-lg flex items-center justify-center mb-2`}>
                <Icon size={20} className={t.color} />
              </div>
              <p className="text-2xl font-black text-gray-900">{t.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.label}</p>
            </div>
          )
        })}
      </div>

      {stats.vendidos > 0 && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-green-600 text-lg">🎉</span>
          <p className="text-sm text-green-700 font-medium">
            <strong>{stats.vendidos}</strong> publicacion{stats.vendidos > 1 ? 'es' : ''} vendida{stats.vendidos > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
