import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MessageSquare, CreditCard, Star, Shield, TrendingUp, CheckCircle
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Comprar Créditos — Destaca tus publicaciones | TuCambalo',
  description: 'Compra créditos para que tus publicaciones aparezcan primero. Pago Móvil, transferencia, Zelle y más.',
}

export default function CreditosPage() {
  const paquetes = [
    {
      nombre: 'Básico',
      creditos: 5,
      precio: 3,
      color: 'from-blue-500 to-blue-600',
      popular: false,
    },
    {
      nombre: 'Popular',
      creditos: 15,
      precio: 7,
      color: 'from-brand-yellow to-yellow-500',
      popular: true,
    },
    {
      nombre: 'Pro',
      creditos: 30,
      precio: 12,
      color: 'from-purple-500 to-purple-600',
      popular: false,
    },
    {
      nombre: 'Vendedor',
      creditos: 100,
      precio: 35,
      color: 'from-green-500 to-green-600',
      popular: false,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
          Compra créditos y <span className="text-brand-yellow">destaca</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Publicar siempre es gratis. Los créditos son opcionales para que tus productos aparezcan primero.
        </p>
      </div>

      {/* Paquetes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {paquetes.map((pkg) => (
          <div
            key={pkg.nombre}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition hover:-translate-y-1 ${
              pkg.popular ? 'border-brand-yellow scale-105' : 'border-transparent'
            }`}
          >
            {pkg.popular && (
              <div className="bg-brand-yellow text-brand-blue text-center py-1.5 text-xs font-bold">
                ⭐ MÁS POPULAR
              </div>
            )}
            <div className={`bg-gradient-to-br ${pkg.color} p-6 text-white text-center`}>
              <p className="text-5xl font-black">{pkg.creditos}</p>
              <p className="text-sm opacity-80">créditos</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-3xl font-black text-gray-800 mb-4">${pkg.precio} <span className="text-sm font-normal text-gray-500">USD</span></p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle size={14} className="text-green-500" />
                  {(pkg.creditos * 0.4).toFixed(0)} publicaciones destacadas
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle size={14} className="text-green-500" />
                  7 días de visibilidad
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle size={14} className="text-green-500" />
                  Badge "Destacado"
                </li>
              </ul>
              <button className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">
                Comprar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Qué puedes hacer */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">¿Qué puedes hacer con créditos?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Star size={32} className="text-brand-yellow mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Destacar publicación</h3>
            <p className="text-sm text-gray-500">Tu producto aparece primero en las búsquedas y en el catálogo</p>
            <p className="text-brand-blue font-bold mt-2">1 crédito / semana</p>
          </div>
          <div className="text-center">
            <TrendingUp size={32} className="text-brand-yellow mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Publicación en portada</h3>
            <p className="text-sm text-gray-500">Aparece en la sección de destacados de la página principal</p>
            <p className="text-brand-blue font-bold mt-2">2 créditos / 48 horas</p>
          </div>
          <div className="text-center">
            <Shield size={32} className="text-brand-yellow mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Badge "Vendedor confiable"</h3>
            <p className="text-sm text-gray-500">Muestra un badge especial que genera confianza</p>
            <p className="text-brand-blue font-bold mt-2">5 créditos / mes</p>
          </div>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Métodos de pago aceptados</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { nombre: 'Pago Móvil', emoji: '📱' },
            { nombre: 'Transferencia', emoji: '🏦' },
            { nombre: 'Zelle', emoji: '💵' },
            { nombre: 'Binance Pay (USDT)', emoji: '₿' },
            { nombre: 'PayPal', emoji: '🅿️' },
            { nombre: 'Efectivo USD', emoji: '💲' },
          ].map((m) => (
            <div key={m.nombre} className="bg-gray-50 rounded-xl p-4 text-center">
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
            <li>Envía el comprobante</li>
            <li>Recibirás tus créditos en minutos (horario 8am-10pm VET)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
