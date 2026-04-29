import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CreditCard, Star, Shield, TrendingUp, CheckCircle, Zap, Eye, Search
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Comprar Créditos — Destaca tus publicaciones | Todo Anuncios',
  description: 'Compra créditos para que tus publicaciones aparezcan primero. Pago Móvil, transferencia, Zelle, Binance Pay y más.',
}

export default function CreditosPage() {
  const paquetesCredito = [
    {
      creditos: 2,
      precio: 1,
      descripcion: 'Para empezar',
      popular: false,
    },
    {
      creditos: 15,
      precio: 5,
      descripcion: '¡El más elegido! Mejor relación precio/crédito',
      popular: true,
    },
    {
      creditos: 40,
      precio: 10,
      descripcion: 'Para vendedores activos',
      popular: false,
    },
    {
      creditos: 100,
      precio: 20,
      descripcion: 'Máximo ahorro por crédito',
      popular: false,
    },
  ]

  const paquetesDestacados = [
    { creditos: 4, horas: 12, etiqueta: '12 horas' },
    { creditos: 6, horas: 24, etiqueta: '24 horas' },
    { creditos: 10, horas: 48, etiqueta: '48 horas' },
  ]

  const bsRate = 64 // 1 USD ≈ 64 Bs (frecuencia de actualización)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
          Compra créditos y <span className="text-brand-yellow">destaca</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Publicar siempre es <strong>gratis</strong>. Los créditos son opcionales para dar visibilidad a tus publicaciones.
        </p>
      </div>

      {/* ============ ¿QUÉ PUEDES HACER? ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">¿Para qué sirven los créditos?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boost */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-brand-yellow transition">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-yellow-50 text-brand-yellow">
                <Zap size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">⚡ Boost — Subir al #1</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Tu publicación sube de posición y aparece <strong>primera</strong> en la lista. Si alguien más hace boost después, le toca el turno a él. El boost es instantáneo.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-brand-blue font-bold text-2xl">1 crédito</span>
                </div>
              </div>
            </div>
          </div>

          {/* Destacado */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-brand-yellow transition">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-brand-blue">
                <Star size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">⭐ Destacar — 2 en 1</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Tu publicación aparece en la <strong>página principal</strong> como destacado Y con prioridad en los <strong>resultados de búsqueda</strong>.
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-brand-blue font-bold">4 créditos → 12 horas</p>
                  <p className="text-brand-blue font-bold">6 créditos → 24 horas</p>
                  <p className="text-brand-blue font-bold">10 créditos → 48 horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ PAQUETES DE CRÉDITOS ============ */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Elige tu paquete</h2>
        <p className="text-gray-500 text-center mb-8">Cada crédito vale para un boost o contribuye a un destacado</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paquetesCredito.map((pkg) => {
            const porCredito = (pkg.precio / pkg.creditos).toFixed(2)
            const precioBs = (pkg.precio * bsRate).toLocaleString('es-VE')
            return (
              <div
                key={pkg.creditos}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition hover:-translate-y-1 ${
                  pkg.popular ? 'border-brand-yellow' : 'border-transparent'
                }`}
              >
                {pkg.popular && (
                  <div className="bg-brand-yellow text-brand-blue text-center py-1.5 text-xs font-bold">
                    ⭐ MÁS POPULAR
                  </div>
                )}
                <div className="bg-gradient-to-br from-brand-blue to-blue-800 p-6 text-white text-center">
                  <p className="text-5xl font-black">{pkg.creditos}</p>
                  <p className="text-sm opacity-80">créditos</p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-3xl font-black text-gray-800 mb-1">
                    ${pkg.precio} <span className="text-sm font-normal text-gray-500">USD</span>
                  </p>
                  <p className="text-sm text-gray-400 mb-4">≈ Bs. {precioBs}</p>
                  <p className="text-xs text-gray-500 mb-5 bg-gray-50 rounded-lg py-1 px-2 inline-block">
                    ${porCredito} por crédito
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      <strong>{pkg.creditos}</strong> boost(s) al #1
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      o {Math.floor(pkg.creditos / 4)}× destacado 12h aproximadamente
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      Sin expiración
                    </li>
                  </ul>
                  <button className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">
                    Comprar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============ TABLA COMPARATIVA ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">💡 ¿Cuántos créditos necesitas?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700 font-bold">Acción</th>
                <th className="text-center py-3 px-4 text-gray-700 font-bold">Costo</th>
                <th className="text-center py-3 px-4 text-gray-700 font-bold">Resultado</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" /> Boost (subir al #1)
                </td>
                <td className="py-3 px-4 text-center font-bold text-brand-blue">1 crédito</td>
                <td className="py-3 px-4 text-center text-gray-500">Instantáneo, se mueve con el tiempo</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 flex items-center gap-2">
                  <Star size={16} className="text-brand-blue" /> Destacado 12h
                </td>
                <td className="py-3 px-4 text-center font-bold text-brand-blue">4 créditos</td>
                <td className="py-3 px-4 text-center text-gray-500">Home + búsqueda prioritaria</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 flex items-center gap-2">
                  <Star size={16} className="text-brand-blue" /> Destacado 24h
                </td>
                <td className="py-3 px-4 text-center font-bold text-brand-blue">6 créditos</td>
                <td className="py-3 px-4 text-center text-gray-500">Home + búsqueda prioritaria</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2">
                  <Star size={16} className="text-brand-blue" /> Destacado 48h
                </td>
                <td className="py-3 px-4 text-center font-bold text-brand-blue">10 créditos</td>
                <td className="py-3 px-4 text-center text-gray-500">Home + búsqueda prioritaria</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ MÉTODOS DE PAGO ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Métodos de pago aceptados</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { nombre: 'Pago Móvil', emoji: '📱' },
            { nombre: 'Transferencia', emoji: '🏦' },
            { nombre: 'Zelle', emoji: '💵' },
            { nombre: 'Binance Pay', emoji: '🟡' },
            { nombre: 'PayPal', emoji: '🅿️' },
          ].map((m) => (
            <div key={m.nombre} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition">
              <span className="text-3xl block mb-2">{m.emoji}</span>
              <p className="text-sm font-medium text-gray-800">{m.nombre}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
          <h3 className="font-bold text-brand-blue text-sm mb-2">ℹ️ Cómo funciona el pago</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Selecciona tu paquete de créditos</li>
            <li>Realiza el pago por tu método preferido</li>
            <li>Adjunta el comprobante de pago</li>
            <li>Recibirás tus créditos al confirmar (horario 8am-10pm VET)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
