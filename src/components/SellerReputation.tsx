'use client'

interface SellerReputationProps {
  nivel: number           // 0-5
  numResenas: number
  promedioResenas: number
  numPubsActivas: number
  numPubsVendidas: number
  antiguedadDias: number
  ultimaActividad: string | null
  verificado: boolean
  badges: string[]
  size?: 'sm' | 'md' | 'lg'
}

const NIVELES: Record<number, { nombre: string; desc: string; bg: string; text: string; border: string; dot: string }> = {
  0: { nombre: 'Nuevo', desc: 'Recién registrado', bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', dot: 'bg-gray-300' },
  1: { nombre: 'Nuevo', desc: 'Recién registrado', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
  2: { nombre: 'Confiado', desc: 'Actividad verificada', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  3: { nombre: 'Destacado', desc: '10+ ventas positivas', bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  4: { nombre: 'Experto', desc: 'Vendedor experimentado', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500' },
  5: { nombre: 'Leyenda', desc: 'Lo mejor del marketplace', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-600' },
}

const BADGE_CONFIG: Record<string, { label: string; color: string; tooltip: string }> = {
  vendedor_activo: { label: '🟢 Vendedor Activo', color: 'bg-green-100 text-green-800 border-green-200', tooltip: 'Publicó en los últimos 7 días' },
  '10_ventas': { label: '📦 10+ ventas', color: 'bg-blue-100 text-blue-700 border-blue-200', tooltip: 'Más de 10 ventas' },
  '20_ventas': { label: '📦 20+ ventas', color: 'bg-blue-100 text-blue-800 border-blue-200', tooltip: 'Más de 20 ventas' },
  '50_ventas': { label: '🏆 50+ ventas', color: 'bg-purple-100 text-purple-800 border-purple-200', tooltip: 'Más de 50 ventas' },
  '20_publicaciones': { label: '📋 20+ publicaciones', color: 'bg-gray-100 text-gray-700 border-gray-200', tooltip: 'Más de 20 publicaciones' },
  '50_publicaciones': { label: '📋 50+ publicaciones', color: 'bg-gray-100 text-gray-800 border-gray-200', tooltip: 'Más de 50 publicaciones' },
  '100_publicaciones': { label: '⭐ 100+ publicaciones', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', tooltip: 'Más de 100 publicaciones en total' },
  buena_reputacion: { label: '⭐ Buena reputación', color: 'bg-amber-100 text-amber-800 border-amber-200', tooltip: '5+ reseñas con promedio 4.0+' },
  top_vendedor: { label: '👑 Top Vendedor', color: 'bg-yellow-100 text-amber-900 border-amber-300', tooltip: '10+ reseñas con promedio 4.5+' },
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
  const cfg = NIVELES[Math.min(nivel, 5)]
  if (!cfg) return null

  return (
    <div className="space-y-4">
      {/* Nivel principal */}
      <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.border}`}>
        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
        <span className={`text-xs font-bold ${cfg.text}`}>
          Nivel {nivel} — {cfg.nombre}
        </span>
        {!isCompact && (
          <span className={`text-[10px] italic ${cfg.text.replace(/800/g, '500').replace(/700/g, '500').replace(/600/g, '400')}`}>
            · {cfg.desc}
          </span>
        )}
      </div>

      {/* Reseñas (separado del nivel para no confundir) */}
      {numResenas > 0 && (
        <div className="text-xs text-gray-500">
          ⭐ {promedioResenas.toFixed(1)} de 5 · {numResenas} reseña{numResenas !== 1 ? 's' : ''}
        </div>
      )}

      {/* Badges automáticos */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badges.slice(0, isCompact ? 2 : 6).map(badge => {
            const bCfg = BADGE_CONFIG[badge]
            if (!bCfg) return null
            return (
              <span
                key={badge}
                className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${bCfg.color}`}
                title={bCfg.tooltip}
              >
                {bCfg.label}
              </span>
            )
          })}
        </div>
      )}

      {/* Info adicional (solo md/lg) */}
      {!isCompact && (
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div>
            📦 {numPubsActivas} activas, {numPubsVendidas} vendidas
          </div>
          <div>
            {verificado ? '✅ Verificado · ' : ''}{getLastActivityText(ultimaActividad) || `Miembro hace ${Math.floor(antiguedadDias / 30)} meses`}
          </div>
        </div>
      )}
    </div>
  )
}
