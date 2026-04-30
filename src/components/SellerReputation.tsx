'use client'

import { Shield, Star, Clock, ShoppingBag, Award, TrendingUp } from 'lucide-react'

interface SellerReputationProps {
  nivel: number        // 0-5 estrellas
  numResenas: number   // total de reseñas
  promedioResenas: number  // promedio de estrellas
  numPubsActivas: number
  numPubsVendidas: number
  antiguedadDias: number
  ultimaActividad: string | null
  verificado: boolean
  badges: string[]     // array de badges automáticos
  size?: 'sm' | 'md' | 'lg'
}

const BADGE_CONFIG: Record<string, { label: string; icon: string; color: string; tooltip: string }> = {
  vendedor_activo: {
    label: 'Activo',
    icon: '🟢',
    color: 'bg-green-100 text-green-800 border-green-200',
    tooltip: 'Publicó en los últimos 7 días',
  },
  '10_ventas': {
    label: '10+ ventas',
    icon: '📦',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    tooltip: 'Más de 10 publicaciones vendidas',
  },
  '20_ventas': {
    label: '20+ ventas',
    icon: '📦',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    tooltip: 'Más de 20 publicaciones vendidas',
  },
  '50_ventas': {
    label: '50+ ventas',
    icon: '🏆',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    tooltip: 'Más de 50 publicaciones vendidas',
  },
  '20_publicaciones': {
    label: '20+ pubs',
    icon: '📋',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    tooltip: 'Más de 20 publicaciones en total',
  },
  '50_publicaciones': {
    label: '50+ pubs',
    icon: '📋',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    tooltip: 'Más de 50 publicaciones en total',
  },
  '100_publicaciones': {
    label: '100+ pubs',
    icon: '⭐',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    tooltip: 'Más de 100 publicaciones en total',
  },
  buena_reputacion: {
    label: 'Buena reputación',
    icon: '⭐',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    tooltip: '5+ reseñas con 4.0+ estrellas',
  },
  top_vendedor: {
    label: 'Top Vendedor',
    icon: '👑',
    color: 'bg-gradient-to-r from-yellow-100 to-amber-200 text-amber-900 border-amber-300',
    tooltip: '10+ reseñas con 4.5+ estrellas',
  },
}

function StarsMini({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
        />
      ))}
    </span>
  )
}

function getLastActivityText(ultimaActividad: string | null): string {
  if (!ultimaActividad) return ''
  const diff = Math.floor((Date.now() - new Date(ultimaActividad).getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Activo hoy'
  if (diff === 1) return 'Activo ayer'
  if (diff < 7) return `Activo hace ${diff} días`
  if (diff < 30) return `Última vez hace ${Math.floor(diff / 7)} sem.`
  return `Última vez hace ${Math.floor(diff / 30)} meses`
}

export default function SellerReputation({
  nivel, numResenas, promedioResenas, numPubsActivas,
  numPubsVendidas, antiguedadDias, ultimaActividad,
  verificado, badges, size = 'md',
}: SellerReputationProps) {
  const isCompact = size === 'sm'

  const nivelLabels = ['Novato', 'Nuevo', 'Activo', 'Confiado', 'Excelente', 'Premium']
  const nivelColors = [
    'text-gray-400',
    'text-blue-500',
    'text-blue-600',
    'text-emerald-600',
    'text-emerald-700',
    'text-purple-700',
  ]
  const nivelBadges = [
    'bg-gray-50 text-gray-400 border-gray-200',
    'bg-blue-50 text-blue-600 border-blue-200',
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'bg-emerald-50 text-emerald-800 border-emerald-200',
    'bg-purple-50 text-purple-800 border-purple-200',
  ]

  if (nivel === 0 && !verificado && badges.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${isCompact ? '' : ''}`}>
      {/* Nivel de confianza */}
      <div className="flex items-center gap-2">
        {nivel > 0 && (
          <>
            <StarsMini rating={nivel} size={isCompact ? 14 : 16} />
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${nivelBadges[nivel]}`}>
              {nivelLabels[nivel]}
            </span>
          </>
        )}
        {numResenas > 0 && (
          <span className={`text-xs text-gray-500`}>
            {promedioResenas.toFixed(1)} ({numResenas})
          </span>
        )}
      </div>

      {/* Badges automáticos */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badges.map(badge => {
            const cfg = BADGE_CONFIG[badge]
            if (!cfg) return null
            return (
              <span
                key={badge}
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}
                title={cfg.tooltip}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
              </span>
            )
          })}
        </div>
      )}

      {/* Info adicional (solo tamaño md/lg) */}
      {!isCompact && (
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <ShoppingBag size={12} />
            <span>{numPubsActivas} activas, {numPubsVendidas} vendidas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            <span>{getLastActivityText(ultimaActividad) || `Miembro hace ${Math.floor(antiguedadDias / 30)} meses`}</span>
          </div>
        </div>
      )}
    </div>
  )
}
