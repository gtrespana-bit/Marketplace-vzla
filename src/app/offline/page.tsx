import Link from 'next/link'
import { WifiOff, RefreshCw, Home } from 'lucide-react'

export const metadata = {
  title: 'Sin conexión',
  description: 'No tienes conexión a internet',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md text-center">
        {/* Icono */}
        <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-brand-blue/10">
          <WifiOff size={48} className="text-gray-400" />
        </div>

        {/* Texto */}
        <h1 className="text-3xl font-black text-gray-800 mb-3">Sin conexión</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Parece que perdiste la conexión a internet.<br/>
          Revisa tu WiFi o datos móviles e intenta de nuevo.
        </p>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 bg-brand-blue text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-900 transition"
          >
            <RefreshCw size={18} />
            Reintentar
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm"
          >
            <Home size={18} />
            Ir al inicio
          </Link>
        </div>

        {/* Info */}
        <div className="mt-10 bg-white rounded-xl border border-gray-200 p-5 text-left space-y-3">
          <p className="font-bold text-sm text-gray-700">💡 ¿Sabías que?</p>
          <ul className="text-sm text-gray-500 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-brand-blue mt-0.5">•</span>
              Si instalaste VendeT en tu pantalla, puedes ver contenido guardado sin conexión
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-blue mt-0.5">•</span>
              Cuando vuelva la conexión, todo se actualiza automáticamente
            </li>
          </ul>
        </div>

        <p className="mt-8 text-xs text-gray-400">🇻🇪 VendeT-Venezuela — vendet.online</p>
      </div>
    </div>
  )
}
