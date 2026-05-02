'use client'

import { ESTADOS, getCiudades } from '@/lib/ubicaciones'

interface UbicacionSelectorProps {
  estado: string
  ciudad: string
  onChange: (estado: string, ciudad: string) => void
}

export default function UbicacionSelector({ estado, ciudad, onChange }: UbicacionSelectorProps) {
  const ciudades = estado ? getCiudades(estado) : []

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        📍 Ubicación
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Estado */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => { onChange(e.target.value, '') }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          >
            <option value="">Toda Venezuela</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ciudad</label>
          <select
            value={ciudad}
            onChange={(e) => { onChange(estado, e.target.value) }}
            disabled={!estado}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">Todas las ciudades</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Limpiar */}
        {(estado || ciudad) && (
          <button
            onClick={() => onChange('', '')}
            className="col-span-1 sm:col-span-2 text-xs text-red-500 hover:text-red-700 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition text-center"
          >
            ✕ Limpiar ubicación
          </button>
        )}
      </div>
    </div>
  )
}
